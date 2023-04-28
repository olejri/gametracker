import React from "react";
import { api } from "npm/utils/api";
import {LoadingPage} from "npm/components/loading";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import {set} from "zod";

const AdminView = (props: {
  gameGroup: string
}) => {
  const { gameGroup } = props;
  const { data, isLoading, isError, error } = api.user.getPendingPlayers.useQuery({ gameGroup });
  const mutation = api.user.sendInvite.useMutation(
    {
        onSuccess: () => {
          setEmail("")
        }
    }
  );
  const router = useRouter();
  const acceptPlayer = api.user.acceptInvite.useMutation({
    onSuccess: () => {
      void router.push(`/${gameGroup}/dashboard`);
    }
  });

  const [email, setEmail] = React.useState("");

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <p>{error?.message}</p>;
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="overflow-hidden bg-white shadow-none sm:rounded-lg">
        <div
        className="px-4 py-5 sm:p-6"
        >
        <label>Invite users</label>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="isolate -space-y-px rounded-md shadow-sm">
                <div
                    className="relative rounded-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                    Email
                  </label>
                  <input
                      onBlur={(e) => {
                        setEmail(e.target.value)
                        }}
                      type="text"
                      name="name"
                      id="name"
                      className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Email address"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
             <button
                  disabled={mutation.isLoading}
                  className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}
                  onClick={() => {
                    mutation.mutate({
                    emailAddress: email,
                    });
                  }}
              >Invite User
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data?.map((player) => (
              <li
                key={player.playerId}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
              >
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mt-6 text-sm font-medium text-gray-900">{player.Player.name}</h3>
                  <h3 className="mt-6 text-sm font-medium text-gray-900">Wants to join {gameGroup}</h3>
                </div>
                <div>
                  <div className="-mt-px flex divide-x divide-gray-200">
                    <div className="-ml-px flex w-0 flex-1">
                        <button
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900`}
                          onClick={() => {
                            acceptPlayer.mutate({
                              playerId: player.playerId,
                              groupId: gameGroup
                            });
                          }}
                        >
                          <UserPlusIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                          Accept {player.Player.name}
                        </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>);
};

export default AdminView;