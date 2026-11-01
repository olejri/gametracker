import { levelFromXp, xpForSession, type PlayerLevel } from "npm/lib/playerLevel";

// One finished session, seen from the player's seat
export type ProfileSession = {
  createdAt: Date;
  gameId: string;
  gameName: string;
  mechanics: string[];
  /** The player's finishing position; null/0 = not placed */
  position: number | null;
  /** Every player's position in the session, the player included */
  allPositions: (number | null)[];
  isTeamGame: boolean;
  /** Teams that have at least one player */
  teamCount: number;
};

export type ProfileGame = {
  id: string;
  name: string;
  plays: number;
  first: number;
  second: number;
  third: number;
  winPct: number;
};

export type ProfileStats = {
  since: Date | null;
  plays: number;
  wins: number;
  winPct: number;
  podiumPct: number;
  level: PlayerLevel;
  lastGameXp: number | null;
  archetype: { title: string; reason: string };
  fairShare: { actualPct: number; fairPct: number; diffPts: number; sessions: number } | null;
  signature: {
    comfort: ProfileGame | null;
    best: ProfileGame | null;
    kryptonite: ProfileGame | null;
  };
  mechanics: { name: string; plays: number; wins: number; winPct: number }[];
  games: ProfileGame[];
};

export const STARTER_PLAYS = 3;
const MECHANIC_MIN_PLAYS = 3;
const ARCHETYPE_MIN_PLAYS = 5;
const BEST_MIN_PLAYS = 3;
const KRYPTONITE_MIN_PLAYS = 4;
const MAX_MECHANICS = 6;

const MECHANIC_TITLES: Record<string, string> = {
  "Engine Building": "The Engine Builder",
  "Area Majority / Influence": "The Warlord",
  "Area Control": "The Warlord",
  "Hand Management": "The Card Shark",
  "Deck, Bag, and Pool Building": "The Deck Builder",
  "Deck Building": "The Deck Builder",
  "Dice Rolling": "The Gambler",
  "Worker Placement": "The Planner",
  "Cooperative Game": "The Team Player",
};

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const round = (n: number) => Math.round(n);

// Everyone at the table shares one position: a co-op game with no opponent to beat
const isCoop = (s: ProfileSession) =>
  !s.isTeamGame && s.allPositions.length > 1 && s.allPositions.every((p) => p === s.allPositions[0]);

// Players (or teams) competing for the win
const sides = (s: ProfileSession) => (s.isTeamGame && s.teamCount > 0 ? s.teamCount : s.allPositions.length);

