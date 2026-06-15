"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/lib/email-verification";

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification manquant.");
      return;
    }
    verifyEmailToken(token).then((result) => {
      setStatus(result.success ? "success" : "error");
      setMessage(result.message);
    });
  }, [token]);

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="card-soft p-8">
        {status === "loading" && (
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        )}
        {status === "success" && <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={48} />}
        {status === "error" && <XCircle className="mx-auto mb-4 text-red-600" size={48} />}
        <h2 className="text-lg font-bold text-slate-900">
          {status === "success" ? "Email vérifié" : status === "error" ? "Erreur" : "Vérification"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        {status === "success" && (
          <a href="/connexion" className="bento-btn bento-btn-primary mt-4 inline-block">
            Se connecter
          </a>
        )}
      </div>
    </div>
  );
}

export default function VerificationEmailPage() {
  return (
    <PageShell eyebrow="Compte" title="Vérification d'email" description="">
      <Suspense fallback={
        <div className="mx-auto max-w-md text-center">
          <div className="card-soft p-8">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm text-slate-600">Vérification en cours...</p>
          </div>
        </div>
      }>
        <VerificationContent />
      </Suspense>
    </PageShell>
  );
}
