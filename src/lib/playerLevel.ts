/**
 * Player level and XP, computed from a player's finished sessions.
 *
 * - 10 XP for every finished session played
 * - +15 XP for 1st place, +8 for 2nd, +4 for 3rd
 * - Going from level n to n + 1 costs 50 + 25 * (n - 1) XP; everyone starts at level 1
 */

export const XP_PER_SESSION = 10;
const PLACEMENT_BONUS: Record<number, number> = { 1: 15, 2: 8, 3: 4 };

/** XP earned from one finished session, given the player's position (null/0 = not placed) */
export function xpForSession(position: number | null | undefined): number {
  return XP_PER_SESSION + (position ? PLACEMENT_BONUS[position] ?? 0 : 0);
}

/** XP needed to go from `level` to `level + 1` */
export function xpToNextLevel(level: number): number {
  return 50 + 25 * (level - 1);
}

export type PlayerLevel = {
  level: number;
  totalXp: number;
  /** XP earned since reaching the current level */
  xpIntoLevel: number;
  /** XP the current level costs in total */
  xpForNextLevel: number;
};

export function levelFromXp(totalXp: number): PlayerLevel {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, totalXp, xpIntoLevel: remaining, xpForNextLevel: xpToNextLevel(level) };
}

/** Level from a full list of finishing positions, one per finished session */
export function levelFromPositions(positions: (number | null | undefined)[]): PlayerLevel {
  return levelFromXp(positions.reduce<number>((sum, p) => sum + xpForSession(p), 0));
}
