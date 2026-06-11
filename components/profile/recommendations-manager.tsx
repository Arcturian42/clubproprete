"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Quote, ThumbsUp, UserRound, X } from "lucide-react";
import {
  getMyRecommendationsReceived,
  updateRecommendationStatus,
} from "@/lib/actions/recommendations";

type ReceivedRecommendation = {
  id: string;
  comment: string | null;
  relationship: string | null;
  authorRole: string | null;
  authorEmail: string | null;
  status: string;
  createdAt: Date | string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
};

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente de votre validation", className: "bg-amber-50 text-amber-700" },
  published: { label: "Publiée sur votre profil", className: "bg-emerald-50 text-emerald-700" },
  declined: { label: "Refusée", className: "bg-slate-100 text-slate-500" },
};

export function RecommendationsManager() {
  const [recommendations, setRecommendations] = useState<ReceivedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getMyRecommendationsReceived();
    if (result.success && result.recommendations) {
      // Seules les recommandations rédigées comptent : une demande sans texte
      // n'a rien à valider.
      setRecommendations(result.recommendations.filter((r) => r.comment));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (recommendationId: string, status: "published" | "declined") => {
    setUpdatingId(recommendationId);
    const formData = new FormData();
    formData.set("recommendationId", recommendationId);
    formData.set("status", status);
    const result = await updateRecommendationStatus(formData);
    if (result.success) {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recommendationId ? { ...r, status } : r))
      );
    }
    setUpdatingId(null);
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Chargement des recommandations…</p>;
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
        <ThumbsUp size={18} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <p className="text-sm text-slate-500">
          Aucune recommandation reçue pour le moment. Les membres du réseau peuvent vous en rédiger
          une depuis votre profil public : c&apos;est un vrai plus pour votre crédibilité.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((reco) => {
        const status = statusLabels[reco.status] || statusLabels.pending;
        return (
          <div key={reco.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {reco.author?.avatarUrl ? (
                  <img
                    src={reco.author.avatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <UserRound size={16} className="text-slate-400" aria-hidden="true" />
                  </div>
                )}
                <div>
                  {reco.author ? (
                    <Link
                      href={`/membres/${reco.author.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
                    >
                      {reco.author.firstName} {reco.author.lastName}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-700">
                      {reco.authorEmail || "Auteur inconnu"}
                    </span>
                  )}
                  <p className="text-xs text-slate-500">
                    {[reco.authorRole, reco.relationship].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
            </div>

            {reco.comment && (
              <div className="mt-3 flex items-start gap-2">
                <Quote size={16} className="mt-0.5 shrink-0 text-slate-300" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-slate-600">{reco.comment}</p>
              </div>
            )}

            {reco.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatus(reco.id, "published")}
                  disabled={updatingId === reco.id}
                  className="btn-soft btn-soft-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  <Check size={14} aria-hidden="true" /> Publier sur mon profil
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus(reco.id, "declined")}
                  disabled={updatingId === reco.id}
                  className="btn-soft min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  <X size={14} aria-hidden="true" /> Refuser
                </button>
              </div>
            )}
            {reco.status === "published" && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => handleStatus(reco.id, "declined")}
                  disabled={updatingId === reco.id}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  Retirer de mon profil
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
