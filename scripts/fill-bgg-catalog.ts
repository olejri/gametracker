/**
 * Fills the BggCatalogGame table that "What to play?" searches for new games.
 * Takes the top ranked board games (no expansions) from BGG's daily ranks dump
 * (https://boardgamegeek.com/data_dumps/bg_ranks, sign-in required) and fetches
 * their players, playtime, weight and mechanics from the BGG API, 20 per call.
 * Needs BGG_API_TOKEN. Games fetched in the last 7 days are skipped, so a run
 * that stops can be started again. It also refreshes the weight of the games
 * that have a bggId, so the complexity filter works on the group's own games.
 *
 * Usage:
 *   npm run bgg-catalog -- --csv <boardgames_ranks.csv> [--top 2000]   fill the local DB
 *   npm run bgg-catalog -- --sql <migration.sql>                        write the local catalog as a data migration
 */
import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { fetchBggCatalogBatch, isBggSyncEnabled, refreshBggRatings, saveCatalogEntries } from "../src/server/bgg";

loadEnvConfig(process.cwd(), true);

type RankRow = { id: string; rank: string; is_expansion: string };

const args = process.argv.slice(2);
const argValue = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sqlValue = (value: string | number | null) =>
  value === null ? "NULL" : typeof value === "number" ? String(value) : `'${value.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;

async function fill(prisma: PrismaClient, csvPath: string, top: number) {
  if (!isBggSyncEnabled()) throw new Error("BGG_API_TOKEN is not set");
  const rows = parse(fs.readFileSync(csvPath), { columns: true, skip_empty_lines: true }) as RankRow[];
  const ids = rows
    .filter((r) => r.is_expansion === "0" && Number(r.rank) > 0)
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .slice(0, top)
    .map((r) => Number(r.id));

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fresh = await prisma.bggCatalogGame.findMany({
    where: { bggId: { in: ids }, updatedAt: { gte: weekAgo } },
    select: { bggId: true }
  });
  const freshIds = new Set(fresh.map((g) => g.bggId));
  const todo = ids.filter((id) => !freshIds.has(id));
  console.log(`${ids.length} games in the top ${top}, ${freshIds.size} already fresh, fetching ${todo.length}`);

  for (let i = 0; i < todo.length; i += 20) {
    if (i > 0) await sleep(2000);
    const entries = await fetchBggCatalogBatch(todo.slice(i, i + 20));
    await saveCatalogEntries(prisma, entries);
    console.log(`  ${Math.min(i + 20, todo.length)}/${todo.length}`);
  }

  const ratings = await refreshBggRatings(prisma);
  console.log(`Refreshed ratings and weight of ${ratings.updated} games`);
}

async function writeSql(prisma: PrismaClient, sqlPath: string) {
  const catalog = await prisma.bggCatalogGame.findMany({ orderBy: { rank: "asc" } });
  const games = await prisma.game.findMany({ where: { bggId: { not: null }, bggWeight: { not: null } } });
  const columns = ["bggId", "name", "year", "rank", "average", "bayesAverage", "usersRated", "weight", "minPlayers",
    "maxPlayers", "bestPlayers", "minPlaytime", "maxPlaytime", "thumbnail", "mechanics", "categories"] as const;
  const lines = [`-- "What to play?" catalog: BGG's top ${catalog.length} board games, from \`npm run bgg-catalog\``];
  for (let i = 0; i < catalog.length; i += 100) {
    const values = catalog.slice(i, i + 100)
      .map((g) => `(${columns.map((c) => sqlValue(g[c])).join(", ")}, CURRENT_TIMESTAMP(3))`);
    lines.push(
      `INSERT INTO \`BggCatalogGame\` (${columns.map((c) => `\`${c}\``).join(", ")}, \`updatedAt\`) VALUES\n` +
      `${values.join(",\n")}\nON DUPLICATE KEY UPDATE \`bggId\` = \`bggId\`;`
    );
  }
  lines.push("", "-- BGG weight of games already in the collection");
  for (const g of games) {
    lines.push(`UPDATE \`Game\` SET \`bggWeight\` = ${g.bggWeight as number} WHERE \`bggId\` = ${g.bggId as number} AND \`bggWeight\` IS NULL;`);
  }
  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
  fs.writeFileSync(sqlPath, lines.join("\n") + "\n");
  console.log(`Wrote ${catalog.length} catalog games and ${games.length} game weights to ${sqlPath}`);
}

async function main() {
  const csvPath = argValue("--csv");
  const sqlPath = argValue("--sql");
  if (!csvPath && !sqlPath) {
    console.error("Usage: npm run bgg-catalog -- --csv <boardgames_ranks.csv> [--top 2000] | --sql <migration.sql>");
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    if (csvPath) await fill(prisma, csvPath, Number(argValue("--top") ?? 2000));
    if (sqlPath) await writeSql(prisma, sqlPath);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
