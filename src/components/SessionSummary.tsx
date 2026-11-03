import React from "react";
import Image from "next/image";
import { PlayIcon, TrophyIcon, UserGroupIcon } from "@heroicons/react/20/solid";
import { classNames } from "npm/lib/utils";
import { BADGE_COLORS } from "npm/lib/constants";
import { GameSessionStatus } from "npm/components/Types";
import type { GameSessionWithPlayers, PlayerNicknameAndScore } from "npm/components/Types";

type SessionResult =
  | { kind: "winners"; winners: PlayerNicknameAndScore[]; score: string }
  | { kind: "duel"; winner: PlayerNicknameAndScore; loser: PlayerNicknameAndScore; score: string }
  | { kind: "draw"; score: string }
  | { kind: "team"; teamName: string }
  | { kind: "everyone" }
  | { kind: "lost" }
  | { kind: "ongoing" }
  | { kind: "cancelled" }
  | { kind: "none" };

// Players without a position (0) go last
const byPosition = (players: PlayerNicknameAndScore[]) =>
  [...players].sort((a, b) => (a.position || Number.MAX_SAFE_INTEGER) - (b.position || Number.MAX_SAFE_INTEGER));

// "12–9" when both players have a score, else ""
const scoreLine = (x: PlayerNicknameAndScore, y: PlayerNicknameAndScore) =>
  x.score.trim() && y.score.trim() ? `${x.score.trim()}–${y.score.trim()}` : "";

export const sessionResult = (session: GameSessionWithPlayers): SessionResult => {
  if (session.status === GameSessionStatus.Ongoing) return { kind: "ongoing" };
  if (session.status === GameSessionStatus.Cancelled) return { kind: "cancelled" };
  const placed = session.players.filter((p) => p.position > 0);
  if (placed.length === 0) return { kind: "none" };

  const winners = placed.filter((p) => p.position === 1);
  // Two placed players and no teams: a head-to-head game
  const [a, b] = placed;
  const duel = !session.isTeamGame && session.players.length === 2 && a && b ? [a, b] as const : null;
  // Sharing a place with scores recorded is a draw; without scores it reads as co-op below
  if (duel && duel[0].position === duel[1].position) {
    const score = scoreLine(duel[0], duel[1]);
    if (score) return { kind: "draw", score };
  }
  // Everyone shares the same place: a co-op game
  if (session.players.length > 1 && placed.length === session.players.length
    && placed.every((p) => p.position === placed[0]?.position)) {
    return winners.length > 0 ? { kind: "everyone" } : { kind: "lost" };
  }
  if (winners.length === 0) return { kind: "none" };

  if (session.isTeamGame) {
    const team = session.teams.find((t) => winners.some((w) => t.playerIds.includes(w.playerId)));
    if (team) return { kind: "team", teamName: team.name };
  }
  if (duel && winners.length === 1) {
    const [winner, loser] = duel[0].position === 1 ? duel : [duel[1], duel[0]];
    return { kind: "duel", winner, loser, score: scoreLine(winner, loser) };
  }
  const score = winners.length === 1 ? winners[0]?.score.trim() ?? "" : "";
  return { kind: "winners", winners, score };
};

export const PlayerImage = ({ player, size, className }: {
  player: PlayerNicknameAndScore;
  size: number;
  className?: string;
}) => {
  const base = "inline-block flex-shrink-0 rounded-full";
  if (!player.profileImageUrl) {
    return (
      <span
        className={classNames(base, "inline-flex items-center justify-center bg-gray-400 text-xs font-semibold text-white dark:bg-gray-600", className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {player.nickname.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={player.profileImageUrl}
      alt={player.nickname}
      width={size}
      height={size}
      className={classNames(base, className)}
    />
  );
};

const chip = "inline-flex max-w-full items-center gap-1.5 rounded-full py-0.5 text-sm font-medium";

export const WinnerChip = ({ session }: { session: GameSessionWithPlayers }) => {
  const result = sessionResult(session);
  switch (result.kind) {
    case "winners": {
      const names = result.winners.map((w) => w.nickname).join(" & ");
      return (
        <span className={classNames(chip, BADGE_COLORS.yellow, "pl-0.5 pr-2.5")}>
          <span className="flex -space-x-1">
            {result.winners.slice(0, 3).map((w) => (
              <PlayerImage key={w.playerId} player={w} size={22} />
            ))}
          </span>
          <span className="truncate">
            {names} won{result.score && <span className="font-normal"> · {result.score} pts</span>}
          </span>
        </span>
      );
    }
    case "duel":
      return (
        <span className={classNames(chip, BADGE_COLORS.yellow, "pl-0.5 pr-2.5")}>
          <PlayerImage player={result.winner} size={22} />
          <span className="truncate">
            {result.winner.nickname} beat {result.loser.nickname}
            {result.score && <span className="font-normal"> · {result.score}</span>}
          </span>
        </span>
      );
    case "draw":
      return (
        <span className={classNames(chip, BADGE_COLORS.gray, "px-2.5")}>
          <span className="truncate">Draw<span className="font-normal"> · {result.score}</span></span>
        </span>
      );
    case "team":
      return (
        <span className={classNames(chip, BADGE_COLORS.blue, "px-2.5")}>
          <UserGroupIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{result.teamName} won</span>
        </span>
      );
    case "everyone":
      return (
        <span className={classNames(chip, BADGE_COLORS.yellow, "px-2.5")}>
          <TrophyIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Everyone won</span>
        </span>
      );
    case "lost":
      return <span className={classNames(chip, BADGE_COLORS.gray, "px-2.5")}>Group lost</span>;
    case "ongoing":
      return (
        <span className={classNames(chip, BADGE_COLORS.green, "px-2.5")}>
          <PlayIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Playing now</span>
        </span>
      );
    case "cancelled":
      return <span className="text-sm text-gray-500 dark:text-gray-400">Cancelled</span>;
    default:
      return (
        <span className="text-sm text-gray-500 dark:text-gray-400">No result recorded</span>
      );
  }
};

export const PlayerStack = ({ session }: { session: GameSessionWithPlayers }) => {
  const players = byPosition(session.players);
  const shown = players.slice(0, 5);
  const kind = sessionResult(session).kind;
  const hasWinner = kind === "winners" || kind === "duel" || kind === "team" || kind === "everyone";
  return (
    <span className="flex flex-shrink-0 items-center -space-x-1.5">
      {shown.map((p) => (
        <PlayerImage
          key={p.playerId}
          player={p}
          size={24}
          className={classNames(
            "ring-2",
            hasWinner && p.position === 1
              ? "ring-yellow-500 dark:ring-yellow-400"
              : "ring-white dark:ring-gray-800"
          )}
        />
      ))}
      {players.length > shown.length && (
        <span className="z-10 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gray-100 px-1 text-xs font-medium text-gray-700 ring-2 ring-white dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-800">
          +{players.length - shown.length}
        </span>
      )}
    </span>
  );
};
