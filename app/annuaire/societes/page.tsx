import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import CompanyMap from "@/components/company-map";
import { getPublishedCompanies } from "@/lib/actions/companies";

export const metadata = {
  title: "Annuaire des sociétés de nettoyage en France | Club Propreté",
  description:
    "Trouvez une société de nettoyage vérifiée près de chez vous : annuaire gratuit des entreprises de propreté, par région et spécialité.",
};

const FRENCH_REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Outre-mer",
];

interface CompaniesPageProps {
  searchParams: Promise<{ page?: string; search?: string; region?: string }>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || undefined;
  const region = params.region && FRENCH_REGIONS.includes(params.region) ? params.region : undefined;

  const { items: companies, total, page: currentPage, totalPages } = await getPublishedCompanies(search, page, 12, region);

  return (
    <PageShell
      eyebrow="Annuaire"
      title="Sociétés de nettoyage"
      description="Sociétés vérifiées : trouvez un prestataire fiable par région et par spécialité."
      actions={
        <Link href="/inscription?role=company_owner" className="bento-btn bento-btn-primary">
          Référencer ma société
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sociétés" value={String(total)} detail="Vérifiées" />
        <StatCard
          label="Régions"
          value={String(new Set(companies.map((c) => c.region).filter(Boolean)).size)}
          detail="Couvertes"
        />
        <StatCard
          label="Spécialités"
          value={String(new Set(companies.flatMap((c) => c.services?.map((s) => s.serviceType) || [])).size)}
          detail="Services listés"
        />
      </div>

      <div className="mt-6">
        <CompanyMap companies={companies} />
      </div>

      <div className="mt-6 rounded-[20px] border-2 border-indigo-200 bg-indigo-50 p-6 text-center">
        <p className="text-sm font-semibold text-indigo-900">
          Votre entreprise n&apos;est pas sur la carte ?
        </p>
        <Link
          href="/inscription?role=company_owner"
          className="mt-3 inline-block bento-btn bento-btn-primary"
        >
          Ajouter gratuitement votre entreprise
        </Link>
      </div>

      <form method="GET" action="/annuaire/societes" className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Rechercher une société, une ville..."
            className="bento-input w-full pl-9"
          />
        </div>
        <select
          name="region"
          defaultValue={region || ""}
          className="bento-input sm:w-64"
          aria-label="Filtrer par région"
        >
          <option value="">Toutes les régions</option>
          {FRENCH_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {(search || region) && (
          <Link href="/annuaire/societes" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {companies.length === 0 ? (
        <EmptyState
          title="Aucune société référencée pour le moment"
          description="Les sociétés de nettoyage vérifiées apparaîtront ici. Vous êtes prestataire ? Soyez le premier à créer votre fiche."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/annuaire/societes/${company.slug ?? company.id}`}
              className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              aria-label={`Voir la fiche de ${company.name}`}
            >
              <EntityCard
                title={company.name}
                subtitle={`${company.city || ""} · ${company.region || ""}`}
                meta={[
                  company.employeeCount || "",
                  ...(company.services?.map((s) => s.serviceType) || []),
                ].filter(Boolean)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-emerald-600">
                    <Building2 size={14} /> Société vérifiée
                  </span>
                  <span className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
                    Voir la fiche →
                  </span>
                </div>
              </EntityCard>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/annuaire/societes" searchQuery={search} extraParams={{ region }} />
    </PageShell>
  );
}
