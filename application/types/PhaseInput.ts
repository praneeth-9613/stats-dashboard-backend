import { SquadPhaseOutput } from "./PhaseOutput";

export interface SquadPhaseInput {
    season: string;
    leagueId: number;
    teamId: number;
}

export interface PlayerPhaseInput extends SquadPhaseOutput {
    season: string;
    teamId: number;
}