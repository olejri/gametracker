import React, { useState } from "react";
import { type OpenWithGameId } from "npm/components/Types";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import SearchBar from "npm/components/SearchBar";


const GameSearch = () => {
  const [baseGameId, setBaseGameId] = useState<string>();
  const [atlasGamesResult, setAtlasGamesResult] = useState<{text : {value: string}}>();
  const { data: mechanics, isLoading: mechanicsIsLoading, error: mechanicsErrors } = api.game.getAllMechanics.useQuery();
  const { data: categories, isLoading: categoriesIsLoading, error: categoriesError } = api.game.getAllCategories.useQuery();
  const mutationSearch= api.game.searchForGameWithOpenai.useMutation(
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
    <div className="sm:w-3/12">
   <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
    </div>
  );

  return (
    <>
      <p className="text-xl font-bold mb-4">Search result</p>
      {atlasGamesResult.text.value}
    </>
  );
};

export default GameSearch;