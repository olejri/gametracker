import React, { useContext } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { GameGroupContext } from "npm/context/GameGroupContext";

const SwitchGameGroupView = () => {
  const { data, isLoading, isError, error } = api.group.getGameGroupsWithStatus.useQuery();
  const router = useRouter();
  const { setGameGroup } = useContext(GameGroupContext);
  const switchToGroup = api.group.switchActiveGameGroup.useMutation({
    onSuccess: (variables) => {
      setGameGroup(variables.groupId);
      void router.push("/" + variables.groupId + "/dashboard");
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
            {data.map((group) => (
              <li
                key={group.groupId}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
              >
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mt-6 text-sm font-medium text-gray-900">{group.GameGroup.name}</h3>
                </div>
                <div>
                  <div className="-mt-px flex divide-x divide-gray-200">
                    <div className="-ml-px flex w-0 flex-1">
                      {group.gameGroupIsActive ?
                        <div
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900`}
                        >
                          <span
                            className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                            Active
                          </span>
                        </div> :
                        <button
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900`}
                          onClick={() => {
                            switchToGroup.mutate({
                              groupId: group.groupId
                            });
                          }}
                        >
                          <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                          <span
                            className="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-0.5 text-sm font-medium text-yellow-700">
                          Switch
                            </span>
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

export default SwitchGameGroupView;