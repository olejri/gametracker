import {
  ChartPieIcon,
  CircleStackIcon,
  PlayIcon,
  PuzzlePieceIcon,
  Square3Stack3DIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import React from "react";
import Link from "next/link";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import RecentlyActivities from "npm/components/JustPlayed";
import { classNames } from "npm/lib/utils";
import { ICON_COLORS } from "npm/lib/constants";

const actions = (groupName: string) => {
  return [
    {
      title: "Start a new game",
      message: "Start a session with your friends",
      href: "/" + groupName + "/session/create",
      icon: PlayIcon,
      iconForeground: ICON_COLORS.sky.foreground,
      iconBackground: ICON_COLORS.sky.background
    },
    {
      title: "History",
      message: "Watch all played games",
      href: "/" + groupName + "/history/all",
      icon: CircleStackIcon,
      iconForeground: ICON_COLORS.purple.foreground,
      iconBackground: ICON_COLORS.purple.background
    },
    {
      title: "Add a game",
      message: "Missing a game? Add it!",
      href: "/" + groupName + "/games/search",
      icon: PuzzlePieceIcon,
      iconForeground: ICON_COLORS.teal.foreground,
      iconBackground: ICON_COLORS.teal.background
    },
    {
      title: "Game collection",
      message: "Everyone's game collection",
      href: "/" + groupName + "/games/collection",
      icon: Square3Stack3DIcon,
      iconForeground: ICON_COLORS.red.foreground,
      iconBackground: ICON_COLORS.red.background
    },
    {
      title: "Make a custom game",
      message: "Can't find the game you are looking for? Add it yourself!",
      href: "/" + groupName + "/games/make-custom",
      icon: PlusIcon,
      iconForeground: ICON_COLORS.yellow.foreground,
      iconBackground: ICON_COLORS.yellow.background
    },
    {
      title: "Statistics",
      message: "Who won the most games? Who is the best player?",
      href: "/" + groupName + "/stats/all",
      icon: ChartPieIcon,
      iconForeground: ICON_COLORS.indigo.foreground,
      iconBackground: ICON_COLORS.indigo.background
    },
    {
      title: "Export",
      message: "Download your game data as CSV",
      href: "/" + groupName + "/export",
      icon: ArrowDownTrayIcon,
      iconForeground: ICON_COLORS.sky.foreground,
      iconBackground: ICON_COLORS.sky.background
    },
    {
      title: "How the app works",
      message: "Learn how to use the app",
      href: "/" + groupName + "/tutorial",
      icon: InformationCircleIcon,
      iconForeground: ICON_COLORS.blue.foreground,
      iconBackground: ICON_COLORS.blue.background
    }
  ];
};

export default function Dashboard(groupName: string) {
  return (
    <>
      <div
        className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0 dark:divide-gray-700 dark:bg-gray-700">
        {actions(groupName).map((action, actionIdx) => (
          <div
            key={action.title}
            className={classNames(
              actionIdx === 0 ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none" : "",
              actionIdx === 1 ? "sm:rounded-tr-lg" : "",
              actionIdx === actions.length - 2 ? "sm:rounded-bl-lg" : "",
              actionIdx === actions.length - 1 ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none" : "",
              "group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 dark:bg-gray-800"
            )}
          >
            <div>
            <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                "inline-flex rounded-lg p-3 ring-4 ring-white dark:ring-gray-800"
              )}
            >
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            </div>
            <div className="mt-8">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                <Link href={action.href} className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {action.message}
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 dark:text-gray-600 dark:group-hover:text-gray-500"
              aria-hidden="true"
            >
          </span>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900 dark:bg-gray-900 dark:text-white">Recent sessions</span>
          </div>
        </div>
        <div className="container mx-auto sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow sm:rounded-lg dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <RecentlyActivities groupName={groupName} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}