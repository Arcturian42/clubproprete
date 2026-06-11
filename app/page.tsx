import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { ArrowRight, CheckCircle2, ChevronDown, Crown, FileText, Handshake, Rocket, Sparkles } from "lucide-react";
import { getPublishedCompanies } from "@/lib/actions/companies";
import { getPublishedJobs } from "@/lib/actions/jobs";
import { getPublishedSuppliers } from "@/lib/actions/suppliers";
import { getPublishedTrainings } from "@/lib/actions/trainings";
import {
  accountBenefits,
  associationPerks,
  audiences,
  faq,
  features,
  fieldRealities,
  levels,
  problemPoints,
  reasons,
  resourceTags,
  steps,
  subcontractingPerks,
} from "@/lib/landing-content";

// Police display réservée à la landing : chargée ici (next/font) pour ne pas
// alourdir les autres pages.
const displayFont = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });

// Accents alternés des cartes (color blocking) : chip / icône assortis.
const cardAccents = [
  { chip: "bg-indigo-50", icon: "text-indigo-600" },
  { chip: "bg-amber-50", icon: "text-amber-600" },
  { chip: "bg-emerald-50", icon: "text-emerald-600" },
] as const;

// Les compteurs viennent de la base, indisponible au moment du build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ total: companiesCount }, { total: jobsCount }, { total: suppliersCount }, { total: trainingsCount }] =
    await Promise.all([
      getPublishedCompanies(),
      getPublishedJobs(),
      getPublishedSuppliers(),
      getPublishedTrainings(),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="surface relative overflow-hidden p-6 sm:p-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-2 border-slate-900 bg-indigo-50"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-2 top-28 h-20 w-20 rotate-12 rounded-2xl border-2 border-slate-900 bg-amber-300"
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="bento-tag -rotate-1 border-indigo-600 bg-indigo-50 text-indigo-700">
              <Sparkles size={12} aria-hidden="true" /> Club professionnel gratuit
            </span>
            <h1
              className={`${displayFont.className} mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl`}
            >
              Club{" "}
              <span className="relative inline-block">
                <span
                  className="absolute inset-x-0 bottom-1 -z-10 h-4 -rotate-1 bg-amber-300 sm:h-6"
                  aria-hidden="true"
                />
                Propreté
              </span>
            </h1>
            <p className={`${displayFont.className} mt-3 text-xl font-bold text-indigo-600 sm:text-2xl`}>
              Le club professionnel gratuit de la propreté
            </p>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600">
              Annuaire, emploi, formations, ressources, fournisseurs et réseau privé : Club Propreté rassemble les
              outils essentiels pour aider les professionnels du nettoyage à gagner en visibilité, recruter, se former,
              trouver les bons partenaires et développer leur activité.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/inscription" className="bento-btn bento-btn-primary">
                Créer mon compte gratuit <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/association" className="bento-btn">
                Découvrir l'association
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {["Gratuit à l'inscription", "Pensé pour les pros du terrain", "Accès associatif sur candidature"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <CheckCircle2 size={16} className="text-indigo-600" aria-hidden="true" /> {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          {companiesCount >= 10 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <StatTile value={String(companiesCount)} label="Sociétés référencées" tone="!bg-indigo-50" tilt="-rotate-1" />
              <StatTile value={String(suppliersCount)} label="Fournisseurs" tone="!bg-amber-50" tilt="rotate-1" />
              <StatTile value={String(jobsCount)} label="Offres d'emploi" tone="!bg-emerald-50" tilt="rotate-1" />
              <StatTile value={String(trainingsCount)} label="Formations" tone="!bg-white" tilt="-rotate-1" />
            </div>
          ) : (
            <div className="bento-card rotate-1 p-6">
              <div className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-2xl border-2 border-slate-900 bg-amber-300">
                <Rocket size={22} className="text-slate-900" aria-hidden="true" />
              </div>
              <h2 className={`${displayFont.className} mt-4 text-xl font-bold text-slate-900`}>
                La plateforme ouvre ses portes
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Club Propreté est en phase de lancement : les premières sociétés, fournisseurs et organismes de
                formation rejoignent l&apos;annuaire en ce moment.
              </p>
              <p className="mt-3 text-sm font-bold text-slate-900">
                Inscrivez-vous maintenant pour faire partie des membres fondateurs et profiter d&apos;une
                visibilité maximale dès l&apos;ouverture.
              </p>
              <Link href="/inscription" className="bento-btn bento-btn-accent mt-5">
                Devenir membre fondateur <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* PROBLÈME */}
      <section className="mt-12">
        <SectionTitle eyebrow="Le constat" title="La propreté est un secteur essentiel. Mais encore trop fragmenté." />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="bento-card p-6">
            <p className="text-base font-medium leading-7 text-slate-600">
              Chaque jour, les professionnels de la propreté assurent le bon fonctionnement des bureaux, commerces,
              immeubles, écoles, hôtels, sites industriels, établissements de santé et lieux publics. Pourtant, le
              secteur reste encore trop dispersé.
            </p>
            <p className="mt-4 text-base font-bold leading-7 text-slate-900">
              Club Propreté répond à un besoin simple : créer un point de rencontre clair, utile et professionnel pour
              tous les acteurs de la propreté. Un seul espace pour se rendre visible, trouver des opportunités et
              accéder aux ressources du secteur.
            </p>
          </div>
          <ul className="grid gap-3">
            {problemPoints.map((item) => (
              <li key={item} className="bento-card flex items-start gap-3 border-l-8 border-l-amber-400 p-4">
                <ArrowRight size={18} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ÉCOSYSTÈME / FEATURES */}
      <section className="mt-14">
        <SectionTitle
          eyebrow="La plateforme"
          title="Tout l'écosystème de la propreté au même endroit"
          subtitle="Pas seulement un annuaire. Pas seulement un média. Pas seulement un job board. Une plateforme professionnelle gratuite qui regroupe les outils utiles au quotidien pour structurer, développer et connecter le secteur."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, meta }, index) => {
            const accent = cardAccents[index % cardAccents.length];
            return (
              <article key={title} className="bento-card bento-card-interactive flex flex-col p-6">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-900 ${accent.chip}`}
                >
                  <Icon size={22} className={accent.icon} aria-hidden="true" />
                </div>
                <h3 className={`${displayFont.className} mt-4 text-lg font-bold text-slate-900`}>{title}</h3>
                <p className="mt-2 flex-1 text-sm font-medium leading-6 text-slate-600">{description}</p>
                <p className="mt-4 border-t-2 border-slate-900 pt-3 text-xs font-extrabold uppercase tracking-wide text-indigo-600">
                  {meta}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* INSCRIPTION GRATUITE */}
      <section className="mt-14">
        <div className="surface grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionTitle
              eyebrow="Compte gratuit"
              title="Inscrivez-vous gratuitement et accédez aux outils du secteur"
              subtitle="Créer un compte vous permet de rejoindre l'écosystème et d'utiliser les fonctionnalités ouvertes de la plateforme."
            />
            <Link href="/inscription" className="bento-btn bento-btn-primary mt-6">
              Créer mon compte gratuit <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {accountBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-700">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="mt-14">
        <SectionTitle eyebrow="Pour qui ?" title="Un espace utile pour chaque acteur de la propreté" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map(({ icon: Icon, title, description }, index) => {
            const accent = cardAccents[index % cardAccents.length];
            return (
              <article key={title} className="bento-card bento-card-interactive p-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-900 ${accent.chip}`}
                  >
                    <Icon size={20} className={accent.icon} aria-hidden="true" />
                  </div>
                  <h3 className={`${displayFont.className} text-base font-bold leading-tight text-slate-900`}>
                    {title}
                  </h3>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ASSOCIATION */}
      <section className="mt-14">
        <div className="surface p-6 sm:p-10" style={{ background: "#0f172a" }}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="bento-tag -rotate-1 border-amber-400 bg-amber-400 text-slate-900">
                <Crown size={12} aria-hidden="true" /> Réseau associatif
              </span>
              <h2
                className={`${displayFont.className} mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl`}
              >
                Allez plus loin avec l'association Club Propreté
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-slate-300">
                ClubPropreté.com est ouvert et gratuit. Mais les professionnels qui souhaitent aller plus loin peuvent
                candidater pour devenir membres. L'association rassemble des acteurs engagés autour d'un réseau plus
                qualifié, plus humain et plus confidentiel.
              </p>
              <Link href="/association" className="bento-btn bento-btn-gold mt-6">
                Candidater pour devenir membre <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-white/20 bg-white/5 p-6">
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-400">
                Les membres peuvent accéder à
              </p>
              <ul className="mt-4 grid gap-2">
                {associationPerks.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-200">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SOUS-TRAITANCE */}
      <section className="mt-14">
        <SectionTitle
          eyebrow="Espace réservé aux membres"
          title="Un réseau interne pour sous-traiter en confiance"
          subtitle="Trouver un renfort fiable, recommander un partenaire ou transmettre une mission demande de la confiance. L'espace de sous-traitance n'est pas ouvert à tous les visiteurs : il est réservé aux membres de l'association, pour un cadre plus sérieux, plus qualifié et plus confidentiel."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subcontractingPerks.map((item) => (
            <div key={item} className="bento-card flex items-start gap-3 p-4">
              <Handshake size={18} className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true" />
              <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Link href="/sous-traitance" className="bento-btn">
            En savoir plus sur la sous-traitance <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* NIVEAUX */}
      <section className="mt-14">
        <SectionTitle eyebrow="Une logique progressive" title="Ouvert à tous. Plus loin pour les membres engagés." />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {levels.map(({ icon: Icon, tag, title, description }, index) => {
            const accent = cardAccents[index % cardAccents.length];
            return (
              <article key={title} className="bento-card bento-card-interactive p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-900 ${accent.chip}`}
                  >
                    <Icon size={20} className={accent.icon} aria-hidden="true" />
                  </div>
                  <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600">{tag}</span>
                </div>
                <h3 className={`${displayFont.className} mt-4 text-lg font-bold text-slate-900`}>{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="mt-14">
        <SectionTitle eyebrow="Mode d'emploi" title="Comment ça marche ?" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <article key={step.title} className="bento-card p-5">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-900 font-mono text-lg font-black ${
                  index === steps.length - 1 ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                } ${index % 2 === 0 ? "-rotate-3" : "rotate-3"}`}
              >
                {index + 1}
              </span>
              <h3 className={`${displayFont.className} mt-4 text-sm font-bold leading-tight text-slate-900`}>
                {step.title}
              </h3>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* RESSOURCES / MÉDIA */}
      <section className="mt-14">
        <div className="surface grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionTitle
              eyebrow="Média de référence"
              title="Des ressources pour mieux piloter votre activité"
              subtitle="Club Propreté publie des contenus pratiques, concrets et utiles. L'objectif n'est pas de produire du contenu théorique, mais d'apporter des réponses concrètes aux problèmes rencontrés par les professionnels."
            />
            <Link href="/ressources" className="bento-btn bento-btn-accent mt-6">
              Explorer les ressources <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {resourceTags.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-semibold capitalize text-slate-700">
                <FileText size={15} className="shrink-0 text-indigo-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* POURQUOI */}
      <section className="mt-14">
        <SectionTitle eyebrow="Les bénéfices" title="Pourquoi rejoindre Club Propreté ?" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, description }, index) => {
            const accent = cardAccents[index % cardAccents.length];
            return (
              <article key={title} className="bento-card bento-card-interactive p-6">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-900 ${accent.chip}`}
                >
                  <Icon size={20} className={accent.icon} aria-hidden="true" />
                </div>
                <h3 className={`${displayFont.className} mt-4 text-base font-bold text-slate-900`}>{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* TERRAIN / AMBITION */}
      <section className="mt-14">
        <div className="bento-card p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2
                className={`${displayFont.className} text-3xl font-bold leading-tight tracking-tight text-slate-900`}
              >
                Une plateforme pensée pour le terrain
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-slate-600">
                Club Propreté n'a pas été imaginé comme un outil froid ou institutionnel. La plateforme est pensée pour
                les réalités concrètes du secteur. La promesse est simple :{" "}
                <span className="font-bold text-slate-900">
                  rendre le secteur plus connecté, plus visible et plus organisé.
                </span>
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {fieldRealities.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 border-t-2 border-slate-900 pt-6">
            {["Un média", "Un annuaire", "Un job board", "Un espace ressources", "Un réseau", "Une association", "Un club professionnel"].map(
              (item, index) => (
                <span key={item} className={`bento-tag ${index % 2 === 0 ? "-rotate-1" : "rotate-1"}`}>
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <SectionTitle eyebrow="Vous vous demandez…" title="Questions fréquentes" />
        <div className="mt-8 grid gap-3">
          {faq.map(({ q, a }) => (
            <details key={q} className="bento-card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-slate-900">
                {q}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-indigo-600 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mt-14">
        <div className="relative overflow-hidden rounded-[20px] border-2 border-slate-900 bg-indigo-600 p-8 text-center shadow-[4px_4px_0_#0f172a] sm:p-12">
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full border-2 border-slate-900 bg-indigo-500"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rotate-12 rounded-3xl border-2 border-slate-900 bg-amber-300"
            aria-hidden="true"
          />
          <div className="relative">
            <h2
              className={`${displayFont.className} mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl`}
            >
              Rejoignez le club professionnel de la propreté
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-indigo-100">
              Créez votre compte gratuitement, référencez votre activité et accédez progressivement aux outils,
              ressources et opportunités du secteur. Une plateforme ouverte et un réseau associatif privé pour les
              membres engagés.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/inscription" className="bento-btn bento-btn-gold">
                Créer mon compte gratuit <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/association" className="bento-btn">
                Découvrir l'association
              </Link>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wide text-indigo-200">
              Club Propreté · La plateforme gratuite des professionnels de la propreté
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="inline-block border-b-2 border-amber-400 pb-1 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
        {eyebrow}
      </p>
      <h2
        className={`${displayFont.className} mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl`}
      >
        {title}
      </h2>
      {subtitle ? <p className="mt-4 text-base font-medium leading-7 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

function StatTile({ value, label, tone, tilt }: { value: string; label: string; tone: string; tilt: string }) {
  return (
    <div className={`bento-card p-5 ${tone} ${tilt}`}>
      <p className="font-mono text-3xl font-extrabold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
    </div>
  );
}
