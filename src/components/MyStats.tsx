import React, { useMemo } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import Badge from "npm/components/Badge";
import { Th } from "npm/components/Th";
import { classNames } from "npm/lib/utils";

type WinBadgeVariant = "green" | "yellow" | "red";

const tdBorder = "border-b border-gray-300";
const hiddenLgCell = "hidden px-3 py-4 text-sm text-gray-500 lg:table-cell";

const percentStr = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

const winVariant = (winPercentage: number): WinBadgeVariant => {
  if (winPercentage > 55) return "green";
  if (winPercentage > 35) return "yellow";
  return "red";
};

const winBadgeClass: Record<WinBadgeVariant, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-600",
  red: "bg-red-100 text-red-800",
};

const MyStats = ({ groupName }: { groupName: string }) => {
  const { data: myStats, isLoading, isError, error } = api.stats.getGameStatsForPlayer.useQuery({ groupName });
  const rows = useMemo(() => myStats ?? [], [myStats]);

  if (isLoading) return <LoadingPage />;
  if (isError) return <p className="px-4 py-2 text-sm text-red-600">{error?.message}</p>;

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <Th className="pl-4 pr-3 sm:pl-6 lg:pl-8">Game</Th>
                  <Th className="pl-4 pr-3 sm:pl-6 lg:pl-8">Number of games</Th>
                  <Th className="pl-4 pr-3 sm:pl-6 lg:pl-8">1st</Th>
                  <Th className="hidden px-3 lg:table-cell">2nd</Th>
                  <Th className="hidden px-3 lg:table-cell">3rd</Th>
                  <Th className="pl-4 pr-3 sm:pl-6 lg:pl-8">Win percentage</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((game, gameIdx) => {
                  const rowHasBorder = gameIdx !== rows.length - 1;
                  const winClass = winBadgeClass[winVariant(game.winPrecentage)];

                  return (
                    <tr key={game.gameName}>
                      <td
                        className={classNames(
                          rowHasBorder && tdBorder,
                          "w-6 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                        )}
                      >
                        {game.gameName}
                      </td>

                      <td
                        className={classNames(
                          rowHasBorder && tdBorder,
                          "w-6 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                        )}
                      >
                        {game.numberOfGamesPlayed}
                      </td>

                      <td
                        className={classNames(
                          rowHasBorder && tdBorder,
                          "w-6 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                        )}
                      >
                        {game.numberOfFirstPlaceWins}
                      </td>

                      <td className={classNames(rowHasBorder && tdBorder, hiddenLgCell)}>
                        {game.numberOfSecondPlaceWins}
                      </td>

                      <td className={classNames(rowHasBorder && tdBorder, hiddenLgCell)}>
                        {game.numberOfThirdPlaceWins}
                      </td>

                      <td
                        className={classNames(
                          rowHasBorder && tdBorder,
                          "w-6 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                        )}
                      >
                        <Badge className={classNames("px-2.5 py-0.5", winClass)} title={`${percentStr(game.winPrecentage)}`}>
                          {percentStr(game.winPrecentage)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStats;