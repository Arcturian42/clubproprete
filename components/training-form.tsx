"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, GraduationCap, Save } from "lucide-react";
import { createTraining } from "@/lib/actions/trainings";

type TrainingEntity = {
  id: string;
  name: string;
  creatorType: "company" | "supplier" | "training_organization";
  verificationStatus: string;
};

export function TrainingForm({ entities }: { entities: TrainingEntity[] }) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState(entities[0] ? `${entities[0].creatorType}:${entities[0].id}` : "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedEntity = entities.find((entity) => `${entity.creatorType}:${entity.id}` === selectedKey);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    if (!selectedEntity) {
      setErrors({ general: "Créez ou rattachez une société, un fournisseur ou un centre de formation avant de proposer une formation." });
      setSubmitting(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("creatorType", selectedEntity.creatorType);
    formData.set("creatorEntityId", selectedEntity.id);

    const result = await createTraining(formData);
    setSubmitting(false);

    if (!result.success) {
      const mapped: Record<string, string> = {};
      const fieldErrors = "errors" in result ? (result.errors as Record<string, string[]> | undefined) : undefined;
      for (const [key, values] of Object.entries(fieldErrors || {})) {
        mapped[key] = values[0];
      }
      if ("message" in result && result.message) {
        mapped.general = result.message;
      }
      setErrors(mapped);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/formations"), 1800);
  }

  if (success) {
    return (
      <div className="surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Formation soumise</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">Elle sera visible après validation par l'administration.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface mx-auto max-w-3xl p-6">
      {errors.general && (
        <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
          {errors.general}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
            Structure porteuse *
          </label>
          {entities.length > 0 ? (
            <select className="bento-input w-full" value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
              {entities.map((entity) => (
                <option key={`${entity.creatorType}:${entity.id}`} value={`${entity.creatorType}:${entity.id}`}>
                  {entity.creatorType === "training_organization" ? "Centre de formation" : entity.creatorType === "supplier" ? "Fournisseur" : "Société"} · {entity.name} · {entity.verificationStatus}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-[14px] border-2 border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-700">
              Aucune structure disponible sur votre compte.
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Titre *</label>
          <input name="title" required className="bento-input w-full" placeholder="Ex: Techniques de bio-nettoyage" />
          {errors.title && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.title}</p>}
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Catégorie *</label>
          <input name="category" required className="bento-input w-full" placeholder="Hygiène, sécurité, management..." />
          {errors.category && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.category}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Description</label>
          <textarea name="description" rows={5} className="bento-input w-full resize-none" placeholder="Objectifs, programme, compétences visées..." />
        </div>
        <input type="hidden" name="creatorType" value={selectedEntity?.creatorType ?? ""} />
        <input type="hidden" name="creatorEntityId" value={selectedEntity?.id ?? ""} />
        <input name="duration" className="bento-input w-full" placeholder="Durée" />
        <input name="format" className="bento-input w-full" placeholder="Présentiel, distanciel, mixte" />
        <input name="city" className="bento-input w-full" placeholder="Ville" />
        <input name="certificationName" className="bento-input w-full" placeholder="Certification visée" />
        <input name="fundingOptions" className="bento-input w-full" placeholder="CPF, OPCO, financement interne..." />
        <input name="priceInfoOptional" className="bento-input w-full" placeholder="Tarif ou sur demande" />
        <input name="contactEmail" type="email" className="bento-input w-full" placeholder="Email de contact" />
        <input name="website" className="bento-input w-full" placeholder="Site web" />
        <input name="phone" className="bento-input w-full" placeholder="Téléphone" />
        <div className="sm:col-span-2">
          <textarea name="targetAudience" rows={3} className="bento-input w-full resize-none" placeholder="Public visé" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
            Sessions programmées (une par ligne)
          </label>
          <textarea
            name="sessions"
            rows={3}
            className="bento-input w-full resize-none"
            placeholder={"2026-09-15 | Paris | 12\n2026-10-03 | Lyon | 10"}
          />
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Format : AAAA-MM-JJ | Ville | Places disponibles</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={submitting || entities.length === 0} className="bento-btn bento-btn-primary">
          {submitting ? "Envoi..." : <><Save size={16} /> Soumettre la formation</>}
        </button>
        <Link href="/formations" className="bento-btn">
          Annuler
        </Link>
        {selectedEntity?.verificationStatus !== "approved" && selectedEntity && (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-700">
            <GraduationCap size={14} />
            La formation restera en attente tant que la structure n'est pas validée.
          </span>
        )}
      </div>
    </form>
  );
}
