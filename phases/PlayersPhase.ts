import { SyncPhase } from "./SyncPhase";
import { PlayerPhaseInput } from "../application/types/PhaseInput";
import { fetchPlayer } from "../helpers/ApiHelpers";
import { SyncContext } from "../application/types/Common";
import { PlayerMapper } from "../application/mappers/PlayerMapper";
import { PlayerRepository } from "../persistence/repositories/PlayerRepository";
import { PlayerEntityMapper } from "../persistence/mappers/PlayerEntityMapper";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";
import { PlayerTeam, TeamStatus } from "../persistence/entities/PlayerTeam";
import { PlayerTeamComparator } from "../comparators/PlayerTeamComparator";
import { PlayerTeamAuditRepository } from "../persistence/repositories/PlayerTeamAuditRepository";
import { PlayerTeamAudit } from "../persistence/entities/PlayerTeamAudit";
import { PlayerComparator } from "../comparators/PlayerComparator";
import { PlayerAudit } from "../persistence/entities/PlayerAudit";
import { PlayerAuditRepository } from "../persistence/repositories/PlayerAuditRepository";
import { PlayerData, PlayerTeamData } from "../application/types/PlayerData";
import { Player } from "../persistence/entities/Player";
import { injectable } from "tsyringe";

@injectable()
export class PlayersPhase extends SyncPhase<"add_players" | "check_players" | "remove_players"> {

    private phaseTotal = 0;

    protected readonly steps = [
        "add_players",
        "check_players",
        "remove_players",
    ] as const;

    constructor(protected context: SyncContext, private readonly playerPhaseInput: PlayerPhaseInput, private readonly playerMapper: PlayerMapper, private readonly playerEntityMapper: PlayerEntityMapper, private readonly playerRepository: PlayerRepository, private readonly playerTeamRepository: PlayerTeamRepository, private readonly playerAuditRepository: PlayerAuditRepository, private readonly playerTeamAuditRepository: PlayerTeamAuditRepository, private readonly playerComparator: PlayerComparator, private readonly playerTeamComparator: PlayerTeamComparator) {
        super(context);

        const {
            playersToInsert,
            playersToCheck,
            playersToRemove
        } = this.playerPhaseInput;
        this.phaseTotal = [...playersToInsert, ...playersToCheck, ...playersToRemove].length;
    }

    async run(): Promise<void> {
        console.log(`Players to process: ${this.phaseTotal}`);

        await this.execute(
            "players",
            this.phaseTotal,
            this.phaseTotal > 0
                ? "Processing players"
                : "No new players to process",
            () =>
                this.work()
        );
    }

    private async work() {
        const { scrapeStatus } = this.context;
        const { playersToInsert, playersToCheck, playersToRemove } = this.playerPhaseInput;

        await this.executeStep(
            "add_players",
            playersToInsert.length,
            playersToInsert.length > 0
                ? `Adding ${playersToInsert.length} players`
                : "No new players to add",
            async () => {
                let playerIndex = 0;
                for (const playerId of playersToInsert) {
                    await this.processPlayer(playerId, "insert");
                    this.updateStep(scrapeStatus, "add_players", ++playerIndex, `Adding player entry ${playerIndex} of ${playersToInsert.length} to team`)
                }
            });

        await this.executeStep(
            "check_players",
            playersToCheck.length,
            playersToCheck.length > 0
                ? `Checking ${playersToCheck.length} players for updates`
                : "No new players to check for updates",
            async () => {
                let playerIndex = 0;
                for (const playerId of playersToCheck) {
                    await this.processPlayer(playerId, "check");
                    this.updateStep(scrapeStatus, "check_players", ++playerIndex, `Checking updates to player entry ${playerIndex} of ${playersToInsert.length}`)

                }
            });

        await this.executeStep(
            "remove_players",
            playersToRemove.length,
            playersToRemove.length > 0
                ? `Removing ${playersToRemove.length} player entries`
                : "No new players to remove",
            async () => {
                let playerIndex = 0;
                for (const playerId of playersToRemove) {
                    await this.processPlayer(playerId, "remove");
                    this.updateStep(scrapeStatus, "remove_players", ++playerIndex, `Removing player entry ${playerIndex} of ${playersToInsert.length} from team`)
                }
            });
    }

    private async processPlayer(playerId: number, type: "insert" | "check" | "remove") {
        // API Data
        const latestPlayer = await fetchPlayer(playerId);
        const latestPlayerData = this.playerMapper.toPlayerData(latestPlayer);

        // DB Data
        const storedPlayer =
            await this.playerRepository.findByPlayerId(playerId);

        if (type === "insert" || type === "check") {

            await this.processPlayerProfile(
                playerId,
                latestPlayerData,
                storedPlayer,
            );

            if (type === "insert") {
                const storedPlayerTeam =
                    await this.playerTeamRepository.findByPlayerAndTeamForSeason(
                        this.playerPhaseInput,
                        playerId,
                    );

                await this.processPlayerTeam(
                    playerId,
                    latestPlayerData.team,
                    storedPlayerTeam,
                );
            }
        } else {
            await this.processPlayerRemoval(playerId, latestPlayerData.team)
        }
    }

