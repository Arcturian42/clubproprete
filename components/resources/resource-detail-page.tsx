import Link from "next/link";
import { notFound } from "next/navigation";
import { BellRing, CalendarDays, CheckCircle2, Clock, Download, Users, Wrench } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { ResourceCard } from "@/components/resources/resource-card";
import {
  getResource,
  getResourceById,
  getResourceCategory,
  getResourceHref,
  getResourcesByCategory,
  regulatoryDisclaimer,
  type Resource,
  type ResourceCategorySlug,
} from "@/lib/resources";
import { getResourceContent, type ResourceContent } from "@/lib/resources-content";

export function resourceDetailMetadata(categorySlug: ResourceCategorySlug, slug: string) {
  const resource = getResource(categorySlug, slug);
  if (!resource) return { title: "Ressource introuvable | Club Propreté" };
  return {
    title: resource.seoTitle,
    description: resource.seoDescription,
  };
}

export function resourceStaticParams(categorySlug: ResourceCategorySlug) {
  return getResourcesByCategory(categorySlug).map((resource) => ({ slug: resource.slug }));
}

// Bloc d'état "en construction" adapté au type de ressource : la page existe
// (pas de lien mort) et annonce proprement la disponibilité du contenu final.
function ComingSoonBlock({ resource }: { resource: Resource }) {
  const isTemplate = resource.type === "Modèle" || resource.id === "modele-memoire-technique";
  const isTool = resource.type === "Outil";

  if (isTemplate) {
    return (
      <div className="surface bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <Download size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Télécharger le modèle</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              Bientôt disponible — créez votre compte pour être informé dès la mise en ligne du document.
            </p>
            <Link href="/inscription" className="bento-btn bento-btn-primary mt-3 inline-flex">
              <BellRing size={14} aria-hidden="true" /> Être informé de la disponibilité
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isTool) {
    return (
      <div className="surface bg-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Wrench size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Cet outil sera bientôt disponible</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              Nous finalisons cet outil avec des professionnels du secteur pour qu&apos;il reflète les
              cadences et coûts réels du terrain. Créez votre compte pour être prévenu de sa sortie.
            </p>
            <Link href="/inscription" className="bento-btn bento-btn-primary mt-3 inline-flex">
              <BellRing size={14} aria-hidden="true" /> Être prévenu de la sortie
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface bg-slate-50 p-6">
      <h2 className="text-lg font-black text-slate-900">Contenu complet en cours de rédaction</h2>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
        Cette ressource est en cours de rédaction avec des professionnels du secteur. Créez votre compte
        gratuit pour être informé de sa publication et recevoir les nouvelles ressources.
      </p>
      <Link href="/inscription" className="bento-btn bento-btn-primary mt-3 inline-flex">
        <BellRing size={14} aria-hidden="true" /> Être informé de la publication
      </Link>
    </div>
  );
}

export async function ResourceDetailPage({
  categorySlug,
  params,
}: {
  categorySlug: ResourceCategorySlug;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getResourceCategory(categorySlug);
  const resource = getResource(categorySlug, slug);
  if (!category || !resource) notFound();

  const related = resource.relatedResources
    .map((id) => getResourceById(id))
    .filter((r): r is Resource => Boolean(r));

  const isComparison = resource.type === "Comparatif";
  const content = getResourceContent(resource.id);

  // Données structurées (SEO/GEO) : Article + FAQ + fil d'Ariane.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clubproprete.com";
  const pageUrl = `${baseUrl}${getResourceHref(resource)}`;
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: resource.seoTitle,
      description: resource.seoDescription,
      inLanguage: "fr-FR",
      dateModified: resource.updatedAt,
      mainEntityOfPage: pageUrl,
      author: { "@type": "Organization", name: "Club Propreté", url: baseUrl },
      publisher: { "@type": "Organization", name: "Club Propreté", url: baseUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Ressources", item: `${baseUrl}/ressources` },
        { "@type": "ListItem", position: 3, name: category.title, item: `${baseUrl}/ressources/${category.slug}` },
        { "@type": "ListItem", position: 4, name: resource.title, item: pageUrl },
      ],
    },
  ];
  if (content?.faq && content.faq.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return (
    <PageShell eyebrow={category.title} title={resource.title} description={resource.description}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Ressources", href: "/ressources" },
          { label: category.title, href: `/ressources/${category.slug}` },
          { label: resource.title },
        ]}
      />

      {/* Métadonnées */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">{resource.type}</span>
        <span className="bento-tag border-slate-200 bg-white text-slate-600">
          <Clock size={12} aria-hidden="true" /> {resource.estimatedTime}
        </span>
        <span className="bento-tag border-slate-200 bg-white text-slate-600">
          <Users size={12} aria-hidden="true" /> {resource.audience.join(" · ")}
        </span>
        <span className="bento-tag border-slate-200 bg-white text-slate-600">
          <CalendarDays size={12} aria-hidden="true" /> Mis à jour le{" "}
          {new Date(resource.updatedAt).toLocaleDateString("fr-FR")}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          {/* À retenir */}
          {resource.keyPoints && resource.keyPoints.length > 0 && (
            <section className="surface p-6">
              <h2 className="text-lg font-black text-slate-900">À retenir</h2>
              <ul className="mt-3 space-y-2">
                {resource.keyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-600">
                    <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Contenu rédactionnel complet (ressource publiée) */}
          {content && (
            <>
              <section className="surface p-6">
                <p className="text-base font-medium leading-8 text-slate-700">{content.intro}</p>
              </section>
              {content.sections.map((section) => (
                <section key={section.heading} className="surface p-6">
                  <h2 className="text-lg font-black text-slate-900">{section.heading}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="mt-3 text-sm font-medium leading-7 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-3 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet.slice(0, 40)}
                          className="flex items-start gap-2 text-sm font-medium leading-6 text-slate-600"
                        >
                          <CheckCircle2 size={15} className="mt-1 shrink-0 text-indigo-500" aria-hidden="true" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.table && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                        <caption className="sr-only">{section.table.caption}</caption>
                        <thead>
                          <tr className="border-b-2 border-slate-900 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                            {section.table.headers.map((header) => (
                              <th key={header} className="py-2 pr-4">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row) => (
                            <tr key={row[0]} className="border-b border-slate-100 align-top">
                              {row.map((cell, index) => (
                                <td
                                  key={cell}
                                  className={`py-2 pr-4 ${index === 0 ? "font-bold text-slate-700" : "text-slate-600"}`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ))}
              {content.faq && content.faq.length > 0 && (
                <section className="surface p-6">
                  <h2 className="text-lg font-black text-slate-900">Questions fréquentes</h2>
                  <div className="mt-3 space-y-4">
                    {content.faq.map((item) => (
                      <div key={item.q}>
                        <h3 className="text-sm font-black text-slate-900">{item.q}</h3>
                        <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Aperçu du contenu (ressource non encore rédigée) */}
          {!content && (
          <section className="surface p-6">
            <h2 className="text-lg font-black text-slate-900">Ce que couvre cette ressource</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{resource.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span key={tag} className="bento-tag border-slate-200 bg-slate-50 text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            {isComparison && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                  <caption className="sr-only">Structure du tableau comparatif à venir</caption>
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-4">Critère</th>
                      <th className="py-2 pr-4">Option A</th>
                      <th className="py-2 pr-4">Option B</th>
                      <th className="py-2">Recommandation</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    {["Usage conseillé", "Budget indicatif", "Points forts", "Limites"].map((row) => (
                      <tr key={row} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-bold text-slate-600">{row}</td>
                        <td className="py-2 pr-4">À venir</td>
                        <td className="py-2 pr-4">À venir</td>
                        <td className="py-2">À venir</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Le tableau comparatif détaillé sera publié avec la version complète de cette ressource.
                </p>
              </div>
            )}
          </section>
          )}

          {/* Le bloc téléchargement (modèles) et le placeholder outil restent
              affichés même quand l'article est rédigé ; le bloc générique
              « en cours de rédaction » disparaît dès que le contenu existe. */}
          {(!content || resource.type === "Modèle" || resource.type === "Outil") && (
            <ComingSoonBlock resource={resource} />
          )}

          {categorySlug === "reglementation" && (
            <p className="text-xs font-semibold leading-5 text-slate-400">{regulatoryDisclaimer}</p>
          )}
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6">
          {isComparison && (
            <div className="surface p-5">
              <h2 className="text-base font-black text-slate-900">Trouver un fournisseur</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Comparez puis contactez directement les fournisseurs référencés dans l&apos;annuaire.
              </p>
              <Link href="/annuaire/fournisseurs" className="bento-btn bento-btn-primary mt-3 inline-flex w-full justify-center">
                Voir l&apos;annuaire fournisseurs
              </Link>
            </div>
          )}

          {related.length > 0 && (
            <div>
              <h2 className="text-base font-black text-slate-900">Ressources liées</h2>
              <div className="mt-3 grid gap-4">
                {related.map((relatedResource) => (
                  <ResourceCard key={relatedResource.id} resource={relatedResource} />
                ))}
              </div>
            </div>
          )}

          <div className="surface bg-indigo-50 p-5">
            <h2 className="text-base font-black text-slate-900">Rejoignez Club Propreté</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Créez votre compte gratuit pour accéder aux ressources, référencer votre activité et
              développer votre réseau.
            </p>
            <Link href="/inscription" className="bento-btn bento-btn-primary mt-3 inline-flex w-full justify-center">
              Créer mon compte gratuit
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
