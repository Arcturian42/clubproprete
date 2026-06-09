"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { roleLabels } from "@/lib/auth-demo";

type AuthRequiredProps = {
  children: ReactNode;
  requireAssociation?: boolean;
  requireAdmin?: boolean;
};

export function AuthRequired({ children, requireAssociation = false, requireAdmin = false }: AuthRequiredProps) {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return <div className="surface p-6 text-sm font-bold text-slate-500">Chargement de la session...</div>;
  }

  if (!user) {
    return (
      <div className="surface p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <ShieldAlert size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Connexion requise</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Ce flow nécessite un compte. Connectez-vous avec un compte de test ou créez un compte gratuit.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/connexion" className="bento-btn bento-btn-primary">
                Connexion
              </Link>
              <Link href="/inscription" className="bento-btn">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requireAssociation && !user.associationMember && user.role !== "admin") {
    return (
      <div className="surface p-6">
        <h2 className="text-xl font-black text-slate-900">Accès réservé aux membres association</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Session actuelle : {user.firstName} · {roleLabels[user.role as keyof typeof roleLabels]}. Ce profil doit demander et obtenir la validation
          association avant de consulter les missions.
        </p>
        <Link href="/association" className="bento-btn bento-btn-gold mt-5">
          Demander l'association
        </Link>
      </div>
    );
  }

  if (requireAdmin && user.role !== "admin" && user.role !== "super_admin") {
    return (
      <div className="surface p-6">
        <h2 className="text-xl font-black text-slate-900">Accès admin requis</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Session actuelle : {user.firstName} · {roleLabels[user.role as keyof typeof roleLabels]}. Connectez-vous avec le compte admin de test
          pour accéder au back-office.
        </p>
        <Link href="/connexion" className="bento-btn bento-btn-primary mt-5">
          Changer de compte
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
