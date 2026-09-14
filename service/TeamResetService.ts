import { DataSource, In } from "typeorm";
import { LeagueSeasonTeamIdentifier } from "../application/types/PhaseInput";
import { PlayerTeam } from "../persistence/entities/PlayerTeam";
import { Fixture, FixtureStatus } from "../persistence/entities/Fixture";
import { Player } from "../persistence/entities/Player";
import { AppDataSource } from "../persistence/data-source";
import { inject, injectable } from "tsyringe";
import { MatchPlayerStats } from "../persistence/entities/MatchPlayerStats";
import { MatchGoalscorers } from "../persistence/entities/MatchGoalscorers";
import { TeamSeasonStats } from "../persistence/entities/TeamSeasonStats";
import { FixtureAudit } from "../persistence/entities/FixtureAudit";
import { FixtureEntityMapper } from "../persistence/mappers/FixtureEntityMapper";

@injectable()
export class TeamResetService {

    private readonly dataSource: DataSource = AppDataSource;

    constructor(
        @inject(FixtureEntityMapper)
        private readonly fixtureEntityMapper: FixtureEntityMapper
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
                        where: [
                            {
                                season: identifier.season,
                                leagueId: identifier.leagueId,
                                homeId: identifier.teamId,
                                fixtureStatus: FixtureStatus.PROCESSED
                            },
                            {
                                season: identifier.season,
                                leagueId: identifier.leagueId,
                                awayId: identifier.teamId,
                                fixtureStatus: FixtureStatus.PROCESSED
                            }
                        ]
                    });

                await manager.save(
                    FixtureAudit,
                    fixtures.map(fixture => this.fixtureEntityMapper.toFixtureAuditEntity(fixture, "fixtureStatus", FixtureStatus.PROCESSED, FixtureStatus.NEW))
                );

                await manager.save(
                    FixtureAudit,
                    fixtures.map(fixture => this.fixtureEntityMapper.toFixtureAuditEntity(fixture, "completed", true, false))
                );

                // Update fixtures which were PROCESSED back to NEW
                await manager.update(
                    Fixture,
                    fixtures.map(fixture => fixture.matchId),
                    {
                        fixtureStatus: FixtureStatus.NEW,
                        completed: false
                    }
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