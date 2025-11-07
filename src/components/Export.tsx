import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { type DashboardProps } from "npm/components/Types";
import { Button } from "npm/components/ui";

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
      <Button
        variant="primary"
        onClick={() => {
          triggerDownload(data.data, "game-night.csv");
        }}
      >
        Download
      </Button>
      <div className="w-full h-auto">
    <textarea className="w-full" value={data.data} readOnly={true} style={{
      height: "800px"
    }} />
      </div>
    </>
  );
};

export default ExportView;


