"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { roleLabels } from "@/lib/auth-demo";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function AuthNav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ferme le menu au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Pendant la vérification de session, afficher l'état visiteur par défaut
  // plutôt qu'un "Chargement..." bloquant (la majorité du trafic est non connecté).
  if (status === "loading" || !session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/connexion" className="bento-btn min-h-0 px-3 py-2">
          Connexion
        </Link>
        <Link href="/inscription" className="bento-btn bento-btn-accent min-h-0 px-3 py-2">
          Créer un compte
        </Link>
      </div>
    );
  }

  const user = session.user;
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
  const roleLabel = roleLabels[user.role as keyof typeof roleLabels] || user.role;
  const isPlatformAdmin = user.role === "admin" || user.role === "super_admin";

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="bento-btn min-h-0 px-3 py-2"
          aria-haspopup="menu"
          aria-expanded={open}
          title={roleLabel}
        >
          <UserRound size={14} aria-hidden="true" />
          <span className="max-w-[8rem] truncate">{user.firstName || fullName}</span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-[14px] border-2 border-slate-900 bg-white shadow-[4px_4px_0px_#0f172a]"
          >
            <div className="border-b-2 border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-black text-slate-900">{fullName}</p>
              <p className="truncate text-[11px] font-bold text-slate-500">{user.email}</p>
              <span className="mt-1 inline-block text-[11px] font-extrabold uppercase tracking-wide text-indigo-600">
                {roleLabel}
              </span>
            </div>

            <div className="py-1">
              <Link
                href={isPlatformAdmin ? "/admin" : "/dashboard"}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <LayoutDashboard size={15} aria-hidden="true" /> {isPlatformAdmin ? "Administration" : "Tableau de bord"}
              </Link>
              <Link
                href="/profil"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Settings size={15} aria-hidden="true" /> Mon profil
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <LogOut size={15} aria-hidden="true" /> Se déconnecter
              </button>
            </div>
            {/* U4 — La suppression de compte (action destructrice) a été retirée
                de ce menu pour ne pas la placer sur le même chemin de mémoire
                musculaire que « Mon profil » / « Se déconnecter ». Elle reste
                accessible depuis /profil et /supprimer-compte. */}
          </div>
        )}
      </div>
    </div>
  );
}
