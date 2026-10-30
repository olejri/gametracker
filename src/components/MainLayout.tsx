import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, MoonIcon, SunIcon, ArrowsRightLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { UserButton, useUser } from "@clerk/nextjs";
import { LoadingPage } from "npm/components/loading";
import { useRouter } from "next/router";
import { api } from "npm/utils/api";
import { useGameGroupContext } from "npm/context/GameGroupContext";
import { classNames } from "npm/lib/utils";
import { useTheme } from "npm/context/ThemeContext";

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

const drawerSubLinkClasses =
  "flex min-h-[44px] items-center border-l-4 border-transparent pl-8 pr-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";

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
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <div
                    className="block h-8 w-auto sm:hidden"
                  >
                    <UserButton />
                  </div>
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
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
                    <div className="space-y-1 pb-3 pt-2">
                      {navigation.map((item) => {
                        // For mobile, expand Profile into sub-items
                        if (item.name === "Profile") {
                          const isProfileActive = pathname === "/[dashboardId]/player/[playerId]";
                          return (
                            <React.Fragment key={item.name}>
                              <a href={"/" + gameGroup + "/player/" + user.id} className={drawerLinkClasses(isProfileActive)}>
                                Profile
                              </a>
                              <a href={"/" + gameGroup + "/player/" + user.id + "?tab=collection"} className={drawerSubLinkClasses}>
                                Collection
                              </a>
                              <a href={"/" + gameGroup + "/player/" + user.id + "?tab=faq"} className={drawerSubLinkClasses}>
                                FAQ
                              </a>
                              <a href={"/" + gameGroup + "/player/" + user.id + "?tab=stats"} className={drawerSubLinkClasses}>
                                Stats
                              </a>
                            </React.Fragment>
                          );
                        }
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
