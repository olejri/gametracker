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

const MyApp: AppType = ({ Component, pageProps }) => {

  return (
    <ClerkProvider 
      {...pageProps}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#22c55e", // green-500
          colorBackground: "#1f2937", // gray-800
          colorInputBackground: "#374151", // gray-700
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#d1d5db", // gray-300
          colorDanger: "#ef4444",
        },
        elements: {
          rootBox: "bg-gray-800",
          card: "bg-gray-800 border-gray-700",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-300",
          socialButtonsBlockButton: "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white",
          formButtonPrimary: "bg-green-500 hover:bg-green-600",
          formFieldInput: "bg-gray-700 border-gray-600 text-white",
          footerActionLink: "text-green-500 hover:text-green-400",
          identityPreviewText: "text-white",
          formFieldLabel: "text-gray-300",
        }
      }}
    >
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
  );
};

export default api.withTRPC(MyApp);
