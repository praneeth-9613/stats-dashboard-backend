import path from "path";
import { getDataDirectory, loadJson } from "./DirectoryHelpers";
import { MatchesGoalscorers, MatchesPlayerStats } from "../persistence/json/Matches";
import { SeasonStats } from "../persistence/json/SeasonStats";
import { LeagueSeasonTeamIdentifier } from "../application/types/PhaseInput";
import { TeamColors } from "../application/types/TeamData";

export function loadMatchesPlayerStats(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): MatchesPlayerStats {
    const MATCHES_PLAYER_STATS_FILE = path.join(getDataDirectory("data", leagueSeasonTeamIdentifier), "matches-player-stats.json");

    const matches =
        loadJson<MatchesPlayerStats>(
            MATCHES_PLAYER_STATS_FILE,
            {}
        );

    return matches;
}

export function loadMatchesGoalScorers(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): MatchesGoalscorers {
    const MATCHES_PLAYER_STATS_FILE = path.join(getDataDirectory("data", leagueSeasonTeamIdentifier), "matches-goalscorers.json");

    const matches =
        loadJson<MatchesPlayerStats>(
            MATCHES_PLAYER_STATS_FILE,
            {}
        );

    return matches;
}

export function loadTeamSeasonStats(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): SeasonStats | undefined {
    const TEAM_SEASON_STATS_FILE = path.join(getDataDirectory("data", leagueSeasonTeamIdentifier), "season-stats.json");

    const seasonStats =
        loadJson<SeasonStats | undefined>(
            TEAM_SEASON_STATS_FILE,
            undefined
        );

    return seasonStats;
}

export function loadTeamColors(season: string, leagueId: number): Record<string, TeamColors> {
    const TEAM_COLORS_FILE = path.join(getDataDirectory("seedData", { season, leagueId }), "team-colors.json");

    const teamColors =
        loadJson<Record<string, TeamColors>>(
            TEAM_COLORS_FILE,
            {}
        );

    return teamColors;
}