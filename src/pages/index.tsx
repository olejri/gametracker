import { type NextPage } from "next";
import Head from "next/head";

import { api } from "npm/utils/api";
import { useUser } from '@clerk/nextjs'

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <>
      <Head>
        <title>Game Tracker</title>
      </Head>
      <main>
        <h1>Game Tracker</h1>
        <h2>Welcome user: {user.firstName}</h2>
        {hello.data ? hello.data.greeting : "Loading tRPC query..."}
      </main>
    </>
  );
};

export default Home;
