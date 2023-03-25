import {
  ChartPieIcon,
  CircleStackIcon,
  QuestionMarkCircleIcon,
  PlayIcon,
  PuzzlePieceIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/outline";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import type{ GetPlayerInput, GetPlayerOutput } from "npm/components/Types";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import Link from "next/link";

const actions = (groupName: string) => {
  return [
  {
    title: 'Start a new game',
    message: 'Choose a game start a session with your friends',
    href: '#',
    icon: PlayIcon,
    iconForeground: 'text-sky-700',
    iconBackground: 'bg-sky-50',
  },
  {
    title: 'History',
    message: 'Watch all played games',
    href: '/'+groupName+'/history/all',
    icon: CircleStackIcon,
    iconForeground: 'text-purple-700',
    iconBackground: 'bg-purple-50',
  },
  {
    title: 'Add a game',
    message: 'Missing a game? Add it!',
    href: '/'+groupName+'/games/search',
    icon: PuzzlePieceIcon,
    iconForeground: 'text-teal-700',
    iconBackground: 'bg-teal-50',
  },
  {
    title: 'Game collection',
    message: 'Cant decide? Get a random game based on some parameters',
    href: '/'+groupName+'/games/collection',
    icon: Square3Stack3DIcon,
    iconForeground: 'text-red-700',
    iconBackground: 'bg-red-50',
  },
  {
    title: 'Random game',
    message: 'Cant decide? Get a random game based on some parameters',
    href: '#',
    icon: QuestionMarkCircleIcon,
    iconForeground: 'text-yellow-700',
    iconBackground: 'bg-yellow-50',
  },
  {
    title: 'Statistics',
    message: 'Who won the most games? Who is the best player?',
    href: '#',
    icon: ChartPieIcon,
    iconForeground: 'text-indigo-700',
    iconBackground: 'bg-indigo-50',
  },
]};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard(groupName: string) {
  const clerk = useUser();
  const [isLoadingPlayer, setIsLoadingPlayer] = useState<boolean>(false);
  const [errorPlayer, setErrorPlayer] = useState<Error | undefined>();

  const user = {
    clerkId: clerk.user?.id || "",
    name: clerk.user?.fullName || "",
    hasOnlyOneOrg: clerk.user?.organizationMemberships?.length == 1,
    slug: clerk.user?.organizationMemberships?.[0]?.organization.slug,
  };

  const { data, error, isLoading } = api.player.getPlayer.useQuery<
    GetPlayerInput,
    GetPlayerOutput
  >(user);

  const addedPlayer = api.player.addPlayer.useMutation();
  const addGroup = api.group.addOrGetGroup.useMutation();

  useEffect(() => {
    if (!isLoading && !data?.data && groupName === user.slug) {
      setIsLoadingPlayer(true);
      setErrorPlayer(undefined);
      addGroup.mutate({
        id: user.slug
      });
      // Call the addPlayer mutation to add the player
      addedPlayer.mutate({
        name: user.name,
        groupId: user.slug
      }, {
        onSuccess: () => {
          setIsLoadingPlayer(false);
        },
        onError: (error) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setErrorPlayer(error);
          setIsLoadingPlayer(false);
        }
      });
    }
  }, [data]); // add

  if (isLoading || isLoadingPlayer) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (error || errorPlayer) {
    return <></>
  }

  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
      {actions(groupName).map((action, actionIdx) => (
        <div
          key={action.title}
          className={classNames(
            actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
            actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
            actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
            actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
            'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500'
          )}
        >
          <div>
            <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                'inline-flex rounded-lg p-3 ring-4 ring-white'
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
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  )
}