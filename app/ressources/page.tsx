import Link from "next/link";
import { BookOpenText, MailPlus, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { getPublishedArticles } from "@/lib/actions/articles";
import { NewsletterForm } from "@/components/newsletter-form";

interface ResourcesPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || undefined;

  const { items: articles, total, page: currentPage, totalPages } = await getPublishedArticles(search, page);

  return (
    <PageShell
      eyebrow="Media"
      title="Blog, ressources et newsletter"
      description="Articles et ressources vérifiées pour les professionnels de la propreté."
      actions={
        <Link href="/dashboard" className="bento-btn bento-btn-primary">
          S'inscrire newsletter
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Articles" value={String(total)} detail="Contenu disponible" />
        <StatCard label="Catégories" value="4" detail="Métier, technique, management..." />
        <StatCard label="Segments" value="6" detail="Société, fournisseur, candidat..." />
      </div>

      <form method="GET" action="/ressources" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Rechercher un article..."
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {search && (
          <Link href="/ressources" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {articles.length === 0 ? (
        <EmptyState
          title="Aucun article publié"
          description="Le blog est en cours de construction. Les articles et guides du secteur de la propreté seront bientôt disponibles."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/ressources/${article.id}`}
              className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              aria-label={`Lire l'article ${article.title}`}
            >
              <EntityCard title={article.title} subtitle={article.category || "Article"}>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-500">
                    Par {article.author?.firstName} {article.author?.lastName || "Club Propreté"}
                  </p>
                  <span className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
                    Lire l'article →
                  </span>
                </div>
              </EntityCard>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/ressources" searchQuery={search} />

      <div className="surface mt-8 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <MailPlus size={22} aria-hidden="true" />
          </div>
          <div className="w-full">
            <h2 className="text-xl font-black text-slate-900">Newsletter sectorielle</h2>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
