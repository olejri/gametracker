import { api } from "npm/utils/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { type DashboardProps, type GetPlayerInput, type GetPlayerOutput, type Player } from "npm/components/Types";
import { useRouter } from "next/navigation";

const Dashboard = (props: DashboardProps) => {
  const slug = props.groupName;
  const clerk = useUser();
  const [player, setPlayer] = useState<Player>();
  const [isLoadingPlayer, setIsLoadingPlayer] = useState<boolean>(false);
  const [errorPlayer, setErrorPlayer] = useState<Error | undefined>();
  const router = useRouter();

  const user = {
    clerkId: clerk.user?.id || "",
    name: clerk.user?.fullName || "",
    hasOnlyOneOrg: clerk.user?.organizationMemberships?.length == 1,
    slug: clerk.user?.organizationMemberships?.[0]?.organization.slug,
  };

  const { data, error, isLoading } = api.player.getPlayer.useQuery<
    GetPlayerInput,
    GetPlayerOutput
  >(user);

  const addedPlayer = api.player.addPlayer.useMutation();
  const addGroup = api.group.addOrGetGroup.useMutation();

  useEffect(() => {
    if (!isLoading && !data?.data && slug === user.slug) {
      setIsLoadingPlayer(true);
      setErrorPlayer(undefined);
      addGroup.mutate({
        id: user.slug
      });
      // Call the addPlayer mutation to add the player
      addedPlayer.mutate({
        clerkId: user.clerkId,
        name: user.name,
        groupId: user.slug
      }, {
        onSuccess: (data) => {
          setPlayer(data.data);
          setIsLoadingPlayer(false);
        },
        onError: (error) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setErrorPlayer(error);
          setIsLoadingPlayer(false);
        }
      });
    }
  }, [data]); // add

  if (isLoading || isLoadingPlayer) {
    return <div>Loading...</div>;
  }

  if (error || errorPlayer) {
    return <div>Error: {error?.message || errorPlayer?.message}</div>;
  }

  if (!user.hasOnlyOneOrg || slug !== user.slug) {
    return <div>Ask admin about a invite to {slug}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Player Name: {(data?.data?.nickname ?? data?.data?.name) || player?.name}</h1>
      <div className="grid gap-4">
        <div className="flex">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => router.push(`/games/collection`)}>
            Check game collection
          </button>
        </div>
        <div className="flex ">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => router.push(`/games/search`)}>
            Add a new board game
          </button>
        </div>

        <div className="flex">
          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => router.push(`/games/overview`)}>
            Overview of boardgames
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
