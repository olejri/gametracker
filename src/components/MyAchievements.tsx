import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Badge from "npm/components/Badge";
import { classNames } from "npm/lib/utils";

const MyAchievements = ({ groupName }: { groupName: string }) => {
  const {
    data: achievements,
    isLoading,
    isError,
    error,
  } = api.player.calculateAchievements.useQuery({ gameGroup: groupName });

  if (isLoading) return <LoadingPage />;
  if (isError) return <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">Something went wrong: {error?.message}</div>;
  if (!achievements?.length) return <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">No achievements yet.</div>;

  const fulfilledAchievements = achievements.filter((a) => a.fulfilled);
  const notFulfilledAchievements = achievements.filter((a) => !a.fulfilled);

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900 dark:bg-gray-900 dark:text-white">
            Completed achievements
          </span>
        </div>
      </div>

      <div>
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {fulfilledAchievements.map((achievement) => {
            const iconCls = classNames(
              "mx-auto sm:h-auto sm:w-30 flex-shrink-0",
              achievement.fulfilled ? "text-yellow-500 dark:text-yellow-400" : "text-gray-400",
            );
            return (
              <li
                key={achievement.achievementNumber}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-500 text-center shadow-none dark:divide-gray-700 dark:bg-gray-700"
              >
                <div className="flex flex-1 flex-col p-8">
                  <SparklesIcon className={iconCls} />
                  <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">{achievement.name}</h3>
                  <dd className="text-sm text-black dark:text-gray-200">{achievement.description}</dd>
                  <dd className="text-sm text-black dark:text-gray-200">
                    <Badge className="bg-white/70 text-gray-900 dark:bg-gray-800/70 dark:text-white">{achievement.score}</Badge>
                    <span className="px-1">of</span>
                    <Badge className="bg-white/70 text-gray-900 dark:bg-gray-800/70 dark:text-white">{achievement.goal}</Badge>
                  </dd>
                  {achievement.gameName && (
                    <dd className="text-sm dark:text-gray-200">
                      Most wins: <span className="font-bold">{achievement.gameName}</span>
                    </dd>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900 dark:bg-gray-900 dark:text-white">
            Uncompleted achievements
          </span>
        </div>
      </div>

      <div>
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notFulfilledAchievements.map((achievement) => (
            <li
              key={achievement.achievementNumber}
              className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-300 text-center shadow-none dark:divide-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-1 flex-col p-8">
                <SparklesIcon className={classNames(
                  achievement.fulfilled ? "mx-auto sm:h-auto sm:w-30 flex-shrink-0 text-yellow-600 dark:text-yellow-400" : "mx-auto sm:h-auto sm:w-30 flex-shrink-0 text-gray-400")
                } />
                <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">{achievement.name}</h3>
                <dd className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</dd>
                <dd className="text-sm text-gray-500 dark:text-gray-400">{achievement.score} of {achievement.goal}</dd>
                {achievement.gameName && (<dd className="text-sm dark:text-gray-300">Most wins: <span className="font-bold">{achievement.gameName}</span></dd>)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyAchievements;