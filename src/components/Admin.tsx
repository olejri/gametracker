import React from "react";
import { useUser } from "@clerk/nextjs";
import { LoadingPage } from "npm/components/loading";
import { api } from "npm/utils/api";
import { OrganizationProfile } from '@clerk/clerk-react'

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
    <OrganizationProfile />
  );
};

export default AdminView;