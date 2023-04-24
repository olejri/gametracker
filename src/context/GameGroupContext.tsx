
import React, { createContext, useContext } from "react";

export const GameGroupContext = createContext({
  gameGroup: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setGameGroup: (gameGroup: string) => { }
});

type ContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

export const GameGroupContextProvider = (props: ContainerProps) => {
  const setGameGroup = (gameGroup: string) => {
    setState({
      ...state,
      gameGroup: gameGroup
    })
  }

  const initialState = {
    gameGroup: "",
    setGameGroup: setGameGroup
  }
  const [state, setState] = React.useState(initialState);

  return (
    <GameGroupContext.Provider value={state}>
      {props.children}
    </GameGroupContext.Provider>
  );
}

export function useGameGroupContext() {
  return useContext(GameGroupContext);
}