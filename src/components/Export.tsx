import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { type DashboardProps } from "npm/components/Types";
import { Button } from "npm/components/ui";

function triggerDownload(stringContent = '', filename = 'download.blob', type = 'text/plain') {
  const blob = new Blob([stringContent], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const ExportView = (props: DashboardProps) => {
  const { groupName } = props;
  const { data, isLoading, isError, error } = api.export.export.useQuery({ groupId: groupName });
  const games = api.export.exportGames.useQuery();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <p className="text-gray-900 dark:text-white">{error?.message}</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          className="w-full justify-center sm:w-auto"
          onClick={() => {
            triggerDownload(data.data, "game-night.csv");
          }}
        >
          Download sessions (.csv)
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-center disabled:opacity-50 sm:w-auto"
          disabled={!games.data}
          onClick={() => {
            if (games.data) {
              triggerDownload(games.data.data, "games.json", "application/json");
            }
          }}
        >
          {games.data ? `Download all games (.json, ${games.data.count})` : "Download all games (.json)"}
        </Button>
      </div>
      {games.isError && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{games.error?.message}</p>
      )}
      <div className="mt-4 w-full">
        <textarea
          className="h-64 w-full whitespace-pre rounded-md border-gray-300 bg-white font-mono text-xs text-gray-900 sm:h-[800px] sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          value={data.data}
          readOnly={true}
          wrap="off"
        />
      </div>
    </>
  );
};

export default ExportView;
