import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import React from "react";
import { LoadingPage } from "npm/components/loading";

//
// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────
//

interface PlayerGameMatrix {
  data: Array<{ game: string } & Record<string, number>>;
  players: string[];
  games: string[];
}

//
// ────────────────────────────────────────────────────────────────
// UI helpers
// ────────────────────────────────────────────────────────────────
//

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
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/**
 * Pure CSS grid heatmap (no charts)
 */
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

      {players.length === 0 || games.length === 0 ? (
        <p className="text-center text-gray-500">No data available</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Header */}
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

          {/* Body */}
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
                  const border = "rgba(0,0,0,0.04)";

                  return (
                    <div
                      key={`${game}-${playerName}`}
                      className="px-2 py-3 text-center text-sm font-semibold"
                      style={{
                        backgroundColor: bg,
                        borderLeft: `1px solid ${border}`,
                      }}
                      title={`${playerName} • ${game} • ${pct}% win rate`}
                    >
                      {pct}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
            <span>0%</span>
            <div
              className="flex-1 h-2 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, hsl(210 70% 92%) 0%, hsl(180 70% 75%) 50%, hsl(120 70% 52%) 100%)",
              }}
            />
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
};


//
// ────────────────────────────────────────────────────────────────
// Main Stats component
// ────────────────────────────────────────────────────────────────
//

const Stats: React.FC<DashboardProps> = (props) => {
  const {
    data: sessions,
    isLoading,
    isError,
  } = api.session.getAllCompletedSessions.useQuery({
    data: { groupId: props.groupName },
  });

  const {
    data: matrixData,
    isLoading: matrixLoading,
    isError: matrixError,
  } = api.stats.getPlayerGamePerformanceMatrix.useQuery({
    groupId: props.groupName,
  });

  if (isLoading || matrixLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (isError || matrixError || !sessions || !matrixData) {
    return <div className="text-center text-gray-500">No stats available.</div>;
  }

  const getWinsPerPlayer = (): Map<string, number> => {
    const wins = new Map<string, number>();
    sessions.forEach((session) => {
      session.players.forEach((p) => {
        if (p.position === 1) {
          wins.set(p.nickname, (wins.get(p.nickname) ?? 0) + 1);
        }
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        <StatCard title="Total Sessions" value={sessions.length} />
        <StatCard
          title="Unique Players"
          value={
            new Set(sessions.flatMap((s) => s.players.map((p) => p.nickname)))
              .size
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

      {/* Games Played */}
      <h2 className="text-lg font-bold text-center mt-10">Games Played</h2>
      <div className="mt-4 flow-root">
        {Array.from(getGamesPlayedPerPlayer().entries())
          .sort((a, b) => b[1] - a[1])
          .map(([n, c]) => (
            <div key={n} className="grid grid-cols-2">
              <p>{n}</p>
              <p>{c}</p>
            </div>
          ))}
      </div>

      {/* Games Won */}
      <h2 className="text-lg font-bold text-center mt-10">Games Won</h2>
      <div className="mt-4 flow-root">
        {Array.from(getWinsPerPlayer().entries())
          .sort((a, b) => b[1] - a[1])
          .map(([n, c]) => (
            <div key={n} className="grid grid-cols-2">
              <p>{n}</p>
              <p>{c}</p>
            </div>
          ))}
      </div>

      {/* Win Rate */}
      <h2 className="text-lg font-bold text-center mt-10">Win Rate</h2>
      <div className="mt-4 flow-root">
        {Array.from(getWinRatePerPlayer().entries())
          .sort((a, b) => b[1] - a[1])
          .map(([n, r]) => (
            <div key={n} className="grid grid-cols-2">
              <p>{n}</p>
              <p>{r.toFixed(1)}%</p>
            </div>
          ))}
      </div>

      {/* Heatmap */}
      {matrixData.data.length > 0 && (
        <PlayerGameHeatmap
          data={matrixData.data}
          players={matrixData.players}
          games={matrixData.games}
        />
      )}
    </div>
  );
};

export default Stats;
