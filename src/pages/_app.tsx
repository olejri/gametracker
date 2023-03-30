import { type AppType } from "next/app";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";

import { api } from "npm/utils/api";
import "npm/styles/globals.css";
import withDashboardChecker from "npm/components/Checker";
import { useRouter } from "next/router";
import Head from "next/head";
import "react-datepicker/dist/react-datepicker.css";
import withMainLayout from "npm/components/MainLayout";

const MyApp: AppType = ({ Component, pageProps }) => {
  const ProtectedComponent = withDashboardChecker()(Component);
  const MainComponent = withMainLayout()(Component);
  const dashboardId = useRouter().query.dashboardId as string;

  return (
    <ClerkProvider {...pageProps} >
      <SignedIn>
          <MainComponent slug={dashboardId}>
          <ProtectedComponent slug={dashboardId}>
            <Head>
              <title>Game Tracker</title>
              <meta name="description" content="Game Tracker" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
          </ProtectedComponent>
        </MainComponent>
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
