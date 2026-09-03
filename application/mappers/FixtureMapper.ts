import { FixtureResponse } from "../../api/types/RawFixture"
import { FixtureData } from "../types/FixtureData"
import { LeagueSeasonTeamIdentifier } from "../types/PhaseInput"

export class FixtureMapper {

    toFixtureData(fixtureResponse: FixtureResponse[], leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): FixtureData[] {
        return fixtureResponse.map(fixture => {
            return {
                matchId: fixture.id,
                season: leagueSeasonTeamIdentifier.season,
                leagueId: leagueSeasonTeamIdentifier.leagueId,
                teamId: leagueSeasonTeamIdentifier.teamId ?? 0,
                competition: fixture.tournament.name,
                homeAway: (fixture.home.id === leagueSeasonTeamIdentifier.teamId) ? "home" : "away",
                completed: fixture.status.finished,
                fixtureDate: fixture.status.utcTime,
                homeId: fixture.home.id,
                awayId: fixture.away.id,
                homeName: fixture.home.name,
                awayName: fixture.away.name,
                homeScore: fixture.notStarted ? null : fixture.home.score,
                awayScore: fixture.notStarted ? null : fixture.away.score,
                scoreStr: fixture.notStarted ? null : (fixture.status.scoreStr ?? null),
                isPenaltyShootout: fixture.status.reason?.long.toLowerCase() === "after penalties",
                notStarted: fixture.notStarted,
            }
        })
    }
}