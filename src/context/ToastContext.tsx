import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "npm/lib/utils";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "achievement";
  duration?: number;
  achievementData?: {
    name: string;
    tier: string;
    points: number;
  };
};

type ToastContextType = {
  showToast: (message: string, type?: Toast["type"], achievementData?: Toast["achievementData"]) => void;
  showAchievementToast: (name: string, tier: string, points: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "info", achievementData?: Toast["achievementData"]) => {
      const id = Math.random().toString(36).substring(7);
      const duration = type === "achievement" ? 5000 : 3000;

      setToasts((prev) => [...prev, { id, message, type, duration, achievementData }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showAchievementToast = useCallback(
    (name: string, tier: string, points: number) => {
      showToast(`Achievement Unlocked: ${name}`, "achievement", { name, tier, points });
    },
    [showToast]
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "from-amber-600 to-amber-800 dark:from-amber-700 dark:to-amber-900";
      case "silver":
        return "from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700";
      case "gold":
        return "from-yellow-500 to-yellow-700 dark:from-yellow-600 dark:to-yellow-800";
      case "platinum":
        return "from-cyan-500 to-blue-700 dark:from-cyan-600 dark:to-blue-800";
      default:
        return "from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showAchievementToast }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={classNames(
              "pointer-events-auto flex w-full max-w-sm transform items-center gap-3 rounded-lg p-4 shadow-lg transition-all duration-300",
              toast.type === "achievement"
                ? `bg-gradient-to-r ${getTierColor(toast.achievementData?.tier ?? "")}`
                : toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : "bg-gray-800"
            )}
          >
            {toast.type === "achievement" && (
              <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-white" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{toast.message}</p>
              {toast.achievementData && (
                <p className="mt-1 text-xs text-white/90">
                  {toast.achievementData.points} points • {toast.achievementData.tier}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
