import { MatchPlayerResponse, MatchResponse } from "../../api/types/RawMatch"
import { PlayerOfTheMatchResponse } from "../../api/types/RawMatchFacts";
import { GoalEventResponse, MatchHeaderEventsResponse } from "../../api/types/RawMatchHeader";
import { GoalEvent, MatchGoalscorers, MatchHeaderEvents, MatchPlayer, MatchPlayerStats } from "../../persistence/json/Matches"
import { LeagueSeasonTeamIdentifier } from "../types/PhaseInput";

export class MatchMapper {

    toMatchPlayerStats(matchResponse: MatchResponse, matchId: number, teamName: string, leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): MatchPlayerStats {

        const playerStats = Object.values(matchResponse.content?.playerStats ?? {});

        const match: MatchPlayerStats = {
            matchId,
            leagueSeasonTeamIdentifier,
        }

        for (const player of playerStats) {
            const matchPlayer = this.toMatchPlayer(player)

            if (matchPlayer.teamName !== teamName) continue;

            match.playerStats = {
                ...match.playerStats,
                [matchPlayer.playerId]: matchPlayer
            }
        }

        return match;

    }

    toMatchPlayer(matchPlayerResponse: MatchPlayerResponse): MatchPlayer {
        return {
            playerId: matchPlayerResponse.id,
            name: matchPlayerResponse.name,
            teamName: matchPlayerResponse.teamName,
            isGoalkeeper: matchPlayerResponse.isGoalkeeper,
            stats: matchPlayerResponse.stats,
            shirtNumber: matchPlayerResponse.shirtNumber
        }
    }

    toMatchGoalscorers(matchResponse: MatchResponse, matchId: number, leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): MatchGoalscorers {
        return {
            matchId,
            leagueSeasonTeamIdentifier,
            goalscorers: matchResponse.header?.events
                ? this.toMatchHeaderEvents(matchResponse.header?.events)
                : undefined,
            playerOfTheMatch: this.toPlayerOfMatch(matchResponse.content?.matchFacts?.playerOfTheMatch ?? null)
        };
    }

    toPlayerOfMatch(playerOfTheMatchResponse: PlayerOfTheMatchResponse | null) {
        if (playerOfTheMatchResponse === null) return null;

        return {
            id: playerOfTheMatchResponse.id,
            name: playerOfTheMatchResponse.name.fullName,
            teamName: playerOfTheMatchResponse.teamName,
            rating: Number(playerOfTheMatchResponse.rating.num)
        }
    }

    private toMatchHeaderEvents(
        events: MatchHeaderEventsResponse,
    ): MatchHeaderEvents {
        return {
            home: Object.values(events.homeTeamGoals)
                .flat()
                .map(goal => this.toGoalEvent(goal)),

            away: Object.values(events.awayTeamGoals)
                .flat()
                .map(goal => this.toGoalEvent(goal)),
        };
    }

    private toGoalEvent(
        goal: GoalEventResponse,
    ): GoalEvent {
        return {
            playerId: goal.playerId,
            time: goal.time,
            fullName: goal.fullName,
            lastName: goal.lastName,
            assistInput: goal.assistInput,
            shotType: goal.shotmapEvent?.shotType ?? "",
            situation: goal.shotmapEvent?.situation ?? "",
            isOwnGoal: goal.shotmapEvent?.isOwnGoal ?? false,
        };
    }
}