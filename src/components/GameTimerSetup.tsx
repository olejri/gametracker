import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { api } from "npm/utils/api";
import { Button, Card, CardContent, Input } from "npm/components/ui";
import { LoadingSpinner } from "npm/components/loading";
import { classNames } from "npm/lib/utils";
import { formatClock, parseClock } from "npm/lib/gameTimer";

type SetupRow = {
  playerId: string;
  name: string;
  profileImageUrl: string;
  timeText: string;
};

const GameTimerSetup = (props: {
  sessionId: string;
  disabled: boolean;
  isStarting: boolean;
  onStart: (players: { playerId: string; seatOrder: number; startMs: number }[]) => void;
}) => {
  const { data: defaults, isLoading, isError, error } = api.timer.getDefaults.useQuery(
    { sessionId: props.sessionId },
    { refetchOnWindowFocus: false }
  );
  const [rows, setRows] = useState<SetupRow[] | null>(null);
  const [everyoneText, setEveryoneText] = useState("");

  // Fill the form once; later refetches must not overwrite what the user typed
  useEffect(() => {
    if (!defaults || rows !== null) return;
    setEveryoneText(formatClock(defaults.defaultMs));
    setRows(
      defaults.players.map((player) => ({
        playerId: player.playerId,
        name: player.name,
        profileImageUrl: player.profileImageUrl,
        timeText: formatClock(player.startMs)
      }))
    );
  }, [defaults, rows]);

  if (isLoading || rows === null) {
    if (isError) {
      return <div className="mt-4 text-center text-gray-900 dark:text-white">{error.message}</div>;
    }
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300">Add players to the session before starting a timer.</p>
        </CardContent>
      </Card>
    );
  }

  const everyoneMs = parseClock(everyoneText);
  const parsed = rows.map((row) => parseClock(row.timeText));
  const allValid = parsed.every((ms) => ms !== null);

  const setEveryone = (value: string) => {
    setEveryoneText(value);
    const ms = parseClock(value);
    if (ms !== null) {
      setRows((current) => current?.map((row) => ({ ...row, timeText: formatClock(ms) })) ?? null);
    }
  };

  const setRowTime = (playerId: string, value: string) => {
    setRows((current) => current?.map((row) => (row.playerId === playerId ? { ...row, timeText: value } : row)) ?? null);
  };

  const move = (index: number, direction: -1 | 1) => {
    setRows((current) => {
      if (!current) return current;
      const target = index + direction;
      const moved = current[index];
      const other = current[target];
      if (!moved || !other) return current;
      const next = [...current];
      next[index] = other;
      next[target] = moved;
      return next;
    });
  };

  const start = () => {
    if (!allValid) return;
    props.onStart(rows.map((row, seatOrder) => ({
      playerId: row.playerId,
      seatOrder,
      startMs: parsed[seatOrder] ?? 0
    })));
  };

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardContent className="flex flex-col gap-2">
          <Input
            label="Time for everyone (h:mm:ss)"
            id="timer-everyone"
            value={everyoneText}
            autoComplete="off"
            onChange={(e) => setEveryone(e.target.value)}
            onBlur={() => everyoneMs !== null && setEveryoneText(formatClock(everyoneMs))}
            error={everyoneMs === null ? "Use h:mm:ss, for example 1:30:00" : undefined}
          />
          {(defaults?.fromPreviousTimer || defaults?.fromSeatRoll) && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {[
                defaults.fromSeatRoll ? "Seat order comes from the seat roll." : null,
                defaults.fromPreviousTimer ? "Times are copied from your last timer for this game." : null
              ].filter(Boolean).join(" ")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, index) => (
            <li key={row.playerId} className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">{index + 1}</span>
              <Image
                src={row.profileImageUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 flex-shrink-0 rounded-full"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-white">{row.name}</span>
              <input
                aria-label={`Time for ${row.name}`}
                value={row.timeText}
                autoComplete="off"
                onChange={(e) => setRowTime(row.playerId, e.target.value)}
                onBlur={() => {
                  const ms = parsed[index];
                  if (ms != null) setRowTime(row.playerId, formatClock(ms));
                }}
                className={classNames(
                  "w-24 rounded-lg border bg-gray-50 p-2 text-center font-mono text-sm tabular-nums text-gray-900 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:text-white",
                  parsed[index] === null
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                )}
              />
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label={`Move ${row.name} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded p-0.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronUpIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${row.name} down`}
                  disabled={index === rows.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded p-0.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
        Player 1 starts. Change a single player&apos;s time to give them a handicap.
      </p>

      <Button
        variant="success"
        className="w-full justify-center py-3 text-base disabled:opacity-50"
        disabled={!allValid || props.disabled || props.isStarting}
        onClick={start}
      >
        {props.isStarting ? "Starting..." : "Start timer"}
      </Button>
    </div>
  );
};

export default GameTimerSetup;
