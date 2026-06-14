import Link from "next/link";
import { ArrowRight, BookOpenText, MailPlus, Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { EmptyState } from "@/components/empty-state";
import { NewsletterForm } from "@/components/newsletter-form";
import { ResourceCard } from "@/components/resources/resource-card";
import { getPublishedArticles } from "@/lib/actions/articles";
import {
  getPopularResources,
  getResourceById,
  getResourceCategory,
  getResourceHref,
  resourceCategories,
  resourcesByProfile,
  searchResources,
} from "@/lib/resources";

export const metadata = {
  title: "Ressources pour les professionnels de la propreté",
  description:
    "Guides métier, modèles de documents, calculateurs, actualités, comparatifs et ressources réglementaires pour créer, structurer et développer votre activité dans le nettoyage professionnel.",
};

interface ResourcesPageProps {
  searchParams: Promise<{ q?: string; search?: string }>;
}

type ArticleItems = Awaited<ReturnType<typeof getPublishedArticles>>["items"];

// Le hub est essentiellement statique : si la base est indisponible, on
// affiche quand même les ressources sans la section articles.
async function safeGetArticles(search?: string): Promise<ArticleItems> {
  try {
    const { items } = await getPublishedArticles(search, 1);
    return items;
  } catch (error) {
    console.error("ressources: articles indisponibles", error);
    return [];
  }
}

export default async function ResourcesHubPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams;
  // `search` est conservé pour compatibilité avec les anciens liens du blog.
  const query = (params.q || params.search || "").trim();

  const matchingResources = query ? searchResources(query) : [];
  const matchingArticles = query ? await safeGetArticles(query) : [];
  const latestArticles = await safeGetArticles();

  const popularResources = getPopularResources();
  const featuredNew = ["creer-entreprise-nettoyage", "devis-nettoyage", "calculateur-prix-nettoyage"]
    .map((id) => getResourceById(id))
    .filter((resource): resource is NonNullable<typeof resource> => Boolean(resource));

  return (
    <PageShell
      eyebrow="Ressources"
      title="Toutes les ressources pour les professionnels de la propreté"
      description="Guides métier, modèles de documents, calculateurs, actualités, comparatifs et ressources réglementaires pour créer, structurer et développer votre activité dans le nettoyage professionnel."
      actions={
        <>
          <Link href="#categories" className="bento-btn bento-btn-primary">
            Explorer les ressources
          </Link>
          <Link href="/inscription" className="bento-btn">
            Créer un compte gratuit
          </Link>
        </>
      }
    >
      {/* Barre de recherche */}
      <form method="GET" action="/ressources" className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Rechercher un guide, un modèle, un calculateur, une actualité…"
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {query && (
          <Link href="/ressources" className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {/* Résultats de recherche */}
      {query && (
        <section className="mt-8">
          <h2 className="text-xl font-black text-slate-900">
            {matchingResources.length + matchingArticles.length === 0
              ? `Aucun résultat pour « ${query} »`
              : `Résultats pour « ${query} »`}
          </h2>
          {matchingResources.length === 0 && matchingArticles.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Aucune ressource ne correspond à votre recherche"
                description="Essayez un autre mot-clé ou parcourez les rubriques ci-dessous."
                actionLabel="Voir toutes les rubriques"
                actionHref="/ressources"
              />
            </div>
          ) : (
            <>
              {matchingResources.length > 0 && (
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {matchingResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
              {matchingArticles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-black text-slate-900">Articles du média</h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {matchingArticles.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={`/ressources/${article.slug || article.id}`}
                          className="surface block p-4 transition-colors hover:border-indigo-600"
                        >
                          <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                            {article.category || "Article"}
                          </span>
                          <span className="mt-2 block text-sm font-black text-slate-900">{article.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Cartes catégories */}
      <section id="categories" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl font-black text-slate-900">Explorez par rubrique</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resourceCategories.map((category) => {
            const Icon = category.icon;
            const examples = category.menuResourceIds.slice(0, 3);
            return (
              <article key={category.slug} className="surface flex flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-2 border-slate-900 bg-indigo-600 text-white shadow-[3px_3px_0px_#0f172a]">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    <Link href={`/ressources/${category.slug}`} className="hover:text-indigo-600">
                      {category.title}
                    </Link>
                  </h3>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{category.menuDescription}</p>
                <ul className="mt-3 space-y-1">
                  {examples.map((id) => {
                    const resource = getResourceById(id);
                    if (!resource) return null;
                    return (
                      <li key={id}>
                        <Link
                          href={getResourceHref(resource)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600"
                        >
                          <ArrowRight size={12} className="shrink-0 text-indigo-400" aria-hidden="true" />
                          {resource.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-auto pt-4">
                  <Link href={`/ressources/${category.slug}`} className="bento-btn w-full justify-center text-sm">
                    Voir les ressources
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Ressources populaires */}
      <section className="mt-12">
        <h2 className="text-2xl font-black text-slate-900">Ressources populaires</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* Ressources par profil */}
      <section className="mt-12">
        <h2 className="text-2xl font-black text-slate-900">Des ressources pour chaque profil</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resourcesByProfile.map((profile) => (
            <article key={profile.title} className="surface p-6">
              <h3 className="text-base font-black text-slate-900">{profile.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{profile.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.categories.map((slug) => {
                  const category = getResourceCategory(slug);
                  if (!category) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/ressources/${slug}`}
                      className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      {category.title}
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Dernières publications */}
      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900">Dernières publications</h2>
          <Link href="/ressources/media" className="bento-btn text-sm">
            Voir le média →
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestArticles.slice(0, 3).map((article) => (
            <article key={article.id} className="bento-card bento-card-interactive overflow-hidden">
              <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                {article.featuredImage ? (
                  <img src={article.featuredImage} alt={article.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-100">
                    <BookOpenText size={28} className="text-indigo-300" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                  {article.category || "Article"}
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900">
                  <Link href={`/ressources/${article.slug || article.id}`} className="hover:text-indigo-600">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                  {article.excerpt || "Lire l'article pour en savoir plus."}
                </p>
              </div>
            </article>
          ))}
          {latestArticles.length === 0 &&
            featuredNew.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      </section>

      {/* Newsletter */}
      <div id="newsletter" className="surface mt-12 scroll-mt-24 p-6">
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

      {/* CTA final */}
      <div className="surface mt-10 bg-indigo-50 p-8 text-center">
        <h2 className="text-2xl font-black text-slate-900">Rejoignez Club Propreté gratuitement</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
          Créez votre compte, développez votre visibilité et accédez aux ressources utiles pour les
          professionnels de la propreté.
        </p>
        <Link href="/inscription" className="bento-btn bento-btn-primary mt-4 inline-flex">
          Créer mon compte gratuit
        </Link>
      </div>
    </PageShell>
  );
}
