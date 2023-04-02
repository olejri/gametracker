import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import React from "react";
import { LoadingPage } from "npm/components/loading";

const Stats = (props: DashboardProps) => {
  const { data, isLoading, isError } = api.session.getAllCompletedSessions.useQuery({
    data: {
      groupId: props.groupName
    }
  });

  if (isLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (isError || data === undefined) {
    return <div></div>;
  }

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  //make a funcation that returns a hashmap with the playerId as key and the value is the number of wins
  function getWinsPerPlayer() {
    const winsPerPlayer = new Map<string, number>();
    data?.forEach((session) => {
      session.players.forEach((player) => {
        if (winsPerPlayer.has(player.nickname) && player.position === 1) {
          winsPerPlayer.set(player.nickname, winsPerPlayer.get(player.nickname)! + 1);
        } else if (player.position === 1) {
          winsPerPlayer.set(player.nickname, 1);
        }
      });
    });
    return winsPerPlayer;
  }

  //make a function that returns a hashmap with the nickname and number of games played
  function getGamesPlayedPerPlayer() {
    const gamesPlayedPerPlayer = new Map<string, number>();
    data?.forEach((session) => {
      session.players.forEach((player) => {
        if (gamesPlayedPerPlayer.has(player.nickname)) {
          gamesPlayedPerPlayer.set(player.nickname, gamesPlayedPerPlayer.get(player.nickname)! + 1);
        } else {
          gamesPlayedPerPlayer.set(player.nickname, 1);
        }
      });
    });
    return gamesPlayedPerPlayer;
  }

  return (
    // loop through the hashmap and display the player name and the number of wins
    <div className="px-4 sm:px-6 lg:px-14">
      <h1 className="text-2xl font-bold text-center">Stats</h1>
      <h1 className="text-l font-bold text-center">Games played</h1>
      <div className="mt-8 flow-root">
        {Array.from(getGamesPlayedPerPlayer().entries()).sort(
          (a, b) => b[1] - a[1]
        ).map((player) => {
          return (
            <div key={player[0]}
                 className={"grid grid-cols-2"}>
              <p>{player[0]}</p>
              <p>Number of games played: {player[1]}</p>
            </div>
          );
        })
        }
      </div>
      <h1 className="text-l font-bold text-center">Games won</h1>
      <div className="mt-8 flow-root">
        {Array.from(getWinsPerPlayer().entries()).sort(
          (a, b) => b[1] - a[1]
        ).map((player) => {
          return (
            <div key={player[0]}
                 className={"grid grid-cols-2"}>
              <p>{player[0]}</p>
              <p>Number of total wins: {player[1]}</p>
            </div>
          );
        })
        }
      </div>
    </div>
  );
};

export default Stats;
