"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteMyAccount } from "@/lib/actions/profile";

export default function SupprimerComptePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleDelete() {
    if (confirmText !== "SUPPRIMER") return;
    setLoading(true);
    setMessage(null);
    const result = await deleteMyAccount();
    if (result.success) {
      setMessage({ type: "success", text: "Votre compte a été supprimé." });
      await signOut({ redirect: false });
      router.push("/");
    } else {
      setMessage({ type: "error", text: result.message || "Une erreur est survenue." });
    }
    setLoading(false);
  }

  if (!session?.user) {
    return (
      <PageShell eyebrow="Compte" title="Supprimer mon compte" description="">
        <div className="card-soft p-6 text-center">
          <p className="text-slate-600">Connectez-vous pour accéder à cette page.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Compte"
      title="Supprimer mon compte"
      description="Cette action est irréversible. Vos données seront anonymisées."
    >
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-lg font-bold text-red-700">Attention</h2>
          </div>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm font-semibold text-red-700">
            <li>Votre compte sera désactivé immédiatement.</li>
            <li>Vos données personnelles seront anonymisées.</li>
            <li>Vous ne pourrez plus vous connecter.</li>
            <li>Cette action ne peut pas être annulée.</li>
          </ul>
        </div>

        {message && (
          <div className={`rounded-xl border-2 p-4 text-sm font-bold ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <div className="card-soft p-6">
          <label className="block text-sm font-semibold text-slate-700">
            Tapez <strong>SUPPRIMER</strong> pour confirmer
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="bento-input mt-2 w-full"
            placeholder="SUPPRIMER"
          />
          <button
            onClick={handleDelete}
            disabled={confirmText !== "SUPPRIMER" || loading}
            className="bento-btn mt-4 w-full border-red-600 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {loading ? "Suppression..." : "Supprimer définitivement mon compte"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
