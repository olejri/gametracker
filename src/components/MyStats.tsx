import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

const MyStats = (props: {
  groupName: string;
}) => {
  const groupName = props.groupName;
  const { data: myStats, isLoading, isError, error } = api.stats.getGameStatsForPlayer.useQuery({groupName});

  if (isLoading) return <LoadingPage />;
  if (isError) return <p>{error?.message}</p>;

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  function getColorBasedOnWinPercentage(winPercentage: number): JSX.Element {
    console.log(winPercentage)
    if (winPercentage > 55) {
      return (
        <span
          className={"inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium bg-green-100 text-green-800"}>
      {(Math.round(winPercentage * 100) / 100).toFixed(2)}
      </span>);
    }
    else if (winPercentage > 50) {
      return (
        <span
          className={"inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium bg-yellow-100 text-yellow-500"}>
      {(Math.round(winPercentage * 100) / 100).toFixed(2)}
      </span>);
    }
    else if (winPercentage > 35) {
      return (
        <span
          className={"inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium bg-yellow-100 text-yellow-500"}>
      {(Math.round(winPercentage * 100) / 100).toFixed(2)}
      </span>);
    }
    return (
      <span
        className={"inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium bg-red-100 text-red-800"}>
      {(Math.round(winPercentage * 100) / 100).toFixed(2)}
      </span>);
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
                  Number of games
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                >
                  1st
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                >
                  2nd
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                >
                  3rd
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                >
                  Win percentage
                </th>
              </tr>
              </thead>
              <tbody>
              {myStats.map((game, gameIdx) => (
                <tr key={game.gameName}>
                  <td
                    className={classNames(
                      gameIdx !== myStats.length - 1 ? "border-b border-gray-300" : "",
                      "w-6 py-4 pl-4 pr-3 text-sm font-smale text-gray-900 sm:pl-6 lg:pl-8"
                    )}
                  >
                    {game.gameName}
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== myStats.length - 1 ? "border-b border-gray-300" : "",
                      "w-6 py-4 pl-4 pr-3 text-sm font-smale text-gray-900 sm:pl-6 lg:pl-8"
                    )}
                  >
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex -space-x-1 overflow-hidden">
                        {game.numberOfGamesPlayed}
                      </div>
                    </div>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== myStats.length - 1 ? "border-b border-gray-300" : "",
                      "w-6 py-4 pl-4 pr-3 text-sm font-smale text-gray-900 sm:pl-6 lg:pl-8"
                    )}
                  >
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex -space-x-1 overflow-hidden">
                        {game.numberOfFirstPlaceWins}
                      </div>
                    </div>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== myStats.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                    )}
                  >
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex -space-x-1 overflow-visible">
                        {game.numberOfSecondPlaceWins}
                      </div>
                    </div>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== myStats.length - 1 ? "border-b border-gray-300" : "",
                      "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                    )}
                  >
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex -space-x-1 overflow-visible">
                        {game.numberOfThirdPlaceWins}
                      </div>
                    </div>
                  </td>
                  <td
                    className={classNames(
                      gameIdx !== myStats.length - 1 ? "border-b border-gray-300" : "",
                      "w-6 py-4 pl-4 pr-3 text-sm font-smale text-gray-900 sm:pl-6 lg:pl-8"
                    )}
                  >
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex -space-x-1 overflow-visible">
                        {getColorBasedOnWinPercentage(game.winPrecentage)}
                      </div>
                    </div>
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
export default MyStats;