import { api } from "npm/utils/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { LoadingPage } from "npm/components/loading";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import InfoModal from "npm/components/InfoModal";
import type { Game, OpenWithGameId } from "npm/components/Types";
import { type DashboardProps } from "npm/components/Types";

const GameCollections = (props: DashboardProps) => {
  const { data: games, isLoading, error, isError } = api.game.getAllGames.useQuery();
  const { data: gamesInGroup } = api.group.getAllGamesOwnedByTheGroup.useQuery({ groupId: props.groupName });
  const [modalOpen, setModalOpen] = useState<OpenWithGameId>({ open: false, name: "" });
  const plans = [
    { id: "all", name: "All games across all groups" },
    { id: "group", name: "Owned only by the group" }
  ];

  const [showAllGames, setShowAllGames] = useState(true);
  const [gamesToShow, setGamesToShow] = useState<Game[]>([]);

  useEffect(() => {
    if (games !== undefined) {
      const sort = games.sort((a, b) => a.name.localeCompare(b.name));
      if (showAllGames) {
        setGamesToShow(sort);
      } else {
        const filterOn = sort.filter((game) => gamesInGroup?.some((gameInGroup) => gameInGroup.gameName === game.name));
        setGamesToShow(filterOn);
      }
    }
  }, [games, showAllGames, gamesInGroup, setGamesToShow]);

  if (isLoading) return <LoadingPage />;

  if (isError) {
    return <p>{error?.message}</p>;
  }

  return (
    <div>
      <div className="space-y-5">
        {plans.map((filter) => (
          <div key={filter.id} className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id={filter.id}
                aria-describedby={`${filter.id}-description`}
                name="plan"
                type="radio"
                defaultChecked={filter.id === "all"}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                onChange={() => setShowAllGames(filter.id === "all")}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor={filter.id} className="font-medium text-gray-900">
                {filter.name}
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">Games</span>
        </div>
      </div>

      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {gamesToShow.map((game) => (
          <li
            key={game.id}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              <Image className="mx-auto sm:h-auto sm:w-52 flex-shrink-0" src={game.image_url} alt="" width={200}
                     height={200} priority={true} />
              <h3 className="mt-6 text-sm font-medium text-gray-900">{game.name}</h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dd className="text-sm text-gray-500">Players: {game.players}</dd>
                <dd className="text-sm text-gray-500">Time: {game.playtime}</dd>
              </dl>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                  {game.isExpansion ?
                    <div
                      className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <span className="ml-2 text-green-500">An expansion</span></div> :
                    <div
                      className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <span className="ml-2 text-green-500">Base game</span></div>
                  }
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <button
                    className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900`}
                    onClick={() => {
                      setModalOpen({ open: true, name: game.name });
                    }}
                  >
                    <AcademicCapIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                    Description
                  </button>
                  <InfoModal
                    open={modalOpen}
                    gameName={game.name}
                    setOpen={setModalOpen}
                    title={game.name}
                    message={game.description}
                    categories={game.categories}
                    mechanics={game.mechanics}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameCollections;