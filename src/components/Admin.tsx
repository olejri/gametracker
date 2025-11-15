import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { UserPlusIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { Button } from "npm/components/ui";

const AdminView = (props: {
  gameGroup: string
}) => {
  const { gameGroup } = props;
  const { data, isLoading, isError, error } = api.user.getPendingPlayers.useQuery({ gameGroup });
  const {
    data: emailInvites,
    isLoading: emailIsLoading,
    isError: emailIsError,
    error: emailError
  } = api.user.getPendingEmailInvites.useQuery();

  const { data: currentPlayer, isLoading: currentPlayerIsLoading } = api.player.getLogInPlayer.useQuery();
  const { data: gamesInGroup, isLoading: allPlayersIsloading, isError: allPlayersIsError, error: allPlayersError } = api.group.getAllPlayersInGroup.useQuery({ gameGroup });
  const { data: allGameGroups, isLoading: allGameGroupsIsLoading } = api.group.getAllGameGroups.useQuery();

  const mutation = api.user.sendInvite.useMutation(
    {
      onSuccess: () => {
        setEmail("");
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );
  const addPlayer = api.player.addPlayer.useMutation({
    onSuccess: () => {
      setName("");
      setNickname("");
      setEmail("");
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const router = useRouter();
  const acceptPlayer = api.user.acceptInvite.useMutation({
    onSuccess: () => {
      void router.push(`/${gameGroup}/dashboard`);
    }
  });

  const promoteToAdmin = api.user.promoteToAdmin.useMutation({
    onSuccess: () => {
      void router.reload();
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const removeUser = api.user.removeUserFromGroup.useMutation({
    onSuccess: () => {
      void router.reload();
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const declineInvite = api.user.declineInvite.useMutation({
    onSuccess: () => {
      void router.reload();
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const toggleHidden = api.group.toggleGroupHidden.useMutation({
    onSuccess: () => {
      void router.reload();
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [nickname, setNickname] = React.useState("");

  // Combine all users into a single list with status information
  const allUsers = React.useMemo(() => {
    const users: Array<{
      id: string;
      nickname: string | null;
      name: string;
      email: string | null;
      clerkId: string | null;
      role: string;
      inviteStatus: string;
      status: "Admin" | "Member" | "Invited" | "Want to join";
      statusColor: string;
    }> = [];

    // Add accepted players (active members and admins)
    gamesInGroup?.forEach((game) => {
      if (game.inviteStatus === "ACCEPTED") {
        users.push({
          id: game.Player.id,
          nickname: game.Player.nickname,
          name: game.Player.name,
          email: game.Player.email,
          clerkId: game.Player.clerkId,
          role: game.role,
          inviteStatus: game.inviteStatus,
          status: game.role === "ADMIN" ? "Admin" : "Member",
          statusColor: game.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        });
      }
    });

    // Add pending players (want to join)
    data?.forEach((junction) => {
      users.push({
        id: junction.Player.id,
        nickname: junction.Player.nickname,
        name: junction.Player.name,
        email: junction.Player.email,
        clerkId: junction.Player.clerkId,
        role: junction.role,
        inviteStatus: junction.inviteStatus,
        status: "Want to join",
        statusColor: "bg-yellow-100 text-yellow-800"
      });
    });

    // Add invited players (email invites that haven't been accepted yet)
    emailInvites?.data.forEach((invite) => {
      // Only add if there's not already a player with this email in pending status
      const existingUser = users.find(u => u.email === invite.email_address);
      if (!existingUser) {
        users.push({
          id: invite.id,
          nickname: null,
          name: invite.email_address,
          email: invite.email_address,
          clerkId: null,
          role: "MEMBER",
          inviteStatus: "INVITED",
          status: "Invited",
          statusColor: "bg-blue-100 text-blue-800"
        });
      }
    });

    return users;
  }, [gamesInGroup, data, emailInvites]);

  if (isLoading || emailIsLoading || allPlayersIsloading || currentPlayerIsLoading || allGameGroupsIsLoading) {
    return <LoadingPage />;
  }

  if (isError || emailIsError || allPlayersIsError) {
    return <p>{error?.message}{emailError?.message}{allPlayersError?.message}</p>;
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {allUsers.map((user) => (
          <li
            key={user.id}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              <div className="flex justify-center mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.statusColor}`}>
                  {user.status}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{user.nickname || user.name}</h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between">
                {user.nickname && <dd className="text-sm text-gray-500">Name: {user.name}</dd>}
                {user.email && <dd className="text-sm text-gray-500">Email: {user.email}</dd>}
                {user.clerkId && <dd className="text-sm text-gray-500">ClerkId: {user.clerkId.substring(0, 10)}</dd>}
                {user.inviteStatus !== "INVITED" && <dd className="text-sm text-gray-500">PlayerId: {user.id.substring(0,8)}</dd>}
              </dl>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                {/* Show accept/decline for pending users */}
                {user.inviteStatus === "PENDING" && (
                  <>
                    <div className="flex w-0 flex-1">
                      <button
                        className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-green-50`}
                        onClick={() => {
                          acceptPlayer.mutate({
                            playerId: user.id,
                            groupId: gameGroup
                          });
                        }}
                        disabled={acceptPlayer.isLoading}
                      >
                        <UserPlusIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
                        Accept
                      </button>
                    </div>
                    <div className="flex w-0 flex-1">
                      <button
                        className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-red-50`}
                        onClick={() => {
                          declineInvite.mutate({
                            playerId: user.id,
                            groupId: gameGroup
                          });
                        }}
                        disabled={declineInvite.isLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-red-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Decline
                      </button>
                    </div>
                  </>
                )}
                {/* Show promote/remove for accepted members */}
                {user.inviteStatus === "ACCEPTED" && (
                  <>
                    {user.role !== "ADMIN" && (
                      <div className="-ml-px flex w-0 flex-1">
                        <button
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50`}
                          onClick={() => {
                            promoteToAdmin.mutate({
                              playerId: user.id,
                              groupId: gameGroup
                            });
                          }}
                          disabled={promoteToAdmin.isLoading}
                        >
                          <ShieldCheckIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
                          Promote to Admin
                        </button>
                      </div>
                    )}
                    {currentPlayer?.id !== user.id && (
                      <div className="-ml-px flex w-0 flex-1">
                        <button
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-red-50`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${user.nickname || user.name} from the group?`)) {
                              removeUser.mutate({
                                playerId: user.id,
                                groupId: gameGroup
                              });
                            }
                          }}
                          disabled={removeUser.isLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    )}
                  </>
                )}
                {/* For invited users, just show status */}
                {user.inviteStatus === "INVITED" && (
                  <div className="flex w-full justify-center py-4">
                    <span className="text-sm text-gray-500">Awaiting acceptance</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {/* Group Visibility Toggle */}
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Group Visibility</h3>
              <p className="mt-1 text-sm text-gray-500">
                {allGameGroups?.find(g => g.id === gameGroup)?.hidden 
                  ? "This group is currently hidden from new players. They cannot see or request to join it."
                  : "This group is visible to all players. They can see it and request to join."}
              </p>
            </div>
            <button
              onClick={() => toggleHidden.mutate({ gameGroup })}
              disabled={toggleHidden.isLoading}
              className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                allGameGroups?.find(g => g.id === gameGroup)?.hidden
                  ? "bg-green-600 hover:bg-green-500 focus-visible:outline-green-600"
                  : "bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {toggleHidden.isLoading ? (
                <>Loading...</>
              ) : allGameGroups?.find(g => g.id === gameGroup)?.hidden ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Unhide Group
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  Hide Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow-none sm:rounded-lg">
        <div
          className="px-4 py-5 sm:p-6"
        >
          <label
            className={"text-sm font-medium text-gray-700"}
          >Invite users</label>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="isolate -space-y-px rounded-md shadow-sm">
                <div
                  className="relative rounded-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                    Name
                  </label>
                  <input
                    onBlur={(e) => {
                      setName(e.target.value);
                    }}
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Full name"
                  />
                </div>
                <div
                  className="relative rounded-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                    Nickname
                  </label>
                  <input
                    onBlur={(e) => {
                      setNickname(e.target.value);
                    }}
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Nickname"
                  />
                </div>
                <div
                  className="relative rounded-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                    Email
                  </label>
                  <input
                    onBlur={(e) => {
                      setEmail(e.target.value);
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
              {mutation.isLoading ? (
                <LoadingSpinner size={30} />
              ) : (
                <Button
                  disabled={mutation.isLoading || email.length === 0 || name.length === 0 || nickname.length === 0}
                  variant="primary"
                  onClick={() => {
                    mutation.mutate({
                      emailAddress: email
                    });
                    addPlayer.mutate({
                      name: name,
                      nickname: nickname,
                      email: email,
                      groupId: gameGroup
                    });
                  }}
                >
                  Invite User
                </Button>
              )}
              {(mutation.isError || addPlayer.isError) &&
                <span className="text-red-500 p-2">{mutation.error?.message}</span>}
            </div>
          </div>
        </div>


      </div>
    </div>);
};

export default AdminView;