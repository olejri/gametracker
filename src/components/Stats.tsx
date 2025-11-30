import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import React from "react";
import { LoadingPage } from "npm/components/loading";

interface PlayerGameMatrix {
  data: Array<{ game: string; gameCount: number } & Record<string, number>>;
  players: string[];
  games: string[];
  activePlayers?: string[];
}

const StatCard = ({
                    title,
                    value,
                    subtitle,
                  }: {
  title: string;
  value: string | number;
  subtitle?: string;
}) => (
  <div className="rounded-xl bg-white p-4 shadow text-center dark:bg-gray-800">
    <h3 className="text-gray-600 text-sm dark:text-gray-400">{title}</h3>
    <p className="text-2xl font-bold dark:text-white">{value}</p>
    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
  </div>
);

function clamp01(n: number) {
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(1, n));
}

const PlayerGameHeatmap: React.FC<PlayerGameMatrix> = ({
                                                         data,
                                                         players,
                                                         activePlayers,
                                                       }) => {
  // Filter to only show active players in the display
  const displayPlayers = activePlayers && activePlayers.length > 0 
    ? players.filter((p) => activePlayers.includes(p))
    : players;

  const rows = data.map((row) => {
    const cells = displayPlayers.map((p) => {
      const v = row[p];
      const rate = typeof v === "number" ? clamp01(v) : 0;
      return rate;
    });
    return {
      game: row.game,
      gameCount: typeof row.gameCount === "number" ? row.gameCount : 0,
      cells,
    };
  });

  return (
    <div className="mt-10 bg-white rounded-xl shadow p-4 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-center mb-4 dark:text-white">
        Player Performance Heatmap
      </h2>
      <div className="overflow-x-auto">
        <div
          className="grid border-b border-gray-200 dark:border-gray-700"
          style={{
            gridTemplateColumns: `minmax(180px, 1fr) 100px repeat(${displayPlayers.length}, minmax(90px, 1fr))`,
          }}
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Game
          </div>
          <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center dark:text-gray-400">
            Games
          </div>
          {displayPlayers.map((p) => (
            <div
              key={p}
              className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center dark:text-gray-400"
            >
              {p}
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map(({ game, gameCount, cells }) => (
            <div
              key={game}
              className="grid"
              style={{
                gridTemplateColumns: `minmax(180px, 1fr) 100px repeat(${displayPlayers.length}, minmax(90px, 1fr))`,
              }}
            >
              <div className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-white">
                {game}
              </div>
              <div className="px-3 py-2 text-sm text-center text-gray-600 dark:text-gray-400">
                {gameCount}
              </div>
              {cells.map((rate, idx) => {
                const playerName = displayPlayers[idx] ?? "Unknown";
                const pct = Math.round(rate * 100);
                const hue = 210 - Math.round(rate * 90);
                const light = 92 - Math.round(rate * 40);
                const bg = `hsl(${hue} 70% ${light}%)`;

                return (
                  <div
                    key={`${game}-${playerName}`}
                    className="px-2 py-3 text-center text-sm font-semibold"
                    style={{ backgroundColor: bg }}
                    title={`${playerName} • ${game} • ${pct}% win rate`}
                  >
                    {pct}%
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GameHighScoresTable: React.FC<{
  highScores: Array<{ gameName: string; highScore: number; playerName: string; isActivePlayer?: boolean }>;
}> = ({ highScores }) => {
  // Filter to only show high scores from active players
  const displayHighScores = highScores.filter((score) => score.isActivePlayer !== false);

  return (
    <div className="mt-10 bg-white rounded-xl shadow p-4 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-center mb-4 dark:text-white">
        Game High Scores
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                High Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Player
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {displayHighScores.map((game, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {game.gameName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold dark:text-white">
                  {game.highScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {game.playerName}
                </td>
              </tr>
            ))}
            {displayHighScores.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No high scores available yet. Scores must be numeric values.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlayerPositionHeatmap: React.FC<{
  data: Array<{ position: number } & Record<string, number>>;
  players: string[];
  positions: number[];
  activePlayers?: string[];
}> = ({ data, players, activePlayers }) => {
  // Filter to only show active players in the display
  const displayPlayers = activePlayers && activePlayers.length > 0 
    ? players.filter((p) => activePlayers.includes(p))
    : players;

  const totalPerPlayer: Record<string, number> = {};
  for (const row of data) {
    for (const player of displayPlayers) {
      totalPerPlayer[player] = (totalPerPlayer[player] ?? 0) + (row[player] ?? 0);
    }
  }

  const maxVal = Math.max(...data.flatMap((row) => displayPlayers.map((p) => row[p] ?? 0)));

  return (
    <div className="mt-10 bg-white rounded-xl shadow p-4 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-center mb-4 dark:text-white">
        Player Position Distribution
      </h2>
      <div className="overflow-x-auto">
        <div
          className="grid border-b border-gray-200 dark:border-gray-700"
          style={{
            gridTemplateColumns: `100px repeat(${displayPlayers.length}, minmax(90px, 1fr))`,
          }}
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Position
          </div>
          {displayPlayers.map((p) => (
            <div
              key={p}
              className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center dark:text-gray-400"
            >
              {p}
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map(({ position, ...rest }) => (
            <div
              key={position}
              className="grid"
              style={{
                gridTemplateColumns: `100px repeat(${displayPlayers.length}, minmax(90px, 1fr))`,
              }}
            >
              <div className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-white">
                {position}
              </div>
              {displayPlayers.map((p) => {
                const count = rest[p] ?? 0;
                const total = totalPerPlayer[p] ?? 1;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const intensity = maxVal > 0 ? count / maxVal : 0;
                const hue = 200 - Math.round(intensity * 120);
                const light = 95 - Math.round(intensity * 45);
                const bg = `hsl(${hue} 70% ${light}%)`;

                return (
                  <div
                    key={`${position}-${p}`}
                    className="px-2 py-3 text-center text-sm font-semibold flex flex-col items-center justify-center"
                    style={{ backgroundColor: bg }}
                    title={`${p} • Position ${position} • ${count} times (${percentage.toFixed(1)}%)`}
                  >
                    <span>{count}</span>
                    <span className="text-[11px] text-gray-600 dark:text-gray-700">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BestGamePerPlayerTable: React.FC<{
  bestGames: Array<{
    playerName: string;
    bestGame: string;
    trueAvgScore: number;
    gamesPlayed: number;
    avgPosition: number;
    bayesianScore: number;
    isActivePlayer?: boolean;
  }>;
}> = ({ bestGames }) => {
  // Filter to only show active players
  const displayBestGames = bestGames.filter((game) => game.isActivePlayer !== false);

  return (
    <div className="mt-10 bg-white rounded-xl shadow p-4 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-center mb-4 dark:text-white">
        Best Game Per Player
      </h2>
      <p className="text-center text-sm text-gray-600 mb-4 px-2 dark:text-gray-400">
        Shows each player&apos;s best game using a normalized rank.
        A 1st place finish is 100% and last place is 0%, fairly weighting games
        with different player counts.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Player
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Best Game
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              True Avg. Score
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Games Played
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Avg Position
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Bayesian Score
            </th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {displayBestGames.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {item.playerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {item.bestGame}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {Math.round(item.trueAvgScore * 100)}%
                  </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center dark:text-gray-400">
                {item.gamesPlayed}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center dark:text-gray-400">
                {item.avgPosition.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: item.gamesPlayed >= 3 ? '#d1fae5' : '#fef3c7',
                      color: item.gamesPlayed >= 3 ? '#065f46' : '#92400e'
                    }}
                  >
                    {Math.round(item.bayesianScore * 100)}%
                  </span>
              </td>
            </tr>
          ))}
          {displayBestGames.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No data available yet. Play some games to see best game statistics!
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center dark:text-gray-400">
        <p>💡 <strong>Bayesian Score</strong> is a confidence-adjusted score. Games with few plays are pulled toward a 50% average.</p>
        <p>This provides a more realistic ranking than True Average Score alone.</p>
      </div>
    </div>
  );
};

const Stats: React.FC<DashboardProps> = (props) => {
  const { data: sessions, isLoading, isError } = api.session.getAllCompletedSessions.useQuery({
    data: { groupId: props.groupName },
  });

  const {
    data: matrixData,
    isLoading: matrixLoading,
    isError: matrixError,
  } = api.stats.getPlayerGamePerformanceMatrix.useQuery({
    groupId: props.groupName,
  });

  const {
    data: positionMatrix,
    isLoading: posLoading,
    isError: posError,
  } = api.stats.getPlayerPositionMatrix.useQuery({
    groupId: props.groupName,
  });

  const {
    data: highScores,
    isLoading: highScoresLoading,
    isError: highScoresError,
  } = api.stats.getGameHighScores.useQuery({
    groupId: props.groupName,
  });

  const {
    data: bestGames,
    isLoading: bestGamesLoading,
    isError: bestGamesError,
  } = api.stats.getBestGamePerPlayer.useQuery({
    groupId: props.groupName,
  });

  if (isLoading || matrixLoading || posLoading || highScoresLoading || bestGamesLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (isError || matrixError || posError || highScoresError || bestGamesError || !sessions || !matrixData || !positionMatrix) {
    return <div className="text-center text-gray-500">No stats available.</div>;
  }

  // Get the set of active player nicknames for filtering display
  const activePlayerSet = new Set(matrixData.activePlayers ?? []);

  const getWinsPerPlayer = (): Map<string, number> => {
    const wins = new Map<string, number>();
    sessions.forEach((session) => {
      session.players.forEach((p) => {
        if (p.position === 1) wins.set(p.nickname, (wins.get(p.nickname) ?? 0) + 1);
      });
    });
    return wins;
  };

  const getGamesPlayedPerPlayer = (): Map<string, number> => {
    const games = new Map<string, number>();
    sessions.forEach((s) => {
      s.players.forEach((p) => {
        games.set(p.nickname, (games.get(p.nickname) ?? 0) + 1);
      });
    });
    return games;
  };

  const getWinRatePerPlayer = (): Map<string, number> => {
    const games = getGamesPlayedPerPlayer();
    const wins = getWinsPerPlayer();
    const rates = new Map<string, number>();
    for (const [player, total] of games.entries()) {
      const w = wins.get(player) ?? 0;
      rates.set(player, (w / total) * 100);
    }
    return rates;
  };

  // Filter to only show active players in "Most Active Player" stat
  const activeGamesPlayed = Array.from(getGamesPlayedPerPlayer().entries())
    .filter(([player]) => activePlayerSet.size === 0 || activePlayerSet.has(player));
  const mostActive = activeGamesPlayed.sort((a, b) => b[1] - a[1])[0];

  // Filter to count only active unique players
  const uniqueActivePlayers = new Set(
    sessions.flatMap((s) => s.players.map((p) => p.nickname))
  );
  const displayUniquePlayerCount = activePlayerSet.size > 0
    ? [...uniqueActivePlayers].filter((p) => activePlayerSet.has(p)).length
    : uniqueActivePlayers.size;

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <h1 className="text-2xl font-bold text-center dark:text-white">Stats</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        <StatCard title="Total Sessions" value={sessions.length} />
        <StatCard
          title="Unique Players"
          value={displayUniquePlayerCount}
        />
        {mostActive && (
          <StatCard
            title="Most Active Player"
            value={mostActive[0]}
            subtitle={`${mostActive[1]} games`}
          />
        )}
      </div>

      {matrixData.data.length > 0 && (
        <PlayerGameHeatmap
          data={matrixData.data}
          players={matrixData.players}
          games={matrixData.games}
          activePlayers={matrixData.activePlayers}
        />
      )}

      {positionMatrix.data.length > 0 && (
        <PlayerPositionHeatmap
          data={positionMatrix.data}
          players={positionMatrix.players}
          positions={positionMatrix.positions}
          activePlayers={positionMatrix.activePlayers}
        />
      )}

      {highScores && (
        <GameHighScoresTable highScores={highScores} />
      )}

      {bestGames && bestGames.length > 0 && (
        <BestGamePerPlayerTable bestGames={bestGames} />
      )}
    </div>
  );
};

export default Stats;