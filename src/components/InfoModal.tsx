import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { OpenWithGameId } from "npm/components/Types";

const InfoModal = (props: {
  open: OpenWithGameId,
  setOpen: (open: OpenWithGameId) => void,
  gameName: string,
  title: string,
  message: string,
  categories: string,
  mechanics: string,
}) => {

  const open = props.open.open && props.open.name === props.gameName;
  const setOpen = props.setOpen;
  const cancelButtonRef = useRef(null);
  const title = props.title;
  const message = props.message;
  const categories = props.categories;
  const mechanics = props.mechanics;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={
        () => setOpen({ open: false, name: "" })
      }>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
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
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3"   className="block text-2xl font-medium text-gray-700">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="text-sm text-gray-500">
                          <div dangerouslySetInnerHTML={{ __html: message }} />
                        </div>
                        <div>
                          <label
                            className="block text-lg font-medium text-gray-700"
                          >Categories:</label>
                          <p
                            className="text-sm text-gray-500"
                          >{categories}</p>
                        </div>
                        <div>
                          <label
                            className="block text-lg font-medium text-gray-700"
                          >Mechanics:</label>
                          <p
                            className="text-sm text-gray-500"
                          >{mechanics}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => setOpen({ open: false, name: "" })}
                  >
                    Back
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default InfoModal;