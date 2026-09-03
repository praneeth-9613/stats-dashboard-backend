import { Fixture } from "../../persistence/entities/Fixture";
import { MatchHeaderEvents, PlayerOfTheMatch } from "../../persistence/json/Matches";
import { FixtureData } from "./FixtureData";

export interface FixtureResponseDto extends Fixture {

    goalscorers?: MatchHeaderEvents | null;

    playerOfTheMatch?: PlayerOfTheMatch | null;

}