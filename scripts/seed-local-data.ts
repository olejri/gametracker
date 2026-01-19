import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GAME_NAMES = [
  "Catan", "Ticket to Ride", "Pandemic", "Carcassonne", "Splendor",
  "7 Wonders", "Dominion", "Azul", "Wingspan", "Terraforming Mars",
  "Scythe", "Gloomhaven", "Spirit Island", "Brass: Birmingham", "Root",
  "Everdell", "Viticulture", "Agricola", "Puerto Rico", "Power Grid",
  "Codenames", "Dixit", "Mysterium", "Betrayal at House on the Hill", "Dead of Winter",
  "King of Tokyo", "Sushi Go!", "Love Letter", "The Resistance", "One Night Ultimate Werewolf",
  "Clank!", "Dice Forge", "Century: Spice Road", "Sagrada", "Photosynthesis",
  "Santorini", "Kingdomino", "Patchwork", "Jaipur", "Lost Cities",
  "Forbidden Island", "Forbidden Desert", "Flash Point: Fire Rescue", "Hanabi", "The Mind",
  "Exploding Kittens", "Unstable Unicorns", "Munchkin", "Fluxx", "Coup",
  "Star Realms", "Hero Realms", "Ascension", "Legendary", "Marvel Champions",
  "Arkham Horror LCG", "Lord of the Rings LCG", "Netrunner", "Magic: The Gathering", "KeyForge",
  "Twilight Imperium", "Eclipse", "Gaia Project", "Through the Ages", "Caverna",
  "A Feast for Odin", "Le Havre", "Ora et Labora", "Fields of Arle", "Patchistory",
  "Concordia", "Great Western Trail", "Castles of Burgundy", "Troyes", "Tzolk'in",
  "Yokohama", "Lisboa", "Kanban EV", "Vinhos", "The Gallerist",
  "Anachrony", "Trickerion", "Alchemists", "Dungeon Petz", "Dungeon Lords",
  "Galaxy Trucker", "Space Alert", "Codex", "Mage Knight", "Robinson Crusoe",
  "Eldritch Horror", "Mansions of Madness", "Imperial Assault", "Descent", "Zombicide",
  "Blood Rage", "Rising Sun", "Ankh", "Cthulhu Wars", "Chaos in the Old World",
  "War of the Ring", "Star Wars: Rebellion", "Twilight Struggle", "1989: Dawn of Freedom", "Labyrinth",
  "Memoir '44", "Commands & Colors", "Battle Lore", "Summoner Wars", "BattleCON",
  "Exceed", "Pixel Tactics", "Argent: The Consortium", "Vast", "Crystal Clans"
];

const PLAYER_FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Sam", "Jamie", "Charlie", "Dakota", "Skyler", "River", "Phoenix", "Sage",
  "Rowan", "Kai", "Blake", "Hayden", "Reese", "Peyton", "Cameron", "Drew",
  "Emerson", "Finley", "Harper", "Indigo", "Jules", "Kendall", "Logan", "Marley"
];

const PLAYER_LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"
];

const GAME_MECHANICS = [
  "Worker Placement", "Deck Building", "Tile Placement", "Set Collection", "Hand Management",
  "Dice Rolling", "Area Control", "Engine Building", "Drafting", "Resource Management",
  "Push Your Luck", "Cooperative Play", "Trading", "Auction/Bidding", "Pattern Building"
];

