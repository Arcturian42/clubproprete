"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notifyListeners() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  notifyListeners();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, 4000);
}

export function Toaster() {
  const [active, setActive] = useState<Toast[]>([]);

  useEffect(() => {
    function handler(t: Toast[]) {
      setActive(t);
    }
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  if (active.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {active.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl border-2 px-4 py-3 text-sm font-bold shadow-lg ${
            t.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : t.type === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
