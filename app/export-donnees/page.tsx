"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/page-shell";
import { Download } from "lucide-react";

export default function ExportDonneesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Erreur lors de l'export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mes-donnees-clubproprete-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Impossible d'exporter vos données. Veuillez réessayer.");
    }
    setLoading(false);
  }

  if (!session?.user) {
    return (
      <PageShell eyebrow="RGPD" title="Exporter mes données" description="">
        <div className="card-soft p-6 text-center">
          <p className="text-slate-600">Connectez-vous pour accéder à cette page.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="RGPD"
      title="Exporter mes données"
      description="Téléchargez une copie de vos données personnelles au format JSON."
    >
      <div className="mx-auto max-w-xl">
        <div className="card-soft p-6">
          <p className="text-sm text-slate-600">
            Vous avez le droit d'obtenir une copie des données personnelles que nous détenons à votre sujet.
            Ce fichier JSON contient votre profil, vos candidatures, vos publications et vos préférences.
          </p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="bento-btn bento-btn-primary mt-4 w-full"
          >
            <Download size={16} />
            {loading ? "Préparation..." : "Télécharger mes données"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
