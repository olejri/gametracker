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

export type BggSearchResult = {
  bggId: number;
  name: string;
  year: number | null;
  isExpansion: boolean;
};

export type BggGame = BggStats & {
  name: string;
  year: number | null;
  isExpansion: boolean;
  image: string | null;
  description: string;
  players: string;
  playtime: string;
  mechanics: string[];
  categories: string[];
  // For an expansion: the BGG ids of the games it expands
  baseGameBggIds: number[];
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“"
};

export const decodeXmlEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number(entity.slice(1)));
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });

const range = (min: number | null, max: number | null, unit = "") => {
  if (!min && !max) return "?";
  if (!min || !max || min === max) return `${(min || max) ?? ""}${unit}`;
  return `${min}-${max}${unit}`;
};

/** Parses a /search response. */
export function parseSearch(xml: string): BggSearchResult[] {
  const results: BggSearchResult[] = [];
  const itemRegex = /<item\b[^>]*\btype="(\w+)"[^>]*\bid="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const [, type, id, body = ""] = match;
    const name = /<name\b[^>]*\bvalue="([^"]*)"/.exec(body)?.[1];
    if (!name) continue;
    results.push({
      bggId: Number(id),
      name: decodeXmlEntities(name),
      year: toNumber(attr(body, "yearpublished")),
      isExpansion: type === "boardgameexpansion"
    });
  }
  return results;
}

/** Parses the first <item> of a /thing?stats=1 response into game details. */
export function parseThing(xml: string): BggGame | null {
  const item = /<item\b[^>]*\btype="(\w+)"[^>]*\bid="(\d+)"[^>]*>([\s\S]*?)<\/item>/.exec(xml);
  if (!item) return null;
  const [, type, id, body = ""] = item;
  const stats = parseThingStats(xml)[0];
  const links = (linkType: string, inbound?: boolean) =>
    [...body.matchAll(/<link\b([^>]*)\/>/g)]
      .map((m) => m[1] ?? "")
      .filter((a) => a.includes(`type="${linkType}"`) && (inbound === undefined || a.includes('inbound="true"') === inbound))
      .map((a) => ({ id: Number(/\bid="(\d+)"/.exec(a)?.[1]), value: decodeXmlEntities(/\bvalue="([^"]*)"/.exec(a)?.[1] ?? "") }));

  const primaryName = /<name\b[^>]*\btype="primary"[^>]*\bvalue="([^"]*)"/.exec(body)?.[1] ?? "";
  // BGG escapes descriptions twice (e.g. "&amp;rsquo;"), so decode twice
  const description = decodeXmlEntities(decodeXmlEntities(/<description>([\s\S]*?)<\/description>/.exec(body)?.[1] ?? "")).trim();
  const minPlayers = toNumber(attr(body, "minplayers"));
  const maxPlayers = toNumber(attr(body, "maxplayers"));
  const minTime = toNumber(attr(body, "minplaytime"));
  const maxTime = toNumber(attr(body, "maxplaytime"));
  const isExpansion = type === "boardgameexpansion";

  return {
    bggId: Number(id),
    average: stats?.average ?? null,
    bayesAverage: stats?.bayesAverage ?? null,
    rank: stats?.rank ?? null,
    usersRated: stats?.usersRated ?? null,
    name: decodeXmlEntities(primaryName),
    year: toNumber(attr(body, "yearpublished")),
    isExpansion,
    image: /<image>\s*([^<]+?)\s*<\/image>/.exec(body)?.[1] ?? null,
    description,
    players: range(minPlayers, maxPlayers),
    playtime: range(minTime, maxTime, " min"),
    mechanics: links("boardgamemechanic").map((l) => l.value),
    categories: links("boardgamecategory").map((l) => l.value),
    baseGameBggIds: isExpansion ? links("boardgameexpansion", true).map((l) => l.id) : []
  };
}

export async function searchBgg(query: string): Promise<BggSearchResult[]> {
  const xml = await bggFetch(`/search?query=${encodeURIComponent(query)}&type=boardgame,boardgameexpansion`);
  // BGG lists an expansion under both types; keep one entry per id
  const seen = new Map<number, BggSearchResult>();
  for (const result of parseSearch(xml)) {
    const existing = seen.get(result.bggId);
    if (!existing || result.isExpansion) seen.set(result.bggId, result);
  }
  return [...seen.values()];
}

export async function fetchBggGame(bggId: number): Promise<BggGame | null> {
  return parseThing(await bggFetch(`/thing?id=${bggId}&stats=1`));
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
