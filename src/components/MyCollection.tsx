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
  const [modalOpen, setModalOpen] = useState<OpenWithGameId>({ open: false, name: "" });
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [mutateError, setMutateError] = useState<string>("");


  if (allIsLoading || ownedIsloading) return <LoadingPage />;
  if (allIsError || ownIsError) return <div>{allError?.message} {ownError?.message}</div>;

  const gamesThatCanBeMarkedAsOwned = allGames.filter(game => !ownedGames.some(ownedGame => ownedGame.name === game.name));
  const sortedOwnedGames = ownedGames.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="flex flex-wrap-reverse gap-x-1">
        <div className= "sm:w-6/12">
        <SelectWithSearch title={"Mark a game as owned"} placeholder={""} items={gamesThatCanBeMarkedAsOwned}
                          selectedItem={selectedGame} setSelectedItem={setSelectedGame} />
        </div>
        {mutate.isLoading ? (<LoadingSpinner size={20}/>) : (
        <button
          type="button"
          className="relative w-14 h-10 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => {
            setMutateError("")
            mutate.mutate({ gameId: (selectedGame as unknown as Game).id });
          }}
        >
          Add
          </button>
        )}
        {mutateError && <div className="text-red-500">{mutateError}</div>}
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">My games</span>
        </div>
      </div>
      <div>
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedOwnedGames.map((game, index) => (
            <li
              key={game.name + index.toString()}
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
    </>
  );
};
export default MyCollection;