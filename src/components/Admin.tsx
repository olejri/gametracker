import React from "react";
import { useUser } from "@clerk/nextjs";
import { LoadingPage } from "npm/components/loading";
import { api } from "npm/utils/api";

const AdminView = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { data, isLoading, isError, error} = api.user.getPendingPlayers.useQuery({slug: "game-night"})
  const [email, setEmail] = React.useState("");
  const [gameGroup, setGameGroup] = React.useState("");
  const ctx = api.useContext();

  const invitePlayer = api.user.invitePlayer.useMutation({
    onSuccess: () => {
      void ctx.user.getPendingPlayers.invalidate();
    }
  })

  if (!isLoaded || !isSignedIn || !user) {
    return <LoadingPage />;
  }

  if(isLoading) return (<div>Loading...</div>)

  if (isError) {
    return <div>{error?.message}</div>
  }

  const userIsAdmin = user.organizationMemberships.map((membership) => membership.role).includes("admin");
  if (!userIsAdmin) {
    return <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className= "absolute top-0 right-0 flex h-screen w-screen items-center justify-center">
        <h1 className= "text-6xl text-red-500">Not Authorized</h1>
      </div>
    </div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <div
        className="relative rounded-md rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
        <label htmlFor="name" className="block text-xs font-medium text-gray-900">
          Email
        </label>
        <input
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          type="text"
          name="name"
          id="name"
          className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Game Name"
        />
      </div>
      <div
        className="relative rounded-md rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
        <label htmlFor="name" className="block text-xs font-medium text-gray-900">
          Game Group
        </label>
        <input
          onChange={(e) => {
            setGameGroup(e.target.value);
          }}
          type="text"
          name="name"
          id="name"
          className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Game Name"
        />
      </div>
      <button
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      onClick={()=>{
        invitePlayer.mutate({
          email: email,
          slug: gameGroup
        })
      }}
      >
        Invite
      </button>

      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                >
                  Pending invites
                </th>
              </tr>
              </thead>
              <tbody>
              {data.map((player) => (
                <tr key={player.id}>
                  <td>
                    {player.emailAddress}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;