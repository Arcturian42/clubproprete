import Link from "next/link";
import { ArrowRight, Clock, Euro, Medal, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { ProposeTrainingButton } from "@/components/propose-training-button";
import { Pagination } from "@/components/pagination";
import { getPublishedTrainings } from "@/lib/actions/trainings";

interface TrainingsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function TrainingsPage({ searchParams }: TrainingsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || undefined;

  const { items: trainings, total, page: currentPage, totalPages } = await getPublishedTrainings(search, page);
  const creators = new Set(trainings.map((t) => t.creatorUserId));

  return (
    <PageShell
      eyebrow="Formation"
      title="Espace formation"
      description="Formations verifiees proposees par les organismes et societes de nettoyage du secteur."
      actions={<ProposeTrainingButton />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Formations" value={String(total)} detail="Catalogue actif" />
        <StatCard label="Organismes" value={String(creators.size)} detail="Centres et societes" />
        <StatCard label="Disponibilite" value="24/7" detail="Inscription en ligne" />
      </div>

      <form method="GET" action="/formations" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Rechercher une formation..."
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {search && (
          <Link href="/formations" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {trainings.length === 0 ? (
        <EmptyState
          title="Aucune formation disponible"
          description="Le catalogue de formations est en cours de construction. Revenez bientot pour decouvrir les formations verifiees du secteur."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {trainings.map((training) => (
            <Link
              key={training.id}
              href={`/formations/${training.id}`}
              className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              aria-label={`Voir les details de ${training.title}`}
            >
              <EntityCard
                title={training.title}
                subtitle={`${training.creatorType} · ${training.city || ""}`}
                meta={[training.category, training.format || ""]}
              >
                <div className="space-y-3">
                  <p className="text-sm font-semibold leading-6 text-slate-500 line-clamp-2">
                    {training.description || "Aucune description disponible."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {training.duration && (
                      <span className="bento-tag border-amber-300 bg-amber-50 text-amber-700">
                        <Clock size={12} /> {training.duration}
                      </span>
                    )}
                    {training.priceInfoOptional && (
                      <span className="bento-tag border-emerald-300 bg-emerald-50 text-emerald-700">
                        <Euro size={12} /> {training.priceInfoOptional.includes("Gratuit") ? "Gratuit" : "Payant"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t-2 border-slate-100">
                    <span className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
                      Voir les details
                    </span>
                    <ArrowRight className="text-indigo-600" size={18} />
                  </div>
                </div>
              </EntityCard>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/formations" searchQuery={search} />
    </PageShell>
  );
}
