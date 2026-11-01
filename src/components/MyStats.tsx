import React, { useMemo, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { useUser } from "@clerk/nextjs";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import { api, type RouterOutputs } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { classNames } from "npm/lib/utils";
import { STARTER_PLAYS } from "npm/server/helpers/profileStats";

type ProfileStats = RouterOutputs["stats"]["getProfileStats"];
type ProfileGame = ProfileStats["games"][number];

const panel = "rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900";
const heading = "mb-3 flex items-baseline justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";
const headingNote = "text-xs font-medium normal-case tracking-normal text-indigo-600 dark:text-indigo-300";
const track = "relative h-2 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800";
const tick = "absolute -top-1 -bottom-1 w-0.5 rounded bg-gray-900/50 dark:bg-white/60";

const PLACES = [
  { label: "1st", className: "bg-yellow-500 dark:bg-amber-400" },
  { label: "2nd", className: "bg-slate-400 dark:bg-slate-300" },
  { label: "3rd", className: "bg-amber-700 dark:bg-orange-400/80" },
  { label: "Other", className: "bg-gray-300 dark:bg-gray-600" },
];

const pct = (n: number) => `${Math.round(n)}%`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const Avatar = ({ name, imageUrl }: { name: string; imageUrl?: string }) =>
  imageUrl ? (
    <Image src={imageUrl} alt={name} width={56} height={56} className="h-14 w-14 flex-none rounded-full border-2 border-white/60" />
  ) : (
    <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-xl font-bold">
      {name.charAt(0).toUpperCase()}
    </span>
  );

const PlayerCard = ({ stats, imageUrl }: { stats: ProfileStats; imageUrl?: string }) => {
  const { level } = stats;
  const progress = level.xpForNextLevel > 0 ? (level.xpIntoLevel / level.xpForNextLevel) * 100 : 0;
  const tiles = [
    { label: "Plays", value: stats.plays },
    { label: "Wins", value: stats.wins },
    { label: "Win %", value: pct(stats.winPct) },
    { label: "Podium", value: pct(stats.podiumPct) },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-700 to-indigo-900 p-4 text-white shadow sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-[22px] border-white/10" aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={stats.playerName} imageUrl={imageUrl} />
          <div className="min-w-0">
            <div className="truncate text-base font-bold">{stats.playerName}</div>
            <div className="truncate text-xs text-white/80">
              {stats.groupName}
              {stats.since && ` · since ${dayjs(stats.since).format("MMM YYYY")}`}
            </div>
          </div>
        </div>
        <span className="flex-none rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">Lvl {level.level}</span>
      </div>

      <div className="relative mt-3 text-2xl font-extrabold leading-tight">{stats.archetype.title}</div>
      <p className="relative mt-1 max-w-md text-sm text-white/85">{stats.archetype.reason}</p>

      <dl className="relative mt-4 grid grid-cols-4 gap-2 border-t border-white/20 pt-3">
        {tiles.map((t) => (
          <div key={t.label}>
            <dt className="text-[10px] uppercase tracking-wider text-white/75">{t.label}</dt>
            <dd className="text-lg font-bold tabular-nums">{t.value}</dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-3">
        <div className="flex justify-between gap-2 text-xs text-white/90">
          <span className="tabular-nums">{level.xpIntoLevel} / {level.xpForNextLevel} XP to Lvl {level.level + 1}</span>
          {stats.lastGameXp !== null && <span className="tabular-nums">+{stats.lastGameXp} XP last game</span>}
        </div>
        <div
          className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-label="XP to next level"
          aria-valuemin={0}
          aria-valuemax={level.xpForNextLevel}
          aria-valuenow={level.xpIntoLevel}
        >
          <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const FairShare = ({ fairShare }: { fairShare: NonNullable<ProfileStats["fairShare"]> }) => {
  const { actualPct, fairPct, diffPts } = fairShare;
  const above = diffPts >= 0;
  return (
    <div className={panel}>
      <h3 className={heading}>Skill vs. fair share</h3>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="flex-none">
          <div className={classNames("text-2xl font-extrabold leading-none tabular-nums", above ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
            {above ? "+" : "−"}{Math.abs(diffPts)} pts
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{above ? "above" : "below"} fair share</div>
        </div>
        <div className="min-w-[11rem] flex-1">
          <div className={classNames(track, "h-3")}>
            <div className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400" style={{ width: `${Math.min(100, actualPct)}%` }} />
            <div className={tick} style={{ left: `${Math.min(99.5, fairPct)}%` }} />
          </div>
          <div className="mt-1 flex justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>You win {pct(actualPct)}</span>
            <span>Fair share {pct(fairPct)}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Fair share is what you would win by pure luck, given how many players or teams were at each table. Co-op games are left out.
      </p>
    </div>
  );
};

const SignatureGames = ({ signature }: { signature: ProfileStats["signature"] }) => {
  const tiles = [
    signature.comfort && {
      label: "Comfort game",
      game: signature.comfort,
      detail: plural(signature.comfort.plays, "play"),
      tone: "text-gray-500 dark:text-gray-400",
    },
    signature.best && {
      label: "Best game",
      game: signature.best,
      detail: `${pct(signature.best.winPct)} wins`,
      tone: "text-green-600 dark:text-green-400",
    },
    signature.kryptonite && {
      label: "Kryptonite",
      game: signature.kryptonite,
      detail: `${plural(signature.kryptonite.first, "win")} in ${signature.kryptonite.plays}`,
      tone: "text-red-600 dark:text-red-400",
    },
  ].filter(Boolean) as { label: string; game: ProfileGame; detail: string; tone: string }[];

  if (tiles.length === 0) return null;
  return (
    <div className={panel}>
      <h3 className={heading}>Signature games</h3>
      <div className="grid gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.label}</span>
              <span className={classNames("flex-none text-xs", t.tone)}>{t.detail}</span>
            </div>
            <div className="text-sm font-bold leading-snug text-gray-900 dark:text-white">{t.game.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WhereYouShine = ({ mechanics, overall }: { mechanics: ProfileStats["mechanics"]; overall: number }) => (
  <div className={panel}>
    <h3 className={heading}>
      Where you shine <span className={headingNote}>from BGG mechanics</span>
    </h3>
    <ul className="grid gap-3">
      {mechanics.map((m) => {
        const above = m.winPct >= overall;
        return (
          <li key={m.name} className="grid gap-1">
            <div className="flex justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-semibold text-gray-900 dark:text-white">{m.name}</span>
              <span className="flex-none tabular-nums text-gray-500 dark:text-gray-400">
                {plural(m.plays, "play")} ·{" "}
                <b className={above ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{pct(m.winPct)}</b>
              </span>
            </div>
            <div className={track}>
              <div
                className={classNames("h-full rounded-full", above ? "bg-green-500 dark:bg-green-400" : "bg-red-500 dark:bg-red-400")}
                style={{ width: `${m.winPct}%` }}
              />
              <div className={tick} style={{ left: `${Math.min(99.5, overall)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Line = your overall win rate ({pct(overall)}).</p>
  </div>
);

const SHOW_FIRST = 6;

const EveryGame = ({ games }: { games: ProfileGame[] }) => {
  const [sortBy, setSortBy] = useState<"plays" | "win">("plays");
  const [showAll, setShowAll] = useState(false);
  const sorted = useMemo(
    () => (sortBy === "plays" ? games : [...games].sort((a, b) => b.winPct - a.winPct || b.plays - a.plays)),
    [games, sortBy],
  );
  const visible = showAll ? sorted : sorted.slice(0, SHOW_FIRST);

  return (
    <div className={panel}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Every game</h3>
        <div className="flex rounded-full border border-gray-200 p-0.5 text-xs font-semibold dark:border-gray-700" role="group" aria-label="Sort games">
          {([["plays", "Most played"], ["win", "Win %"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(key)}
              aria-pressed={sortBy === key}
              className={classNames(
                "rounded-full px-3 py-1",
                sortBy === key
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
        {PLACES.map((p) => (
          <span key={p.label} className="inline-flex items-center gap-1">
            <i className={classNames("inline-block h-2 w-2 rounded-sm", p.className)} aria-hidden="true" />
            {p.label}
          </span>
        ))}
      </div>

      <ul className="grid gap-3 lg:grid-cols-2 lg:gap-x-8">
        {visible.map((g) => {
          const other = g.plays - g.first - g.second - g.third;
          const parts = [g.first, g.second, g.third, other];
          return (
            <li key={g.id} className="grid gap-1">
              <div className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-semibold text-gray-900 dark:text-white">{g.name}</span>
                <span className="flex-none tabular-nums text-gray-500 dark:text-gray-400">
                  {plural(g.plays, "play")} · <b className="text-gray-900 dark:text-white">{pct(g.winPct)}</b>
                </span>
              </div>
              <div
                className="flex h-2 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600"
                title={`1st ${g.first} · 2nd ${g.second} · 3rd ${g.third} · other ${other}`}
              >
                {parts.map((n, i) =>
                  n > 0 ? <i key={i} className={classNames("block h-full", PLACES[i]?.className)} style={{ width: `${(n / g.plays) * 100}%` }} /> : null,
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {games.length > SHOW_FIRST && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 w-full rounded-md py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
        >
          {showAll ? "Show fewer" : `Show all ${games.length} games`}
        </button>
      )}
    </div>
  );
};

const MyStats = ({ groupName }: { groupName: string }) => {
  const { user } = useUser();
  const { data: stats, isLoading, isError, error } = api.stats.getProfileStats.useQuery({ groupName });

  if (isLoading) return <LoadingPage />;
  if (isError) return <p className="px-4 py-2 text-sm text-red-600 dark:text-red-400">{error?.message}</p>;

  if (stats.plays === 0) {
    return (
      <div className={classNames(panel, "mx-2 py-10 text-center sm:mx-0")}>
        <ChartPieIcon className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">No finished games yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Finish a game in {stats.groupName} and your player card shows up here.
        </p>
      </div>
    );
  }

  const isStarter = stats.plays < STARTER_PLAYS;
  const showMechanics = stats.mechanics.length > 0;
  const fairShare = !isStarter && stats.fairShare ? <FairShare fairShare={stats.fairShare} /> : null;
  const signature = !isStarter ? <SignatureGames signature={stats.signature} /> : null;

  return (
    <div className="grid gap-3 px-2 sm:px-0 lg:gap-4">
      <div className={classNames("grid items-start gap-3 lg:gap-4", showMechanics ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
        {showMechanics ? (
          <>
            <div className="grid gap-3 lg:col-span-2 lg:gap-4">
              <PlayerCard stats={stats} imageUrl={user?.imageUrl} />
              <div className="grid items-start gap-3 md:grid-cols-2 lg:gap-4">
                {fairShare}
                {signature}
              </div>
            </div>
            <WhereYouShine mechanics={stats.mechanics} overall={stats.winPct} />
          </>
        ) : (
          <>
            <PlayerCard stats={stats} imageUrl={user?.imageUrl} />
            <div className="grid gap-3 lg:gap-4">
              {fairShare}
              {signature}
            </div>
          </>
        )}
      </div>
      <EveryGame games={stats.games} />
    </div>
  );
};

export default MyStats;
