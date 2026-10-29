import { api } from "npm/utils/api";
import React, { useMemo, useState } from "react";
import { LoadingPage } from "npm/components/loading";
import GameGrid from "npm/components/GameGrid";
import { type DashboardProps, type GameWithOwners } from "npm/components/Types";

const GameCollections = (props: DashboardProps) => {
  const { data: games, isLoading, error, isError } = api.game.getAllGames.useQuery();
  const { data: gamesInGroup } = api.group.getAllGamesOwnedByTheGroup.useQuery({ groupId: props.groupName });
  const plans = [
    { id: "all", name: "All games across all groups" },
    { id: "group", name: "Owned only by the group" }
  ];

  const [showAllGames, setShowAllGames] = useState(true);

  const gamesToShow = useMemo<GameWithOwners[]>(() => {
    if (games === undefined) return [];
    if (showAllGames) {
      return games.map((game) => ({ ...game, ownedByPlayers: [] } as GameWithOwners));
    }
    // add ownedByPlayers to the games the group owns
    return games
      .filter((game) => gamesInGroup?.some((gameInGroup) => gameInGroup.gameName === game.name))
      .map((game) => ({
        ...game,
        ownedByPlayers: gamesInGroup?.find((gameInGroup) => gameInGroup.gameName === game.name)?.ownedByPlayers
      } as GameWithOwners));
  }, [games, showAllGames, gamesInGroup]);

  if (isLoading) return <LoadingPage />;

  if (isError) {
    return <p>{error?.message}</p>;
  }

  return (
    <div className="sm:overflow-hidden sm:rounded-lg sm:bg-white sm:shadow sm:dark:bg-gray-800">
      <div className="sm:p-6">
        <GameGrid
          games={gamesToShow}
          showOwners={!showAllGames}
          filters={
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
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
                      onChange={() => setShowAllGames(filter.id === "all")}
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor={filter.id} className="font-medium text-gray-900 dark:text-white">
                      {filter.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default GameCollections;
