import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { UserPlusIcon, ChevronUpIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import dayjs from "dayjs";

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


  const { data: gamesInGroup, isLoading: allPlayersIsloading, isError: allPlayersIsError, error: allPlayersError } = api.group.getAllPlayersInGroup.useQuery({ gameGroup });

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

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [nickname, setNickname] = React.useState("");

  // Add new state to control the visibility of the invitation list
  const [showInvitations, setShowInvitations] = React.useState(false);
  const [showPlayers, setShowPlayers] = React.useState(false);

  if (isLoading || emailIsLoading || allPlayersIsloading) {
    return <LoadingPage />;
  }

  if (isError || emailIsError || allPlayersIsError) {
    return <p>{error?.message}{emailError?.message}{allPlayersError?.message}</p>;
  }

  function ShowInvitationsButton() {
    return <>
      {!showInvitations && (<button type="button"
                                    className="text-gray-700 bg-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2"
                                    onClick={() => setShowInvitations(!showInvitations)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
             stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        <span className="sr-only">Icon description</span>
      </button>)}
      {showInvitations && (<button type="button"
                                   className="text-gray-700 bg-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2"
                                   onClick={() => setShowInvitations(!showInvitations)}>
        <ChevronUpIcon className="w-6 h-6" aria-hidden="true" />
        <span className="sr-only">Icon description</span>
      </button>)}
    </>;
  }

  const players = gamesInGroup?.map((game) =>
  {
    return {
      ...game.Player,
      "role" : game.role
    }
  });

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-sm text-gray-500">Active users in {gameGroup}</span>
        </div>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {players.map((player) => (
          <li
            key={player.id}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              <h3 className="mt-6 text-sm font-medium text-gray-900">{player.nickname}</h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dd className="text-sm text-gray-500">Name: {player.name}</dd>
                <dd className="text-sm text-gray-500">Email: {player.email}</dd>
                {player.role === "ADMIN" ?
                  (<dd className="text-sm text-red-500">Role: {player.role}</dd>)
                  : (<dd className="text-sm text-gray-500">Role: {player.role}</dd>)}
                <dd className="text-sm text-gray-500">ClerkId: {player.clerkId?.substring(0, 10)}</dd>
                <dd className="text-sm text-gray-500">PlayerId: {player.id.substring(0,8)}</dd>
              </dl>
            </div>
            {player.role !== "ADMIN" && (
              <div>
                <div className="-mt-px flex divide-x divide-gray-200">
                  <div className="-ml-px flex w-0 flex-1">
                    <button
                      className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-b-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50`}
                      onClick={() => {
                        promoteToAdmin.mutate({
                          playerId: player.id,
                          groupId: gameGroup
                        });
                      }}
                      disabled={promoteToAdmin.isLoading}
                    >
                      <ShieldCheckIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
                      Promote to Admin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
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
              {mutation.isLoading ? <LoadingSpinner size={30} /> :
                <button
                  disabled={mutation.isLoading || email.length === 0 || name.length === 0 || nickname.length === 0}
                  className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"}
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
                >Invite User
                </button>}
              {(mutation.isError || addPlayer.isError) &&
                <span className="text-red-500 p-2">{mutation.error?.message}</span>}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            {ShowInvitationsButton()}
            <span className="bg-white px-2 text-sm text-gray-500">Pending new users invitations</span>
            {ShowInvitationsButton()}
          </div>
        </div>
        {showInvitations && (<>
          <div className="px-4 py-5 sm:p-6">
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {emailInvites?.data.map((invitation) => (
                <li
                  key={invitation.id}
                  className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
                >
                  <div className="flex flex-1 flex-col p-8">
                    <h3
                      className="mt-6 text-sm font-medium text-gray-900">{dayjs(invitation.created_at).format("DD.MM.YYYY")}</h3>
                    <dl className="mt-1 flex flex-grow flex-col justify-between">
                      <dd className="text-sm text-gray-500">{invitation.email_address}</dd>
                    </dl>
                  </div>
                  <div>
                    <div className="-mt-px flex divide-x divide-gray-200">
                      <div className="-ml-px flex w-0 flex-1">
                      <span
                        className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg py-4 text-sm font-semibold text-gray-900`}
                      >
                        Status
                      </span>
                        <span
                          className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg py-4 text-sm font-semibold bg-yellow-50 text-yellow-700`}
                        >
                        {invitation.status}
                      </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>)}

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">Players that wants to join {gameGroup}</span>
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