import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ArrowPathIcon,
  CheckIcon,
  ClockIcon,
  PlayIcon,
  PlusIcon,
  ScaleIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import type { RouterOutputs } from "npm/utils/api";
import { Button, Card, CardContent, StatusBadge } from "npm/components/ui";
import { LoadingSpinner } from "npm/components/loading";
import BggRatingBadge from "npm/components/BggRatingBadge";
import PoweredByBgg from "npm/components/PoweredByBgg";
import { classNames } from "npm/lib/utils";

type ShelfGame = RouterOutputs["whatToPlay"]["shelf"][number];
type Mode = "shelf" | "bgg";

const TIMES = [
  { label: "Any", min: null, max: null },
  { label: "Under 30 min", min: null, max: 30 },
  { label: "30–60 min", min: 30, max: 60 },
  { label: "1–2 h", min: 60, max: 120 },
  { label: "2 h+", min: 120, max: null }
] as const;

// BGG's weight scale runs from 1 (light) to 5 (heavy)
const WEIGHTS = [
  { label: "Any", min: null, max: null },
  { label: "Light", min: null, max: 2 },
  { label: "Medium", min: 2, max: 3 },
  { label: "Heavy", min: 3, max: null }
] as const;

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 12;

const weightColor = (weight: number) => (weight < 2 ? "green" : weight < 3 ? "yellow" : "red");

const WeightBadge = ({ weight }: { weight: number | null }) =>
  weight == null ? null : (
    <StatusBadge color={weightColor(weight)} className="whitespace-nowrap text-xs">
      Weight {weight.toFixed(1)}
    </StatusBadge>
  );

const rangeText = (min: number | null, max: number | null, unit: string) => {
  if (min == null && max == null) return null;
  if (min == null || max == null || min === max) return `${min ?? max ?? ""} ${unit}`;
  return `${min}–${max} ${unit}`;
};

const lastPlayedText = (lastPlayed: Date | null) => {
  if (!lastPlayed) return "Never played in this group";
  const days = Math.floor((Date.now() - new Date(lastPlayed).getTime()) / 86_400_000);
  if (days < 1) return "Played today";
  if (days < 14) return `Played ${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 60) return `Played ${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `Played ${Math.round(days / 30)} months ago`;
  return "Played over a year ago";
};

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={classNames(
      "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500",
      active
        ? "bg-indigo-600 text-white"
        : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
    )}
  >
    {children}
  </button>
);

