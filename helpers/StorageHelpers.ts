import path from "path";
import { getDataDirectory, loadJson } from "./DirectoryHelpers";
import { TeamColors } from "../application/types/TeamData";

export function loadTeamColors(season: string, leagueId: number): Record<string, TeamColors> {
    const TEAM_COLORS_FILE = path.join(getDataDirectory("seedData", { season, leagueId }), "team-colors.json");

    const teamColors =
        loadJson<Record<string, TeamColors>>(
            TEAM_COLORS_FILE,
            {}
        );

    return teamColors;
}