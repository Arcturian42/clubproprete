import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, GraduationCap, Mail, Phone } from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { getTrainingOrganizationById } from "@/lib/actions/training-organizations";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, getBaseUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

function externalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const organization = await getTrainingOrganizationById(id);
  if (!organization) {
    return { title: "Centre de formation introuvable" };
  }
  return {
    title: `${organization.name} — Centre de formation propreté`,
    description:
      organization.description ||
      `${organization.name}, centre de formation pour les métiers de la propreté${
        organization.qualiopiStatus ? ` (${organization.qualiopiStatus})` : ""
      }, référencé sur Club Propreté.`,
    alternates: { canonical: `/annuaire/centres-formation/${id}` },
  };
}

export default async function TrainingCenterDetailPage({ params }: Props) {
  const { id } = await params;
  const organization = await getTrainingOrganizationById(id);

  if (!organization) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const organizationUrl = `${baseUrl}/annuaire/centres-formation/${organization.id}`;
  // Donnée structurée EducationalOrganization : permet aux moteurs (SEO) et aux
  // IA (AEO/GEO) d'identifier le centre, son agrément Qualiopi et son catalogue.
  const educationalOrganizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${organizationUrl}#organization`,
    name: organization.name,
    ...(organization.description ? { description: organization.description } : {}),
    url: organizationUrl,
    ...(organization.logoUrl?.startsWith("http") ? { logo: organization.logoUrl } : {}),
    ...(organization.email ? { email: organization.email } : {}),
    ...(organization.phone ? { telephone: organization.phone } : {}),
    ...(organization.website ? { sameAs: [externalUrl(organization.website)] } : {}),
    areaServed: { "@type": "Country", name: "France" },
    ...(organization.qualiopiStatus || organization.declarationNumber
      ? {
          hasCredential: [
            ...(organization.qualiopiStatus
              ? [
                  {
                    "@type": "EducationalOccupationalCredential",
                    name: "Qualiopi",
                    credentialCategory: organization.qualiopiStatus,
                  },
                ]
              : []),
            ...(organization.declarationNumber
              ? [
                  {
                    "@type": "EducationalOccupationalCredential",
                    name: "Numéro de déclaration d'activité (NDA)",
                    credentialCategory: organization.declarationNumber,
                  },
                ]
              : []),
          ],
        }
      : {}),
  };

  return (
    <PageShell
      eyebrow="Centre de formation"
      title={organization.name}
      description={organization.description || organization.qualiopiStatus || "Centre de formation validé par Club Propreté."}
      actions={
        <Link href="/annuaire/centres-formation" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux centres
        </Link>
      }
    >
      <JsonLd
        data={[
          educationalOrganizationJsonLd,
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Centres de formation", path: "/annuaire/centres-formation" },
            { name: organization.name, path: `/annuaire/centres-formation/${organization.id}` },
          ]),
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Formations" value={String(organization.trainings.length)} detail="Publiées" />
        <StatCard label="Qualiopi" value={organization.qualiopiStatus || "À vérifier"} detail="Statut déclaré" />
        <StatCard label="Déclaration" value={organization.declarationNumber || "Non renseignée"} detail="NDA" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="surface p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
              <GraduationCap size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Présentation</h2>
          </div>
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {organization.description || "Ce centre n'a pas encore ajouté de présentation détaillée."}
          </p>
        </section>

        <section className="surface p-6">
          <h2 className="mb-4 text-lg font-black text-slate-900">Contact</h2>
          <div className="space-y-3">
            {organization.email && (
              <a href={`mailto:${organization.email}`} className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-indigo-600">
                <Mail size={18} /> {organization.email}
              </a>
            )}
            {organization.phone && (
              <a href={`tel:${organization.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-indigo-600">
                <Phone size={18} /> {organization.phone}
              </a>
            )}
            {organization.website && (
              <a href={organization.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-indigo-600">
                <Globe size={18} /> Site web
              </a>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-900">Formations publiées</h2>
          <Link href="/formations" className="bento-btn">
            Voir le catalogue
          </Link>
        </div>
        {organization.trainings.length === 0 ? (
          <div className="surface p-6 text-sm font-semibold text-slate-500">
            Aucune formation publiée pour le moment.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {organization.trainings.map((training) => (
              <Link key={training.id} href={`/formations/${training.id}`} className="block">
                <EntityCard
                  title={training.title}
                  subtitle={`${training.category} · ${training.city || ""}`}
                  meta={[training.duration || "", training.certificationName || ""].filter(Boolean)}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
