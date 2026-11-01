import React from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  LinkIcon,
  NoSymbolIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { classNames } from "npm/lib/utils";

type AdminMember = {
  id: string;
  nickname: string | null;
  name: string;
  clerkId: string | null;
  role: string;
  inviteStatus: string;
};

const AVATAR_COLORS = ["bg-indigo-600", "bg-pink-600", "bg-emerald-600", "bg-amber-600", "bg-violet-600", "bg-sky-600", "bg-rose-600", "bg-teal-600"];

const avatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? "bg-indigo-600";
};

const displayName = (m: { nickname: string | null; name: string }) => m.nickname || m.name;

const Initial = (props: { id: string; label: string; muted?: boolean }) => (
  <span
    className={classNames(
      "inline-flex h-10 w-10 flex-none items-center justify-center rounded-full font-bold",
      props.muted ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" : classNames(avatarColor(props.id), "text-white")
    )}
    aria-hidden="true"
  >
    {props.label.charAt(0).toUpperCase()}
  </span>
);

const SectionTitle = (props: { children: React.ReactNode; count?: number; highlight?: boolean }) => (
  <h2 className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
    {props.children}
    {props.count !== undefined && (
      <span
        className={classNames(
          "rounded-full px-2 py-0.5 text-xs normal-case tracking-normal",
          props.highlight
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        )}
      >
        {props.count}
      </span>
    )}
  </h2>
);

const cardClass = "rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800";
const primaryButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-transparent px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700";
const inputClass =
  "block h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500";

const daysLeft = (date: Date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));

