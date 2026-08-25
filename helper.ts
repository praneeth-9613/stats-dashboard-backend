import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ScrapePhase, ScrapeStatus } from "./types/Common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDataDirectory(teamId: number): string {
    return path.join(__dirname, "data", String(teamId));
}

export async function readJsonFile<T>(teamId: number, fileName: string): Promise<T> {
    const filePath = path.join(getDataDirectory(teamId), fileName);

    const data = await fs.readFile(filePath, "utf-8");

    return JSON.parse(data) as T;
}

export function startPhase(
    status: ScrapeStatus,
    phase: ScrapePhase,
    total: number,
    message: string
) {
    status.phase = phase;
    status.current = 0;
    status.total = total;
    status.percent = 0;
    status.message = message;
}

export function updateProgress(
    status: ScrapeStatus,
    current: number,
    message?: string
) {
    status.current = current;

    let total = status?.total || 0;

    status.percent =
        total > 0
            ? Math.round((current / total) * 100)
            : 0;

    if (message) {
        status.message = message;
    }
}

export function completePhase(
    status: ScrapeStatus,
    phase: ScrapePhase
) {
    status.current = status.total;
    status.percent = 100;

    if (status.completed) {
        status.completed[phase] = true;
    }
}