import React, { useContext, useEffect, useState } from "react";
import { GameGroupContext } from "npm/context/GameGroupContext";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/nextjs";

const JoinGameGroupView = () => {
  const { user } = useUser();
  const { data, isLoading } = api.group.getActiveGameGroup.useQuery();
  const { data: allGameGroups, isLoading: allGameGroupsIsLoading } = api.group.getAllGameGroups.useQuery();
  const { data: pending, isLoading: pendingIsLoading, isError, error } = api.group.getAllPendingGameGroups.useQuery();
  const { data: currentPlayer, isLoading: playerLoading } = api.user.getPlayer.useQuery(
    { clerkId: user?.id ?? "" },
    { enabled: !!user?.id }
  );
  const ctx = api.useContext();

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const updateNickname = api.player.updateNickname.useMutation({
    onSuccess: () => {
      void ctx.user.getPlayer.invalidate();
      setShowNicknameModal(false);
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
    if (nickname.trim() && currentPlayer?.data?.id) {
      updateNickname.mutate({
        playerId: currentPlayer.data.id,
        nickname: nickname.trim()
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="overflow-hidden bg-white shadow-none sm:rounded-lg dark:bg-gray-800">
        <div className="px-4 py-5 sm:p-6">
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                      {isPending(group.id) ?
                        <div
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white`}
                        >
                          Waiting for approval
                        </div>
                        :
                        <button
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700`}
                          onClick={() => handleJoinClick(group.id)}
                          disabled={askForInvite.isLoading}
                        >
                          <UserPlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
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
    </div>);
};

export default JoinGameGroupView;