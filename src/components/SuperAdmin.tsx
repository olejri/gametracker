import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { ShieldCheckIcon, TrashIcon, UserMinusIcon, ArrowPathIcon, PlusIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

const SuperAdminView = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"players" | "groups" | "admins">("players");
  const [showCreateGroup, setShowCreateGroup] = React.useState(false);
  const [newGroupId, setNewGroupId] = React.useState("");
  const [newGroupName, setNewGroupName] = React.useState("");
  const [addingMemberToGroup, setAddingMemberToGroup] = React.useState<string | null>(null);

  const { data: allPlayers, isLoading: playersLoading, refetch: refetchPlayers } = api.superadmin.getAllPlayers.useQuery();
  const { data: allGroups, isLoading: groupsLoading, refetch: refetchGroups } = api.superadmin.getAllGroups.useQuery();
  const { data: allAdmins, isLoading: adminsLoading, refetch: refetchAdmins } = api.superadmin.getAllAdmins.useQuery();

  const toggleSuperAdmin = api.superadmin.toggleSuperAdmin.useMutation({
    onSuccess: () => {
      void refetchPlayers();
    }
  });

  const removePlayerFromGroup = api.superadmin.removePlayerFromGroup.useMutation({
    onSuccess: () => {
      void refetchPlayers();
      void refetchGroups();
    }
  });

  const changePlayerRole = api.superadmin.changePlayerRole.useMutation({
    onSuccess: () => {
      void refetchPlayers();
      void refetchGroups();
      void refetchAdmins();
    }
  });

  const deleteGroup = api.superadmin.deleteGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
    }
  });

  const createGroup = api.superadmin.createGroup.useMutation({
    onSuccess: () => {
      void refetchGroups();
      setShowCreateGroup(false);
      setNewGroupId("");
      setNewGroupName("");
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const addPlayerToGroup = api.superadmin.addPlayerToGroup.useMutation({
    onSuccess: () => {
      void refetchPlayers();
      void refetchGroups();
      setAddingMemberToGroup(null);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  // Get players not in a specific group
  const getAvailablePlayers = (groupId: string) => {
    if (!allPlayers) return [];
    return allPlayers.filter(player =>
      !player.PlayerGameGroupJunction.some(junction => junction.groupId === groupId)
    );
  };

  if (playersLoading || groupsLoading || adminsLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Manage all players, groups, and admins across the platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("players")}
            className={`${
              activeTab === "players"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            All Players ({allPlayers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`${
              activeTab === "groups"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            All Groups ({allGroups?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`${
              activeTab === "admins"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            All Admins ({allAdmins?.length || 0})
          </button>
        </nav>
      </div>

      {/* Players Tab */}
      {activeTab === "players" && (
        <div>
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {allPlayers?.map((player) => (
                <li key={player.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="truncate text-sm font-medium text-indigo-600">{player.nickname || player.name}</p>
                        {player.isSuperAdmin && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            SUPERADMIN
                          </span>
                        )}
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {player.email}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Member of {player.PlayerGameGroupJunction.length} group(s)
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        {player.PlayerGameGroupJunction.map((junction) => (
                          <div key={junction.id} className="inline-flex items-center mr-4 mb-2">
                            <span className="text-xs text-gray-600">{junction.GameGroup.name}</span>
                            <span className={`ml-1 text-xs ${junction.role === "ADMIN" ? "text-red-600" : "text-gray-500"}`}>
                              ({junction.role})
                            </span>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${player.name} from ${junction.GameGroup.name}?`)) {
                                  removePlayerFromGroup.mutate({
                                    playerId: player.id,
                                    groupId: junction.groupId
                                  });
                                }
                              }}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <UserMinusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (confirm(`${player.isSuperAdmin ? "Remove" : "Grant"} superadmin privileges for ${player.name}?`)) {
                            toggleSuperAdmin.mutate({ playerId: player.id });
                          }
                        }}
                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                          player.isSuperAdmin
                            ? "bg-red-600 text-white hover:bg-red-500"
                            : "bg-green-600 text-white hover:bg-green-500"
                        }`}
                      >
                        <ShieldCheckIcon className="h-5 w-5 mr-1" />
                        {player.isSuperAdmin ? "Remove SuperAdmin" : "Make SuperAdmin"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === "groups" && (
        <div>
          {/* Create Group Button */}
          <div className="mb-6">
            {!showCreateGroup ? (
              <button
                onClick={() => setShowCreateGroup(true)}
                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <PlusIcon className="h-5 w-5" />
                Create New Dashboard
              </button>
            ) : (
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Dashboard</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">
                      Dashboard ID (used in URL)
                    </label>
                    <input
                      type="text"
                      id="groupId"
                      value={newGroupId}
                      onChange={(e) => setNewGroupId(e.target.value)}
                      placeholder="e.g., game-night-2024"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>
                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                      Dashboard Name
                    </label>
                    <input
                      type="text"
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Game Night 2024"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (newGroupId && newGroupName) {
                          createGroup.mutate({
                            groupId: newGroupId,
                            groupName: newGroupName
                          });
                        }
                      }}
                      disabled={!newGroupId || !newGroupName || createGroup.isLoading}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-400"
                    >
                      {createGroup.isLoading ? "Creating..." : "Create Dashboard"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateGroup(false);
                        setNewGroupId("");
                        setNewGroupName("");
                      }}
                      className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allGroups?.map((group) => (
              <div key={group.id} className="overflow-hidden bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                    <button
                      onClick={() => {
                        if (confirm(`Delete group "${group.name}"? This will remove all members.`)) {
                          deleteGroup.mutate({ groupId: group.id });
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    ID: <span className="font-mono text-xs">{group.id}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {group.PlayerGameGroupJunction.length} member(s)
                  </div>

                  {/* Add Member Section */}
                  {addingMemberToGroup === group.id ? (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Add Member</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {getAvailablePlayers(group.id).length > 0 ? (
                          getAvailablePlayers(group.id).map((player) => (
                            <div key={player.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{player.nickname || player.name}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    addPlayerToGroup.mutate({
                                      playerId: player.id,
                                      groupId: group.id,
                                      role: "MEMBER"
                                    });
                                  }}
                                  className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                                >
                                  Add as Member
                                </button>
                                <button
                                  onClick={() => {
                                    addPlayerToGroup.mutate({
                                      playerId: player.id,
                                      groupId: group.id,
                                      role: "ADMIN"
                                    });
                                  }}
                                  className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                                >
                                  Add as Admin
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">All players are already members</p>
                        )}
                      </div>
                      <button
                        onClick={() => setAddingMemberToGroup(null)}
                        className="mt-2 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingMemberToGroup(group.id)}
                      className="mb-4 inline-flex items-center gap-x-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      Add Member
                    </button>
                  )}

                  <div className="space-y-2">
                    {group.PlayerGameGroupJunction.map((junction) => (
                      <div key={junction.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-900">{junction.Player.nickname || junction.Player.name}</span>
                          <span className={`ml-2 ${junction.role === "ADMIN" ? "text-red-600 font-medium" : "text-gray-500"}`}>
                            ({junction.role})
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const newRole = junction.role === "ADMIN" ? "MEMBER" : "ADMIN";
                            changePlayerRole.mutate({
                              playerId: junction.playerId,
                              groupId: group.id,
                              newRole: newRole
                            });
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === "admins" && (
        <div>
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {allAdmins?.map((junction) => (
                <li key={junction.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="truncate text-sm font-medium text-indigo-600">
                          {junction.Player.nickname || junction.Player.name}
                        </p>
                        <span className="ml-2 text-sm text-gray-500">→</span>
                        <p className="ml-2 text-sm font-medium text-gray-900">{junction.GameGroup.name}</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {junction.Player.email}
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (confirm(`Demote ${junction.Player.name} from admin in ${junction.GameGroup.name}?`)) {
                            changePlayerRole.mutate({
                              playerId: junction.playerId,
                              groupId: junction.groupId,
                              newRole: "MEMBER"
                            });
                          }
                        }}
                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                      >
                        <UserMinusIcon className="h-5 w-5 mr-1" />
                        Demote to Member
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminView;
