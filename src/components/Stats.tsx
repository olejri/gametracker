import { type DashboardProps } from "npm/components/Types";
import { api, type RouterOutputs } from "npm/utils/api";
import React, { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, StarIcon, TrophyIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LoadingPage } from "npm/components/loading";
import { Card } from "npm/components/ui";
import { classNames } from "npm/lib/utils";

type Breakdown = RouterOutputs["stats"]["getPlayerGameBreakdown"];
type BreakdownGame = Breakdown["games"][number];
type HighScore = RouterOutputs["stats"]["getGameHighScores"][number];
type BestGame = RouterOutputs["stats"]["getBestGamePerPlayer"][number];
type Tally = { plays: number; wins: number; positions: number[] };

// Win rates based on fewer plays than this are shown faded
const FEW_PLAYS = 3;
const GAMES_SHOWN = 12;

const AVATAR_COLORS = [
  "bg-sky-500", "bg-purple-500", "bg-teal-500", "bg-rose-500", "bg-amber-500",
  "bg-indigo-500", "bg-lime-600", "bg-orange-500", "bg-cyan-600", "bg-pink-500",
];
const POSITION_COLORS = [
  "bg-yellow-400 dark:bg-yellow-500",
  "bg-slate-400 dark:bg-slate-400",
  "bg-orange-600 dark:bg-orange-500",
  "bg-gray-200 dark:bg-gray-600",
];
const POSITION_LABELS = ["1st", "2nd", "3rd", "4th+"];
const MUTED = "text-gray-500 dark:text-gray-400";

const pct = (rate: number | null) => (rate === null ? "–" : `${Math.round(rate * 100)}%`);
const winRate = (t: Tally) => (t.plays > 0 ? t.wins / t.plays : null);

// Folds finishing positions into 1st, 2nd, 3rd and 4th or worse
const bucketPositions = (positions: number[]) => [
  positions[0] ?? 0,
  positions[1] ?? 0,
  positions[2] ?? 0,
  positions.slice(3).reduce((s, n) => s + n, 0),
];

const averageFinish = (positions: number[]) => {
  const total = positions.reduce((s, n) => s + n, 0);
  if (total === 0) return null;
  return positions.reduce((s, n, i) => s + n * (i + 1), 0) / total;
};

const sumPositions = (tallies: Tally[]) => {
  const result: number[] = [];
  for (const t of tallies) {
    t.positions.forEach((n, i) => (result[i] = (result[i] ?? 0) + n));
  }
  return result;
};

// Most wins first, then the better win rate, then the most plays
const byWins = (a: Tally, b: Tally) =>
  b.wins - a.wins || (winRate(b) ?? 0) - (winRate(a) ?? 0) || b.plays - a.plays;

const PlayerAvatar = ({ name, color, size = "h-7 w-7 text-xs" }: { name: string; color: string; size?: string }) => (
  <span
    className={classNames("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", size, color)}
    aria-hidden="true"
  >
    {name.charAt(0).toUpperCase()}
  </span>
);

