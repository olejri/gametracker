import React, { useContext, useEffect, useState } from "react";
import { GameGroupContext } from "npm/context/GameGroupContext";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { UserPlusIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { UserButton, useUser } from "@clerk/nextjs";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "npm/context/ThemeContext";

const JoinGameGroupView = () => {
  const { user } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { data, isLoading } = api.group.getActiveGameGroup.useQuery();
  const { data: allGameGroups, isLoading: allGameGroupsIsLoading } = api.group.getAllGameGroups.useQuery();
  const { data: pending, isLoading: pendingIsLoading, isError, error } = api.group.getAllPendingGameGroups.useQuery();
  const { data: currentPlayer, isLoading: playerLoading } = api.user.getPlayer.useQuery(
    { clerkId: user?.id ?? "" },
    { 
      enabled: !!user?.id,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0
    }
  );
  const ctx = api.useContext();

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");

  const updateNickname = api.player.updateNickname.useMutation({
    onSuccess: async () => {
      // Wait for the player data to be refreshed
      await ctx.user.getPlayer.invalidate();
      setShowNicknameModal(false);
      setNickname("");
      if (selectedGroupId) {
        askForInvite.mutate({ groupId: selectedGroupId });
        setSelectedGroupId(null);
      }
    }
  });

  const askForInvite = api.user.askForInvite.useMutation({
    onSuccess: () => {
      void ctx.group.getAllGameGroups.invalidate();
      void ctx.group.getAllPendingGameGroups.invalidate();
    }
  });

  const createGameGroup = api.group.createGameGroup.useMutation({
    onSuccess: async () => {
      await ctx.user.getPlayer.invalidate();
      await ctx.group.getActiveGameGroup.invalidate();
      await ctx.group.getAllGameGroups.invalidate();
      setShowCreateGroupModal(false);
      setGroupName("");
    }
  });
  const { setGameGroup } = useContext(GameGroupContext);

  useEffect(() => {
    if (data?.groupId !== undefined) {
      setGameGroup(data.groupId);
    }
  }, [data, setGameGroup]);

  if (isLoading || allGameGroupsIsLoading || pendingIsLoading || playerLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <p>{error?.message}</p>;
  }

  const isPending = (groupId: string) => {
    return pending?.some((p) => p.groupId === groupId);
  };

  const handleJoinClick = (groupId: string) => {
    // Check if player has a nickname
    if (!currentPlayer?.data?.nickname || currentPlayer.data.nickname.trim() === "") {
      setSelectedGroupId(groupId);
      setShowNicknameModal(true);
    } else {
      askForInvite.mutate({ groupId });
    }
  };

  const handleNicknameSubmit = () => {
    if (nickname.trim()) {
      updateNickname.mutate({
        playerId: currentPlayer?.data?.id,
        nickname: nickname.trim()
      });
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createGameGroup.mutate({ name: groupName.trim() });
    }
  };

  const canCreateGroup = currentPlayer?.data?.gameGroupsLeft && currentPlayer.data.gameGroupsLeft > 0;

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Game Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Game Groups</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Join an existing game group or create your own to start tracking your games.
            </p>
          </div>

          <div className="overflow-hidden bg-white shadow-none sm:rounded-lg dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Existing Groups */}
                {allGameGroups?.filter((g) => !g.hidden).map((group) => (
                  <li
                    key={group.id}
                    className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow dark:divide-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex flex-1 flex-col p-8">
                      <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">{group.name}</h3>
                      <dl className="mt-1 flex flex-grow flex-col justify-between">
                        <dd className="text-sm text-gray-500 dark:text-gray-400">Number of players: {group.players.length}</dd>
                      </dl>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-700">
                        <div className="-ml-px flex w-0 flex-1">
                          {isPending(group.id) ? (
                            <div
                              className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white`}
                            >
                              Waiting for approval
                            </div>
                          ) : (
                            <button
                              className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700`}
                              onClick={() => handleJoinClick(group.id)}
                              disabled={askForInvite.isLoading}
                            >
                              <UserPlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                              Ask for invite
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
                        {currentPlayer?.data?.gameGroupsLeft !== undefined
                          ? `${currentPlayer.data.gameGroupsLeft} ${currentPlayer.data.gameGroupsLeft === 1 ? 'creation' : 'creations'} left`
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

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-gray-800">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Add a Nickname
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please add a nickname before joining a group. This will be displayed to other players.
                    </p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && nickname.trim()) {
                          handleNicknameSubmit();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  onClick={handleNicknameSubmit}
                  disabled={!nickname.trim() || updateNickname.isLoading}
                >
                  {updateNickname.isLoading ? 'Saving...' : 'Save & Continue'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  onClick={() => {
                    setShowNicknameModal(false);
                    setSelectedGroupId(null);
                    setNickname("");
                  }}
                  disabled={updateNickname.isLoading}
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

export default JoinGameGroupView;