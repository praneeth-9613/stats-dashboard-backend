import "reflect-metadata";
import express from "express";
import { newScrapeStatus, RefreshScope, ScraperOptions, ScrapeStatus, SyncType } from "./application/types/Common";
import { AppDataSource } from "./persistence/data-source";
import { FixtureRepository } from "./persistence/repositories/FixtureRepository";
import { loadMatchesGoalScorers, loadMatchesPlayerStats, loadTeamSeasonStats } from "./helpers/StorageHelpers";
import { PlayerService } from "./service/PlayerService";
import { inject, injectable } from "tsyringe";
import { LeagueSeasonTeamIdentifier } from "./application/types/PhaseInput";
import { SyncOrchestrator } from "./SyncOrchestrator";
import { FixtureResponseDto } from "./application/types/FixtureResponseDto";

@injectable()
export class ApiServer {
    private readonly app = express();
    private readonly port = Number(process.env.PORT) || 3000;

    private readonly scrapeStatuses: Record<number, ScrapeStatus> = {};

    constructor(
        @inject(SyncOrchestrator)
        private readonly syncOrchestrator: SyncOrchestrator,

        @inject(FixtureRepository)
        private readonly fixtureRepository: FixtureRepository,

        @inject(PlayerService)
        private readonly playerService: PlayerService,
    ) { }

    async start(): Promise<void> {
        await AppDataSource.initialize();

        console.log("Database connected");

        this.app.use(express.json());

        this.registerRoutes();

        this.app.listen(this.port, () => {
            console.log(
                `API server running on http://localhost:${this.port}`,
            );
        });

        this.registerShutdown();
    }

    private registerShutdown(): void {
        process.on("SIGTERM", async () => {
            await AppDataSource.destroy();
            process.exit(0);
        });
    }

    private isSyncType(value: unknown): value is SyncType {
        return value === "sync" || value === "refresh";
    }

    private isRefreshScope(value: unknown): value is RefreshScope {
        return value === "players" || value === "fixtures";
    }

    private validateRequest(req: any, res: any): ScraperOptions | null {
        const teamId = Number(req.params.teamId);
        const teamName = req.params.teamName;

        const season = String(req.query.season);
        const leagueId = Number(req.query.leagueId);
        const syncType = String(req.query.syncType);

        if (!leagueId || !season) {
            res.status(400).json({
                started: false,
                message: "leagueId and season are required",
            });

            return null;
        }

        if (!this.isSyncType(syncType)) {
            res.status(400).json({
                started: false,
                message: "syncType must be 'sync' or 'refresh'",
            });

            return null;
        }

        const scopeParam = req.query.scope;

        if (syncType === "sync" && !scopeParam) {
            res.status(400).json({
                started: false,
                message: "scope must be provided only for 'refresh'",
            });

            return null;
        }

        let scope: RefreshScope | undefined;

        if (syncType === "refresh") {
            if (!this.isRefreshScope(scopeParam)) {
                res.status(400).json({
                    started: false,
                    message: "scope must be 'players' or 'fixtures'",
                });

                return null;
            }

            scope = scopeParam;
        }

        if (this.scrapeStatuses[teamId]?.running) {
            res.status(409).json({
                started: false,
                message: "Scraper is already running",
            });

            return null;
        }

        return {
            season,
            leagueId,
            teamId,
            teamName,
            syncType,
            scope,
            scrapeStatuses: this.scrapeStatuses,
        };
    }

    private registerRoutes(): void {
        this.registerScrapeRoutes();
        this.registerFixtureRoutes();
        this.registerPlayerRoutes();
        this.registerMatchRoutes();
        this.registerSeasonStatsRoutes();
    }

