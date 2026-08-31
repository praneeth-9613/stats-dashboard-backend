import "reflect-metadata";
import express from "express";
import { main } from "./main";
import { ScraperOptions, ScrapeStatus } from "./types/Common";
import { readJsonFile } from "./helper";
import { AppDataSource } from "./persistence/data-source";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

await AppDataSource.initialize();

console.log("Database connected");

await AppDataSource.destroy();

function parseIds(value: unknown): number[] {
    if (typeof value !== "string" || !value.trim()) {
        return [];
    }

    return value
        .split(",")
        .map((id) => Number(id.trim()))
        .filter(
            (id) =>
                Number.isInteger(id) &&
                id > 0
        );
}

const scrapeStatuses: Record<number, ScrapeStatus> = {};

/**
 * Start scraper
 *
 * Normal:
 * POST /api/scrape
 *
 * Full refresh:
 * POST /api/scrape?refresh=true
 *
 * Specific players:
 * POST /api/scrape?refresh=true&playerIds=123,456
 *
 * Specific matches:
 * POST /api/scrape?refresh=true&matchIds=5898653,5898654
 *
 * Both:
 * POST /api/scrape?refresh=true&playerIds=123,456&matchIds=5898653,5898654
 */
app.post("/api/scrape/:teamId/:teamName", (req: any, res: any) => {

    const teamId = Number(req.params.teamId);
    const teamName = req.params.teamName;

    // Prevent multiple scraper processes
    if (scrapeStatuses[teamId]?.running) {
        res.status(409).json({
            started: false,
            message: "Scraper is already running",
        });

        return;
    }
    const refresh = (req?.query?.refresh === "true")

    const leagueId = req?.query?.leagueId || 47;
    const season = req?.query?.season || "2026-2027";

    const scope = req?.query?.scope || "all"

    const playerIds = parseIds(
        req.query.playerIds
    );

    const matchIds = parseIds(
        req.query.matchIds
    );

    scrapeStatuses[teamId] = {
        running: true,
        completed: {
            players: false,
            fixtures: false,
            season_stats: false,
            academy_players: false
        }
    };


    const options: ScraperOptions = {
        refresh,
        scope,
        playerIds,
        matchIds,
        teamId,
        teamName,
        scrapeStatuses,
        leagueId,
        season,
    };

    console.log("Starting scraper:");
    console.log(options);

    /*
     * Run scraper in background.
     *
     * We intentionally don't await this so the
     * API responds immediately.
     */
    main(options)
        .then(() => {
            scrapeStatuses[teamId] = {
                running: false
            };

            console.log(
                "Scraper completed successfully"
            );
        })
        .catch((error: unknown) => {
            console.error(
                "Scraper failed:",
                error
            );

            scrapeStatuses[teamId] = {
                running: false,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            };
        });

    res.json({
        started: true,
        refresh,
        playerIds,
        matchIds,
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

app.get("/api/team/:teamId/matches", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);

        const matches = await readJsonFile(teamId, "matches.json");

        res.json(matches);
    } catch (error) {
        console.error("Failed to read matches:", error);

        res.status(200).json([]);
    }
});

app.get("/api/team/:teamId/players", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);

        const players = await readJsonFile(teamId, "players.json");

        res.json(players);
    } catch (error) {
        console.error("Failed to read players:", error);

        res.status(200).json([]);
    }
});

app.get("/api/team/:teamId/season-stats", async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);

        const seasonStats = await readJsonFile(teamId,
            "season-stats.json"
        );

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