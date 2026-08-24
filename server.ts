import express from "express";
import { main } from "./main";
import { ScraperOptions, ScrapeStatus } from "./types/Common";
import { readJsonFile } from "./helper";
import { TEAMS } from "./constants";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

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

const scrapeStatus: Record<number, ScrapeStatus> = {};

/**
 * Start scraper
 *
 * Normal:
 * POST /api/scrape
 *
 * Full resync:
 * POST /api/scrape?resync=true
 *
 * Specific players:
 * POST /api/scrape?resync=true&playerIds=123,456
 *
 * Specific matches:
 * POST /api/scrape?resync=true&matchIds=5898653,5898654
 *
 * Both:
 * POST /api/scrape?resync=true&playerIds=123,456&matchIds=5898653,5898654
 */
app.post("/api/scrape/:teamId/:teamName", (req: any, res: any) => {

    const teamId = Number(req.params.teamId);
    const teamName = req.params.teamName;

    // Prevent multiple scraper processes
    if (scrapeStatus[teamId].running) {
        res.status(409).json({
            started: false,
            message: "Scraper is already running",
        });

        return;
    }
    const resync = req.query.resync ?? false;

    const playerIds = parseIds(
        req.query.playerIds
    );

    const matchIds = parseIds(
        req.query.matchIds
    );

    const options: ScraperOptions = {
        resync,
        playerIds,
        matchIds,
        teamId,
        teamName
    };

    scrapeStatus[teamId] = {
        running: true,
        success: null,
        error: null,
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
            scrapeStatus[teamId] = {
                running: false,
                success: true,
                error: null,
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

            scrapeStatus[teamId] = {
                running: false,
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            };
        });

    res.json({
        started: true,
        resync,
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
    "/api/scrape/status/:teamId",
    (req: any, res: any) => {

        const teamId = Number(req.params.teamId);
        res.json(scrapeStatus[teamId]);
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