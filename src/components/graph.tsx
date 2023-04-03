import React, { useEffect } from "react";
import "chart.js/auto";
import { Chart } from "chart.js";
import { api } from "npm/utils/api";
import { type DashboardProps } from "npm/components/Types";
import dayjs from "dayjs";


const Test = (props: DashboardProps) => {
  const { data } = api.session.getAllCompletedSessions.useQuery({
    data: {
      groupId: props.groupName
    }
  });

  useEffect(() => {
    const days = data?.map((session) => {
      return dayjs(session.createdAt.toString()).format("DD.MM.YYYY");
    }) ?? [];


    const hash = new Map<string, number[]>();

    data?.forEach((session) => {
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
          } else {
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
      });
    });


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newChart = new Chart(document.getElementById("test"), {
      type: "line",
      data: {
        labels: days,
        datasets: [
          {
            label: "Nelich",
            borderColor: "#060709",
            data: hash.get("Nelich") ?? [0],
            fill: false,
            pointBackgroundColor: "#4A5568",
            borderWidth: "3",
            pointBorderWidth: "4",
            pointHoverRadius: "6",
            pointHoverBorderWidth: "8",
            pointHoverBorderColor: "rgb(74,85,104,0.2)"
          },
          {
            label: "Andriod",
            borderColor: "#e00000",
            data: hash.get("Andriod") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "3",
            pointBorderWidth: "4",
            pointHoverRadius: "6",
            pointHoverBorderWidth: "8",
            pointHoverBorderColor: "rgb(174,85,104,0.2)"
          },
          {
            label: "Oivind",
            borderColor: "#023293",
            data: hash.get("Oivind") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "3",
            pointBorderWidth: "4",
            pointHoverRadius: "6",
            pointHoverBorderWidth: "8",
            pointHoverBorderColor: "rgb(174,85,104,0.2)"
          },
          {
            label: "Jinxen",
            borderColor: "#f6cb03",
            data: hash.get("Jinxen") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "3",
            pointBorderWidth: "4",
            pointHoverRadius: "6",
            pointHoverBorderWidth: "8",
            pointHoverBorderColor: "rgb(174,85,104,0.2)"
          },
          {
            label: "dTd",
            borderColor: "#27ec05",
            data: hash.get("dTd") ?? [0],
            fill: false,
            pointBackgroundColor: "#51684a",
            borderWidth: "3",
            pointBorderWidth: "4",
            pointHoverRadius: "6",
            pointHoverBorderWidth: "8",
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
                <h3 className="text-gray-600 dark:text-gray-400 leading-5 text-base md:text-xl font-bold">Selling
                  Overview</h3>
                <div className="flex items-center justify-between lg:justify-start mt-2 md:mt-4 lg:mt-0">
                  <div className="flex items-center">
                    <button
                      className="py-2 px-4 bg-gray-100 dark:bg-gray-700 focus:outline-none ease-in duration-150 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200">Dollars
                    </button>
                    <button
                      className="py-2 px-4 bg-indigo-500 focus:outline-none text-white ease-in duration-150 text-xs hover:bg-indigo-600">Tickets
                    </button>
                  </div>
                  <div className="lg:ml-14">
                    <div
                      className="bg-gray-100 dark:bg-gray-700 ease-in duration-150 hover:bg-gray-200 pb-2 pt-1 px-3 rounded-sm">
                      <select className="text-xs text-gray-600 dark:text-gray-400 bg-transparent focus:outline-none">
                        <option className="leading-1">Year</option>
                        <option className="leading-1">2020</option>
                        <option className="leading-1">2019</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-end mt-6">
                <h3 className="text-indigo-500 leading-5 text-lg md:text-2xl">$65,875</h3>
                <div className="flex items-center md:ml-4 ml-1">
                  <p className="text-indigo-500 text-xs md:text-base">17%</p>
                  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M6 2.5V9.5" stroke="#4338CA" strokeWidth="0.75" strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M8 4.5L6 2.5" stroke="#4338CA" strokeWidth="0.75" strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M4 4.5L6 2.5" stroke="#4338CA" strokeWidth="0.75" strokeLinecap="round"
                          strokeLinejoin="round" />
                  </svg>
                </div>
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
