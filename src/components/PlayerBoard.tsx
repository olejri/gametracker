import React, { Fragment, useState } from "react";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import {
  Bars3Icon, ChartPieIcon,
  Square3Stack3DIcon,
  UserIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

import { Dialog, Transition } from "@headlessui/react";
import MyProfile from "npm/components/MyProfile";
import MyCollection from "npm/components/MyCollection";
import MyStats from "npm/components/MyStats";

const PlayerBoard = (props: {
  groupName: string
  playerId: string
}) => {
  const { data: player, isLoading, isError, error } = api.player.getPlayer.useQuery({ clerkId: props.playerId });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("me");
  const playerId = props.playerId;

  const navigation = [
    { name: "Me",
      onClick: () => {setCurrentTab("me")},
      icon: UserIcon,
      current: currentTab === "me",
      iconForeground: "text-sky-700",
      iconBackground: "bg-sky-50"
    },
    { name: "Collection",
      onClick: () => {setCurrentTab("collection")},
      icon: Square3Stack3DIcon,
      current: currentTab === "collection",
      iconForeground: "text-red-700",
      iconBackground: "bg-red-50"
    },
    { name: "Stats",
      onClick: () => {setCurrentTab("stats")},
      icon: ChartPieIcon,
      current: currentTab === "stats",
      iconForeground: "text-yellow-700",
      iconBackground: "bg-yellow-50"
    }
  ];

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
  }

  if (isLoading) return <LoadingPage />;
  if (isError) return <div>{error?.message}</div>;

  return (
    <>
      <div className="flex">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 sm:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <button
                                  onClick={ () => {
                                  item.onClick();
                                  setSidebarOpen(false)
                                }}
                                  className={classNames(
                                    item.current
                                      ? "bg-gray-50 text-indigo-600"
                                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                ><span
                                  className={classNames(
                                    item.iconBackground,
                                    item.iconForeground,
                                    "inline-flex rounded-lg p-3 ring-4 ring-white"
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current ? "text-indigo-600" : "group-hover:text-indigo-600",
                                      "h-6 w-6 shrink-0"
                                    )}
                                    aria-hidden="true"
                                  />
                                </span>
                                  {item.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
        <div className="hidden sm:relative sm:inset-y-0 sm:z-50 sm:flex sm:w-40 sm:flex-col sm:flex-none">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r-2 border-gray-200 bg-white px-6 pb-4">
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <button
                          onClick={item.onClick}
                          className={classNames(
                            item.current
                              ? "bg-gray-50 text-indigo-600"
                              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <span
                            className={classNames(
                              item.iconBackground,
                              item.iconForeground,
                              "inline-flex rounded-lg p-3 ring-4 ring-white"
                            )}
                          >
                          <item.icon
                            className={classNames(
                              item.current ? "text-indigo-600" : "group-hover:text-indigo-600",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          </span>
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="flex-1">
          <main className="">
            <div className="px-4 sm:px-6">
              <div className="mx-auto max-w-7xl sm:px-6">
                <div className="overflow-hidden bg-white shadow-none sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    {currentTab === "me" && (<MyProfile playerId={playerId}/>)}
                    {currentTab === "collection" &&(<MyCollection />)}
                    {currentTab === "stats" && (<MyStats playerId={playerId}/>)}
                  </div>
                </div>
              </div>
            </div>
          </main>
          <div
            className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-white px-4 shadow-none sm:gap-x-6 sm:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 sm:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default PlayerBoard;