"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      // P7 : on ne sonde pas quand l'onglet est masqué (arrière-plan), pour
      // éviter des appels serveur inutiles toutes les 60 s sur des onglets inactifs.
      if (document.visibilityState === "hidden") return;
      const value = await getUnreadNotificationCount();
      if (active) setCount(value);
    }
    load();
    const interval = setInterval(load, 60_000);
    // Recharge immédiatement quand l'utilisateur revient sur l'onglet, pour que
    // le compteur soit à jour sans attendre le prochain tick.
    function onVisibility() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center justify-center rounded-[12px] border-2 border-slate-900 bg-white p-2 text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:bg-indigo-50"
      aria-label={count > 0 ? `${count} notification(s) non lue(s)` : "Notifications"}
    >
      <Bell size={16} aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
