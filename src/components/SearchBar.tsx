import React, { useState } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { Button } from "npm/components/ui";


const SearchBar = (props: {
  setAtlasGamesResult: (atlasGamesResult: string | undefined) => void;
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
      <h1 className="text-xl font-bold mb-4 dark:text-white">Search after a game</h1>
      <div className="flex gap-2">
      <input className="min-w-0 flex-1 rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500" type="text" placeholder="Name of the game"
             onChange={(e) => setSearchName(e.target.value)} />
      <Button
        variant="primary"
        onClick={() => {
          mutationSearch.mutate(
            {
              searchQuery: searchName,
            });
        }}
      >
        Search
      </Button>
      </div>
        <dl className="mt-2 flex flex-grow flex-col justify-between">
            <dd className="text-sm text-gray-500 dark:text-gray-400">Using gpt-4-1106-preview to find information about a game before April 2023</dd>
        </dl>
    </div>
  );
};
export default SearchBar;