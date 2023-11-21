import React, { useState } from "react";
import SearchBar from "npm/components/SearchBar";

const GameSearch = () => {
  const [atlasGamesResult, setAtlasGamesResult] = useState<{ text: { value: string } }>();


  if (atlasGamesResult === undefined) return (
    <div className="sm:w-3/12">
      <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
    </div>
  );

  return (
    <>
      <div className="sm:w-3/12">
        <SearchBar setAtlasGamesResult={setAtlasGamesResult} />
      </div>
      <div>
        <p className="text-xl font-bold mb-4">Result</p>
        {atlasGamesResult.text.value}
      </div>
    </>
  );
};

export default GameSearch;