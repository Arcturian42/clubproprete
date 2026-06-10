"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/password-reset";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await requestPasswordReset(new FormData(event.currentTarget));
    setSubmitting(false);
    if (!result.success) {
      const fieldError = "errors" in result ? (result.errors as Record<string, string[]>)?.email?.[0] : undefined;
      setError(fieldError || ("message" in result ? result.message : "") || "Une erreur est survenue.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Vérifiez votre boîte mail</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Si un compte existe pour cette adresse, un lien de réinitialisation (valable 1 heure) vient d'être envoyé.
        </p>
        <Link href="/connexion" className="bento-btn bento-btn-primary mt-6 inline-flex">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface mx-auto max-w-md p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
          <Mail size={22} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Mot de passe oublié</h2>
          <p className="text-sm font-semibold text-slate-500">Recevez un lien de réinitialisation.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>
      )}

      <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
        Adresse email
        <input name="email" type="email" required className="bento-input" placeholder="email@entreprise.fr" aria-label="Adresse email" />
      </label>

      <button type="submit" disabled={submitting} className="bento-btn bento-btn-primary mt-5 w-full">
        {submitting ? "Envoi..." : "Envoyer le lien"}
      </button>
      <div className="mt-3 text-center">
        <Link href="/connexion" className="text-xs font-bold text-indigo-600 hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </form>
  );
}
