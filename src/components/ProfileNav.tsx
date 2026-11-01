import React from "react";
import Image from "next/image";
import { ChartPieIcon, Square3Stack3DIcon, UserIcon } from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import { classNames } from "npm/lib/utils";
import { ICON_COLORS } from "npm/lib/constants";

export type ProfileTab = "stats" | "collection" | "profile";

/** The three pages of the Profile hub, in the order they are shown */
export const PROFILE_TABS: {
  id: ProfileTab;
  label: string;
  icon: React.ElementType;
  iconForeground: string;
  iconBackground: string;
}[] = [
  { id: "stats", label: "My stats", icon: ChartPieIcon, iconForeground: ICON_COLORS.yellow.foreground, iconBackground: ICON_COLORS.yellow.background },
  { id: "collection", label: "My collection", icon: Square3Stack3DIcon, iconForeground: ICON_COLORS.red.foreground, iconBackground: ICON_COLORS.red.background },
  { id: "profile", label: "My profile", icon: UserIcon, iconForeground: ICON_COLORS.sky.foreground, iconBackground: ICON_COLORS.sky.background },
];

export const DEFAULT_PROFILE_TAB: ProfileTab = "stats";

export const profileHref = (gameGroup: string, userId: string, tab: ProfileTab = DEFAULT_PROFILE_TAB) =>
  `/${gameGroup}/player/${userId}` + (tab === DEFAULT_PROFILE_TAB ? "" : `?tab=${tab}`);

export const helpHref = (gameGroup: string) => `/${gameGroup}/tutorial`;

export const ProfileAvatar = (props: { name: string; imageUrl?: string; size: number; className?: string }) =>
  props.imageUrl ? (
    <Image
      src={props.imageUrl}
      alt=""
      width={props.size}
      height={props.size}
      className={classNames("flex-none rounded-full", props.className)}
      style={{ width: props.size, height: props.size }}
    />
  ) : (
    <span
      className={classNames("inline-flex flex-none items-center justify-center rounded-full bg-indigo-600 font-bold text-white", props.className)}
      style={{ width: props.size, height: props.size, fontSize: props.size * 0.4 }}
      aria-hidden="true"
    >
      {props.name.charAt(0).toUpperCase()}
    </span>
  );

/**
 * Player card for the menus: avatar, name and XP level in the active group.
 * Fetches profile stats only while `enabled` (the menu is open); shares the cache with My stats.
 */
export const ProfileMiniCard = (props: {
  groupName: string;
  fallbackName: string;
  imageUrl?: string;
  enabled: boolean;
}) => {
  const { data: stats } = api.stats.getProfileStats.useQuery(
    { groupName: props.groupName },
    { enabled: props.enabled && !!props.groupName, staleTime: 60_000 }
  );
  const name = stats?.playerName ?? props.fallbackName;
  const level = stats?.level;
  const progress = level && level.xpForNextLevel > 0 ? (level.xpIntoLevel / level.xpForNextLevel) * 100 : 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-700 to-indigo-900 p-3.5 text-white">
      <ProfileAvatar name={name} imageUrl={props.imageUrl} size={48} className="border-2 border-white/60" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-bold">{name}</span>
          {level && <span className="flex-none text-xs font-semibold">Lvl {level.level}</span>}
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25"
          role="progressbar"
          aria-label="XP to next level"
          aria-valuemin={0}
          aria-valuemax={level?.xpForNextLevel ?? 0}
          aria-valuenow={level?.xpIntoLevel ?? 0}
        >
          <div className="h-full rounded-full bg-yellow-300 transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 truncate text-xs text-white/85">
          {level ? `${level.xpIntoLevel} / ${level.xpForNextLevel} XP to Lvl ${level.level + 1}` : " "}
        </div>
      </div>
    </div>
  );
};
