import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GAME_NAMES = [
  "Catan", "Ticket to Ride", "Pandemic", "Carcassonne", "Splendor",
  "7 Wonders", "Dominion", "Azul", "Wingspan", "Terraforming Mars"
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  const GROUP_ID = "game-night";
  const ADMIN_CLERK_ID = "user_2MeS9z7KY0pMJ4d8gmDxuctEge8";
  
  console.log("🌱 Starting minimal achievement test seed...");
  console.log("   This will create games and sessions for the admin user only");

  console.log("🧹 Cleaning up old data...");
  
  // Delete in correct order to respect foreign key constraints
  await prisma.playerAchievement.deleteMany({});
  await prisma.gameSessionRandomizationLog.deleteMany({});
  await prisma.teamPlayerJunction.deleteMany({});
  await prisma.gameSessionTeam.deleteMany({});
  await prisma.playerGameSessionJunction.deleteMany({});
  await prisma.gameSessionGameJunction.deleteMany({});
  await prisma.gameSession.deleteMany({});
  await prisma.playerGameJunction.deleteMany({});
  await prisma.emailInvite.deleteMany({});
  await prisma.playerGameGroupJunction.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.gameGroup.deleteMany({});
  
  console.log("✅ Old data cleared");

  // Create or verify game group exists
  console.log("📦 Creating game group...");
  await prisma.gameGroup.upsert({
    where: { id: GROUP_ID },
    update: {},
    create: {
      id: GROUP_ID,
      name: "Game Night",
      hidden: false,
    },
  });
  console.log(`✅ Game group created: ${GROUP_ID}`);

  // Get or create admin player
  let adminPlayer = await prisma.player.findUnique({
    where: { clerkId: ADMIN_CLERK_ID },
  });

  if (!adminPlayer) {
    console.log("👤 Creating admin user...");
    adminPlayer = await prisma.player.create({
      data: {
        name: "Admin User",
        clerkId: ADMIN_CLERK_ID,
        email: "admin@gametracker.local",
        isSuperAdmin: true,
      },
    });
  }

  // Ensure admin is in game group
  const existingJunction = await prisma.playerGameGroupJunction.findUnique({
    where: {
      groupId_playerId: {
        groupId: GROUP_ID,
        playerId: adminPlayer.id,
      },
    },
  });

  if (!existingJunction) {
    await prisma.playerGameGroupJunction.create({
      data: {
        playerId: adminPlayer.id,
        groupId: GROUP_ID,
        role: "admin",
        inviteStatus: "accepted",
        gameGroupIsActive: true,
      },
    });
  }

  console.log(`✅ Admin user: ${adminPlayer.name} (${adminPlayer.id})`);

  // Create 10 games
  console.log("🎮 Creating 10 games...");
  const games = [];
  for (let i = 0; i < 10; i++) {
    const name = GAME_NAMES[i]!;
    const game = await prisma.game.upsert({
      where: { name },
      update: {},
      create: {
        name,
        image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(name)}`,
        description: `A great board game: ${name}`,
        players: "2-4",
        playtime: "60 min",
        mechanics: "Strategy, Hand Management",
        categories: "Strategy, Family",
        isExpansion: false,
      },
    });
    games.push(game);
  }
  console.log(`✅ Created ${games.length} games`);

  // Create game sessions for admin user
  console.log("🎲 Creating game sessions...");
  const startDate = new Date("2024-01-01");
  const endDate = new Date();

  // Win the same game multiple times (for specialist achievement)
  const favoriteGame = games[0]!; // Catan
  console.log(`   Creating 15 wins for ${favoriteGame.name} (specialist achievement)...`);
  for (let i = 0; i < 15; i++) {
    const sessionDate = randomDate(startDate, endDate);
    const session = await prisma.gameSession.create({
      data: {
        gameId: favoriteGame.id,
        status: "Completed",
        result: adminPlayer.name,
        groupId: GROUP_ID,
        createdAt: sessionDate,
        updatedAt: sessionDate,
        isTeamGame: false,
      },
    });

    await prisma.gameSessionGameJunction.create({
      data: {
        gameId: favoriteGame.id,
        gameSessionId: session.id,
      },
    });

    await prisma.playerGameSessionJunction.create({
      data: {
        playerId: adminPlayer.id,
        gameSessionId: session.id,
        position: 1, // Win
        score: randomInt(80, 100).toString(),
      },
    });

    await prisma.playerGameJunction.upsert({
      where: {
        gameId_playerId: {
          gameId: favoriteGame.id,
          playerId: adminPlayer.id,
        },
      },
      update: {},
      create: {
        gameId: favoriteGame.id,
        playerId: adminPlayer.id,
      },
    });
  }

  // Win different games (for generalist achievement)
  console.log(`   Creating wins for 8 different games (generalist achievement)...`);
  for (let i = 1; i < 9; i++) {
    const game = games[i]!;
    const sessionDate = randomDate(startDate, endDate);
    const session = await prisma.gameSession.create({
      data: {
        gameId: game.id,
        status: "Completed",
        result: adminPlayer.name,
        groupId: GROUP_ID,
        createdAt: sessionDate,
        updatedAt: sessionDate,
        isTeamGame: false,
      },
    });

    await prisma.gameSessionGameJunction.create({
      data: {
        gameId: game.id,
        gameSessionId: session.id,
      },
    });

    await prisma.playerGameSessionJunction.create({
      data: {
        playerId: adminPlayer.id,
        gameSessionId: session.id,
        position: 1, // Win
        score: randomInt(80, 100).toString(),
      },
    });

    await prisma.playerGameJunction.upsert({
      where: {
        gameId_playerId: {
          gameId: game.id,
          playerId: adminPlayer.id,
        },
      },
      update: {},
      create: {
        gameId: game.id,
        playerId: adminPlayer.id,
      },
    });
  }

  console.log("\n✨ Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Games: ${games.length}`);
  console.log(`   - Sessions: 23 (15 wins in ${favoriteGame.name}, 8 wins in different games)`);
  console.log(`   - Expected achievements:`);
  console.log(`     • Specialist: Should unlock bronze (5) and silver (10) tiers`);
  console.log(`     • Generalist: Should unlock bronze (5) tier`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
