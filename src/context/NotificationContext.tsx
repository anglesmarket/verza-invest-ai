"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "primary";
}

interface NotificationContextType {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (title: string, message: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const alertModal = useCallback((title: string, message: string) => {
    return new Promise<void>((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          title,
          message,
          confirmLabel: "OK",
          cancelLabel: "",
          type: "primary",
        },
        resolve: () => {
          resolve();
        },
      });
    });
  }, []);

  const handleConfirmClose = (val: boolean) => {
    if (confirmState) {
      confirmState.resolve(val);
      setConfirmState(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ toast, confirm, alert: alertModal }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-card p-4 flex items-center gap-3 animate-slide-up shadow-2xl border-l-4 border-l-blue-500 overflow-hidden relative group"
            style={{
              borderColor: t.type === "success" ? "#10b981" : t.type === "error" ? "#ef4444" : t.type === "warning" ? "#f59e0b" : "#3b82f6",
            }}
          >
            <div className="shrink-0">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {t.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
              {t.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-500" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
              {t.type === "loading" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {t.message}
            </p>
            <button 
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="ms-auto p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <div className="w-4 h-4 rotate-45 flex items-center justify-center font-bold text-lg leading-none">X</div>
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full animate-toast-progress duration-[4000ms] ease-linear" />
          </div>
        ))}
      </div>

      {/* Modal/Confirm Dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-4 md:p-8 w-full max-w-md shadow-2xl animate-scale-up relative border border-slate-200 dark:border-slate-800">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {confirmState.options.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {confirmState.options.message}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              {confirmState.options.cancelLabel !== "" && (
                <button
                  onClick={() => handleConfirmClose(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all"
                >
                  {confirmState.options.cancelLabel || "Cancel"}
                </button>
              )}
              <button
                onClick={() => handleConfirmClose(true)}
                className={`px-6 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg ${
                  confirmState.options.type === "danger" 
                    ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" 
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 shadow-blue-500/20"
                }`}
              >
                {confirmState.options.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
