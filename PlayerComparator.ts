import {  PlayerData } from "./application/types/PlayerData";
import { Comparator } from "./Comparator";
import { Player } from "./persistence/entities/Player";

export class PlayerComparator extends Comparator<PlayerData, Player> {
    constructor() {
        super([
            {
                newField: "positions",
                oldField: "positions",
            },
            {
                newField: "injury",
                oldField: "injury",
            },
        ]);
    }
}