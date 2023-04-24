import { useGameGroupContext } from "npm/context/GameGroupContext";
import React from "react";


type ContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

const HasChosenGameGroup = (props: ContainerProps) => {
  const { gameGroup } = useGameGroupContext();
  if (gameGroup === "") {
    return null;
  }

  return (
    <>
      {props.children}
    </>
  );
};

export default HasChosenGameGroup;
