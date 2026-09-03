import { FixturesPhaseOutput, SquadPhaseOutput } from "./PhaseOutput";

export type LeagueSeasonTeamIdentifier = {
    season: string;
    leagueId: number;
    teamId?: number;
}

export interface SquadPhaseInput {
    leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier
}

export interface PlayerPhaseInput extends SquadPhaseOutput {
    leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier
}

export interface MatchProcessingPhaseInput extends FixturesPhaseOutput { }