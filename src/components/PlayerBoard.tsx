import React, { useEffect } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { useUser } from "@clerk/nextjs";
import { api } from "npm/utils/api";
import MyProfile from "npm/components/MyProfile";
import MyCollection from "npm/components/MyCollection";
import MyStats from "npm/components/MyStats";
import { classNames } from "npm/lib/utils";
import { BADGE_COLORS } from "npm/lib/constants";
import {
  DEFAULT_PROFILE_TAB,
  PROFILE_TABS,
  ProfileAvatar,
  type ProfileTab,
  helpHref,
} from "npm/components/ProfileNav";

const isProfileTab = (tab: unknown): tab is ProfileTab => PROFILE_TABS.some((t) => t.id === tab);

/** Profile hub: shared header with the player, plus My stats / My collection / My profile tabs */
const PlayerBoard = (props: { groupName: string; playerId: string }) => {
  const router = useRouter();
  const { user } = useUser();
  const groupName = props.groupName;
  const queryTab = router.query.tab;

  // Old links: ?tab=me is now My profile, and FAQ moved to Help & FAQ
  useEffect(() => {
    if (queryTab === "faq") void router.replace(helpHref(groupName) + "?tab=faq");
    if (queryTab === "me") void router.replace({ pathname: router.pathname, query: { ...router.query, tab: "profile" } }, undefined, { shallow: true });
  }, [queryTab, groupName, router]);

  const currentTab: ProfileTab = isProfileTab(queryTab) ? queryTab : queryTab === "me" ? "profile" : DEFAULT_PROFILE_TAB;

  const { data: stats } = api.stats.getProfileStats.useQuery({ groupName }, { enabled: !!groupName, staleTime: 60_000 });
  const name = stats?.playerName ?? user?.username ?? user?.firstName ?? "";

  const selectTab = (tab: ProfileTab) => {
    const query: Record<string, string | string[] | undefined> = { ...router.query };
    if (tab === DEFAULT_PROFILE_TAB) delete query.tab;
    else query.tab = tab;
    void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center gap-3 px-2 sm:px-0">
        <ProfileAvatar name={name || "?"} imageUrl={user?.imageUrl} size={52} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">{name || " "}</h1>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            {stats ? stats.groupName : " "}
            {stats?.since && ` · since ${dayjs(stats.since).format("MMM YYYY")}`}
          </p>
        </div>
        {stats && (
          <span className={classNames("flex-none rounded-full px-2.5 py-1 text-xs font-bold", BADGE_COLORS.yellow)}>
            Lvl {stats.level.level}
          </span>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Profile sections"
        className="mx-2 mt-4 grid grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-white p-1 sm:mx-0 sm:inline-grid sm:min-w-[28rem] dark:border-gray-700 dark:bg-gray-800"
      >
        {PROFILE_TABS.map((tab) => {
          const selected = tab.id === currentTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectTab(tab.id)}
              className={classNames(
                selected
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                "flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              )}
            >
              <tab.icon className="hidden h-5 w-5 sm:block" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-4 sm:mt-6">
        {currentTab === "stats" && <MyStats groupName={groupName} hideIdentity />}
        {currentTab === "collection" && <MyCollection />}
        {currentTab === "profile" && <MyProfile />}
      </div>
    </div>
  );
};
export default PlayerBoard;
