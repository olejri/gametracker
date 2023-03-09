import { type NextPage } from "next";
import Head from "next/head";

import { api } from "npm/utils/api";
import { useUser } from "@clerk/nextjs";


const Home: NextPage = () => {
  const { isLoaded, isSignedIn, user } = useUser()


  if (!isLoaded || !isSignedIn) {
    return null
  }

    //const saveGame = api.game.addOrUpdateGame.useQuery({
     //   name: "test",
     //   description: "test"
    //})

    //saveGame.isSuccess && console.log(saveGame.data)



  return (
    <>
      <Head>
        <title>Game Tracker</title>
      </Head>
      <main>
        <h1>Game Tracker</h1>
        <h2>Welcome user: {user.firstName}</h2>
      </main>
    </>
  );
};

export default Home;
