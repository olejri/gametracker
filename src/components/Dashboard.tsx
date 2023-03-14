import { api } from "npm/utils/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { type DashboardProps } from "npm/components/Types";

type Player = {
  id: string;
  name: string;
  clerkId: string;
  organizationSlug: string;
};

type GetPlayerInput = {
  clerkId: string;
};

type GetPlayerOutput = {
  data: Player;
};

const Dashboard = (props: DashboardProps) => {
  const slug = props.id
  const useUser1 = useUser();
  const user = {
    clerkId: useUser1.user?.id || "",
    name: useUser1.user?.fullName || "",
    hasOnlyOneOrg: useUser1.user?.organizationMemberships?.length == 1,
    // hasOnlyOneOrg: true,
    // slug: "mock",
    slug: useUser1.user?.organizationMemberships?.[0]?.organization.slug,
  };

  const { data, error, isLoading } = api.player.getPlayer.useQuery<
    GetPlayerInput,
    GetPlayerOutput
  >(user);

  const addedPlayer = api.player.addPlayer.useMutation();

  useEffect(() => {
    if (!isLoading && !data?.data && slug === user.slug) {
      // Call the addPlayer mutation to add the player
      addedPlayer.mutate({
        clerkId: user.clerkId,
        name: user.name,
        organizationSlug: user.slug,
      });
    }
  }, [data]); // add

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if(!user.hasOnlyOneOrg || slug !== user.slug) {
    return <div>Ask admin about a invite to {slug}</div>
  }

  const player = data?.data;

  return (
    <div>
      <h1>Player Name: {player?.name}</h1>
      <p>Clerk ID: {player?.clerkId}</p>
      <p>Slug from database: {player?.organizationSlug}</p>
      <p>Slug from Clerk: {user.slug}</p>
    </div>
  );
};

export default Dashboard;
