import { useGameGroupContext } from "npm/context/GameGroupContext";
import React from "react";
import { useRouter } from "next/router";


type ContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

const NotChosenGameGroup = (props: ContainerProps) => {
  const { gameGroup } = useGameGroupContext();
  const router = useRouter();
  const groupName = router.query.dashboardId as string;

  if (gameGroup === "") {
    return (
      <>
        {props.children}
      </>
    );
  }
  if(groupName !== undefined && groupName !== gameGroup) {
    void router.push("/");
  }
  return null;
};


export default NotChosenGameGroup;
