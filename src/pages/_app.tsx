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

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps} >
      <SignedIn>
        <UserButton />
        <Component {...pageProps} />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
