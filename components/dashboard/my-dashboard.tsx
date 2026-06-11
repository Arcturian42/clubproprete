"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  ClipboardList,
  GraduationCap,
  Hammer,
  Mic,
  Package,
  Settings,
  Shield,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { CandidateDashboard, type CandidateProfileSummary } from "@/components/dashboard/candidate-dashboard";
import { roleLabels } from "@/lib/auth-demo";
import { dashboards } from "@/lib/seeds";
import type { DashboardSeed, Role } from "@/lib/types";

type ActionTileProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

// Tuile d'action : tout le bloc est cliquable, l'intitulé et la description
// disent clairement ce qui va se passer (remplace les anciennes pastilles
// rondes peu lisibles).
function ActionTile({ href, icon: Icon, title, description }: ActionTileProps) {
  return (
    <Link
      href={href}
      className="card-soft group flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 group-hover:text-indigo-700">{title}</p>
        <p className="mt-0.5 text-sm leading-5 text-slate-500">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500"
        aria-hidden="true"
      />
    </Link>
  );
}

function RoleBadge({ user }: { user: { role: string; associationMember: boolean } }) {
  if (user.role === "super_admin") {
    return (
      <span className="tag-soft border-rose-200 bg-rose-50 text-rose-700">
        <ShieldCheck size={13} aria-hidden="true" /> Super Admin
      </span>
    );
  }
  if (user.role === "admin") {
    return (
      <span className="tag-soft border-indigo-200 bg-indigo-50 text-indigo-700">
        <ShieldCheck size={13} aria-hidden="true" /> Admin
      </span>
    );
  }
  if (user.associationMember) {
    return (
      <span className="tag-soft border-amber-200 bg-amber-50 text-amber-700">
        <ShieldCheck size={13} aria-hidden="true" /> Membre association
      </span>
    );
  }
  return null;
}

// Fonctionnalités activables par un compte sans fiche : chaque tuile relance
// l'onboarding avec l'intention correspondante.
const activationTiles: ActionTileProps[] = [
  {
    title: "Créer ma fiche société",
    description: "Annuaire, recrutement, sous-traitance pour votre entreprise de propreté.",
    href: "/onboarding?intent=company",
    icon: Building2,
  },
  {
    title: "Devenir fournisseur",
    description: "Présentez vos produits, machines ou logiciels aux professionnels.",
    href: "/onboarding?intent=supplier",
    icon: Package,
  },
  {
    title: "Créer mon centre de formation",
    description: "Référencez votre organisme et proposez vos formations.",
    href: "/onboarding?intent=training",
    icon: GraduationCap,
  },
  {
    title: "Je suis indépendant",
    description: "Auto-entrepreneur ou sous-traitant : créez votre profil pro.",
    href: "/onboarding?intent=independent",
    icon: Hammer,
  },
  {
    title: "Je cherche un emploi",
    description: "Créez votre profil candidat et postulez aux offres du secteur.",
    href: "/onboarding?intent=job_seeker",
    icon: Briefcase,
  },
  {
    title: "Optimiser mon profil",
    description: "Photo, bio, visibilité : votre profil public façon LinkedIn.",
    href: "/profil",
    icon: UserRound,
  },
];

