import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StatusBadge } from "npm/components/ui";

type BggRatingBadgeProps = {
  bggId: number | null | undefined;
  bggAverage: number | null | undefined;
  bggRank: number | null | undefined;
  className?: string;
};

// BGG rating linking to the game's BGG page. Renders nothing for games
// without a BGG match, since not every tracked game is a board game.
const BggRatingBadge = ({ bggId, bggAverage, bggRank, className = "" }: BggRatingBadgeProps) => {
  if (bggId == null || bggAverage == null) return null;
  return (
    <a
      href={`https://boardgamegeek.com/boardgame/${bggId}`}
      target="_blank"
      rel="noopener noreferrer"
      title="BoardGameGeek rating"
      className="inline-flex"
    >
      <StatusBadge color="yellow" className={`gap-x-1 whitespace-nowrap ${className}`}>
        <StarIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {bggAverage.toFixed(1)}
        {bggRank != null && <span className="font-normal opacity-80">· #{bggRank}</span>}
      </StatusBadge>
    </a>
  );
};

export default BggRatingBadge;