const GAME_CATEGORIES = [
  "Strategy", "Family", "Party", "Card Game", "Dice Game",
  "Abstract", "Thematic", "War Game", "Economic", "Adventure",
  "Fantasy", "Sci-Fi", "Medieval", "Civilization", "Exploration"
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  // SAFETY CHECK: Prevent running in production
  const nodeEnv = process.env.NODE_ENV;
  const databaseUrl = process.env.DATABASE_URL || "";
  
  if (nodeEnv === "production") {
    console.error("❌ ERROR: This script cannot run in production environment!");
    console.error("   NODE_ENV is set to 'production'");
    process.exit(1);
  }
  
  if (databaseUrl.includes("planetscale.com") || 
      databaseUrl.includes("railway.app") || 
      databaseUrl.includes("heroku.com") ||
      databaseUrl.includes("amazonaws.com") ||
      databaseUrl.includes("azure.com") ||
      databaseUrl.includes("vercel.com")) {
    console.error("❌ ERROR: This script cannot run against a production database!");
    console.error("   DATABASE_URL appears to be a production database");
    console.error("   Detected URL pattern suggests cloud/production hosting");
    process.exit(1);
  }
  
  if (!databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1")) {
    console.warn("⚠️  WARNING: DATABASE_URL does not appear to be localhost");
    console.warn("   URL: " + databaseUrl.substring(0, 30) + "...");
    console.warn("   This script should only run against local databases");
    console.warn("   Press Ctrl+C now to cancel, or wait 5 seconds to continue...");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log("🌱 Starting local data seeding...");
  console.log("   Environment: " + (nodeEnv || "development"));
  console.log("   Database: localhost");

  const GROUP_ID = "game-night";
  const ADMIN_CLERK_ID = "user_2MeS9z7KY0pMJ4d8gmDxuctEge8";
  
  console.log("🧹 Cleaning up old data...");
  
  // Delete in correct order to respect foreign key constraints
  await prisma.playerAchievement.deleteMany({});
  await prisma.achievement.deleteMany({});
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

  console.log("👤 Setting up admin user...");
  const adminPlayer = await prisma.player.upsert({
    where: { clerkId: ADMIN_CLERK_ID },
    update: {
      isSuperAdmin: true,
    },
    create: {
      name: "Admin User",
      clerkId: ADMIN_CLERK_ID,
      email: "admin@gametracker.local",
      isSuperAdmin: true,
    },
  });

  await prisma.playerGameGroupJunction.upsert({
    where: {
      groupId_playerId: {
        groupId: GROUP_ID,
        playerId: adminPlayer.id,
      },
    },
    update: {
      role: "admin",
      inviteStatus: "accepted",
      gameGroupIsActive: true,
    },
    create: {
      playerId: adminPlayer.id,
      groupId: GROUP_ID,
      role: "admin",
      inviteStatus: "accepted",
      gameGroupIsActive: true,
    },
  });
  console.log(`✅ Admin user added to ${GROUP_ID} group`);

  console.log("🎮 Creating 100 games...");
  const games = [];
  for (let i = 0; i < 100; i++) {
    const name = i < GAME_NAMES.length ? GAME_NAMES[i]! : `${randomElement(GAME_NAMES)} ${i}`;
    const mechanics = randomElements(GAME_MECHANICS, randomInt(2, 4)).join(", ");
    const categories = randomElements(GAME_CATEGORIES, randomInt(1, 3)).join(", ");
    
    const game = await prisma.game.upsert({
      where: { name },
      update: {},
      create: {
        name,
        image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(name)}`,
        description: `An exciting board game featuring ${mechanics.toLowerCase()}. Perfect for game nights!`,
        players: `${randomInt(2, 4)}-${randomInt(5, 8)}`,
        playtime: `${randomInt(30, 120)} min`,
        mechanics,
        categories,
        isExpansion: false,
      },
    });
    games.push(game);
  }
  console.log(`✅ Created ${games.length} games`);

  console.log("👥 Creating 30 players...");
  const players = [adminPlayer];
  for (let i = 0; i < 30; i++) {
    const firstName = randomElement(PLAYER_FIRST_NAMES);
    const lastName = randomElement(PLAYER_LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    
    const player = await prisma.player.create({
      data: {
        name,
        email,
        nickname: Math.random() > 0.5 ? firstName : undefined,
        clerkId: undefined,
        isSuperAdmin: false,
      },
    });
    players.push(player);

    await prisma.playerGameGroupJunction.create({
      data: {
        playerId: player.id,
        groupId: GROUP_ID,
        role: i === 0 ? "admin" : "member",
        inviteStatus: "accepted",
        gameGroupIsActive: true,
      },
    });
  }
  console.log(`✅ Created ${players.length} players (including admin)`);

  console.log("🎲 Creating 300 game sessions...");
  const startDate = new Date("2023-01-01");
  const endDate = new Date();
  
  for (let i = 0; i < 300; i++) {
    const game = randomElement(games);
    
    // Include admin player in 70% of sessions
    let sessionPlayers;
    if (Math.random() < 0.7) {
      const otherPlayers = randomElements(players.slice(1), randomInt(1, 5));
      sessionPlayers = [adminPlayer, ...otherPlayers];
    } else {
      sessionPlayers = randomElements(players, randomInt(2, 6));
    }
    
    const sessionDate = randomDate(startDate, endDate);
    
    const session = await prisma.gameSession.create({
      data: {
        gameId: game.id,
        status: "Completed",
        result: randomElement(sessionPlayers).name,
        groupId: GROUP_ID,
        createdAt: sessionDate,
        updatedAt: sessionDate,
        description: Math.random() > 0.7 ? "Great game night!" : undefined,
        isTeamGame: false,
      },
    });

    await prisma.gameSessionGameJunction.create({
      data: {
        gameId: game.id,
        gameSessionId: session.id,
      },
    });

    for (let j = 0; j < sessionPlayers.length; j++) {
      const player = sessionPlayers[j]!;
      await prisma.playerGameSessionJunction.create({
        data: {
          playerId: player.id,
          gameSessionId: session.id,
          position: j + 1,
          score: randomInt(0, 100).toString(),
        },
      });

      const existingJunction = await prisma.playerGameJunction.findUnique({
        where: {
          gameId_playerId: {
            gameId: game.id,
            playerId: player.id,
          },
        },
      });

      if (!existingJunction) {
        await prisma.playerGameJunction.create({
          data: {
            gameId: game.id,
            playerId: player.id,
          },
        });
      }
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  📊 Created ${i + 1}/300 sessions...`);
    }
  }
  console.log(`✅ Created 300 game sessions`);

  console.log("🏆 Creating 50 diverse achievements...");
  const customAchievements = [
    // BRONZE TIER (Goal: 5)
    {
      key: "first_win",
      name: "First Victory",
      description: "Win your first game",
      category: "milestone",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "wins",
      goal: 5,
      iconType: "trophy",
      points: 10,
    },
    {
      key: "early_bird",
      name: "Early Bird",
      description: "Play 5 games before noon",
      category: "participation",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "time_of_day",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },
    {
      key: "night_owl",
      name: "Night Owl",
      description: "Play 5 games after 10 PM",
      category: "participation",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "time_of_day",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },
    {
      key: "quick_learner",
      name: "Quick Learner",
      description: "Play 5 different games",
      category: "generalist",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "unique_games",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },
    {
      key: "social_butterfly",
      name: "Social Butterfly",
      description: "Play with 5 different players",
      category: "social",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "social_players",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },
    {
      key: "weekend_warrior",
      name: "Weekend Warrior",
      description: "Play 5 games on weekends",
      category: "participation",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "weekend_play",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },
    {
      key: "strategy_starter",
      name: "Strategy Starter",
      description: "Play 5 strategy games",
      category: "specialist",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "strategy_games",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },
    {
      key: "party_starter",
      name: "Party Starter",
      description: "Play 5 party games",
      category: "specialist",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "party_games",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },
    {
      key: "comeback_kid",
      name: "Comeback Kid",
      description: "Win 5 games from behind",
      category: "milestone",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "comebacks",
      goal: 5,
      iconType: "trophy",
      points: 10,
    },
    {
      key: "team_player",
      name: "Team Player",
      description: "Play 5 cooperative games",
      category: "participation",
      tier: "bronze",
      tierOrder: 1,
      groupKey: "cooperative",
      goal: 5,
      iconType: "sparkles",
      points: 10,
    },

    // SILVER TIER (Goal: 15)
    {
      key: "rising_star",
      name: "Rising Star",
      description: "Win 15 games",
      category: "milestone",
      tier: "silver",
      tierOrder: 2,
      groupKey: "wins",
      goal: 15,
      iconType: "star",
      points: 25,
    },
    {
      key: "dedicated_player",
      name: "Dedicated Player",
      description: "Play 15 games in a month",
      category: "participation",
      tier: "silver",
      tierOrder: 2,
      groupKey: "monthly_play",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "game_explorer",
      name: "Game Explorer",
      description: "Play 15 different games",
      category: "generalist",
      tier: "silver",
      tierOrder: 2,
      groupKey: "unique_games",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "social_gamer",
      name: "Social Gamer",
      description: "Play with 15 different players",
      category: "social",
      tier: "silver",
      tierOrder: 2,
      groupKey: "social_players",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "strategy_enthusiast",
      name: "Strategy Enthusiast",
      description: "Play 15 strategy games",
      category: "specialist",
      tier: "silver",
      tierOrder: 2,
      groupKey: "strategy_games",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "party_animal",
      name: "Party Animal",
      description: "Play 15 party games",
      category: "specialist",
      tier: "silver",
      tierOrder: 2,
      groupKey: "party_games",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "winning_streak",
      name: "Winning Streak",
      description: "Win 15 games in a row",
      category: "streak",
      tier: "silver",
      tierOrder: 2,
      groupKey: "win_streak",
      goal: 15,
      iconType: "star",
      points: 25,
    },
    {
      key: "marathon_gamer",
      name: "Marathon Gamer",
      description: "Play 15 games in a single day",
      category: "participation",
      tier: "silver",
      tierOrder: 2,
      groupKey: "daily_marathon",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "dice_master",
      name: "Dice Master",
      description: "Play 15 dice games",
      category: "specialist",
      tier: "silver",
      tierOrder: 2,
      groupKey: "dice_games",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "card_shark",
      name: "Card Shark",
      description: "Play 15 card games",
      category: "specialist",
      tier: "silver",
      tierOrder: 2,
      groupKey: "card_games",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "cooperative_hero",
      name: "Cooperative Hero",
      description: "Win 15 cooperative games",
      category: "milestone",
      tier: "silver",
      tierOrder: 2,
      groupKey: "cooperative",
      goal: 15,
      iconType: "trophy",
      points: 25,
    },
    {
      key: "versatile_player",
      name: "Versatile Player",
      description: "Play games from 15 different categories",
      category: "generalist",
      tier: "silver",
      tierOrder: 2,
      groupKey: "game_categories",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "close_calls",
      name: "Close Calls",
      description: "Win 15 games by a narrow margin",
      category: "milestone",
      tier: "silver",
      tierOrder: 2,
      groupKey: "close_victories",
      goal: 15,
      iconType: "trophy",
      points: 25,
    },
    {
      key: "teaching_master",
      name: "Teaching Master",
      description: "Teach 15 new players a game",
      category: "social",
      tier: "silver",
      tierOrder: 2,
      groupKey: "teaching",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },
    {
      key: "game_night_host",
      name: "Game Night Host",
      description: "Host 15 game nights",
      category: "social",
      tier: "silver",
      tierOrder: 2,
      groupKey: "hosting",
      goal: 15,
      iconType: "sparkles",
      points: 25,
    },

    // GOLD TIER (Goal: 30)
    {
      key: "champion",
      name: "Champion",
      description: "Win 30 games",
      category: "milestone",
      tier: "gold",
      tierOrder: 3,
      groupKey: "wins",
      goal: 30,
      iconType: "trophy",
      points: 50,
    },
    {
      key: "game_collector",
      name: "Game Collector",
      description: "Play 30 different games",
      category: "generalist",
      tier: "gold",
      tierOrder: 3,
      groupKey: "unique_games",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "community_builder",
      name: "Community Builder",
      description: "Play with 30 different players",
      category: "social",
      tier: "gold",
      tierOrder: 3,
      groupKey: "social_players",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "strategy_master",
      name: "Strategy Master",
      description: "Play 30 strategy games",
      category: "specialist",
      tier: "gold",
      tierOrder: 3,
      groupKey: "strategy_games",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "party_legend",
      name: "Party Legend",
      description: "Play 30 party games",
      category: "specialist",
      tier: "gold",
      tierOrder: 3,
      groupKey: "party_games",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "unstoppable_force",
      name: "Unstoppable Force",
      description: "Win 30 games in a row",
      category: "streak",
      tier: "gold",
      tierOrder: 3,
      groupKey: "win_streak",
      goal: 30,
      iconType: "star",
      points: 50,
    },
    {
      key: "monthly_champion",
      name: "Monthly Champion",
      description: "Play 30 games in a single month",
      category: "participation",
      tier: "gold",
      tierOrder: 3,
      groupKey: "monthly_play",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "dice_legend",
      name: "Dice Legend",
      description: "Play 30 dice games",
      category: "specialist",
      tier: "gold",
      tierOrder: 3,
      groupKey: "dice_games",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "card_master",
      name: "Card Master",
      description: "Play 30 card games",
      category: "specialist",
      tier: "gold",
      tierOrder: 3,
      groupKey: "card_games",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "cooperative_legend",
      name: "Cooperative Legend",
      description: "Win 30 cooperative games",
      category: "milestone",
      tier: "gold",
      tierOrder: 3,
      groupKey: "cooperative",
      goal: 30,
      iconType: "trophy",
      points: 50,
    },
    {
      key: "category_master",
      name: "Category Master",
      description: "Play games from 30 different categories",
      category: "generalist",
      tier: "gold",
      tierOrder: 3,
      groupKey: "game_categories",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "perfect_record",
      name: "Perfect Record",
      description: "Win 30 games with perfect scores",
      category: "milestone",
      tier: "gold",
      tierOrder: 3,
      groupKey: "perfect_scores",
      goal: 30,
      iconType: "trophy",
      points: 50,
    },
    {
      key: "mentor",
      name: "Mentor",
      description: "Teach 30 new players",
      category: "social",
      tier: "gold",
      tierOrder: 3,
      groupKey: "teaching",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "event_organizer",
      name: "Event Organizer",
      description: "Organize 30 game events",
      category: "social",
      tier: "gold",
      tierOrder: 3,
      groupKey: "hosting",
      goal: 30,
      iconType: "sparkles",
      points: 50,
    },
    {
      key: "comeback_master",
      name: "Comeback Master",
      description: "Win 30 games from behind",
      category: "milestone",
      tier: "gold",
      tierOrder: 3,
      groupKey: "comebacks",
      goal: 30,
      iconType: "trophy",
      points: 50,
    },

    // PLATINUM TIER (Goal: 50+)
    {
      key: "grand_master",
      name: "Grand Master",
      description: "Win 50 games",
      category: "milestone",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "wins",
      goal: 50,
      iconType: "trophy",
      points: 100,
    },
    {
      key: "game_connoisseur",
      name: "Game Connoisseur",
      description: "Play 50 different games",
      category: "generalist",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "unique_games",
      goal: 50,
      iconType: "sparkles",
      points: 100,
    },
    {
      key: "social_legend",
      name: "Social Legend",
      description: "Play with 50 different players",
      category: "social",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "social_players",
      goal: 50,
      iconType: "sparkles",
      points: 100,
    },
    {
      key: "strategy_grandmaster",
      name: "Strategy Grandmaster",
      description: "Play 50 strategy games",
      category: "specialist",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "strategy_games",
      goal: 50,
      iconType: "sparkles",
      points: 100,
    },
    {
      key: "ultimate_streak",
      name: "Ultimate Streak",
      description: "Win 50 games in a row",
      category: "streak",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "win_streak",
      goal: 50,
      iconType: "star",
      points: 100,
    },
    {
      key: "board_game_legend",
      name: "Board Game Legend",
      description: "Play 100 total games",
      category: "participation",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "total_games",
      goal: 100,
      iconType: "sparkles",
      points: 100,
    },
    {
      key: "hall_of_fame",
      name: "Hall of Fame",
      description: "Win 100 total games",
      category: "milestone",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "wins",
      goal: 100,
      iconType: "trophy",
      points: 100,
    },
    {
      key: "ultimate_collector",
      name: "Ultimate Collector",
      description: "Play 75 different games",
      category: "generalist",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "unique_games",
      goal: 75,
      iconType: "sparkles",
      points: 100,
    },
    {
      key: "community_pillar",
      name: "Community Pillar",
      description: "Play with 75 different players",
      category: "social",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "social_players",
      goal: 75,
      iconType: "sparkles",
      points: 100,
    },
    {
      key: "eternal_champion",
      name: "Eternal Champion",
      description: "Maintain a 75% win rate over 50 games",
      category: "milestone",
      tier: "platinum",
      tierOrder: 4,
      groupKey: "win_rate",
      goal: 50,
      iconType: "trophy",
      points: 100,
    },
  ];

  for (const achievement of customAchievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`✅ Created ${customAchievements.length} achievements`);

  console.log("🎯 Initializing player achievements...");
  const achievements = await prisma.achievement.findMany();
  let achievementCount = 0;
  
  for (const player of players) {
    for (const achievement of achievements) {
      const progress = randomInt(0, achievement.goal);
      const unlockedAt = progress >= achievement.goal ? randomDate(startDate, endDate) : null;
      
      let metadata = undefined;
      if (achievement.category === "generalist" && progress > 0) {
        metadata = { games: randomElements(games, Math.min(progress, 10)).map(g => g.name) };
      } else if (achievement.category === "specialist" && progress > 0) {
        metadata = { gameName: randomElement(games).name };
      }
      
      await prisma.playerAchievement.create({
        data: {
          playerId: player.id,
          achievementId: achievement.id,
          groupId: GROUP_ID,
          progress,
          unlockedAt,
          metadata,
        },
      });
      achievementCount++;
    }
  }
  console.log(`✅ Created ${achievementCount} player achievement records`);

  console.log("\n✨ Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Games: ${games.length}`);
  console.log(`  - Players: ${players.length}`);
  console.log(`  - Game Sessions: 300`);
  console.log(`  - Achievements: ${achievements.length}`);
  console.log(`  - Player Achievement Records: ${achievementCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
