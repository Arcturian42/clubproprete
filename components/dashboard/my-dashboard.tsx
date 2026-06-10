"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, Building2, Briefcase, Shield, Mic, Package, GraduationCap, Hammer } from "lucide-react";
import { CandidateDashboard } from "@/components/dashboard/candidate-dashboard";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";
import { roleLabels } from "@/lib/auth-demo";
import { dashboards } from "@/lib/seeds";
import type { DashboardSeed, Role } from "@/lib/types";

const roleActions: Record<string, Array<{ label: string; href: string }>> = {
  company_owner: [
    { label: "Publier une offre", href: "/emploi/nouvelle-offre" },
    { label: "Proposer une formation", href: "/formations/nouvelle" },
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Modifier ma fiche", href: "/dashboard/entreprise" },
    { label: "Voir mes candidatures", href: "/dashboard/entreprise" },
  ],
  verified_company: [
    { label: "Publier une offre", href: "/emploi/nouvelle-offre" },
    { label: "Proposer une formation", href: "/formations/nouvelle" },
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Modifier ma fiche", href: "/dashboard/entreprise" },
    { label: "Voir mes candidatures", href: "/dashboard/entreprise" },
  ],
  supplier_owner: [
    { label: "Publier une offre", href: "/emploi/nouvelle-offre" },
    { label: "Proposer une formation", href: "/formations/nouvelle" },
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Modifier ma fiche", href: "/dashboard/fournisseur" },
    { label: "Voir l'annuaire", href: "/annuaire/fournisseurs" },
  ],
  verified_supplier: [
    { label: "Publier une offre", href: "/emploi/nouvelle-offre" },
    { label: "Proposer une formation", href: "/formations/nouvelle" },
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Modifier ma fiche", href: "/dashboard/fournisseur" },
    { label: "Voir l'annuaire", href: "/annuaire/fournisseurs" },
  ],
  independent_profile: [
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Modifier mon profil", href: "/profil" },
    { label: "Voir les missions", href: "/sous-traitance" },
  ],
  candidate_profile: [
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Postuler à une offre", href: "/emploi" },
    { label: "Compléter mon CV", href: "/profil" },
    { label: "Voir mes candidatures", href: "/dashboard" },
  ],
  training_organization: [
    { label: "Gérer mon centre", href: "/dashboard/centre-formation" },
    { label: "Proposer une formation", href: "/formations/nouvelle" },
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Modifier mon profil", href: "/profil" },
  ],
  author: [
    { label: "Espace auteur", href: "/dashboard/auteur" },
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
    { label: "Reprendre l'onboarding", href: "/onboarding" },
    { label: "Espace auteur", href: "/dashboard/auteur" },
    { label: "Compléter mes informations", href: "/profil" },
  ],
};

// Fonctionnalités activables par un compte sans fiche : chaque carte relance
// l'onboarding avec l'intention correspondante.
const activationCards = [
  {
    title: "Créer ma fiche société",
    subtitle: "Annuaire, recrutement, sous-traitance pour votre entreprise de propreté.",
    href: "/onboarding?intent=company",
    icon: Building2,
  },
  {
    title: "Devenir fournisseur",
    subtitle: "Présentez vos produits, machines ou logiciels aux professionnels.",
    href: "/onboarding?intent=supplier",
    icon: Package,
  },
  {
    title: "Créer mon centre de formation",
    subtitle: "Référencez votre organisme et proposez vos formations.",
    href: "/onboarding?intent=training",
    icon: GraduationCap,
  },
  {
    title: "Je suis indépendant",
    subtitle: "Auto-entrepreneur ou sous-traitant : créez votre profil pro.",
    href: "/onboarding?intent=independent",
    icon: Hammer,
  },
  {
    title: "Je cherche un emploi",
    subtitle: "Créez votre profil candidat et postulez aux offres du secteur.",
    href: "/onboarding?intent=job_seeker",
    icon: Briefcase,
  },
];

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

