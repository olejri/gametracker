import React from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { UserButton, useUser } from "@clerk/nextjs";
import { LoadingPage } from "npm/components/loading";
import { useRouter } from "next/router";
import { api } from "npm/utils/api";
import { useGameGroupContext } from "npm/context/GameGroupContext";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type ContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

const MainComponent = (props: ContainerProps) => {
  const gameGroup = useGameGroupContext().gameGroup;
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { data, isLoading, isError, error } = api.group.getActiveGameGroup.useQuery();

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
    { name: "Switch", href: "/" + gameGroup + "/switch", current: pathname === "/[dashboardId]/switch" },
    { name: "Export", href: "/" + gameGroup + "/export", current: pathname === "/[dashboardId]/export" },
  ];

  if (data?.role === "ADMIN") {
    navigation.push({
      name: "Admin",
      href: "/" + gameGroup + "/admin",
      current: pathname === "/[dashboardId]/admin"
    });
  }
  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="border-b border-gray-200 bg-white">
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
                              ? "border-indigo-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <UserButton />
                  </div>
                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button
                      className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
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
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                        "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900"></h1>
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