const PositionBar = ({ positions, height = "h-2" }: { positions: number[]; height?: string }) => {
  const buckets = bucketPositions(positions);
  const total = buckets.reduce((s, n) => s + n, 0);
  return (
    <div className={classNames("flex w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700", height)}>
      {total > 0 &&
        buckets.map((count, i) => (
          <div
            key={i}
            className={POSITION_COLORS[i]}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${POSITION_LABELS[i] ?? ""}: ${count}`}
          />
        ))}
    </div>
  );
};

const PositionLegend = () => (
  <div className={classNames("flex flex-wrap gap-x-3 gap-y-1 text-[11px]", MUTED)}>
    {POSITION_LABELS.map((label, i) => (
      <span key={label} className="flex items-center gap-1">
        <span className={classNames("h-2.5 w-2.5 rounded-sm", POSITION_COLORS[i])} />
        {label}
      </span>
    ))}
  </div>
);

const SectionHeader = ({ title, right }: { title: string; right?: React.ReactNode }) => (
  <div className="mb-3 flex items-baseline justify-between gap-2">
    <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
    {right && <span className={classNames("text-xs", MUTED)}>{right}</span>}
  </div>
);

const StatTile = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
  <Card className="p-3">
    <div className={classNames("text-xs", MUTED)}>{title}</div>
    <div className="truncate text-xl font-bold tabular-nums text-gray-900 dark:text-white">{value}</div>
    {subtitle && <div className={classNames("truncate text-xs", MUTED)}>{subtitle}</div>}
  </Card>
);

type PlayerSummary = Breakdown["players"][number] & { color: string; rate: number | null; avgFinish: number | null };

const Leaderboard: React.FC<{
  players: PlayerSummary[];
  selected: string | null;
  onSelect: (name: string) => void;
}> = ({ players, selected, onSelect }) => (
  <Card className="p-4">
    <SectionHeader title="Leaderboard" right="by win rate" />
    <ol className="space-y-1">
      {players.map((p, rank) => (
        <li key={p.name}>
          <button
            type="button"
            onClick={() => onSelect(p.name)}
            className={classNames(
              "flex w-full items-center gap-3 rounded-md p-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              selected === p.name
                ? "bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:ring-indigo-800"
                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
            )}
          >
            <span className={classNames("w-4 text-right text-xs font-semibold tabular-nums", MUTED)}>{rank + 1}</span>
            <PlayerAvatar name={p.name} color={p.color} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{p.name}</span>
                <span className={classNames("shrink-0 text-xs tabular-nums", MUTED)}>
                  <b className="font-semibold text-gray-900 dark:text-white">{pct(p.rate)}</b> wins · {p.plays} games
                </span>
              </span>
              <span className="mt-1 block">
                <PositionBar positions={p.positions} />
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
    <div className="mt-3">
      <PositionLegend />
    </div>
  </Card>
);

const PlayerSpotlight: React.FC<{
  player: PlayerSummary;
  rank: number;
  isYou: boolean;
  groupPositions: number[];
  games: BreakdownGame[];
  activeNames: Set<string>;
  bestGame?: BestGame;
  records: HighScore[];
  onOpenGame: (gameId: string) => void;
}> = ({ player, rank, isYou, groupPositions, games, activeNames, bestGame, records, onOpenGame }) => {
  const rows = games
    .map((game) => {
      const own = game.players.find((p) => p.name === player.name);
      if (!own) return null;
      const active = game.players.filter((p) => activeNames.has(p.name));
      const groupWins = active.reduce((s, p) => s + p.wins, 0);
      const groupPlays = active.reduce((s, p) => s + p.plays, 0);
      return { game, own, rate: winRate(own) ?? 0, groupRate: groupPlays > 0 ? groupWins / groupPlays : 0 };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.rate - a.rate || b.own.plays - a.own.plays);
  const neverPlayed = games.length - rows.length;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-5">
        <Card className="p-4 xl:col-span-3">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={player.name} color={player.color} size="h-12 w-12 text-lg" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold text-gray-900 dark:text-white">
                {player.name}
                {isYou && <span className={classNames("ml-1 text-xs font-normal", MUTED)}>(you)</span>}
              </div>
              <div className={classNames("text-xs", MUTED)}>#{rank} in the group</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["Win rate", pct(player.rate)],
              ["Games", player.plays],
              ["Avg finish", player.avgFinish?.toFixed(1) ?? "–"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{value}</div>
                <div className={classNames("text-xs", MUTED)}>{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={classNames("w-14 truncate text-xs", MUTED)}>{player.name}</span>
              <PositionBar positions={player.positions} height="h-3" />
            </div>
            <div className="flex items-center gap-2">
              <span className={classNames("w-14 text-xs", MUTED)}>Group</span>
              <PositionBar positions={groupPositions} height="h-3" />
            </div>
            <PositionLegend />
          </div>
        </Card>
  
        <div className="grid grid-cols-2 gap-3 xl:col-span-2 xl:grid-cols-1">
          <Card className="p-3">
            <div className={classNames("flex items-center gap-1.5 text-xs", MUTED)}>
              <StarIcon className="h-4 w-4 text-yellow-500" aria-hidden="true" />
              Best game
            </div>
            {bestGame ? (
              <>
                <div className="mt-1 truncate font-semibold text-gray-900 dark:text-white">{bestGame.bestGame}</div>
                <div className={classNames("text-xs", MUTED)}>
                  Avg finish {bestGame.avgPosition.toFixed(1)} · {bestGame.gamesPlayed} games
                </div>
              </>
            ) : (
              <div className={classNames("mt-1 text-sm", MUTED)}>Not enough games yet</div>
            )}
          </Card>
          <Card className="p-3">
            <div className={classNames("flex items-center gap-1.5 text-xs", MUTED)}>
              <TrophyIcon className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              High scores held
            </div>
            {records.length > 0 ? (
              records.slice(0, 3).map((r) => (
                <div key={r.gameName} className="mt-1 flex justify-between gap-2 text-sm">
                  <span className="truncate text-gray-900 dark:text-white">{r.gameName}</span>
                  <b className="tabular-nums text-gray-900 dark:text-white">{r.highScore}</b>
                </div>
              ))
            ) : (
              <div className={classNames("mt-1 text-sm", MUTED)}>None yet</div>
            )}
            {records.length > 3 && <div className={classNames("mt-1 text-xs", MUTED)}>+{records.length - 3} more</div>}
          </Card>
        </div>
      </div>

      <Card className="p-4">
        <SectionHeader
          title="Game by game"
          right={
            <span className="flex items-center gap-1">
              <span className="h-3 w-0.5 rounded bg-gray-900 dark:bg-white" />
              group avg
            </span>
          }
        />
        <ul className="sm:grid sm:grid-cols-2 sm:gap-x-8">
          {rows.map(({ game, own, rate, groupRate }) => {
            const few = own.plays < FEW_PLAYS;
            return (
              <li key={game.id} className="border-b border-gray-100 last:border-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-0 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={() => onOpenGame(game.id)}
                  className="block w-full py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-gray-900 dark:text-white">{game.name}</span>
                    <span className={classNames("shrink-0 text-xs tabular-nums", MUTED)}>
                      <b className="font-semibold text-gray-900 dark:text-white">{pct(rate)}</b> · {own.wins}/{own.plays}
                      {few && " · few plays"}
                    </span>
                  </span>
                  <span className="relative mt-1 block h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <span
                      className={classNames(
                        "block h-full rounded-full",
                        few ? "bg-indigo-300 dark:bg-indigo-800" : "bg-indigo-600 dark:bg-indigo-500"
                      )}
                      style={{ width: `${Math.max(2, rate * 100)}%` }}
                    />
                    <span
                      className="absolute -top-0.5 h-3 w-0.5 rounded bg-gray-900 dark:bg-white"
                      style={{ left: `${groupRate * 100}%` }}
                      title={`Group average ${pct(groupRate)}`}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {neverPlayed > 0 && (
          <p className={classNames("mt-2 text-xs", MUTED)}>
            {neverPlayed} {neverPlayed === 1 ? "game" : "games"} the group has played that {player.name} hasn&apos;t tried yet.
          </p>
        )}
      </Card>
    </div>
  );
};

const PODIUM_COLORS = [
  "bg-yellow-400 text-yellow-900",
  "bg-slate-300 text-slate-800",
  "bg-orange-600 text-white",
];

const GameCard: React.FC<{
  game: BreakdownGame;
  activeNames: Set<string>;
  colors: Map<string, string>;
  highScore?: HighScore;
  onOpen: () => void;
}> = ({ game, activeNames, colors, highScore, onOpen }) => {
  const podium = game.players.filter((p) => activeNames.has(p.name)).sort(byWins).slice(0, 3);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full rounded-lg bg-white p-4 text-left shadow transition hover:ring-2 hover:ring-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-800"
    >
      <div className="truncate font-semibold text-gray-900 dark:text-white">{game.name}</div>
      <div className={classNames("text-xs", MUTED)}>
        {game.sessions} {game.sessions === 1 ? "session" : "sessions"}
      </div>
      <ol className="mt-3 space-y-1.5">
        {podium.map((p, i) => (
          <li key={p.name} className="flex items-center gap-2 text-sm">
            <span
              className={classNames(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                PODIUM_COLORS[i]
              )}
            >
              {i + 1}
            </span>
            <PlayerAvatar name={p.name} color={colors.get(p.name) ?? "bg-gray-400"} size="h-6 w-6 text-[10px]" />
            <span className="min-w-0 flex-1 truncate text-gray-900 dark:text-white">{p.name}</span>
            <span className={classNames("text-xs tabular-nums", MUTED)}>
              <b className="font-semibold text-gray-900 dark:text-white">{p.wins}</b>/{p.plays} wins
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs dark:border-gray-700">
        {highScore ? (
          <>
            <span className={classNames("truncate", MUTED)}>High score · {highScore.playerName}</span>
            <b className="text-sm tabular-nums text-gray-900 dark:text-white">{highScore.highScore}</b>
          </>
        ) : (
          <span className={MUTED}>No scores recorded</span>
        )}
      </div>
    </button>
  );
};

const GameSheet: React.FC<{
  game: BreakdownGame | null;
  activeNames: Set<string>;
  colors: Map<string, string>;
  highScore?: HighScore;
  onClose: () => void;
  onSelectPlayer: (name: string) => void;
}> = ({ game, activeNames, colors, highScore, onClose, onSelectPlayer }) => {
  const standings = game ? game.players.filter((p) => activeNames.has(p.name)).sort(byWins) : [];
  const missing = game ? [...activeNames].filter((name) => !game.players.some((p) => p.name === name)) : [];

  return (
    <Transition appear show={game !== null} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-t-2xl bg-white p-4 pb-6 text-left shadow-xl transition-all sm:rounded-2xl sm:p-6 dark:bg-gray-800">
                {game && (
                  <>
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300 sm:hidden dark:bg-gray-600" />
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white">
                          {game.name}
                        </Dialog.Title>
                        <p className={classNames("text-sm", MUTED)}>
                          {game.sessions} {game.sessions === 1 ? "session" : "sessions"}
                          {highScore && ` · high score ${highScore.highScore} by ${highScore.playerName}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-gray-200"
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    <h4 className="mb-1 mt-4 text-sm font-semibold text-gray-900 dark:text-white">Standings</h4>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
                      {standings.map((p) => (
                        <li key={p.name}>
                          <button
                            type="button"
                            onClick={() => onSelectPlayer(p.name)}
                            className="block w-full py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <PlayerAvatar name={p.name} color={colors.get(p.name) ?? "bg-gray-400"} size="h-6 w-6 text-[10px]" />
                              <span className="flex-1 truncate text-gray-900 dark:text-white">{p.name}</span>
                              <span className={classNames("text-xs tabular-nums", MUTED)}>
                                <b className="font-semibold text-gray-900 dark:text-white">{pct(winRate(p))}</b> · {p.wins}/{p.plays} wins
                              </span>
                            </span>
                            <span className="ml-8 mt-1 block">
                              <PositionBar positions={p.positions} height="h-1.5" />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {missing.length > 0 && (
                      <p className={classNames("mt-2 text-xs", MUTED)}>Never played: {missing.join(", ")}</p>
                    )}
                    <div className="mt-3">
                      <PositionLegend />
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

type View = "players" | "games";
type GameSort = "played" | "name";

const Stats: React.FC<DashboardProps> = (props) => {
  const [view, setView] = useState<View>("players");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [openGameId, setOpenGameId] = useState<string | null>(null);
  const [gameSort, setGameSort] = useState<GameSort>("played");
  const [search, setSearch] = useState("");
  const [showAllGames, setShowAllGames] = useState(false);

  const { data: sessions, isLoading, isError } = api.session.getAllCompletedSessions.useQuery({
    data: { groupId: props.groupName },
  });
  const {
    data: breakdown,
    isLoading: breakdownLoading,
    isError: breakdownError,
  } = api.stats.getPlayerGameBreakdown.useQuery({ groupId: props.groupName });
  const { data: highScores, isLoading: highScoresLoading } = api.stats.getGameHighScores.useQuery({
    groupId: props.groupName,
  });
  const { data: bestGames, isLoading: bestGamesLoading } = api.stats.getBestGamePerPlayer.useQuery({
    groupId: props.groupName,
  });
  const { data: me } = api.player.getLogInPlayer.useQuery(undefined, { retry: false });

  const derived = useMemo(() => {
    if (!breakdown) return null;
    // Only players still in the group are shown, as before
    const active = breakdown.players.filter((p) => p.isActive);
    const activeNames = new Set(active.map((p) => p.name));
    const colors = new Map(
      [...active]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p, i) => [p.name, AVATAR_COLORS[i % AVATAR_COLORS.length] ?? "bg-gray-400"])
    );
    const ranked: PlayerSummary[] = active
      .map((p) => ({
        ...p,
        color: colors.get(p.name) ?? "bg-gray-400",
        rate: winRate(p),
        avgFinish: averageFinish(p.positions),
      }))
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0) || b.plays - a.plays);
    const games = breakdown.games.filter((g) => g.players.some((p) => activeNames.has(p.name)));
    const highScoreByGame = new Map(
      (highScores ?? []).filter((h) => h.isActivePlayer).map((h) => [h.gameName, h])
    );
    return { activeNames, colors, ranked, games, highScoreByGame, groupPositions: sumPositions(active) };
  }, [breakdown, highScores]);

  if (isLoading || breakdownLoading || highScoresLoading || bestGamesLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (isError || breakdownError || !sessions || !derived) {
    return <div className="text-center text-gray-500 dark:text-gray-400">No stats available.</div>;
  }

  const { activeNames, colors, ranked, games, highScoreByGame, groupPositions } = derived;
  const myName = me ? me.nickname ?? me.name : null;
  const spotlightName =
    selectedPlayer ?? (myName && activeNames.has(myName) ? myName : ranked[0]?.name ?? null);
  const spotlight = ranked.find((p) => p.name === spotlightName);
  const mostActive = [...ranked].sort((a, b) => b.plays - a.plays)[0];
  const mostPlayed = games[0];
  const openGame = games.find((g) => g.id === openGameId) ?? null;

  const query = search.trim().toLowerCase();
  const sortedGames = games
    .filter((g) => g.name.toLowerCase().includes(query))
    .sort((a, b) => (gameSort === "name" ? a.name.localeCompare(b.name) : b.sessions - a.sessions || a.name.localeCompare(b.name)));
  const visibleGames = showAllGames || query ? sortedGames : sortedGames.slice(0, GAMES_SHOWN);

  const selectPlayer = (name: string) => {
    setOpenGameId(null);
    setSelectedPlayer(name);
    setView("players");
  };

  const chip = (active: boolean) =>
    classNames(
      "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
      active
        ? "bg-indigo-600 text-white"
        : "bg-white text-gray-700 ring-1 ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600"
    );

  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stats</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile title="Sessions" value={sessions.length} />
        <StatTile title="Players" value={ranked.length} />
        {mostActive && <StatTile title="Most active" value={mostActive.name} subtitle={`${mostActive.plays} games`} />}
        {mostPlayed && <StatTile title="Most played" value={mostPlayed.name} subtitle={`${mostPlayed.sessions} sessions`} />}
      </div>

      <div className="flex rounded-lg bg-white p-1 shadow-sm sm:max-w-xs dark:bg-gray-800" role="tablist" aria-label="Stats view">
        {(
          [
            ["players", "Players"],
            ["games", "Games"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={classNames(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              view === key ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {ranked.length === 0 ? (
        <Card className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No finished games yet. Play a few to see stats here.
        </Card>
      ) : view === "players" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-4 lg:col-span-4">
            <Leaderboard players={ranked} selected={spotlightName} onSelect={setSelectedPlayer} />
          </div>
          <div className="min-w-0 space-y-3 lg:col-span-8">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:hidden">
              {ranked.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedPlayer(p.name)}
                  className={classNames("flex shrink-0 items-center gap-1.5 py-1 pl-1 pr-3", chip(p.name === spotlightName))}
                >
                  <PlayerAvatar name={p.name} color={p.color} size="h-5 w-5 text-[10px]" />
                  {p.name}
                </button>
              ))}
            </div>
            {spotlight && (
              <PlayerSpotlight
                player={spotlight}
                rank={ranked.indexOf(spotlight) + 1}
                isYou={spotlight.name === myName}
                groupPositions={groupPositions}
                games={games}
                activeNames={activeNames}
                bestGame={bestGames?.find((b) => b.playerName === spotlight.name)}
                records={[...highScoreByGame.values()].filter((h) => h.playerName === spotlight.name)}
                onOpenGame={setOpenGameId}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button type="button" className={chip(gameSort === "played")} onClick={() => setGameSort("played")}>
                Most played
              </button>
              <button type="button" className={chip(gameSort === "name")} onClick={() => setGameSort("name")}>
                A–Z
              </button>
            </div>
            <label className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 ring-1 ring-gray-300 sm:w-64 dark:bg-gray-800 dark:ring-gray-600">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span className="sr-only">Search games</span>
              <input
                id="stats-game-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games"
                className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleGames.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                activeNames={activeNames}
                colors={colors}
                highScore={highScoreByGame.get(g.name)}
                onOpen={() => setOpenGameId(g.id)}
              />
            ))}
          </div>
          {visibleGames.length === 0 && (
            <p className="px-1 text-sm text-gray-500 dark:text-gray-400">No games match &ldquo;{search}&rdquo;.</p>
          )}
          {!showAllGames && !query && sortedGames.length > GAMES_SHOWN && (
            <button
              type="button"
              onClick={() => setShowAllGames(true)}
              className="w-full rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300"
            >
              Show {sortedGames.length - GAMES_SHOWN} more games
            </button>
          )}
        </div>
      )}

      <GameSheet
        game={openGame}
        activeNames={activeNames}
        colors={colors}
        highScore={openGame ? highScoreByGame.get(openGame.name) : undefined}
        onClose={() => setOpenGameId(null)}
        onSelectPlayer={selectPlayer}
      />
    </div>
  );
};

export default Stats;
