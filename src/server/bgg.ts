/**
 * BoardGameGeek XML API2 client for game ratings.
 *
 * BGG requires a registered application and a Bearer token for every request
 * (https://boardgamegeek.com/using_the_xml_api). Until BGG_API_TOKEN is set,
 * isBggSyncEnabled() is false and the sync is skipped.
 */
import type { PrismaClient } from "@prisma/client";

const BGG_API_URL = "https://boardgamegeek.com/xmlapi2";
// BGG asks for small batches and roughly one request every 2 seconds
const BATCH_SIZE = 20;
const REQUEST_DELAY_MS = 2000;
const MAX_ATTEMPTS = 5;

export type BggStats = {
  bggId: number;
  average: number | null;
  bayesAverage: number | null;
  rank: number | null;
  usersRated: number | null;
};

export const isBggSyncEnabled = () => !!process.env.BGG_API_TOKEN;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toNumber = (value: string | undefined) => {
  if (value === undefined || value === "" || value === "Not Ranked") return null;
  const n = Number(value);
  return Number.isFinite(n) && n !== 0 ? n : null;
};

const attr = (xml: string, tag: string) =>
  new RegExp(`<${tag}\\s+value="([^"]*)"`).exec(xml)?.[1];

/** Parses the <item> elements of a /thing?stats=1 response. */
export function parseThingStats(xml: string): BggStats[] {
  const items: BggStats[] = [];
  const itemRegex = /<item\b[^>]*\bid="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const [, id, body = ""] = match;
    const rank = /<rank\b[^>]*\bname="boardgame"[^>]*\bvalue="([^"]*)"/.exec(body)?.[1];
    items.push({
      bggId: Number(id),
      average: toNumber(attr(body, "average")),
      bayesAverage: toNumber(attr(body, "bayesaverage")),
      rank: toNumber(rank),
      usersRated: toNumber(attr(body, "usersrated"))
    });
  }
  return items;
}

async function bggFetch(path: string): Promise<string> {
  const token = process.env.BGG_API_TOKEN;
  if (!token) throw new Error("BGG_API_TOKEN is not set");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(`${BGG_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok && res.status !== 202) return await res.text();
    // 202 = queued, 429/503 = slow down; anything else is a real failure
    if (![202, 429, 503].includes(res.status)) {
      throw new Error(`BGG API ${path} failed: ${res.status}`);
    }
    await sleep(REQUEST_DELAY_MS * 2 ** (attempt - 1));
  }
  throw new Error(`BGG API ${path} still busy after ${MAX_ATTEMPTS} attempts`);
}

export async function fetchBggStats(bggIds: number[]): Promise<BggStats[]> {
  const results: BggStats[] = [];
  for (let i = 0; i < bggIds.length; i += BATCH_SIZE) {
    if (i > 0) await sleep(REQUEST_DELAY_MS);
    const ids = bggIds.slice(i, i + BATCH_SIZE).join(",");
    results.push(...parseThingStats(await bggFetch(`/thing?id=${ids}&stats=1`)));
  }
  return results;
}

/** Refreshes the stored rating of every game that has a bggId. */
export async function refreshBggRatings(prisma: PrismaClient) {
  if (!isBggSyncEnabled()) return { skipped: true as const, updated: 0 };

  const games = await prisma.game.findMany({
    where: { bggId: { not: null } },
    select: { id: true, bggId: true }
  });
  const stats = await fetchBggStats(games.map((g) => g.bggId as number));
  const byId = new Map(stats.map((s) => [s.bggId, s]));

  let updated = 0;
  for (const game of games) {
    const s = byId.get(game.bggId as number);
    if (!s) continue;
    await prisma.game.update({
      where: { id: game.id },
      data: {
        bggAverage: s.average,
        bggBayesAverage: s.bayesAverage,
        bggRank: s.rank,
        bggUsersRated: s.usersRated,
        bggUpdatedAt: new Date()
      }
    });
    updated++;
  }
  return { skipped: false as const, updated };
}
