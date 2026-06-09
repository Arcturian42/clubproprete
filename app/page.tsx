import Link from "next/link";
import { ArrowRight, CheckCircle2, Database, LockKeyhole, UsersRound } from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";
import { personas } from "@/lib/seeds";
import { getPublishedCompanies } from "@/lib/actions/companies";
import { getPublishedJobs } from "@/lib/actions/jobs";
import { getPublishedSuppliers } from "@/lib/actions/suppliers";
import { getPublishedTrainings } from "@/lib/actions/trainings";
import { getPublishedSubcontractingMissions } from "@/lib/actions/subcontracting";

const operatingRules = [
  "Tout est gratuit en V0",
  "Verification des profils pour la confiance",
  "Sous-traitance reservee aux membres association",
  "Aucun paiement, appel d'offres ou achat groupe"
];

export default async function HomePage() {
  const [{ total: companiesCount }, { total: jobsCount }, { total: suppliersCount }, { total: trainingsCount }, missions] = await Promise.all([
    getPublishedCompanies(),
    getPublishedJobs(),
    getPublishedSuppliers(),
    getPublishedTrainings(),
    getPublishedSubcontractingMissions(),
  ]);

  const missionsCount = missions.length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface p-6 sm:p-8">
          <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">MVP V0</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-5xl">
            La boite a outils gratuite des professionnels du nettoyage
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-500">
            Annuaire, fournisseurs, emploi, formations, association et sous-traitance privee : ce projet pose les
            parcours essentiels avant branchement sur la base de donnees de production, le domaine et le serveur.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/inscription" className="bento-btn bento-btn-primary">
              Créer un compte <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/connexion" className="bento-btn">
              Connexion
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Personas couverts" value={String(personas.length)} detail="Visiteur, metiers, admin" />
          <StatCard label="Societes" value={String(companiesCount)} detail="Annuaire public" />
          <StatCard label="Fournisseurs" value={String(suppliersCount)} detail="Annuaire public" />
          <StatCard label="Missions privees" value={String(missionsCount)} detail="Membres uniquement" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {operatingRules.map((rule) => (
          <div key={rule} className="surface flex items-center gap-3 p-4">
            <CheckCircle2 className="text-indigo-600" size={20} aria-hidden="true" />
            <p className="text-sm font-extrabold text-slate-900">{rule}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {personas.map((persona) => (
          <EntityCard key={persona.key} title={persona.name} subtitle={persona.goal} meta={[persona.workflow]}>
            <Link href={persona.href} className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
              {persona.cta} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </EntityCard>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <EntityCard title="Data-first" subtitle="Les formulaires et statuts collectent la donnee qualifiee." meta={[`${trainingsCount} formations`, `${jobsCount} offres`]}>
          <Database className="text-indigo-600" size={24} aria-hidden="true" />
        </EntityCard>
        <EntityCard title="Confiance" subtitle="Les badges et verifications protegent les zones sensibles." meta={["Societes", "Fournisseurs", "Association"]}>
          <LockKeyhole className="text-indigo-600" size={24} aria-hidden="true" />
        </EntityCard>
        <EntityCard title="Reseau" subtitle="Le module association structure la sous-traitance entre membres verifies." meta={["Membres", "Missions", "Candidatures"]}>
          <UsersRound className="text-indigo-600" size={24} aria-hidden="true" />
        </EntityCard>
      </div>
    </section>
  );
}
