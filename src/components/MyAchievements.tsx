import React, { useState, Fragment, useEffect, useMemo } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import {
  SparklesIcon,
  TrophyIcon,
  StarIcon,
  XMarkIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { classNames, formatDate } from "npm/lib/utils";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { Card, StatusBadge } from "npm/components/ui";
import type { AchievementTypeCounter } from "npm/components/Types";

const TIERS = ["bronze", "silver", "gold", "platinum"] as const;

const MILESTONE_CATEGORIES = ["generalist", "specialist", "mechanic_explorer"];

const getTierColor = (tier: string) => {
  switch (tier) {
    case "bronze":
      return "from-amber-600 to-amber-800 dark:from-amber-700 dark:to-amber-900";
    case "silver":
      return "from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700";
    case "gold":
      return "from-yellow-500 to-yellow-700 dark:from-yellow-600 dark:to-yellow-800";
    case "platinum":
      return "from-cyan-500 to-blue-700 dark:from-cyan-600 dark:to-blue-800";
    default:
      return "from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700";
  }
};

// Stroke color of the progress ring, by the tier being worked towards
const getTierStroke = (tier: string) => {
  switch (tier) {
    case "bronze":
      return "stroke-amber-600 dark:stroke-amber-500";
    case "silver":
      return "stroke-slate-400";
    case "gold":
      return "stroke-yellow-500 dark:stroke-yellow-400";
    default:
      return "stroke-cyan-500 dark:stroke-cyan-400";
  }
};

const getIcon = (iconType: string) => {
  switch (iconType) {
    case "trophy":
      return TrophyIcon;
    case "star":
      return StarIcon;
    case "puzzle":
      return PuzzlePieceIcon;
    default:
      return SparklesIcon;
  }
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "Acting Bronze" -> "Acting", "Deck Builder Apprentice" -> "Deck Builder"
const stripTierWord = (name: string) =>
  name.replace(/\s+(Bronze|Silver|Gold|Platinum|Apprentice|Journeyman|Expert|Master)$/i, "");

// All tiers of one achievement share a single progress counter
type AchievementGroup = {
  key: string;
  title: string;
  isMilestone: boolean;
  iconType: string;
  tiers: AchievementTypeCounter[];
  progress: number;
  earned: number;
  topTier: AchievementTypeCounter | null;
  nextTier: AchievementTypeCounter | null;
  toNext: number;
  // Progress within the current tier step, 0-100
  stepPercent: number;
};

const buildGroups = (achievements: AchievementTypeCounter[]): AchievementGroup[] => {
  const byKey = new Map<string, AchievementTypeCounter[]>();
  for (const achievement of achievements) {
    const list = byKey.get(achievement.groupKey) ?? [];
    list.push(achievement);
    byKey.set(achievement.groupKey, list);
  }

  return Array.from(byKey.entries()).map(([key, list]) => {
    const tiers = [...list].sort((a, b) => (a.tierOrder || 0) - (b.tierOrder || 0));
    const progress = Math.max(...tiers.map((t) => t.progress));
    const earnedTiers = tiers.filter((t) => t.fulfilled);
    const nextTier = tiers.find((t) => !t.fulfilled) ?? null;
    const topTier = earnedTiers[earnedTiers.length - 1] ?? null;
    const previousGoal = topTier?.goal ?? 0;
    const stepPercent = nextTier
      ? Math.max(0, Math.min(100, ((progress - previousGoal) / (nextTier.goal - previousGoal)) * 100))
      : 100;

    return {
      key,
      title: stripTierWord(tiers[0]?.name ?? key),
      isMilestone: MILESTONE_CATEGORIES.includes(tiers[0]?.category ?? ""),
      iconType: tiers[0]?.iconType ?? "",
      tiers,
      progress,
      earned: earnedTiers.length,
      topTier,
      nextTier,
      toNext: nextTier ? Math.max(0, nextTier.goal - progress) : 0,
      stepPercent,
    };
  });
};

// Started first, then closest to the next tier, then by name
const byClosest = (a: AchievementGroup, b: AchievementGroup) => {
  if ((a.progress > 0) !== (b.progress > 0)) return a.progress > 0 ? -1 : 1;
  if (!a.nextTier || !b.nextTier) return a.nextTier ? -1 : b.nextTier ? 1 : a.title.localeCompare(b.title);
  const diff = a.toNext / a.nextTier.goal - b.toNext / b.nextTier.goal;
  return diff !== 0 ? diff : a.title.localeCompare(b.title);
};

const Medal = ({ group, className }: { group: AchievementGroup; className: string }) => {
  const Icon = getIcon(group.iconType);
  return (
    <span
      className={classNames(
        "flex shrink-0 items-center justify-center rounded-full",
        group.topTier
          ? `bg-gradient-to-br text-white shadow ${getTierColor(group.topTier.tier)}`
          : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500",
        className
      )}
    >
      <Icon className="h-1/2 w-1/2" />
    </span>
  );
};

// Medal with a ring that fills towards the next tier
const RingMedal = ({ group }: { group: AchievementGroup }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const Icon = getIcon(group.iconType);
  return (
    <span className="relative block h-16 w-16 shrink-0">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="6" className="stroke-gray-200 dark:stroke-gray-700" />
        {group.progress > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - group.stepPercent / 100)}
            className={getTierStroke(group.nextTier?.tier ?? "platinum")}
          />
        )}
      </svg>
      <span
        className={classNames(
          "absolute inset-[9%] flex items-center justify-center rounded-full",
          group.topTier
            ? `bg-gradient-to-br text-white ${getTierColor(group.topTier.tier)}`
            : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
        )}
      >
        <Icon className="h-2/5 w-2/5" />
      </span>
    </span>
  );
};

