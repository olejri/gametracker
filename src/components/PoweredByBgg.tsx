import React from "react";
import Image from "next/image";
import { classNames } from "npm/lib/utils";

// BGG's XML API terms require public apps to show the "Powered by BGG" logo,
// linked back to BoardGameGeek, and to credit BoardGameGeek by name as the
// source of the data. The logo is BGG's own file from
// https://boardgamegeek.com/using_the_xml_api.
const BGG_LOGO_URL =
  "https://cf.geekdo-images.com/HZy35cmzmmyV9BarSuk6ug__small/img/gbE7sulIurZE_Tx8EQJXnZSKI6w=/fit-in/200x150/filters:strip_icc()/pic7779581.png";

type PoweredByBggProps = {
  // What the BGG data is, e.g. "Ratings" or "Game data"
  label?: string;
  className?: string;
};

const PoweredByBgg = ({ label = "Ratings", className = "" }: PoweredByBggProps) => (
  <div className={classNames("flex flex-col items-center gap-1", className)}>
    {/* The logo's text is dark, so it sits on a light plate in dark mode */}
    <a href="https://boardgamegeek.com" target="_blank" rel="noopener noreferrer" title="BoardGameGeek"
       className="rounded-md dark:bg-white dark:px-2 dark:py-1">
      <Image src={BGG_LOGO_URL} alt="Powered by BGG" width={200} height={59} className="h-10 w-auto" />
    </a>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label} from BoardGameGeek</p>
  </div>
);

export default PoweredByBgg;
