import { FixtureData } from "../../application/types/FixtureData";
import { Fixture, FixtureStatus } from "../entities/Fixture";
import { FixtureAudit } from "../entities/FixtureAudit";

export class FixtureEntityMapper {
    toEntity(fixtureData: FixtureData, fixtureStatus: FixtureStatus): Fixture {
        const fixture = new Fixture();

        fixture.matchId = fixtureData.matchId;
        fixture.season = fixtureData.season;
        fixture.leagueId = fixtureData.leagueId;
        fixture.teamId = fixtureData.teamId;
        fixture.homeAway = fixtureData.homeAway;
        fixture.competition = fixtureData.competition;
        fixture.homeId = fixtureData.homeId;
        fixture.awayId = fixtureData.awayId;
        fixture.homeName = fixtureData.homeName;
        fixture.awayName = fixtureData.awayName;
        fixture.homeScore = fixtureData.homeScore;
        fixture.awayScore = fixtureData.awayScore;
        fixture.scoreStr = fixtureData.scoreStr;
        fixture.isPenaltyShootout = fixtureData.isPenaltyShootout;
        fixture.completed = fixtureData.completed;
        fixture.notStarted = fixtureData.notStarted;
        fixture.fixtureDate = new Date(fixtureData.fixtureDate);
        fixture.fixtureStatus = fixtureStatus;

        return fixture;
    }

    toFixtureAuditEntity(fixture: Fixture, field: keyof Fixture, oldValue: any, newValue: any): FixtureAudit {
        const fixtureAudit = new FixtureAudit();

        fixtureAudit.matchId = fixture.matchId;
        fixtureAudit.field = field;
        fixtureAudit.oldValue = oldValue;
        fixtureAudit.newValue = newValue;

        return fixtureAudit;
    }
}