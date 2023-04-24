import React, { useContext, useEffect } from "react";
import { GameGroupContext } from "npm/context/GameGroupContext";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

const JoinGameGroupView = () => {
  const { data } = api.group.getActiveGameGroup.useQuery();
  const { setGameGroup } = useContext(GameGroupContext);

  useEffect(() => {
    if (data?.groupId !== undefined) {
      setGameGroup(data.groupId);
    }
  }, [data, setGameGroup]);

  return <LoadingPage />;
};

export default JoinGameGroupView;