import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TRPCClientError } from "@trpc/client";
import { ArrowLeftIcon, PauseIcon, PlayIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import { env } from "npm/env.mjs";
import { Button, Card, CardContent, StatusBadge } from "npm/components/ui";
import { LoadingSpinner } from "npm/components/loading";
import GameTimerSetup from "npm/components/GameTimerSetup";
import { useToast } from "npm/context/ToastContext";
import { classNames } from "npm/lib/utils";
import {
  applyTimerAction,
  formatClock,
  isClockRunning,
  isOvertime,
  liveAdminMs,
  liveRemainingMs,
  type TimerAction,
  timerChannel
} from "npm/lib/gameTimer";
import { type RouterOutputs } from "npm/utils/api";

type TimerView = NonNullable<RouterOutputs["timer"]["getBySessionId"]["timer"]>;

const pusherKey = env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = env.NEXT_PUBLIC_PUSHER_CLUSTER;
const pusherConfigured = !!pusherKey && !!pusherCluster;

// A failed fetch has no tRPC error data; a server error always does
const isNetworkError = (error: unknown) => !(error instanceof TRPCClientError) || !error.data;

// Re-renders every 250 ms while active so clocks tick
const useNow = (active: boolean) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [active]);
  return now;
};

type WakeLockSentinelLike = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

// Keeps the screen on while the clock runs; failures are fine (not every browser supports it)
const useWakeLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const acquire = async () => {
      const wakeLock = (navigator as WakeLockNavigator).wakeLock;
      if (!wakeLock || document.visibilityState !== "visible") return;
      try {
        const lock = await wakeLock.request("screen");
        if (cancelled) {
          void lock.release().catch(() => undefined);
        } else {
          sentinel = lock;
        }
      } catch {
        // Battery saver or an unsupported browser; the timer still works
      }
    };
    // The browser drops the lock when the page is hidden
    const onVisibility = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      if (sentinel) void sentinel.release().catch(() => undefined);
    };
  }, [active]);
};