// Actions principales par rôle, avec une description explicite pour chaque
// destination : on sait où on clique.
const roleTiles: Record<string, ActionTileProps[]> = {
  supplier_owner: [
    {
      title: "Gérer ma fiche fournisseur",
      description: "Catalogue, descriptions, zones de livraison : tout se passe ici.",
      href: "/dashboard/fournisseur",
      icon: Package,
    },
    {
      title: "Publier une offre d'emploi",
      description: "Recrutez des profils techniques ou commerciaux.",
      href: "/emploi/nouvelle-offre",
      icon: Briefcase,
    },
    {
      title: "Proposer une formation",
      description: "Formez les professionnels à vos machines et produits.",
      href: "/formations/nouvelle",
      icon: GraduationCap,
    },
    {
      title: "Média Club Propreté",
      description: "Article, interview, podcast : développez votre notoriété.",
      href: "/dashboard/auteur",
      icon: Mic,
    },
    {
      title: "Mon profil membre",
      description: "Votre profil personnel public sur le réseau.",
      href: "/profil",
      icon: UserRound,
    },
  ],
  training_organization: [
    {
      title: "Gérer mon centre de formation",
      description: "Fiche de l'organisme, certifications, coordonnées.",
      href: "/dashboard/centre-formation",
      icon: GraduationCap,
    },
    {
      title: "Proposer une formation",
      description: "Ajoutez une formation au catalogue Club Propreté.",
      href: "/formations/nouvelle",
      icon: ClipboardList,
    },
    {
      title: "Média Club Propreté",
      description: "Article, interview, podcast : partagez votre expertise.",
      href: "/dashboard/auteur",
      icon: Mic,
    },
    {
      title: "Mon profil membre",
      description: "Votre profil personnel public sur le réseau.",
      href: "/profil",
      icon: UserRound,
    },
  ],
  independent_profile: [
    {
      title: "Voir les missions de sous-traitance",
      description: "Trouvez des missions près de chez vous.",
      href: "/sous-traitance",
      icon: Hammer,
    },
    {
      title: "Mon profil membre",
      description: "Bio, photos, recommandations : soignez votre vitrine.",
      href: "/profil",
      icon: UserRound,
    },
    {
      title: "Média Club Propreté",
      description: "Article, interview, podcast : valorisez votre expertise.",
      href: "/dashboard/auteur",
      icon: Mic,
    },
  ],
  author: [
    {
      title: "Espace rédaction",
      description: "Rédigez et suivez vos articles pour le média.",
      href: "/dashboard/auteur",
      icon: Mic,
    },
    {
      title: "Voir les ressources",
      description: "Guides, outils et articles déjà publiés.",
      href: "/ressources",
      icon: ClipboardList,
    },
    {
      title: "Mon profil membre",
      description: "Votre profil public d'auteur sur le réseau.",
      href: "/profil",
      icon: UserRound,
    },
  ],
  admin: [
    {
      title: "Administration",
      description: "Modération, vérifications, demandes en attente.",
      href: "/admin",
      icon: Shield,
    },
    {
      title: "Mon profil membre",
      description: "Votre profil personnel sur le réseau.",
      href: "/profil",
      icon: UserRound,
    },
  ],
  super_admin: [
    {
      title: "Administration",
      description: "Modération, vérifications, demandes en attente.",
      href: "/admin",
      icon: Shield,
    },
    {
      title: "Gestion des utilisateurs",
      description: "Comptes, rôles et suspensions.",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Mon profil membre",
      description: "Votre profil personnel sur le réseau.",
      href: "/profil",
      icon: UserRound,
    },
  ],
};
roleTiles.verified_supplier = roleTiles.supplier_owner;

const fallbackDashboards: Record<string, DashboardSeed> = {
  training_organization: {
    role: "training_organization",
    label: "Espace formation",
    summary: "Référencer vos formations, suivre les validations et recevoir les demandes d'information.",
    actions: [],
    metrics: [],
  },
  author: {
    role: "author",
    label: "Espace rédaction",
    summary: "Préparer des articles et ressources pour alimenter le média Club Propreté.",
    actions: [],
    metrics: [],
  },
  registered_user: {
    role: "registered_user",
    label: "Mon espace",
    summary: "Complétez votre profil pour activer les modules adaptés à votre activité.",
    actions: [],
    metrics: [],
  },
};

function getDashboardForRole(role: Role) {
  return (
    dashboards.find((dashboard) => dashboard.role === role) ??
    fallbackDashboards[role] ??
    fallbackDashboards.registered_user
  );
}

type CompanyProfile = {
  id?: string;
  slug?: string | null;
  name?: string;
  verificationStatus?: string;
  logoUrl: string | null;
  descriptionShort: string | null;
  descriptionLong: string | null;
  services: { serviceType: string }[];
  website: string | null;
  city: string | null;
  phone: string | null;
  photos: string | null;
} | null;

function computeCompanyScore(company: NonNullable<CompanyProfile>) {
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

  return { score, missing };
}

function ProfileCompletionBanner({ company }: { company: CompanyProfile }) {
  const { score, missing } = company ? computeCompanyScore(company) : { score: 0, missing: [] };
  const suggestions = missing.slice(0, 3);

  if (score >= 100) return null;

  return (
    <section className="card-soft p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">
            Votre fiche est complétée à {score} %
          </h3>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
          {suggestions.length > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              Il manque : <span className="font-medium text-slate-700">{suggestions.join(", ")}</span>
              {missing.length > suggestions.length ? "…" : ""}
            </p>
          )}
        </div>
        <Link href="/dashboard/entreprise" className="btn-soft btn-soft-primary shrink-0">
          Compléter ma fiche
        </Link>
      </div>
    </section>
  );
}

function DashboardHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="card-soft p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{eyebrow}</p>
            {badge}
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2 lg:shrink-0">{actions}</div>}
      </div>
    </section>
  );
}

