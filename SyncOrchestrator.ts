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
import { Logger } from "./Logger";

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
            scrapeStatuses,
        } = options;

        console.log(
            `Starting Sync for ${teamName} : ${teamId}`,
        );

        ensureDataDirectory(
            season,
            leagueId,
            teamId,
        );

        const teamInfo = await fetchTeam(teamId);

        const scrapeStatus = scrapeStatuses[teamId];

        const leagueSeasonTeamIdentifier = { season, leagueId, teamId };

        const logger = new Logger({
            teamId,
            season,
            leagueId,
        });

        const context: SyncContext = {
            leagueSeasonTeamIdentifier,
            teamName,
            scrapeStatus,
            logger
        };

        await this.runPhases(context, teamInfo);
    }

    private async runPhases(
        context: SyncContext,
        teamInfo: TeamResponse,
    ): Promise<void> {

        const { leagueSeasonTeamIdentifier } = context;

        const squadPhase = this.squadPhaseFactory.create(context, teamInfo);

        const squadPhaseInput: SquadPhaseInput = {
            leagueSeasonTeamIdentifier
        }

        const squadPhaseOutput = await squadPhase.run(squadPhaseInput);

        const playerPhaseInput: PlayerPhaseInput = { ...squadPhaseOutput, leagueSeasonTeamIdentifier }

        const playersPhase =
            this.playersPhaseFactory.create(
                context,
                playerPhaseInput,
            );

        await playersPhase.run();

        const fixturesPhase = this.fixturesPhaseFactory.create(context, teamInfo);

        const fixturesPhaseOutput = await fixturesPhase.run();

        const matchProcessingPhase = this.matchProcessingPhaseFactory.create(context, fixturesPhaseOutput);

        await matchProcessingPhase.run();

        const seasonStatsPhase = this.seasonStatsPhaseFactory.create(context);

        await seasonStatsPhase.run();
    }

}