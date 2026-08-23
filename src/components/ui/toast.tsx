"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastApi {
  toast: (t: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />,
  error: <AlertTriangle className="h-[18px] w-[18px] text-red-500" />,
  info: <Info className="h-[18px] w-[18px] text-accent" />,
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback<ToastApi["toast"]>(
    ({ title, description, variant = "success" }) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 4200)
      );
    },
    [dismiss]
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            aria-live="polite"
            className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-[360px] flex-col gap-2 px-4 sm:bottom-5 sm:right-5 sm:px-0"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                role="status"
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-[0_16px_40px_-12px_rgba(9,9,11,0.25)] animate-toast-in"
              >
                <span className="mt-px shrink-0">{icons[t.variant]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-zinc-900">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-[13px] leading-snug text-zinc-500">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => dismiss(t.id)}
                  className="-m-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
