import { injectable } from "tsyringe";
import { PlayerTeamData } from "../application/types/PlayerData";
import { PlayerTeam } from "../persistence/entities/PlayerTeam";
import { Comparator } from "./Comparator";

@injectable()
export class PlayerTeamComparator extends Comparator<PlayerTeamData, PlayerTeam> {
    constructor() {
        super([
            {
                newField: "shirt",
                oldField: "shirtNumber",
            },
            {
                newField: "contractEnd",
                oldField: "contractEnd",
            },
        ]);
    }
}