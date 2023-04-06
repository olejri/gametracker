import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

const PlayerBoard = (props: {
  groupName: string
  playerId: string
}) => {
  const { data: player, isLoading, isError, error } = api.player.getPlayer.useQuery({clerkId: props.playerId});

  if (isLoading) return <LoadingPage />;
  if (isError) return <div>{error?.message}</div>;

  return (
    <div>{player.nickname}</div>
  );
};
export default PlayerBoard;