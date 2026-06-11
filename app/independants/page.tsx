import Link from "next/link";
import { BadgeCheck, Hammer, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { getPublishedIndependents } from "@/lib/actions/independents";
import { getAvailabilityLabel } from "@/lib/labels";

export const metadata = {
  title: "Indépendants & sous-traitants en propreté | Club Propreté",
  description:
    "Annuaire des indépendants et auto-entrepreneurs du nettoyage disponibles pour des missions de sous-traitance.",
};

interface IndependentsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function IndependentsPage({ searchParams }: IndependentsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || undefined;

  const { items: independents, total, page: currentPage, totalPages } = await getPublishedIndependents(search, page);

  return (
    <PageShell
      eyebrow="Sous-traitants"
      title="Profils indépendants"
      description="Profils indépendants vérifiés : compétences, disponibilité et zones d'intervention."
      actions={
        <Link href="/inscription?role=independent_profile" className="bento-btn bento-btn-primary">
          Créer un profil indépendant
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Profils" value={String(total)} detail="Indépendants actifs" />
        <StatCard label="Compétences" value="12+" detail="Spécialités couvertes" />
        <StatCard label="Zones" value="8" detail="Régions disponibles" />
      </div>

      <form method="GET" action="/independants" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Rechercher un indépendant..."
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {search && (
          <Link href="/independants" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {independents.length === 0 ? (
        <EmptyState
          title="Aucun indépendant vérifié"
          description="Les profils indépendants vérifiés apparaîtront ici. Si vous êtes sous-traitant, créez votre profil pour être visible."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {independents.map((profile) => (
            <EntityCard
              key={profile.id}
              title={profile.displayName}
              subtitle={`${profile.city || ""} · ${getAvailabilityLabel(profile.availabilityStatus)}`}
              meta={["✓ Vérifié", profile.equipmentOwned || ""].filter(Boolean)}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-emerald-600">
                  <BadgeCheck size={14} /> Profil vérifié
                </span>
                <Link
                  href={`/membres/${profile.userId}`}
                  className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600 hover:underline"
                >
                  Voir le profil <Hammer size={16} aria-hidden="true" />
                </Link>
              </div>
            </EntityCard>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/independants" searchQuery={search} />
    </PageShell>
  );
}
