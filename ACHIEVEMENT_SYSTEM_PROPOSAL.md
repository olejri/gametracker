# Achievement System Proposal (No Code Changes)

**Date:** 2026-01-14  
**Status:** Design Proposal  
**Purpose:** Propose a scalable, per-game achievement system with automatic suggestion capabilities

---

## Executive Summary

This document proposes a next-generation achievement system for GameTracker that supports **unique achievements per board game** rather than one-size-fits-all generic achievements. The solution includes both manual per-game achievement configuration and an Achievement Generator approach that can suggest suitable achievements based on game metadata, mechanics, and player events.

---

## 1. Current State Summary

### 1.1 What Exists Today

**Achievement Definition:**
- Achievements are **hardcoded** in `/src/server/helpers/achievementHelper.tsx`
- Currently defined: 8 generic achievements (4 "Specialist" + 4 "Generalist")
- All achievements are **cross-game** and apply to all board games uniformly
- TODO comment present: `//TODO: Move to database`

**Achievement Types (Current):**
```typescript
export type AchievementTypeCounter = {
    name: string,
    achievementNumber: number,
    goal: number,
    score: number,
    fulfilled: boolean,
    description: string,
    gameName?: string,
}
```

**Current Achievement List:**
1. **Specialist Apprentice** - Win the same game 5 times
2. **Specialist Journeyman** - Win the same game 10 times
3. **Specialist Expert** - Win the same game 25 times
4. **Specialist Master** - Win the same game 50 times
5. **Generalist Apprentice** - Win 5 different games
6. **Generalist Journeyman** - Win 10 different games
7. **Generalist Expert** - Win 25 different games
8. **Generalist Master** - Win 50 different games

**Achievement Calculation:**
- Located in `/src/server/api/routers/player.ts` → `calculateAchievements` procedure
- Computed **on-demand** when viewing the achievements page
- Uses aggregation logic over `GameSession` → `PlayerGameSessionJunction` data
- Calculates:
  - `maxWins` - highest number of wins in a single game
  - `gameWithMaxWins` - the game name with the most wins
  - `numberOfFirstPlacePrGame.size` - number of different games won

**Achievement Display:**
- Component: `/src/components/MyAchievements.tsx`
- Displays completed achievements (gold sparkles) and uncompleted (grayed out)
- Shows progress (score/goal) for each achievement
- UI: grid layout with SparklesIcon, name, description, progress badges

**Data Model (Current):**
- **No database tables** for achievements
- Achievements calculated from:
  - `GameSession` table
  - `PlayerGameSessionJunction` table (tracks player position and score)
  - `Game` table (for game metadata)
  - `GameGroup` table (for group isolation)

### 1.2 Game Domain Model

**Game Table (Prisma Schema):**
```prisma
model Game {
  id                      String   @id @default(uuid())
  name                    String   @unique
  image_url               String   @db.Text
  description             String   @db.Text
  players                 String
  playtime                String
  mechanics               String   @db.Text    // Stored as comma-separated
  categories              String   @db.Text    // Stored as comma-separated
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  baseGameId              String?
  isExpansion             Boolean  @default(false)
}
```

**Game Metadata Available:**
- Name, description, image
- Player count range (stored as string)
- Playtime range (stored as string)
- **Mechanics** (e.g., "Dice Rolling", "Worker Placement", "Deck Building")
- **Categories** (e.g., "Strategy", "Economic", "Co-op")
- Expansion relationships (baseGameId)

**Game Session Events:**
- `GameSession` tracks:
  - Game played (`gameId`)
  - Status: Ongoing / Completed / Cancelled
  - Creation date
  - Group context (`groupId`)
  - Team game flag (`isTeamGame`)
- `PlayerGameSessionJunction` tracks:
  - Player position (1st, 2nd, 3rd, etc.)
  - Player score (stored as string)
  - Player participation
- `GameSessionTeam` tracks team-based games
- `GameSessionRandomizationLog` tracks setup randomization events (seat order, starting player, etc.)

**Additional Data Sources:**
- Player collection ownership (`PlayerGameJunction`)
- Win/loss statistics (calculated from sessions)
- Player performance matrix (win rates per game)
- High scores per game

---

## 2. Problems & Constraints

### 2.1 Current Pain Points

1. **Generic Achievements Only:**
   - All achievements are cross-game (Specialist/Generalist)
   - No way to define game-specific achievements
   - Cannot leverage unique game mechanics or themes

2. **Hardcoded Logic:**
   - Achievement definitions live in code, not data
   - Adding new achievements requires code changes
   - No versioning or historical tracking

3. **Limited Event Data:**
   - Only position and score are tracked
   - No in-game events (e.g., "first to build a settlement")
   - No milestone tracking during gameplay

4. **No Achievement Discovery:**
   - Users don't know what achievements exist for a new game
   - No suggestions when adding a game to the collection
   - No templates or reusable patterns

5. **Scalability Issues:**
   - As game library grows, managing per-game logic in code becomes unwieldy
   - No separation of concerns between achievement definition and evaluation
   - Difficult to A/B test or iterate on achievement designs