const FilterRow = ({ icon: Icon, label, children }: { icon: typeof UsersIcon; label: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </div>
    {children}
  </div>
);

// The game's picture, or its initials when it has none or the picture fails to load
const GameCover = ({ name, imageUrl, className }: { name: string; imageUrl: string | null; className: string }) => {
  const [failed, setFailed] = useState(false);
  return imageUrl && !failed ? (
    <Image src={imageUrl} alt="" width={160} height={160} onError={() => setFailed(true)}
           className={classNames("shrink-0 rounded-md bg-gray-100 object-cover dark:bg-gray-700", className)} />
  ) : (
    <span className={classNames("flex shrink-0 items-center justify-center rounded-md bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300", className)}>
      {name.split(/[\s:]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}
    </span>
  );
};

function matchesShelf(game: ShelfGame, players: number, time: number, weight: number) {
  if (game.minPlayers != null && game.maxPlayers != null && (players < game.minPlayers || players > game.maxPlayers)) return false;
  const t = TIMES[time];
  if (t && (t.min != null || t.max != null)) {
    if (game.minPlaytime == null || game.maxPlaytime == null) return false;
    if (t.max != null && game.minPlaytime > t.max) return false;
    if (t.min != null && game.maxPlaytime < t.min) return false;
  }
  const w = WEIGHTS[weight];
  if (w && (w.min != null || w.max != null)) {
    if (game.bggWeight == null) return false;
    if (w.min != null && game.bggWeight < w.min) return false;
    if (w.max != null && game.bggWeight >= w.max) return false;
  }
  return true;
}

const pickRandom = <T,>(items: T[], not?: T) => {
  const pool = items.length > 1 ? items.filter((i) => i !== not) : items;
  return pool[Math.floor(Math.random() * pool.length)];
};

function ShelfResults({ games, groupName }: { games: ShelfGame[]; groupName: string }) {
  const router = useRouter();
  const [pickId, setPickId] = useState<string | null>(null);

  // A new random pick whenever the filters drop the current one
  useEffect(() => {
    if (!games.some((g) => g.id === pickId)) setPickId(pickRandom(games)?.id ?? null);
  }, [games, pickId]);

  const pick = games.find((g) => g.id === pickId);
  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">No games on the shelf match</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try more time or &quot;Any&quot; complexity, or look for something new on BGG.
          </p>
        </CardContent>
      </Card>
    );
  }
  if (!pick) return null;

  const players = rangeText(pick.minPlayers, pick.maxPlayers, "players");
  const playtime = rangeText(pick.minPlaytime, pick.maxPlaytime, "min");
  const others = games.filter((g) => g.id !== pick.id).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex gap-4">
            <GameCover name={pick.name} imageUrl={pick.imageUrl || null} className="h-20 w-20 text-2xl sm:h-28 sm:w-28" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Tonight&apos;s pick</p>
              <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-white">{pick.name}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <BggRatingBadge bggId={pick.bggId} bggAverage={pick.bggAverage} bggRank={pick.bggRank} className="text-xs" />
                <WeightBadge weight={pick.bggWeight} />
              </div>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-300">
            {players && <div className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />{players}</div>}
            {playtime && <div className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />{playtime}</div>}
            <div className="text-gray-500 sm:col-span-2 dark:text-gray-400">
              {pick.owners.join(", ")}&apos;s copy · {lastPlayedText(pick.lastPlayed)}
            </div>
          </dl>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" className="justify-center gap-1.5" disabled={games.length < 2}
                    onClick={() => setPickId(pickRandom(games, pick)?.id ?? null)}>
              <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
              Roll again
            </Button>
            <Button variant="success" className="justify-center gap-1.5"
                    onClick={() => void router.push(`/${groupName}/session/create?gameId=${pick.id}`)}>
              <PlayIcon className="h-5 w-5" aria-hidden="true" />
              Play this
            </Button>
          </div>
        </CardContent>
      </Card>

      {others.length > 0 && (
        <Card>
          <CardContent className="py-4 sm:py-4">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              {games.length} games match
            </h3>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {others.map((game) => (
                <li key={game.id}>
                  <button type="button" onClick={() => setPickId(game.id)}
                          className="flex w-full items-center gap-3 rounded-md py-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-700/50">
                    <GameCover name={game.name} imageUrl={game.imageUrl || null} className="h-9 w-9 text-xs" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">{game.name}</span>
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                        {[rangeText(game.minPlaytime, game.maxPlaytime, "min"), game.owners.join(", ")].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <WeightBadge weight={game.bggWeight} />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BggResults({ groupName, players, time, weight }: { groupName: string; players: number; time: number; weight: number }) {
  const [roll, setRoll] = useState(0);
  const [added, setAdded] = useState<Record<number, boolean>>({});
  const ctx = api.useContext();
  const t = TIMES[time] ?? TIMES[0];
  const w = WEIGHTS[weight] ?? WEIGHTS[0];
  const { data, isLoading, isFetching, error } = api.whatToPlay.suggestions.useQuery(
    { groupId: groupName, players, minPlaytime: t.min, maxPlaytime: t.max, minWeight: w.min, maxWeight: w.max, roll },
    { keepPreviousData: true, refetchOnWindowFocus: false }
  );
  const add = api.whatToPlay.addToMyCollection.useMutation({
    onSuccess: (_, { bggId }) => {
      setAdded((prev) => ({ ...prev, [bggId]: true }));
      void ctx.whatToPlay.shelf.invalidate();
      void ctx.game.getAllGames.invalidate();
    }
  });

  if (isLoading) return <div className="flex justify-center py-10"><LoadingSpinner size={40} /></div>;
  if (error) return <p className="text-center text-sm text-red-600 dark:text-red-400">{error.message}</p>;
  if (!data || data.games.length === 0) {
    return (
      <Card>
        <CardContent className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">No BGG games match</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try &quot;Any&quot; for time or complexity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={classNames("space-y-3", isFetching && "opacity-60")}>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        5 of {data.total} top BGG games that nobody in the group owns
      </p>
      {data.games.map((game) => {
        const isAdded = added[game.bggId];
        const isAdding = add.isLoading && add.variables?.bggId === game.bggId;
        return (
          <Card key={game.bggId}>
            <div className="flex gap-3 p-4">
              <GameCover name={game.name} imageUrl={game.thumbnail} className="h-16 w-16 text-lg" />
              <div className="min-w-0 flex-1">
                <a href={`https://boardgamegeek.com/boardgame/${game.bggId}`} target="_blank" rel="noopener noreferrer"
                   className="font-semibold leading-tight text-gray-900 hover:underline dark:text-white">
                  {game.name}
                </a>
                {game.year && <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({game.year})</span>}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <BggRatingBadge bggId={game.bggId} bggAverage={game.average} bggRank={game.rank} className="text-xs" />
                  <WeightBadge weight={game.weight} />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {[rangeText(game.minPlayers, game.maxPlayers, "players"), rangeText(game.minPlaytime, game.maxPlaytime, "min")].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{game.reason}</p>
                <div className="mt-3">
                  {isAdded ? (
                    <StatusBadge color="green" className="gap-1 text-xs">
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      Added to your collection
                    </StatusBadge>
                  ) : (
                    <Button variant="primary" className="gap-1.5 px-3 py-1.5" disabled={isAdding}
                            onClick={() => add.mutate({ bggId: game.bggId })}>
                      {isAdding ? <LoadingSpinner size={16} /> : <PlusIcon className="h-4 w-4" aria-hidden="true" />}
                      Add to my collection
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      {add.error && <p className="text-sm text-red-600 dark:text-red-400">{add.error.message}</p>}
      <div className="flex flex-col items-center gap-4 pt-1 sm:flex-row sm:justify-between">
        <Button variant="secondary" className="gap-1.5" disabled={isFetching} onClick={() => setRoll((r) => r + 1)}>
          <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
          Show 5 others
        </Button>
        <PoweredByBgg label="Suggestions" />
      </div>
    </div>
  );
}

export default function WhatToPlay({ groupName }: { groupName: string }) {
  const [mode, setMode] = useState<Mode>("shelf");
  const [players, setPlayers] = useState(4);
  const [time, setTime] = useState(0);
  const [weight, setWeight] = useState(0);
  const { data: shelf, isLoading } = api.whatToPlay.shelf.useQuery({ groupId: groupName }, { enabled: !!groupName });

  const matching = useMemo(
    () => (shelf ?? []).filter((g) => matchesShelf(g, players, time, weight)),
    [shelf, players, time, weight]
  );

  const toggle = (
    <div className="flex rounded-lg bg-gray-200 p-1 dark:bg-gray-800" role="group" aria-label="Where to look">
      {([["shelf", "Our shelf"], ["bgg", "New from BGG"]] as const).map(([value, label]) => (
        <button key={value} type="button" onClick={() => setMode(value)} aria-pressed={mode === value}
                className={classNames(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500",
                  mode === value ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white" : "text-gray-600 dark:text-gray-300"
                )}>
          {label}
        </button>
      ))}
    </div>
  );

  const stepperButton = "h-10 w-10 rounded-md bg-gray-100 text-lg font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-40 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">What to play?</h1>
        <div className="sm:w-80">{toggle}</div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="self-start">
          <CardContent className="space-y-4">
            <FilterRow icon={UsersIcon} label="Players">
              <div className="flex items-center gap-3">
                <button type="button" className={stepperButton} aria-label="Fewer players"
                        disabled={players <= MIN_PLAYERS} onClick={() => setPlayers((p) => p - 1)}>−</button>
                <span className="w-8 text-center text-2xl font-bold tabular-nums text-gray-900 dark:text-white" aria-live="polite">{players}</span>
                <button type="button" className={stepperButton} aria-label="More players"
                        disabled={players >= MAX_PLAYERS} onClick={() => setPlayers((p) => p + 1)}>+</button>
              </div>
            </FilterRow>
            <FilterRow icon={ClockIcon} label="Time">
              <div className="flex flex-wrap gap-2">
                {TIMES.map((t, i) => <Chip key={t.label} active={time === i} onClick={() => setTime(i)}>{t.label}</Chip>)}
              </div>
            </FilterRow>
            <FilterRow icon={ScaleIcon} label="Complexity">
              <div className="flex flex-wrap gap-2">
                {WEIGHTS.map((w, i) => <Chip key={w.label} active={weight === i} onClick={() => setWeight(i)}>{w.label}</Chip>)}
              </div>
            </FilterRow>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          {mode === "shelf" ? (
            isLoading ? <div className="flex justify-center py-10"><LoadingSpinner size={40} /></div>
              : <ShelfResults games={matching} groupName={groupName} />
          ) : (
            <BggResults groupName={groupName} players={players} time={time} weight={weight} />
          )}
        </div>
      </div>
    </div>
  );
}
