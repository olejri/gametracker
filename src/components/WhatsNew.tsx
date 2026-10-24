import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import { Button } from "npm/components/ui";
import { classNames } from "npm/lib/utils";
import { ICON_COLORS } from "npm/lib/constants";

// Shows the newest announcement until the player dismisses it
const WhatsNew = () => {
  const utils = api.useContext();
  const { data: announcement } = api.announcement.getUnseen.useQuery(undefined, {
    refetchOnWindowFocus: false
  });
  const dismiss = api.announcement.dismiss.useMutation({
    onSettled: () => {
      void utils.announcement.getUnseen.invalidate();
    }
  });

  const open = !!announcement && !dismiss.isLoading && !dismiss.isSuccess;
  const items = announcement?.body.split("\n").filter((line) => line.trim() !== "") ?? [];

  const onClose = () => {
    if (announcement) {
      dismiss.mutate({ announcementId: announcement.id });
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-80" />
        </Transition.Child>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-md sm:p-6 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <span
                    className={classNames(
                      ICON_COLORS.indigo.background,
                      ICON_COLORS.indigo.foreground,
                      "inline-flex rounded-lg p-2"
                    )}
                  >
                    <SparklesIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                    {announcement?.title}
                  </Dialog.Title>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  {items.map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 sm:mt-6">
                  <Button variant="primary" className="w-full justify-center" onClick={onClose}>
                    Got it
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default WhatsNew;
