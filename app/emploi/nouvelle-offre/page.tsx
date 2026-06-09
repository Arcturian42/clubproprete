"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Euro,
  FileText,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/page-shell";
import { EntityCard } from "@/components/entity-card";
import { createJob } from "@/lib/actions/jobs";

export default function NouvelleOffrePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    contract: "CDI",
    salary: "",
    requirements: "",
  });

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const user = session?.user;

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.push("/connexion");
      return;
    }
    if (
      user.role !== "company_owner" &&
      user.role !== "verified_company" &&
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      router.push("/emploi");
      return;
    }
  }, [user, status, router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setErrors({});

    const company = await fetch(`/api/user-company`).then((r) =>
      r.ok ? r.json() : null
    );

    if (!company?.id) {
      setErrors({ general: "Vous devez d'abord créer une fiche entreprise." });
      setIsSubmitting(false);
      return;
    }

    const formDataAction = new FormData();
    formDataAction.append("title", formData.title);
    formDataAction.append("description", formData.description);
    formDataAction.append("city", formData.city);
    formDataAction.append("contractType", formData.contract);
    formDataAction.append("salaryInfo", formData.salary);
    formDataAction.append("requirements", formData.requirements);
    formDataAction.append("companyId", company.id);

    const result = await createJob(formDataAction);
    setIsSubmitting(false);

    if (!result.success) {
      const mapped: Record<string, string> = {};
      const fieldErrors = "errors" in result ? (result.errors as Record<string, string[]> | undefined) : undefined;
      for (const [key, vals] of Object.entries(fieldErrors || {})) {
        mapped[key] = vals[0];
      }
      if ("message" in result && result.message) {
        mapped.general = result.message;
      }
      setErrors(mapped);
      return;
    }

    setShowSuccess(true);
    const timer = setTimeout(() => {
      router.push("/emploi");
    }, 2000);
    timersRef.current.push(timer);
  };

  if (status === "loading" || !user) {
    return (
      <PageShell eyebrow="Emploi" title="Chargement..." description="">
        <div className="surface p-6 text-center">
          <p className="text-slate-600">Vérification de votre accès...</p>
        </div>
      </PageShell>
    );
  }

  if (showSuccess) {
    return (
      <PageShell eyebrow="Emploi" title="Offre soumise !" description="Votre offre d'emploi a été soumise pour validation.">
        <div className="surface p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Merci !</h2>
          <p className="text-slate-600 mb-6">
            Votre offre "{formData.title}" sera visible après validation par l'admin.
          </p>
          <Link href="/emploi" className="bento-btn bento-btn-primary">
            Voir toutes les offres
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Emploi"
      title="Publier une offre"
      description="Créez une nouvelle offre d'emploi pour votre entreprise."
      actions={
        <Link href="/emploi" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux offres
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto">
        <EntityCard
          title={user.organization || "Votre entreprise"}
          subtitle="Publication au nom de"
          meta={["Offre d'emploi"]}
        >
          {errors.general && (
            <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
              {errors.general}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                <Briefcase size={12} className="inline mr-1" /> Intitulé du poste *
              </label>
              <input
                type="text"
                required
                className={`bento-input w-full ${errors.title ? "border-red-500" : ""}`}
                placeholder="Ex: Agent de nettoyage H/F"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
              {errors.title && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                <FileText size={12} className="inline mr-1" /> Description du poste *
              </label>
              <textarea
                required
                rows={5}
                className={`bento-input w-full resize-none ${errors.description ? "border-red-500" : ""}`}
                placeholder="Décrivez les missions, le profil recherché..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
              {errors.description && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                <MapPin size={12} className="inline mr-1" /> Lieu de travail *
              </label>
              <input
                type="text"
                required
                className={`bento-input w-full ${errors.city ? "border-red-500" : ""}`}
                placeholder="Ex: Paris 15e"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
              {errors.city && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                Type de contrat *
              </label>
              <select
                required
                className="bento-input w-full"
                value={formData.contract}
                onChange={(e) => handleChange("contract", e.target.value)}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Interim">Intérim</option>
                <option value="Alternance">Alternance</option>
                <option value="Stage">Stage</option>
                <option value="Temps partiel">Temps partiel</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                <Euro size={12} className="inline mr-1" /> Rémunération
              </label>
              <input
                type="text"
                className="bento-input w-full"
                placeholder="Ex: 1800€ brut/mois selon expérience"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                Prérequis / Compétences
              </label>
              <textarea
                rows={3}
                className="bento-input w-full resize-none"
                placeholder="Expérience, permis, habilitations..."
                value={formData.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bento-btn bento-btn-primary flex-1"
              >
                {isSubmitting ? "Publication en cours..." : <><Save size={16} className="mr-2" /> Publier l'offre</>}
              </button>
              <Link href="/emploi" className="bento-btn">
                Annuler
              </Link>
            </div>
          </form>
        </EntityCard>
      </div>
    </PageShell>
  );
}
