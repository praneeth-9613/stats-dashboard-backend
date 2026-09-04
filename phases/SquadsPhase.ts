import { TeamResponse } from "../api/types/RawTeam";
import { SquadMapper } from "../application/mappers/SquadMapper";
import { SquadPhaseInput } from "../application/types/PhaseInput";
import { SquadPhaseOutput } from "../application/types/PhaseOutput";
import { fetchSquad } from "../helpers/ApiHelpers";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "../application/types/Common";
import { injectable } from "tsyringe";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";
import { PlayerTeam, TeamStatus } from "../persistence/entities/PlayerTeam";
import { SquadData } from "../application/types/SquadData";

@injectable()
export class SquadsPhase extends SyncPhase<"discover_players_to_add" | "discover_players_to_remove"> {

    private phaseTotal = 0;
    protected readonly steps = [
        "discover_players_to_add",
        "discover_players_to_remove"
    ] as const;

    constructor(protected context: SyncContext, private readonly teamResponse: TeamResponse, private readonly squadMapper: SquadMapper, private readonly playerTeamRepository: PlayerTeamRepository) {
        super(context);
    }

    async run(
        squadPhaseInput: SquadPhaseInput
    ): Promise<SquadPhaseOutput> {
        
        // API Data
        const latestSquad = await fetchSquad(this.teamResponse);

        const squadWithoutCoach = latestSquad?.filter(member => member.title.toLowerCase() !== "coach").flatMap(elt => elt.members) ?? [];

        const squadData = this.squadMapper.toSquadData(squadWithoutCoach);

        // DB Data
        const storedSquad = await this.playerTeamRepository.findByLeagueSeasonTeam(squadPhaseInput.leagueSeasonTeamIdentifier);

        const storedPlayerIds = new Set(
            storedSquad.map(playerTeam => playerTeam.playerId)
        );

        // Discover additions/removals
        const latestPlayerIds = new Set(
            squadData.map(player => player.playerId)
        );

        const playersAdded = squadData.filter(
            player => !storedPlayerIds.has(player.playerId)
        );

        const playersRemoved = storedSquad.filter(
            playerTeam => !latestPlayerIds.has(playerTeam.playerId)
        );

        const playersToAdd = squadData
            .filter(player => {
                const playerTeam = this.getPlayerTeam(
                    player.playerId,
                    storedSquad,
                );

                return !playerTeam || !this.isPlayerTeamCurrent(playerTeam);
            })
            .map(player => player.playerId);

        const playersToCheck = storedSquad
            .filter(playerTeam => {
                const inSquad = this.isPlayerInSquad(
                    playerTeam.playerId,
                    squadData,
                );

                const isCurrent = this.isPlayerTeamCurrent(playerTeam);

                return (
                    (inSquad && isCurrent) ||
                    (!inSquad && !isCurrent)
                );
            })
            .map(playerTeam => playerTeam.playerId);

        const playersToRemove = storedSquad
            .filter(playerTeam => {
                const inSquad = this.isPlayerInSquad(
                    playerTeam.playerId,
                    squadData,
                );

                return (
                    !inSquad &&
                    this.isPlayerTeamCurrent(playerTeam)
                );
            })
            .map(playerTeam => playerTeam.playerId);

        this.phaseTotal = playersToAdd.length + playersToRemove.length;

        await this.execute(
            "squad",
            this.phaseTotal,
            this.phaseTotal > 0
                ? `Discovering ${this.phaseTotal} players in squad`
                : "No players in squad",
            () =>
                this.work(
                    playersToAdd,
                    playersToRemove,
                ),
        );

        // Outputs
        return { playersToAdd, playersToCheck, playersToRemove }
    }

    private async work(
        playersToAdd: number[],
        playersToRemove: number[],
    ): Promise<void> {
        await this.executeStep("discover_players_to_add", playersToAdd.length, playersToAdd.length > 0 ?
            `Found ${playersToAdd.length} players to add to squad` : `No players to add`, async () => { });

        await this.executeStep("discover_players_to_remove", playersToRemove.length, playersToRemove.length > 0 ?
            `Found ${playersToRemove.length} players to remove from squad` : `No players to remove`, async () => { });
    }

    private isPlayerInSquad(
        playerId: number,
        squadData: SquadData[],
    ): boolean {
        return squadData.some(
            player => player.playerId === playerId,
        );
    }

    private getPlayerTeam(
        playerId: number,
        storedSquad: PlayerTeam[],
    ): PlayerTeam | undefined {
        return storedSquad.find(
            playerTeam => playerTeam.playerId === playerId,
        );
    }

    private isPlayerTeamCurrent(
        playerTeam: PlayerTeam | undefined,
    ): boolean {
        return playerTeam?.teamStatus === TeamStatus.CURRENT;
    }
}