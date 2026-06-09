"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { roleLabels } from "@/lib/auth-demo";

export function OnboardingSession() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="surface mt-8 p-6">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <Loader2 className="animate-spin text-indigo-600" size={18} aria-hidden="true" />
          Vérification de votre session...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="surface mt-8 p-6">
        <h2 className="text-xl font-black text-slate-900">Commencez par créer un compte</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          L'onboarding qualifie un profil connecté. Créez un compte gratuit ou connectez-vous avec un compte de test.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/inscription" className="bento-btn bento-btn-primary">
            Créer un compte
          </Link>
          <Link href="/connexion" className="bento-btn">
            Connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface mt-8 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-50 p-3 text-emerald-700 shadow-[3px_3px_0px_#0f172a]">
          <CheckCircle2 size={22} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Compte connecté</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Session active : {user.firstName} {user.lastName} ·{" "}
            {roleLabels[user.role as keyof typeof roleLabels] || user.role}. L'étape suivante ouvre le dashboard
            adapté à ce profil.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="bento-btn bento-btn-primary">
              Terminer et ouvrir mon espace
            </Link>
            <Link href="/profil" className="bento-btn">
              Compléter mon profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
