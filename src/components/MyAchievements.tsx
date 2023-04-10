import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { SparklesIcon } from "@heroicons/react/24/outline";


const MyAchievements = (props: {
  groupName: string;
}) => {
  const groupName = props.groupName;
  const {
    data: achievements,
    isLoading,
    isError,
    error
  } = api.player.calculateAchievements.useQuery({ gameGroup: groupName });

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <div>Something went wrong: {error?.message}</div>;
  }

  const fulfilledAchievements = achievements.filter((achievement) => achievement.fulfilled);
  const notFulfilledAchievements = achievements.filter((achievement) => !achievement.fulfilled);

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">Completed achievements</span>
        </div>
      </div>
      <div>
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {fulfilledAchievements.map((achievement) => (
            <li
              key={achievement.achievementNumber}
              className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-500 text-center shadow-none"
            >
              <div className="flex flex-1 flex-col p-8">
                <SparklesIcon className={classNames(
                  achievement.fulfilled ? "mx-auto sm:h-auto sm:w-30 flex-shrink-0 text-yellow-500" : "mx-auto sm:h-auto sm:w-30 flex-shrink-0 text-gray-400")
                } />
                <h3 className="mt-6 text-sm font-medium text-gray-900">{achievement.name}</h3>
                <dd className="text-sm text-black">{achievement.description}</dd>
                <dd className="text-sm text-black">{achievement.score} of {achievement.goal}</dd>
                {achievement.gameName && (<dd className="text-sm">Most wins: <span className="font-bold">{achievement.gameName}</span></dd>)}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">Uncompleted achievements</span>
        </div>
      </div>
      <div>
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notFulfilledAchievements.map((achievement) => (
            <li
              key={achievement.achievementNumber}
              className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-300 text-center shadow-none"
            >
              <div className="flex flex-1 flex-col p-8">
                <SparklesIcon className={classNames(
                  achievement.fulfilled ? "mx-auto sm:h-auto sm:w-30 flex-shrink-0 text-yellow-600" : "mx-auto sm:h-auto sm:w-30 flex-shrink-0 text-gray-400")
                } />
                <h3 className="mt-6 text-sm font-medium text-gray-900">{achievement.name}</h3>
                <dd className="text-sm text-gray-500">{achievement.description}</dd>
                <dd className="text-sm text-gray-500">{achievement.score} of {achievement.goal}</dd>
                {achievement.gameName && (<dd className="text-sm">Most wins: <span className="font-bold">{achievement.gameName}</span></dd>)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default MyAchievements;