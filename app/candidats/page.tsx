import Link from "next/link";
import { BriefcaseBusiness, ShieldCheck, UserRoundPlus } from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";

export const metadata = {
  title: "Candidats — Trouvez un emploi dans la propreté",
  description:
    "Créez votre profil candidat gratuit sur Club Propreté : profil privé par défaut, candidature réutilisable et accès recruteur contrôlé pour les métiers du nettoyage.",
  alternates: { canonical: "/candidats" },
};

const candidatePrinciples = [
  {
    title: "Profil privé par défaut",
    description:
      "Vos informations personnelles ne sont pas listées publiquement et ne sont partagées qu'avec les recruteurs autorisés.",
    icon: ShieldCheck,
  },
  {
    title: "Candidature réutilisable",
    description:
      "Renseignez votre parcours une fois, puis postulez aux offres qui vous intéressent sans ressaisir votre CV.",
    icon: UserRoundPlus,
  },
  {
    title: "Accès recruteur contrôlé",
    description:
      "Une entreprise consulte votre profil uniquement si vous avez candidaté à l'une de ses offres.",
    icon: BriefcaseBusiness,
  },
];

export default function CandidatesPage() {
  return (
    <PageShell
      eyebrow="Candidats"
      title="Créez votre profil candidat"
      description="Club Propreté protège les profils candidats : pas d'annuaire nominatif public, seulement des candidatures choisies."
      actions={
        <Link href="/inscription?role=candidate_profile" className="bento-btn bento-btn-primary">
          Créer mon profil candidat
        </Link>
      }
    >
      <div className="surface p-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold leading-7 text-slate-600">
            Votre profil sert de CV vivant pour postuler aux offres du secteur propreté. Il reste privé tant que
            vous ne candidatez pas auprès d'une société.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/emploi" className="bento-btn">
              Voir les offres
            </Link>
            <Link href="/profil" className="bento-btn">
              Compléter mon profil
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {candidatePrinciples.map((principle) => {
          const Icon = principle.icon;
          return (
            <EntityCard key={principle.title} title={principle.title} subtitle="Confidentialité candidat">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border-2 border-slate-900 bg-indigo-50 p-3 text-indigo-700">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold leading-6 text-slate-600">{principle.description}</p>
              </div>
            </EntityCard>
          );
        })}
      </div>
    </PageShell>
  );
}