const AdminView = (props: { gameGroup: string }) => {
  const { gameGroup } = props;
  const ctx = api.useContext();

  const { data: pendingPlayers, isLoading, isError, error } = api.user.getPendingPlayers.useQuery({ gameGroup });
  const {
    data: emailInvites,
    isLoading: emailIsLoading,
    isError: emailIsError,
    error: emailError,
  } = api.user.getPendingEmailInvites.useQuery({ gameGroup });
  const { data: currentPlayer, isLoading: currentPlayerIsLoading } = api.player.getLogInPlayer.useQuery();
  const {
    data: playersInGroup,
    isLoading: allPlayersIsloading,
    isError: allPlayersIsError,
    error: allPlayersError,
  } = api.group.getAllPlayersInGroup.useQuery({ gameGroup });
  const { data: allGameGroups, isLoading: allGameGroupsIsLoading } = api.group.getAllGameGroups.useQuery();

  const invalidateAdminQueries = async () => {
    await Promise.all([
      ctx.user.getPendingPlayers.invalidate({ gameGroup }),
      ctx.user.getPendingEmailInvites.invalidate({ gameGroup }),
      ctx.group.getAllPlayersInGroup.invalidate({ gameGroup }),
      ctx.group.getAllGameGroups.invalidate(),
    ]);
  };
  const logError = (e: unknown) => console.log(e);

  const [email, setEmail] = React.useState("");
  const [emailSent, setEmailSent] = React.useState(false);
  const [showAddPlayer, setShowAddPlayer] = React.useState(false);
  const [showInactive, setShowInactive] = React.useState(false);
  const [fakeName, setFakeName] = React.useState("");
  const [fakeNickname, setFakeNickname] = React.useState("");
  const [fakeEmail, setFakeEmail] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const sendInvite = api.user.sendInvite.useMutation({
    onSuccess: async () => {
      setEmail("");
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
      await invalidateAdminQueries();
    },
    onError: logError,
  });
  const acceptPlayer = api.user.acceptInvite.useMutation({ onSuccess: invalidateAdminQueries });
  const declineInvite = api.user.declineInvite.useMutation({ onSuccess: invalidateAdminQueries, onError: logError });
  const promoteToAdmin = api.user.promoteToAdmin.useMutation({ onSuccess: invalidateAdminQueries, onError: logError });
  const removeUser = api.user.removeUserFromGroup.useMutation({ onSuccess: invalidateAdminQueries, onError: logError });
  const setInactive = api.user.setPlayerInactive.useMutation({ onSuccess: invalidateAdminQueries, onError: logError });
  const setActive = api.user.setPlayerActive.useMutation({ onSuccess: invalidateAdminQueries, onError: logError });
  const toggleHidden = api.group.toggleGroupHidden.useMutation({ onSuccess: invalidateAdminQueries, onError: logError });
  const createFakePlayer = api.player.createFakePlayer.useMutation({
    onSuccess: async () => {
      setFakeName("");
      setFakeNickname("");
      setFakeEmail("");
      setShowAddPlayer(false);
      await invalidateAdminQueries();
    },
    onError: logError,
  });

  const { data: inviteTokenData, refetch: refetchToken } = api.group.getGroupInviteToken.useQuery({ groupId: gameGroup });
  const generateToken = api.group.generateInviteToken.useMutation({
    onSuccess: async () => {
      await refetchToken();
    },
  });

  const getInviteUrl = (token: string) => (typeof window === "undefined" ? "" : `${window.location.origin}/join?token=${token}`);
  const handleCopy = (token: string) => {
    const url = getInviteUrl(token);
    void navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      // Clipboard can be blocked (permissions, insecure context): let the user copy it by hand
      .catch(() => window.prompt("Copy this invite link", url));
  };

  const { members, inactive, requests, invitedEmails } = React.useMemo(() => {
    const toMember = (j: { role: string; inviteStatus: string; Player: { id: string; nickname: string | null; name: string; clerkId: string | null } }): AdminMember => ({
      id: j.Player.id,
      nickname: j.Player.nickname,
      name: j.Player.name,
      clerkId: j.Player.clerkId,
      role: j.role,
      inviteStatus: j.inviteStatus,
    });
    const all = playersInGroup ?? [];
    const members = all
      .filter((j) => j.inviteStatus === "ACCEPTED")
      .map(toMember)
      .sort((a, b) => (a.role === "ADMIN" ? 0 : 1) - (b.role === "ADMIN" ? 0 : 1) || displayName(a).localeCompare(displayName(b)));
    const inactive = all.filter((j) => j.inviteStatus === "INACTIVE" || j.inviteStatus === "REMOVED").map(toMember);
    const requests = (pendingPlayers ?? []).map(toMember);
    const knownEmails = new Set(all.map((j) => j.Player.email).concat((pendingPlayers ?? []).map((j) => j.Player.email)));
    const invitedEmails = (emailInvites?.data ?? []).filter((i) => !knownEmails.has(i.email_address));
    return { members, inactive, requests, invitedEmails };
  }, [playersInGroup, pendingPlayers, emailInvites]);

  if (isLoading || emailIsLoading || allPlayersIsloading || currentPlayerIsLoading || allGameGroupsIsLoading) {
    return <LoadingPage />;
  }

  if (isError || emailIsError || allPlayersIsError) {
    return (
      <p className="text-gray-900 dark:text-white">
        {error?.message}
        {emailError?.message}
        {allPlayersError?.message}
      </p>
    );
  }

  const group = allGameGroups?.find((g) => g.id === gameGroup);
  const hidden = group?.hidden ?? false;
  const tokenExpires = inviteTokenData?.expiresAt ? new Date(inviteTokenData.expiresAt) : null;
  const activeToken = inviteTokenData?.token && tokenExpires && tokenExpires > new Date() ? inviteTokenData.token : null;
  const requestCount = requests.length + invitedEmails.length;

  const confirmThen = (message: string, action: () => void) => {
    if (confirm(message)) action();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-2 px-1">
        <div>
          {group?.name && <p className="text-sm text-gray-500 dark:text-gray-400">{group.name}</p>}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin</h1>
        </div>
        <p className="hidden text-sm text-gray-500 sm:block dark:text-gray-400">
          {members.length} {members.length === 1 ? "member" : "members"}
          {inactive.length > 0 && ` · ${inactive.length} inactive`}
          {hidden ? " · hidden from new players" : " · visible to new players"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-5">
          {/* Requests */}
          {requestCount > 0 && (
            <section className="space-y-2" aria-label="Requests">
              <SectionTitle count={requestCount} highlight>
                Needs your OK
              </SectionTitle>
              <ul className={classNames(cardClass, "divide-y divide-gray-200 overflow-hidden dark:divide-gray-700")}>
                {requests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 p-3 sm:px-4">
                    <Initial id={r.id} label={displayName(r)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">{displayName(r)}</p>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                        Wants to join{r.nickname && r.nickname !== r.name ? ` · ${r.name}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={secondaryButton}
                        disabled={declineInvite.isLoading}
                        onClick={() => declineInvite.mutate({ playerId: r.id, groupId: gameGroup })}
                      >
                        Decline
                      </button>
                      <button
                        className={primaryButton}
                        disabled={acceptPlayer.isLoading}
                        onClick={() => acceptPlayer.mutate({ playerId: r.id, groupId: gameGroup })}
                      >
                        Accept
                      </button>
                    </div>
                  </li>
                ))}
                {invitedEmails.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 p-3 sm:px-4">
                    <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">{i.email_address}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email invite sent · waiting for them to sign up</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Members */}
          <section className="space-y-2" aria-label="Members">
            <SectionTitle count={members.length}>Members</SectionTitle>
            <div className={cardClass}>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((m) => {
                  const isYou = currentPlayer?.id === m.id;
                  const isAdmin = m.role === "ADMIN";
                  const name = displayName(m);
                  return (
                    <li key={m.id} className="flex items-center gap-3 py-2.5 pl-3 pr-1.5 sm:pl-4 sm:pr-2">
                      <Initial id={m.id} label={name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="truncate font-semibold text-gray-900 dark:text-white">{name}</span>
                          {isAdmin && (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200">
                              Admin
                            </span>
                          )}
                          {!m.clerkId && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              No account
                            </span>
                          )}
                          {isYou && <span className="text-xs text-gray-500 dark:text-gray-400">(you)</span>}
                        </div>
                        {m.nickname && m.nickname !== m.name && (
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{m.name}</p>
                        )}
                      </div>
                      {!isAdmin && (
                        <button
                          className={classNames(secondaryButton, "hidden h-9 sm:inline-flex")}
                          disabled={promoteToAdmin.isLoading}
                          onClick={() =>
                            confirmThen(`Make ${name} an admin of this group?`, () =>
                              promoteToAdmin.mutate({ playerId: m.id, groupId: gameGroup })
                            )
                          }
                        >
                          Make admin
                        </button>
                      )}
                      {isYou ? (
                        <span className="h-11 w-11 flex-none" aria-hidden="true" />
                      ) : (
                        <MemberMenu
                          name={name}
                          playerId={m.id}
                          canPromote={!isAdmin}
                          onPromote={() =>
                            confirmThen(`Make ${name} an admin of this group?`, () =>
                              promoteToAdmin.mutate({ playerId: m.id, groupId: gameGroup })
                            )
                          }
                          onInactive={() =>
                            confirmThen(`Mark ${name} as inactive? They won't appear in the start game list.`, () =>
                              setInactive.mutate({ playerId: m.id, groupId: gameGroup })
                            )
                          }
                          onRemove={() =>
                            confirmThen(`Remove ${name} from the group?`, () =>
                              removeUser.mutate({ playerId: m.id, groupId: gameGroup })
                            )
                          }
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
              {inactive.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="flex min-h-[44px] w-full items-center gap-2 px-3 text-left text-sm text-gray-500 hover:text-gray-900 sm:px-4 dark:text-gray-400 dark:hover:text-white"
                    aria-expanded={showInactive}
                    onClick={() => setShowInactive((v) => !v)}
                  >
                    <ChevronRightIcon className={classNames("h-4 w-4 transition-transform", showInactive && "rotate-90")} aria-hidden="true" />
                    Inactive players · {inactive.length}
                  </button>
                  {showInactive && (
                    <ul className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                      {inactive.map((m) => {
                        const name = displayName(m);
                        return (
                          <li key={m.id} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                            <Initial id={m.id} label={name} muted />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-gray-700 dark:text-gray-300">{name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {m.inviteStatus === "REMOVED" ? "Removed" : "Inactive"}
                              </p>
                            </div>
                            <button
                              className={classNames(secondaryButton, "h-9")}
                              disabled={setActive.isLoading}
                              onClick={() =>
                                confirmThen(`Make ${name} an active member again?`, () =>
                                  setActive.mutate({ playerId: m.id, groupId: gameGroup })
                                )
                              }
                            >
                              Reactivate
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {/* Invite */}
          <section className="space-y-2" aria-label="Invite people">
            <SectionTitle>Invite people</SectionTitle>
            <div className={classNames(cardClass, "space-y-3 p-4")}>
              {activeToken ? (
                <>
                  <div className="flex h-11 items-center gap-2 rounded-lg bg-gray-100 pl-3 pr-1 dark:bg-gray-900">
                    <LinkIcon className="h-5 w-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-gray-300">
                      {getInviteUrl(activeToken).replace(/^https?:\/\//, "")}
                    </span>
                    <button
                      className="inline-flex h-9 flex-none items-center gap-1 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500"
                      onClick={() => handleCopy(activeToken)}
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        "Copy link"
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Anyone with the link joins as soon as they sign in. Expires in{" "}
                    {tokenExpires && daysLeft(tokenExpires) === 1 ? "1 day" : `${tokenExpires ? daysLeft(tokenExpires) : 0} days`} ·{" "}
                    <button
                      className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 dark:text-indigo-400"
                      disabled={generateToken.isLoading}
                      onClick={() =>
                        confirmThen("Make a new link? The current link stops working.", () =>
                          generateToken.mutate({ groupId: gameGroup })
                        )
                      }
                    >
                      New link
                    </button>
                  </p>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="min-w-0 flex-1 text-sm text-gray-500 dark:text-gray-400">
                    {tokenExpires ? "Your invite link has expired." : "Share a link and people join as soon as they sign in."}
                  </p>
                  {generateToken.isLoading ? (
                    <LoadingSpinner size={30} />
                  ) : (
                    <button className={primaryButton} onClick={() => generateToken.mutate({ groupId: gameGroup })}>
                      <LinkIcon className="h-4 w-4" aria-hidden="true" />
                      Create invite link
                    </button>
                  )}
                </div>
              )}
              {generateToken.isError && <p className="text-sm text-red-600 dark:text-red-400">{generateToken.error?.message}</p>}

              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <label htmlFor="invite-email" className="mb-1.5 block text-sm font-semibold text-gray-900 dark:text-white">
                  Or invite by email
                </label>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) sendInvite.mutate({ emailAddress: email.trim(), groupId: gameGroup });
                  }}
                >
                  <input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={inputClass}
                  />
                  <button type="submit" className={secondaryButton} disabled={sendInvite.isLoading || email.trim().length === 0}>
                    {sendInvite.isLoading ? "Sending…" : "Send"}
                  </button>
                </form>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {emailSent ? "Invite sent." : "They sign up, then show up under Needs your OK."}
                </p>
                {sendInvite.isError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{sendInvite.error?.message}</p>}
              </div>
            </div>
          </section>

          {/* Player without account */}
          <section className={classNames(cardClass, "p-4")} aria-label="Player without an account">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-white">Player without an account</h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">For old games with people who left or never sign up.</p>
              </div>
              {!showAddPlayer && (
                <button className={secondaryButton} onClick={() => setShowAddPlayer(true)}>
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  Add
                </button>
              )}
            </div>
            {showAddPlayer && (
              <form
                className="mt-3 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  createFakePlayer.mutate({
                    name: fakeName.trim(),
                    nickname: fakeNickname.trim(),
                    email: fakeEmail.trim() || undefined,
                    groupId: gameGroup,
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="fake-name" className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Full name
                    </label>
                    <input id="fake-name" value={fakeName} onChange={(e) => setFakeName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="fake-nickname" className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Nickname
                    </label>
                    <input id="fake-nickname" value={fakeNickname} onChange={(e) => setFakeNickname(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="fake-email" className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Email (optional)
                  </label>
                  <input id="fake-email" type="email" value={fakeEmail} onChange={(e) => setFakeEmail(e.target.value)} className={inputClass} />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" className={secondaryButton} onClick={() => setShowAddPlayer(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={primaryButton}
                    disabled={createFakePlayer.isLoading || !fakeName.trim() || !fakeNickname.trim()}
                  >
                    <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
                    {createFakePlayer.isLoading ? "Adding…" : "Add player"}
                  </button>
                </div>
                {createFakePlayer.isError && <p className="text-sm text-red-600 dark:text-red-400">{createFakePlayer.error?.message}</p>}
              </form>
            )}
          </section>

          {/* Visibility */}
          <section className={classNames(cardClass, "flex items-center gap-3 p-4")} aria-label="Group visibility">
            <div className="min-w-0 flex-1">
              <h2 id="visibility-label" className="font-semibold text-gray-900 dark:text-white">
                Visible to new players
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {hidden
                  ? "Off: only people with an invite can find this group."
                  : "On: anyone can find this group and ask to join."}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={!hidden}
              aria-labelledby="visibility-label"
              disabled={toggleHidden.isLoading}
              onClick={() => toggleHidden.mutate({ gameGroup })}
              className={classNames(
                "relative inline-flex h-7 w-12 flex-none items-center rounded-full transition-colors disabled:opacity-50",
                hidden ? "bg-gray-300 dark:bg-gray-600" : "bg-indigo-600"
              )}
            >
              <span
                className={classNames(
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                  hidden ? "translate-x-1" : "translate-x-6"
                )}
              />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const MemberMenu = (props: {
  name: string;
  playerId: string;
  canPromote: boolean;
  onPromote: () => void;
  onInactive: () => void;
  onRemove: () => void;
}) => {
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
        aria-label={`Actions for ${props.name}`}
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
        <Menu.Items className="absolute right-0 z-20 mt-1 w-56 origin-top-right rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800">
          {props.canPromote && (
            <Menu.Item>
              {({ active }) => (
                <button className={item(active)} onClick={props.onPromote}>
                  <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                  Make admin
                </button>
              )}
            </Menu.Item>
          )}
          <Menu.Item>
            {({ active }) => (
              <button className={item(active)} onClick={props.onInactive}>
                <NoSymbolIcon className="h-5 w-5" aria-hidden="true" />
                Mark inactive
              </button>
            )}
          </Menu.Item>
          <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
          <Menu.Item>
            {({ active }) => (
              <button className={item(active, true)} onClick={props.onRemove}>
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                Remove from group
              </button>
            )}
          </Menu.Item>
          <p className="px-3 pb-1 pt-1.5 font-mono text-[11px] text-gray-500 dark:text-gray-400">Player ID {props.playerId.substring(0, 8)}</p>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default AdminView;