export function buildProfileStats(sessions: ProfileSession[]): ProfileStats {
  const sorted = [...sessions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const plays = sorted.length;
  const wins = sorted.filter((s) => s.position === 1).length;
  const podiums = sorted.filter((s) => s.position && s.position <= 3).length;
  const winPct = pct(wins, plays);

  const totalXp = sorted.reduce((sum, s) => sum + xpForSession(s.position), 0);
  const last = sorted[sorted.length - 1];

  // Skill vs. fair share (co-op sessions have no fair share to beat)
  const competitive = sorted.filter((s) => !isCoop(s));
  const expectedWins = competitive.reduce((sum, s) => sum + 1 / Math.max(1, sides(s)), 0);
  const competitiveWins = competitive.filter((s) => s.position === 1).length;
  const fairShare = competitive.length > 0
    ? {
      actualPct: pct(competitiveWins, competitive.length),
      fairPct: pct(expectedWins, competitive.length),
      diffPts: round(pct(competitiveWins, competitive.length)) - round(pct(expectedWins, competitive.length)),
      sessions: competitive.length,
    }
    : null;

  // Per game
  const gameMap = new Map<string, ProfileGame>();
  for (const s of sorted) {
    const g = gameMap.get(s.gameId) ?? { id: s.gameId, name: s.gameName, plays: 0, first: 0, second: 0, third: 0, winPct: 0 };
    g.plays += 1;
    if (s.position === 1) g.first += 1;
    else if (s.position === 2) g.second += 1;
    else if (s.position === 3) g.third += 1;
    gameMap.set(s.gameId, g);
  }
  const games = Array.from(gameMap.values())
    .map((g) => ({ ...g, winPct: pct(g.first, g.plays) }))
    .sort((a, b) => b.plays - a.plays || b.winPct - a.winPct || a.name.localeCompare(b.name));

  const comfort = games[0] ?? null;
  const best = games
    .filter((g) => g.plays >= BEST_MIN_PLAYS)
    .sort((a, b) => b.winPct - a.winPct || b.plays - a.plays)[0] ?? null;
  const worst = games
    .filter((g) => g.plays >= KRYPTONITE_MIN_PLAYS)
    .sort((a, b) => a.winPct - b.winPct || b.plays - a.plays)[0] ?? null;
  const kryptonite = worst && worst.id !== best?.id ? worst : null;

  // Per mechanic
  const mechMap = new Map<string, { name: string; plays: number; wins: number }>();
  for (const s of sorted) {
    for (const name of new Set(s.mechanics)) {
      const m = mechMap.get(name) ?? { name, plays: 0, wins: 0 };
      m.plays += 1;
      if (s.position === 1) m.wins += 1;
      mechMap.set(name, m);
    }
  }
  const allMechanics = Array.from(mechMap.values()).map((m) => ({ ...m, winPct: pct(m.wins, m.plays) }));
  const mechanics = allMechanics
    .filter((m) => m.plays >= MECHANIC_MIN_PLAYS)
    .sort((a, b) => b.plays - a.plays || b.winPct - a.winPct)
    .slice(0, MAX_MECHANICS);

  return {
    since: sorted[0]?.createdAt ?? null,
    plays,
    wins,
    winPct,
    podiumPct: pct(podiums, plays),
    level: levelFromXp(totalXp),
    lastGameXp: last ? xpForSession(last.position) : null,
    archetype: pickArchetype({ plays, winPct, podiumPct: pct(podiums, plays), fairShare, games, mechanics: allMechanics }),
    fairShare,
    signature: { comfort, best, kryptonite },
    mechanics,
    games,
  };
}

function pickArchetype(stats: {
  plays: number;
  winPct: number;
  podiumPct: number;
  fairShare: ProfileStats["fairShare"];
  games: ProfileGame[];
  mechanics: { name: string; plays: number; winPct: number }[];
}): { title: string; reason: string } {
  const { plays, winPct, podiumPct, fairShare, games, mechanics } = stats;

  if (plays < STARTER_PLAYS) {
    const left = STARTER_PLAYS - plays;
    return { title: "The Rookie", reason: `Play ${left} more game${left === 1 ? "" : "s"} to find out what kind of player you are.` };
  }

  const top = mechanics
    .filter((m) => m.plays >= ARCHETYPE_MIN_PLAYS && m.winPct - winPct >= 5)
    .sort((a, b) => b.winPct - winPct - (a.winPct - winPct) || b.plays - a.plays)[0];
  if (top) {
    const ratio = winPct > 0 ? top.winPct / winPct : 0;
    const compare = winPct === 0
      ? "while you have not won anything else yet"
      : ratio >= 2
        ? "over twice your overall rate"
        : ratio >= 1.75
          ? "almost twice your overall rate"
          : `against ${round(winPct)}% overall`;
    return {
      title: MECHANIC_TITLES[top.name] ?? `The ${top.name} Specialist`,
      reason: `You win ${round(top.winPct)}% of ${top.name} games, ${compare}.`,
    };
  }

  if (fairShare && fairShare.sessions >= ARCHETYPE_MIN_PLAYS && fairShare.diffPts >= 10) {
    return { title: "The Closer", reason: `You win ${round(fairShare.actualPct)}% of your games, ${fairShare.diffPts} points above your fair share.` };
  }
  if (plays >= ARCHETYPE_MIN_PLAYS && podiumPct >= 60 && winPct <= 25) {
    return { title: "The Podium Hunter", reason: `You finish top 3 in ${round(podiumPct)}% of your games, but only win ${round(winPct)}%.` };
  }
  const favourite = games[0];
  if (favourite && plays >= ARCHETYPE_MIN_PLAYS && favourite.plays / plays > 0.4) {
    return { title: "The Specialist", reason: `${favourite.plays} of your ${plays} games are ${favourite.name}.` };
  }
  if (games.length >= 8 && games.length / plays >= 0.4) {
    return { title: "The Explorer", reason: `You have played ${games.length} different games and keep trying new ones.` };
  }
  return { title: "The Regular", reason: `${plays} games and counting. The table is never complete without you.` };
}
