import React, { useState } from "react";
import { api } from "npm/utils/api";
import { type DashboardProps, type RecordedSession } from "npm/components/Types";

const RecordSession = (props: DashboardProps) => {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sessionData, setSessionData] = useState<RecordedSession>();

  const handleInputValueChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const result = api.session.addACompletedSession.useMutation()

  const handleSaveButtonClick = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedData: RecordedSession = JSON.parse(inputValue);
      const session: RecordedSession = {
        players: parsedData.players,
        gameName: parsedData.gameName,
        groupId: props.groupName,
        status: parsedData.status,
        createdAt: new Date(parsedData.createdAt),
        updatedAt: new Date(parsedData.updatedAt),
      };
      setSessionData(session);
      result.mutate({
        data : session
      })
      {
        if (result.isSuccess) {
          setSuccessMessage("Session saved successfully!");
          setInputValue("")
        }
        if (result.error) {
          setErrorMessage(result.error.message);
        }
      }
    } catch (error) {
      setErrorMessage("Invalid JSON data");
    }
    setInputValue("");
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <textarea
        className="block w-full border-gray-900 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        rows={10}
        value={inputValue}
        onChange={handleInputValueChange}
        placeholder="Paste JSON data here"
      />
      <button
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleSaveButtonClick}
      >
        Save Recorded Session for {props.groupName}
      </button>
      {errorMessage && <div className="mt-4 text-red-600">{errorMessage}</div>}
      {successMessage && <div className="mt-4 text-green-600">{successMessage}</div>}
      {sessionData && (
        <div className="mt-4">
          <h2 className="text-lg font-medium mb-2">Session Data</h2>
          <p>
            Game Name: <span className="font-medium">{sessionData.gameName}</span>
          </p>
          <p>
            Status: <span className="font-medium">{sessionData.status}</span>
          </p>
          <p>
            Created At: <span className="font-medium">{sessionData.createdAt.toLocaleString()}</span>
          </p>
          <p>
            Updated At: <span className="font-medium">{sessionData.updatedAt.toLocaleString()}</span>
          </p>
          <h3 className="text-base font-medium mt-4">Players</h3>
          <ul className="list-disc ml-4">
            {sessionData.players.map((player) => (
              <li key={player.playerId}>
                <p>
                  Player ID: <span className="font-medium">{player.playerId}</span>
                </p>
                <p>
                  Position: <span className="font-medium">{player.position}</span>
                </p>
                <p>
                  Score: <span className="font-medium">{player.score}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecordSession;
