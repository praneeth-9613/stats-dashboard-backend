import { PlayerMapper } from "../application/mappers/PlayerMapper";
import { SyncContext } from "../application/types/Common";
import { fetchPlayer } from "../helpers/ApiHelpers";
import { TeamStatus } from "../persistence/entities/PlayerTeam";
import { PlayerEntityMapper } from "../persistence/mappers/PlayerEntityMapper";
import { PlayerRepository } from "../persistence/repositories/PlayerRepository";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";
import { ReserveTeamRepository } from "../persistence/repositories/ReserveTeamRepository";
import { MatchProcessingService } from "../service/MatchProcessingService";
import { SyncPhase } from "./SyncPhase";

export class NonSquadPlayersPhase extends SyncPhase<"check_players"> {

    private phaseTotal = 0;

    protected readonly steps = [
        "check_players",
    ] as const;

    constructor(
        context: SyncContext,
        private readonly playerMapper: PlayerMapper,
        private readonly playerEntityMapper: PlayerEntityMapper,
        private readonly playerRepository: PlayerRepository,
        private readonly playerTeamRepository: PlayerTeamRepository,
        private readonly reserveTeamRepository: ReserveTeamRepository,
        private readonly matchProcessingService: MatchProcessingService
    ) {
        super(context);
    }

    async run(): Promise<void> {

        const { leagueSeasonTeamIdentifier } = this.context;

        const matchPlayerStatsByMatchId = await
            this.matchProcessingService.findMatchPlayerStatsForLeagueSeasonTeam(
                leagueSeasonTeamIdentifier
            );

        const matchesPlayerStats = Object.values(matchPlayerStatsByMatchId);

        const playerIds = new Set<number>();

        for (const match of matchesPlayerStats) {
            for (const player of Object.values(match.data ?? {})) {
                const existing =
                    await this.playerTeamRepository.findByPlayerForLeagueSeasonTeam(
                        leagueSeasonTeamIdentifier,
                        player.playerId,
                    );

                if (!existing) {
                    playerIds.add(player.playerId)
                }
            }
        }

        this.phaseTotal = playerIds.size;

        await this.execute(
            "non_squad_players",
            this.phaseTotal,
            this.phaseTotal > 0
                ? "Processing non squad players"
                : "No new non squad players to process",
            () =>
                this.work(playerIds)
        );

    }

    private async work(playerIds: Set<number>) {
        const { scrapeStatus } = this.context;

        await this.executeStep(
            "check_players",
            playerIds.size,
            playerIds.size > 0
                ? `Processing ${playerIds.size} non-squad players`
                : "No new non-squad players to process",
            async () => {
                let playerIndex = 0;
                for (const playerId of playerIds) {
                    await this.processPlayer(playerId);
                    this.updateStep(scrapeStatus, "check_players", ++playerIndex, `Checking player entry ${playerIndex} of ${playerIds.size}`)
                }
            });
    }

    private findNewTeamStatus(
        latestPlayerTeamId: number | null,
        reserveTeamIds: number[]
    ): TeamStatus {
        const { leagueSeasonTeamIdentifier } = this.context;

        if (latestPlayerTeamId === null) {
            return TeamStatus.NOT_IN_SQUAD;
        }

        if (reserveTeamIds.includes(latestPlayerTeamId)) {
            return TeamStatus.RESERVE;
        }

        return latestPlayerTeamId === leagueSeasonTeamIdentifier.teamId
            ? TeamStatus.CURRENT
            : TeamStatus.TRANSFERRED_OUT;
    }

    private async processPlayer(
        playerId: number,
    ): Promise<void> {
        const {
            leagueSeasonTeamIdentifier,
        } = this.context;

        const latestPlayer = await fetchPlayer(playerId);
        const latestPlayerData = this.playerMapper.toPlayerData(latestPlayer);

        await this.playerRepository.save(this.playerEntityMapper.toPlayerEntity(latestPlayerData.profile, latestPlayerData.positions, latestPlayerData.injury));

        const latestPlayerTeam = latestPlayerData.team;
        const latestPlayerTeamId = latestPlayerTeam === null ? null : latestPlayerTeam.teamId;

        const reserveTeams = await this.reserveTeamRepository.findByParentTeamId(leagueSeasonTeamIdentifier?.teamId ?? 0);

        const newTeamStatus = this.findNewTeamStatus(
            latestPlayerTeamId ?? null,
            reserveTeams.map(reserveTeam => reserveTeam.teamId)
        );

        const transferredTo =
            newTeamStatus === TeamStatus.TRANSFERRED_OUT
                ? latestPlayerTeam?.teamName ?? null
                : null;

        await this.playerTeamRepository.save(this.playerEntityMapper.toPlayerTeamEntity(playerId, { teamId: leagueSeasonTeamIdentifier.teamId ?? 0, teamName: this.context.teamName, contractEnd: null, isCaptain: false, onLoan: latestPlayerTeam?.onLoan ?? false, shirt: (newTeamStatus === TeamStatus.TRANSFERRED_OUT || newTeamStatus === TeamStatus.NOT_IN_SQUAD) ? null : latestPlayerTeam?.shirt, transferredTo }, leagueSeasonTeamIdentifier, newTeamStatus));
    }
}