import { PlayerResponse } from "../api/types/RawPlayer";
import { TeamResponse } from "../api/types/RawTeam"
import { fetchJson } from "./DirectoryHelpers"

export async function fetchTeam(teamId: number) {
    const TEAM_URL = `https://www.fotmob.com/api/data/teams?id=${teamId}&ccode3=IND`

    const teamResponse = await fetchJson<TeamResponse>(TEAM_URL);

    return teamResponse;
}

export async function fetchSquad(teamResponse: TeamResponse) {
    return teamResponse.squad?.squad;
}


export async function fetchFixtures(teamResponse: TeamResponse) {
    return teamResponse.fixtures?.allFixtures?.fixtures ?? [];
}

export async function fetchPlayer(playerId: number) {
    const PLAYER_URL = `https://www.fotmob.com/api/data/playerData?id=${playerId}`

    const playerResponse = await fetchJson<PlayerResponse>(PLAYER_URL);

    return playerResponse;
}
