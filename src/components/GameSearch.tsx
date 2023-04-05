import React, { useState } from "react";
import {
  type AtlasGame,
} from "npm/components/Types";
import Image from "next/image";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import SearchBar from "npm/components/SearchBar";
import { addMechanicAndCategoryToGame, isGameAnExpansion, isGameInCollection } from "npm/components/HelperFunctions";

const GameSearch = () => {
  const [baseGameId, setBaseGameId] = useState<string>();
  const [atlasGamesResult, setAtlasGamesResult] = useState<AtlasGame[]>();
  const { data: mechanics, isLoading: mechanicsIsLoading, error: mechanicsErrors } = api.game.getAllMechanics.useQuery();
  const { data: categories, isLoading: categoriesIsLoading, error: categoriesError } = api.game.getAllCategories.useQuery();
  const mutationSearch= api.game.searchForGame.useMutation(
    {
      onSuccess: (data) => {
        setAtlasGamesResult(data);
      }
    }
  )

  const { data: collections } = api.game.getAllGames.useQuery();
  const ctx = api.useContext()

  const mutation = api.game.addGame.useMutation({
    onSuccess: () => {
      void ctx.game.getAllGames.invalidate();
    }
  });

  if (categoriesError || mechanicsErrors) return <p>There is an error.</p>;
  if (!categories || !collections || mechanicsIsLoading || categoriesIsLoading || mutationSearch.isLoading) return (
    <div className="flex grow">
      <LoadingPage />
    </div>
  );

  if (atlasGamesResult === undefined) return (
   <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
  );

  const games : AtlasGame[] = addMechanicAndCategoryToGame(atlasGamesResult, mechanics, categories) as unknown as AtlasGame[];

  return (
    <div>
      <div>
        <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
      </div>
      <div className="overflow-x-auto">
        <table className="mt-4 w-full border-collapse">
          <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border border-gray-300 text-left">Name</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Image</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Description</th>
            <th className="py-2 px-4 border border-gray-300 text-center">Players</th>
            <th className="py-2 px-4 border border-gray-300 text-center">Minutes</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Mechanics</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Categories</th>
          </tr>
          </thead>
          <tbody>
          {games.map((game, index) => (
            <tr key={game.name + index.toString()} className="hover:bg-gray-50">
              <td className="py-2 px-4 border border-gray-300 text-left">
                {game.name}
                {isGameInCollection(game, collections) ? <span className="ml-2 text-green-500">In collection</span>
                  : (
                    <>
                      {isGameAnExpansion(game) &&
                        <select
                          value={baseGameId}
                          onChange={(event) => {
                            setBaseGameId(event.target.value);
                          }}
                        >
                          <option value="">Select base game</option>
                          {collections.map((game) => (
                            <option key={game.id} value={game.id}>
                              {game.name ?? "Unnamed mechanic"}
                            </option>
                          ))}
                        </select>
                      }
                    <button className={"ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}
                  onClick={ (event) => {
                    event.preventDefault();
                    mutation.mutate( {
                      data: {
                        ...game,
                        players: `${game.min_players}-${game.max_players}`,
                        playtime: `${game.min_playtime}-${game.max_playtime}`,
                        mechanics: game.mechanics.join(", "),
                        categories: game.categories.join(", "),
                        isExpansion: isGameAnExpansion(game),
                        baseGameId: baseGameId
                      }
                    })
                  }
                }>Add {isGameAnExpansion(game) ? "expansion" : "game"} to collection</button>
                    </>)}
              </td>
              <td className="py-2 px-4 border border-gray-300 text-left">{
                <div className="w-64 h-64">
                  <Image src={game.image_url} alt="My Image" width={200} height={200} />
                </div>
              }
              </td>
              <td className="py-2 px-4 border border-gray-300 text-center">{<div dangerouslySetInnerHTML={{ __html: game.description }} />}</td>
              <td className="py-2 px-4 border border-gray-300 text-center">{game.min_players}-{game.max_players}</td>
              <td className="py-2 px-4 border border-gray-300 text-center">{game.min_playtime}-{game.max_playtime}</td>
              <td className="py-2 px-4 border border-gray-300 text-left">{game.mechanics.join(", ")}</td>
              <td className="py-2 px-4 border border-gray-300 text-left">{game.categories.join(", ")}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameSearch;