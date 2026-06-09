import Link from "next/link";
import { Search, UserRoundSearch } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { getPublishedCandidates } from "@/lib/actions/candidates";

interface CandidatesPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || undefined;

  const { items: candidates, total, page: currentPage, totalPages } = await getPublishedCandidates(search, page);

  const avgExp =
    candidates.length > 0
      ? candidates.reduce((sum, c) => sum + (c.experienceYears || 0), 0) / candidates.length
      : 0;

  return (
    <PageShell
      eyebrow="Candidats"
      title="Profils candidats emploi"
      description="Les candidats cherchent CDI, CDD, interim, alternance ou temps partiel."
      actions={
        <Link href="/inscription?role=candidate_profile" className="bento-btn bento-btn-primary">
          Créer un profil candidat
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Profils" value={String(total)} detail="Candidats" />
        <StatCard label="Experience moyenne" value={`${avgExp.toFixed(1)} ans`} detail="Signal data RH" />
        <StatCard label="Sous-traitance" value="Bloquee" detail="Sauf upgrade independant" />
      </div>

      <form method="GET" action="/candidats" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Rechercher un candidat..."
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {search && (
          <Link href="/candidats" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {candidates.length === 0 ? (
        <EmptyState
          title="Aucun candidat inscrit"
          description="Le job board est en cours de construction. Les premiers profils candidats apparaitront ici prochainement."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {candidates.map((candidate) => (
            <EntityCard
              key={candidate.id}
              title={`${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || "Candidat"}
              subtitle={`${candidate.city || ""} · ${candidate.availabilityDate ? new Date(candidate.availabilityDate).toLocaleDateString("fr-FR") : "Disponible"}`}
              meta={[
                candidate.desiredContracts || "",
                `${candidate.experienceYears || 0} an(s) experience`,
              ].filter(Boolean)}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-500">Profil candidat en recherche active.</p>
                <UserRoundSearch className="text-indigo-600" size={22} aria-hidden="true" />
              </div>
            </EntityCard>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/candidats" searchQuery={search} />
    </PageShell>
  );
}
