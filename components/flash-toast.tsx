"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type FlashMessage = {
  type: "success" | "error" | "info";
  message: string;
};

export function FlashToast() {
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  useEffect(() => {
    try {
      const match = document.cookie.match(/__flash=([^;]+)/);
      if (match) {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded) as FlashMessage;
        setFlash(parsed);
        // Clear cookie client-side to prevent re-display
        document.cookie = "__flash=; path=/; max-age=0";
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 6000);
    return () => clearTimeout(timer);
  }, [flash]);

  if (!flash) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-600" />,
    error: <AlertCircle size={18} className="text-red-600" />,
    info: <Info size={18} className="text-indigo-600" />,
  };

  const styles = {
    success: "border-emerald-400 bg-emerald-50 text-emerald-800",
    error: "border-red-400 bg-red-50 text-red-800",
    info: "border-indigo-300 bg-indigo-50 text-indigo-800",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-start gap-3 rounded-[16px] border-2 p-4 shadow-[4px_4px_0px_#0f172a] ${styles[flash.type]}`}>
        <div className="mt-0.5 shrink-0">{icons[flash.type]}</div>
        <p className="text-sm font-bold leading-5">{flash.message}</p>
        <button
          onClick={() => setFlash(null)}
          className="ml-2 shrink-0 rounded-full p-1 hover:bg-black/5"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
