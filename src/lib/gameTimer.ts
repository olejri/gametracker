/**
 * Shared game timer logic, used by the server to apply actions and by the
 * client for optimistic updates and for rendering the running clocks.
 *
 * The server never runs the clock: it stores when the current segment started
 * (turnStartedAt) and how much time each player has banked. The live value is
 * computed from those timestamps.
 */

export const TIMER_STATUSES = ["setup", "running", "admin", "paused", "finished"] as const;
export type TimerStatus = (typeof TIMER_STATUSES)[number];

export const DEFAULT_TIMER_MS = 90 * 60 * 1000;
export const MAX_TIMER_MS = 100 * 60 * 60 * 1000 - 1000;

export type TimerPlayerCore = {
  playerId: string;
  seatOrder: number;
  startMs: number;
  remainingMs: number;
};

export type TimerCore = {
  status: TimerStatus;
  activePlayerId: string | null;
  turnStartedAt: Date | null;
  pausedFrom: TimerStatus | null;
  adminMs: number;
  totalMs: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  version: number;
  players: TimerPlayerCore[];
};

export type TimerAction =
  | { type: "switchTo"; playerId: string }
  | { type: "next" }
  | { type: "toggleAdmin" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "finish" };

// A finished clock segment; playerId null means admin time
export type TimerSegment = {
  playerId: string | null;
  startedAt: Date;
  endedAt: Date;
};

// Public Pusher channel for a timer; the id is an unguessable uuid
export const timerChannel = (timerId: string) => `timer-${timerId}`;

export const toTimerStatus = (value: string | null | undefined): TimerStatus | null =>
  TIMER_STATUSES.find((status) => status === value) ?? null;

export const isClockRunning = (status: TimerStatus) => status === "running" || status === "admin";

const sortBySeat = <T extends { seatOrder: number }>(players: T[]) =>
  [...players].sort((a, b) => a.seatOrder - b.seatOrder);

// Stops the current segment and banks its time into the player's or admin clock
const bankSegment = (state: TimerCore, now: Date): { state: TimerCore; segment: TimerSegment | null } => {
  if (!isClockRunning(state.status) || !state.turnStartedAt) {
    return { state, segment: null };
  }
  const elapsed = Math.max(0, now.getTime() - state.turnStartedAt.getTime());
  const segmentPlayerId = state.status === "admin" ? null : state.activePlayerId;
  const segment = { playerId: segmentPlayerId, startedAt: state.turnStartedAt, endedAt: now };

  if (state.status === "admin") {
    return { state: { ...state, adminMs: state.adminMs + elapsed, turnStartedAt: null }, segment };
  }
  return {
    state: {
      ...state,
      turnStartedAt: null,
      players: state.players.map((player) =>
        player.playerId === state.activePlayerId
          ? { ...player, remainingMs: player.remainingMs - elapsed }
          : player
      )
    },
    segment
  };
};

const nextPlayerId = (state: TimerCore) => {
  const seated = sortBySeat(state.players);
  const index = seated.findIndex((player) => player.playerId === state.activePlayerId);
  return seated[(index + 1) % seated.length]?.playerId ?? null;
};

/**
 * Applies an action at the given server time. Returns null when the action
 * does not apply to the current state (e.g. "next" while paused).
 */
export function applyTimerAction(
  current: TimerCore,
  action: TimerAction,
  now: Date
): { state: TimerCore; segment: TimerSegment | null } | null {
  const running = isClockRunning(current.status);

  switch (action.type) {
    case "switchTo":
    case "next": {
      if (!running) return null;
      const target = action.type === "next" ? nextPlayerId(current) : action.playerId;
      if (!target || !current.players.some((player) => player.playerId === target)) return null;
      if (current.status === "running" && target === current.activePlayerId) return null;
      const { state, segment } = bankSegment(current, now);
      return {
        state: { ...state, status: "running", activePlayerId: target, turnStartedAt: now, version: current.version + 1 },
        segment
      };
    }
    case "toggleAdmin": {
      if (!running) return null;
      const { state, segment } = bankSegment(current, now);
      return {
        state: {
          ...state,
          status: current.status === "admin" ? "running" : "admin",
          turnStartedAt: now,
          version: current.version + 1
        },
        segment
      };
    }
    case "pause": {
      if (!running) return null;
      const { state, segment } = bankSegment(current, now);
      return {
        state: { ...state, status: "paused", pausedFrom: current.status, version: current.version + 1 },
        segment
      };
    }
    case "resume": {
      if (current.status !== "paused") return null;
      return {
        state: {
          ...current,
          status: current.pausedFrom === "admin" ? "admin" : "running",
          pausedFrom: null,
          turnStartedAt: now,
          version: current.version + 1
        },
        segment: null
      };
    }
    case "finish": {
      if (!running && current.status !== "paused") return null;
      const { state, segment } = bankSegment(current, now);
      const usedMs = state.players.reduce((sum, player) => sum + (player.startMs - player.remainingMs), 0);
      return {
        state: {
          ...state,
          status: "finished",
          pausedFrom: null,
          totalMs: usedMs + state.adminMs,
          finishedAt: now,
          version: current.version + 1
        },
        segment
      };
    }
  }
}

// Live remaining time for a player at the given (server) time
export function liveRemainingMs(state: TimerCore, playerId: string, nowMs: number) {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return 0;
  if (state.status === "running" && state.activePlayerId === playerId && state.turnStartedAt) {
    return player.remainingMs - Math.max(0, nowMs - state.turnStartedAt.getTime());
  }
  return player.remainingMs;
}

// Live admin time at the given (server) time
export function liveAdminMs(state: TimerCore, nowMs: number) {
  if (state.status === "admin" && state.turnStartedAt) {
    return state.adminMs + Math.max(0, nowMs - state.turnStartedAt.getTime());
  }
  return state.adminMs;
}

/**
 * Formats milliseconds as h:mm:ss. Negative values get a leading minus, e.g.
 * -0:02:15. Positive values round up so the clock reads 0:00:00 exactly when
 * time runs out.
 */
export function formatClock(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const negative = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  return `${negative ? "-" : ""}${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// True when formatClock would show a minus sign
export const isOvertime = (ms: number) => Math.ceil(ms / 1000) < 0;

/**
 * Parses "h:mm:ss", "m:ss" or plain minutes ("45") into milliseconds.
 * Returns null for anything else.
 */
export function parseClock(value: string): number | null {
  const parts = value.trim().split(":");
  if (parts.length === 0 || parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }
  const numbers = parts.map(Number);
  let seconds: number;
  if (numbers.length === 1) {
    seconds = (numbers[0] ?? 0) * 60;
  } else if (numbers.length === 2) {
    const [m = 0, s = 0] = numbers;
    if (s > 59) return null;
    seconds = m * 60 + s;
  } else {
    const [h = 0, m = 0, s = 0] = numbers;
    if (m > 59 || s > 59) return null;
    seconds = h * 3600 + m * 60 + s;
  }
  const ms = seconds * 1000;
  return ms > 0 && ms <= MAX_TIMER_MS ? ms : null;
}
