import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { type DashboardProps } from "npm/components/Types";

const ExportView = (props: DashboardProps) => {
  const { groupName } = props;
  const { data, isLoading, isError, error } = api.export.export.useQuery({ groupId: groupName });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <p>{error?.message}</p>;
  }
  function triggerDownload(stringContent = '', filename = 'download.blob') {
    const blob = new Blob([stringContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button
        className={"inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
        onClick={() => {
          triggerDownload(data.data, "game-night.csv");
        }}
      >
        Download
      </button>
      <div className="w-full h-auto">
    <textarea className="w-full" value={data.data} readOnly={true} style={{
      height: "800px"
    }} />
      </div>
    </>
  );
};

export default ExportView;


