import { FixtureData } from "../application/types/FixtureData";
import { Comparator } from "./Comparator";
import { Fixture } from "../persistence/entities/Fixture";

export class FixtureComparator extends Comparator<FixtureData, Fixture> {
    constructor() {
        super([
            {
                newField: "completed",
                oldField: "completed",
            },
            {
                newField: "notStarted",
                oldField: "notStarted",
            },
            {
                newField: "homeScore",
                oldField: "homeScore",
            },
            {
                newField: "awayScore",
                oldField: "awayScore",
            },
            {
                newField: "scoreStr",
                oldField: "scoreStr",
            },
            {
                newField: "isPenaltyShootout",
                oldField: "isPenaltyShootout",
            },
            {
                newField: "cancelled",
                oldField: "cancelled",
            },
        ]);
    }
}