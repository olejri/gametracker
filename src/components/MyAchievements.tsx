import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { SparklesIcon, TrophyIcon, StarIcon } from "@heroicons/react/24/outline";
import Badge from "npm/components/Badge";
import { classNames, formatDate } from "npm/lib/utils";

const getTierColor = (tier: string) => {
  switch (tier) {
    case "bronze":
      return "from-amber-600 to-amber-800 dark:from-amber-700 dark:to-amber-900";
    case "silver":
      return "from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700";
    case "gold":
      return "from-yellow-500 to-yellow-700 dark:from-yellow-600 dark:to-yellow-800";
    case "platinum":
      return "from-cyan-500 to-blue-700 dark:from-cyan-600 dark:to-blue-800";
    default:
      return "from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700";
  }
};

const getIcon = (iconType: string) => {
  switch (iconType) {
    case "trophy":
      return TrophyIcon;
    case "star":
      return StarIcon;
    default:
      return SparklesIcon;
  }
};

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

  const totalPoints = fulfilledAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div>
      <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Achievement Progress</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {fulfilledAchievements.length} of {achievements.length} unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalPoints}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Points</div>
          </div>
        </div>
      </div>

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

      <div className="mt-6">
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {fulfilledAchievements.map((achievement) => {
            const Icon = getIcon(achievement.iconType);
            const tierGradient = getTierColor(achievement.tier);
            return (
              <li
                key={achievement.id}
                className={classNames(
                  "col-span-1 flex flex-col rounded-lg bg-gradient-to-br text-center shadow-lg",
                  tierGradient
                )}
              >
                <div className="flex flex-1 flex-col p-6">
                  <Icon className="mx-auto h-12 w-12 flex-shrink-0 text-white" />
                  <h3 className="mt-4 text-lg font-bold text-white">{achievement.name}</h3>
                  <p className="mt-1 text-sm text-white/90">{achievement.description}</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Badge className="bg-white text-gray-900 font-semibold dark:bg-gray-900 dark:text-white">{achievement.points} pts</Badge>
                    <Badge className="bg-white text-gray-900 font-semibold capitalize dark:bg-gray-900 dark:text-white">{achievement.tier}</Badge>
                  </div>
                  {achievement.metadata && achievement.category === 'specialist' && (achievement.metadata as { gameName?: string }).gameName && (
                    <p className="mt-2 text-xs font-medium text-white/90">
                      {(achievement.metadata as { gameName: string }).gameName}
                    </p>
                  )}
                  {achievement.metadata && achievement.category === 'generalist' && (achievement.metadata as { games?: string[] }).games && (
                    <p className="mt-2 text-xs font-medium text-white/90">
                      {(achievement.metadata as { games: string[] }).games.slice(0, 5).join(', ')}
                      {(achievement.metadata as { games: string[] }).games.length > 5 && ` +${(achievement.metadata as { games: string[] }).games.length - 5} more`}
                    </p>
                  )}
                  {achievement.unlockedAt && (
                    <p className="mt-2 text-xs text-white/80">
                      Unlocked: {formatDate(new Date(achievement.unlockedAt))}
                    </p>
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
            In Progress
          </span>
        </div>
      </div>

      <div className="mt-6">
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notFulfilledAchievements.map((achievement) => {
            const Icon = getIcon(achievement.iconType);
            const progressPercentage = (achievement.progress / achievement.goal) * 100;
            return (
              <li
                key={achievement.id}
                className="col-span-1 flex flex-col rounded-lg bg-white text-center shadow dark:bg-gray-800"
              >
                <div className="flex flex-1 flex-col p-6">
                  <Icon className="mx-auto h-12 w-12 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">{achievement.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
                  
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{achievement.progress} / {achievement.goal}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-indigo-600 transition-all dark:bg-indigo-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{achievement.points} pts</Badge>
                    <Badge className="bg-gray-100 text-gray-700 capitalize dark:bg-gray-700 dark:text-gray-300">{achievement.tier}</Badge>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MyAchievements;