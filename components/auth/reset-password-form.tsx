"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { resetPassword } from "@/lib/actions/password-reset";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <h2 className="text-xl font-black text-slate-900">Lien invalide</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">Ce lien de réinitialisation est incomplet ou expiré.</p>
        <Link href="/mot-de-passe-oublie" className="bento-btn bento-btn-primary mt-6 inline-flex">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    formData.set("token", token);
    const result = await resetPassword(formData);
    setSubmitting(false);
    if (!result.success) {
      const fieldError = "errors" in result ? (result.errors as Record<string, string[]>)?.password?.[0] : undefined;
      setError(fieldError || ("message" in result ? result.message : "") || "Une erreur est survenue.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/connexion"), 2000);
  }

  if (done) {
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Mot de passe mis à jour</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <Link href="/connexion" className="bento-btn bento-btn-primary mt-6 inline-flex">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface mx-auto max-w-md p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
          <KeyRound size={22} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Nouveau mot de passe</h2>
          <p className="text-sm font-semibold text-slate-500">Au moins 10 caractères, avec majuscule, minuscule, chiffre et symbole.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>
      )}

      <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
        Nouveau mot de passe
        <input name="password" type="password" required minLength={10} className="bento-input" aria-label="Nouveau mot de passe" placeholder="Minimum 10 caractères" />
      </label>

      <button type="submit" disabled={submitting} className="bento-btn bento-btn-primary mt-5 w-full">
        {submitting ? "Mise à jour..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}
