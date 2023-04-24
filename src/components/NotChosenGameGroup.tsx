import { useGameGroupContext } from "npm/context/GameGroupContext";
import React from "react";


type ContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

const NotChosenGameGroup = (props: ContainerProps) => {
  const { gameGroup } = useGameGroupContext();

  if (gameGroup === "") {
    return (
      <>
        {props.children}
      </>
    );
  }
  return null;
};


export default NotChosenGameGroup;
