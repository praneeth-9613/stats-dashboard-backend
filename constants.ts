export const OUTFIELD_STAT_CONFIG: Record<string, string[]> = {
    top_stats: [
        "rating_title",
        "minutes_played",
        "goals",
        "assists",
        "total_shots",
        "ShotsOnTarget",
        "ShotsOffTarget",
        "blocked_shots",
        "shot_accuracy",
        "accurate_passes",
        "chances_created",
        "big_chance_created_team_title",
        "defensive_actions",
        "fantasy_points"
    ],

    attack: [
        "touches",
        "touches_opp_box",
        "dribbles_succeeded",
        "passes_into_final_third",
        "long_balls_accurate",
        "dispossessed",
        "corners",
        "line_breaking_passes",
        "accurate_crosses",
        "big_chance_missed_title"
    ],

    defense: [
        "defensive_actions",
        "matchstats.headers.tackles",
        "last_man_tackle",
        "shot_blocks",
        "clearances",
        "headed_clearance",
        "interceptions",
        "recoveries",
        "dribbled_past",
    ],

    duels: [
        "ground_duels_won",
        "aerials_won",
        "was_fouled",
        "fouls",
        "duel_won",
        "duel_lost",
    ],
};

export const GOALKEEPER_STAT_CONFIG: Record<string, string[]> = {

    top_stats: [
        "rating_title",
        "minutes_played",

        "saves",
        "goals_conceded",

        "accurate_passes",
        "long_balls_accurate",

        "keeper_diving_save",
        "saves_inside_box",
        "keeper_sweeper",
        "punches",
        "player_throws",
        "keeper_high_claim",

        "recoveries",
        "clearances",
        "touches",
        "defensive_actions",
        "was_fouled",
        "fouls",
        "matchstats.headers.tackles",
        "passes_into_final_third",
        "interceptions",

        "fantasy_points"
    ]
};

export const FOTMOB_MATCH_API_URL = "https://www.fotmob.com/api/data/matchDetails?matchId="

export const FOTMOB_PLAYER_API_URL =
    "https://www.fotmob.com/api/data/playerData?id=";

export const TEAMS: Record<number, string> = {
    9825: "Arsenal"
}

export const LEAGUES: Record<number, string> = {
    47: "Premier League"
}