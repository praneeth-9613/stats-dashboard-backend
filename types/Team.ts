import { Fixture } from "./FixtureTypes";

export interface TeamResponse {
    fixtures?: {
        allFixtures?: {
            fixtures?: Fixture[];
        };
    };
}