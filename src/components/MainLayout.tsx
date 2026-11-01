import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { LoadingPage } from "npm/components/loading";
import { useRouter } from "next/router";
import { api } from "npm/utils/api";
import { useGameGroupContext } from "npm/context/GameGroupContext";
import { classNames } from "npm/lib/utils";
import { useTheme } from "npm/context/ThemeContext";
import { PROFILE_TABS, ProfileAvatar, ProfileMiniCard, helpHref, profileHref } from "npm/components/ProfileNav";

type ContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

const drawerLinkClasses = (active: boolean) =>
  classNames(
    active
      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
      : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100",
    "flex min-h-[44px] items-center border-l-4 pl-3 pr-4 text-base font-medium"
  );

const drawerActionClasses =
  "flex min-h-[44px] w-full items-center px-4 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";

const MainComponent = (props: ContainerProps) => {
  const gameGroup = useGameGroupContext().gameGroup;
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { data, isLoading, isError, error } = api.group.getActiveGameGroup.useQuery();
  const { data: playerData } = api.user.getPlayer.useQuery(
    { clerkId: user?.id || "" },
    { enabled: !!user?.id }
  );
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuSeen, setProfileMenuSeen] = useState(false);

  // Close the drawer on client-side navigation
  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  // The drawer is mobile only; close it if the viewport grows past sm
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 640px)");
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setMenuOpen(false);
    };
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  if (!isLoaded || !isSignedIn || !user || isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <p>{error?.message}</p>;
  }

  const pathname = router.pathname;
  const isProfilePage = pathname === "/[dashboardId]/player/[playerId]";
  const currentProfileTab = typeof router.query.tab === "string" && router.query.tab !== "me" ? router.query.tab : router.query.tab === "me" ? "profile" : "stats";
  const profileName = playerData?.data?.nickname || user.username || user.firstName || "Me";
  const navigation = [
    { name: "Dashboard", href: "/" + gameGroup + "/dashboard", current: pathname === "/[dashboardId]/dashboard" },
    {
      name: "Profile",
      href: "/" + gameGroup + "/player/" + user.id,
      current: pathname === "/[dashboardId]/player/[playerId]"
    },
  ];

  if (data?.role === "ADMIN") {
    navigation.push({
      name: "Admin",
      href: "/" + gameGroup + "/admin",
      current: pathname === "/[dashboardId]/admin"
    });
  }

  if (playerData?.data?.isSuperAdmin) {
    navigation.push({
      name: "SuperAdmin",
      href: "/dashboards-view",
      current: pathname === "/dashboards-view"
    });
  }
  return (
    <>
      <div className="min-h-full">
        <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex min-w-0 flex-1">
                <div className="flex flex-shrink-0 items-center">
                  <div
                    className="block h-8 w-auto sm:hidden"
                  >
                    <UserButton />
                  </div>
                </div>
                {data?.groupName && (
                  <div className="flex min-w-0 flex-1 items-center px-3 sm:hidden">
                    <span
                      className="truncate text-base font-semibold text-gray-900 dark:text-white"
                      title={data.groupName}
                    >
                      {data.groupName}
                    </span>
                  </div>
                )}
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => item.name === "Profile" ? (
                    <Menu as="div" key={item.name} className="relative flex">
                      <Menu.Button
                        onClick={() => setProfileMenuSeen(true)}
                        className={classNames(
                          item.current
                            ? "border-indigo-500 text-gray-900 dark:text-white"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100",
                          "inline-flex items-center gap-2 border-b-2 px-1 pt-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        )}
                      >
                        {({ open }) => (
                          <>
                            <ProfileAvatar name={profileName} imageUrl={user.imageUrl} size={24} />
                            Profile
                            <ChevronDownIcon className={classNames("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
                          </>
                        )}
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100 motion-reduce:transition-none"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75 motion-reduce:transition-none"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute left-0 top-full z-30 mt-1 w-72 origin-top-left rounded-xl border border-gray-200 bg-white p-2 shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={profileHref(gameGroup, user.id, "stats")}
                                className={classNames("mb-1 block rounded-2xl focus:outline-none", active && "ring-2 ring-indigo-400")}
                              >
                                <ProfileMiniCard groupName={gameGroup} fallbackName={profileName} imageUrl={user.imageUrl} enabled={profileMenuSeen} />
                              </Link>
                            )}
                          </Menu.Item>
                          {PROFILE_TABS.map((tab) => (
                            <Menu.Item key={tab.id}>
                              {({ active }) => (
                                <Link
                                  href={profileHref(gameGroup, user.id, tab.id)}
                                  className={classNames(
                                    active && "bg-gray-100 dark:bg-gray-700",
                                    "flex min-h-[44px] items-center gap-3 rounded-lg px-2 text-sm font-semibold text-gray-900 dark:text-white"
                                  )}
                                >
                                  <span className={classNames(tab.iconBackground, tab.iconForeground, "inline-flex rounded-lg p-1.5")}>
                                    <tab.icon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                  {tab.label}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "border-indigo-500 text-gray-900 dark:text-white"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100",
                        "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                <a
                  href={helpHref(gameGroup)}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  aria-label="Help and FAQ"
                  title="Help & FAQ"
                >
                  <QuestionMarkCircleIcon className="h-6 w-6" aria-hidden="true" />
                </a>
                <button
                  onClick={toggleDarkMode}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                <a
                  href={"/" + gameGroup + "/export"}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  aria-label="Export data"
                  title="Export data"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" aria-hidden="true" />
                </a>
                <a
                  href={"/" + gameGroup + "/switch"}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  aria-label="Switch dashboard"
                >
                  <ArrowsRightLeftIcon className="h-6 w-6" aria-hidden="true" />
                </a>
                <UserButton />
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu: slides down over the whole screen; Dialog locks page scroll and closes on Escape */}
        <Transition.Root show={menuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 sm:hidden" onClose={setMenuOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-out duration-200 motion-reduce:transition-none"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-in duration-150 motion-reduce:transition-none"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/50" aria-hidden="true" />
            </Transition.Child>

            <div className="fixed inset-0">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-200 motion-reduce:transition-none"
                enterFrom="-translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in duration-150 motion-reduce:transition-none"
                leaveFrom="translate-y-0"
                leaveTo="-translate-y-full"
              >
                <Dialog.Panel className="flex h-full w-full flex-col bg-white pt-[env(safe-area-inset-top)] dark:bg-gray-800">
                  <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
                    <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                      Menu
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className="-mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
                    <div className="space-y-3 border-b border-gray-200 p-4 dark:border-gray-700">
                      <Link href={profileHref(gameGroup, user.id, "stats")} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                        <ProfileMiniCard groupName={gameGroup} fallbackName={profileName} imageUrl={user.imageUrl} enabled={menuOpen} />
                      </Link>
                      <div className="grid grid-cols-3 gap-2">
                        {PROFILE_TABS.map((tab) => {
                          const active = isProfilePage && currentProfileTab === tab.id;
                          return (
                            <Link
                              key={tab.id}
                              href={profileHref(gameGroup, user.id, tab.id)}
                              aria-current={active ? "page" : undefined}
                              className={classNames(
                                active
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-200"
                                  : "border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700",
                                "flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-xl border px-1 text-center text-sm font-semibold"
                              )}
                            >
                              <span className={classNames(tab.iconBackground, tab.iconForeground, "inline-flex rounded-lg p-2")}>
                                <tab.icon className="h-5 w-5" aria-hidden="true" />
                              </span>
                              {tab.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-1 pb-3 pt-2">
                      {navigation.map((item) => {
                        // Profile has its own card above the list
                        if (item.name === "Profile") return null;
                        // For other items (Dashboard, Admin, etc.), render normally
                        return (
                          <a
                            key={item.name}
                            href={item.href}
                            className={drawerLinkClasses(item.current)}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        );
                      })}
                      <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                        <button onClick={toggleDarkMode} className={drawerActionClasses}>
                          {isDarkMode ? (
                            <>
                              <SunIcon className="mr-3 h-6 w-6" aria-hidden="true" />
                              Light mode
                            </>
                          ) : (
                            <>
                              <MoonIcon className="mr-3 h-6 w-6" aria-hidden="true" />
                              Dark mode
                            </>
                          )}
                        </button>
                        <a href={"/" + gameGroup + "/switch"} className={drawerActionClasses}>
                          <ArrowsRightLeftIcon className="mr-3 h-6 w-6" aria-hidden="true" />
                          Switch dashboard
                        </a>
                        <a href={"/" + gameGroup + "/export"} className={drawerActionClasses}>
                          <ArrowDownTrayIcon className="mr-3 h-6 w-6" aria-hidden="true" />
                          Export data
                        </a>
                        <a href={helpHref(gameGroup)} className={drawerActionClasses}>
                          <QuestionMarkCircleIcon className="mr-3 h-6 w-6" aria-hidden="true" />
                          Help &amp; FAQ
                        </a>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="py-4 sm:py-10 dark:bg-gray-900">
          <main>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{props.children}</div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainComponent;
