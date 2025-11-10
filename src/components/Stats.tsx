import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import React from "react";
import { LoadingPage } from "npm/components/loading";

interface PlayerGameMatrix {
  data: Array<{ game: string; gameCount: number } & Record<string, number>>;
  players: string[];
  games: string[];
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
  <div className="rounded-xl bg-white p-4 shadow text-center">
    <h3 className="text-gray-600 text-sm">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

function clamp01(n: number) {
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(1, n));
}

const PlayerGameHeatmap: React.FC<PlayerGameMatrix> = ({
                                                         data,
                                                         players,
                                                         games,
                                                       }) => {
  const rows = data.map((row) => {
    const cells = players.map((p) => {
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
    <div className="mt-10 bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold text-center mb-4">
        Player Performance Heatmap
      </h2>
      <div className="overflow-x-auto">
        <div
          className="grid border-b border-gray-200"
          style={{
            gridTemplateColumns: `minmax(180px, 1fr) 100px repeat(${players.length}, minmax(90px, 1fr))`,
          }}
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
            Game
          </div>
          <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center">
            Games
          </div>
          {players.map((p) => (
            <div
              key={p}
              className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center"
            >
              {p}
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-200">
          {rows.map(({ game, gameCount, cells }) => (
            <div
              key={game}
              className="grid"
              style={{
                gridTemplateColumns: `minmax(180px, 1fr) 100px repeat(${players.length}, minmax(90px, 1fr))`,
              }}
            >
              <div className="px-3 py-2 text-sm font-medium text-gray-800">
                {game}
              </div>
              <div className="px-3 py-2 text-sm text-center text-gray-600">
                {gameCount}
              </div>
              {cells.map((rate, idx) => {
                const playerName = players[idx] ?? "Unknown";
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
  highScores: Array<{ gameName: string; highScore: number; playerName: string }>;
}> = ({ highScores }) => {
  return (
    <div className="mt-10 bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold text-center mb-4">
        Game High Scores
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                High Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {highScores.map((game, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {game.gameName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {game.highScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {game.playerName}
                </td>
              </tr>
            ))}
            {highScores.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
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
}> = ({ data, players, positions }) => {
  const totalPerPlayer: Record<string, number> = {};
  for (const row of data) {
    for (const player of players) {
      totalPerPlayer[player] = (totalPerPlayer[player] ?? 0) + (row[player] ?? 0);
    }
  }

  const maxVal = Math.max(...data.flatMap((row) => players.map((p) => row[p] ?? 0)));

  return (
    <div className="mt-10 bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold text-center mb-4">
        Player Position Distribution
      </h2>
      <div className="overflow-x-auto">
        <div
          className="grid border-b border-gray-200"
          style={{
            gridTemplateColumns: `100px repeat(${players.length}, minmax(90px, 1fr))`,
          }}
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
            Position
          </div>
          {players.map((p) => (
            <div
              key={p}
              className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center"
            >
              {p}
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-200">
          {data.map(({ position, ...rest }) => (
            <div
              key={position}
              className="grid"
              style={{
                gridTemplateColumns: `100px repeat(${players.length}, minmax(90px, 1fr))`,
              }}
            >
              <div className="px-3 py-2 text-sm font-medium text-gray-800">
                {position}
              </div>
              {players.map((p) => {
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
                    <span className="text-[11px] text-gray-600">{percentage.toFixed(0)}%</span>
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

  if (isLoading || matrixLoading || posLoading || highScoresLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (isError || matrixError || posError || highScoresError || !sessions || !matrixData || !positionMatrix) {
    return <div className="text-center text-gray-500">No stats available.</div>;
  }

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

  const mostActive = Array.from(getGamesPlayedPerPlayer().entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <h1 className="text-2xl font-bold text-center">Stats</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        <StatCard title="Total Sessions" value={sessions.length} />
        <StatCard
          title="Unique Players"
          value={
            new Set(sessions.flatMap((s) => s.players.map((p) => p.nickname))).size
          }
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
        />
      )}

      {positionMatrix.data.length > 0 && (
        <PlayerPositionHeatmap
          data={positionMatrix.data}
          players={positionMatrix.players}
          positions={positionMatrix.positions}
        />
      )}

      {highScores && (
        <GameHighScoresTable highScores={highScores} />
      )}
    </div>
  );
};

export default Stats;
