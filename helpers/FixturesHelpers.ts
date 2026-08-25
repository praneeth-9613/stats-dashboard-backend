import { Fixture } from "../types/FixtureTypes";
import { MatchesDatabase } from "../types/StoredStats";
import { TeamResponse } from "../types/Team";
import { fetchJson } from "./DirectoryHelpers";

export async function fetchTeamInfo(teamId: number): Promise<TeamResponse> {
    const TEAM_URL = `https://www.fotmob.com/api/data/teams?id=${teamId}&ccode3=IND`

    const data =
        await fetchJson<TeamResponse>(
            TEAM_URL
        );

    return data;
}

export async function fetchSeasonFixtures(teamInfo: TeamResponse): Promise<Fixture[]> {
    const team = teamInfo?.details?.name;

    console.log(`Fetching ${team} fixtures...`);

    const fixtures =
        teamInfo.fixtures
            ?.allFixtures
            ?.fixtures ?? [];

    if (fixtures.length === 0) {
        throw new Error(
            `No ${team} fixtures found.`
        );
    }

    // Find first Club Friendlies fixture.
    const startIndex =
        fixtures.findIndex(
            fixture =>
                fixture.tournament?.name ===
                "Club Friendlies"
        );

    if (startIndex === -1) {
        throw new Error(
            'Could not find "Club Friendlies" in fixture list.'
        );
    }

    const seasonFixtures =
        fixtures.slice(startIndex);

    console.log(
        `Season starts at fixture index: ${startIndex}`
    );

    console.log(
        `Season fixtures currently listed: ${seasonFixtures.length}`
    );

    return seasonFixtures;
}

export function getCompletedFixtures(
    fixtures: Fixture[]
): Fixture[] {

    return fixtures.filter(
        fixture =>
            fixture.status?.finished === true &&
            fixture.status?.cancelled !== true
    );
}

export function getFixturesToProcess(completedFixtures: Fixture[], matches: MatchesDatabase, resync: boolean = false): Fixture[] {
    return resync ? completedFixtures :
        completedFixtures.filter(
            fixture =>
                !matches[String(fixture.id)]
        );
}

export function getFixturesToAdd(seasonFixtures: Fixture[], completedFixtures: Fixture[], matches: MatchesDatabase, resync: boolean = false): Fixture[] {
    return resync ? seasonFixtures :
        seasonFixtures.filter(
            fixture =>
                !matches[String(fixture.id)] && !completedFixtures.find(completedFixture => completedFixture.id === fixture.id)
        );
}