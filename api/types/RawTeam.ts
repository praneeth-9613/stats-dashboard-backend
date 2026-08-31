import { FixtureResponse } from "./RawFixture";

export interface TeamResponse {
    fixtures?: {
        allFixtures?: {
            fixtures?: FixtureResponse[];
        };
    }

    squad?: {
        squad?: SquadResponse[]
    }

    details?: {
        name: string
    }
}


export type SquadResponse = {
    title: string;
    members: SquadMemberResponse[]
}

export type SquadMemberResponse = {
    id: number, 
    role: {
        fallback: string
    },
}