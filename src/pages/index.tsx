import { type NextPage } from "next";
import Head from "next/head";

import { api } from "npm/utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Game Tracker</title>

      </Head>
      <main>
        <h1>Game Tracker</h1>
        {hello.data ? hello.data.greeting : "Loading tRPC query..."}
      </main>
    </>
  );
};

export default Home;