    private registerFixtureRoutes(): void {
        this.app.get(
            "/api/team/:teamId/fixtures",
            async (req, res) => {
                try {
                    const leagueSeasonTeam: LeagueSeasonTeamIdentifier = {
                        season: String(req.query.season),
                        leagueId: Number(req.query.leagueId),
                        teamId: Number(req.params.teamId),
                    };

                    const fixtures =
                        await this.fixtureRepository.findByLeagueSeasonTeam(leagueSeasonTeam);

                    const matchesGoalScorers = loadMatchesGoalScorers(leagueSeasonTeam);

                    const fixturesResponse: Record<number, FixtureResponseDto> = {};

                    for (const fixture of fixtures) {
                        const fixtureResponse: FixtureResponseDto = { ...fixture }

                        if (fixture.matchId in matchesGoalScorers) {
                            fixtureResponse.goalscorers = (matchesGoalScorers[fixture.matchId].goalscorers ?? null);
                            fixtureResponse.playerOfTheMatch = (matchesGoalScorers[fixture.matchId].playerOfTheMatch ?? null);
                        }

                        fixturesResponse[fixture.matchId] = fixtureResponse;
                    }

                    res.json(fixturesResponse);
                } catch (error) {
                    console.error("Failed to read fixtures:", error);

                    res.status(500).json({
                        message: "Failed to read fixtures",
                    });
                }
            },
        );
    }

    private registerPlayerRoutes(): void {
        this.app.get(
            "/api/team/:teamId/players",
            async (req, res) => {
                try {
                    const leagueSeasonTeam: LeagueSeasonTeamIdentifier = {
                        season: String(req.query.season),
                        leagueId: Number(req.query.leagueId),
                        teamId: Number(req.params.teamId),
                    };

                    const players =
                        await this.playerService.findPlayersForTeamSeason(
                            leagueSeasonTeam
                        );

                    res.json(players);
                } catch (error) {
                    console.error("Failed to read players:", error);

                    res.status(200).json([]);
                }
            },
        );
    }

    private registerScrapeRoutes(): void {
        this.app.post("/api/scrape/:teamId/:teamName", (req: any, res: any) => {

            const scraperOptions = this.validateRequest(req, res);

            if (scraperOptions === null) return;

            const { season, leagueId, teamId, teamName, syncType, scope } = scraperOptions;

            this.scrapeStatuses[teamId] = newScrapeStatus();

            console.log("Starting scraper:");
            console.log(scraperOptions);

            this.syncOrchestrator.run(scraperOptions)
                .then(() => {
                    this.scrapeStatuses[teamId].running = false;

                    console.log(
                        "Scraper completed successfully",
                    );
                })
                .catch((error: unknown) => {
                    console.error(
                        "Scraper failed:",
                        error,
                    );

                    this.scrapeStatuses[teamId] = {
                        ...this.scrapeStatuses[teamId],
                        running: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    };
                });

            res.json({
                started: true,
                season,
                leagueId,
                teamId,
                teamName,
                syncType,
                scope
            });
        });

        this.app.get(
            "/api/scrape/:teamId/status",
            (req: any, res: any) => {

                const teamId = Number(req.params.teamId);
                res.json(this.scrapeStatuses[teamId]);
            }
        );
    }

    private registerMatchRoutes(): void {

        this.app.get("/api/team/:teamId/matches/player-stats", async (req, res) => {
            try {
                const leagueSeasonTeam: LeagueSeasonTeamIdentifier = {
                    season: String(req.query.season),
                    leagueId: Number(req.query.leagueId),
                    teamId: Number(req.params.teamId),
                };

                const matchesPlayerStats = loadMatchesPlayerStats(leagueSeasonTeam);

                res.json(matchesPlayerStats);
            } catch (error) {
                console.error("Failed to read matches:", error);

                res.status(200).json([]);
            }
        });

        this.app.get("/api/team/:teamId/matches/goalscorers", async (req, res) => {
            try {
                const leagueSeasonTeam: LeagueSeasonTeamIdentifier = {
                    season: String(req.query.season),
                    leagueId: Number(req.query.leagueId),
                    teamId: Number(req.params.teamId),
                };
                const matchesGoalScorers = loadMatchesGoalScorers(leagueSeasonTeam);

                res.json(matchesGoalScorers);
            } catch (error) {
                console.error("Failed to read matches:", error);

                res.status(200).json([]);
            }
        });
    }

    private registerSeasonStatsRoutes(): void {

        this.app.get("/api/team/:teamId/season-stats", async (req, res) => {
            try {
                const season = String(req.query.season);
                const leagueId = Number(req.query.leagueId);
                const teamId = Number(req.params.teamId);

                const seasonStats = loadTeamSeasonStats({ season, leagueId, teamId });

                res.json(seasonStats);
            } catch (error) {
                console.error("Failed to read season stats:", error);

                res.status(200).json([]);
            }
        });

    }
}