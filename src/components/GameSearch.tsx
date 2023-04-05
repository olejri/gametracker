import React, { useState } from "react";
import {
  type AtlasGame, type OpenWithGameId
} from "npm/components/Types";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import SearchBar from "npm/components/SearchBar";
import {
  addMechanicAndCategoryToGame,
  isGameAnExpansion,
  isGameInCollection,
} from "npm/components/HelperFunctions";
import { CheckIcon } from "@heroicons/react/20/solid";
import InfoModal from "npm/components/InfoModal";
import { AcademicCapIcon, CloudArrowDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

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

  const [modalOpen, setModalOpen] = useState<OpenWithGameId>({open: false, name: ""});
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

  const baseGames = collections.filter((game) => game.isExpansion === false);

  const games : AtlasGame[] = addMechanicAndCategoryToGame(atlasGamesResult, mechanics, categories) as unknown as AtlasGame[];
  return (
    <div>
      <div>
        <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
      </div>
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {games.map((atlasGame, index) => (
          <li
            key={atlasGame.name + index.toString()}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              <Image className="mx-auto sm:h-52 sm:w-52 flex-shrink-0" src={atlasGame.image_url} alt="" width={200} height={200}/>
              <h3 className="mt-6 text-sm font-medium text-gray-900">{atlasGame.name}</h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dd className="text-sm text-gray-500">Players: {atlasGame.min_players}-{atlasGame.max_players}</dd>
                <dd className="text-sm text-gray-500">Time: {atlasGame.min_playtime}-{atlasGame.max_playtime}</dd>
                {isGameAnExpansion(atlasGame) ? <dd className="text-sm text-gray-500">
                  <select
                    className="text-sm text-gray-500 border-none max-w-full"
                    value={baseGameId}
                    onChange={(event) => {
                      setBaseGameId(event.target.value);
                    }}
                  >
                    <option value="">Select base game</option>
                    {baseGames.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name ?? "Unnamed game"}
                      </option>
                    ))}
                  </select>
                </dd> : <></>}
              </dl>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                  {isGameInCollection(atlasGame, collections) ?
                    <div
                    className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                    <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                    <span className="ml-2 text-green-500">In collection</span></div> :
                    <button
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    onClick={() => {
                      mutation.mutate({
                        ...atlasGame,
                        players: `${atlasGame.min_players}-${atlasGame.max_players}`,
                        playtime: `${atlasGame.min_playtime}-${atlasGame.max_playtime}`,
                        mechanics: atlasGame.mechanics.join(", "),
                        categories: atlasGame.categories.join(", "),
                        isExpansion: isGameAnExpansion(atlasGame),
                        baseGameId: baseGameId,
                      });
                    }}
                  >
                    <CloudArrowDownIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                    Add
                  </button>}
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <button
                  className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900`}
                  onClick={() => {
                    setModalOpen({open: true, name: atlasGame.name})
                  }}
                  >
                    <AcademicCapIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                    Description
                  </button>
                  <InfoModal open={modalOpen} gameName={atlasGame.name} setOpen={setModalOpen} title={atlasGame.name} message={atlasGame.description}></InfoModal>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameSearch;