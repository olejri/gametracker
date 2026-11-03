import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { api } from "npm/utils/api";
import { Button } from "npm/components/ui";
import { classNames } from "npm/lib/utils";
import { ICON_COLORS } from "npm/lib/constants";

// Body is stored as plain text, one bullet per line
export const AnnouncementBody = (props: { body: string }) => {
  const items = props.body.split("\n").filter((line) => line.trim() !== "");
  return (
    <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="flex items-start">
          <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

export const AnnouncementHeader = (props: { title: string; as?: "h3" | "p" }) => {
  const Title = props.as ?? "h3";
  return (
    <div className="flex items-center gap-3">
      <span
        className={classNames(
          ICON_COLORS.indigo.background,
          ICON_COLORS.indigo.foreground,
          "inline-flex flex-none rounded-lg p-2"
        )}
      >
        <SparklesIcon className="h-6 w-6" aria-hidden="true" />
      </span>
      <Title className="text-lg font-semibold text-gray-900 dark:text-white">{props.title}</Title>
    </div>
  );
};

// Shows every unseen announcement, oldest first. The player has to page through
// all of them before "Got it" appears, and that dismisses them all at once.
const WhatsNew = () => {
  const utils = api.useContext();
  const { data: announcements } = api.announcement.getUnseen.useQuery(undefined, {
    refetchOnWindowFocus: false
  });
  const dismiss = api.announcement.dismiss.useMutation({
    onSettled: () => {
      void utils.announcement.getUnseen.invalidate();
    }
  });
  const [page, setPage] = useState(0);

  const list = announcements ?? [];
  const total = list.length;
  useEffect(() => {
    if (page > 0 && page >= total) setPage(Math.max(0, total - 1));
  }, [page, total]);

  const announcement = list[Math.min(page, Math.max(0, total - 1))];
  const isLast = page >= total - 1;
  const open = !!announcement && !dismiss.isLoading && !dismiss.isSuccess;

  const onDismiss = () => {
    if (total > 0) {
      dismiss.mutate({ announcementIds: list.map((a) => a.id) });
    }
  };

  // Escape / clicking outside only closes once every message has been seen
  const onClose = () => {
    if (isLast) onDismiss();
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
                {total > 1 && (
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-1.5" aria-hidden="true">
                      {list.map((a, i) => (
                        <span
                          key={a.id}
                          className={classNames(
                            "h-1.5 rounded-full transition-all",
                            i === page ? "w-6 bg-indigo-600 dark:bg-indigo-400" : "w-1.5 bg-gray-300 dark:bg-gray-600"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {page + 1} of {total}
                    </span>
                  </div>
                )}
                <Dialog.Title as="div">
                  <AnnouncementHeader title={announcement?.title ?? ""} />
                </Dialog.Title>
                <div className="mt-4">
                  <AnnouncementBody body={announcement?.body ?? ""} />
                </div>
                <div className="mt-5 flex gap-3 sm:mt-6">
                  {total > 1 && page > 0 && (
                    <Button variant="secondary" className="justify-center" onClick={() => setPage(page - 1)}>
                      Back
                    </Button>
                  )}
                  {isLast ? (
                    <Button variant="primary" className="flex-1 justify-center" onClick={onDismiss}>
                      Got it
                    </Button>
                  ) : (
                    <Button variant="primary" className="flex-1 justify-center" onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  )}
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
