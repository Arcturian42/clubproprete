"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  MessageSquareText,
} from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";

export type ApplicationWithJob = {
  id: string;
  status: string;
  createdAt: Date;
  message: string | null;
  job: {
    title: string;
    city: string | null;
    contractType: string;
    company: { name: string } | null;
  };
};

const statusLabelMap: Record<string, string> = {
  submitted: "Envoyée",
  sent: "Envoyée",
  viewed: "Vue",
  response_received: "Réponse reçue",
  interview: "Entretien",
  rejected: "Refusée",
  accepted: "Acceptée",
};

const statusClassMap: Record<string, string> = {
  submitted: "border-slate-300 bg-slate-50 text-slate-700",
  sent: "border-slate-300 bg-slate-50 text-slate-700",
  viewed: "border-indigo-200 bg-indigo-50 text-indigo-700",
  response_received: "border-amber-400 bg-amber-100 text-slate-900",
  interview: "border-emerald-400 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-400 bg-rose-50 text-rose-700",
  accepted: "border-emerald-400 bg-emerald-50 text-emerald-700",
};

export type CandidateProfileSummary = {
  city: string | null;
  desiredContracts: string | null;
  experienceYears: number | null;
  bio: string | null;
  cvUrl: string | null;
  mobilityRadius: number | null;
};

// Score de complétion calculé sur les champs réellement renseignés du profil
// candidat (une seule source de vérité, pas de valeur factice).
function computeProfileScore(profile: CandidateProfileSummary | null | undefined) {
  if (!profile) return 0;
  let score = 0;
  if (profile.city) score += 15;
  if (profile.desiredContracts) score += 15;
  if (profile.experienceYears !== null) score += 15;
  if (profile.bio) score += 25;
  if (profile.cvUrl) score += 20;
  if (profile.mobilityRadius !== null) score += 10;
  return score;
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

// Liste des candidatures de l'utilisateur, réutilisée par le dashboard
// candidat et par les dashboards des autres rôles (tout utilisateur peut
// postuler aux offres, quel que soit son rôle).
export function ApplicationsList({ applications }: { applications: ApplicationWithJob[] }) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Vous n&apos;avez pas encore de candidatures.</p>
        <Link href="/emploi" className="bento-btn bento-btn-primary mt-4 inline-block">
          Voir les offres
        </Link>
      </div>
    );
  }

  return (
    <>
      {applications.map((application) => (
        <div key={application.id} className="border-t-2 border-slate-900 pt-4 first:border-t-0 first:pt-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-black text-slate-900">{application.job.title}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {application.job.company?.name || "Entreprise"} · {application.job.city || ""} · {application.job.contractType}
              </p>
            </div>
            <span className={`bento-tag ${statusClassMap[application.status] || statusClassMap.sent}`}>
              {statusLabelMap[application.status] || "Envoyée"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="bento-tag border-slate-300 bg-slate-50 text-slate-700">
              Candidaté le {formatDate(application.createdAt)}
            </span>
            {application.message ? (
              <span className="bento-tag border-amber-400 bg-amber-100 text-slate-900">
                <MessageSquareText size={13} aria-hidden="true" />
                Message joint
              </span>
            ) : null}
          </div>
          {application.message ? (
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{application.message}</p>
          ) : null}
        </div>
      ))}
    </>
  );
}

export function CandidateDashboard({
  user,
  applications,
  candidateProfile,
  jobsCount,
  trainingsCount,
}: {
  user: { id: string; firstName: string; lastName: string; organization: string | null; email: string; phone: string };
  applications?: ApplicationWithJob[];
  candidateProfile?: CandidateProfileSummary | null;
  jobsCount?: number;
  trainingsCount?: number;
}) {
  const realApplications = applications ?? [];
  const candidateCity = candidateProfile?.city || user.organization || "";
  const responseCount = realApplications.filter((a) =>
    ["response_received", "interview", "rejected", "accepted"].includes(a.status)
  ).length;
  const profileScore = computeProfileScore(candidateProfile);
  const desiredContracts = candidateProfile?.desiredContracts
    ? candidateProfile.desiredContracts.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  return (
    <div className="grid gap-6">
      <section className="surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Dashboard candidat</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Bonjour {user.firstName}</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Suivez vos candidatures, vos réponses, vos formations et les opportunités qui peuvent améliorer votre
              profil dans la propreté.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidateCity && (
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">{candidateCity}</span>
            )}
            <span className="bento-tag border-slate-300 bg-slate-50 text-slate-700">Disponible</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <StatCard label="Candidatures" value={String(realApplications.length)} detail="Suivi actif" />
          <StatCard label="Réponses" value={String(responseCount)} detail="Retours recruteurs" />
          <StatCard label="Formations" value={String(trainingsCount ?? 0)} detail="Disponibles" />
          <StatCard label="Profil" value={`${profileScore}%`} detail={profileScore >= 80 ? "Complet" : "À compléter"} />
        </div>

        <div className="mt-6">
          <div className="h-4 overflow-hidden rounded-full border-2 border-slate-900 bg-white shadow-[2px_2px_0px_#0f172a]">
            <div className="h-full bg-indigo-600" style={{ width: `${profileScore}%` }} />
          </div>
          {desiredContracts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {desiredContracts.map((contract) => (
                <span key={contract} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                  {contract}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <Bot size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Brief IA</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Votre prochaine meilleure action</h2>
            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-500">
              Votre profil est déjà crédible pour le tertiaire. Pour augmenter vos réponses, ajoutez une formation
              technique et ciblez les offres locales avant les postes hors région.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <EntityCard
            title="Formation recommandée"
            subtitle="À venir en V1.1"
            meta={["Technique", "Impact profil +12%"]}
          >
            <Link href="/formations" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
              Voir les formations <GraduationCap size={16} aria-hidden="true" />
            </Link>
          </EntityCard>
          <EntityCard
            title="Offre recommandée"
            subtitle={`Opportunité emploi`}
            meta={[candidateCity, "CDI"]}
          >
            <Link href="/emploi" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
              Voir les offres <BriefcaseBusiness size={16} aria-hidden="true" />
            </Link>
          </EntityCard>
          <EntityCard
            title="Connexions"
            subtitle="À venir en V1.1"
            meta={["Réseau régional", "Même niveau"]}
          >
            <p className="text-sm font-semibold leading-6 text-slate-500">Les relations entre candidats arrivent bientôt.</p>
          </EntityCard>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface p-6">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="text-indigo-600" size={22} aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-900">Mes candidatures</h2>
          </div>
          <div className="mt-5 grid gap-4">
            <ApplicationsList applications={realApplications} />
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={22} aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-900">Formations et profil</h2>
          </div>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[16px] border-2 border-slate-900 bg-white p-4">
              <p className="font-black text-slate-900">Formations suivies</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">À venir en V1.1</p>
            </div>
            <div className="rounded-[16px] border-2 border-slate-900 bg-white p-4">
              <p className="font-black text-slate-900">Formations recommandées</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">À venir en V1.1</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
