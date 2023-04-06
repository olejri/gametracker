import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import Image from "next/image";
import dayjs from "dayjs";

const RecentlyActivities = (props: {
  groupName: string;
}) => {
  const groupId = props.groupName;
  const { data: lastFive, isLoading, isError, error } = api.session.getLastFiveCompletedSessions.useQuery({ groupId });

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }


  if (isLoading) return <LoadingPage />;
  if (isError) return <p>{error?.message}</p>;

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {lastFive.map((game, eventIdx) => (
          <li key={game.sessionId}>
            <div className="relative pb-8">
              {eventIdx !== lastFive.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                    )}
                  >
                    <Image className="mx-auto sm:h-auto sm:w-52 flex-shrink-0 rounded-full" src={game.image_url} alt="" width={200}
                           height={200} priority={true} />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {game.gameName}{" "}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {dayjs(game.createdAt).format("DD.MM.YYYY")}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default RecentlyActivities;