import Pusher from "pusher";
import { env } from "npm/env.mjs";
import { timerChannel } from "npm/lib/gameTimer";

let client: Pusher | null | undefined;

// Returns a Pusher client, or null when Pusher is not configured
export function getPusher() {
  if (client !== undefined) return client;
  const { PUSHER_APP_ID, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER } = env;
  client = PUSHER_APP_ID && PUSHER_SECRET && NEXT_PUBLIC_PUSHER_KEY && NEXT_PUBLIC_PUSHER_CLUSTER
    ? new Pusher({
      appId: PUSHER_APP_ID,
      key: NEXT_PUBLIC_PUSHER_KEY,
      secret: PUSHER_SECRET,
      cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true
    })
    : null;
  return client;
}

// Tells every open timer page to refetch. The payload carries no game data.
// A Pusher failure never fails the caller; clients still poll.
export async function notifyTimerUpdate(timerId: string, version: number) {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(timerChannel(timerId), "update", { version });
  } catch (error) {
    console.error("Failed to send timer update to Pusher", error);
  }
}

// Tells open timer pages that the session (and its timer) was deleted
export async function notifyTimerDeleted(timerId: string) {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(timerChannel(timerId), "deleted", {});
  } catch (error) {
    console.error("Failed to send timer deletion to Pusher", error);
  }
}
