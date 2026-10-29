/**
 * Maps games to BoardGameGeek ids and stores their BGG ratings, using BGG's
 * daily ranks dump (https://boardgamegeek.com/data_dumps/bg_ranks, sign-in
 * required). No API token is needed.
 *
 * How a game gets its bggId, in order:
 *   1. It already has one (its ratings are just refreshed from the dump).
 *   2. scripts/bgg-overrides.json maps its name to an id (or to null = skip).
 *   3. Exactly one dump row has the same name (same expansion flag wins ties).
 *   4. Several rows share the name and one has 10x the ratings of the rest.
 * Everything else is listed for review: add it to bgg-overrides.json.
 *
 * Usage:
 *   npm run import-bgg -- --csv <boardgames_ranks.csv>                 dry run against the DB
 *   npm run import-bgg -- --csv <boardgames_ranks.csv> --games <games.json>  dry run against an export
 *   npm run import-bgg -- --csv <boardgames_ranks.csv> --apply         write to the DB
 *   npm run import-bgg -- --csv <boardgames_ranks.csv> --games <games.json> --sql <migration.sql>  write a data migration
 */
import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";

loadEnvConfig(process.cwd(), true);

type RankRow = {
  id: string;
  name: string;
  yearpublished: string;
  rank: string;
  bayesaverage: string;
  average: string;
  usersrated: string;
  is_expansion: string;
};

type LocalGame = { id: string; name: string; isExpansion: boolean; bggId?: number | null };

const OVERRIDES_PATH = path.join(process.cwd(), "scripts", "bgg-overrides.json");

const args = process.argv.slice(2);
const argValue = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const normalize = (name: string) =>
  name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

const num = (value: string) => {
  const n = Number(value);
  return value !== "" && Number.isFinite(n) && n !== 0 ? n : null;
};

const describe = (r: RankRow) =>
  `${r.id} "${r.name}" (${r.yearpublished || "?"}, ${r.usersrated} ratings, avg ${Number(r.average).toFixed(1)}, rank ${r.rank || "-"})`;

