import React, { useEffect } from "react";
import "chart.js/auto";
import { Chart } from "chart.js";
import { api } from "npm/utils/api";
import { type AndyPayload, type DashboardProps } from "npm/components/Types";
import dayjs from "dayjs";
import { copy } from "copy-anything";
import useFetch from "npm/lib/FetchFromAtlas";


const Test = (props: DashboardProps) => {
  const { data } = api.session.getAllCompletedSessionsAsc.useQuery({
    data: {
      groupId: props.groupName
    }
  });

  //get a set of nicknames of all players
  const nicknames = new Set<string>();
  data?.forEach((session) => {
    session.players.forEach((player) => {
      nicknames.add(player.nickname);
    });
  });

  const url = "https://game-night-stats.appspot.com/api/gamenights/";
  const { data: gameNight } = useFetch<AndyPayload[]>(url);

  const validGameNights = gameNight?.map(
    (gameNight) => dayjs(gameNight.date_epoch).format("DD.MM.YYYY")
  ) ?? [];

  useEffect(() => {
    const numberOfGames = data?.map((session) => {
      return dayjs(session.createdAt.toString()).format("DD.MM.YYYY");
    }) ?? [];

    const hash = new Map<string, number[]>();
    data?.forEach((session) => {
      const s = dayjs(session.createdAt).format("DD.MM.YYYY");
      console.log(validGameNights)
      if (!validGameNights.includes(s)) {
        return;
      }

      const players = new Set(copy(nicknames));
      session.players.forEach((player) => {
        if (hash.has(player.nickname)) {
          if(player.position === 1) {
            const newVar = hash.get(player.nickname);
            if (newVar !== undefined) {
              const length = newVar.length;
              const numberOfWins = newVar.at(length - 1) ?? 0;
              newVar.push(numberOfWins + 1);
              hash.set(player.nickname, newVar);
            } else {
              //first win
              hash.set(player.nickname, [1]);
            }
          }
          else if(player.position === 2) {
            const newVar = hash.get(player.nickname);
            if (newVar !== undefined) {
              const length = newVar.length;
              const numberOfWins = newVar.at(length - 1) ?? 0;
              newVar.push(numberOfWins + 0.5);
              hash.set(player.nickname, newVar);
            } else {
              //first win
              hash.set(player.nickname, [0.3]);
            }
          }
          else if(player.position === 3) {
            const newVar = hash.get(player.nickname);
            if (newVar !== undefined) {
              const length = newVar.length;
              const numberOfWins = newVar.at(length - 1) ?? 0;
              newVar.push(numberOfWins + 0.1);
              hash.set(player.nickname, newVar);
            } else {
              //first win
              hash.set(player.nickname, [0.1]);
            }
          }
          else {
            const newVar = hash.get(player.nickname);
            if (newVar !== undefined) {
              const length = newVar.length;
              const numberOfWins = newVar.at(length - 1) ?? 0;
              newVar.push(numberOfWins);
              hash.set(player.nickname, newVar);
            } else {
              //first game
              hash.set(player.nickname, [0]);
            }
          }
        } else {
          if(player.position === 1) {
            hash.set(player.nickname, [1]);
          } else {
            hash.set(player.nickname, [0]);
          }
        }
        players.delete(player.nickname);
      });
      players.forEach((player) => {
        const newVar = hash.get(player);
        if (newVar !== undefined) {
          const length = newVar.length;
          const numberOfWins = newVar.at(length - 1) ?? 0;
          newVar.push(numberOfWins);
          hash.set(player, newVar);
        } else {
          //first game
          hash.set(player, [0]);
        }
      });
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newChart = new Chart(document.getElementById("test"), {
      type: "line",
      data: {
        labels: numberOfGames,
        datasets: [
          {
            label: "Nelich",
            borderColor: "#060709",
            data: hash.get("Nelich") ?? [0],
            fill: false,
            pointBackgroundColor: "#4A5568",
            borderWidth: "1",
            pointBorderWidth: "1",
            pointHoverRadius: "1",
            pointHoverBorderWidth: "1",
            pointHoverBorderColor: "rgb(74,85,104,0.2)"
          },
          {
            label: "Andriod",
            borderColor: "#e00000",
            data: hash.get("Andriod") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "1",
            pointBorderWidth: "1",
            pointHoverRadius: "1",
            pointHoverBorderWidth: "1",
            pointHoverBorderColor: "rgb(174,85,104,0.2)"
          },
          {
            label: "Oivind",
            borderColor: "#023293",
            data: hash.get("Oivind") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "1",
            pointBorderWidth: "1",
            pointHoverRadius: "1",
            pointHoverBorderWidth: "1",
            pointHoverBorderColor: "rgb(174,85,104,0.2)",
            cubicInterpolationMode: "default",
          },
          {
            label: "Jinxen",
            borderColor: "#f6cb03",
            data: hash.get("Jinxen") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "1",
            pointBorderWidth: "1",
            pointHoverRadius: "1",
            pointHoverBorderWidth: "1",
            pointHoverBorderColor: "rgb(174,85,104,0.2)"
          },
          {
            label: "dTd",
            borderColor: "#27ec05",
            data: hash.get("dTd") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "1",
            pointBorderWidth: "1",
            pointHoverRadius: "1",
            pointHoverBorderWidth: "1",
            pointHoverBorderColor: "rgb(174,85,104,0.2)"
          }
        ]
      },
      options: {
        legend: {
          position: false
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                display: false
              },
              display: false
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              },
              display: false
            }
          ]
        }
      }
    });
    return () => {
      newChart.destroy();
    };
  }, [data]);

  return (
    <>
      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-11/12 lg:w-2/3">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="lg:flex w-full justify-between">
                <h3 className="text-gray-600 dark:text-gray-400 leading-5 text-base md:text-xl font-bold">Total wins</h3>
                <p>First place = 1 point</p>
                <p>Second place = 0.3 point</p>
                <p>Third place = 0.1 point</p>
              </div>
            </div>
            <div className="mt-6">
              <canvas id="test" width={1025} height={400} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Test;
