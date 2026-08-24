import path from "path";
import { PlayersDatabase } from "../types/StoredPlayer";
import { MatchesDatabase } from "../types/StoredStats";
import { getDataDirectory, loadJson } from "./DirectoryHelpers";

export function loadMatches(teamName: string): MatchesDatabase {
    const MATCHES_FILE = path.join(getDataDirectory(teamName), "matches.json");

    const matches =
        loadJson<MatchesDatabase>(
            MATCHES_FILE,
            {}
        );

    return matches;
}

export async function loadPlayers(teamName: string): Promise<PlayersDatabase> {
    const PLAYERS_FILE = path.join(getDataDirectory(teamName), "players.json");

    const players =
        loadJson<PlayersDatabase>(
            PLAYERS_FILE,
            {}
        );

    return players;
}