import { FixtureData } from "../../application/types/FixtureData";
import { Fixture } from "../entities/Fixture";
import { FixtureAudit, FixtureAuditAction } from "../entities/FixtureAudit";

export class FixtureEntityMapper {
    toEntity(fixtureData: FixtureData): Fixture {
        const fixture = new Fixture();

        fixture.matchId = fixtureData.matchId;
        fixture.season = fixtureData.season;
        fixture.teamId = fixtureData.teamId;
        fixture.opponent = fixtureData.opponent;
        fixture.homeAway = fixtureData.homeAway;
        fixture.competition = fixtureData.competition;
        fixture.homeScore = fixtureData.homeScore;
        fixture.awayScore = fixtureData.awayScore;
        fixture.scoreStr = fixtureData.scoreStr;
        fixture.isPenaltyShootout = fixtureData.isPenaltyShootout;
        fixture.completed = fixtureData.completed;
        fixture.notStarted = fixtureData.notStarted;
        fixture.fixtureDate = new Date(fixtureData.fixtureDate);

        return fixture;
    }

    toFixtureAuditEntity(fixture: Fixture, action: FixtureAuditAction): FixtureAudit {
        const fixtureAudit = new FixtureAudit();

        fixtureAudit.matchId = fixture.matchId;
        fixtureAudit.season = fixture.season;
        fixtureAudit.teamId = fixture.teamId;
        fixtureAudit.action = action;

        return fixtureAudit;
    }
}