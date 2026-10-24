import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CameraIcon, PhotoIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { upload } from "@vercel/blob/client";
import { api, type RouterOutputs } from "npm/utils/api";
import { Button } from "npm/components/ui";
import { LoadingSpinner } from "npm/components/loading";
import { useToast } from "npm/context/ToastContext";

type SessionPhoto = RouterOutputs["session"]["getGameASession"]["photos"][number];

const MAX_PHOTOS = 3;
// HEIC/HEIF listed explicitly so iPhone photos are selectable; they are re-encoded to JPEG before upload
const PHOTO_ACCEPT = "image/*,image/heic,image/heif";
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

const photoSrc = (imageId: string) => `/api/session-photo/${imageId}`;

// Resizes the picked image so its longest side is at most MAX_DIMENSION and re-encodes it as JPEG
const compressImage = async (file: File): Promise<Blob> => {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Your browser could not open "${file.name}". Try a JPEG or PNG photo instead.`));
      image.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not process that image");
    }
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not process that image"))),
        "image/jpeg",
        JPEG_QUALITY
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const SessionPhotos = (props: {
  gameSessionId: string;
  photos: SessionPhoto[];
  photosEnabled: boolean;
  canAddPhotos: boolean;
}) => {
  const { gameSessionId, photos, photosEnabled, canAddPhotos } = props;
  const ctx = api.useContext();
  const { showToast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const addImage = api.session.addImage.useMutation();
  const deleteImage = api.session.deleteImage.useMutation({
    onSuccess: () => {
      closeViewer();
      void ctx.session.getGameASession.invalidate({ data: { id: gameSessionId } });
    },
    onError: (e) => {
      showToast(e.message || "Could not delete the photo", "error");
    }
  });

  if (photos.length === 0 && (!photosEnabled || !canAddPhotos)) {
    return null;
  }

  const canUpload = photosEnabled && canAddPhotos && photos.length < MAX_PHOTOS;
  const viewedPhoto = viewerIndex !== null ? photos[viewerIndex] : undefined;

  function closeViewer() {
    setViewerIndex(null);
    setConfirmDelete(false);
  }

  const uploadPhoto = async (file: File) => {
    const compressed = await compressImage(file);
    const blob = await upload(`session-photos/${gameSessionId}/photo.jpg`, compressed, {
      access: "private",
      handleUploadUrl: "/api/session-photo-upload",
      clientPayload: JSON.stringify({ gameSessionId }),
      contentType: "image/jpeg"
    });
    await addImage.mutateAsync({ gameSessionId, pathname: blob.pathname });
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    // Reset so picking the same file again still fires onChange
    event.target.value = "";
    if (selected.length === 0) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    const files = selected.slice(0, remainingSlots);
    if (selected.length > files.length) {
      const skipped = selected.length - files.length;
      showToast(`Only ${MAX_PHOTOS} photos per session, so ${skipped} ${skipped === 1 ? "photo was" : "photos were"} skipped`, "info");
    }
    if (files.length === 0) return;

    setIsUploading(true);
    // Upload one at a time so a file that fails does not stop the others
    for (let index = 0; index < files.length; index++) {
      setUploadProgress({ current: index + 1, total: files.length });
      try {
        await uploadPhoto(files[index] as File);
      } catch (e) {
        showToast((e as Error).message || "Could not upload the photo", "error");
      }
    }
    await ctx.session.getGameASession.invalidate({ data: { id: gameSessionId } });
    setIsUploading(false);
    setUploadProgress(null);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 mt-4">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Photos
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setViewerIndex(index)}
                className="aspect-square overflow-hidden rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- served by an authenticated API route */}
                <img
                  src={photoSrc(photo.id)}
                  alt={`Session photo ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {canUpload && (
          <>
            {/* Camera input: capture makes phones open the camera directly */}
            <input
              ref={cameraInputRef}
              type="file"
              accept={PHOTO_ACCEPT}
              capture="environment"
              className="hidden"
              onChange={(e) => void handleFilesSelected(e)}
            />
            {/* Gallery input: no capture, so phones open the gallery or file picker */}
            <input
              ref={galleryInputRef}
              type="file"
              accept={PHOTO_ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => void handleFilesSelected(e)}
            />
            {isUploading ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-700 dark:text-gray-300">
                <LoadingSpinner size={20} />
                {uploadProgress && uploadProgress.total > 1
                  ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
                  : "Uploading..."}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  variant="primary"
                  className="w-full justify-center gap-1.5 !px-2 sm:w-auto sm:!px-4"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <CameraIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Take photo
                </Button>
                <Button
                  variant="primary"
                  className="w-full justify-center gap-1.5 !px-2 sm:w-auto sm:!px-4"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <PhotoIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Choose from gallery
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Transition.Root show={viewedPhoto !== undefined} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeViewer}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/95" />
          </Transition.Child>

          <div className="fixed inset-0 flex flex-col">
            <Dialog.Panel className="flex h-full w-full flex-col">
              <Dialog.Title className="sr-only">Session photo</Dialog.Title>
              <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
                <span className="text-sm text-gray-300">
                  {viewerIndex !== null ? viewerIndex + 1 : 0} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={closeViewer}
                  className="rounded-full p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div
                className="flex min-h-0 flex-1 items-center justify-center px-2"
                onClick={closeViewer}
              >
                {viewedPhoto && (
                  /* eslint-disable-next-line @next/next/no-img-element -- served by an authenticated API route */
                  <img
                    src={photoSrc(viewedPhoto.id)}
                    alt="Session photo"
                    className="max-h-full max-w-full object-contain"
                    onClick={(e) => {
                      // Tap the photo to step through the others
                      e.stopPropagation();
                      if (photos.length > 1 && viewerIndex !== null) {
                        setConfirmDelete(false);
                        setViewerIndex((viewerIndex + 1) % photos.length);
                      }
                    }}
                  />
                )}
              </div>

              <div className="px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {viewedPhoto?.canDelete && (
                  confirmDelete ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <span className="text-center text-sm text-gray-200 sm:self-center sm:mr-2">
                        Delete this photo?
                      </span>
                      <Button
                        variant="secondary"
                        className="w-full justify-center sm:w-auto"
                        disabled={deleteImage.isLoading}
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        className="w-full justify-center gap-2 sm:w-auto"
                        disabled={deleteImage.isLoading}
                        onClick={() => deleteImage.mutate({ imageId: viewedPhoto.id })}
                      >
                        {deleteImage.isLoading ? <LoadingSpinner size={20} /> : null}
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button
                        variant="danger"
                        className="w-full justify-center gap-2 sm:w-auto"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        Delete photo
                      </Button>
                    </div>
                  )
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default SessionPhotos;