### 2.2 Constraints

- **No Intrusive Gameplay Changes:** Users track sessions post-game; we cannot capture real-time in-game events
- **Score Format Variability:** Scores are stored as strings, not normalized
- **Backwards Compatibility:** Existing achievements and historical data must remain valid
- **Multi-Tenancy:** Achievements must respect group boundaries
- **Performance:** Achievement calculation should not slow down page loads
- **User-Generated Content:** Future potential for custom achievements by group admins

---

## 3. Design Goals

### 3.1 Core Requirements

1. **Per-Game Achievement Support:**
   - Each board game can have its own tailored achievement set
   - Achievements can reference game-specific mechanics, themes, scoring rules

2. **Achievement Generation/Suggestion:**
   - System can propose suitable achievements for a new or unknown game
   - Suggestions based on game metadata (type, mechanics, categories)
   - Template library for common patterns (first win, win streak, high score, etc.)

3. **Scalability:**
   - Easy to add new games and achievements without code changes
   - Data-driven configuration (stored in database)
   - Decoupled achievement definition from evaluation logic

4. **Maintainability:**
   - Clear separation of concerns
   - No hardcoded per-game logic scattered across codebase
   - Versioned achievement definitions
   - Easy to test and validate new achievements

5. **Extensibility:**
   - Support for future event types (e.g., in-game milestones if tracked later)
   - Pluggable evaluation engines (SQL queries, custom functions)
   - Support for conditional/dynamic achievements

---

## 4. Proposed Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Achievement System                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Achievement     │         │  Achievement     │        │
│  │  Definition      │────────▶│  Evaluation      │        │
│  │  Engine          │         │  Engine          │        │
│  │                  │         │                  │        │
│  │ • Templates      │         │ • Rule Parser    │        │
│  │ • Game Configs   │         │ • Event Matcher  │        │
│  │ • Rules DSL      │         │ • Progress Calc  │        │
│  └────────┬─────────┘         └─────────┬────────┘        │
│           │                             │                 │
│           │                             │                 │
│  ┌────────▼──────────────────────────────▼─────────┐     │
│  │        Achievement Database Tables              │     │
│  │                                                  │     │
│  │  • AchievementTemplate                          │     │
│  │  • GameAchievement                              │     │
│  │  • PlayerAchievementProgress                    │     │
│  │  • AchievementRule                              │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Achievement     │         │  Suggestion      │        │
│  │  History/        │         │  Engine          │        │
│  │  Versioning      │         │                  │        │
│  │                  │         │ • Heuristics     │        │
│  │ • Audit Log      │         │ • Templates      │        │
│  │ • Rollback       │         │ • Mechanic Map   │        │
│  └──────────────────┘         └──────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Key Components

**1. Achievement Template Library**
- Pre-defined achievement patterns (win streak, high score, milestone, combo, etc.)
- Templates are **game-agnostic** but **mechanic-aware**
- Each template defines:
  - Name pattern (e.g., "{GameName} Master")
  - Description pattern
  - Evaluation rule type
  - Suggested thresholds
  - Required data fields

**2. Game Achievement Configuration**
- Per-game achievement instances
- References a template OR custom rules
- Specifies:
  - Achievement name/description (can override template)
  - Goal thresholds
  - Evaluation rule/query
  - Display metadata (icon, rarity, category)

**3. Achievement Evaluation Engine**
- Processes achievement rules against session data
- Supports multiple evaluation strategies:
  - **Post-game batch:** Calculate after session completion
  - **On-demand:** Calculate when viewing achievements page
  - **Scheduled:** Background job for complex achievements
- Rule types:
  - SQL-based queries (for aggregations)
  - Function-based (for complex logic)
  - Event pattern matching

**4. Achievement Suggestion Engine**
- Analyzes game metadata to suggest achievements
- Inputs:
  - Game mechanics (e.g., "Worker Placement")
  - Game categories (e.g., "Co-op")
  - Player count range
  - Existing session data (if available)
- Outputs:
  - List of suggested achievement templates
  - Recommended thresholds
  - Reasoning/explanation

**5. Player Achievement Progress Tracking**
- Stores per-player, per-achievement progress
- Tracks:
  - Current score/progress
  - Last updated timestamp
  - Completion timestamp
  - Historical milestones

---

## 5. Data Model Proposal

### 5.1 New Database Tables

#### **AchievementTemplate**
```prisma
model AchievementTemplate {
  id                String   @id @default(uuid())
  templateKey       String   @unique  // e.g., "WIN_STREAK_5"
  name              String              // e.g., "Win Streak Master"
  descriptionPattern String @db.Text   // e.g., "Win {gameName} {threshold} times in a row"
  ruleType          String              // "SQL_QUERY", "FUNCTION", "EVENT_PATTERN"
  ruleDefinition    String   @db.Text  // JSON or code snippet
  requiredMechanics String?  @db.Text  // JSON array of applicable mechanics
  requiredCategories String? @db.Text  // JSON array of applicable categories
  suggestedThresholds String @db.Text  // JSON: [5, 10, 25, 50]
  metadata          String?  @db.Text  // JSON: {icon, color, rarity, etc.}
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  GameAchievements  GameAchievement[]
}
```

