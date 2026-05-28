import * as React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../utils/cn";
import { toastEvents } from "./toast";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export function ToastProvider() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  React.useEffect(() => {
    const handleAdd = (event: CustomEvent<ToastMessage>) => {
      const newToast = event.detail;
      setToasts((prev) => [...prev, newToast]);

      const duration = newToast.duration || 4000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, duration);
    };

    toastEvents.addEventListener("add", handleAdd as EventListener);
    return () => toastEvents.removeEventListener("add", handleAdd as EventListener);
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastMessage["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 bg-card text-card-foreground border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
          )}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-grow space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => handleClose(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-505 hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
