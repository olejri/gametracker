import React, { useState } from "react";
import { api } from "npm/utils/api";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import GameGrid from "npm/components/GameGrid";
import type { Game, GameWithOwners } from "npm/components/Types";
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

  const [selectedGame, setSelectedGame] = useState<string>("");
  const [mutateError, setMutateError] = useState<string>("");

  if (allIsLoading || ownedIsloading) return <LoadingPage />;
  if (allIsError || ownIsError) return <div className="text-gray-900 dark:text-white">{allError?.message} {ownError?.message}</div>;

  const gamesThatCanBeMarkedAsOwned = allGames.filter(game => !ownedGames.some(ownedGame => ownedGame.name === game.name));

  const ownedGamesWithOwners = ownedGames.map((game) => ({ ...game, ownedByPlayers: [] } as GameWithOwners));

  return (
    <GameGrid
      games={ownedGamesWithOwners}
      title="My games"
      titleClassName="bg-white dark:bg-gray-900"
      gridClassName="xl:grid-cols-3"
      onRemove={(game) => mutateDelete.mutate({ gameId: game.id })}
      filters={
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
      }
    />
  );
};
export default MyCollection;