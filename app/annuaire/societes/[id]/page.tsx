import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, MapPin, UsersRound, UserRound } from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { getCompanyById, getEntityMembers } from "@/lib/actions/public";
import { prisma } from "@/lib/prisma";

type CompanyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};


export async function generateMetadata({ params }: CompanyDetailPageProps) {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) {
    return { title: "Société introuvable | Club Propreté" };
  }
  const location = [company.city, company.region].filter(Boolean).join(", ");
  return {
    title: `${company.name}${location ? ` — Nettoyage ${location}` : ""} | Club Propreté`,
    description:
      company.descriptionShort ||
      `Fiche de ${company.name}, société de nettoyage${location ? ` basée à ${location}` : ""}, vérifiée par Club Propreté.`,
  };
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company || company.verificationStatus !== "approved") {
    notFound();
  }

  const companyTrainings = await prisma.training.findMany({
    where: {
      deletedAt: null,
      status: "approved",
      creatorEntityId: company.id,
    },
  });

  const members = await getEntityMembers("company", company.id);

  const wants = [
    company.wantsRecruitment ? "Recrutement" : null,
    company.wantsSubcontracting ? "Sous-traitance" : null,
    company.wantsTraining ? "Formation" : null,
    company.wantsSuppliers ? "Fournisseurs" : null,
  ].filter(Boolean) as string[];

  return (
    <PageShell
      eyebrow="Fiche société"
      title={company.name}
      description={
        company.descriptionShort ||
        `Entreprise de propreté basée à ${[company.city, company.region].filter(Boolean).join(", ")}.`
      }
      actions={
        <>
          <Link href="/annuaire/societes" className="bento-btn">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour annuaire
          </Link>
          <Link href="/inscription?role=company_owner" className="bento-btn bento-btn-primary">
            C&apos;est ma société · Compléter ma fiche
          </Link>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="surface p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] border-2 border-slate-900 bg-indigo-50 text-indigo-600 shadow-[4px_4px_0px_#0f172a]">
                <Building2 size={30} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{company.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
                <MapPin size={16} aria-hidden="true" />
                {company.city || ""} · {company.region || ""}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <StatCard label="Effectif" value={company.employeeCount || "Non précisé"} detail="Effectif déclaré" />
            <StatCard
              label="Association"
              value={company.associationMember ? "Membre" : "Non membre"}
              detail={company.associationMember ? "Accès sous-traitance" : "Adhésion possible"}
            />
          </div>

          {company.descriptionLong && (
            <div className="mt-6 border-t-2 border-slate-900 pt-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-900">À propos</p>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600 whitespace-pre-line">
                {company.descriptionLong}
              </p>
            </div>
          )}

          <div className="mt-6 border-t-2 border-slate-900 pt-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-900">Services proposés</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {company.services.map((service) => (
                <span key={service.id} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                  {service.serviceType}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t-2 border-slate-900 pt-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-900">Besoins déclarés</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {wants.map((want) => (
                <span key={want} className="bento-tag border-amber-400 bg-amber-100 text-slate-900">
                  {want}
                </span>
              ))}
            </div>
          </div>
        </section>

        <aside className="grid gap-5">
          <EntityCard
            title="Signaux de confiance"
            subtitle="L'association et les badges structurent la confiance."
            meta={[
              company.associationMember ? "Membre association" : "Non membre"
            ]}
          >
            <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
              <BadgeCheck size={18} aria-hidden="true" />
              Profil vérifié
            </div>
          </EntityCard>

          <EntityCard
            title="Mise en relation"
            subtitle="Les contacts réels seront branchés avec les leads et les règles RGPD."
            meta={["Lead interne", "Newsletter", "Dashboard société"]}
          >
            <Link href="/inscription" className="bento-btn bento-btn-accent">
              Contacter via Club Propreté
            </Link>
          </EntityCard>
        </aside>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <EntityCard
          title="Offres d'emploi liées"
          subtitle={company.jobs.length > 0 ? `${company.jobs.length} ${company.jobs.length > 1 ? "offres" : "offre"} pour cette société.` : "Aucune offre publiée pour cette société."}
          meta={company.jobs.map((job) => `${job.title} · ${job.contractType}`)}
        >
          <Link href="/emploi" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
            Voir le job board
          </Link>
        </EntityCard>

        <EntityCard
          title="Formations liées"
          subtitle={companyTrainings.length > 0 ? `${companyTrainings.length} ${companyTrainings.length > 1 ? "formations référencées" : "formation référencée"}.` : "Aucune formation liée pour le moment."}
          meta={companyTrainings.map((training) => `${training.title} · ${training.format || ""}`)}
        >
          <Link href="/formations" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
            Voir les formations
          </Link>
        </EntityCard>
      </div>

      <div className="surface mt-8 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <UsersRound size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Équipe</h2>
            <p className="mt-1 text-sm text-slate-500">
              {members.length > 0
                ? `${members.length} ${members.length > 1 ? "membres actifs" : "membre actif"} dans cette société.`
                : "Aucun membre public pour le moment."}
            </p>
          </div>
        </div>

        {members.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const isPublic = member.user.profile?.visibility === "public";
              const roleLabels: Record<string, string> = {
                owner: "Propriétaire",
                admin: "Administrateur",
                recruiter: "Recruteur",
                member: "Membre",
              };

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-[14px] border-2 border-slate-200 bg-white"
                >
                  {member.user.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={`${member.user.firstName} ${member.user.lastName}`}
                      className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center">
                      <UserRound size={18} className="text-indigo-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    {isPublic ? (
                      <Link
                        href={`/membres/${member.user.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                      >
                        {member.user.firstName} {member.user.lastName}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-900 truncate block">
                        {member.user.firstName} {member.user.lastName}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{roleLabels[member.role] || member.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