const GameTimer = (props: { groupId: string; sessionId: string }) => {
  const { sessionId } = props;
  const utils = api.useContext();
  const { showToast } = useToast();
  const offsetRef = useRef(0);
  const [optimistic, setOptimistic] = useState<TimerView | null>(null);
  const [online, setOnline] = useState(true);
  const [pusherConnected, setPusherConnected] = useState(false);
  const [pusherDown, setPusherDown] = useState(false);
  const [mutationFailed, setMutationFailed] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const query = api.timer.getBySessionId.useQuery(
    { sessionId },
    {
      enabled: !!sessionId,
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: (data) => {
        const status = data?.timer?.status;
        if (status === "finished") return false;
        if (pusherConnected) return 15000;
        if (status === "running" || status === "admin" || status === "paused") return 2000;
        return 5000;
      },
      onSuccess: (data) => {
        offsetRef.current = data.serverNow.getTime() - Date.now();
        setMutationFailed(false);
      }
    }
  );
  const { refetch } = query;
  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const serverTimer = query.data?.timer ?? null;
  const timer = optimistic ?? serverTimer;
  const timerId = serverTimer?.id ?? null;
  const status = timer?.status ?? null;
  const ticking = !!status && isClockRunning(status);

  // Refetch whenever the phone comes back: focus, unlock, network
  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      refresh();
    };
    const onOffline = () => setOnline(false);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  // Live push when Pusher is configured; polling covers everything else
  useEffect(() => {
    if (!pusherConfigured || !timerId || !pusherKey || !pusherCluster) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;
    void import("pusher-js").then(({ default: Pusher }) => {
      if (disposed) return;
      const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      const channel = pusher.subscribe(timerChannel(timerId));
      channel.bind("update", refresh);
      pusher.connection.bind("state_change", (states: { previous: string; current: string }) => {
        setPusherConnected(states.current === "connected");
        setPusherDown(states.current === "unavailable" || states.current === "failed");
        if (states.current === "connected" && states.previous !== "initialized") refresh();
      });
      cleanup = () => {
        channel.unbind_all();
        pusher.unsubscribe(timerChannel(timerId));
        pusher.disconnect();
      };
    });
    return () => {
      disposed = true;
      cleanup?.();
      setPusherConnected(false);
      setPusherDown(false);
    };
  }, [timerId, refresh]);

  useWakeLock(ticking);
  const now = useNow(ticking) + offsetRef.current;

  const mutationOptions = {
    onSuccess: (data: RouterOutputs["timer"]["next"]) => {
      offsetRef.current = data.serverNow.getTime() - Date.now();
      utils.timer.getBySessionId.setData({ sessionId }, { timer: data.timer, serverNow: data.serverNow });
      setMutationFailed(false);
    },
    onError: (error: unknown) => {
      if (isNetworkError(error)) {
        setMutationFailed(true);
      } else {
        showToast("Could not update the timer", "error");
      }
      refresh();
    }
  };
  const mutations = {
    switchTo: api.timer.switchTo.useMutation(mutationOptions),
    next: api.timer.next.useMutation(mutationOptions),
    toggleAdmin: api.timer.toggleAdmin.useMutation(mutationOptions),
    pause: api.timer.pause.useMutation(mutationOptions),
    resume: api.timer.resume.useMutation(mutationOptions),
    finish: api.timer.finish.useMutation(mutationOptions)
  };
  const start = api.timer.saveSetupAndStart.useMutation({
    ...mutationOptions,
    onSuccess: (data) => {
      mutationOptions.onSuccess(data);
      if (!data.applied) showToast("Someone already started this timer", "info");
    }
  });

  const reconnecting = !online || pusherDown || mutationFailed || query.isRefetchError;
  const busy = Object.values(mutations).some((mutation) => mutation.isLoading);
  const disabled = reconnecting || busy;

  // Shows the result straight away on this phone, then the server's answer replaces it
  const act = async (action: TimerAction) => {
    if (!timer || disabled) return;
    const result = applyTimerAction(timer, action, new Date(Date.now() + offsetRef.current));
    if (!result) return;
    await utils.timer.getBySessionId.cancel({ sessionId });
    setOptimistic({
      ...timer,
      ...result.state,
      players: timer.players.map((player) => ({
        ...player,
        remainingMs: result.state.players.find((p) => p.playerId === player.playerId)?.remainingMs ?? player.remainingMs
      }))
    });
    const base = { timerId: timer.id, expectedVersion: timer.version };
    try {
      switch (action.type) {
        case "switchTo":
          await mutations.switchTo.mutateAsync({ ...base, playerId: action.playerId });
          break;
        default:
          await mutations[action.type].mutateAsync(base);
      }
    } catch {
      // Handled in onError
    } finally {
      setOptimistic(null);
    }
  };

  if (query.isLoading) {
    return (
      <TimerShell groupId={props.groupId} sessionId={sessionId}>
        <div className="flex justify-center py-10">
          <LoadingSpinner size={32} />
        </div>
      </TimerShell>
    );
  }
  if (query.isError && !query.data) {
    return (
      <TimerShell groupId={props.groupId} sessionId={sessionId}>
        <div className="mt-4 text-center text-gray-900 dark:text-white">{query.error.message}</div>
      </TimerShell>
    );
  }

  const statusBadge = status === "running"
    ? <StatusBadge color="green">Running</StatusBadge>
    : status === "admin"
      ? <StatusBadge color="yellow">Admin</StatusBadge>
      : status === "paused"
        ? <StatusBadge color="blue">Paused</StatusBadge>
        : status === "finished"
          ? <StatusBadge color="gray">Finished</StatusBadge>
          : null;

  return (
    <TimerShell groupId={props.groupId} sessionId={sessionId} badge={statusBadge}>
      {reconnecting && (
        <div className="flex items-center justify-center gap-2 bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          <LoadingSpinner size={14} />
          Reconnecting…
        </div>
      )}
      {!timer || timer.status === "setup" ? (
        <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto p-4">
          <GameTimerSetup
            sessionId={sessionId}
            disabled={reconnecting}
            isStarting={start.isLoading}
            onStart={(players) => start.mutate({ sessionId, players })}
          />
        </div>
      ) : timer.status === "finished" ? (
        <TimerSummary timer={timer} groupId={props.groupId} sessionId={sessionId} />
      ) : (
        <>
          <div className="relative flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-3">
              <div
                className={classNames(
                  "flex items-center justify-between rounded-lg px-4 py-2",
                  timer.status === "admin"
                    ? "bg-yellow-100 ring-2 ring-yellow-500 dark:bg-yellow-900/40"
                    : "bg-white dark:bg-gray-800"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <WrenchScrewdriverIcon className="h-5 w-5" aria-hidden="true" />
                  Admin time
                </span>
                <span className="font-mono text-xl font-semibold tabular-nums text-gray-900 dark:text-white">
                  {formatClock(liveAdminMs(timer, now))}
                </span>
              </div>
              <div className={classNames("grid gap-3", timer.players.length > 3 ? "grid-cols-2" : "grid-cols-1")}>
                {timer.players.map((player) => {
                  const remaining = liveRemainingMs(timer, player.playerId, now);
                  const isActive = player.playerId === timer.activePlayerId;
                  const isRunning = isActive && timer.status === "running";
                  return (
                    <button
                      key={player.playerId}
                      type="button"
                      disabled={disabled || timer.status === "paused"}
                      onClick={() => void act({ type: "switchTo", playerId: player.playerId })}
                      className={classNames(
                        "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-4 shadow transition active:scale-[0.98] disabled:cursor-not-allowed",
                        isRunning
                          ? "bg-indigo-50 ring-4 ring-indigo-500 dark:bg-indigo-900/40"
                          : "bg-white dark:bg-gray-800",
                        isActive && timer.status !== "running" && "border-2 border-dashed border-indigo-300 dark:border-indigo-700"
                      )}
                    >
                      <span className="flex max-w-full items-center gap-2">
                        <Image
                          src={player.profileImageUrl}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 flex-shrink-0 rounded-full"
                        />
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{player.name}</span>
                      </span>
                      <span
                        className={classNames(
                          "font-mono font-bold tabular-nums",
                          timer.players.length > 3 ? "text-3xl" : "text-5xl",
                          isOvertime(remaining)
                            ? "text-red-600 dark:text-red-400"
                            : isRunning
                              ? "text-indigo-700 dark:text-indigo-300"
                              : "text-gray-900 dark:text-white"
                        )}
                      >
                        {formatClock(remaining)}
                      </span>
                      {isActive && timer.status === "admin" && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Back to this player after admin</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {timer.status === "paused" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100/80 backdrop-blur-sm dark:bg-gray-900/80">
                <PauseIcon className="h-12 w-12 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">Paused for everyone</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">No clock is counting.</p>
                <Button
                  variant="success"
                  className="justify-center px-8 py-3 text-lg disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => void act({ type: "resume" })}
                >
                  <PlayIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Resume
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
              {confirmFinish ? (
                <div className="flex flex-col gap-2">
                  <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
                    Finish the timer for everyone? This can&apos;t be undone.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" className="justify-center py-3" onClick={() => setConfirmFinish(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      className="justify-center py-3 disabled:opacity-50"
                      disabled={disabled}
                      onClick={() => {
                        setConfirmFinish(false);
                        void act({ type: "finish" });
                      }}
                    >
                      Finish timer
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="w-full justify-center py-4 text-lg disabled:opacity-50"
                    disabled={disabled || timer.status === "paused"}
                    onClick={() => void act({ type: "next" })}
                  >
                    Next player
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={disabled || timer.status === "paused"}
                      onClick={() => void act({ type: "toggleAdmin" })}
                      className={classNames(
                        "rounded-md px-2 py-3 text-sm font-medium shadow-sm disabled:opacity-50",
                        timer.status === "admin"
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"
                      )}
                    >
                      {timer.status === "admin" ? "End admin" : "Admin"}
                    </button>
                    <Button
                      variant="secondary"
                      className="justify-center py-3 disabled:opacity-50"
                      disabled={disabled}
                      onClick={() => void act({ type: timer.status === "paused" ? "resume" : "pause" })}
                    >
                      {timer.status === "paused" ? "Resume" : "Pause"}
                    </Button>
                    <Button
                      variant="danger"
                      className="justify-center py-3 disabled:opacity-50"
                      disabled={disabled}
                      onClick={() => setConfirmFinish(true)}
                    >
                      Finish
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </TimerShell>
  );
};

// Full-screen frame above the app navigation, with a way back to the session
const TimerShell = (props: {
  groupId: string;
  sessionId: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-40 flex flex-col bg-gray-100 dark:bg-gray-900">
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] dark:border-gray-700 dark:bg-gray-800">
      <Link
        href={`/${props.groupId}/session/${props.sessionId}`}
        aria-label="Back to session"
        className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </Link>
      <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">Game timer</h1>
      {props.badge}
    </div>
    {props.children}
  </div>
);

const TimerSummary = (props: { timer: TimerView; groupId: string; sessionId: string }) => {
  const { timer } = props;
  const totalMs = timer.totalMs ?? 0;
  const adminShare = totalMs > 0 ? Math.round((timer.adminMs / totalMs) * 100) : 0;
  return (
    <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-3">
        <Card>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total time</p>
              <p className="font-mono text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">{formatClock(totalMs)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin time</p>
              <p className="font-mono text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">
                {formatClock(timer.adminMs)}
                <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">{adminShare}%</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">Player</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">Used</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">Overtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {timer.players.map((player) => {
                const usedMs = player.startMs - player.remainingMs;
                const overtimeMs = Math.max(0, -player.remainingMs);
                return (
                  <tr key={player.playerId}>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <Image src={player.profileImageUrl} alt="" width={24} height={24} className="h-6 w-6 rounded-full" />
                        <span className="truncate text-gray-900 dark:text-white">{player.name}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">of {formatClock(player.startMs)}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-gray-900 dark:text-white">{formatClock(usedMs)}</td>
                    <td
                      className={classNames(
                        "px-3 py-2 text-right font-mono tabular-nums",
                        overtimeMs > 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {overtimeMs > 0 ? formatClock(overtimeMs) : "–"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <Link
          href={`/${props.groupId}/session/${props.sessionId}`}
          className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          Back to session
        </Link>
      </div>
    </div>
  );
};

export default GameTimer;
