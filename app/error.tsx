"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/page-shell";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell eyebrow="Erreur" title="Quelque chose s'est mal passé" description="">
      <div className="mx-auto max-w-md text-center">
        <div className="card-soft p-8">
          <p className="text-sm text-slate-600">{error.message || "Une erreur inattendue est survenue."}</p>
          <button onClick={reset} className="bento-btn bento-btn-primary mt-4">
            Réessayer
          </button>
        </div>
      </div>
    </PageShell>
  );
}
