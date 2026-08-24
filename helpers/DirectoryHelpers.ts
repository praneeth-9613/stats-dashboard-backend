import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDataDirectory(teamId: number): string {
    return path.join(__dirname, "..", "data", `${teamId}`);
}

export function ensureDataDirectory(teamId: number): void {

    const DATA_DIR = path.join(__dirname, "..", "data", `${teamId}`);

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }
}

export function loadJson<T>(
    file: string,
    fallback: T
): T {

    if (!fs.existsSync(file)) {
        return fallback;
    }

    return JSON.parse(
        fs.readFileSync(file, "utf8")
    ) as T;
}

export function saveJson<T>(
    file: string,
    data: T
): void {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

export async function fetchJson<T>(
    url: string
): Promise<T> {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status} ${response.statusText}\n${url}`
        );
    }

    return response.json() as Promise<T>;
}