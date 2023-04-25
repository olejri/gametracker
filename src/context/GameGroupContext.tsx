
import React, { createContext, useContext } from "react";


interface GameGroupContextType {
  gameGroup: string;
  setGameGroup: (gameGroup: string) => void;
}

export const GameGroupContext = createContext<GameGroupContextType>({
  gameGroup: "",
  setGameGroup: () => {/**/}
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
  const [state, setState] = React.useState<GameGroupContextType>(initialState);

  return (
    <GameGroupContext.Provider value={state}>
      {props.children}
    </GameGroupContext.Provider>
  );
}

export function useGameGroupContext() {
  return useContext(GameGroupContext);
}