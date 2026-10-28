/**
 * Creates (or refreshes) a dedicated local test user that AI agents can sign in with.
 *
 * - Creates a Clerk user in the DEVELOPMENT instance with a "+clerk_test" email.
 *   Clerk dev instances accept the fixed verification code 424242 for such emails,
 *   so no password is needed or stored.
 * - Upserts a matching Player and makes it an admin of the local dummy game group.
 *
 * Refuses to run against a Clerk production key or a non-local database.
 *
 * Usage: npm run setup-claude-user
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd(), true);

export const CLAUDE_TEST_EMAIL = "claude+clerk_test@example.com";
const GROUP_ID = process.env.CLAUDE_TEST_GROUP_ID ?? "game-night";

async function clerkFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY ?? ""}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Clerk API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY ?? "";
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!secretKey.startsWith("sk_test_")) {
    console.error("❌ CLERK_SECRET_KEY is not a Clerk development key (sk_test_). Aborting.");
    process.exit(1);
  }
  if (!databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1")) {
    console.error("❌ DATABASE_URL is not a local database. Aborting.");
    process.exit(1);
  }

  type ClerkUser = { id: string };
  const existing = await clerkFetch<ClerkUser[]>(
    `/users?email_address=${encodeURIComponent(CLAUDE_TEST_EMAIL)}`
  );
  const clerkUser =
    existing[0] ??
    (await clerkFetch<ClerkUser>("/users", {
      method: "POST",
      body: JSON.stringify({
        email_address: [CLAUDE_TEST_EMAIL],
        first_name: "Claude",
        last_name: "Test",
        skip_password_requirement: true,
      }),
    }));
  console.log(`✅ Clerk test user: ${clerkUser.id}`);

  const prisma = new PrismaClient();
  try {
    const group = await prisma.gameGroup.findUnique({ where: { id: GROUP_ID } });
    if (!group) {
      console.error(`❌ Game group "${GROUP_ID}" not found. Run npm run seed-local first.`);
      process.exit(1);
    }

    const player = await prisma.player.upsert({
      where: { clerkId: clerkUser.id },
      update: {},
      create: {
        name: "Claude Test",
        nickname: "Claude",
        clerkId: clerkUser.id,
        email: CLAUDE_TEST_EMAIL,
      },
    });

    await prisma.playerGameGroupJunction.updateMany({
      where: { playerId: player.id, groupId: { not: GROUP_ID } },
      data: { gameGroupIsActive: false },
    });
    await prisma.playerGameGroupJunction.upsert({
      where: { groupId_playerId: { groupId: GROUP_ID, playerId: player.id } },
      update: { role: "ADMIN", inviteStatus: "ACCEPTED", gameGroupIsActive: true },
      create: {
        playerId: player.id,
        groupId: GROUP_ID,
        role: "ADMIN",
        inviteStatus: "ACCEPTED",
        gameGroupIsActive: true,
      },
    });
    console.log(`✅ Player "${player.name}" is an admin of "${group.name}"`);
    console.log(`\nSign in at http://localhost:3000 with ${CLAUDE_TEST_EMAIL} and code 424242.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
