import path from "path";
import { getDataDirectory, loadJson } from "./DirectoryHelpers";
import { MatchesGoalscorers, MatchesPlayerStats } from "../persistence/json/Matches";
import { SeasonStats } from "../persistence/json/SeasonStats";
import { LeagueSeasonTeamIdentifier } from "../application/types/PhaseInput";

export function loadMatchesPlayerStats(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): MatchesPlayerStats {
    const MATCHES_PLAYER_STATS_FILE = path.join(getDataDirectory(leagueSeasonTeamIdentifier), "matches-player-stats.json");

    const matches =
        loadJson<MatchesPlayerStats>(
            MATCHES_PLAYER_STATS_FILE,
            {}
        );

    return matches;
}

export function loadMatchesGoalScorers(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): MatchesGoalscorers {
    const MATCHES_PLAYER_STATS_FILE = path.join(getDataDirectory(leagueSeasonTeamIdentifier), "matches-goalscorers.json");

    const matches =
        loadJson<MatchesPlayerStats>(
            MATCHES_PLAYER_STATS_FILE,
            {}
        );

    return matches;
}

export function loadTeamSeasonStats(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): SeasonStats | undefined {
    const TEAM_SEASON_STATS_FILE = path.join(getDataDirectory(leagueSeasonTeamIdentifier), "season-stats.json");

    const seasonStats =
        loadJson<SeasonStats | undefined>(
            TEAM_SEASON_STATS_FILE,
            undefined
        );

    return seasonStats;
}