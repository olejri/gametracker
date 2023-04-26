import { useGameGroupContext } from "npm/context/GameGroupContext";
import React from "react";
import { useRouter } from "next/router";


type ContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

const HasChosenGameGroup = (props: ContainerProps) => {
  const { gameGroup } = useGameGroupContext();
  const router = useRouter();
  const groupName = router.query.dashboardId as string;

  if (gameGroup === "" || (groupName !== undefined && gameGroup !== groupName)) {
    return null;
  }
  return (
    <>
      {props.children}
    </>
  );
};

export default HasChosenGameGroup;
