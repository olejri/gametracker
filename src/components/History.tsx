import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import React, { Fragment, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { LoadingPage } from "npm/components/loading";
import { GameImage } from "npm/components/GameImage";
import { PlayerStack, WinnerChip, sessionResult } from "npm/components/SessionSummary";
import { classNames } from "npm/lib/utils";
import { BADGE_COLORS } from "npm/lib/constants";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, UserGroupIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type Option = { value: string; label: string };

const pill = "inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const pillIdle = "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";
const pillActive = "border-indigo-500 bg-indigo-50 text-indigo-800 dark:border-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-200";

// A pill that opens a list to pick one option; "" means no filter
const FilterMenu = ({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) => {
  const selected = options.find((o) => o.value === value);
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className={classNames(pill, selected ? pillActive : pillIdle)}>
          <span className="max-w-[9rem] truncate">{selected?.label ?? label}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-70" aria-hidden="true" />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute left-0 z-20 mt-1 max-h-72 w-56 overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600">
            {[{ value: "", label }, ...options].map((o) => (
              <Listbox.Option
                key={o.value || "all"}
                value={o.value}
                className={({ active }) => classNames(
                  "relative flex min-h-[40px] cursor-default select-none items-center py-2 pl-9 pr-3",
                  active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-white"
                )}
              >
                {({ selected: isSelected }) => (
                  <>
                    {isSelected && <CheckIcon className="absolute left-3 h-4 w-4" aria-hidden="true" />}
                    <span className={classNames("truncate", isSelected && "font-semibold")}>{o.label}</span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

const tag = "rounded px-1.5 py-px text-[11px] font-semibold";

const History = ({ groupName }: DashboardProps) => {
  const { data, isLoading, isError } = api.session.getAllCompletedSessions.useQuery({
    data: { groupId: groupName },
  });

  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [playerFilter, setPlayerFilter] = useState("");
  const [teamGamesOnly, setTeamGamesOnly] = useState(false);

  const sessions = useMemo(() => data ?? [], [data]);

  const gameOptions = useMemo(() => {
    const games = new Set<string>();
    sessions.forEach((session) => games.add(session.gameName));
    return Array.from(games).sort().map((name) => ({ value: name, label: name }));
  }, [sessions]);

  const playerOptions = useMemo(() => {
    const players = new Map<string, string>();
    sessions.forEach((session) => {
      session.players.forEach((player) => {
        if (!players.has(player.playerId)) {
          players.set(player.playerId, player.nickname || "Unnamed player");
        }
      });
    });
    return Array.from(players.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessions.filter((session) => {
      const gameMatches = !gameFilter || session.gameName === gameFilter;
      const playerMatches =
        !playerFilter || session.players.some((p) => p.playerId === playerFilter);
      const teamGameMatches = !teamGamesOnly || session.isTeamGame;
      const searchMatches = !query
        || session.gameName.toLowerCase().includes(query)
        || session.players.some((p) => p.nickname.toLowerCase().includes(query));
      return gameMatches && playerMatches && teamGameMatches && searchMatches;
    });
  }, [sessions, search, gameFilter, playerFilter, teamGamesOnly]);

  // Sessions come newest first, so months come out in order
  const months = useMemo(() => {
    const groups: { label: string; items: typeof filteredSessions }[] = [];
    filteredSessions.forEach((session) => {
      const label = dayjs(session.createdAt).format("MMMM YYYY");
      const last = groups[groups.length - 1];
      if (last?.label === label) last.items.push(session);
      else groups.push({ label, items: [session] });
    });
    return groups;
  }, [filteredSessions]);

  const hasFilters = !!(search || gameFilter || playerFilter || teamGamesOnly);
  const clearFilters = () => {
    setSearch("");
    setGameFilter("");
    setPlayerFilter("");
    setTeamGamesOnly(false);
  };

  if (isLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (isError) {
    return <div className="px-4 py-6 text-sm text-red-600 dark:text-red-400">Failed to load history.</div>;
  }

  const oldest = sessions[sessions.length - 1];

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {sessions.length} {sessions.length === 1 ? "game" : "games"} played
          {oldest && <span className="hidden sm:inline"> since {dayjs(oldest.createdAt).format("MMMM YYYY")}</span>}
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="py-6 text-sm text-gray-500 dark:text-gray-400">No sessions yet. Finished games show up here.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block sm:w-80">
              <span className="sr-only">Search games or players</span>
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games or players"
                className="h-11 w-full rounded-lg border-0 bg-white pl-10 pr-3 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:h-10 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:placeholder:text-gray-500"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <FilterMenu label="All players" value={playerFilter} options={playerOptions} onChange={setPlayerFilter} />
              <FilterMenu label="All games" value={gameFilter} options={gameOptions} onChange={setGameFilter} />
              <button
                type="button"
                aria-pressed={teamGamesOnly}
                onClick={() => setTeamGamesOnly((on) => !on)}
                className={classNames(pill, teamGamesOnly ? pillActive : pillIdle)}
              >
                <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                Team games
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center gap-1 rounded-full px-2 text-sm font-medium text-gray-500 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {months.length === 0 && (
            <p className="py-6 text-sm text-gray-500 dark:text-gray-400">No sessions match these filters.</p>
          )}

          <div className="space-y-6">
            {months.map((month) => (
              <section key={month.label}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {month.label}
                </h2>
                <ul
                  role="list"
                  className="-mx-4 divide-y divide-gray-200 border-y border-gray-200 bg-white sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800"
                >
                  {month.items.map((session) => {
                    const kind = sessionResult(session).kind;
                    const isCoop = kind === "everyone" || kind === "lost";
                    return (
                      <li key={session.sessionId}>
                        <Link
                          href={`/${groupName}/session/${session.sessionId}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 lg:grid lg:grid-cols-[3.5rem_minmax(0,1.2fr)_minmax(0,1.4fr)_9rem_4.5rem_1rem] lg:gap-4 lg:px-5 dark:hover:bg-gray-700/50"
                        >
                          <GameImage
                            className="h-12 w-12 text-sm lg:h-14 lg:w-14"
                            src={session.image_url}
                            name={session.gameName}
                            size={112}
                          />
                          {/* Phone: name and date over result and players. Desktop: the wrappers dissolve into grid cells */}
                          <div className="grid min-w-0 flex-1 gap-1.5 lg:contents">
                            <div className="flex min-w-0 items-center gap-2 lg:flex-col lg:items-start lg:gap-0.5">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <p className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                                  {session.gameName}
                                </p>
                                {session.isTeamGame && <span className={classNames(tag, BADGE_COLORS.blue)}>Team</span>}
                                {isCoop && <span className={classNames(tag, BADGE_COLORS.gray)}>Co-op</span>}
                              </div>
                              <p className="hidden w-full truncate text-sm text-gray-500 lg:block dark:text-gray-400">
                                {session.players.map((p) => p.nickname).filter(Boolean).join(", ")}
                              </p>
                              <span className="ml-auto whitespace-nowrap text-xs text-gray-500 lg:hidden dark:text-gray-400">
                                {dayjs(session.createdAt).format("D MMM")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 lg:contents">
                              <div className="min-w-0">
                                <WinnerChip session={session} />
                              </div>
                              <PlayerStack session={session} />
                            </div>
                          </div>
                          <span className="hidden text-right text-sm text-gray-500 lg:block dark:text-gray-400">
                            {dayjs(session.createdAt).format("D MMM")}
                          </span>
                          <ChevronRightIcon className="hidden h-5 w-5 text-gray-400 lg:block" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default History;
