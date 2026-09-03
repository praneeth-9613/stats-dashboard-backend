import { inject, injectable } from "tsyringe";
import { TeamResponse } from "./api/types/RawTeam";
import { ScraperOptions, SyncContext } from "./application/types/Common";
import { fetchTeam } from "./helpers/ApiHelpers";
import { ensureDataDirectory } from "./helpers/DirectoryHelpers";
import { PlayersPhaseFactory } from "./factories/PlayersPhaseFactory";
import { PlayerPhaseInput, SquadPhaseInput } from "./application/types/PhaseInput";
import { SquadPhaseFactory } from "./factories/SquadPhaseFactory";
import { FixturesPhaseFactory } from "./factories/FixturesPhaseFactory";
import { MatchProcessingPhaseFactory } from "./factories/MatchProcessingPhaseFactory";
import { SeasonStatsPhaseFactory } from "./factories/SeasonStatsPhaseFactory";
import { FixturesPhaseOutput } from "./application/types/PhaseOutput";

@injectable()
export class SyncOrchestrator {
    constructor(
        @inject(SquadPhaseFactory)
        private readonly squadPhaseFactory: SquadPhaseFactory,

        @inject(PlayersPhaseFactory)
        private readonly playersPhaseFactory: PlayersPhaseFactory,

        @inject(FixturesPhaseFactory)
        private readonly fixturesPhaseFactory: FixturesPhaseFactory,

        @inject(MatchProcessingPhaseFactory)
        private readonly matchProcessingPhaseFactory: MatchProcessingPhaseFactory,

        @inject(SeasonStatsPhaseFactory)
        private readonly seasonStatsPhaseFactory: SeasonStatsPhaseFactory
    ) { }

    async run(options: ScraperOptions): Promise<void> {
        const {
            teamId,
            teamName,
            season,
            leagueId,
            syncType,
            scope,
            scrapeStatuses,
        } = options;

        console.log(
            `Starting Processing for ${teamName} : ${teamId}`,
        );

        console.log(
            syncType === "sync"
                ? "SYNC"
                : `REFRESH ${scope}`,
        );

        ensureDataDirectory(
            season,
            leagueId,
            teamId,
        );

        const teamInfo = await fetchTeam(teamId);

        const scrapeStatus = scrapeStatuses[teamId];

        const context: SyncContext = {
            teamId,
            teamName,
            season,
            leagueId,
            syncType,
            scope,
            scrapeStatus,
        };

        await this.runPhases(context, teamInfo);
    }

    private async runPhases(
        context: SyncContext,
        teamInfo: TeamResponse,
    ): Promise<void> {
        const { syncType, scope } = context;

        if (syncType === "refresh") {
            if (scope === "players") {
                await this.runPlayersPhase(context, teamInfo);
                return;
            }

            if (scope === "fixtures") {
                await this.runFixturesPhase(context, teamInfo);
                return;
            }
        }

        await this.runPlayersPhase(context, teamInfo);

        const matchProcessingPhaseInput = await this.runFixturesPhase(context, teamInfo);

        const matchProcessingPhase = this.matchProcessingPhaseFactory.create(context, matchProcessingPhaseInput);

        await matchProcessingPhase.run();

        const seasonStatsPhase = this.seasonStatsPhaseFactory.create(context);

        await seasonStatsPhase.run();
    }

    private async runPlayersPhase(
        context: SyncContext,
        teamInfo: TeamResponse
    ): Promise<void> {
        const { season, leagueId, teamId } = context;

        const squadPhase = this.squadPhaseFactory.create(context, teamInfo);

        const squadPhaseInput: SquadPhaseInput = {
            season,
            leagueId,
            teamId,
        }

        const squadPhaseOutput = await squadPhase.run(squadPhaseInput);

        const playerPhaseInput: PlayerPhaseInput = { ...squadPhaseOutput, season, teamId }

        const playersPhase =
            this.playersPhaseFactory.create(
                context,
                playerPhaseInput,
            );

        await playersPhase.run();
    }

    private async runFixturesPhase(
        context: SyncContext,
        teamInfo: TeamResponse
    ): Promise<FixturesPhaseOutput> {

        const fixturesPhase = this.fixturesPhaseFactory.create(context, teamInfo);

        const fixturesPhaseOutput = await fixturesPhase.run();

        return fixturesPhaseOutput;
    }

}