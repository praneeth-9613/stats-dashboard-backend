import { PlayerTeamData } from "./application/types/PlayerData";
import { Comparator } from "./Comparator";
import { PlayerTeam } from "./persistence/entities/PlayerTeam";

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