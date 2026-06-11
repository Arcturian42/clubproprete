"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Send, X } from "lucide-react";
import { submitRecommendation } from "@/lib/actions/recommendations";

type Props = {
  candidateUserId: string;
  candidateFirstName: string;
};

const RELATIONSHIPS = [
  "Client",
  "Collègue",
  "Manager",
  "Partenaire commercial",
  "Fournisseur",
  "Donneur d'ordre",
  "Autre",
];

export function RecommendationForm({ candidateUserId, candidateFirstName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [relationship, setRelationship] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("candidateUserId", candidateUserId);
    formData.set("relationship", relationship);
    formData.set("comment", comment);
    if (authorRole.trim()) formData.set("authorRole", authorRole.trim());

    const result = await submitRecommendation(formData);

    if (result.success) {
      setMessage({
        type: "success",
        text: `Merci ! Votre recommandation sera visible dès que ${candidateFirstName || "le membre"} l'aura validée.`,
      });
      setRelationship("");
      setAuthorRole("");
      setComment("");
      setOpen(false);
      router.refresh();
    } else {
      const firstError =
        result.message ||
        (result.errors ? Object.values(result.errors).flat()[0] : null) ||
        "Une erreur est survenue.";
      setMessage({ type: "error", text: firstError });
    }
    setSubmitting(false);
  };

  return (
    <div>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="btn-soft">
          <PenLine size={16} aria-hidden="true" />
          Recommander {candidateFirstName || "ce membre"}
        </button>
      )}

      {message && (
        <p
          role="status"
          className={`mt-3 text-sm font-medium ${
            message.type === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="card-soft mt-2 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-900">
              Rédiger une recommandation
            </h4>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setMessage(null);
              }}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fermer le formulaire"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reco-relationship" className="mb-1.5 block text-sm font-medium text-slate-700">
                Votre relation professionnelle
              </label>
              <select
                id="reco-relationship"
                className="input-soft"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
              >
                <option value="">Sélectionner…</option>
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reco-author-role" className="mb-1.5 block text-sm font-medium text-slate-700">
                Votre fonction (facultatif)
              </label>
              <input
                id="reco-author-role"
                className="input-soft"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Ex : Gérant, Azur Propreté"
                maxLength={120}
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="reco-comment" className="mb-1.5 block text-sm font-medium text-slate-700">
              Votre recommandation
            </label>
            <textarea
              id="reco-comment"
              className="input-soft min-h-[120px] resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre collaboration : qualité du travail, fiabilité, ponctualité…"
              minLength={10}
              maxLength={2000}
              required
            />
            <p className="mt-1 text-xs text-slate-400">{comment.length}/2000 caractères</p>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setMessage(null);
              }}
              className="btn-soft"
            >
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-soft btn-soft-primary disabled:opacity-50">
              <Send size={15} aria-hidden="true" />
              {submitting ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
