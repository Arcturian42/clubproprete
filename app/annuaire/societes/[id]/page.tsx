import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  UsersRound,
  UserRound,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getCompanyById, getEntityMembers } from "@/lib/actions/public";
import { parsePhotos } from "@/lib/photos";
import { prisma } from "@/lib/prisma";

type CompanyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function externalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

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
      `Fiche de ${company.name}, société de nettoyage${location ? ` basée à ${location}` : ""}, référencée sur Club Propreté.`,
  };
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
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

  const location = [company.city, company.region].filter(Boolean).join(" · ");
  const photos = parsePhotos(company.photos);
  const foundedYear = company.foundedAt ? company.foundedAt.getFullYear() : null;
  const isClaimed = company.claimedStatus === "claimed";

  const wants = [
    company.wantsRecruitment ? "Recrutement" : null,
    company.wantsSubcontracting ? "Sous-traitance" : null,
    company.wantsTraining ? "Formation" : null,
    company.wantsSuppliers ? "Fournisseurs" : null,
  ].filter(Boolean) as string[];

  const roleLabels: Record<string, string> = {
    owner: "Propriétaire",
    admin: "Administrateur",
    recruiter: "Recruteur",
    member: "Membre",
  };

  return (
    <PageShell
      eyebrow="Fiche société"
      title={company.name}
      description={
        company.descriptionShort ||
        `Entreprise de propreté${location ? ` basée à ${location.replace(" · ", ", ")}` : ""}.`
      }
      actions={
        <>
          <Link href="/annuaire/societes" className="bento-btn">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour annuaire
          </Link>
          {!isClaimed && (
            <Link href="/inscription?role=company_owner" className="bento-btn bento-btn-primary">
              C&apos;est ma société · Compléter ma fiche
            </Link>
          )}
        </>
      }
    >
      {/* En-tête façon LinkedIn : logo, nom, accroche, localisation, badges */}
      <section className="surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`Logo de ${company.name}`}
                className="h-28 w-28 rounded-[20px] border-4 border-slate-900 object-cover shadow-[4px_4px_0px_#0f172a]"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[20px] border-4 border-slate-900 bg-indigo-50 text-indigo-600 shadow-[4px_4px_0px_#0f172a]">
                <Building2 size={44} aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{company.name}</h2>
            {company.descriptionShort && (
              <p className="mt-1 text-lg font-semibold text-slate-600">{company.descriptionShort}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-slate-500">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} aria-hidden="true" />
                  {location}
                </span>
              )}
              {company.employeeCount && (
                <span className="flex items-center gap-1.5">
                  <UsersRound size={15} aria-hidden="true" />
                  {company.employeeCount} salariés
                </span>
              )}
              {foundedYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} aria-hidden="true" />
                  Créée en {foundedYear}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {company.verificationStatus === "approved" && (
                <span className="bento-tag border-emerald-200 bg-emerald-50 text-emerald-700">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Fiche vérifiée
                </span>
              )}
              {company.associationMember && (
                <span className="bento-tag border-amber-200 bg-amber-50 text-amber-700">
                  <ShieldCheck size={14} aria-hidden="true" />
                  Membre association
                </span>
              )}
            </div>
            {(company.website || company.linkedin || company.email) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {company.email && (
                  <a href={`mailto:${company.email}`} className="bento-btn bento-btn-primary inline-flex items-center gap-2">
                    <Mail size={16} aria-hidden="true" />
                    Contacter
                  </a>
                )}
                {company.website && (
                  <a
                    href={externalUrl(company.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bento-btn inline-flex items-center gap-2"
                  >
                    <Globe size={16} aria-hidden="true" />
                    Site web
                  </a>
                )}
                {company.linkedin && (
                  <a
                    href={externalUrl(company.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bento-btn inline-flex items-center gap-2"
                  >
                    <Linkedin size={16} aria-hidden="true" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-5">
          {/* À propos — masqué si vide ou si le texte est resté le placeholder du formulaire */}
          {company.descriptionLong && !company.descriptionLong.startsWith("Description de votre entreprise") && (
            <section className="surface p-6">
              <h3 className="text-lg font-black text-slate-900">À propos</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600 whitespace-pre-line">
                {company.descriptionLong}
              </p>
            </section>
          )}

          {/* Services */}
          {company.services.length > 0 && (
            <section className="surface p-6">
              <h3 className="text-lg font-black text-slate-900">Services proposés</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {company.services.map((service) => (
                  <span key={service.id} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                    {service.serviceType}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Galerie */}
          {photos.length > 0 && (
            <section className="surface p-6">
              <h3 className="text-lg font-black text-slate-900">Galerie</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo, index) => (
                  <img
                    key={photo}
                    src={photo}
                    alt={`Réalisation ${index + 1} de ${company.name}`}
                    className="h-36 w-full rounded-[14px] border-2 border-slate-900 object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Offres d'emploi */}
          <section className="surface p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2.5 text-white shadow-[3px_3px_0px_#0f172a]">
                <Briefcase size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Offres d&apos;emploi</h3>
                <p className="text-sm text-slate-500">
                  {company.jobs.length > 0
                    ? `${company.jobs.length} ${company.jobs.length > 1 ? "offres publiées" : "offre publiée"}.`
                    : "Aucune offre publiée pour le moment."}
                </p>
              </div>
            </div>
            {company.jobs.length > 0 && (
              <div className="mt-4 grid gap-3">
                {company.jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/emploi/${job.id}`}
                    className="flex items-center justify-between gap-3 rounded-[14px] border-2 border-slate-200 bg-white p-4 transition-colors hover:border-indigo-600"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-500">
                        {[job.contractType, job.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="bento-tag shrink-0 border-indigo-200 bg-indigo-50 text-indigo-700">Voir</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Formations */}
          {companyTrainings.length > 0 && (
            <section className="surface p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-2.5 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
                  <GraduationCap size={20} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Formations référencées</h3>
              </div>
              <div className="mt-4 grid gap-3">
                {companyTrainings.map((training) => (
                  <Link
                    key={training.id}
                    href={`/formations/${training.id}`}
                    className="flex items-center justify-between gap-3 rounded-[14px] border-2 border-slate-200 bg-white p-4 transition-colors hover:border-indigo-600"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{training.title}</p>
                      <p className="text-sm text-slate-500">
                        {[training.category, training.format].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="bento-tag shrink-0 border-amber-400 bg-amber-100 text-slate-900">Voir</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Équipe */}
          <section className="surface p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2.5 text-white shadow-[3px_3px_0px_#0f172a]">
                <UsersRound size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Équipe</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {members.length > 0
                    ? `${members.length} ${members.length > 1 ? "membres actifs" : "membre actif"} dans cette société.`
                    : "Aucun membre public pour le moment."}
                </p>
              </div>
            </div>

            {members.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {members.map((member) => {
                  const isPublic = member.user.profile?.visibility === "public";

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-[14px] border-2 border-slate-200 bg-white p-3"
                    >
                      {member.user.avatarUrl ? (
                        <img
                          src={member.user.avatarUrl}
                          alt={`Photo de ${member.user.firstName || ""} ${member.user.lastName || ""}`.trim()}
                          className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-indigo-100">
                          <UserRound size={18} className="text-indigo-600" aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0">
                        {isPublic ? (
                          <Link
                            href={`/membres/${member.user.id}`}
                            className="block truncate font-bold text-slate-900 hover:text-indigo-600"
                          >
                            {member.user.firstName} {member.user.lastName}
                          </Link>
                        ) : (
                          <span className="block truncate font-bold text-slate-900">
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
          </section>
        </div>

        {/* Colonne latérale */}
        <aside className="grid content-start gap-5">
          <section className="surface p-6">
            <h3 className="text-lg font-black text-slate-900">Coordonnées</h3>
            <div className="mt-3 space-y-3 text-sm font-medium text-slate-600">
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-indigo-600">
                  <Mail size={16} aria-hidden="true" /> {company.email}
                </a>
              )}
              {company.phone && (
                <a
                  href={`tel:${company.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-indigo-600"
                >
                  <Phone size={16} aria-hidden="true" /> {company.phone}
                </a>
              )}
              {(company.address || company.city) && (
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{[company.address, [company.postalCode, company.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</span>
                </p>
              )}
              {!company.email && !company.phone && !company.address && !company.city && (
                <p className="text-slate-400">Coordonnées non communiquées.</p>
              )}
            </div>
          </section>

          {company.clientTypes.length > 0 && (
            <section className="surface p-6">
              <h3 className="text-lg font-black text-slate-900">Types de clients</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {company.clientTypes.map((client) => (
                  <span key={client.id} className="bento-tag border-amber-200 bg-amber-50 text-amber-700">
                    <Star size={12} aria-hidden="true" /> {client.clientType}
                  </span>
                ))}
              </div>
            </section>
          )}

          {wants.length > 0 && (
            <section className="surface p-6">
              <h3 className="text-lg font-black text-slate-900">Besoins déclarés</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {wants.map((want) => (
                  <span key={want} className="bento-tag border-amber-400 bg-amber-100 text-slate-900">
                    {want}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
