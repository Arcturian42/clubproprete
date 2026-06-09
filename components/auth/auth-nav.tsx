"use client";

import Link from "next/link";
import { Settings, UserRound } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { roleLabels } from "@/lib/auth-demo";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400">Chargement...</span>
      </div>
    );
  }

  if (!session?.user) {
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

  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard" className="bento-tag border-indigo-300 bg-indigo-50 text-indigo-700">
        <UserRound size={13} aria-hidden="true" />
        {user.firstName} · {roleLabels[user.role as keyof typeof roleLabels] || user.role}
      </Link>
      <Link href="/profil" className="bento-btn bento-btn-primary min-h-0 px-3 py-2">
        <Settings size={14} aria-hidden="true" />
        Profil
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="bento-btn min-h-0 px-3 py-2 text-[10px]"
      >
        Déconnexion
      </button>
    </div>
  );
}
