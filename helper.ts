import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

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