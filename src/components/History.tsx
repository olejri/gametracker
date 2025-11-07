import { type DashboardProps } from "npm/components/Types";
import { sortPlayers } from "npm/components/HelperFunctions";
import { api } from "npm/utils/api";
import React, { useMemo } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { LoadingPage } from "npm/components/loading";
import Avatar from "npm/components/Avatar";
import Badge from "npm/components/Badge";
import { Th } from "npm/components/Th";
import { classNames } from "npm/lib/utils";

const tdBorder = "border-b border-gray-300";
const hiddenLgCell = "hidden px-3 py-4 text-sm text-gray-500 lg:table-cell";

const History = ({ groupName }: DashboardProps) => {
  const { data, isLoading, isError } = api.session.getAllCompletedSessions.useQuery({
    data: { groupId: groupName },
  });

  const sessions = data ?? [];

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex grow">
          <LoadingPage />
        </div>
      );
    }

    if (isError) {
      return <div className="px-4 py-6 text-sm text-red-600">Failed to load history.</div>;
    }

    if (!sessions.length) {
      return <div className="px-4 py-6 text-sm text-gray-600">No completed sessions yet.</div>;
    }

    return (
      <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
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
              {sessions.map((game, gameIdx) => {
                const href = `/${groupName}/session/${game.sessionId}`;
                const rowHasBorder = gameIdx !== sessions.length - 1;
                const playersSorted = sortPlayers(game.players);

                return (
                  <tr key={game.sessionId}>
                    <td
                      className={classNames(
                        rowHasBorder && tdBorder,
                        "w-6 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                      )}
                    >
                      <Link href={href} className="block h-full w-full">
                        {game.gameName}
                      </Link>
                    </td>

                    <td
                      className={classNames(
                        rowHasBorder && tdBorder,
                        "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                      )}
                    >
                      <Link href={href} className="block h-full w-full">
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <Avatar
                            avatars={playersSorted.map((p) => ({
                              id: p.playerId,
                              src: p.profileImageUrl,
                              alt: p.nickname ?? p.playerId,
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
                        "w-6 px-3 py-4 text-sm text-gray-500",
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
  }, [groupName, isError, isLoading, sessions]);

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <div className="mt-8 flow-root">{content}</div>
    </div>
  );
};

export default History;