type CompanyProfile = {
  logoUrl: string | null;
  descriptionShort: string | null;
  descriptionLong: string | null;
  services: { serviceType: string }[];
  website: string | null;
  city: string | null;
  phone: string | null;
  photos: string | null;
} | null;

function ProfileCompletionBanner({
  company,
}: {
  company: CompanyProfile;
}) {
  if (!company) {
    return (
      <section className="surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900">Votre fiche est complétée à 0%</h3>
            <div className="mt-3 h-3 w-full rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-indigo-600" style={{ width: "0%" }} />
            </div>
          </div>
          <div className="shrink-0">
            <Link href="/dashboard/entreprise" className="bento-btn bento-btn-primary">
              Compléter ma fiche
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const photos = company.photos ? (JSON.parse(company.photos) as string[]) : [];

  let score = 0;
  const missing: string[] = [];

  if (company.logoUrl) score += 20; else missing.push("Logo");
  if (company.descriptionShort) score += 15; else missing.push("Description courte");
  if (company.descriptionLong) score += 15; else missing.push("Description longue");
  if (company.services.length > 0) score += 15; else missing.push("Services");
  if (company.website) score += 10; else missing.push("Site web");
  if (company.city) score += 10; else missing.push("Ville");
  if (company.phone) score += 10; else missing.push("Téléphone");
  if (photos.length > 0) score += 5; else missing.push("Photos");

  const recommendations = missing.slice(0, 3);

  return (
    <section className="surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-900">Votre fiche est complétée à {score}%</h3>
          <div className="mt-3 h-3 w-full rounded-full bg-slate-200">
            <div className="h-3 rounded-full bg-indigo-600 transition-all" style={{ width: `${score}%` }} />
          </div>
          {recommendations.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Actions recommandées :</span>
              {recommendations.map((rec) => (
                <Link
                  key={rec}
                  href="/dashboard/entreprise"
                  className="bento-tag border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                >
                  + {rec}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0">
          <Link href="/dashboard/entreprise" className="bento-btn bento-btn-primary">
            Compléter ma fiche
          </Link>
        </div>
      </div>
    </section>
  );
}

function MediaCard({
  user,
}: {
  user: { role: string; firstName: string; lastName: string; organization: string | null };
}) {
  const isCompany = user.role === "company_owner" || user.role === "verified_company";
  const name = isCompany
    ? user.organization || `${user.firstName} ${user.lastName}`
    : `${user.firstName} ${user.lastName}`;

  const subtitle = isCompany
    ? "Développez votre notoriété dans le secteur de la propreté"
    : user.role === "supplier_owner" || user.role === "verified_supplier"
    ? "Faites connaître vos produits et services"
    : "Valorisez votre expertise et trouvez de nouvelles missions";

  const mailto = (subject: string) =>
    `mailto:contact@clubproprete.com?subject=${encodeURIComponent(`${subject} - ${name}`)}`;

  return (
    <EntityCard
      title="Média Club Propreté"
      subtitle={subtitle}
      meta={["Article", "Interview", "Podcast", "Vidéo"]}
    >
      <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600 mb-3">
        <Mic size={18} aria-hidden="true" />
        Média Club Propreté
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/dashboard/auteur"
          className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer text-center"
        >
          Devenir auteur
        </Link>
        <a
          href={mailto("Demande d'interview")}
          className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer text-center"
        >
          Demander une interview
        </a>
        <a
          href={mailto("Demande de participation au podcast")}
          className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer text-center"
        >
          Rejoindre le podcast
        </a>
        <a
          href={mailto("Demande de participation à une vidéo YouTube")}
          className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer text-center"
        >
          Vidéo YouTube
        </a>
      </div>
    </EntityCard>
  );
}

export function MyDashboard({
  user,
  candidateApplications,
  jobsCount,
  trainingsCount,
  company,
}: {
  user: { id: string; role: string; firstName: string; lastName: string; associationMember: boolean; organization: string | null; email: string; phone: string };
  candidateApplications?: Awaited<ReturnType<typeof import("@/lib/actions/jobs").getCandidateApplications>>;
  jobsCount?: number;
  trainingsCount?: number;
  company?: CompanyProfile;
}) {
  const dashboard = getDashboardForRole(user.role as Role);
  const primaryHref = getPrimaryHref(user.role as Role);

  if (user.role === "candidate_profile") {
    return <CandidateDashboard user={user} applications={candidateApplications} jobsCount={jobsCount} trainingsCount={trainingsCount} />;
  }

  if (user.role === "registered_user") {
    return (
      <div className="grid gap-6">
        <section className="surface p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
                {roleLabels.registered_user}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Bienvenue {user.firstName} !</h2>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                Votre compte est créé. Activez les fonctionnalités adaptées à votre activité : vous pouvez
                cumuler plusieurs fiches (société, fournisseur, formation) en plus de votre profil personnel.
              </p>
            </div>
            <Link href="/onboarding" className="bento-btn bento-btn-primary shrink-0">
              Reprendre l&apos;onboarding <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(roleActions.registered_user || []).map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          {activationCards.map((card) => {
            const Icon = card.icon;
            return (
              <EntityCard key={card.title} title={card.title} subtitle={card.subtitle}>
                <Link href={card.href} className="bento-btn bento-btn-primary w-full block text-center">
                  <Icon size={16} className="inline mr-2" /> Activer
                </Link>
              </EntityCard>
            );
          })}
          <EntityCard
            title="Optimiser mon profil"
            subtitle="Photo, bio, visibilité : votre profil public façon LinkedIn."
          >
            <Link href="/profil" className="bento-btn bento-btn-primary w-full block text-center">
              <ClipboardList size={16} className="inline mr-2" /> Compléter mon profil
            </Link>
          </EntityCard>
        </div>
      </div>
    );
  }

  const isCompanyRole = user.role === "company_owner" || user.role === "verified_company";

  if (isCompanyRole) {
    return (
      <div className="grid gap-6">
        <ProfileCompletionBanner company={company ?? null} />

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
              ) : null}
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
            title="Optimiser ma fiche"
            subtitle="Améliorez votre visibilité dans l'annuaire"
            meta={["Logo", "Description", "Services"]}
          >
            <Link href="/dashboard/entreprise" className="bento-btn bento-btn-primary w-full block text-center">
              <Building2 size={16} className="inline mr-2" /> Modifier ma fiche
            </Link>
          </EntityCard>

          <EntityCard
            title="Recrutement"
            subtitle="Publiez une offre et trouvez des candidats"
            meta={["Offres actives", "Candidatures reçues"]}
          >
            <Link href="/emploi/nouvelle-offre" className="bento-btn bento-btn-primary w-full block text-center">
              <Briefcase size={16} className="inline mr-2" /> Publier une offre
            </Link>
          </EntityCard>

          <MediaCard user={user} />

          {user.associationMember ? (
            <EntityCard
              title="Association"
              subtitle="Accédez au réseau d'entraide"
              meta={["Missions", "WhatsApp", "Subventions"]}
            >
              <Link href="/association" className="bento-btn bento-btn-primary w-full block text-center">
                <Shield size={16} className="inline mr-2" /> Espace association
              </Link>
            </EntityCard>
          ) : (
            <EntityCard
              title="Devenir membre"
              subtitle="Rejoignez le réseau exclusif Club Propreté"
              meta={["Sous-traitance", "Événements", "Accompagnement"]}
            >
              <Link href="/association/adhesion" className="bento-btn bento-btn-primary w-full block text-center">
                <Shield size={16} className="inline mr-2" /> Demander l'adhésion
              </Link>
            </EntityCard>
          )}
        </div>
      </div>
    );
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
        {(user.role === "supplier_owner" || user.role === "verified_supplier" || user.role === "independent_profile") && (
          <MediaCard user={user} />
        )}
      </div>
    </div>
  );
}
