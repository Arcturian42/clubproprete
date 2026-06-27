import Link from "next/link";
import { Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { EmptyState } from "@/components/empty-state";
import { ResourceCard } from "@/components/resources/resource-card";
import { getPublishedArticles } from "@/lib/actions/articles";
import {
  getResourceCategory,
  getResourcesByCategory,
  regulatoryDisclaimer,
  type ResourceCategorySlug,
} from "@/lib/resources";

type CategoryPageProps = {
  categorySlug: ResourceCategorySlug;
  searchParams: Promise<{ q?: string }>;
};

export function categoryPageMetadata(categorySlug: ResourceCategorySlug) {
  const category = getResourceCategory(categorySlug);
  const title = `${category?.h1 ?? "Ressources"} | Club Propreté`;
  const description = category?.description;
  // Canonical auto-référencée + OG dédié : la page rubrique doit être indexée
  // pour elle-même, pas redirigée vers la home par le canonical hérité du layout.
  const canonical = `/ressources/${categorySlug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website" as const,
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}

export async function ResourceCategoryPage({ categorySlug, searchParams }: CategoryPageProps) {
  const category = getResourceCategory(categorySlug);
  if (!category) return null;

  const { q } = await searchParams;
  const query = q?.trim() || "";
  const allResources = getResourcesByCategory(categorySlug);
  const normalizedQuery = query.toLowerCase();
  const items = query
    ? allResources.filter(
        (resource) =>
          resource.title.toLowerCase().includes(normalizedQuery) ||
          resource.description.toLowerCase().includes(normalizedQuery) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      )
    : allResources;
  const popular = allResources.filter((resource) => resource.isPopular);

  // La rubrique média affiche aussi les derniers articles publiés sur le blog.
  // Si la base est indisponible, la page reste fonctionnelle sans cette section.
  let latestArticles: Awaited<ReturnType<typeof getPublishedArticles>>["items"] = [];
  if (categorySlug === "media" && !query) {
    try {
      latestArticles = (await getPublishedArticles(undefined, 1)).items;
    } catch (error) {
      console.error("ressources/media: articles indisponibles", error);
    }
  }

  return (
    <PageShell
      eyebrow="Ressources"
      title={category.h1}
      description={category.description}
      actions={
        <Link href="/ressources" className="bento-btn">
          ← Toutes les ressources
        </Link>
      }
    >
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Ressources", href: "/ressources" },
          { label: category.title },
        ]}
      />

      <form method="GET" action={`/ressources/${category.slug}`} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={`Rechercher dans ${category.title.toLowerCase()}...`}
            className="bento-input w-full pl-9"
          />
        </div>
        <button type="submit" className="bento-btn bento-btn-primary">
          Rechercher
        </button>
        {query && (
          <Link href={`/ressources/${category.slug}`} className="bento-btn">
            Réinitialiser
          </Link>
        )}
      </form>

      {query && (
        <p className="mt-4 text-sm font-bold text-slate-600" role="status">
          {items.length === 0
            ? `Aucune ressource pour « ${query} » dans cette rubrique.`
            : `${items.length} ressource${items.length > 1 ? "s" : ""} pour « ${query} ».`}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Aucune ressource trouvée"
          description="Essayez un autre mot-clé ou parcourez toutes les ressources de la rubrique."
          actionLabel="Voir toute la rubrique"
          actionHref={`/ressources/${category.slug}`}
        />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {latestArticles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-black text-slate-900">Derniers articles publiés</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.slice(0, 6).map((article) => (
              <li key={article.id}>
                <Link
                  href={`/ressources/${article.slug || article.id}`}
                  className="surface block h-full p-4 transition-colors hover:border-indigo-600"
                >
                  <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                    {article.category || "Article"}
                  </span>
                  <span className="mt-2 block text-sm font-black text-slate-900">{article.title}</span>
                  <span className="mt-1 block text-xs font-semibold text-slate-400">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : ""}
                    {article.readTime ? ` · ${article.readTime}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!query && popular.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-black text-slate-900">Les plus consultées</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      {categorySlug === "reglementation" && (
        <p className="mt-8 text-xs font-semibold leading-5 text-slate-400">{regulatoryDisclaimer}</p>
      )}

      <div className="surface mt-10 bg-indigo-50 p-8 text-center">
        <h2 className="text-xl font-black text-slate-900">Accédez à toutes les ressources gratuitement</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
          Créez votre compte Club Propreté pour être informé des nouvelles ressources et accéder aux
          modèles et outils dès leur publication.
        </p>
        <Link href="/inscription" className="bento-btn bento-btn-primary mt-4 inline-flex">
          Créer un compte gratuit
        </Link>
      </div>
    </PageShell>
  );
}
