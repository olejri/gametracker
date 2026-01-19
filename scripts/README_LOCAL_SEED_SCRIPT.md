# Local Data Seeding Script

This script generates dummy data for local development and testing of the GameTracker application.

## What it creates

- **100 games** - A variety of board games with different mechanics and categories
- **30 players** - Dummy players with realistic names and emails
- **300 game sessions** - Completed game sessions with random dates, players, and scores
- **11 achievements** - Custom achievements across different tiers (bronze, silver, gold, platinum)
- **Player achievement records** - Progress tracking for all players across all achievements

## Prerequisites

Before running the seed script, make sure you have:

1. A local MySQL database running
2. Your `.env.local` file configured with the correct `DATABASE_URL`
3. Prisma migrations applied: `npx prisma migrate dev`

## How to run

### First time setup

1. Install dependencies (including tsx):
   ```bash
   npm install
   ```

2. Run the seed script:
   ```bash
   npm run seed-local
   ```

### Subsequent runs

The script uses `upsert` operations for games and the game group, so you can run it multiple times. However, it will create duplicate players and sessions on subsequent runs.

**To start fresh:**

1. Reset your database:
   ```bash
   npx prisma migrate reset
   ```

2. Run the seed script:
   ```bash
   npm run seed-local
   ```

## What gets created

### Games
- 100 unique board games with:
  - Random player counts (2-4 to 5-8 players)
  - Random playtime (30-120 minutes)
  - 2-4 random mechanics (Worker Placement, Deck Building, etc.)
  - 1-3 random categories (Strategy, Family, Party, etc.)

### Players
- 30 players with:
  - Realistic first and last names
  - Email addresses (format: firstname.lastname@example.com)
  - Random nicknames (50% chance)
  - All added to the "game-night" group

### Game Sessions
- 300 completed game sessions:
  - Random dates between Jan 1, 2023 and today
  - 2-6 random players per session
  - Random scores for each player
  - Winner assigned randomly
  - 30% chance of having a description

### Achievements
- 11 predefined achievements:
  - **Milestone**: First Victory (bronze, 1 win)
  - **Streak**: Hot Streak (silver, 3 wins), Unstoppable (gold, 5 wins)
  - **Participation**: Getting Started (bronze, 10 games), Regular Player (silver, 50 games), Dedicated Gamer (gold, 100 games), Board Game Legend (platinum, 250 games)
  - **Generalist**: Explorer (bronze, 5 games), Adventurer (silver, 15 games), Connoisseur (gold, 30 games), Master Collector (platinum, 50 games)

### Player Achievements
- Each player gets progress records for all achievements
- Random progress values (0 to goal)
- Achievements with progress >= goal are marked as unlocked
- Metadata populated for generalist and specialist achievements

## Notes

- This script is **for local development only** - do not run in production
- The script will take 1-2 minutes to complete
- All data is randomly generated
- Player emails use @example.com domain
- No actual Clerk authentication is set up for these players

## Troubleshooting

**Error: "Can't reach database server"**
- Make sure your local MySQL database is running
- Check your `DATABASE_URL` in `.env.local`

**Error: "Table does not exist"**
- Run `npx prisma migrate dev` to apply migrations

**Error: "tsx: command not found"**
- Run `npm install` to install all dependencies including tsx
