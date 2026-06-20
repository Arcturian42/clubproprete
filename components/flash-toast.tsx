"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type FlashMessage = {
  type: "success" | "error" | "info";
  message: string;
};

// U7 — Durée portée à 8 s, avec mise en pause au survol/focus pour les lecteurs
// lents ou les utilisateurs de loupe d'écran.
const TOAST_DURATION = 8000;

export function FlashToast() {
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(TOAST_DURATION);
  const startedAtRef = useRef(0);

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

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((duration: number) => {
    clearTimer();
    startedAtRef.current = Date.now();
    remainingRef.current = duration;
    timerRef.current = setTimeout(() => setFlash(null), duration);
  }, [clearTimer]);

  useEffect(() => {
    if (!flash) return;
    startTimer(TOAST_DURATION);
    return clearTimer;
  }, [flash, startTimer, clearTimer]);

  // Pause au survol/focus : on fige le décompte ; à la sortie, on reprend.
  const pause = useCallback(() => {
    if (!timerRef.current) return;
    clearTimer();
    remainingRef.current -= Date.now() - startedAtRef.current;
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (timerRef.current || !flash) return;
    startTimer(Math.max(1000, remainingRef.current));
  }, [flash, startTimer]);

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
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
      role={flash.type === "error" ? "alert" : "status"}
      aria-live={flash.type === "error" ? "assertive" : "polite"}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
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
