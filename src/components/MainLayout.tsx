import React from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, MoonIcon, SunIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
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
        <Disclosure as="nav" className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {({ open }) => (
            <>
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
                    <Disclosure.Button
                      className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
                          : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100",
                        "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <button
                      onClick={toggleDarkMode}
                      className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                    >
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
                    <a
                      href={"/" + gameGroup + "/switch"}
                      className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                    >
                      <ArrowsRightLeftIcon className="mr-3 h-6 w-6" aria-hidden="true" />
                      Switch dashboard
                    </a>
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="py-10 dark:bg-gray-900">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"></h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{props.children}</div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainComponent;

