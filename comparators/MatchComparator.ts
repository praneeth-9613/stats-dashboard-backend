import { MatchStatWrapperResponse } from "../api/types/RawMatch";
import { Comparator } from "./Comparator";

export class MatchComparator extends Comparator<MatchStatWrapperResponse, MatchStatWrapperResponse> {
    constructor() {
        super([
            {
                newField: "stat",
                oldField: "stat"
            }
        ]);
    }
}