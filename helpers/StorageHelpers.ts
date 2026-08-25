import path from "path";
import { PlayersDatabase } from "../types/StoredPlayer";
import { MatchesDatabase } from "../types/StoredStats";
import { getDataDirectory, loadJson } from "./DirectoryHelpers";

export function loadMatches(teamId: number): MatchesDatabase {
    const MATCHES_FILE = path.join(getDataDirectory(teamId), "matches.json");

    const matches =
        loadJson<MatchesDatabase>(
            MATCHES_FILE,
            {}
        );

    return matches;
}

export async function loadPlayers(teamId: number): Promise<PlayersDatabase> {
    const PLAYERS_FILE = path.join(getDataDirectory(teamId), "players.json");

    const players =
        loadJson<PlayersDatabase>(
            PLAYERS_FILE,
            {}
        );

    return players;
}