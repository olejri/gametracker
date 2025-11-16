import { type AppType } from "next/app";
import {
  ClerkProvider,
  SignedIn,
  SignedOut
} from "@clerk/nextjs";

import { api } from "npm/utils/api";
import "npm/styles/globals.css";
import Head from "next/head";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import JoinGameGroupView from "npm/components/JoinGameGroup";
import { GameGroupContextProvider } from "npm/context/GameGroupContext";
import HasChosenGameGroup from "npm/components/HasChosenGameGroup";
import NotChosenGameGroup from "npm/components/NotChosenGameGroup";
import MainComponent from "npm/components/MainLayout";
import LandingPage from "npm/components/LandingPage";
import { ThemeProvider } from "npm/context/ThemeContext";

const MyApp: AppType = ({ Component, pageProps }) => {

  return (
    <ThemeProvider>
      <ClerkProvider {...pageProps} >
        <SignedIn>
          <GameGroupContextProvider>
            <HasChosenGameGroup>
              <MainComponent >
                <Head>
                  <title>Game Tracker</title>
                  <meta name="description" content="Game Tracker" />
                  <link rel="icon" href="/favicon.ico" />
                </Head>
                <Component {...pageProps} />
              </MainComponent>
            </HasChosenGameGroup>
            <NotChosenGameGroup>
              <JoinGameGroupView />
            </NotChosenGameGroup>
          </GameGroupContextProvider>
        </SignedIn>
        <SignedOut>
          <LandingPage />
        </SignedOut>
      </ClerkProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
