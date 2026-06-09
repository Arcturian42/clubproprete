"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <div className="rounded-[20px] border-2 border-slate-900 bg-amber-400 p-4 shadow-[4px_4px_0px_#0f172a]">
        <span className="text-3xl font-black text-slate-900">500</span>
      </div>
      <h1 className="text-2xl font-black text-slate-900">Une erreur est survenue</h1>
      <p className="text-sm font-semibold text-slate-500">
        {error.message || "Notre équipe a été notifiée. Veuillez réessayer dans un instant."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="bento-btn bento-btn-primary">
          <RefreshCcw size={16} /> Réessayer
        </button>
        <Link href="/" className="bento-btn">
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
