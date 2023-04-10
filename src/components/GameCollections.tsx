import { api } from "npm/utils/api";
import Image from "next/image";
import React, { useState } from "react";
import { LoadingPage } from "npm/components/loading";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import InfoModal from "npm/components/InfoModal";
import type { OpenWithGameId } from "npm/components/Types";

const GameCollections = () => {
  const { data : games, isLoading, error, isError } = api.game.getAllGames.useQuery();
  const [modalOpen, setModalOpen] = useState<OpenWithGameId>({open: false, name: ""});

  if (isLoading) return <LoadingPage />;

  if (isError) {
    return <p>{error?.message}</p>;
  }
  const sortedOwnedGames = games.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sortedOwnedGames.map((game) => (
          <li
            key={game.id}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              <Image className="mx-auto sm:h-auto sm:w-52 flex-shrink-0" src={game.image_url} alt="" width={200} height={200} priority={true}/>
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
                      setModalOpen({open: true, name: game.name})
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