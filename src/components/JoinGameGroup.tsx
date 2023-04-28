import React, { useContext, useEffect } from "react";
import { GameGroupContext } from "npm/context/GameGroupContext";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { UserPlusIcon } from "@heroicons/react/24/solid";

const JoinGameGroupView = () => {
  const { data, isLoading } = api.group.getActiveGameGroup.useQuery();
  const { data: allGameGroups, isLoading: allGameGroupsIsLoading } = api.group.getAllGameGroups.useQuery();
  const { data: pending, isLoading: pendingIsLoading, isError, error } = api.group.getAllPendingGameGroups.useQuery();
  const ctx = api.useContext();

  const askForInvite = api.user.askForInvite.useMutation({
    onSuccess: () => {
      void ctx.group.getAllGameGroups.invalidate();
      void ctx.group.getAllPendingGameGroups.invalidate();
    }
  });
  const { setGameGroup } = useContext(GameGroupContext);

  useEffect(() => {
    if (data?.groupId !== undefined) {
      setGameGroup(data.groupId);
    }
  }, [data, setGameGroup]);

  if (isLoading || allGameGroupsIsLoading || pendingIsLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <p>{error?.message}</p>;
  }

  const isPending = (groupId: string) => {
    return pending?.some((p) => p.groupId === groupId);
  };

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="overflow-hidden bg-white shadow-none sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {allGameGroups?.filter((g) => !g.hidden).map((group) => (
              <li
                key={group.id}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
              >
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mt-6 text-sm font-medium text-gray-900">{group.name}</h3>
                  <dl className="mt-1 flex flex-grow flex-col justify-between">
                    <dd className="text-sm text-gray-500">Number of players: {group.players.length}</dd>
                  </dl>
                </div>
                <div>
                  <div className="-mt-px flex divide-x divide-gray-200">
                    <div className="-ml-px flex w-0 flex-1">
                      {isPending(group.id) ?
                        <div
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900`}
                        >
                          Waiting for approval
                        </div>
                        :
                        <button
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900`}
                          onClick={() => {
                            askForInvite.mutate({ groupId: group.id });
                          }}
                        >
                          <UserPlusIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                          Ask for invite
                        </button>}
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

export default JoinGameGroupView;