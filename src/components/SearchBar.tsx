import React, { useState } from "react";
import {
  type AtlasGame,
} from "npm/components/Types";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import SelectWithSearch from "npm/components/SelectWithSearch";


const SearchBar = (props: {
  setAtlasGamesResult: (atlasGamesResult: AtlasGame[]) => void;
}) => {
  const setAtlasGamesResult = props.setAtlasGamesResult;
  const [searchName, setSearchName] = useState("");
  const [mechanic, setMechanic] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const { data: mechanics, isLoading: mechanicsIsLoading, error: mechanicsErrors } = api.game.getAllMechanics.useQuery();
  const { data: categories, isLoading: categoriesIsLoading, error: categoriesError } = api.game.getAllCategories.useQuery();
  const mutationSearch= api.game.searchForGame.useMutation(
    {
      onSuccess: (data) => {
        setAtlasGamesResult(data);
      }
    }
  )

  if (categoriesError || mechanicsErrors) return <p>There is an error.</p>;
  if (!categories || mechanicsIsLoading || categoriesIsLoading || mutationSearch.isLoading) return (
    <div className="flex grow">
      <LoadingPage />
    </div>
  );

 return (
    <div>
      <h1 className="text-xl font-bold mb-4">Search after a game</h1>
      <input className="border border-gray-300 rounded py-2 px-4" type="text" placeholder="Name of the game"
             onChange={(e) => setSearchName(e.target.value)} />
      <SelectWithSearch items={mechanics.map((m) => {
        return {id: m.id, name: m.name ?? "Unnamed mechanic"}
      })} selectedItem={mechanic} setSelectedItem={setMechanic} placeholder={"Select a mechanic"} title={null}/>

      <select
        value={category}
        onChange={(event) => {
          setCategory(event.target.value);
      }}>
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name ?? "Unnamed category"}
          </option>
        ))}
      </select>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() =>
                mutationSearch.mutate(
                  {
                    searchName,
                    mechanic,
                    category,
                  })
              }
      >Search
      </button>
    </div>
  );
};
export default SearchBar;