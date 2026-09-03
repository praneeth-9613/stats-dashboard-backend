import path from "path";
import { getDataDirectory, loadJson } from "./DirectoryHelpers";
import { MatchesGoalscorers, MatchesPlayerStats } from "../persistence/json/Matches";
import { SeasonStats } from "../persistence/json/SeasonStats";

export function loadMatchesPlayerStats(season: string, leagueId: number, teamId: number): MatchesPlayerStats {
    const MATCHES_PLAYER_STATS_FILE = path.join(getDataDirectory(season, leagueId, teamId), "matches-player-stats.json");

    const matches =
        loadJson<MatchesPlayerStats>(
            MATCHES_PLAYER_STATS_FILE,
            {}
        );

    return matches;
}

export function loadMatchesGoalScorers(season: string, leagueId: number, teamId: number): MatchesGoalscorers {
    const MATCHES_PLAYER_STATS_FILE = path.join(getDataDirectory(season, leagueId, teamId), "matches-goalscorers.json");

    const matches =
        loadJson<MatchesPlayerStats>(
            MATCHES_PLAYER_STATS_FILE,
            {}
        );

    return matches;
}

export function loadTeamSeasonStats(season: string, leagueId: number, teamId: number): SeasonStats | undefined {
    const TEAM_SEASON_STATS_FILE = path.join(getDataDirectory(season, leagueId, teamId), "season-stats.json");

    const seasonStats =
        loadJson<SeasonStats | undefined>(
            TEAM_SEASON_STATS_FILE,
            undefined
        );

    return seasonStats;
}