import React, { useState } from "react";
import SearchBar from "npm/components/SearchBar";
import {type AtlasGame} from "npm/components/Types";
import { api } from "npm/utils/api";
import { CloudArrowDownIcon } from "@heroicons/react/24/solid";


const GameSearch = () => {
  const [atlasGamesResult, setAtlasGamesResult] = useState<string>();
const ctx = api.useContext()

    const mutation = api.game.addGame.useMutation({
        onSuccess: () => {
            void ctx.game.getAllGames.invalidate();
        }
    });

// Validate this value with a custom type guard (extend to your needs)
    function isAtlasGame(o: any): o is AtlasGame {
        return 'name' in o && 'min_players' in o && 'max_players' in o && 'min_playtime' in o && 'max_playtime' in o && 'mechanics' in o && 'categories' in o;
    }

  if (atlasGamesResult === undefined) return (
    <div className="sm:w-3/12">
      <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
    </div>
  );

  console.log(atlasGamesResult);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const game = JSON.parse(atlasGamesResult);

    if (!isAtlasGame(game)) {
        return <p>Something went wrong</p>
    }

  return (
    <>
      <div className="sm:w-3/12">
        <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
          <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dd className="text-sm text-gray-500">Using gpt-4-1106-preview to find information about a game before April 2023</dd>
            </dl>
      </div>
        <div className="flex flex-1 flex-col p-8">
            <h3 className="mt-6 text-sm font-medium text-gray-900">{game.name}</h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dd className="text-sm text-gray-500">Players: {game.min_players}-{game.max_players}</dd>
                <dd className="text-sm text-gray-500">Time: {game.min_playtime}-{game.max_playtime}</dd>
                <dd className="text-sm text-gray-500">Mechanics: {game.mechanics.join(", ")}</dd>
                <dd className="text-sm text-gray-500">Categories: {game.categories.join(", ")}</dd>
                <dd className="text-sm text-gray-500">Description: {game.description}</dd>
            </dl>
        </div>
        <div>
            <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                        <button
                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                            onClick={() => {
                                mutation.mutate({
                                    ...game,
                                    players: `${game.min_players}-${game.max_players}`,
                                    playtime: `${game.min_playtime}-${game.max_playtime}`,
                                    mechanics: game.mechanics.join(", "),
                                    categories: game.categories.join(", "),
                                    isExpansion: false,
                                    baseGameId: game.name,
                                });
                            }}
                        >
                            <CloudArrowDownIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                            Add
                        </button>
                </div>
            </div>
        </div>
    </>
  );
};

export default GameSearch;