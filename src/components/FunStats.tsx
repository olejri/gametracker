import React from "react";
import {
  BoltIcon,
  CalendarDaysIcon,
  FaceFrownIcon,
  FireIcon,
  PuzzlePieceIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";
import { StatusBadge } from "npm/components/ui";
import { ICON_COLORS } from "npm/lib/constants";
import { classNames, formatDate } from "npm/lib/utils";

type FunStat = {
  label: string;
  icon: typeof FireIcon;
  color: keyof typeof ICON_COLORS;
  value?: string;
  detail: string;
  badge?: string;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

const FunStats = (props: { groupName: string }) => {
  const { data, isLoading, isError, error } = api.stats.getFunStats.useQuery({ groupId: props.groupName });

  if (isLoading) return (
    <div className="flex justify-center items-center py-6">
      <LoadingSpinner size={40} />
    </div>
  );
  if (isError) return <p className="text-gray-900 dark:text-white">{error?.message}</p>;

  const stats: FunStat[] = [
    {
      label: "Longest win streak",
      icon: FireIcon,
      color: "red",
      value: data.longestStreak?.playerName,
      detail: data.longestStreak ? `${plural(data.longestStreak.length, "win")} in a row` : "No wins yet",
      badge: data.longestStreak?.isActive ? "Active" : undefined
    },
    {
      label: "Hottest right now",
      icon: BoltIcon,
      color: "yellow",
      value: data.hottestPlayer?.playerName,
      detail: data.hottestPlayer ? `${plural(data.hottestPlayer.wins, "win")} in 30 days` : "No wins in 30 days"
    },
    {
      label: "Most played game",
      icon: PuzzlePieceIcon,
      color: "teal",
      value: data.mostPlayedGame?.gameName,
      detail: data.mostPlayedGame ? plural(data.mostPlayedGame.sessions, "session") : "No sessions yet"
    },
    {
      label: "Biggest high score",
      icon: StarIcon,
      color: "purple",
      value: data.highScore ? `${data.highScore.score} pts` : undefined,
      detail: data.highScore ? `${data.highScore.playerName} in ${data.highScore.gameName}` : "No scores yet"
    },
    {
      label: "Eternal runner-up",
      icon: FaceFrownIcon,
      color: "sky",
      value: data.mostSecondPlaces?.playerName,
      detail: data.mostSecondPlaces ? plural(data.mostSecondPlaces.count, "second place") : "No second places yet"
    },
    {
      label: "Best game night",
      icon: CalendarDaysIcon,
      color: "indigo",
      value: data.bestGameNight ? formatDate(new Date(data.bestGameNight.date)) : undefined,
      detail: data.bestGameNight ? `${plural(data.bestGameNight.sessions, "session")} played` : "No sessions yet"
    }
  ];

  return (
    <div
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-gray-200 shadow lg:grid-cols-3 dark:bg-gray-700">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0 bg-white p-4 sm:p-5 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span
              className={classNames(
                ICON_COLORS[stat.color].background,
                ICON_COLORS[stat.color].foreground,
                "inline-flex shrink-0 rounded-lg p-1.5"
              )}
            >
              <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden={true} />
            </span>
            <p className="truncate text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">{stat.label}</p>
          </div>
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <p className="truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
              {stat.value ?? "–"}
            </p>
            {stat.badge && <StatusBadge color="red" className="shrink-0 px-1.5 text-xs">{stat.badge}</StatusBadge>}
          </div>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">{stat.detail}</p>
        </div>
      ))}
    </div>
  );
};

export default FunStats;