    private async processPlayerRemoval(playerId: number, latestPlayerTeam: PlayerTeamData | null) {
        const storedPlayerTeam =
            await this.playerTeamRepository.findByPlayerAndTeamForSeason(
                this.playerPhaseInput,
                playerId,
            );

        if (storedPlayerTeam === null) {
            return;
        }

        await this.processPlayerTeam(playerId, latestPlayerTeam, storedPlayerTeam)
    }

    private async processPlayerProfile(
        playerId: number,
        latestPlayerData: PlayerData,
        storedPlayer: Player | null,
    ) {
        if (storedPlayer === null) {
            const player = this.playerEntityMapper.toPlayerEntity(
                latestPlayerData.profile,
                latestPlayerData.positions.list,
                latestPlayerData.injury,
            );

            await this.playerRepository.save(player);

            return;
        }

        const changedFields =
            this.playerComparator.getChangedFields(
                latestPlayerData,
                storedPlayer,
            );

        if (changedFields.length === 0) {
            return;
        }

        const audits: PlayerAudit[] = [];

        for (const { field, oldValue, newValue } of changedFields) {
            storedPlayer[field] = newValue as never;

            audits.push(
                this.playerEntityMapper.toPlayerAuditEntity(
                    playerId,
                    field,
                    oldValue,
                    newValue,
                ),
            );
        }

        await this.playerRepository.save(storedPlayer);
        await this.playerAuditRepository.saveAll(audits);
    }

    private async processPlayerTeam(
        playerId: number,
        latestPlayerTeam: PlayerTeamData | null,
        storedPlayerTeam: PlayerTeam | null,
    ) {
        if (storedPlayerTeam === null) {
            await this.createPlayerTeam(playerId, latestPlayerTeam);
            return;
        }

        if (latestPlayerTeam === null) {
            await this.markPlayerAsFreeAgent(storedPlayerTeam);
            return;
        }

        if (latestPlayerTeam.teamId !== storedPlayerTeam.teamId) {
            await this.handleTeamChange(
                playerId,
                latestPlayerTeam,
                storedPlayerTeam,
            );
            return;
        }
    }

    private async createPlayerTeam(
        playerId: number,
        latestPlayerTeam: PlayerTeamData | null,
    ) {
        if (latestPlayerTeam === null) {
            return;
        }

        const entity =
            this.playerEntityMapper.toPlayerTeamEntity(
                playerId,
                latestPlayerTeam,
            );

        await this.playerTeamRepository.save(entity);
    }

    private async markPlayerAsFreeAgent(
        storedPlayerTeam: PlayerTeam,
    ) {
        const oldTeamStatus = storedPlayerTeam.teamStatus;

        storedPlayerTeam.teamStatus = TeamStatus.FREE_AGENT;

        const audit =
            this.playerEntityMapper.toPlayerTeamAuditEntity(
                this.playerPhaseInput,
                storedPlayerTeam.playerId,
                "teamStatus",
                oldTeamStatus,
                TeamStatus.FREE_AGENT,
            );

        await this.playerTeamRepository.save(storedPlayerTeam);
        await this.playerTeamAuditRepository.save(audit);
    }

    private async handleTeamChange(
        playerId: number,
        latestPlayerTeam: PlayerTeamData,
        storedPlayerTeam: PlayerTeam,
    ) {
        const changedFields =
            this.playerTeamComparator.getChangedFields(
                latestPlayerTeam,
                storedPlayerTeam,
            );

        const audits: PlayerTeamAudit[] = [];

        for (const { field, oldValue, newValue } of changedFields) {
            storedPlayerTeam[field] = newValue as never;

            audits.push(
                this.playerEntityMapper.toPlayerTeamAuditEntity(
                    this.playerPhaseInput,
                    playerId,
                    field,
                    oldValue,
                    newValue,
                ),
            );
        }

        const oldTeamStatus = storedPlayerTeam.teamStatus;

        storedPlayerTeam.teamStatus = TeamStatus.TRANSFERRED_OUT;

        audits.push(
            this.playerEntityMapper.toPlayerTeamAuditEntity(
                this.playerPhaseInput,
                playerId,
                "teamStatus",
                oldTeamStatus,
                TeamStatus.TRANSFERRED_OUT,
            ),
        );

        await this.playerTeamRepository.save(storedPlayerTeam);

        if (audits.length > 0) {
            await this.playerTeamAuditRepository.saveAll(audits);
        }

        const latestPlayerTeamEntity =
            this.playerEntityMapper.toPlayerTeamEntity(
                playerId,
                latestPlayerTeam,
            );

        await this.playerTeamRepository.save(latestPlayerTeamEntity);
    }

}

