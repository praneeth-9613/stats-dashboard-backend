import { findAcademyPlayersNotInSquad } from "./helpers/PlayerHelpers";
import { processPlayers } from "./helpers/ProcessHelpers";
import { SyncPhase } from "./phases/SyncPhase";
import { PlayersDatabase } from "./types/StoredPlayer";
import { MatchesDatabase } from "./types/StoredStats";

export class AcademyPlayersPhase extends SyncPhase {

    async run(matches: MatchesDatabase, players: PlayersDatabase, cachedPlayerIds: Set<number>) {
        const {
            teamId,
            teamName,
            refresh,
            scrapeStatus
        } = this.context;

        const existingPlayerIds = new Set(Object.values(players).map(existingPlayer => existingPlayer.id));
        const academyPlayerIds = findAcademyPlayersNotInSquad(matches, refresh ? existingPlayerIds : cachedPlayerIds);

        console.log(
            `Academy players to process: ` +
            `${academyPlayerIds.size}`
        );

        await this.execute(
            "academy_players",
            academyPlayerIds.size,
            academyPlayerIds.size > 0 ? "Processing academy player profiles" : "No new academy players to process",
            () => processPlayers(
                academyPlayerIds,
                players,
                teamId,
                teamName,
                scrapeStatus
            )
        );
    }

}