#### **GameAchievement**
```prisma
model GameAchievement {
  id                String   @id @default(uuid())
  gameId            String
  achievementKey    String              // e.g., "catan_win_streak_5"
  name              String
  description       String   @db.Text
  threshold         Int                 // Goal value (e.g., 5 wins)
  ruleType          String              // "SQL_QUERY", "FUNCTION", "CUSTOM"
  ruleDefinition    String   @db.Text   // Evaluation logic
  templateId        String?             // Reference to template (optional)
  category          String?             // "PROGRESSION", "MASTERY", "EXPLORATION", etc.
  rarity            String   @default("COMMON") // "COMMON", "RARE", "EPIC", "LEGENDARY"
  isActive          Boolean  @default(true)
  version           Int      @default(1)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  game              Game     @relation(fields: [gameId], references: [id])
  template          AchievementTemplate? @relation(fields: [templateId], references: [id])
  PlayerAchievementProgress PlayerAchievementProgress[]
  
  @@unique([gameId, achievementKey])
}
```

#### **PlayerAchievementProgress**
```prisma
model PlayerAchievementProgress {
  id                String    @id @default(uuid())
  playerId          String
  gameAchievementId String
  groupId           String              // Achievements are per-group
  currentScore      Int       @default(0)
  isCompleted       Boolean   @default(false)
  completedAt       DateTime?
  lastUpdatedAt     DateTime  @updatedAt
  metadata          String?   @db.Text // JSON: {lastGameSessionId, streak, etc.}
  
  player            Player    @relation(fields: [playerId], references: [id])
  gameAchievement   GameAchievement @relation(fields: [gameAchievementId], references: [id])
  
  @@unique([playerId, gameAchievementId, groupId])
}
```

#### **AchievementRule (Optional, for complex rules)**
```prisma
model AchievementRule {
  id                String   @id @default(uuid())
  ruleKey           String   @unique
  ruleType          String              // "SQL", "TYPESCRIPT_FUNCTION", "WEBHOOK"
  ruleDefinition    String   @db.Text
  description       String?  @db.Text
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### 5.2 Schema Additions to Existing Tables

```prisma
// Add to Game model
model Game {
  // ... existing fields ...
  GameAchievements  GameAchievement[]
}

