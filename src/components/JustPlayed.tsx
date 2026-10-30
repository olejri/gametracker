import React from "react";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { PlayIcon, TrophyIcon, UserGroupIcon } from "@heroicons/react/20/solid";
import { classNames } from "npm/lib/utils";
import { BADGE_COLORS } from "npm/lib/constants";
import { GameSessionStatus } from "npm/components/Types";
import type { GameSessionWithPlayers, PlayerNicknameAndScore } from "npm/components/Types";

dayjs.extend(relativeTime);

type SessionResult =
  | { kind: "winners"; winners: PlayerNicknameAndScore[]; score: string }
  | { kind: "team"; teamName: string }
  | { kind: "everyone" }
  | { kind: "lost" }
  | { kind: "ongoing" }
  | { kind: "cancelled" }
  | { kind: "none" };

// Players without a position (0) go last
const byPosition = (players: PlayerNicknameAndScore[]) =>
  [...players].sort((a, b) => (a.position || Number.MAX_SAFE_INTEGER) - (b.position || Number.MAX_SAFE_INTEGER));

export const sessionResult = (session: GameSessionWithPlayers): SessionResult => {
  if (session.status === GameSessionStatus.Ongoing) return { kind: "ongoing" };
  if (session.status === GameSessionStatus.Cancelled) return { kind: "cancelled" };
  const placed = session.players.filter((p) => p.position > 0);
  if (placed.length === 0) return { kind: "none" };

  const winners = placed.filter((p) => p.position === 1);
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
  const score = winners.length === 1 ? winners[0]?.score.trim() ?? "" : "";
  return { kind: "winners", winners, score };
};

const PlayerImage = ({ player, size, className }: {
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

const WinnerChip = ({ session }: { session: GameSessionWithPlayers }) => {
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

const PlayerStack = ({ session }: { session: GameSessionWithPlayers }) => {
  const players = byPosition(session.players);
  const shown = players.slice(0, 5);
  const kind = sessionResult(session).kind;
  const hasWinner = kind === "winners" || kind === "team" || kind === "everyone";
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

const RecentlyActivities = (props: {
  groupName: string;
}) => {
  const groupId = props.groupName;
  const { data: lastFive, isLoading, isError, error } = api.session.getLastFiveCompletedSessions.useQuery({ groupId });

  if (isLoading) return (
    <div className="flex items-center justify-center py-6">
      <LoadingSpinner size={60} />
    </div>
  );
  if (isError) return <p className="p-4 text-gray-900 dark:text-white">{error?.message}</p>;
  if (lastFive.length === 0) return (
    <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No sessions yet. Start a new game to see it here.</p>
  );

  return (
    <ul role="list" className="grid grid-cols-1 lg:grid-cols-2">
      {lastFive.map((game, idx) => (
        <li
          key={game.sessionId}
          className={classNames(
            "border-gray-200 dark:border-gray-700",
            idx > 0 && "border-t",
            idx === 1 && "lg:border-t-0",
            idx % 2 === 0 && "lg:border-r",
            // A lone last item on desktop spans both columns
            idx === lastFive.length - 1 && idx % 2 === 0 && "lg:col-span-2 lg:border-r-0"
          )}
        >
          <Link
            href={`/${groupId}/session/${game.sessionId}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:px-5 dark:hover:bg-gray-700/50"
          >
            <Image
              className="h-12 w-12 flex-shrink-0 rounded-lg object-cover sm:h-14 sm:w-14"
              src={game.image_url}
              alt=""
              width={112}
              height={112}
              priority={idx < 2}
            />
            <div className="grid min-w-0 flex-1 gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                  {game.gameName}
                </p>
                <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {dayjs(game.createdAt).fromNow()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <WinnerChip session={game} />
                </div>
                <PlayerStack session={game} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};
export default RecentlyActivities;
