import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

/**
 * This page handles the magic link join flow for users who are already
 * signed in and have an active group (the HasChosenGameGroup path in _app.tsx).
 *
 * For signed-out users and signed-in users without an active group, the token
 * is captured via LandingPage / JoinGameGroupView respectively.
 */
const JoinPage: NextPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [error, setError] = useState<string | null>(null);

  const joinByToken = api.group.joinByToken.useMutation({
    onSuccess: async ({ groupId }) => {
      // Clear any stored token now that we've processed it
      if (typeof window !== "undefined") {
        localStorage.removeItem("gametracker_invite_token");
      }
      await router.push(`/${groupId}/dashboard`);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  useEffect(() => {
    if (!router.isReady) return;

    const resolvedToken =
      (typeof token === "string" ? token : null) ??
      (typeof window !== "undefined" ? localStorage.getItem("gametracker_invite_token") : null);

    if (resolvedToken && !joinByToken.isLoading && !joinByToken.isSuccess && !error) {
      joinByToken.mutate({ token: resolvedToken });
    }

    if (!resolvedToken) {
      // No token — redirect home
      void router.push("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, token]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow dark:bg-gray-800 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-red-600 dark:text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite link problem</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={() => void router.push("/")}
            className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  return <LoadingPage />;
};

export default JoinPage;

