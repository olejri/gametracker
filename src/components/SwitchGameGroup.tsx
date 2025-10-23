import React, { useContext, useState } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { ArrowsRightLeftIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { GameGroupContext } from "npm/context/GameGroupContext";
import { useUser } from "@clerk/nextjs";

const SwitchGameGroupView = () => {
  const { data, isLoading, isError, error } = api.group.getGameGroupsWithStatus.useQuery();
  const router = useRouter();
  const { setGameGroup } = useContext(GameGroupContext);
  const { user } = useUser();
  const ctx = api.useContext();

  // 🆕 Keep track of which group we’re switching to
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const { data: playerData } = api.user.getPlayer.useQuery(
    { clerkId: user?.id || "" },
    { enabled: !!user?.id }
  );

  const switchToGroup = api.group.switchActiveGameGroup.useMutation({
    onMutate: (variables) => {
      // Find the name of the group being switched to
      const groupName = data?.find((g) => g.groupId === variables.groupId)?.GameGroup?.name;
      setSwitchingTo(groupName ?? "the selected group");
    },
    onSuccess: async (data) => {
      await ctx.group.getActiveGameGroup.invalidate();
      await ctx.group.getGameGroupsWithStatus.invalidate();

      setGameGroup(data.groupId);
      void router.push(`/${data.groupId}/dashboard`);
    },
    onSettled: () => {
      // Clear message after navigation or error
      setTimeout(() => setSwitchingTo(null), 1500);
    },
  });

  if (isLoading) return <LoadingPage />;
  if (isError) return <p>{error?.message}</p>;

  return (
    <div className="relative mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* 🌀 Overlay during group switching */}
      {switchToGroup.isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
            <p className="text-lg font-semibold text-gray-700">
              Taking you to <span className="text-blue-700">{switchingTo}</span> dashboard...
            </p>
          </div>
        </div>
      )}

      {playerData?.data?.isSuperAdmin && (
        <div className="mb-6">
          <div className="overflow-hidden bg-gradient-to-r from-red-50 to-red-100 shadow sm:rounded-lg border-2 border-red-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-red-900">SuperAdmin Access</h3>
                  <p className="mt-1 text-sm text-red-700">
                    Manage all players, groups, and admins across the entire platform
                  </p>
                </div>
                <button
                  onClick={() => void router.push("/dashboards-view")}
                  className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                  Open SuperAdmin Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow-none sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {data.map((group) => (
              <li
                key={group.groupId}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
              >
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mt-6 text-sm font-medium text-gray-900">
                    {group.GameGroup.name}
                  </h3>
                </div>

                <div>
                  <div className="-mt-px flex divide-x divide-gray-200">
                    <div className="-ml-px flex w-0 flex-1">
                      {group.gameGroupIsActive ? (
                        <div className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                          <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                            Active
                          </span>
                        </div>
                      ) : (
                        <button
                          disabled={switchToGroup.isLoading}
                          onClick={() => switchToGroup.mutate({ groupId: group.groupId })}
                          className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-0.5 text-sm font-medium text-yellow-700">
                            Switch
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SwitchGameGroupView;
