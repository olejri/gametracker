import {
  ChartPieIcon,
  CircleStackIcon,
  PlayIcon,
  PuzzlePieceIcon,
  Square3Stack3DIcon,
  ArrowDownTrayIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import React from "react";
import Link from "next/link";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import RecentlyActivities from "npm/components/JustPlayed";
import { classNames } from "npm/lib/utils";
import { ICON_COLORS } from "npm/lib/constants";
import WhatsNew from "npm/components/WhatsNew";

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
      title: "My Achievements",
      message: "View your achievements for this group",
      href: "/" + groupName + "/achievements",
      icon: TrophyIcon,
      iconForeground: ICON_COLORS.blue.foreground,
      iconBackground: ICON_COLORS.blue.background
    }
  ];
};

export default function Dashboard(groupName: string) {
  return (
    <>
      <WhatsNew />
      <div
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-gray-200 shadow lg:grid-cols-4 dark:bg-gray-700">
        {actions(groupName).map((action) => (
          <div
            key={action.title}
            className="group relative bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:p-6 dark:bg-gray-800"
          >
            <div>
            <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                "inline-flex rounded-lg p-2 ring-4 ring-white sm:p-3 dark:ring-gray-800"
              )}
            >
              <action.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            </div>
            <div className="mt-3 sm:mt-5">
              <h3 className="text-sm font-semibold leading-5 text-gray-900 sm:text-base sm:leading-6 dark:text-white">
                <Link href={action.href} className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.title}
                </Link>
              </h3>
              <p className="mt-1 hidden text-sm text-gray-500 sm:mt-2 sm:block dark:text-gray-400">
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
      <div className="mt-6">
        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900 dark:bg-gray-900 dark:text-white">Recent sessions</span>
          </div>
        </div>
        <div>
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <RecentlyActivities groupName={groupName} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}