// Add to Player model
model Player {
  // ... existing fields ...
  PlayerAchievementProgress PlayerAchievementProgress[]
}
```

### 5.3 Achievement Versioning

Achievements can be versioned to handle:
- Balance changes (adjusting thresholds)
- Bug fixes in evaluation logic
- Deprecation of old achievements

Versioning strategy:
- Store `version` field on `GameAchievement`
- Keep old versions in database (soft delete with `isActive` flag)
- Player progress references specific version
- New achievements inherit from templates with updated rules

---

## 6. Achievement Generation / Suggestion Strategy

### 6.1 Template Library Design

**Core Templates:**

| Template Key | Name Pattern | Description | Applicable Mechanics | Thresholds |
|--------------|--------------|-------------|----------------------|------------|
| `FIRST_WIN` | "First Victory" | Win {gameName} for the first time | All | 1 |
| `WIN_STREAK_N` | "{GameName} Streak Master" | Win {gameName} N times in a row | All | [3, 5, 10] |
| `TOTAL_WINS_N` | "{GameName} Specialist" | Win {gameName} N times total | All | [5, 10, 25, 50] |
| `HIGH_SCORE_N` | "High Roller" | Score at least N points in {gameName} | All | Game-specific |
| `PERFECT_SCORE` | "Perfect Score" | Achieve the maximum possible score | All | 1 |
| `COMEBACK_WIN` | "Underdog Champion" | Win after being in last place mid-game | All | 1 |
| `DOMINANT_WIN` | "Domination" | Win by a margin of N points | All | Game-specific |
| `QUICK_WIN` | "Speed Demon" | Win {gameName} in under N minutes | All | Game-specific |
| `WORKER_PLACEMENT_EFFICIENCY` | "Efficient Planner" | Win with fewer than N worker placements | Worker Placement | Game-specific |
| `DECK_BUILDER_COMBO` | "Combo Master" | Play N cards in a single turn | Deck Building | [5, 10, 15] |
| `RESOURCE_MANAGEMENT` | "Resource Tycoon" | Accumulate N resources in one game | Resource Management | Game-specific |
| `CO_OP_WIN_DIFFICULTY_N` | "Co-op Hero" | Win a co-op game on difficulty N | Co-op | [1, 2, 3, 4, 5] |
| `EXPLORATION_TILES` | "Explorer" | Reveal/explore N tiles/locations | Exploration | Game-specific |
| `COLLECTION_COMPLETE` | "Collector" | Acquire all items/cards of type X | Set Collection | 1 |
| `MULTIPLAYER_VARIETY` | "Social Butterfly" | Play with N different players | All | [5, 10, 25] |

### 6.2 Mechanic-to-Template Mapping

```typescript
// Example mapping (illustrative)
const MECHANIC_TEMPLATE_MAP = {
  "Worker Placement": [
    "FIRST_WIN",
    "WIN_STREAK_N",
    "TOTAL_WINS_N",
    "WORKER_PLACEMENT_EFFICIENCY",
    "DOMINANT_WIN"
  ],
  "Deck Building": [
    "FIRST_WIN",
    "WIN_STREAK_N",
    "DECK_BUILDER_COMBO",
    "COLLECTION_COMPLETE",
    "HIGH_SCORE_N"
  ],
  "Cooperative": [
    "FIRST_WIN",
    "CO_OP_WIN_DIFFICULTY_N",
    "PERFECT_SCORE",
    "TOTAL_WINS_N"
  ],
  "Dice Rolling": [
    "FIRST_WIN",
    "HIGH_SCORE_N",
    "COMEBACK_WIN",
    "DOMINANT_WIN"
  ],
  "Area Control": [
    "FIRST_WIN",
    "DOMINANT_WIN",
    "TOTAL_WINS_N",
    "EXPLORATION_TILES"
  ]
  // ... more mappings
};
```

### 6.3 Suggestion Algorithm

**Step 1: Extract Game Features**
```typescript
// Pseudo-code
function extractGameFeatures(game: Game) {
  return {
    mechanics: parseCommaSeparated(game.mechanics),
    categories: parseCommaSeparated(game.categories),
    playerCount: parsePlayerRange(game.players),
    playtime: parsePlaytimeRange(game.playtime),
    isCoop: game.categories.includes("Cooperative"),
    isCompetitive: !game.categories.includes("Cooperative")
  };
}
```

**Step 2: Match Templates**
```typescript
function suggestAchievements(game: Game, templates: AchievementTemplate[]) {
  const features = extractGameFeatures(game);
  const suggestions = [];
  
  for (const template of templates) {
    // Check if template applies to this game
    const score = calculateRelevanceScore(template, features);
    
    if (score > THRESHOLD) {
      suggestions.push({
        template,
        score,
        suggestedThresholds: inferThresholds(template, features),
        reasoning: generateReasoning(template, features)
      });
    }
  }
  
  return suggestions.sort((a, b) => b.score - a.score);
}
```

**Step 3: Infer Thresholds**
```typescript
function inferThresholds(template: AchievementTemplate, features: GameFeatures) {
  // Use heuristics based on game type
  if (template.templateKey === "HIGH_SCORE_N") {
    // Analyze historical session scores if available
    // Otherwise, use game complexity indicators
    if (features.playtime.max > 120) {
      return [100, 200, 500]; // Long, complex games
    } else {
      return [50, 100, 250];  // Shorter games
    }
  }
  
  if (template.templateKey === "TOTAL_WINS_N") {
    // Standard progression
    return template.suggestedThresholds; // [5, 10, 25, 50]
  }
  
  // ... more threshold logic
}
```

**Step 4: Generate Reasoning**
```typescript
function generateReasoning(template: AchievementTemplate, features: GameFeatures) {
  const reasons = [];
  
  if (template.requiredMechanics?.some(m => features.mechanics.includes(m))) {
    reasons.push(`Game uses ${template.requiredMechanics} mechanic`);
  }
  
  if (features.isCoop && template.templateKey.includes("CO_OP")) {
    reasons.push("Cooperative game detected");
  }
  
  return reasons.join("; ");
}
```

### 6.4 Ensuring "Suitable" Suggestions

**Quality Criteria:**
1. **Mechanic Alignment:** Template mechanics must match game mechanics
2. **Data Availability:** Only suggest achievements for which we can track data
   - Currently: position, score, participation
   - Cannot suggest: "Play a specific card" (no card tracking)
3. **Threshold Realism:** Use historical data or heuristics to avoid impossible goals
4. **Variety:** Suggest mix of easy/medium/hard achievements
5. **Novelty:** Prefer achievements that leverage unique game aspects
6. **User Testing:** Flag generated achievements for admin review before activation

**Fallback Strategy:**
- If no mechanics match, suggest universal templates (FIRST_WIN, TOTAL_WINS_N)
- Always include 3-5 "safe" achievements (first win, specialist tiers)
- Mark suggested achievements as "DRAFT" until admin approves

---

## 7. Achievement Evaluation Strategies

### 7.1 Rule Types

**1. SQL Query Rules**
- Best for: Aggregations, counting, statistics
- Example: Total wins, win streaks, high scores
- Execution: Direct database query
- Performance: Fast, leverages indexes

```typescript
// Example rule definition (JSON)
{
  "ruleType": "SQL_QUERY",
  "query": `
    SELECT COUNT(*) as score
    FROM PlayerGameSessionJunction pgj
    JOIN GameSession gs ON pgj.gameSessionId = gs.id
    WHERE pgj.playerId = :playerId
      AND gs.gameId = :gameId
      AND gs.groupId = :groupId
      AND pgj.position = 1
      AND gs.status = 'COMPLETED'
  `,
  "threshold": 5,
  "progressField": "score"
}
```

**2. Function-Based Rules**
- Best for: Complex logic, conditional checks, multi-step calculations
- Example: Win streaks, comeback wins, efficiency metrics
- Execution: TypeScript function in codebase
- Performance: Slower, requires data fetching

```typescript
// Example function rule
async function evaluateWinStreak(
  playerId: string,
  gameId: string,
  groupId: string
): Promise<{ score: number; metadata: object }> {
  const sessions = await prisma.gameSession.findMany({
    where: { gameId, groupId, status: "COMPLETED" },
    include: { PlayerGameSessionJunction: true },
    orderBy: { createdAt: "desc" }
  });
  
  let currentStreak = 0;
  let maxStreak = 0;
  
  for (const session of sessions) {
    const playerSession = session.PlayerGameSessionJunction.find(
      p => p.playerId === playerId
    );
    
    if (playerSession?.position === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return { score: maxStreak, metadata: { currentStreak } };
}
```

**3. Event Pattern Matching (Future)**
- Best for: Real-time or in-game events (if tracked in future)
- Example: "Play 3 cards in one turn", "Build all settlements"
- Requires: Event logging infrastructure

### 7.2 Evaluation Timing

**Option A: Post-Game Batch Processing**
- Trigger: After session marked as "COMPLETED"
- Process: Update all relevant achievements for all participating players
- Pros: Real-time progress, accurate, immediate feedback
- Cons: Adds latency to session completion

**Option B: On-Demand Calculation**
- Trigger: When user views achievements page
- Process: Calculate progress for all achievements
- Pros: No session completion overhead
- Cons: Slower page load, no notifications

**Option C: Hybrid Approach (Recommended)**
- **Simple achievements:** Calculate on-demand (FIRST_WIN, TOTAL_WINS)
- **Complex achievements:** Batch update post-game (WIN_STREAK, COMEBACK_WIN)
- **Cached progress:** Store in `PlayerAchievementProgress` table
- **Invalidation:** Mark progress as stale when new session added

**Option D: Scheduled Background Jobs**
- Trigger: Cron job (e.g., nightly)
- Process: Recalculate all achievements for all players
- Pros: No user-facing latency
- Cons: Delayed feedback, resource-intensive

**Recommended Implementation:**
- Start with **Option B** (on-demand) for MVP
- Add **Option C** (hybrid) as achievement complexity grows
- Use **Option D** (scheduled) only for analytics/leaderboards

---

## 8. Examples

### 8.1 Example 1: Deck-Building Game (e.g., Dominion)

**Game Metadata:**
```json
{
  "name": "Dominion",
  "mechanics": "Deck Building, Hand Management",
  "categories": "Card Game, Strategy"
}
```

**Suggested Achievements:**

| Achievement | Template | Description | Threshold | Rule Type |
|-------------|----------|-------------|-----------|-----------|
| **First Victory** | FIRST_WIN | Win Dominion for the first time | 1 | SQL |
| **Dominion Apprentice** | TOTAL_WINS_N | Win Dominion 5 times | 5 | SQL |
| **Dominion Master** | TOTAL_WINS_N | Win Dominion 25 times | 25 | SQL |
| **Streak Champion** | WIN_STREAK_N | Win Dominion 3 times in a row | 3 | Function |
| **High Score Hero** | HIGH_SCORE_N | Score at least 50 points in Dominion | 50 | SQL |
| **Dominant Victory** | DOMINANT_WIN | Win Dominion by 20+ points | 20 | Function |

**Example Rule Definition (Dominion Apprentice):**
```json
{
  "achievementKey": "dominion_total_wins_5",
  "name": "Dominion Apprentice",
  "description": "Win Dominion 5 times",
  "threshold": 5,
  "ruleType": "SQL_QUERY",
  "ruleDefinition": "{\"query\": \"SELECT COUNT(*) as score FROM PlayerGameSessionJunction pgj JOIN GameSession gs ON pgj.gameSessionId = gs.id WHERE pgj.playerId = :playerId AND gs.gameId = :gameId AND gs.groupId = :groupId AND pgj.position = 1 AND gs.status = 'COMPLETED'\", \"threshold\": 5}",
  "templateId": "<TOTAL_WINS_N_TEMPLATE_ID>",
  "category": "PROGRESSION",
  "rarity": "COMMON"
}
```

### 8.2 Example 2: Worker Placement Game (e.g., Agricola)

**Game Metadata:**
```json
{
  "name": "Agricola",
  "mechanics": "Worker Placement, Resource Management, Hand Management",
  "categories": "Farming, Strategy, Economic"
}
```

**Suggested Achievements:**

| Achievement | Template | Description | Threshold | Rule Type |
|-------------|----------|-------------|-----------|-----------|
| **First Harvest** | FIRST_WIN | Win Agricola for the first time | 1 | SQL |
| **Farmer Apprentice** | TOTAL_WINS_N | Win Agricola 5 times | 5 | SQL |
| **Master Farmer** | TOTAL_WINS_N | Win Agricola 25 times | 25 | SQL |
| **Perfect Farm** | HIGH_SCORE_N | Score at least 60 points in Agricola | 60 | SQL |
| **Efficiency Expert** | DOMINANT_WIN | Win Agricola by 15+ points | 15 | Function |
| **Resource Tycoon** | RESOURCE_MANAGEMENT | Finish with 10+ of each resource type | 10 | Function* |

*Note: "Resource Tycoon" requires tracking resource counts during game, which is not currently supported. This would be flagged as "Future" or excluded from suggestions.

### 8.3 Example 3: Cooperative Game (e.g., Pandemic)

**Game Metadata:**
```json
{
  "name": "Pandemic",
  "mechanics": "Cooperative Play, Hand Management, Action Point Allowance System",
  "categories": "Cooperative, Medical, Strategy"
}
```

**Suggested Achievements:**

| Achievement | Template | Description | Threshold | Rule Type |
|-------------|----------|-------------|-----------|-----------|
| **First Cure** | FIRST_WIN | Win Pandemic for the first time | 1 | SQL |
| **Disease Fighter** | TOTAL_WINS_N | Win Pandemic 5 times | 5 | SQL |
| **Epidemic Control** | TOTAL_WINS_N | Win Pandemic 10 times | 10 | SQL |
| **Hero of Humanity** | TOTAL_WINS_N | Win Pandemic 25 times | 25 | SQL |
| **Pandemic Streak** | WIN_STREAK_N | Win Pandemic 3 times in a row | 3 | Function |
| **Team Player** | MULTIPLAYER_VARIETY | Play Pandemic with 10 different players | 10 | SQL |

**Notes on Co-op Achievements:**
- "Position" field is irrelevant (all players win or lose together)
- Focus on total wins, streaks, participation variety
- Could add difficulty-based achievements if difficulty level is tracked

### 8.4 Example 4: New/Unknown Game (Auto-Suggestion)

**Scenario:** User adds a custom game "Mystery Quest" with basic metadata:
```json
{
  "name": "Mystery Quest",
  "mechanics": "Exploration, Dice Rolling, Variable Player Powers",
  "categories": "Adventure, Fantasy"
}
```

**Suggestion Engine Output:**

```json
{
  "suggestedAchievements": [
    {
      "template": "FIRST_WIN",
      "name": "First Quest Complete",
      "description": "Win Mystery Quest for the first time",
      "threshold": 1,
      "reasoning": "Universal starter achievement for all games",
      "priority": "HIGH"
    },
    {
      "template": "TOTAL_WINS_N",
      "name": "Adventurer Apprentice",
      "description": "Win Mystery Quest 5 times",
      "threshold": 5,
      "reasoning": "Standard progression achievement",
      "priority": "HIGH"
    },
    {
      "template": "TOTAL_WINS_N",
      "name": "Adventurer Master",
      "description": "Win Mystery Quest 25 times",
      "threshold": 25,
      "reasoning": "Advanced progression achievement",
      "priority": "MEDIUM"
    },
    {
      "template": "WIN_STREAK_N",
      "name": "Quest Streak",
      "description": "Win Mystery Quest 3 times in a row",
      "threshold": 3,
      "reasoning": "Encourages consistent play",
      "priority": "MEDIUM"
    },
    {
      "template": "HIGH_SCORE_N",
      "name": "High Roller",
      "description": "Score at least 100 points in Mystery Quest",
      "threshold": 100,
      "reasoning": "Game appears to be score-based (has dice rolling)",
      "priority": "LOW",
      "note": "Threshold needs validation based on actual game scoring"
    },
    {
      "template": "EXPLORATION_TILES",
      "name": "Fearless Explorer",
      "description": "Explore all locations in Mystery Quest",
      "threshold": 1,
      "reasoning": "Game uses Exploration mechanic",
      "priority": "LOW",
      "note": "FUTURE - Requires tracking exploration progress during game"
    }
  ],
  "autoApply": ["FIRST_WIN", "TOTAL_WINS_N (5)"],
  "reviewRequired": ["HIGH_SCORE_N", "EXPLORATION_TILES"]
}
```

**UI Flow:**
1. User adds "Mystery Quest" to collection
2. System runs suggestion engine
3. Display modal: "We've suggested 6 achievements for Mystery Quest! Review and activate?"
4. User can accept all, customize thresholds, or skip
5. Activated achievements are immediately available

---

## 9. Migration Plan (Phased Rollout)

### Phase 1: Database Schema & Infrastructure (Weeks 1-2)

**Goals:**
- Add new achievement tables
- Migrate existing hardcoded achievements to database
- No user-facing changes

**Tasks:**
1. Create Prisma schema for new tables
2. Generate and run database migrations
3. Seed database with:
   - Template library (15-20 core templates)
   - Migrated generic achievements (Specialist/Generalist)
4. Add groupId to existing achievement calculations
5. Create database indexes for performance

**Backwards Compatibility:**
- Keep existing `calculateAchievements` procedure working
- Old achievements now read from database instead of hardcoded
- Existing UI continues to work

**Validation:**
- Unit tests for schema
- Verify existing achievements display correctly
- Performance benchmarks for new queries

### Phase 2: Per-Game Achievements (Weeks 3-4)

**Goals:**
- Enable manual per-game achievement creation
- Admin UI for achievement management
- Display game-specific achievements on player profile

**Tasks:**
1. Create TRPC procedures:
   - `createGameAchievement(gameId, achievementData)`
   - `updateGameAchievement(achievementId, updates)`
   - `deleteGameAchievement(achievementId)`
   - `getGameAchievements(gameId)`
2. Build admin UI:
   - Achievement editor form
   - Game-to-achievement mapping table
   - Preview achievement cards
3. Update `calculateAchievements` to include game-specific achievements
4. Update `MyAchievements` component to group by game

**Testing:**
- Manually create 3-5 achievements for 2-3 popular games
- Verify calculation logic works
- Test performance with 50+ achievements

### Phase 3: Achievement Suggestion Engine (Weeks 5-7)

**Goals:**
- Auto-suggest achievements for new games
- Template-based generation
- Admin review workflow

**Tasks:**
1. Implement suggestion algorithm
2. Build mechanic-to-template mapping
3. Create suggestion UI:
   - Modal on game creation: "Suggested Achievements"
   - Threshold customization sliders
   - Accept/reject buttons
4. Add TRPC procedures:
   - `suggestAchievements(gameId)`
   - `applyAchievementSuggestion(gameId, templateId, threshold)`
5. Implement batch application (accept all suggestions)

**Testing:**
- Test with 10 diverse games (deck-builders, worker placement, co-op, etc.)
- Validate suggestion quality
- User acceptance testing with admins

### Phase 4: Evaluation Engine Refactor (Weeks 8-9)

**Goals:**
- Support SQL and function-based rules
- Optimize performance
- Add caching layer

**Tasks:**
1. Build rule parser/executor
2. Implement SQL query evaluation
3. Implement function-based evaluation
4. Add `PlayerAchievementProgress` caching
5. Create invalidation logic on new session
6. Add evaluation timing options (on-demand vs. batch)

**Testing:**
- Performance tests (1000 sessions, 100 achievements)
- Correctness tests (compare old vs. new calculation)
- Load testing (concurrent users viewing achievements)

### Phase 5: Polish & Advanced Features (Weeks 10-12)

**Goals:**
- Achievement notifications
- Leaderboards
- Achievement rarity/categories
- Versioning support

**Tasks:**
1. Add toast notifications when achievement unlocked
2. Create achievement leaderboard page
3. Add rarity badges (common/rare/epic/legendary)
4. Implement achievement categories (Progression, Mastery, Exploration, etc.)
5. Add versioning and rollback support
6. Create achievement analytics dashboard

**Testing:**
- End-to-end user testing
- Accessibility testing
- Mobile responsiveness

### Phase 6: User-Generated Content (Future)

**Goals:**
- Group admins can create custom achievements
- Community templates
- Achievement marketplace (stretch)

**Tasks:**
1. Add `creatorId` to `GameAchievement`
2. Add approval workflow for custom achievements
3. Create template sharing system
4. Build moderation tools

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Performance degradation** with many achievements | High | Medium | Implement caching, indexing, lazy loading; use batch processing for complex achievements |
| **Complex rule evaluation** causes timeouts | High | Medium | Set rule execution time limits; fallback to simplified logic; offload to background jobs |
| **Data migration** breaks existing achievements | High | Low | Thorough testing; rollback plan; keep old code path for 1 release |
| **Suggestion engine** produces low-quality achievements | Medium | High | Human review workflow; quality scoring; A/B testing; feedback loop |
| **Schema changes** cause deployment issues | Medium | Low | Use Prisma migrations; test on staging; deploy during low-traffic window |

### 10.2 Product Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Users overwhelmed** by too many achievements | Medium | Medium | Limit to 10-15 achievements per game; prioritize by category; progressive disclosure |
| **Achievements feel generic** despite customization | High | Medium | Require manual review; user feedback cycle; iterate on templates |
| **Low adoption** of per-game achievements | Low | Medium | Seed popular games with high-quality achievements; marketing/tutorials |
| **Confusion between global and game-specific** | Medium | Medium | Clear UI separation; visual distinctions; tooltips |
| **Balancing is hard** (thresholds too easy/hard) | Medium | High | Use data-driven suggestions; allow admins to adjust; monitor completion rates |

### 10.3 Operational Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Increased database costs** | Low | Medium | Monitor usage; optimize queries; implement archival for old achievements |
| **More support requests** for achievement bugs | Medium | Medium | Clear documentation; bug reporting flow; automated testing |
| **Template maintenance burden** | Medium | High | Start with core templates; community contributions; clear documentation |

---

## 11. Open Questions / Next Decisions

### 11.1 Design Questions

1. **Should achievements be retroactive?**
   - If a user has already won Catan 10 times, do they instantly unlock "Catan Master"?
   - **Recommendation:** Yes, calculate retroactively based on historical session data

2. **How do we handle multi-game achievements?**
   - Example: "Win all worker placement games at least once"
   - **Recommendation:** Phase 2+ feature; use tags/categories to group games

3. **Should achievements unlock rewards?**
   - Badges, profile flair, special stats views?
   - **Recommendation:** Start simple (just unlocking); add cosmetic rewards in Phase 5

4. **How do we handle achievement difficulty tiers?**
   - Bronze/Silver/Gold? Or just multiple separate achievements?
   - **Recommendation:** Separate achievements with clear naming (Apprentice/Journeyman/Expert/Master)

5. **Can users hide/disable achievements they don't care about?**
   - **Recommendation:** Phase 2+ feature; add "hide achievement" toggle

6. **Should achievement progress sync across groups?**
   - If user plays Catan in two game groups, does progress combine?
   - **Recommendation:** No, achievements are per-group (current groupId scoping)

### 11.2 Technical Questions

1. **Rule definition format: JSON vs. code files?**
   - JSON is easier to store/version but less flexible
   - Code files are more powerful but harder to manage
   - **Recommendation:** Hybrid approach - JSON for SQL rules, TypeScript functions for complex logic

2. **Should we support custom JavaScript in rules?**
   - Security concerns (code injection)
   - **Recommendation:** No custom JS from users; predefined function library only

3. **How do we handle score parsing?**
   - Scores are currently strings; need normalization for comparisons
   - **Recommendation:** Add `scoreNumeric` field to `PlayerGameSessionJunction` or parse on-the-fly with error handling

4. **Event logging infrastructure?**
   - Required for advanced achievements (card plays, tile placement, etc.)
   - **Recommendation:** Out of scope for MVP; plan for Phase 6+

5. **Caching strategy?**
   - Cache in database (PlayerAchievementProgress) vs. Redis vs. in-memory?
   - **Recommendation:** Start with database caching; add Redis if performance issues

### 11.3 UX Questions

1. **Where do achievements display?**
   - Player profile only? Game detail pages? Dashboard?
   - **Recommendation:** Player profile primary; add game detail page badge count

2. **How do we notify users of new achievements?**
   - Toast notification? Email? In-app notification center?
   - **Recommendation:** Toast on unlock; optional email digest

3. **Should there be a global achievement feed?**
   - "PlayerX just unlocked Catan Master!"
   - **Recommendation:** Phase 5 feature; adds social engagement

4. **How do we handle achievement spoilers?**
   - Some users want to discover achievements; others want full list
   - **Recommendation:** Show all achievements with progress; add "spoiler-free mode" toggle

---

## 12. Recommended Next Steps

### 12.1 Immediate Actions (Next Week)

1. **Stakeholder Review:**
   - Share this proposal with team/owner
   - Gather feedback on approach and scope
   - Prioritize phases based on business goals

2. **Technical Feasibility Spike:**
   - Validate Prisma schema changes
   - Prototype achievement suggestion algorithm
   - Benchmark achievement calculation performance

3. **User Research:**
   - Survey users: What achievements would they want?
   - Identify 5-10 most-played games for initial focus
   - Gather feedback on achievement categories/types

### 12.2 Approval Checkpoints

**Before Phase 1:**
- [ ] Schema design approved
- [ ] Template library defined (15-20 templates)
- [ ] Migration plan validated

**Before Phase 2:**
- [ ] Admin UI mockups approved
- [ ] Game selection strategy defined (which games first?)
- [ ] Achievement creation workflow tested

**Before Phase 3:**
- [ ] Suggestion algorithm tested on 20+ games
- [ ] Quality criteria defined and validated
- [ ] Review workflow designed

### 12.3 Success Metrics

**Adoption Metrics:**
- % of games with at least one per-game achievement
- Avg. achievements per game
- % of players viewing achievements page (increase from baseline)

**Engagement Metrics:**
- % of achievements unlocked (completion rate)
- Time to unlock first achievement (should decrease)
- Player retention correlation with achievement engagement

**Quality Metrics:**
- Suggestion acceptance rate (admin approval)
- User-reported achievement bugs (should decrease)
- Achievement balance (too easy <10%, too hard <5%)

**Performance Metrics:**
- Achievement page load time (<2 seconds)
- Session completion latency (no increase)
- Database query performance (95th percentile <500ms)

---

## 13. Conclusion

This proposal outlines a comprehensive, scalable approach to per-game achievements for GameTracker. The solution balances:

- **Flexibility:** Per-game customization via templates and rules
- **Scalability:** Data-driven configuration, not hardcoded logic
- **Usability:** Automatic suggestions reduce manual work
- **Maintainability:** Clear separation of concerns, versioning support
- **Performance:** Caching and optimized evaluation strategies

The phased rollout minimizes risk while delivering incremental value. The template library and suggestion engine ensure achievements remain high-quality and relevant as the game library grows.

**Key Differentiators:**
- Template-based generation (not fully manual)
- Mechanic-aware suggestions (leverages existing game metadata)
- Hybrid evaluation strategy (SQL + functions)
- Built-in versioning and rollback

**Next Step:** Approve proposal and begin Phase 1 (database schema).

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-14  
**Status:** Awaiting Approval  
**Owner:** GameTracker Development Team
