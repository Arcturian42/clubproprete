import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { FounderCard } from "@/components/founder-card";
import { problemPoints } from "@/lib/landing-content";
import {
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  CheckCircle2,
  Building2,
  Briefcase,
  GraduationCap,
  Truck,
  Network,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "À propos — Club Propreté",
  description:
    "Pourquoi nous avons construit Club Propreté : la problématique du secteur, l'idée derrière la plateforme et la mission de l'association.",
};

export default function AProposPage() {
  return (
    <PageShell
      eyebrow="À propos"
      title="Pourquoi on a construit Club Propreté"
      description="Un secteur essentiel, des milliers de professionnels, mais aucun espace structuré pour se trouver, échanger et travailler ensemble. Club Propreté est né de ce constat."
    >
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "À propos" }]} />

      {/* La problématique */}
      <div className="surface p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <AlertTriangle size={22} />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-xl font-black text-slate-900 mb-2">La problématique</h2>
            <p className="text-sm font-semibold leading-6 text-slate-600 mb-4">
              Le secteur de la propreté fonctionne encore largement au bouche-à-oreille. Les acteurs
              existent, les besoins existent, mais rien ne les connecte de manière simple et fiable.
              Au quotidien, cela donne :
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {problemPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm font-semibold text-slate-600">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-amber-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* L'idée */}
      <div className="surface p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Lightbulb size={22} />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-xl font-black text-slate-900 mb-2">L'idée derrière Club Propreté</h2>
            <p className="text-sm font-semibold leading-6 text-slate-600 mb-4">
              Plutôt que d'ajouter un énième outil isolé, nous avons voulu construire la boîte à
              outils gratuite du secteur : un seul endroit où les sociétés de nettoyage, les
              indépendants, les fournisseurs, les organismes de formation et les candidats se
              référencent, se trouvent et travaillent ensemble.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <Building2 size={12} className="mr-1" /> Annuaires
              </span>
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <Briefcase size={12} className="mr-1" /> Emploi
              </span>
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <GraduationCap size={12} className="mr-1" /> Formations
              </span>
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <Truck size={12} className="mr-1" /> Fournisseurs
              </span>
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <BookOpen size={12} className="mr-1" /> Ressources
              </span>
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <Network size={12} className="mr-1" /> Réseau privé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* La mission */}
      <div className="surface p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Target size={22} />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-xl font-black text-slate-900 mb-2">Notre mission</h2>
            <p className="text-sm font-semibold leading-6 text-slate-600 mb-4">
              Structurer et valoriser les métiers de la propreté. Club Propreté est porté par une
              association de professionnels du secteur : la plateforme est gratuite, construite par
              des pros pour des pros, sans appel d'offres public ni intermédiaire opaque. L'objectif
              est simple — permettre aux bons acteurs de se trouver plus facilement et de créer des
              relations de confiance durables.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-[14px] border-2 border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-1">Gratuit</h3>
                <p className="text-sm text-slate-500">
                  Tous les outils ouverts de la plateforme sont accessibles gratuitement.
                </p>
              </div>
              <div className="p-4 rounded-[14px] border-2 border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-1">Par le secteur</h3>
                <p className="text-sm text-slate-500">
                  Une association fondée et animée par des professionnels du nettoyage.
                </p>
              </div>
              <div className="p-4 rounded-[14px] border-2 border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-1">De confiance</h3>
                <p className="text-sm text-slate-500">
                  Des fiches vérifiées et un réseau privé réservé aux membres engagés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Les fondateurs */}
      <div className="surface p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Users size={22} />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-xl font-black text-slate-900 mb-2">Qui est derrière le projet ?</h2>
            <p className="text-sm font-semibold leading-6 text-slate-600 mb-4">
              Club Propreté est une association portée par des professionnels du secteur, fondée par
              Farid Cherif et Olivier Lerendu pour connecter sociétés de nettoyage, indépendants,
              fournisseurs et organismes de formation.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <FounderCard
                name="Farid Cherif"
                role="Co-fondateur de l'association"
                photoSrc="/founders/farid-cherif.jpg"
                linkedinUrl="https://www.linkedin.com/in/farid-cherif/"
              />
              <FounderCard
                name="Olivier Lerendu"
                role="Co-fondateur de l'association"
                photoSrc="/founders/olivier-lerendu.jpg"
                linkedinUrl="https://www.linkedin.com/in/lerenduolivier/"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="surface p-8 text-center bg-indigo-50">
        <h2 className="text-2xl font-black text-slate-900 mb-3">Envie de faire partie de l'aventure ?</h2>
        <p className="text-slate-600 mb-6 max-w-xl mx-auto">
          Créez votre compte gratuitement, référencez votre activité et rejoignez le réseau des
          professionnels de la propreté.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/inscription" className="bento-btn bento-btn-primary">
            Créer un compte gratuit
          </Link>
          <Link href="/association" className="bento-btn">
            Découvrir l'association
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
