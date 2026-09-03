import { FixtureResponse } from "../../api/types/RawFixture"
import { FixtureData } from "../types/FixtureData"

export class FixtureMapper {

    toFixtureData(fixtureResponse: FixtureResponse[], season: string, teamId: number): FixtureData[] {
        return fixtureResponse.map(fixture => {
            return {
                matchId: fixture.id,
                season: season,
                teamId: teamId,
                opponent: fixture.opponent.name,
                competition: fixture.tournament.name,
                homeAway: (fixture.home.id === teamId) ? "home" : "away",
                completed: fixture.status.finished,
                fixtureDate: fixture.status.utcTime,
                homeScore: fixture.notStarted ? null : fixture.home.score,
                awayScore: fixture.notStarted ? null : fixture.away.score,
                scoreStr: fixture.notStarted ? null : (fixture.status.scoreStr ?? null),
                isPenaltyShootout: fixture.status.reason?.long.toLowerCase() === "after penalties",
                notStarted: fixture.notStarted,
            }
        })
    }
}