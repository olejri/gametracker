import { type AppType } from "next/app";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/nextjs";

import { api } from "npm/utils/api";

import "npm/styles/globals.css";
import { ThemeProvider } from "styled-components";
import { useState } from "react";
import { darkTheme, GlobalStyles, lightTheme } from "npm/styles/ThemeConfig";
import withDashboardChecker from "npm/components/Checker";
import { useRouter } from "next/router";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [theme, setTheme] = useState("light")

  const toggleTheme = () => {
    theme == 'light' ? setTheme('dark') : setTheme('light')
  }
  const ProtectedComponent = withDashboardChecker()(Component);
  const dashboardId = useRouter().query.dashboardId as string

  return (
    <ClerkProvider {...pageProps} >
      <SignedIn>
        <ThemeProvider theme={theme == 'light' ? lightTheme : darkTheme}>
          <GlobalStyles />
          <button onClick={toggleTheme}>{theme == 'light' ? <p>Switch to dark mode</p> : <p>Switch to light mode</p>}</button>
          <UserButton />
          <ProtectedComponent slug={dashboardId}>
            <Component {...pageProps} />
          </ProtectedComponent>
        </ThemeProvider>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Game Tracker</h1>
            <p className="text-lg mb-8">Please sign in to track your favorite games</p>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Sign in
            </button>
          </div>
        </SignInButton>
      </SignedOut>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
