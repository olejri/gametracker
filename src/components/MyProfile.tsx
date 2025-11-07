import React, { useEffect } from "react";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { api } from "npm/utils/api";
import { Button } from "npm/components/ui";

const MyProfile = () => {
  const ctx = api.useContext();
  const { data: player, isLoading, isError, error } = api.player.getLogInPlayer.useQuery();
  const mutation = api.player.updatePlayer.useMutation({
    onSuccess: () => {
      void ctx.player.getLogInPlayer.invalidate();
    }
  });

  const [nickname, setNickname] = React.useState(player?.nickname ?? "");
  useEffect(() => {
    setNickname(player?.nickname ?? "");

  }, [player?.nickname]);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <div>{error?.message}</div>;
  }
  function isNicknameDifferent() {
    return nickname !== player?.nickname;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="isolate -space-y-px rounded-md shadow-sm">
              <div
                className="relative rounded-md rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                  Name
                </label>
                <input
                  value={player.name}
                  disabled={true}
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                />
              </div>
              <div
                className="relative rounded-md rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="nickname" className="block text-xs font-medium text-gray-900">
                  Nickname
                </label>
                <input
                  onChange={(e) => {
                    setNickname(e.target.value)
                  }}
                  value={nickname}
                  type="text"
                  name="nickname"
                  id="nickname"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Choose a nickname"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            {!mutation.isLoading ? (
              <Button
                disabled={mutation.isLoading || !isNicknameDifferent()}
                variant="primary"
                onClick={() => {
                  mutation.mutate({ nickname });
                }}
              >
                Update profile
              </Button>
            ) : (
              <LoadingSpinner size={30} />
            )}
            {mutation.isError && <div className="text-red-500">{mutation.error?.message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyProfile;