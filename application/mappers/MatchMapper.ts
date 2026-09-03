import { MatchPlayerResponse, MatchResponse } from "../../api/types/RawMatch"
import { GoalEventResponse, MatchHeaderEventsResponse } from "../../api/types/RawMatchHeader";
import { GoalEvent, MatchGoalscorers, MatchHeaderEvents, MatchPlayer, MatchPlayerStats } from "../../persistence/json/Matches"

export class MatchMapper {

    toMatchPlayerStats(matchResponse: MatchResponse, matchId: number, season: string, teamId: number): MatchPlayerStats {

        const playerStats = Object.values(matchResponse.content?.playerStats ?? {});

        const match: MatchPlayerStats = {
            matchId,
            season,
            teamId
        }

        for (const player of playerStats) {
            const matchPlayer = this.toMatchPlayer(player, season, teamId)

            match.playerStats = {
                ...match.playerStats,
                [matchPlayer.playerId]: matchPlayer
            }
        }

        return match;

    }

    toMatchPlayer(matchPlayerResponse: MatchPlayerResponse, season: string, teamId: number): MatchPlayer {
        return {
            playerId: matchPlayerResponse.id,
            name: matchPlayerResponse.name,
            teamName: matchPlayerResponse.teamName,
            isGoalkeeper: matchPlayerResponse.isGoalkeeper,
            stats: matchPlayerResponse.stats,
            shirtNumber: matchPlayerResponse.shirtNumber
        }
    }

    toMatchGoalscorers(matchResponse: MatchResponse, matchId: number, season: string, teamId: number): MatchGoalscorers {
        return {
            matchId,
            season,
            teamId,
            goalscorers: matchResponse.header?.events
                ? this.toMatchHeaderEvents(matchResponse.header?.events)
                : undefined,
            playerOfTheMatch: matchResponse.content?.matchFacts?.playerOfTheMatch
        };
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