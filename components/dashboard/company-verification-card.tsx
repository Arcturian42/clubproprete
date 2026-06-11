"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CalendarClock, ChevronDown, ChevronUp, ShieldQuestion } from "lucide-react";
import {
  getCompanyVerificationRequest,
  requestCompanyVerification,
} from "@/lib/actions/companies";

type Props = {
  companyId: string;
  verificationStatus: string;
  defaultEmployeeCount?: string;
  defaultPhone?: string;
};

type RequestState = {
  status: string;
  preferredSlot: string | null;
  createdAt: Date | string;
  rejectionReason: string | null;
} | null;

/**
 * Parcours de vérification de la fiche : la fiche est déjà publiée, le badge
 * « Fiche vérifiée » s'obtient via un rendez-vous avec Club Propreté + un
 * questionnaire, validés par l'admin.
 */
export function CompanyVerificationCard({
  companyId,
  verificationStatus,
  defaultEmployeeCount,
  defaultPhone,
}: Props) {
  const [status, setStatus] = useState(verificationStatus);
  const [request, setRequest] = useState<RequestState>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [employeeCount, setEmployeeCount] = useState(defaultEmployeeCount || "");
  const [mainClients, setMainClients] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [contactPhone, setContactPhone] = useState(defaultPhone || "");

  useEffect(() => {
    setStatus(verificationStatus);
  }, [verificationStatus]);

  const loadRequest = useCallback(async () => {
    const latest = await getCompanyVerificationRequest(companyId);
    if (latest) setRequest(latest);
  }, [companyId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("companyId", companyId);
    formData.set("yearsInBusiness", yearsInBusiness);
    formData.set("employeeCount", employeeCount);
    formData.set("mainClients", mainClients);
    formData.set("additionalInfo", additionalInfo);
    formData.set("preferredSlot", preferredSlot);
    formData.set("contactPhone", contactPhone);

    const result = await requestCompanyVerification(formData);

    if (result.success) {
      setStatus("pending");
      setFormOpen(false);
      setMessage({
        type: "success",
        text: "Demande envoyée ! L'équipe Club Propreté vous recontacte pour planifier le rendez-vous de vérification.",
      });
      loadRequest();
    } else {
      const firstError =
        result.message ||
        (result.errors ? Object.values(result.errors).flat()[0] : null) ||
        "Une erreur est survenue.";
      setMessage({ type: "error", text: firstError });
    }
    setSubmitting(false);
  };

  if (status === "approved") {
    return (
      <section className="surface p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <BadgeCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Fiche vérifiée</h2>
            <p className="text-sm text-slate-500">
              Votre fiche porte le badge « Fiche vérifiée » sur l&apos;annuaire et vous pouvez publier des offres d&apos;emploi.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "pending") {
    return (
      <section className="surface p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <CalendarClock size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Vérification en cours</h2>
            <p className="text-sm text-slate-500">
              Votre demande est bien enregistrée
              {request?.preferredSlot ? ` (créneau souhaité : ${request.preferredSlot})` : ""}. L&apos;équipe Club
              Propreté vous recontacte pour le rendez-vous. Votre fiche reste visible dans l&apos;annuaire.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <ShieldQuestion size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Faites vérifier votre fiche</h2>
            <p className="text-sm text-slate-500">
              Votre fiche est en ligne. Obtenez le badge « Fiche vérifiée » : un rendez-vous avec Club Propreté et
              quelques questions sur votre activité. La vérification permet aussi de publier des offres d&apos;emploi.
            </p>
            {status === "rejected" && request?.rejectionReason && (
              <p className="mt-1 text-sm font-semibold text-rose-600">
                Demande précédente refusée : {request.rejectionReason}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((open) => !open)}
          className="bento-btn bento-btn-primary shrink-0"
        >
          Demander la vérification {formOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 text-sm font-bold ${message.type === "success" ? "text-emerald-600" : "text-rose-600"}`}
        >
          {message.text}
        </p>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-5 border-t-2 border-slate-100 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="verif-years" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Depuis combien de temps exercez-vous ? *
              </label>
              <input
                id="verif-years"
                className="bento-input w-full"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                placeholder="Ex : 8 ans, depuis 2018…"
                maxLength={120}
                required
              />
            </div>
            <div>
              <label htmlFor="verif-employees" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Combien d&apos;employés ? *
              </label>
              <input
                id="verif-employees"
                className="bento-input w-full"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="Ex : 12 salariés"
                maxLength={60}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="verif-clients" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Vos clients principaux (types, secteurs)
              </label>
              <input
                id="verif-clients"
                className="bento-input w-full"
                value={mainClients}
                onChange={(e) => setMainClients(e.target.value)}
                placeholder="Ex : syndics de copropriété, bureaux, commerces…"
                maxLength={500}
              />
            </div>
            <div>
              <label htmlFor="verif-slot" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Vos disponibilités pour le rendez-vous *
              </label>
              <input
                id="verif-slot"
                className="bento-input w-full"
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                placeholder="Ex : mardi ou jeudi, entre 14h et 17h"
                maxLength={300}
                required
              />
            </div>
            <div>
              <label htmlFor="verif-phone" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Téléphone pour le rendez-vous *
              </label>
              <input
                id="verif-phone"
                type="tel"
                className="bento-input w-full"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                maxLength={30}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="verif-info" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Autres informations utiles
              </label>
              <textarea
                id="verif-info"
                className="bento-input min-h-[90px] w-full resize-none"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Certifications, assurances, références…"
                maxLength={2000}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="bento-btn">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="bento-btn bento-btn-primary disabled:opacity-50">
              {submitting ? "Envoi…" : "Envoyer ma demande"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
