import React, { useContext, useState } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { ArrowsRightLeftIcon, ShieldCheckIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { GameGroupContext } from "npm/context/GameGroupContext";
import { useUser } from "@clerk/nextjs";

const SwitchGameGroupView = () => {
  const { data, isLoading, isError, error } = api.group.getAllGroupsWithMembershipStatus.useQuery();
  const router = useRouter();
  const { setGameGroup } = useContext(GameGroupContext);
  const { user } = useUser();
  const ctx = api.useContext();

  // 🆕 Keep track of which group we’re switching to
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");

  const { data: playerData } = api.user.getPlayer.useQuery(
    { clerkId: user?.id || "" },
    { enabled: !!user?.id }
  );

  const switchToGroup = api.group.switchActiveGameGroup.useMutation({
    onMutate: (variables) => {
      // Find the name of the group being switched to
      const groupName = data?.find((g) => g.groupId === variables.groupId)?.groupName;
      setSwitchingTo(groupName ?? "the selected group");
    },
    onSuccess: async (data) => {
      await ctx.group.getActiveGameGroup.invalidate();
      await ctx.group.getAllGroupsWithMembershipStatus.invalidate();

      setGameGroup(data.groupId);
      void router.push(`/${data.groupId}/dashboard`);
    },
    onSettled: () => {
      // Clear message after navigation or error
      setTimeout(() => setSwitchingTo(null), 1500);
    },
  });

  const requestToJoin = api.user.askForInvite.useMutation({
    onMutate: (variables) => {
      const groupName = data?.find((g) => g.groupId === variables.groupId)?.groupName;
      setSwitchingTo(groupName ?? "the selected group");
    },
    onSuccess: async () => {
      await ctx.group.getAllGroupsWithMembershipStatus.invalidate();
    },
    onSettled: () => {
      setTimeout(() => setSwitchingTo(null), 1500);
    },
  });

  const createGameGroup = api.group.createGameGroup.useMutation({
    onSuccess: async () => {
      await ctx.user.getPlayer.invalidate();
      await ctx.group.getActiveGameGroup.invalidate();
      await ctx.group.getAllGroupsWithMembershipStatus.invalidate();
      setShowCreateGroupModal(false);
      setGroupName("");
    }
  });

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createGameGroup.mutate({ name: groupName.trim() });
    }
  };

  const canCreateGroup = playerData?.data?.gameGroupsLeft && playerData.data.gameGroupsLeft > 0;

  if (isLoading) return <LoadingPage />;
  if (isError) return <p className="text-gray-900 dark:text-white">{error?.message}</p>;

  return (
    <div className="relative mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* 🌀 Overlay during group switching or requesting */}
      {(switchToGroup.isLoading || requestToJoin.isLoading) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300 dark:bg-gray-900/80">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {switchToGroup.isLoading ? (
                <>Taking you to <span className="text-blue-700 dark:text-blue-400">{switchingTo}</span> dashboard...</>
              ) : (
                <>Requesting to join <span className="text-blue-700 dark:text-blue-400">{switchingTo}</span>...</>
              )}
            </p>
          </div>
        </div>
      )}

      {playerData?.data?.isSuperAdmin && (
        <div className="mb-6">
          <div className="overflow-hidden bg-gradient-to-r from-red-50 to-red-100 shadow sm:rounded-lg border-2 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-red-900 dark:text-red-200">SuperAdmin Access</h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
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

      <div className="overflow-hidden bg-white shadow-none sm:rounded-lg dark:bg-gray-800">
        <div className="px-4 py-5 sm:p-6">
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {data.map((group) => (
              <li
                key={group.groupId}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow dark:divide-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">
                    {group.groupName}
                  </h3>
                </div>

                <div>
                  <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-700">
                    <div className="-ml-px flex w-0 flex-1">
                      {group.isActive ? (
                        <div className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        </div>
                      ) : group.isMember ? (
                        group.inviteStatus === "PENDING" ? (
                          <div className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white">
                            <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Pending Approval
                            </span>
                          </div>
                        ) : (
                          <button
                            disabled={switchToGroup.isLoading || requestToJoin.isLoading}
                            onClick={() => switchToGroup.mutate({ groupId: group.groupId })}
                            className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
                          >
                            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-0.5 text-sm font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                              Switch
                            </span>
                          </button>
                        )
                      ) : (
                        <button
                          disabled={switchToGroup.isLoading || requestToJoin.isLoading}
                          onClick={() => requestToJoin.mutate({ groupId: group.groupId })}
                          className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                        >
                          <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                          <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-0.5 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            Request to Join
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {/* Create Group Card */}
            <li className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow dark:divide-gray-700 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex flex-1 flex-col p-8">
                <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">Create Game Group</h3>
                <dl className="mt-1 flex flex-grow flex-col justify-between">
                  <dd className="text-sm text-gray-500 dark:text-gray-400">
                    {playerData?.data?.gameGroupsLeft !== undefined
                      ? `${playerData.data.gameGroupsLeft} ${playerData.data.gameGroupsLeft === 1 ? 'creation' : 'creations'} left`
                      : "Loading..."}
                  </dd>
                </dl>
              </div>
              <div>
                <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-700">
                  <div className="-ml-px flex w-0 flex-1">
                    <button
                      className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold ${
                        canCreateGroup
                          ? 'text-green-600 hover:bg-gray-50 dark:text-green-500 dark:hover:bg-gray-700'
                          : 'text-gray-400 cursor-not-allowed dark:text-gray-600'
                      }`}
                      onClick={() => canCreateGroup && setShowCreateGroupModal(true)}
                      disabled={!canCreateGroup}
                    >
                      <PlusCircleIcon className="h-5 w-5" aria-hidden="true" />
                      {canCreateGroup ? "Create Group" : "No Groups Left"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Create Your Game Group
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose a name for your game group. You can invite players to join after creation.
                    </p>
                  </div>
                  {createGameGroup.error && (
                    <div className="mt-3 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                      <p className="text-sm text-red-800 dark:text-red-400">
                        {createGameGroup.error.message}
                      </p>
                    </div>
                  )}
                  <div className="mt-4">
                    <input
                      type="text"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Enter group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && groupName.trim()) {
                          handleCreateGroup();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || createGameGroup.isLoading}
                >
                  {createGameGroup.isLoading ? 'Creating...' : 'Create Group'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setGroupName("");
                  }}
                  disabled={createGameGroup.isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwitchGameGroupView;
