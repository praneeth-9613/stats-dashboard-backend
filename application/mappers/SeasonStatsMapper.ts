import { MatchStatSectionResponse } from "../../api/types/RawMatch";
import { MatchPlayer } from "../../persistence/json/Matches";
import { SeasonPlayerStats, SeasonStat } from "../../persistence/json/SeasonStats";

export class SeasonStatsMapper {

    aggregatePlayer(
        seasonPlayer: SeasonPlayerStats | undefined,
        matchPlayer: MatchPlayer,
    ): SeasonPlayerStats {
        const matchStats = this.toStats(matchPlayer.stats ?? []);

        if (!seasonPlayer) {
            const minutesPlayed =
                matchStats["minutes_played"]?.value ?? 0;

            const rating =
                matchStats["rating_title"]?.value;

            return {
                playerId: matchPlayer.playerId,
                name: matchPlayer.name,
                appearances: minutesPlayed > 0 ? 1 : 0,
                ratingSum: rating ?? 0,
                ratingMatches: rating !== undefined ? 1 : 0,
                averageRating: rating ?? 0,
                stats: matchStats,
            };
        }

        seasonPlayer.name = matchPlayer.name;

        const minutesPlayed =
            matchStats["minutes_played"]?.value ?? 0;

        if (minutesPlayed > 0) {
            seasonPlayer.appearances++;
        }

        const rating =
            matchStats["rating_title"]?.value;

        if (rating !== undefined) {
            seasonPlayer.ratingSum! += rating;
            seasonPlayer.ratingMatches!++;
        }

        if (seasonPlayer.ratingMatches! > 0) {
            seasonPlayer.averageRating =
                seasonPlayer.ratingSum! / seasonPlayer.ratingMatches!;
        }

        for (const [key, matchStat] of Object.entries(matchStats)) {
            // Rating is handled separately above.
            if (key === "rating_title") {
                continue;
            }

            const seasonStat = seasonPlayer.stats[key];

            if (!seasonStat) {
                seasonPlayer.stats[key] = {
                    ...matchStat,
                };
                continue;
            }

            if (matchStat.value !== undefined) {
                seasonStat.value =
                    (seasonStat.value ?? 0) + matchStat.value;
            }

            if (matchStat.total !== undefined) {
                seasonStat.total =
                    (seasonStat.total ?? 0) + matchStat.total;
            }

            if (matchStat.type !== undefined) {
                seasonStat.type = matchStat.type;
            }
        }

        return seasonPlayer;
    }

    private toStats(
        sections: MatchStatSectionResponse[],
    ): Record<string, SeasonStat> {
        const stats: Record<string, SeasonStat> = {};

        for (const section of sections) {
            for (const wrapper of Object.values(section.stats)) {

                if (wrapper.key) {
                    stats[wrapper.key] = {
                        ...wrapper.stat,
                    };
                }
            }
        }

        return stats;
    }
}