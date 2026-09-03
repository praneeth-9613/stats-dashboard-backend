import "reflect-metadata";
import express from "express";
import { main } from "./main";
import { newScrapeStatus, RefreshScope, ScraperOptions, ScrapeStatus, SyncType } from "./application/types/Common";
import { AppDataSource } from "./persistence/data-source";
import { FixtureRepository } from "./persistence/repositories/FixtureRepository";
import { Fixture } from "./persistence/entities/Fixture";
import { loadMatchesGoalScorers, loadMatchesPlayerStats, loadTeamSeasonStats } from "./helpers/StorageHelpers";
import { PlayerService } from "./service/PlayerService";
import { PlayerTeamRepository } from "./persistence/repositories/PlayerTeamRepository";
import { PlayerTeam } from "./persistence/entities/PlayerTeam";
import { PlayerRepository } from "./persistence/repositories/PlayerRepository";
import { Player } from "./persistence/entities/Player";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

await AppDataSource.initialize();

console.log("Database connected");

await AppDataSource.destroy();

const fixtureRepository = new FixtureRepository(
    AppDataSource.getRepository(Fixture),
);

const playerTeamRepository = new PlayerTeamRepository(AppDataSource.getRepository(PlayerTeam));

const playerRepository = new PlayerRepository(AppDataSource.getRepository(Player));

const playerService = new PlayerService(playerTeamRepository, playerRepository);

const scrapeStatuses: Record<number, ScrapeStatus> = {};

function isSyncType(value: unknown): value is SyncType {
    return value === "sync" || value === "refresh";
}

function isRefreshScope(value: unknown): value is RefreshScope {
    return value === "players" || value === "fixtures";
}

function validateRequest(req: any, res: any): ScraperOptions | null {
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

    if (!isSyncType(syncType)) {
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
        if (!isRefreshScope(scopeParam)) {
            res.status(400).json({
                started: false,
                message: "scope must be 'players' or 'fixtures'",
            });

            return null;
        }

        scope = scopeParam;
    }

    if (scrapeStatuses[teamId]?.running) {
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
        scrapeStatuses,
    };
}

app.post("/api/scrape/:teamId/:teamName", (req: any, res: any) => {

    const scraperOptions = validateRequest(req, res);

    if (scraperOptions === null) return;

    const { season, leagueId, teamId, teamName, syncType, scope } = scraperOptions;

    scrapeStatuses[teamId] = newScrapeStatus();

    console.log("Starting scraper:");
    console.log(scraperOptions);

    main(scraperOptions)
        .then(() => {
            scrapeStatuses[teamId].running = false;

            console.log(
                "Scraper completed successfully",
            );
        })
        .catch((error: unknown) => {
            console.error(
                "Scraper failed:",
                error,
            );

            scrapeStatuses[teamId] = {
                ...scrapeStatuses[teamId],
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

/**
 * Get scraper status
 *
 * GET /api/scrape/status
 */
app.get(
    "/api/scrape/:teamId/status",
    (req: any, res: any) => {

        const teamId = Number(req.params.teamId);
        res.json(scrapeStatuses[teamId]);
    }
);

app.get("/api/team/:teamId/fixtures", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);
        const season = String(req.query.season);

        const matches =
            await fixtureRepository.findByTeamForSeason(
                season,
                teamId,
            );

        res.json(matches);
    } catch (error) {
        console.error("Failed to read matches:", error);

        res.status(500).json({
            message: "Failed to read matches",
        });
    }
});

app.get("/api/team/:teamId/matches/player-stats", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);
        const season = String(req.query.season);
        const leagueId = Number(req.query.leagueId);

        const matchesPlayerStats = loadMatchesPlayerStats(season, leagueId, teamId);

        res.json(matchesPlayerStats);
    } catch (error) {
        console.error("Failed to read matches:", error);

        res.status(200).json([]);
    }
});

app.get("/api/team/:teamId/matches/goalscorers", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);
        const season = String(req.query.season);
        const leagueId = Number(req.query.leagueId);

        const matchesGoalScorers = loadMatchesGoalScorers(season, leagueId, teamId);

        res.json(matchesGoalScorers);
    } catch (error) {
        console.error("Failed to read matches:", error);

        res.status(200).json([]);
    }
});

app.get("/api/team/:teamId/players", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);
        const season = String(req.query.season);

        const players = await playerService.findPlayersForTeamSeason(teamId, season)

        res.json(players);
    } catch (error) {
        console.error("Failed to read players:", error);

        res.status(200).json([]);
    }
});

app.get("/api/team/:teamId/season-stats", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);
        const season = String(req.query.season);
        const leagueId = Number(req.query.leagueId);

        const seasonStats = loadTeamSeasonStats(season, leagueId, teamId);

        res.json(seasonStats);
    } catch (error) {
        console.error("Failed to read season stats:", error);

        res.status(200).json([]);
    }
});


app.listen(PORT, () => {
    console.log(
        `API server running on http://localhost:${PORT}`
    );
});

process.on("SIGTERM", async () => {
    await AppDataSource.destroy();
    process.exit(0);
});