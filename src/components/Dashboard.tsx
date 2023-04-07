import {
  ChartPieIcon,
  CircleStackIcon,
  PlayIcon,
  PuzzlePieceIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/outline";
import React from "react";
import Link from "next/link";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import RecentlyActivities from "npm/components/JustPlayed";

const actions = (groupName: string) => {
  return [
    {
      title: "Start a new game",
      message: "Start a session with your friends",
      href: "/" + groupName + "/session/create",
      icon: PlayIcon,
      iconForeground: "text-sky-700",
      iconBackground: "bg-sky-50"
    },
    {
      title: "History",
      message: "Watch all played games",
      href: "/" + groupName + "/history/all",
      icon: CircleStackIcon,
      iconForeground: "text-purple-700",
      iconBackground: "bg-purple-50"
    },
    {
      title: "Add a game",
      message: "Missing a game? Add it!",
      href: "/" + groupName + "/games/search",
      icon: PuzzlePieceIcon,
      iconForeground: "text-teal-700",
      iconBackground: "bg-teal-50"
    },
    {
      title: "Game collection",
      message: "Everyone's game collection",
      href: "/" + groupName + "/games/collection",
      icon: Square3Stack3DIcon,
      iconForeground: "text-red-700",
      iconBackground: "bg-red-50"
    },
    {
      title: "Make a custom game",
      message: "Can't find the game you are looking for? Add it yourself!",
      href: "/" + groupName + "/games/make-custom",
      icon: PlusIcon,
      iconForeground: "text-yellow-700",
      iconBackground: "bg-yellow-50"
    },
    {
      title: "Statistics",
      message: "Who won the most games? Who is the best player?",
      href: "/" + groupName + "/stats/all",
      icon: ChartPieIcon,
      iconForeground: "text-indigo-700",
      iconBackground: "bg-indigo-50"
    }
  ];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard(groupName: string) {
  return (
    <>
      <div
        className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
        {actions(groupName).map((action, actionIdx) => (
          <div
            key={action.title}
            className={classNames(
              actionIdx === 0 ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none" : "",
              actionIdx === 1 ? "sm:rounded-tr-lg" : "",
              actionIdx === actions.length - 2 ? "sm:rounded-bl-lg" : "",
              actionIdx === actions.length - 1 ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none" : "",
              "group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
            )}
          >
            <div>
            <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                "inline-flex rounded-lg p-3 ring-4 ring-white"
              )}
            >
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            </div>
            <div className="mt-8">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                <Link href={action.href} className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {action.message}
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
          </span>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">Recent sessions</span>
          </div>
        </div>
        <div className="container mx-auto sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">{<RecentlyActivities groupName={groupName} />}</div>
          </div>
        </div>
      </div>
    </>
  );
}