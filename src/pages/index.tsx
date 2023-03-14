import { type NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Home: NextPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { pathname, push } = useRouter();

  if (!isLoaded || !isSignedIn || !user) {
    return null;
  }

  //show the greetings message based on the organization membership
  if (user.organizationMemberships && user.organizationMemberships.length == 1) {
    const slug = user.organizationMemberships[0]?.organization.slug

    if (slug === undefined || slug === null) {
      return <></>;
    }
    const url = `/dashboard/${slug}`;

    if (pathname == "/") {
      void push(url).then(r => console.log(r));
    }
  } else {
    return (
      <>
        Welcome to game tracker, ask for a invite for an organization
      </>
    );
  }
};

export default Home;
