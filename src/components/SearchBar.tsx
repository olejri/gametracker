import React, { useState } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";


const SearchBar = (props: {
  setAtlasGamesResult: (atlasGamesResult: {text : {value: string}}) => void;
}) => {
  const setAtlasGamesResult = props.setAtlasGamesResult;
  const [searchName, setSearchName] = useState("");

  const mutationSearch = api.game.searchForGameWithOpenai.useMutation(
    {
      onSuccess: (data) => {
        setAtlasGamesResult(data);
      }
    }
  );

  if (mutationSearch.isLoading) return (
    <div className="flex grow">
      <LoadingPage />
    </div>
  );

  return (
    <div className="">
      <h1 className="text-xl font-bold mb-4">Search after a game</h1>
      <input className="border border-gray-300 rounded py-2 px-4" type="text" placeholder="Name of the game"
             onChange={(e) => setSearchName(e.target.value)} />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                mutationSearch.mutate(
                  {
                    searchQuery: searchName,
                  });
              }}
      >Search
      </button>
    </div>
  );
};
export default SearchBar;