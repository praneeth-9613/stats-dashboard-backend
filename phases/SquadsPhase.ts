import { TeamResponse } from "../api/types/RawTeam";
import { SquadMapper } from "../application/mappers/SquadMapper";
import { SquadPhaseInput } from "../application/types/PhaseInput";
import { SquadPhaseOutput } from "../application/types/PhaseOutput";
import { fetchSquad } from "../helpers/ApiHelpers";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "../application/types/Common";
import { injectable } from "tsyringe";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";

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
        const { syncType } = this.context;

        // DB Data
        const storedSquad = await this.playerTeamRepository.findByLeagueSeasonTeam(squadPhaseInput.leagueSeasonTeamIdentifier);

        const storedPlayerIds = new Set(
            storedSquad.map(playerTeam => playerTeam.playerId)
        );

        if (syncType === "refresh") {
            return { playersToInsert: [], playersToCheck: [...storedPlayerIds], playersToRemove: [] }
        }

        // API Data
        const latestSquad = await fetchSquad(this.teamResponse);

        const squadWithoutCoach = latestSquad?.filter(member => member.title.toLowerCase() !== "coach").flatMap(elt => elt.members) ?? [];

        const squadData = this.squadMapper.toSquadData(squadWithoutCoach);

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

        const playersToInsert = playersAdded.map(player => player.playerId);
        const playersToCheck = squadData
            .filter(player => storedPlayerIds.has(player.playerId))
            .map(player => player.playerId);
        const playersToRemove = playersRemoved.map(playerTeam => playerTeam.playerId);

        this.phaseTotal = playersToInsert.length + playersToRemove.length;

        await this.execute(
            "squad",
            this.phaseTotal,
            this.phaseTotal > 0
                ? `Discovering ${this.phaseTotal} players in squad`
                : "No players in squad",
            () =>
                this.work(
                    playersToInsert,
                    playersToRemove,
                ),
        );

        // Outputs
        return { playersToInsert, playersToCheck, playersToRemove }
    }

    private async work(
        playersToInsert: number[],
        playersToRemove: number[],
    ): Promise<void> {
        await this.executeStep("discover_players_to_add", playersToInsert.length, playersToInsert.length > 0 ?
            `Found ${playersToInsert.length} players to add to squad` : `No players to add`, async () => { });

        await this.executeStep("discover_players_to_remove", playersToRemove.length, playersToRemove.length > 0 ?
            `Found ${playersToRemove.length} players to remove from squad` : `No players to remove`, async () => { });
    }
}