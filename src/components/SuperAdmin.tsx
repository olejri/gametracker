import React from "react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { classNames, formatDate } from "npm/lib/utils";
import { useToast } from "npm/context/ToastContext";

type Tab = "players" | "groups" | "admins" | "news";

const AVATAR_COLORS = ["bg-indigo-600", "bg-pink-600", "bg-emerald-600", "bg-amber-600", "bg-violet-600", "bg-sky-600", "bg-rose-600", "bg-teal-600"];

const avatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? "bg-indigo-600";
};

const displayName = (p: { nickname: string | null; name: string }) => p.nickname || p.name;

const Initial = (props: { id: string; label: string; small?: boolean }) => (
  <span
    className={classNames(
      "inline-flex flex-none items-center justify-center rounded-full font-bold text-white",
      props.small ? "h-8 w-8 text-sm" : "h-10 w-10",
      avatarColor(props.id)
    )}
    aria-hidden="true"
  >
    {props.label.charAt(0).toUpperCase()}
  </span>
);

const cardClass = "rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800";
const primaryButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-transparent px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700";
const inputClass =
  "block h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500";
const chipClass = "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs";
const memberChip = classNames(chipClass, "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200");
const adminChip = classNames(chipClass, "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200");
const superChip = classNames(chipClass, "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200");

type MenuAction = {
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  divider?: boolean;
  heading?: string;
};

