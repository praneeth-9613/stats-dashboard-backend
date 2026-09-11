import { DataSource, In } from "typeorm";
import { LeagueSeasonTeamIdentifier } from "../application/types/PhaseInput";
import { PlayerTeam } from "../persistence/entities/PlayerTeam";
import { FixtureAudit } from "../persistence/entities/FixtureAudit";
import { Fixture } from "../persistence/entities/Fixture";
import { Player } from "../persistence/entities/Player";
import { AppDataSource } from "../persistence/data-source";
import { injectable } from "tsyringe";
import { MatchPlayerStats } from "../persistence/entities/MatchPlayerStats";
import { MatchGoalscorers } from "../persistence/entities/MatchGoalscorers";
import { TeamSeasonStats } from "../persistence/entities/TeamSeasonStats";

@injectable()
export class TeamResetService {

    private readonly dataSource: DataSource = AppDataSource;

    constructor(
    ) { }

    async resetTeam(
        identifier: LeagueSeasonTeamIdentifier,
    ): Promise<void> {

        await this.dataSource.transaction(
            async manager => {

                // Get PlayerTeams before deleting them
                const playerTeams =
                    await manager.find(PlayerTeam, {
                        where: {
                            teamId: identifier.teamId,
                            leagueId: identifier.leagueId,
                            season: identifier.season,
                        },
                    });

                const playerIds = playerTeams.map(
                    playerTeam => playerTeam.playerId,
                );

                const fixtures =
                    await manager.find(Fixture, {
                        where: {
                            teamId: identifier.teamId,
                            leagueId: identifier.leagueId,
                            season: identifier.season,
                        },
                    });

                const matchIds = fixtures.map(
                    fixture => fixture.matchId,
                );

                // Delete fixture audits first
                await manager.delete(
                    FixtureAudit,
                    {
                        matchId: In(matchIds),
                    },
                );

                // Delete fixtures
                await manager.delete(
                    Fixture,
                    {
                        leagueId: identifier.leagueId,
                        teamId: identifier.teamId,
                        season: identifier.season,
                    },
                );

                // Delete PlayerTeams
                await manager.delete(
                    PlayerTeam,
                    {
                        teamId: identifier.teamId,
                        leagueId: identifier.leagueId,
                        season: identifier.season,
                    },
                );

                // Delete players that no longer have any PlayerTeam
                for (const playerId of playerIds) {

                    const remaining =
                        await manager.count(PlayerTeam, {
                            where: {
                                playerId,
                            },
                        });

                    if (remaining === 0) {
                        await manager.delete(
                            Player,
                            { playerId },
                        );
                    }
                }

                await manager.delete(MatchPlayerStats, {
                    teamId: identifier.teamId,
                    leagueId: identifier.leagueId,
                    season: identifier.season,
                })

                await manager.delete(MatchGoalscorers, {
                    teamId: identifier.teamId,
                    leagueId: identifier.leagueId,
                    season: identifier.season,
                })

                await manager.delete(TeamSeasonStats, {
                    teamId: identifier.teamId,
                    leagueId: identifier.leagueId,
                    season: identifier.season,
                })
            },
        );
    }
}