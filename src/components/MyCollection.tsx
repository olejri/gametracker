import React, { useState } from "react";
import { api } from "npm/utils/api";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import Image from "next/image";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import InfoModal from "npm/components/InfoModal";
import type { Game, OpenWithGameId } from "npm/components/Types";
import SelectWithSearch from "npm/components/SelectWithSearch";

const MyCollection = () => {
  const {
    data: allGames,
    isLoading: allIsLoading,
    error: allError,
    isError: allIsError
  } = api.game.getAllGames.useQuery();
  const {
    data: ownedGames,
    isLoading: ownedIsloading,
    error: ownError,
    isError: ownIsError
  } = api.game.getGameOwnedBy.useQuery();
  const ctx = api.useContext();
  const mutate = api.player.markGameAsOwned.useMutation({
    onSuccess: () => {
      void ctx.game.getGameOwnedBy.invalidate();
      setSelectedGame("")
    },
    onError: () => {
      setMutateError("Already marked as owned");
    }
  })
  const mutateDelete = api.player.removeGameAsOwned.useMutation({
    onSuccess: () => {
      void ctx.game.getGameOwnedBy.invalidate();
    }
  })

  const [modalOpen, setModalOpen] = useState<OpenWithGameId>({ open: false, name: "" });
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [mutateError, setMutateError] = useState<string>("");

  if (allIsLoading || ownedIsloading || mutateDelete.isLoading) return <LoadingPage />;
  if (allIsError || ownIsError) return <div className="text-gray-900 dark:text-white">{allError?.message} {ownError?.message}</div>;

  const gamesThatCanBeMarkedAsOwned = allGames.filter(game => !ownedGames.some(ownedGame => ownedGame.name === game.name));
  const sortedOwnedGames = ownedGames.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 sm:max-w-md sm:flex-none sm:basis-1/2">
        <SelectWithSearch title={"Mark a game as owned"} placeholder={"Search for a game..."} items={gamesThatCanBeMarkedAsOwned}
                          selectedItem={selectedGame} setSelectedItem={setSelectedGame} />
        </div>
        {mutate.isLoading ? (<LoadingSpinner size={20}/>) : (
        <button
          type="button"
          className="relative h-9 shrink-0 rounded-md border border-transparent bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          onClick={() => {
            setMutateError("")
            mutate.mutate({ gameId: (selectedGame as unknown as Game).id });
          }}
        >
          Add
          </button>
        )}
        {mutateError && <div className="text-red-500 dark:text-red-400">{mutateError}</div>}
      </div>
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900 dark:bg-gray-900 dark:text-white">My games</span>
        </div>
      </div>
      <div>
        <ul role="list" className="mt-5 grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
          {sortedOwnedGames.map((game) => (
            <li
              key={game.name}
              className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow dark:divide-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-1 flex-col p-4 sm:p-8">
                <Image className="mx-auto h-24 w-24 flex-shrink-0 object-cover sm:h-40 sm:w-40 sm:object-contain" src={game.image_url} alt="" width={200}
                       height={200} priority={true} />
                <h3 className="mt-3 text-sm font-medium text-gray-900 sm:mt-6 dark:text-white">{game.name}</h3>
                <dl className="mt-1 flex flex-grow flex-col justify-between sm:justify-start">
                  <dd className="text-sm text-gray-500 dark:text-gray-400">Players: {game.players}</dd>
                  <dd className="text-sm text-gray-500 dark:text-gray-400">Time: {game.playtime}</dd>
                  <dd
                    className="text-sm text-red-500 hover:text-red-700 cursor-pointer sm:mt-auto sm:pt-3 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => {
                      mutateDelete.mutate({ gameId: game.id })
                    }}
                  >Remove</dd>
                </dl>
              </div>
              <div>
                <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-700">
                  <div className="flex w-0 flex-1">
                    {game.isExpansion ?
                      <div
                        className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-3 text-xs font-semibold sm:gap-x-2 sm:whitespace-nowrap sm:py-4 sm:text-sm text-gray-900 dark:text-white"
                      >
                        <span className="text-green-500 dark:text-green-400">An expansion</span></div> :
                      <div
                        className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-3 text-xs font-semibold sm:gap-x-2 sm:whitespace-nowrap sm:py-4 sm:text-sm text-gray-900 dark:text-white"
                      >
                        <span className="text-green-500 dark:text-green-400">Base game</span></div>
                    }
                  </div>
                  <div className="-ml-px flex w-0 flex-1">
                    <button
                      className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-1 rounded-br-lg border border-transparent py-3 text-xs font-semibold sm:gap-x-2 sm:whitespace-nowrap sm:py-4 sm:text-sm text-gray-900 dark:text-white`}
                      onClick={() => {
                        setModalOpen({ open: true, name: game.name });
                      }}
                    >
                      <AcademicCapIcon className="hidden h-5 w-5 text-gray-600 lg:block dark:text-gray-400" aria-hidden="true" />
                      Description
                    </button>
                    <InfoModal
                      open={modalOpen}
                      gameName={game.name}
                      setOpen={setModalOpen}
                      title={game.name}
                      message={game.description}
                      categories={(game as unknown as { GameCategory?: Array<{ category: { name: string } }> }).GameCategory?.map(gc => gc.category.name).join(", ") || "None"}
                      mechanics={(game as unknown as { GameMechanic?: Array<{ mechanic: { name: string } }> }).GameMechanic?.map(gm => gm.mechanic.name).join(", ") || "None"}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
export default MyCollection;