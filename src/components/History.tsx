import { type DashboardProps, type PlayerNicknameAndScore } from "npm/components/Types";
import { api } from "npm/utils/api";
import React from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { LoadingPage } from "npm/components/loading";

const History = (props: DashboardProps) => {
  const { data, isLoading } = api.session.getAllCompletedSessions.useQuery({
    data: {
      groupId: props.groupName
    }
  });

  if (isLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (!data) return <div>Something went wrong</div>;

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  function sortPlayers(players: PlayerNicknameAndScore[]) {
    return players.sort((a, b) => {
      if (a.position > b.position) {
        return 1;
      }
      if (a.position < b.position) {
        return -1;
      }
      return 0;
    });
  }

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                >
                  Game
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                >
                  Players
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                >
                  Position
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                >
                  Score
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                >
                  Location
                </th>
              </tr>
              </thead>
              <tbody>
              {data.map((game, gameIdx) => (
                <tr key={game.sessionId}>
                  <td
                    className={classNames(
                      gameIdx !== data.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                    )}
                  >
                    <Link href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                      {game.gameName}
                    </Link>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== data.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                    )}
                  >
                    <Link href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex -space-x-1 overflow-hidden">
                          {sortPlayers(game.players).map((player) => (
                            <img
                              key={player.playerId}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                              src={player.profileImageUrl}
                              alt={player.nickname ?? player.playerId}
                            />
                          ))}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== data.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                    )}
                  >
                    <Link href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex -space-x-1 overflow-hidden">
                          {sortPlayers(game.players).map((player) => (
                            <p
                              key={player.playerId}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                            >{player.position}</p>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== data.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                    )}
                  >
                    <Link href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex -space-x-1 overflow-visible">
                          {sortPlayers(game.players).map((player) => (
                            <p
                              key={player.playerId}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                            >{player.score}</p>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== data.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    )}
                  >
                    <Link href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                      {dayjs(game.updatedAt).format("DD.MM.YYYY")}
                    </Link>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== data.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                    )}
                  >
                    <Link href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                      {"???"}
                    </Link>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
