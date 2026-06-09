"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck } from "lucide-react";
import { CandidateDashboard } from "@/components/dashboard/candidate-dashboard";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";
import { roleLabels } from "@/lib/auth-demo";
import { dashboards } from "@/lib/seeds";
import type { DashboardSeed, Role } from "@/lib/types";

const roleActions: Record<string, Array<{ label: string; href: string }>> = {
  company_owner: [
    { label: "Publier une offre", href: "/emploi/nouvelle-offre" },
    { label: "Modifier ma fiche", href: "/profil" },
    { label: "Voir mes candidatures", href: "/dashboard" },
  ],
  verified_company: [
    { label: "Publier une offre", href: "/emploi/nouvelle-offre" },
    { label: "Modifier ma fiche", href: "/profil" },
    { label: "Voir mes candidatures", href: "/dashboard" },
  ],
  supplier_owner: [
    { label: "Modifier ma fiche", href: "/profil" },
    { label: "Voir l'annuaire", href: "/annuaire/fournisseurs" },
  ],
  verified_supplier: [
    { label: "Modifier ma fiche", href: "/profil" },
    { label: "Voir l'annuaire", href: "/annuaire/fournisseurs" },
  ],
  independent_profile: [
    { label: "Modifier mon profil", href: "/profil" },
    { label: "Voir les missions", href: "/sous-traitance" },
  ],
  candidate_profile: [
    { label: "Postuler à une offre", href: "/emploi" },
    { label: "Compléter mon CV", href: "/profil" },
    { label: "Voir mes candidatures", href: "/dashboard" },
  ],
  training_organization: [
    { label: "Proposer une formation", href: "/formations" },
    { label: "Modifier mon profil", href: "/profil" },
  ],
  author: [
    { label: "Voir les ressources", href: "/ressources" },
    { label: "Modifier mon profil", href: "/profil" },
  ],
  admin: [
    { label: "Administration", href: "/admin" },
    { label: "Modifier mon profil", href: "/profil" },
  ],
  super_admin: [
    { label: "Administration", href: "/admin" },
    { label: "Gestion utilisateurs", href: "/admin/users" },
    { label: "Modifier mon profil", href: "/profil" },
  ],
  registered_user: [
    { label: "Choisir un profil", href: "/profil" },
    { label: "Compléter mes informations", href: "/profil" },
  ],
};

const fallbackDashboards: Record<string, DashboardSeed> = {
  training_organization: {
    role: "training_organization",
    label: "Espace formation",
    summary: "Référencer vos formations, suivre les validations et recevoir les demandes d'information.",
    actions: [],
    metrics: [
      { label: "Formations", value: "0" },
      { label: "Statut", value: "À compléter" },
      { label: "Demandes", value: "0" },
    ],
  },
  author: {
    role: "author",
    label: "Espace rédaction",
    summary: "Préparer des articles et ressources pour alimenter le média Club Propreté.",
    actions: [],
    metrics: [
      { label: "Brouillons", value: "1" },
      { label: "Publiés", value: "0" },
      { label: "SEO", value: "À faire" },
    ],
  },
  registered_user: {
    role: "registered_user",
    label: "Mon espace",
    summary: "Complétez votre profil pour activer les modules adaptés à votre activité.",
    actions: [],
    metrics: [
      { label: "Profil", value: "20%" },
      { label: "Statut", value: "Inscrit" },
      { label: "Module", value: "À choisir" },
    ],
  },
};

function getDashboardForRole(role: Role) {
  return (
    dashboards.find((dashboard) => dashboard.role === role) ??
    fallbackDashboards[role] ??
    fallbackDashboards.registered_user
  );
}

function getPrimaryHref(role: Role) {
  if (role === "admin" || role === "super_admin") return "/admin";
  if (role === "supplier_owner" || role === "verified_supplier") return "/annuaire/fournisseurs";
  if (role === "independent_profile") return "/independants";
  if (role === "candidate_profile") return "/emploi";
  if (role === "training_organization") return "/formations";
  if (role === "author") return "/ressources";
  return "/annuaire/societes";
}

export function MyDashboard({
  user,
  candidateApplications,
  jobsCount,
  trainingsCount,
}: {
  user: { id: string; role: string; firstName: string; lastName: string; associationMember: boolean; organization: string | null; email: string; phone: string };
  candidateApplications?: Awaited<ReturnType<typeof import("@/lib/actions/jobs").getCandidateApplications>>;
  jobsCount?: number;
  trainingsCount?: number;
}) {
  const dashboard = getDashboardForRole(user.role as Role);
  const primaryHref = getPrimaryHref(user.role as Role);

  if (user.role === "candidate_profile") {
    return <CandidateDashboard user={user} applications={candidateApplications} jobsCount={jobsCount} trainingsCount={trainingsCount} />;
  }

  return (
    <div className="grid gap-6">
      <section className="surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
              {roleLabels[user.role as keyof typeof roleLabels] || user.role}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">{dashboard.label}</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">{dashboard.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.role === "super_admin" ? (
              <span className="bento-tag border-rose-400 bg-rose-100 text-rose-800">
                <ShieldCheck size={13} aria-hidden="true" />
                Super Admin
              </span>
            ) : user.role === "admin" ? (
              <span className="bento-tag border-indigo-400 bg-indigo-100 text-indigo-800">
                <ShieldCheck size={13} aria-hidden="true" />
                Admin
              </span>
            ) : user.associationMember ? (
              <span className="bento-tag border-amber-400 bg-amber-100 text-slate-900">
                <ShieldCheck size={13} aria-hidden="true" />
                Membre association
              </span>
            ) : (
              <span className="bento-tag border-slate-300 bg-slate-50 text-slate-700">Non membre association</span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {dashboard.metrics.map((metric) => (
            <StatCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(roleActions[user.role] || []).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
            >
              {action.label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link href={primaryHref} className="bento-btn bento-btn-primary">
            Continuer <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <EntityCard
          title="Profil"
          subtitle={`${user.firstName} ${user.lastName} · ${user.email}`}
          meta={[roleLabels[user.role as keyof typeof roleLabels] || user.role, user.organization ?? "Structure à compléter"]}
        >
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
            <ClipboardList size={18} aria-hidden="true" />
            Données persistantes V1
          </div>
        </EntityCard>
        <EntityCard
          title="Onboarding"
          subtitle="Complétez les données métier pour passer d'un compte à un profil exploitable."
          meta={["Informations", "Objectifs", "Besoins"]}
        />
        <EntityCard
          title="Validation"
          subtitle="Les badges et accès sensibles seront contrôlés par le back-office admin."
          meta={["Profil", "Association", "Modération"]}
        />
      </div>
    </div>
  );
}
