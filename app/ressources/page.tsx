import Link from "next/link";
import { BookOpenText, MailPlus, Search, User } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Pagination } from "@/components/pagination";
import { getPublishedArticles } from "@/lib/actions/articles";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata = {
  title: "Blog & ressources des pros de la propreté | Club Propreté",
  description:
    "Guides, conseils et actualités pour piloter et développer votre activité de nettoyage.",
};

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
      title="Blog & Ressources"
      description="Articles, guides et actualités vérifiées pour les professionnels de la propreté."
      actions={
        <Link href="/dashboard" className="bento-btn bento-btn-primary">
          S'inscrire newsletter
        </Link>
      }
    >
      {/* Barre de recherche */}
      <form method="GET" action="/ressources" className="flex gap-2">
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const authorInitials = `${article.author?.firstName?.[0] ?? ""}${article.author?.lastName?.[0] ?? ""}`;
            const authorName = `${article.author?.firstName ?? ""} ${article.author?.lastName ?? ""}`.trim() || "Club Propreté";

            return (
              <article
                key={article.id}
                className="bento-card bento-card-interactive overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-100">
                      <BookOpenText size={32} className="text-indigo-300" />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Catégorie */}
                  <span className="bento-tag mb-2 self-start border-indigo-200 bg-indigo-50 text-indigo-700">
                    {article.category || "Article"}
                  </span>

                  {/* Titre */}
                  <h3 className="text-lg font-bold text-slate-900">
                    <Link href={`/ressources/${article.slug || article.id}`} className="hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                      {article.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                    {article.excerpt || "Lire l'article pour en savoir plus."}
                  </p>

                  {/* Footer meta */}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t-2 border-slate-900">
                    <Link
                      href={`/membres/${article.author?.id}`}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      {authorInitials ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                          {authorInitials}
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                          <User size={14} />
                        </div>
                      )}
                      <span className="truncate">{authorName}</span>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : ""}</span>
                      <span>·</span>
                      <span>{article.readTime || "5 min"}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/ressources/${article.slug || article.id}`}
                      className="bento-btn text-xs"
                    >
                      Lire l'article →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/ressources" searchQuery={search} />

      {/* Newsletter */}
      <div className="surface mt-10 p-6">
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
