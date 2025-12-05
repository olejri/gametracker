import { type DashboardProps } from "npm/components/Types";
import { sortPlayers } from "npm/components/HelperFunctions";
import { api } from "npm/utils/api";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { LoadingPage } from "npm/components/loading";
import Avatar from "npm/components/Avatar";
import Badge from "npm/components/Badge";
import { Th } from "npm/components/Th";
import { classNames } from "npm/lib/utils";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid";

const tdBorder = "border-b border-gray-300 dark:border-gray-700";
const hiddenLgCell = "hidden px-3 py-4 text-sm text-gray-500 lg:table-cell dark:text-gray-400";

const History = ({ groupName }: DashboardProps) => {
  const { data, isLoading, isError } = api.session.getAllCompletedSessions.useQuery({
    data: { groupId: groupName },
  });

  const [gameFilter, setGameFilter] = useState("");
  const [playerFilter, setPlayerFilter] = useState("");
  const [gameQuery, setGameQuery] = useState("");
  const [playerQuery, setPlayerQuery] = useState("");

  const sessions = data ?? [];

  // Extract unique game names and players from sessions
  const uniqueGames = useMemo(() => {
    const games = new Set<string>();
    sessions.forEach((session) => games.add(session.gameName));
    return Array.from(games).sort();
  }, [sessions]);

  const uniquePlayers = useMemo(() => {
    const players = new Map<string, string>();
    sessions.forEach((session) => {
      session.players.forEach((player) => {
        if (!players.has(player.playerId)) {
          players.set(player.playerId, player.nickname || player.playerId);
        }
      });
    });
    return Array.from(players.entries())
      .map(([id, nickname]) => ({ id, nickname }))
      .sort((a, b) => a.nickname.localeCompare(b.nickname));
  }, [sessions]);

  // Filter games based on query
  const filteredGames = useMemo(() => {
    return uniqueGames.filter((game) =>
      game.toLowerCase().includes(gameQuery.toLowerCase())
    );
  }, [uniqueGames, gameQuery]);

  // Filter players based on query
  const filteredPlayers = useMemo(() => {
    return uniquePlayers.filter((player) =>
      player.nickname.toLowerCase().includes(playerQuery.toLowerCase())
    );
  }, [uniquePlayers, playerQuery]);

  // Apply filters to sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const gameMatches = !gameFilter || session.gameName === gameFilter;
      const playerMatches =
        !playerFilter || session.players.some((p) => p.playerId === playerFilter);
      return gameMatches && playerMatches;
    });
  }, [sessions, gameFilter, playerFilter]);

  const content = useMemo(() => {
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

    if (!sessions.length) {
      return <div className="px-4 py-6 text-sm text-gray-600 dark:text-gray-400">No completed sessions yet.</div>;
    }

    if (!filteredSessions.length) {
      return (
        <div className="px-4 py-6 text-sm text-gray-600 dark:text-gray-400">
          No sessions match the current filters.
        </div>
      );
    }

    return (
      <div className="relative -my-2 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <Th className="pl-4 pr-3 sm:pl-6 lg:pl-8">Game</Th>
                <Th className="pl-4 pr-3 sm:pl-6 lg:pl-8">Players</Th>
                <Th className="hidden px-3 lg:table-cell">Position</Th>
                <Th className="hidden px-3 lg:table-cell">Score</Th>
                <Th className="pl-4 pr-3 sm:pl-6 lg:pl-8">Date</Th>
                <Th className="hidden px-3 lg:table-cell">Location</Th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((game, gameIdx) => {
                const href = `/${groupName}/session/${game.sessionId}`;
                const rowHasBorder = gameIdx !== filteredSessions.length - 1;
                const playersSorted = sortPlayers(game.players);

                return (
                  <tr 
                    key={game.sessionId}
                    className={classNames(
                      game.isTeamGame && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <td
                      className={classNames(
                        rowHasBorder && tdBorder,
                        "w-6 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8 dark:text-white",
                        game.isTeamGame && "border-l-4 border-l-blue-500",
                      )}
                    >
                      <Link href={href} className="block h-full w-full">
                        <span className="flex items-center gap-2">
                          {game.gameName}
                          {game.isTeamGame && (
                            <span className="inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              Team
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>

                    <td
                      className={classNames(
                        rowHasBorder && tdBorder,
                        "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8 dark:text-white",
                      )}
                    >
                      <Link href={href} className="block h-full w-full">
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <Avatar
                            avatars={playersSorted.map((p) => ({
                              id: p.playerId,
                              src: p.profileImageUrl,
                              alt: p.nickname ?? p.playerId,
                              position: p.position,
                            }))}
                            rankedSizing
                          />
                        </div>
                      </Link>
                    </td>

                    <td className={classNames(rowHasBorder && tdBorder, hiddenLgCell)}>
                      <Link href={href} className="block h-full w-full">
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <div className="flex flex-wrap gap-2">
                            {playersSorted.map((player) => (
                              <Badge key={player.playerId} className="h-6 min-w-[1.5rem]">
                                {player.position}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className={classNames(rowHasBorder && tdBorder, hiddenLgCell)}>
                      <Link href={href} className="block h-full w-full">
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <div className="flex flex-wrap gap-2">
                            {playersSorted.map((player) => (
                              <Badge key={player.playerId} className="h-6 min-w-[1.5rem]">
                                {player.score}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td
                      className={classNames(
                        rowHasBorder && tdBorder,
                        "w-6 px-3 py-4 text-sm text-gray-500 dark:text-gray-400",
                      )}
                    >
                      <Link href={href} className="block h-full w-full">
                        {dayjs(game.createdAt).format("DD.MM.YYYY")}
                      </Link>
                    </td>

                    <td className={classNames(rowHasBorder && tdBorder, hiddenLgCell)}>
                      <Link href={href} className="block h-full w-full">
                        {"???"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [groupName, isError, isLoading, filteredSessions, sessions.length]);

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <div className="mt-8 flow-root">
        {/* Filter Controls */}
        {sessions.length > 0 && (
          <div className="relative z-20 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Game Filter */}
            <Combobox
              as="div"
              value={gameFilter}
              onChange={(value: string) => {
                setGameFilter(value);
                setGameQuery("");
              }}
            >
              <Combobox.Label className="block text-sm font-medium text-gray-900 dark:text-white">
                Filter by Game
              </Combobox.Label>
              <div className="relative mt-2">
                <Combobox.Input
                  className="w-full rounded-md border-0 bg-white py-2 pl-3 pr-20 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-600"
                  onChange={(event) => setGameQuery(event.target.value)}
                  displayValue={(gameName: string) => gameName}
                  placeholder="Search games..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  {gameFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setGameFilter("");
                        setGameQuery("");
                      }}
                      className="mr-1 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </button>
                  )}
                  <Combobox.Button className="rounded-r-md px-2 focus:outline-none">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                </div>

                {filteredGames.length > 0 && (
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-800 dark:ring-gray-600">
                    {filteredGames.map((game) => (
                      <Combobox.Option
                        key={game}
                        value={game}
                        className={({ active }) =>
                          classNames(
                            "relative cursor-default select-none py-2 pl-3 pr-9",
                            active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-white"
                          )
                        }
                      >
                        {({ selected }) => (
                          <span
                            className={classNames(
                              "block truncate",
                              selected && "font-semibold"
                            )}
                          >
                            {game}
                          </span>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>

            {/* Player Filter */}
            <Combobox
              as="div"
              value={playerFilter}
              onChange={(value: string) => {
                setPlayerFilter(value);
                setPlayerQuery("");
              }}
            >
              <Combobox.Label className="block text-sm font-medium text-gray-900 dark:text-white">
                Filter by Player
              </Combobox.Label>
              <div className="relative mt-2">
                <Combobox.Input
                  className="w-full rounded-md border-0 bg-white py-2 pl-3 pr-20 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-600"
                  onChange={(event) => setPlayerQuery(event.target.value)}
                  displayValue={(playerId: string) => {
                    const player = uniquePlayers.find((p) => p.id === playerId);
                    return player ? player.nickname : "";
                  }}
                  placeholder="Search players..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  {playerFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlayerFilter("");
                        setPlayerQuery("");
                      }}
                      className="mr-1 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </button>
                  )}
                  <Combobox.Button className="rounded-r-md px-2 focus:outline-none">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                </div>

                {filteredPlayers.length > 0 && (
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-800 dark:ring-gray-600">
                    {filteredPlayers.map((player) => (
                      <Combobox.Option
                        key={player.id}
                        value={player.id}
                        className={({ active }) =>
                          classNames(
                            "relative cursor-default select-none py-2 pl-3 pr-9",
                            active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-white"
                          )
                        }
                      >
                        {({ selected }) => (
                          <span
                            className={classNames(
                              "block truncate",
                              selected && "font-semibold"
                            )}
                          >
                            {player.nickname}
                          </span>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>
          </div>
        )}
        {content}
      </div>
    </div>
  );
};

export default History;
