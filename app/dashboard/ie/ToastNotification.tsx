"use client";

import { useCallback, useEffect, useState } from "react";

type ToastNotificationProps = {
  type: "success" | "error";
  message: string;
  onClose: () => void;
};

export default function ToastNotification({type, message, onClose}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger the slide-in animation.
    setIsVisible(true);

    // Automatically dismiss the notification after 4 seconds.
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    // Remove the component after the slide-out animation.
    const removeTimer = setTimeout(() => {
      onClose();
    }, 4300);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [message, type, onClose]);

  const isSuccess = (type === "success");

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`fixed bottom-6 left-1/2 z-[100]
        w-[calc(100%-2rem)] max-w-md
        -translate-x-1/2
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
      `}
    >
      <div
        className={`
          flex items-center gap-3 rounded-xl border p-4 shadow-lg
          ${isSuccess ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}
        `}
      >
        {/* Status icon */}
        <div
          className={`
            flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold
            ${isSuccess ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}
          `}
        >
          {isSuccess ? "✓" : "!"}
        </div>

        {/* Notification message */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{isSuccess ? "Success" : "Something went wrong"}</p>
          <p className="mt-1 break-words text-sm">{message}</p>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-md px-2 py-1 text-lg opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}