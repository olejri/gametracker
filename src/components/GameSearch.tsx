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

  if (atlasGamesResult === undefined) return (
    <div className="sm:w-3/12">
      <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
    </div>
  );

  console.log(atlasGamesResult);
  const game = atlasGamesResult as unknown as AtlasGame;

  return (
    <>
      <div className="sm:w-3/12">
        <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
      </div>
        <div className="flex flex-1 flex-col p-8">
            <h3 className="mt-6 text-sm font-medium text-gray-900">{game.name}</h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dd className="text-sm text-gray-500">Players: {game.min_players}-{game.max_players}</dd>
                <dd className="text-sm text-gray-500">Time: {game.min_playtime}-{game.max_playtime}</dd>
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