const TierDots = ({ group }: { group: AchievementGroup }) => (
  <span className="flex shrink-0 gap-1" aria-label={`${group.earned} of ${group.tiers.length} tiers`}>
    {group.tiers.map((tier) => (
      <span
        key={tier.id}
        className={classNames(
          "h-2.5 w-2.5 rounded-full",
          tier.fulfilled ? `bg-gradient-to-br ${getTierColor(tier.tier)}` : "bg-gray-200 dark:bg-gray-600"
        )}
      />
    ))}
  </span>
);

const ProgressBar = ({ percent, className = "h-2" }: { percent: number; className?: string }) => (
  <div className={classNames("w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600", className)}>
    <div className="h-full bg-indigo-600 transition-all dark:bg-indigo-500" style={{ width: `${percent}%` }} />
  </div>
);

const MyAchievements = ({ groupName }: { groupName: string }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [search, setSearch] = useState("");

  const {
    data: achievements,
    isLoading,
    isError,
    error,
    refetch,
  } = api.player.getAchievements.useQuery({ gameGroup: groupName });

  const calculateMutation = api.player.calculateAchievements.useMutation({
    onSuccess: () => {
      setIsCalculating(false);
      void refetch();
    },
    onError: (error) => {
      console.error('Achievement calculation failed:', error);
      setIsCalculating(false);
    },
  });

  // Trigger async calculation in background on mount
  useEffect(() => {
    if (achievements && !isCalculating) {
      setIsCalculating(true);
      calculateMutation.mutate({ gameGroup: groupName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(
    () => buildGroups((achievements ?? []) as AchievementTypeCounter[]).sort(byClosest),
    [achievements]
  );

  if (isLoading) return <LoadingPage />;
  if (isError) return <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">Something went wrong: {error?.message}</div>;
  if (!achievements?.length) return <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">No achievements yet.</div>;

  const all = achievements as AchievementTypeCounter[];
  const totalPoints = all.filter((a) => a.fulfilled).reduce((sum, a) => sum + a.points, 0);
  const maxPoints = all.reduce((sum, a) => sum + a.points, 0);
  const totalUnlocked = all.filter((a) => a.fulfilled).length;
  const tierCounts = TIERS.map((tier) => all.filter((a) => a.fulfilled && a.tier === tier).length);

  const almostThere = groups
    .flatMap((group) => (group.progress > 0 && group.nextTier ? [{ group, next: group.nextTier }] : []))
    .slice(0, 3);
  const recentlyUnlocked = all
    .flatMap((achievement) =>
      achievement.fulfilled && achievement.unlockedAt ? [{ achievement, unlockedAt: new Date(achievement.unlockedAt) }] : []
    )
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 5);

  const query = search.trim().toLowerCase();
  const matches = (g: AchievementGroup) => !query || g.title.toLowerCase().includes(query);
  const milestones = groups.filter((g) => g.isMilestone && matches(g));
  const mechanics = groups.filter((g) => !g.isMilestone && matches(g));

  const selected = groups.find((g) => g.key === selectedKey) ?? null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Points and tier tally */}
      <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 text-white shadow sm:p-6 dark:from-indigo-700 dark:to-indigo-900">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm text-indigo-100">Achievement points</h2>
            <div className="whitespace-nowrap text-4xl font-bold tabular-nums">
              {totalPoints} <span className="text-base font-medium text-indigo-200">/ {maxPoints}</span>
            </div>
          </div>
          <div className="text-right text-sm text-indigo-100">
            {totalUnlocked} of {all.length} unlocked
            {almostThere[0] && (
              <span className="block">
                Next: {almostThere[0].group.title} {capitalize(almostThere[0].next.tier)}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {TIERS.map((tier, i) => (
            <div key={tier} className="rounded-md bg-white/10 px-2 py-1.5 text-center">
              <div className={classNames("mx-auto h-3 w-3 rounded-full bg-gradient-to-br ring-1 ring-white/50", getTierColor(tier))} />
              <div className="mt-1 text-sm font-semibold tabular-nums">{tierCounts[i]}</div>
              <div className="text-[11px] capitalize text-indigo-100">{tier}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Closest to unlocking */}
      <section>
        <h3 className="mb-2 px-1 font-semibold text-gray-900 dark:text-white">Almost there</h3>
        {almostThere.length ? (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {almostThere.map(({ group, next }) => (
              <button
                key={group.key}
                type="button"
                onClick={() => setSelectedKey(group.key)}
                className="w-60 shrink-0 rounded-lg bg-white p-4 text-left shadow transition hover:ring-2 hover:ring-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:w-auto dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Medal group={group} className="h-11 w-11" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-900 dark:text-white">
                      {group.title} {capitalize(next.tier)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">+{next.points} pts</div>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">{group.toNext}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">to go</span>
                </div>
                <ProgressBar percent={(group.progress / next.goal) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
                  {group.progress} / {next.goal}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-sm text-gray-500 dark:text-gray-400">
            Win a game to start working on your first achievement.
          </Card>
        )}
      </section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Recent unlocks */}
        {recentlyUnlocked.length > 0 && (
          <Card className="h-fit p-4 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recently unlocked</h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentlyUnlocked.map(({ achievement, unlockedAt }) => {
                const Icon = getIcon(achievement.iconType);
                return (
                  <li key={achievement.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(achievement.groupKey)}
                      className="flex w-full items-center gap-3 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <span className={classNames("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white", getTierColor(achievement.tier))}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">{achievement.name}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{formatDate(unlockedAt)}</span>
                      </span>
                      <StatusBadge color="green">+{achievement.points}</StatusBadge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {/* Full catalogue */}
        <section className={classNames("space-y-3", recentlyUnlocked.length > 0 ? "lg:col-span-3" : "lg:col-span-5")}>
          <h3 className="px-1 font-semibold text-gray-900 dark:text-white">Browse all</h3>
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-600 dark:border-gray-600 dark:bg-gray-800">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search achievements"
              className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
            />
          </label>
          {[
            { title: "Milestones", list: milestones, defaultOpen: true },
            { title: "Mechanics", list: mechanics, defaultOpen: false },
          ].map(({ title, list, defaultOpen }) =>
            list.length === 0 ? null : (
              // Re-mount while searching so matching groups open up
              <Disclosure key={`${title}-${query ? "search" : "browse"}`} defaultOpen={defaultOpen || !!query}>
                {({ open }) => (
                  <Card>
                    <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {title} <span className="font-normal text-gray-500 dark:text-gray-400">({list.length})</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {list.filter((g) => g.progress > 0).length} started
                        <ChevronDownIcon className={classNames("h-4 w-4 transition", open && "rotate-180")} />
                      </span>
                    </Disclosure.Button>
                    <Disclosure.Panel as="ul" className="divide-y divide-gray-100 border-t border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                      {list.map((group) => (
                        <li key={group.key}>
                          <button
                            type="button"
                            onClick={() => setSelectedKey(group.key)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 dark:hover:bg-gray-700/50 dark:focus-visible:bg-gray-700/50"
                          >
                            <span className={classNames("min-w-0 flex-1 truncate text-sm", group.progress > 0 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400")}>
                              {group.title}
                            </span>
                            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                              {group.nextTier ? `${group.progress}/${group.nextTier.goal}` : "Done"}
                            </span>
                            <TierDots group={group} />
                          </button>
                        </li>
                      ))}
                    </Disclosure.Panel>
                  </Card>
                )}
              </Disclosure>
            )
          )}
          {milestones.length === 0 && mechanics.length === 0 && (
            <p className="px-1 text-sm text-gray-500 dark:text-gray-400">No achievements match &ldquo;{search}&rdquo;.</p>
          )}
        </section>
      </div>

      {/* Achievement details: bottom sheet on phones, dialog on larger screens */}
      <Transition appear show={selected !== null} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setSelectedKey(null)}>
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
                  {selected && (
                    <>
                      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300 sm:hidden dark:bg-gray-600" />
                      <div className="flex items-start gap-3">
                        <RingMedal group={selected} />
                        <div className="min-w-0 flex-1">
                          <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white">
                            {selected.title}
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(selected.nextTier ?? selected.topTier)?.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-500 dark:hover:text-gray-400"
                          onClick={() => setSelectedKey(null)}
                        >
                          <span className="sr-only">Close</span>
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>

                      <ol className="mt-4 space-y-1">
                        {selected.tiers.map((tier) => {
                          const isCurrent = tier.id === selected.nextTier?.id;
                          return (
                            <li
                              key={tier.id}
                              className={classNames(
                                "flex items-center gap-3 rounded-lg p-2",
                                isCurrent && "bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:ring-indigo-800"
                              )}
                            >
                              <span
                                className={classNames(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                  tier.fulfilled
                                    ? `bg-gradient-to-br text-white ${getTierColor(tier.tier)}`
                                    : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                                )}
                              >
                                {tier.fulfilled ? <CheckIcon className="h-5 w-5" /> : <span className="text-xs font-semibold tabular-nums">{tier.goal}</span>}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium capitalize text-gray-900 dark:text-white">
                                  {tier.tier} · {tier.goal}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  {tier.fulfilled
                                    ? tier.unlockedAt
                                      ? `Unlocked ${formatDate(new Date(tier.unlockedAt))}`
                                      : "Unlocked"
                                    : isCurrent
                                      ? `${selected.progress} of ${tier.goal}, ${selected.toNext} to go`
                                      : "Locked"}
                                </span>
                                {isCurrent && <ProgressBar percent={selected.stepPercent} className="mt-1.5 h-1.5" />}
                              </span>
                              <span className="shrink-0 text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">+{tier.points}</span>
                            </li>
                          );
                        })}
                      </ol>

                      <AchievementMetadata achievement={selected.tiers[0]} />
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

// Extra context the rule engine stores for the milestone achievements
const AchievementMetadata = ({ achievement }: { achievement?: AchievementTypeCounter }) => {
  const metadata = achievement?.metadata as { gameName?: string; games?: string[]; mechanics?: string[] } | null | undefined;
  if (!achievement || !metadata) return null;

  let label: string | null = null;
  let value: string | null = null;
  if (achievement.category === "specialist" && metadata.gameName) {
    label = "Game";
    value = metadata.gameName;
  } else if (achievement.category === "generalist" && metadata.games?.length) {
    label = "Games Played";
    value = metadata.games.slice(0, 10).join(", ") + (metadata.games.length > 10 ? ` +${metadata.games.length - 10} more` : "");
  } else if (achievement.category === "mechanic_explorer" && metadata.mechanics?.length) {
    label = "Unique Mechanics Won";
    value = metadata.mechanics.slice(0, 15).join(", ") + (metadata.mechanics.length > 15 ? ` +${metadata.mechanics.length - 15} more` : "");
  }
  if (!label) return null;

  return (
    <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

export default MyAchievements;
