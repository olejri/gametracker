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
import React, { useEffect, useState } from "react";
import JoinGameGroupView from "npm/components/JoinGameGroup";
import { GameGroupContextProvider } from "npm/context/GameGroupContext";
import HasChosenGameGroup from "npm/components/HasChosenGameGroup";
import NotChosenGameGroup from "npm/components/NotChosenGameGroup";
import MainComponent from "npm/components/MainLayout";
import LandingPage from "npm/components/LandingPage";
import { ThemeProvider, useTheme } from "npm/context/ThemeContext";
import { ToastProvider } from "npm/context/ToastContext";
import { getClerkAppearance } from "npm/lib/clerkAppearance";

// Tells the Clerk theme when the (always dark) landing page is showing
const LandingPageMarker = (props: { setIsLandingPage: (value: boolean) => void }) => {
  const { setIsLandingPage } = props;
  useEffect(() => {
    setIsLandingPage(true);
    return () => setIsLandingPage(false);
  }, [setIsLandingPage]);
  return null;
};

const ThemedClerkProvider = (props: { pageProps: Record<string, unknown>; children: (setIsLandingPage: (value: boolean) => void) => React.ReactNode }) => {
  const { isDarkMode } = useTheme();
  const [isLandingPage, setIsLandingPage] = useState(false);
  return (
    <ClerkProvider {...props.pageProps} appearance={getClerkAppearance(isDarkMode, isLandingPage)}>
      {props.children(setIsLandingPage)}
    </ClerkProvider>
  );
};

const MyApp: AppType = ({ Component, pageProps }) => {

  return (
    <ThemeProvider>
      <ToastProvider>
        <ThemedClerkProvider pageProps={pageProps as Record<string, unknown>}>
          {(setIsLandingPage) => (
          <>
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
            <LandingPageMarker setIsLandingPage={setIsLandingPage} />
            <LandingPage />
          </SignedOut>
          </>
          )}
        </ThemedClerkProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
