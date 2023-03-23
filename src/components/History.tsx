import { type DashboardProps, type PlayerNicknameAndScore } from "npm/components/Types";
import { api } from "npm/utils/api";
import { useOrganization } from "@clerk/nextjs";
import { type OrganizationMembershipResource } from "@clerk/types";
import React from "react";
import dayjs from "dayjs";

const History = (props: DashboardProps) => {
  const newVar = api.session.getAllCompletedSessions.useQuery({
    data: {
      groupId: props.groupName
    }
  });
  const playerMap = new Map<string, string>();

  const [members, setMembers] = React.useState<OrganizationMembershipResource[]>([]);

  const org = useOrganization().membership?.organization.getMemberships().then(
    (members) => {
      setMembers(members);
    }
  )

  if(members.length === 0) {
    return <div>Loading...</div>;
  }

  if (org === undefined) {
    return <div>Not logged in</div>;
  }

  if (org === null) {
    return <div>Not part of an organization</div>;
  }

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  function sortPlayers(players: PlayerNicknameAndScore[]) {
    return players.sort((a, b) => {
      if (a.position > b.position) {
        return 1;
      }
      if (a.position < b.position) {
        return -1;
      }
      return 0;
    });
  }

  if (newVar.data !== undefined) {
    // map by m.publicUserData.userId and populate the image_url on the player
    members.forEach((m) => {
      playerMap.set(m.publicUserData.userId ?? "", m.publicUserData.profileImageUrl);
    });

    // playerMap.set("user_2MeS9z7KY0pMJ4d8gmDxuctEge8", "https://images.clerk.dev/oauth_google/img_2MeSAE88XaY44DzDI7t6g7WUqKT.jpeg?width=80");


    return (
      <div className="px-4 sm:px-6 lg:px-14">
        <div className="mt-8 flow-root">
          <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                  >
                    Game
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                  >
                    Players
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                  >
                    Position
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                  >
                    Location
                  </th>
                </tr>
                </thead>
                <tbody>
                {newVar.data.map((game, gameIdx) => (
                  <tr key={game.sessionId}>
                    <td
                      className={classNames(
                        gameIdx !== newVar.data.length - 1 ? "border-b border-gray-300" : "",
                        "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                      )}
                    >
                      <a href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                        {game.gameName}
                      </a>
                    </td>
                    <td
                      className={classNames(
                        gameIdx !== newVar.data.length - 1 ? "border-b border-gray-300" : "",
                        "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                      )}
                    >
                      <a href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <div className="flex -space-x-1 overflow-hidden">
                            {sortPlayers(game.players).map((player) => (
                              <img
                                key={player.playerId}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                src={playerMap.get(player.clerkId)}
                                alt={player.nickname ?? player.playerId}
                              />
                            ))}
                          </div>
                        </div>
                      </a>
                    </td>
                    <td
                      className={classNames(
                        gameIdx !== newVar.data.length - 1 ? "border-b border-gray-300" : "",
                        "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                      )}
                    >
                      <a href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <div className="flex -space-x-1 overflow-hidden">
                            {sortPlayers(game.players).map((player) => (
                              <p
                                key={player.playerId}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                              >{player.position}</p>
                            ))}
                          </div>
                        </div>
                      </a>
                    </td>
                    <td
                      className={classNames(
                        gameIdx !== newVar.data.length - 1 ? "border-b border-gray-300" : "",
                        "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                      )}
                    >
                      <a href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <div className="flex -space-x-1 overflow-visible">
                            {sortPlayers(game.players).map((player) => (
                              <p
                                key={player.playerId}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                              >{player.score}</p>
                            ))}
                          </div>
                        </div>
                      </a>
                    </td>
                    <td
                      className={classNames(
                        gameIdx !== newVar.data.length - 1 ? "border-b border-gray-300" : "",
                        "whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      )}
                    >
                      <a href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                        {dayjs(game.updatedAt).format("DD.MM.YYYY")}
                      </a>
                    </td>
                    <td
                      className={classNames(
                        gameIdx !== newVar.data.length - 1 ? "border-b border-gray-300" : "",
                        "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
                      )}
                    >
                      <a href={"/" + props.groupName + "/session/" + game.sessionId} className="block w-full h-full">
                        {"???"}
                      </a>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <div className="text-center mt-4">Loading...</div>;
  }
};

export default History;
