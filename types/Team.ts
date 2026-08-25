import { Fixture } from "./FixtureTypes";

export interface TeamResponse {
    fixtures?: {
        allFixtures?: {
            fixtures?: Fixture[];
        };
    };

    squad?: {
        squad?: {
            title: string;
            members: { id: number }[]
        }[]
    }

    details?: {
        name: string
    }
}