async function main() {
  const csvPath = argValue("--csv");
  const gamesPath = argValue("--games");
  const apply = args.includes("--apply");
  if (!csvPath) {
    console.error("Usage: npm run import-bgg -- --csv <boardgames_ranks.csv> [--games <games.json>] [--apply]");
    process.exit(1);
  }
  if (apply && gamesPath) {
    console.error("❌ --apply writes to the DB, so it can't be combined with --games.");
    process.exit(1);
  }

  const rows = parse(fs.readFileSync(csvPath), { columns: true, skip_empty_lines: true }) as RankRow[];
  const byId = new Map<string, RankRow>();
  const byName = new Map<string, RankRow[]>();
  for (const row of rows) {
    byId.set(row.id, row);
    const key = normalize(row.name);
    byName.set(key, [...(byName.get(key) ?? []), row]);
  }
  console.log(`BGG dump: ${rows.length} rows`);

  const overrides = fs.existsSync(OVERRIDES_PATH)
    ? (JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8")) as Record<string, number | null>)
    : {};

  const prisma = new PrismaClient();
  const games: LocalGame[] = gamesPath
    ? (JSON.parse(fs.readFileSync(gamesPath, "utf8")) as LocalGame[])
    : await prisma.game.findMany({ select: { id: true, name: true, isExpansion: true, bggId: true } });
  console.log(`Games: ${games.length} (from ${gamesPath ?? "database"})\n`);

  const matched: Array<{ game: LocalGame; row: RankRow; how: string }> = [];
  const review: string[] = [];
  const skipped: string[] = [];

  for (const game of games) {
    if (game.bggId) {
      const row = byId.get(String(game.bggId));
      if (row) matched.push({ game, row, how: "existing" });
      else review.push(`${game.name}: has bggId ${game.bggId}, which is not in the dump`);
      continue;
    }
    const overrideKey = game.name.trim();
    if (overrideKey in overrides) {
      const id = overrides[overrideKey];
      if (id === null || id === undefined) { skipped.push(game.name); continue; }
      const row = byId.get(String(id));
      if (row) matched.push({ game, row, how: "override" });
      else review.push(`${game.name}: override ${id} is not in the dump`);
      continue;
    }

    let candidates = byName.get(normalize(game.name)) ?? [];
    const sameType = candidates.filter((r) => (r.is_expansion === "1") === game.isExpansion);
    if (sameType.length >= 1) candidates = sameType;

    if (candidates.length === 1 && candidates[0]) {
      matched.push({ game, row: candidates[0], how: "name" });
      continue;
    }
    if (candidates.length === 0) {
      review.push(`${game.name}: no BGG game with this name`);
      continue;
    }
    const sorted = [...candidates].sort((a, b) => Number(b.usersrated) - Number(a.usersrated));
    const [top, next] = sorted;
    if (top && next && Number(top.usersrated) >= 1000 && Number(top.usersrated) >= 10 * Number(next.usersrated)) {
      matched.push({ game, row: top, how: "most-rated" });
      continue;
    }
    review.push(`${game.name}: ${candidates.length} candidates:\n      ${sorted.slice(0, 5).map(describe).join("\n      ")}`);
  }

  // bggId is unique, so two games can't share one
  const seen = new Map<string, string>();
  const conflicts = matched.filter(({ game, row }) => {
    const other = seen.get(row.id);
    if (other) {
      review.push(`${game.name}: would get bggId ${row.id}, already taken by "${other}"`);
      return true;
    }
    seen.set(row.id, game.name);
    return false;
  });
  const toWrite = matched.filter((m) => !conflicts.includes(m));

  console.log(`== Matched: ${toWrite.length}`);
  for (const { game, row, how } of toWrite) console.log(`  [${how}] ${game.name} -> ${describe(row)}`);
  console.log(`\n== Needs review: ${review.length} (add to scripts/bgg-overrides.json)`);
  review.forEach((line) => console.log(`  ${line}`));
  console.log(`\n== Skipped by override: ${skipped.length}`);
  skipped.forEach((name) => console.log(`  ${name}`));

  const sqlPath = argValue("--sql");
  if (sqlPath) {
    // A data migration, keyed by game id, that only fills games without a bggId
    const sqlNum = (value: string) => num(value) ?? "NULL";
    const lines = toWrite.map(({ game, row }) =>
      `UPDATE \`Game\` SET \`bggId\` = ${row.id}, \`bggAverage\` = ${sqlNum(row.average)}, ` +
      `\`bggBayesAverage\` = ${sqlNum(row.bayesaverage)}, \`bggRank\` = ${sqlNum(row.rank)}, ` +
      `\`bggUsersRated\` = ${sqlNum(row.usersrated)}, \`bggUpdatedAt\` = CURRENT_TIMESTAMP(3) ` +
      `WHERE \`id\` = '${game.id.replace(/'/g, "''")}' AND \`bggId\` IS NULL; -- ${game.name.trim().replace(/\s+/g, " ")}`
    );
    fs.writeFileSync(sqlPath, `-- BGG ids and ratings from the BGG ranks dump (${path.basename(csvPath)})\n${lines.join("\n")}\n`);
    console.log(`\nWrote ${lines.length} UPDATE statements to ${sqlPath}`);
  }

  if (!apply) {
    console.log("\nDry run: nothing written. Add --apply to save.");
    await prisma.$disconnect();
    return;
  }

  const host = (process.env.DATABASE_URL ?? "").replace(/^.*@/, "").replace(/\/.*$/, "");
  console.log(`\nWriting ${toWrite.length} games to database at ${host}...`);
  const now = new Date();
  for (const { game, row } of toWrite) {
    await prisma.game.update({
      where: { id: game.id },
      data: {
        bggId: Number(row.id),
        bggAverage: num(row.average),
        bggBayesAverage: num(row.bayesaverage),
        bggRank: num(row.rank),
        bggUsersRated: num(row.usersrated),
        bggUpdatedAt: now
      }
    });
  }
  console.log("✅ Done.");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
