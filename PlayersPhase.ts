import { fetchSquadPlayers, getNewPlayerIds } from "./helpers/PlayerHelpers";
import { processPlayers } from "./helpers/ProcessHelpers";
import { loadPlayers } from "./helpers/StorageHelpers";
import { SyncPhase } from "./SyncPhase";
import { PlayersPhaseData } from "./types/StoredPlayer";
import { TeamResponse } from "./types/Team";

export class PlayersPhase extends SyncPhase {

    async run(teamInfo: TeamResponse): Promise<PlayersPhaseData> {
        const {
            teamId,
            teamName,
            refresh,
            scrapeStatus
        } = this.context;

        const cachedPlayers = await loadPlayers(teamId);

        console.log(
            `Previously cached players: ${Object.keys(cachedPlayers).length}`
        );

        let cachedPlayerIds = new Set(Object.values(cachedPlayers).map(cachedPlayer => cachedPlayer.id));
        let allPlayerIds = cachedPlayerIds;
        if (refresh) {
            allPlayerIds = await fetchSquadPlayers(teamInfo);
            cachedPlayerIds = new Set();
        }

        const newPlayerIds = getNewPlayerIds(
            cachedPlayerIds,
            allPlayerIds
        );

        console.log(`Players to process: ${newPlayerIds.size}`);

        const players = await this.execute(
            "players",
            newPlayerIds.size,
            newPlayerIds.size > 0
                ? "Processing player profiles"
                : "No new players to process",
            () =>
                processPlayers(
                    newPlayerIds,
                    cachedPlayers,
                    teamId,
                    teamName,
                    scrapeStatus
                )
        );

        return { final: players, cachedPlayerIds: cachedPlayerIds};
    }
}