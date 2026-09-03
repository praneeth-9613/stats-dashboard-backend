import { injectable } from "tsyringe";
import { SquadMemberResponse } from "../../api/types/RawTeam";
import { SquadData } from "../types/SquadData";

@injectable()
export class SquadMapper {

    toSquadData(squadMemberResponse: SquadMemberResponse[]): SquadData[] {
        return squadMemberResponse.map(member => {
            return {
                playerId: member.id,
                role: member.role.fallback
            }
        })
    }
}