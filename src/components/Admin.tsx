import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

const AdminView = (props: {
  gameGroup: string
}) => {
  const { gameGroup } = props;
  const { data, isLoading, isError, error } = api.user.getPendingPlayers.useQuery({ gameGroup });
  const router = useRouter();
  const acceptPlayer = api.user.acceptInvite.useMutation({
    onSuccess: () => {
      void router.push(`/${gameGroup}/dashboard`);
    }
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <p>{error?.message}</p>;
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="overflow-hidden bg-white shadow-none sm:rounded-lg">
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