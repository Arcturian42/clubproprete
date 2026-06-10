import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  Clock,
  Euro,
  GraduationCap,
  Mail,
  MapPin,
  Medal,
  Phone,
  Target,
  Users,
  Globe,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { getTrainingById } from "@/lib/actions/public";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TrainingDetailPage({ params }: Props) {
  const { id } = await params;
  const training = await getTrainingById(id);

  if (!training || training.status !== "approved") {
    notFound();
  }

  let creatorName = "";
  let creatorTypeLabel = "Centre de formation";
  let creatorHref: string | null = null;
  if (training.creatorEntityId) {
    if (training.creatorType === "company") {
      const company = await prisma.company.findUnique({ where: { id: training.creatorEntityId } });
      creatorName = company?.name || "";
      creatorTypeLabel = "Société de nettoyage";
      creatorHref = company ? `/annuaire/societes/${company.id}` : null;
    } else if (training.creatorType === "supplier") {
      const supplier = await prisma.supplier.findUnique({ where: { id: training.creatorEntityId } });
      creatorName = supplier?.name || "";
      creatorTypeLabel = "Fournisseur";
      creatorHref = supplier ? `/annuaire/fournisseurs/${supplier.id}` : null;
    } else {
      const org = await prisma.trainingOrganization.findUnique({
        where: { id: training.creatorEntityId },
      });
      creatorName = org?.name || "";
      creatorTypeLabel = "Centre de formation";
      creatorHref = org ? `/annuaire/centres-formation/${org.id}` : null;
    }
  } else if (training.creator) {
    creatorName = `${training.creator.firstName || ""} ${training.creator.lastName || ""}`.trim();
    creatorTypeLabel = "Auteur individuel";
    creatorHref = `/membres/${training.creator.id}`;
  }

  const prerequisites = training.prerequisites
    ? training.prerequisites.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <PageShell
      eyebrow="Formation"
      title={training.title}
      description={`Proposé par ${creatorName || "Club Propreté"} · ${training.category} · ${training.city || ""}`}
      actions={
        <Link href="/formations" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux formations
        </Link>
      }
    >
      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Durée" value={training.duration || "Non précisée"} detail="Formation complète" />
        <StatCard label="Format" value={training.format || ""} detail={training.city || ""} />
        <StatCard label="Prix" value={training.priceInfoOptional?.includes("Gratuit") ? "Gratuit" : "Payant"} detail={training.priceInfoOptional || "Sur demande"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Description */}
          <article className="surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Description</h2>
            </div>
            <p className="text-base font-medium leading-7 text-slate-600">
              {training.description || "Aucune description disponible pour cette formation."}
            </p>
          </article>

          {/* Prérequis */}
          {prerequisites.length > 0 && (
            <article className="surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-2 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
                  <Target size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Prérequis</h2>
              </div>
              <ul className="space-y-2">
                {prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-600 font-medium">{prereq}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {/* Public visé */}
          {training.targetAudience && (
            <article className="surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-blue-500 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Public visé</h2>
              </div>
              <p className="text-slate-600 font-medium">{training.targetAudience}</p>
            </article>
          )}

          {/* Certification */}
          {training.certificationName && (
            <article className="surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                  <Award size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Certification</h2>
              </div>
              <p className="text-slate-600 font-medium">{training.certificationName}</p>
            </article>
          )}

          {/* Sessions programmées */}
          {training.sessions.length > 0 && (
            <article className="surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                  <Clock size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Sessions programmées</h2>
              </div>
              <ul className="space-y-3">
                {training.sessions
                  .slice()
                  .sort((a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0))
                  .map((session) => (
                    <li key={session.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border-2 border-slate-200 p-3">
                      <span className="font-bold text-slate-900">
                        {session.startDate
                          ? new Date(session.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                          : "Date à préciser"}
                      </span>
                      {session.location && (
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <MapPin size={14} /> {session.location}
                        </span>
                      )}
                      {typeof session.availableSeats === "number" && (
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Users size={14} /> {session.availableSeats} places
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </article>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Infos pratiques */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Informations pratiques</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Organisme</p>
                  {creatorHref ? (
                    <Link href={creatorHref} className="font-bold text-slate-900 hover:text-indigo-600">
                      {creatorName || "Non précisé"}
                    </Link>
                  ) : (
                    <p className="font-bold text-slate-900">{creatorName || "Non précisé"}</p>
                  )}
                  <p className="text-sm text-slate-500">{creatorTypeLabel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Lieu</p>
                  <p className="font-bold text-slate-900">{training.city || "Non précisé"}</p>
                  <p className="text-sm text-slate-500">{training.format || ""}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Durée</p>
                  <p className="font-bold text-slate-900">{training.duration || "Non précisée"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Euro className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Tarif</p>
                  <p className="font-bold text-slate-900">{training.priceInfoOptional || "Sur demande"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Catégorie</p>
                  <p className="font-bold text-slate-900">{training.category}</p>
                </div>
              </div>
            </div>
          </article>

          {/* Financements */}
          {training.fundingOptions && (
            <article className="surface p-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">Options de financement</h2>
              <div className="flex flex-wrap gap-2">
                {training.fundingOptions.split(",").map((option) => (
                  <span key={option.trim()} className="bento-tag border-emerald-300 bg-emerald-50 text-emerald-700">
                    {option.trim()}
                  </span>
                ))}
              </div>
            </article>
          )}

          {/* Contact */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Contact</h2>
            <div className="space-y-3">
              {training.contactEmail && (
                <a
                  href={`mailto:${encodeURIComponent(training.contactEmail)}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <Mail size={18} />
                  <span className="font-medium">{training.contactEmail}</span>
                </a>
              )}
              {training.phone && (
                <a
                  href={`tel:${encodeURIComponent(training.phone.replace(/\s/g, ""))}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <Phone size={18} />
                  <span className="font-medium">{training.phone}</span>
                </a>
              )}
              {training.website && (
                <a
                  href={training.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <Globe size={18} />
                  <span className="font-medium">Site web</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </article>

          {/* CTA */}
          <div className="surface p-6 bg-indigo-50 border-indigo-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Intéressé(e) ?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Contactez directement {creatorName || "l'organisme"} pour vous inscrire ou obtenir plus d'informations.
            </p>
            {training.contactEmail ? (
              <a
                href={`mailto:${encodeURIComponent(training.contactEmail)}?subject=${encodeURIComponent(`Demande d'information - ${training.title}`)}`}
                className="bento-btn bento-btn-primary w-full justify-center"
              >
                <Mail size={16} /> Envoyer une demande
              </a>
            ) : (
              <button className="bento-btn bento-btn-primary w-full justify-center" disabled>
                Contact non disponible
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Entreprises qui recommandent */}
      {training.recommendedBy && (
        <section className="mt-8">
          <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <Medal className="text-amber-500" size={24} />
            Entreprises qui recommandent cette formation
          </h2>
          <p className="text-slate-600 mb-4">
            Ces entreprises considèrent cette formation comme nécessaire ou fortement recommandée pour travailler chez elles :
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {training.recommendedBy.split(",").map((companyName) => {
              const name = companyName.trim();
              return (
                <EntityCard
                  key={name}
                  title={name}
                  subtitle="Entreprise partenaire"
                  meta={[]}
                >
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-bold">Formation recommandée</span>
                  </div>
                </EntityCard>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}