const ActionMenu = (props: { label: string; actions: MenuAction[]; footer?: string }) => {
  const item = (active: boolean, danger?: boolean) =>
    classNames(
      "flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm",
      danger ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white",
      active && "bg-gray-100 dark:bg-gray-700"
    );
  return (
    <Menu as="div" className="relative flex-none">
      <Menu.Button
        className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        aria-label={props.label}
      >
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-1 w-60 origin-top-right rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800">
          {props.actions.map((a, i) => (
            <React.Fragment key={`${a.label}-${i}`}>
              {a.divider && <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />}
              {a.heading && (
                <p className="px-3 pb-0.5 pt-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{a.heading}</p>
              )}
              <Menu.Item>
                {({ active }) => {
                  const Icon = a.icon;
                  const inner = (
                    <>
                      {Icon && <Icon className="h-5 w-5 flex-none" aria-hidden="true" />}
                      <span className="truncate">{a.label}</span>
                    </>
                  );
                  return a.href ? (
                    <Link href={a.href} className={item(active, a.danger)}>
                      {inner}
                    </Link>
                  ) : (
                    <button className={item(active, a.danger)} onClick={a.onClick}>
                      {inner}
                    </button>
                  );
                }}
              </Menu.Item>
            </React.Fragment>
          ))}
          {props.footer && <p className="px-3 pb-1 pt-1.5 font-mono text-[11px] text-gray-500 dark:text-gray-400">{props.footer}</p>}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const SearchBox = (props: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div className="relative">
    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
    <input
      type="search"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      aria-label={props.placeholder}
      className={classNames(inputClass, "h-11 pl-10")}
    />
  </div>
);

const Empty = (props: { children: React.ReactNode }) => (
  <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">{props.children}</p>
);

const matches = (q: string, ...values: (string | null | undefined)[]) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return values.some((v) => v?.toLowerCase().includes(needle));
};

const SuperAdminView = () => {
  const { showToast } = useToast();
  const [tab, setTab] = React.useState<Tab>("players");
  const [query, setQuery] = React.useState("");
  const [showCreateGroup, setShowCreateGroup] = React.useState(false);
  const [newGroupId, setNewGroupId] = React.useState("");
  const [newGroupName, setNewGroupName] = React.useState("");
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const [showAllMembers, setShowAllMembers] = React.useState(false);
  const [memberQuery, setMemberQuery] = React.useState("");
  const [addToGroupFor, setAddToGroupFor] = React.useState<string | null>(null);

  const { data: allPlayers, isLoading: playersLoading, refetch: refetchPlayers } = api.superadmin.getAllPlayers.useQuery();
  const { data: allGroups, isLoading: groupsLoading, refetch: refetchGroups } = api.superadmin.getAllGroups.useQuery();
  const { data: allAdmins, isLoading: adminsLoading, refetch: refetchAdmins } = api.superadmin.getAllAdmins.useQuery();
  const { data: announcements, isLoading: announcementsLoading } = api.announcement.getAllWithDismissals.useQuery();

  const refetchAll = () => {
    void refetchPlayers();
    void refetchGroups();
    void refetchAdmins();
  };
  const onError = (error: { message: string }) => showToast(error.message, "error");

  const toggleSuperAdmin = api.superadmin.toggleSuperAdmin.useMutation({ onSuccess: refetchAll, onError });
  const removePlayerFromGroup = api.superadmin.removePlayerFromGroup.useMutation({ onSuccess: refetchAll, onError });
  const changePlayerRole = api.superadmin.changePlayerRole.useMutation({ onSuccess: refetchAll, onError });
  const deleteGroup = api.superadmin.deleteGroup.useMutation({
    onSuccess: () => {
      setOpenGroup(null);
      refetchAll();
      showToast("Group deleted", "success");
    },
    onError,
  });
  const createGroup = api.superadmin.createGroup.useMutation({
    onSuccess: () => {
      refetchAll();
      setShowCreateGroup(false);
      setNewGroupId("");
      setNewGroupName("");
      showToast("Group created", "success");
    },
    onError,
  });
  const addPlayerToGroup = api.superadmin.addPlayerToGroup.useMutation({
    onSuccess: () => {
      refetchAll();
      setMemberQuery("");
      setAddToGroupFor(null);
    },
    onError,
  });

  const confirmThen = (message: string, action: () => void) => {
    if (confirm(message)) action();
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setQuery("");
  };

  if (playersLoading || groupsLoading || adminsLoading || announcementsLoading) {
    return <LoadingPage />;
  }

  const players = allPlayers ?? [];
  const groups = allGroups ?? [];
  const admins = allAdmins ?? [];
  const news = announcements ?? [];

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "players", label: "Players", count: players.length },
    { id: "groups", label: "Groups", count: groups.length },
    { id: "admins", label: "Admins", count: admins.length },
    { id: "news", label: "News", count: news.length },
  ];

  const filteredPlayers = players.filter((p) =>
    matches(query, p.name, p.nickname, p.email, ...p.PlayerGameGroupJunction.map((j) => j.GameGroup.name))
  );
  const filteredGroups = groups.filter((g) =>
    matches(query, g.name, g.id, ...g.PlayerGameGroupJunction.map((j) => displayName(j.Player)))
  );
  const filteredAdmins = admins.filter((a) => matches(query, a.Player.name, a.Player.nickname, a.Player.email, a.GameGroup.name));

  const createForm = (
    <div className={classNames(cardClass, "space-y-3 p-4 sm:p-5")}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">New group</h2>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Close"
          onClick={() => setShowCreateGroup(false)}
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Name
          <input
            className={classNames(inputClass, "mt-1")}
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Game Night"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ID (used in the link)
          <input
            className={classNames(inputClass, "mt-1 font-mono")}
            value={newGroupId}
            onChange={(e) => setNewGroupId(e.target.value)}
            placeholder="game-night"
          />
        </label>
      </div>
      <button
        className={primaryButton}
        disabled={!newGroupId || !newGroupName || createGroup.isLoading}
        onClick={() => createGroup.mutate({ groupId: newGroupId, groupName: newGroupName })}
      >
        {createGroup.isLoading ? <LoadingSpinner size={16} /> : <PlusIcon className="h-5 w-5" aria-hidden="true" />}
        Create group
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">SuperAdmin</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {players.length} players · {groups.length} groups · {admins.length} admins
          </p>
        </div>
        {!(showCreateGroup && tab === "groups") && (
          <button
            className={primaryButton}
            onClick={() => {
              setShowCreateGroup(true);
              switchTab("groups");
            }}
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            New group
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-0.5 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 sm:inline-grid sm:w-auto" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => switchTab(t.id)}
            className={classNames(
              "flex h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold sm:px-4",
              tab === t.id
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            )}
          >
            {t.label}
            <span className="hidden text-xs font-medium text-gray-500 dark:text-gray-400 sm:inline">{t.count}</span>
          </button>
        ))}
      </div>

      {tab !== "news" && (
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder={tab === "players" ? "Search name, email or group" : tab === "groups" ? "Search group or member" : "Search admin or group"}
        />
      )}

      {/* Players */}
      {tab === "players" && (
        <div className={cardClass}>
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)_7rem_2.75rem] gap-4 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400 lg:grid">
            <span>Player</span>
            <span>Email</span>
            <span>Groups</span>
            <span>Access</span>
            <span />
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPlayers.map((p) => {
              const name = displayName(p);
              const memberships = p.PlayerGameGroupJunction;
              const isGroupAdmin = memberships.some((j) => j.role === "ADMIN");
              const availableGroups = groups.filter((g) => !memberships.some((j) => j.groupId === g.id));
              const actions: MenuAction[] = [
                {
                  label: p.isSuperAdmin ? "Remove SuperAdmin" : "Make SuperAdmin",
                  icon: p.isSuperAdmin ? ShieldExclamationIcon : ShieldCheckIcon,
                  danger: p.isSuperAdmin,
                  onClick: () =>
                    confirmThen(`${p.isSuperAdmin ? "Remove" : "Grant"} SuperAdmin for ${name}?`, () =>
                      toggleSuperAdmin.mutate({ playerId: p.id })
                    ),
                },
              ];
              if (availableGroups.length > 0) {
                actions.push({ label: "Add to a group…", icon: UserPlusIcon, onClick: () => setAddToGroupFor(p.id) });
              }
              memberships.forEach((j, i) =>
                actions.push({
                  label: j.GameGroup.name,
                  icon: UserMinusIcon,
                  danger: true,
                  divider: i === 0,
                  heading: i === 0 ? "Remove from" : undefined,
                  onClick: () =>
                    confirmThen(`Remove ${name} from ${j.GameGroup.name}?`, () =>
                      removePlayerFromGroup.mutate({ playerId: p.id, groupId: j.groupId })
                    ),
                })
              );
              return (
                <li key={p.id} className="py-2.5 pl-3 pr-1.5 sm:pl-4 sm:pr-2">
                  <div className="flex items-center gap-3 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)_7rem_2.75rem] lg:gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center">
                      <Initial id={p.id} label={name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="truncate font-semibold text-gray-900 dark:text-white">{name}</span>
                          {p.isSuperAdmin && <span className={classNames(superChip, "lg:hidden")}>SuperAdmin</span>}
                        </div>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400 lg:hidden">{p.email || "No email"}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1 lg:hidden">
                          {memberships.map((j) => (
                            <span key={j.id} className={j.role === "ADMIN" ? adminChip : memberChip}>
                              {j.GameGroup.name}
                              {j.role === "ADMIN" && " · admin"}
                            </span>
                          ))}
                          {memberships.length === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">No groups</span>}
                        </div>
                      </div>
                    </div>
                    <span className="hidden truncate text-sm text-gray-500 dark:text-gray-400 lg:block">{p.email || "No email"}</span>
                    <div className="hidden flex-wrap gap-1 lg:flex">
                      {memberships.map((j) => (
                        <span key={j.id} className={j.role === "ADMIN" ? adminChip : memberChip}>
                          {j.GameGroup.name}
                        </span>
                      ))}
                      {memberships.length === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">No groups</span>}
                    </div>
                    <span className="hidden lg:block">
                      {p.isSuperAdmin ? (
                        <span className={superChip}>SuperAdmin</span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">{isGroupAdmin ? "Group admin" : "Player"}</span>
                      )}
                    </span>
                    <ActionMenu label={`Actions for ${name}`} actions={actions} footer={`Player ID ${p.id.substring(0, 8)}`} />
                  </div>
                  {addToGroupFor === p.id && (
                    <div className="mt-2.5 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50 sm:ml-[3.25rem]">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Add {name} to</p>
                        <button
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          aria-label="Close"
                          onClick={() => setAddToGroupFor(null)}
                        >
                          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                      <ul className="space-y-1">
                        {availableGroups.map((g) => (
                          <li key={g.id} className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-white">{g.name}</span>
                            <button
                              className={classNames(secondaryButton, "h-9")}
                              disabled={addPlayerToGroup.isLoading}
                              onClick={() => addPlayerToGroup.mutate({ playerId: p.id, groupId: g.id, role: "MEMBER" })}
                            >
                              Member
                            </button>
                            <button
                              className={classNames(secondaryButton, "h-9")}
                              disabled={addPlayerToGroup.isLoading}
                              onClick={() => addPlayerToGroup.mutate({ playerId: p.id, groupId: g.id, role: "ADMIN" })}
                            >
                              Admin
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {filteredPlayers.length === 0 && <Empty>No players match “{query}”.</Empty>}
        </div>
      )}

      {/* Groups */}
      {tab === "groups" && (
        <div className="space-y-4">
          {showCreateGroup && createForm}
          <div className={cardClass}>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGroups.map((g, gi) => {
                const isOpen = openGroup === g.id;
                const isLast = gi === filteredGroups.length - 1;
                const members = g.PlayerGameGroupJunction;
                const groupAdmins = members.filter((m) => m.role === "ADMIN").map((m) => displayName(m.Player));
                const sorted = [...members].sort((a, b) =>
                  a.role === b.role ? displayName(a.Player).localeCompare(displayName(b.Player)) : a.role === "ADMIN" ? -1 : 1
                );
                const visible = showAllMembers ? sorted : sorted.slice(0, 8);
                const candidates = memberQuery.trim()
                  ? players
                      .filter((p) => !members.some((m) => m.playerId === p.id))
                      .filter((p) => matches(memberQuery, p.name, p.nickname, p.email))
                      .slice(0, 6)
                  : [];
                return (
                  <li key={g.id}>
                    <div className="flex items-center gap-2 py-2.5 pl-4 pr-1.5 sm:pr-2">
                      <button
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        aria-expanded={isOpen}
                        onClick={() => {
                          setOpenGroup(isOpen ? null : g.id);
                          setShowAllMembers(false);
                          setMemberQuery("");
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="truncate font-semibold text-gray-900 dark:text-white">{g.name}</span>
                            <span className="truncate font-mono text-xs text-gray-500 dark:text-gray-400">/{g.id}</span>
                          </div>
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {members.length} {members.length === 1 ? "member" : "members"}
                            {groupAdmins.length > 0 ? ` · admin ${groupAdmins.join(", ")}` : " · no admin"}
                          </p>
                        </div>
                        <ChevronDownIcon
                          className={classNames("h-5 w-5 flex-none text-gray-400 transition-transform", isOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </button>
                      <ActionMenu
                        label={`Actions for ${g.name}`}
                        actions={[
                          { label: "Open dashboard", icon: ArrowTopRightOnSquareIcon, href: `/${g.id}/dashboard` },
                          {
                            label: "Delete group",
                            icon: TrashIcon,
                            danger: true,
                            divider: true,
                            onClick: () => {
                              const typed = prompt(`This deletes "${g.name}" and removes all ${members.length} members.\nType the group name to confirm:`);
                              if (typed === null) return;
                              if (typed.trim() === g.name) deleteGroup.mutate({ groupId: g.id });
                              else showToast("Name didn't match, nothing was deleted", "info");
                            },
                          },
                        ]}
                      />
                    </div>
                    {isOpen && (
                      <div
                        className={classNames(
                          "space-y-3 border-t border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900/40 sm:px-4",
                          isLast && "rounded-b-2xl"
                        )}
                      >
                        <div>
                          <div className="relative">
                            <UserPlusIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input
                              value={memberQuery}
                              onChange={(e) => setMemberQuery(e.target.value)}
                              placeholder={`Add a player to ${g.name}…`}
                              aria-label={`Add a player to ${g.name}`}
                              className={classNames(inputClass, "pl-10")}
                            />
                          </div>
                          {memberQuery.trim() && (
                            <ul className="mt-1.5 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                              {candidates.map((p) => (
                                <li key={p.id} className="flex items-center gap-2 py-1.5 pl-3 pr-1.5">
                                  <Initial id={p.id} label={displayName(p)} small />
                                  <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-white">{displayName(p)}</span>
                                  <button
                                    className={classNames(secondaryButton, "h-9")}
                                    disabled={addPlayerToGroup.isLoading}
                                    onClick={() => addPlayerToGroup.mutate({ playerId: p.id, groupId: g.id, role: "MEMBER" })}
                                  >
                                    Member
                                  </button>
                                  <button
                                    className={classNames(secondaryButton, "h-9")}
                                    disabled={addPlayerToGroup.isLoading}
                                    onClick={() => addPlayerToGroup.mutate({ playerId: p.id, groupId: g.id, role: "ADMIN" })}
                                  >
                                    Admin
                                  </button>
                                </li>
                              ))}
                              {candidates.length === 0 && <li className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">No players to add</li>}
                            </ul>
                          )}
                        </div>
                        <ul className="grid gap-x-4 lg:grid-cols-2">
                          {visible.map((m) => {
                            const name = displayName(m.Player);
                            const isAdmin = m.role === "ADMIN";
                            return (
                              <li key={m.id} className="flex items-center gap-2.5 py-1">
                                <Initial id={m.playerId} label={name} small />
                                <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-white">{name}</span>
                                <span className={isAdmin ? adminChip : memberChip}>{isAdmin ? "Admin" : "Member"}</span>
                                <ActionMenu
                                  label={`Actions for ${name} in ${g.name}`}
                                  actions={[
                                    {
                                      label: isAdmin ? "Make member" : "Make admin",
                                      icon: ShieldCheckIcon,
                                      onClick: () =>
                                        changePlayerRole.mutate({ playerId: m.playerId, groupId: g.id, newRole: isAdmin ? "MEMBER" : "ADMIN" }),
                                    },
                                    {
                                      label: `Remove from ${g.name}`,
                                      icon: UserMinusIcon,
                                      danger: true,
                                      divider: true,
                                      onClick: () =>
                                        confirmThen(`Remove ${name} from ${g.name}?`, () =>
                                          removePlayerFromGroup.mutate({ playerId: m.playerId, groupId: g.id })
                                        ),
                                    },
                                  ]}
                                />
                              </li>
                            );
                          })}
                        </ul>
                        {sorted.length > visible.length && (
                          <button
                            className="h-10 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                            onClick={() => setShowAllMembers(true)}
                          >
                            Show all {sorted.length} members
                          </button>
                        )}
                        {members.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No members yet.</p>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {filteredGroups.length === 0 && <Empty>No groups match “{query}”.</Empty>}
          </div>
        </div>
      )}

      {/* Admins */}
      {tab === "admins" && (
        <div className={cardClass}>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAdmins.map((a) => {
              const name = displayName(a.Player);
              return (
                <li key={a.id} className="flex items-center gap-3 py-2.5 pl-3 pr-1.5 sm:pl-4 sm:pr-2">
                  <Initial id={a.playerId} label={name} />
                  <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)] sm:items-center sm:gap-4">
                    <span className="block truncate font-semibold text-gray-900 dark:text-white">{name}</span>
                    <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                      <span className="sm:hidden">admin of </span>
                      <span className="font-medium text-gray-900 dark:text-white">{a.GameGroup.name}</span>
                    </span>
                    <span className="hidden truncate text-sm text-gray-500 dark:text-gray-400 sm:block">{a.Player.email}</span>
                  </div>
                  <ActionMenu
                    label={`Actions for ${name}`}
                    actions={[
                      { label: "Open dashboard", icon: ArrowTopRightOnSquareIcon, href: `/${a.groupId}/dashboard` },
                      {
                        label: "Demote to member",
                        icon: UserMinusIcon,
                        danger: true,
                        divider: true,
                        onClick: () =>
                          confirmThen(`Demote ${name} to member in ${a.GameGroup.name}?`, () =>
                            changePlayerRole.mutate({ playerId: a.playerId, groupId: a.groupId, newRole: "MEMBER" })
                          ),
                      },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
          {filteredAdmins.length === 0 && <Empty>No admins match “{query}”.</Empty>}
        </div>
      )}

      {/* News */}
      {tab === "news" && (
        <div className="space-y-4">
          {news.map((n) => {
            const seen = n.AnnouncementDismissal.length;
            const pct = players.length ? Math.round((seen / players.length) * 100) : 0;
            return (
              <div key={n.id} className={cardClass}>
                <div className="space-y-2 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900 dark:text-white">{n.title}</h2>
                    <span className={n.active ? superChip : memberChip}>{n.active ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-mono text-xs">{n.id}</span> · {formatDate(n.createdAt)}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="flex-none text-sm text-gray-500 dark:text-gray-400">
                      Seen by {seen} of {players.length}
                    </span>
                  </div>
                </div>
                <ul className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                  {n.AnnouncementDismissal.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-4 py-2 sm:px-5">
                      <Initial id={d.Player.id} label={displayName(d.Player)} small />
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-white">{displayName(d.Player)}</span>
                      <span className="flex-none text-sm text-gray-500 dark:text-gray-400">{formatDate(d.dismissedAt)}</span>
                    </li>
                  ))}
                  {seen === 0 && <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 sm:px-5">Nobody has seen this yet</li>}
                </ul>
              </div>
            );
          })}
          {news.length === 0 && (
            <div className={cardClass}>
              <Empty>No announcements.</Empty>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminView;
