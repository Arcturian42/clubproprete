import Link from "next/link";
import { BriefcaseBusiness, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { PublishJobButton } from "@/components/publish-job-button";
import { Pagination } from "@/components/pagination";
import { getPublishedJobs } from "@/lib/actions/jobs";

interface JobsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || undefined;

  const { items: jobs, total, page: currentPage, totalPages } = await getPublishedJobs(search, page);
  const applicationsCount = jobs.reduce((total, job) => total + (job._count?.applications || 0), 0);

  return (
    <PageShell
      eyebrow="Job board"
      title="Offres d'emploi gratuites"
      description="Offres d'emploi vérifiées : les sociétés publient et les candidats postulent directement."
      actions={<PublishJobButton />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Offres" value={String(total)} detail="Postes disponibles" />
        <StatCard label="Entreprises" value="3" detail="Recrutent activement" />
        <StatCard label="Candidatures" value={String(applicationsCount)} detail="Déjà postulées" />
      </div>

      <form method="GET" action="/emploi" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Rechercher une offre..."
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {search && (
          <Link href="/emploi" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {jobs.length === 0 ? (
        <EmptyState
          title="Aucune offre pour le moment"
          description="Les sociétés de nettoyage n'ont pas encore publié d'offres. Revenez bientôt ou créez votre propre offre si vous êtes une entreprise."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/emploi/${job.id}`}
              className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              aria-label={`Voir l'offre ${job.title}`}
            >
              <EntityCard
                title={job.title}
                subtitle={`${job.employerName || job.company?.name || "Entreprise"} · ${job.city || ""}`}
                meta={[job.contractType, `${job._count?.applications || 0} candidature(s)`]}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-500">Postulez directement via la plateforme.</p>
                  <BriefcaseBusiness className="text-indigo-600" size={22} aria-hidden="true" />
                </div>
              </EntityCard>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/emploi" searchQuery={search} />
    </PageShell>
  );
}