export function MyDashboard({
  user,
  candidateApplications,
  candidateProfile,
  jobsCount,
  trainingsCount,
  company,
}: {
  user: { id: string; role: string; firstName: string; lastName: string; associationMember: boolean; organization: string | null; email: string; phone: string };
  candidateApplications?: Awaited<ReturnType<typeof import("@/lib/actions/jobs").getCandidateApplications>>;
  candidateProfile?: CandidateProfileSummary | null;
  jobsCount?: number;
  trainingsCount?: number;
  company?: CompanyProfile;
}) {
  const dashboard = getDashboardForRole(user.role as Role);

  if (user.role === "candidate_profile") {
    return <CandidateDashboard user={user} applications={candidateApplications} candidateProfile={candidateProfile} jobsCount={jobsCount} trainingsCount={trainingsCount} />;
  }

  if (user.role === "registered_user") {
    return (
      <div className="space-y-6">
        <DashboardHeader
          eyebrow={roleLabels.registered_user}
          title={`Bienvenue ${user.firstName} !`}
          description="Votre compte est créé. Activez les fonctionnalités adaptées à votre activité : vous pouvez cumuler plusieurs fiches (société, fournisseur, formation) en plus de votre profil personnel."
          actions={
            <Link href="/onboarding" className="btn-soft btn-soft-primary">
              Reprendre l&apos;onboarding <ArrowRight size={15} aria-hidden="true" />
            </Link>
          }
        />

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Que voulez-vous faire ?
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activationTiles.map((tile) => (
              <ActionTile key={tile.title} {...tile} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isCompanyRole = user.role === "company_owner" || user.role === "verified_company";

  if (isCompanyRole) {
    const companyName = company?.name || user.organization || "Mon entreprise";
    const publicSheetHref = company ? `/annuaire/societes/${company.slug ?? company.id}` : null;
    const isVerified = company?.verificationStatus === "approved";

    const companyTiles: ActionTileProps[] = [
      {
        title: "Gérer ma fiche entreprise",
        description: "Logo, description, services, photos : votre vitrine dans l'annuaire.",
        href: "/dashboard/entreprise",
        icon: Building2,
      },
      {
        title: "Publier une offre d'emploi",
        description: isVerified
          ? "Diffusez une offre auprès des candidats du secteur."
          : "Réservé aux fiches vérifiées : demandez la vérification depuis votre fiche.",
        href: isVerified ? "/emploi/nouvelle-offre" : "/dashboard/entreprise",
        icon: Briefcase,
      },
      {
        title: "Mes offres & candidatures",
        description: "Suivez vos offres publiées et les candidatures reçues.",
        href: "/dashboard/entreprise/offres",
        icon: Users,
      },
      {
        title: "Proposer une formation",
        description: "Partagez une formation avec les professionnels du réseau.",
        href: "/formations/nouvelle",
        icon: GraduationCap,
      },
      {
        title: "Média Club Propreté",
        description: "Article, interview, podcast : développez votre notoriété.",
        href: "/dashboard/auteur",
        icon: Mic,
      },
      user.associationMember
        ? {
            title: "Espace association",
            description: "Missions de sous-traitance, entraide, réseau membre.",
            href: "/association",
            icon: Shield,
          }
        : {
            title: "Devenir membre de l'association",
            description: "Sous-traitance, événements, accompagnement : rejoignez le réseau.",
            href: "/association/adhesion",
            icon: Shield,
          },
      {
        title: "Mon profil membre",
        description: "Votre profil personnel public, distinct de la fiche entreprise.",
        href: "/profil",
        icon: UserRound,
      },
    ];

    return (
      <div className="space-y-6">
        <DashboardHeader
          eyebrow={roleLabels[user.role as keyof typeof roleLabels] || user.role}
          title={companyName}
          description={`Bonjour ${user.firstName}. Gérez votre fiche, vos offres et votre visibilité sur le réseau depuis cet espace.`}
          badge={
            <span className="flex flex-wrap items-center gap-2">
              {isVerified && (
                <span className="tag-soft border-emerald-200 bg-emerald-50 text-emerald-700">
                  <BadgeCheck size={13} aria-hidden="true" /> Fiche vérifiée
                </span>
              )}
              <RoleBadge user={user} />
            </span>
          }
          actions={
            <>
              {publicSheetHref && (
                <Link href={publicSheetHref} className="btn-soft">
                  Voir ma fiche publique
                </Link>
              )}
              <Link href="/dashboard/entreprise" className="btn-soft btn-soft-primary">
                <Settings size={15} aria-hidden="true" /> Gérer ma fiche
              </Link>
            </>
          }
        />

        <ProfileCompletionBanner company={company ?? null} />

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Vos actions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {companyTiles.map((tile) => (
              <ActionTile key={tile.title} {...tile} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tiles = roleTiles[user.role] ?? [
    {
      title: "Compléter mes informations",
      description: "Votre profil personnel sur le réseau.",
      href: "/profil",
      icon: UserRound,
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        eyebrow={roleLabels[user.role as keyof typeof roleLabels] || user.role}
        title={dashboard.label}
        description={dashboard.summary}
        badge={<RoleBadge user={user} />}
      />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Vos actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {tiles.map((tile) => (
            <ActionTile key={tile.title} {...tile} />
          ))}
        </div>
      </div>
    </div>
  );
}
