import React from "react";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";
import { GameImage } from "npm/components/GameImage";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { classNames } from "npm/lib/utils";
import { PlayerStack, WinnerChip } from "npm/components/SessionSummary";

dayjs.extend(relativeTime);

const RecentlyActivities = (props: {
  groupName: string;
}) => {
  const groupId = props.groupName;
  const { data: lastFive, isLoading, isError, error } = api.session.getLastFiveCompletedSessions.useQuery({ groupId });

  if (isLoading) return (
    <div className="flex items-center justify-center py-6">
      <LoadingSpinner size={60} />
    </div>
  );
  if (isError) return <p className="p-4 text-gray-900 dark:text-white">{error?.message}</p>;
  if (lastFive.length === 0) return (
    <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No sessions yet. Start a new game to see it here.</p>
  );

  return (
    <ul role="list" className="grid grid-cols-1 lg:grid-cols-2">
      {lastFive.map((game, idx) => (
        <li
          key={game.sessionId}
          className={classNames(
            "border-gray-200 dark:border-gray-700",
            idx > 0 && "border-t",
            idx === 1 && "lg:border-t-0",
            idx % 2 === 0 && "lg:border-r",
            // A lone last item on desktop spans both columns
            idx === lastFive.length - 1 && idx % 2 === 0 && "lg:col-span-2 lg:border-r-0"
          )}
        >
          <Link
            href={`/${groupId}/session/${game.sessionId}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:px-5 dark:hover:bg-gray-700/50"
          >
            <GameImage
              className="h-12 w-12 text-sm sm:h-14 sm:w-14"
              src={game.image_url}
              name={game.gameName}
              size={112}
              priority={idx < 2}
            />
            <div className="grid min-w-0 flex-1 gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                  {game.gameName}
                </p>
                <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {dayjs(game.createdAt).fromNow()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <WinnerChip session={game} />
                </div>
                <PlayerStack session={game} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};
export default RecentlyActivities;
