import React from "react";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { classNames } from "npm/lib/utils";

dayjs.extend(relativeTime);

const RecentlyActivities = (props: {
  groupName: string;
}) => {
  const groupId = props.groupName;
  const { data: lastFive, isLoading, isError, error } = api.session.getLastFiveCompletedSessions.useQuery({ groupId });

  if (isLoading) return (
    <div className="flex justify-center items-center">
      <LoadingSpinner size={60} />
    </div>
  );
  if (isError) return <p className="text-gray-900 dark:text-white">{error?.message}</p>;

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {lastFive.map((game, eventIdx) => (
          <li key={game.sessionId}>
            <Link href={`/`+groupId+`/session/${game.sessionId}`}>
              <div className="relative pb-8">
                {eventIdx !== lastFive.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                  <span
                    className={classNames(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800"
                    )}
                  >
                    <Image className="mx-auto sm:h-auto sm:w-52 flex-shrink-0 rounded-full" src={game.image_url} alt=""
                           width={200}
                           height={200} priority={true} />
                  </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {game.gameName}{" "}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {dayjs(game.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default RecentlyActivities;