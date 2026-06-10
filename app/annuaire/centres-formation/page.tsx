import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { Pagination } from "@/components/pagination";
import { StatCard } from "@/components/stat-card";
import { getPublishedTrainingOrganizations } from "@/lib/actions/training-organizations";

interface TrainingCentersPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function TrainingCentersPage({ searchParams }: TrainingCentersPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || undefined;
  const { items, total, page: currentPage, totalPages } = await getPublishedTrainingOrganizations(search, page);

  return (
    <PageShell
      eyebrow="Annuaire"
      title="Centres de formation"
      description="Centres et organismes validés pour proposer des formations certifiées dans la propreté."
      actions={
        <Link href="/dashboard/centre-formation" className="bento-btn bento-btn-primary">
          Référencer un centre
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Centres" value={String(total)} detail="Validés" />
        <StatCard label="Formations" value={String(items.reduce((sum, item) => sum + item.trainingsCount, 0))} detail="Au catalogue" />
        <StatCard label="Statut" value="Certifié" detail="Modération admin" />
      </div>

      <form method="GET" action="/annuaire/centres-formation" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Rechercher un centre..."
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {search && (
          <Link href="/annuaire/centres-formation" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="Aucun centre référencé"
          description="Les centres de formation validés apparaîtront ici."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {items.map((organization) => (
            <Link
              key={organization.id}
              href={`/annuaire/centres-formation/${organization.id}`}
              className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              aria-label={`Voir la fiche de ${organization.name}`}
            >
              <EntityCard
                title={organization.name}
                subtitle={organization.qualiopiStatus || organization.declarationNumber || "Centre validé"}
                meta={[`${organization.trainingsCount} formation(s)`, organization.website || ""]}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-emerald-600">
                    <GraduationCap size={14} /> Centre validé
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

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/annuaire/centres-formation" searchQuery={search} />
    </PageShell>
  );
}
