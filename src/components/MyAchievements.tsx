import React, { useState, Fragment } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { SparklesIcon, TrophyIcon, StarIcon, XMarkIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";
import Badge from "npm/components/Badge";
import { classNames, formatDate } from "npm/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import type { AchievementTypeCounter } from "npm/components/Types";

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
    case "puzzle":
      return PuzzlePieceIcon;
    default:
      return SparklesIcon;
  }
};

const formatGroupKeyName = (groupKey: string): string => {
  return groupKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const MyAchievements = ({ groupName }: { groupName: string }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementTypeCounter | null>(null);
  
  const {
    data: achievements,
    isLoading,
    isError,
    error,
  } = api.player.getAchievements.useQuery({ gameGroup: groupName });

  if (isLoading) return <LoadingPage />;
  if (isError) return <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">Something went wrong: {error?.message}</div>;
  if (!achievements?.length) return <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">No achievements yet.</div>;

  // Group achievements by groupKey
  const achievementsByGroup = achievements.reduce((acc, achievement) => {
    const key = achievement.groupKey;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key]!.push(achievement as AchievementTypeCounter);
    return acc;
  }, {} as Record<string, AchievementTypeCounter[]>);

  // Sort achievements within each group by tierOrder
  Object.keys(achievementsByGroup).forEach(key => {
    achievementsByGroup[key]!.sort((a, b) => (a.tierOrder || 0) - (b.tierOrder || 0));
  });

  // Sort group keys alphabetically
  const sortedGroupKeys = Object.keys(achievementsByGroup).sort();

  const totalPoints = achievements.filter(a => a.fulfilled).reduce((sum, a) => sum + a.points, 0);
  const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);
  const totalUnlocked = achievements.filter(a => a.fulfilled).length;

  return (
    <div>
      {/* Header with stats */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Achievement Progress</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalUnlocked} of {achievements.length} unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalPoints} <span className="text-xl text-gray-400 dark:text-gray-500">/ {maxPoints}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Points</div>
          </div>
        </div>
      </div>

      {/* Achievement groups */}
      <div className="space-y-8">
        {sortedGroupKeys.map((groupKey) => {
          const groupAchievements = achievementsByGroup[groupKey] || [];
          
          return (
            <div key={groupKey} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              {/* Group header */}
              <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-200 dark:border-gray-700 pb-3">
                {formatGroupKeyName(groupKey)}
              </h3>
              
              {/* Grid of achievement cards - horizontal left to right */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupAchievements.map((achievement) => {
                  const Icon = getIcon(achievement.iconType);
                  const tierGradient = getTierColor(achievement.tier);
                  const progressPercentage = (achievement.progress / achievement.goal) * 100;
                  const isFulfilled = achievement.fulfilled;
                  
                  return (
                    <div
                      key={achievement.id}
                      onClick={() => setSelectedAchievement(achievement)}
                      className={classNames(
                        "cursor-pointer transition-all hover:scale-105",
                        isFulfilled
                          ? `rounded-lg bg-gradient-to-br text-center shadow-lg ${tierGradient}`
                          : "rounded-lg bg-white text-center shadow dark:bg-gray-700"
                      )}
                    >
                      <div className="flex flex-col p-4">
                        <Icon className={classNames(
                          "mx-auto h-10 w-10 flex-shrink-0",
                          isFulfilled ? "text-white" : "text-gray-400 dark:text-gray-500"
                        )} />
                        
                        <h4 className={classNames(
                          "mt-3 text-sm font-medium line-clamp-2",
                          isFulfilled ? "text-white" : "text-gray-900 dark:text-white"
                        )}>
                          {achievement.name}
                        </h4>
                        
                        {/* Progress bar for in-progress achievements */}
                        {!isFulfilled && (
                          <div className="mt-3">
                            <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                              <span>{achievement.progress}/{achievement.goal}</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                              <div
                                className="h-full bg-indigo-600 dark:bg-indigo-500"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Badge className={classNames(
                            "text-xs",
                            isFulfilled
                              ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                          )}>
                            {achievement.points} pts
                          </Badge>
                          <Badge className={classNames(
                            "text-xs capitalize",
                            isFulfilled
                              ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                          )}>
                            {achievement.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Details Modal */}
      <Transition appear show={selectedAchievement !== null} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setSelectedAchievement(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                  {selectedAchievement && (() => {
                    const Icon = getIcon(selectedAchievement.iconType);
                    const tierGradient = getTierColor(selectedAchievement.tier);
                    const progressPercentage = selectedAchievement.fulfilled ? 100 : (selectedAchievement.progress / selectedAchievement.goal) * 100;
                    
                    return (
                      <>
                        <div className="absolute right-4 top-4">
                          <button
                            type="button"
                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-400"
                            onClick={() => setSelectedAchievement(null)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>

                        <div className={classNames(
                          "mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br p-4",
                          tierGradient
                        )}>
                          <Icon className="h-16 w-16 text-white" />
                        </div>

                        <Dialog.Title
                          as="h3"
                          className="text-center text-lg font-bold leading-6 text-gray-900 dark:text-white"
                        >
                          {selectedAchievement.name}
                        </Dialog.Title>

                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">{selectedAchievement.points} pts</Badge>
                          <Badge className="bg-gray-100 text-gray-800 capitalize dark:bg-gray-700 dark:text-gray-200">{selectedAchievement.tier}</Badge>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedAchievement.description}
                          </p>
                        </div>

                        {!selectedAchievement.fulfilled && (
                          <div className="mt-4">
                            <div className="mb-1 flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                              <span>Progress</span>
                              <span>{selectedAchievement.progress} / {selectedAchievement.goal}</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full bg-indigo-600 transition-all dark:bg-indigo-500"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                              {Math.round(progressPercentage)}% complete
                            </p>
                          </div>
                        )}

                        {selectedAchievement.metadata && selectedAchievement.category === 'specialist' && (selectedAchievement.metadata as { gameName?: string }).gameName && (
                          <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Game</p>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                              {(selectedAchievement.metadata as { gameName: string }).gameName}
                            </p>
                          </div>
                        )}

                        {selectedAchievement.metadata && selectedAchievement.category === 'generalist' && (selectedAchievement.metadata as { games?: string[] }).games && (
                          <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Games Played</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {(selectedAchievement.metadata as { games: string[] }).games.slice(0, 10).join(', ')}
                              {(selectedAchievement.metadata as { games: string[] }).games.length > 10 && ` +${(selectedAchievement.metadata as { games: string[] }).games.length - 10} more`}
                            </p>
                          </div>
                        )}

                        {selectedAchievement.metadata && selectedAchievement.category === 'mechanic_explorer' && (selectedAchievement.metadata as { mechanics?: string[] }).mechanics && (
                          <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Unique Mechanics Won</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {(selectedAchievement.metadata as { mechanics: string[] }).mechanics.slice(0, 15).join(', ')}
                              {(selectedAchievement.metadata as { mechanics: string[] }).mechanics.length > 15 && ` +${(selectedAchievement.metadata as { mechanics: string[] }).mechanics.length - 15} more`}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default MyAchievements;