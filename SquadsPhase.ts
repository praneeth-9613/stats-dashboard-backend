import { TeamResponse } from "./api/types/RawTeam";
import { SquadMapper } from "./application/mappers/SquadMapper";
import { SquadPhaseInput } from "./application/types/PhaseInput";
import { SquadPhaseOutput } from "./application/types/PhaseOutput";
import { SquadData } from "./application/types/SquadData";
import { updateProgress } from "./helper";
import { fetchSquad } from "./helpers/ApiHelpers";
import { Squad } from "./persistence/entities/Squad";
import { SquadAuditAction } from "./persistence/entities/SquadAudit";
import { SquadEntityMapper } from "./persistence/mappers/SquadEntityMapper";
import { SquadAuditRepository } from "./persistence/repositories/SquadAuditRepository";
import { SquadRepository } from "./persistence/repositories/SquadRepository";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "./types/Common";

export class SquadsPhase extends SyncPhase {

    private phaseTotal = 0;

    constructor(protected context: SyncContext, private readonly teamResponse: TeamResponse, private readonly squadMapper: SquadMapper, private readonly squadEntityMapper: SquadEntityMapper, private readonly squadRepository: SquadRepository, private readonly squadAuditRepository: SquadAuditRepository) { super(context); }

    async run(
        squadPhaseInput: SquadPhaseInput
    ): Promise<SquadPhaseOutput> {
        const {
        } = this.context;
        const {
            teamId,
        } = squadPhaseInput;

        // API Data
        const latestSquad = await fetchSquad(this.teamResponse);

        const squadWithoutCoach = latestSquad?.filter(member => member.title.toLowerCase() !== "coach").flatMap(elt => elt.members) ?? [];

        const squadData = this.squadMapper.toSquadData(squadWithoutCoach);

        // DB Data
        const storedSquad = await this.squadRepository.findByTeamForLeagueSeason(squadPhaseInput);

        // Discover additions/removals
        const latestPlayerIds = new Set(
            squadData.map(player => player.playerId)
        );
        const storedPlayerIds = new Set(
            storedSquad.map(player => player.playerId)
        );

        const playersAdded = squadData.filter(
            player => !storedPlayerIds.has(player.playerId)
        );

        const playersRemoved = storedSquad.filter(
            player => !latestPlayerIds.has(player.playerId)
        );

        const playersToInsert = playersAdded.map(player => player.playerId);
        const playersToCheck = Object.values(latestPlayerIds).filter(latest => Object.values(storedPlayerIds).includes(latest));
        const playersToRemove = playersRemoved.map(player => player.playerId);

        this.phaseTotal = [...playersToInsert, ...playersToRemove].length;

        await this.execute(
            "squad",
            this.phaseTotal,
            this.phaseTotal > 0
                ? "Processing squad"
                : "No players in squad",
            () =>
                this.work(
                    squadPhaseInput,
                    playersAdded,
                    playersRemoved,
                ),
        );

        // Outputs
        return { playersToInsert, playersToCheck, playersToRemove }
    }


    private async work(
        squadPhaseInput: SquadPhaseInput,
        playersAdded: SquadData[],
        playersRemoved: Squad[],
    ): Promise<void> {
        const { scrapeStatus } = this.context;

        if (playersAdded.length > 0) {
            await this.addPlayers(
                squadPhaseInput,
                playersAdded,
            );
        }

        if (playersRemoved.length > 0) {
            await this.removePlayers(
                playersRemoved,
            );
        }

        updateProgress(
            scrapeStatus,
            this.phaseTotal,
            `Processed squad (${this.phaseTotal} players)`,
        );
    }

    private async addPlayers(
        squadPhaseInput: SquadPhaseInput,
        playersAdded: SquadData[],
    ): Promise<void> {
        const entities = playersAdded.map(player =>
            this.squadEntityMapper.toEntity(
                player.playerId,
                squadPhaseInput.teamId,
                squadPhaseInput.leagueId,
                squadPhaseInput.season,
            ),
        );

        const audits = entities.map(entity =>
            this.squadEntityMapper.toSquadAuditEntityFromSquad(
                entity,
                SquadAuditAction.NEW,
            ),
        );

        await this.squadRepository.saveAll(entities);
        await this.squadAuditRepository.saveAll(audits);
    }

    private async removePlayers(
        playersRemoved: Squad[],
    ): Promise<void> {
        const entities = playersRemoved;

        const audits = playersRemoved.map(player =>
            this.squadEntityMapper.toSquadAuditEntity(
                player.playerId,
                player.teamId,
                player.leagueId,
                player.season,
                SquadAuditAction.REMOVED,
            ),
        );

        await this.squadRepository.removeAll(entities);
        await this.squadAuditRepository.saveAll(audits);
    }
}