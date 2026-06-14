import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Tag,
  User,
  Home,
  ChevronRight,
} from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { getArticleById } from "@/lib/actions/public";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, getBaseUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};


export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) {
    return { title: "Article introuvable" };
  }
  const description = article.excerpt || `${article.title} — un article du média Club Propreté.`;
  const image = article.featuredImage || undefined;
  return {
    title: article.title,
    description,
    alternates: { canonical: `/ressources/${article.slug ?? id}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article || article.status !== "published") {
    notFound();
  }

  const tags = article.tags ? article.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const authorName = article.author
    ? `${article.author.firstName || ""} ${article.author.lastName || ""}`.trim() || "Club Propreté"
    : "Club Propreté";
  const authorInitials = `${article.author?.firstName?.[0] ?? ""}${article.author?.lastName?.[0] ?? ""}`;

  const baseUrl = getBaseUrl();
  const absoluteImage = article.featuredImage
    ? article.featuredImage.startsWith("http")
      ? article.featuredImage
      : `${baseUrl}${article.featuredImage}`
    : undefined;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(absoluteImage ? { image: absoluteImage } : {}),
    ...(article.publishedAt ? { datePublished: new Date(article.publishedAt).toISOString() } : {}),
    ...(article.updatedAt ? { dateModified: new Date(article.updatedAt).toISOString() } : {}),
    author: {
      "@type": "Person",
      name: authorName,
      ...(article.author?.id ? { url: `${baseUrl}/membres/${article.author.id}` } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Club Propreté",
      url: baseUrl,
      logo: { "@type": "ImageObject", url: `${baseUrl}/icon` },
    },
    mainEntityOfPage: `${baseUrl}/ressources/${article.slug ?? article.id}`,
  };

  return (
    <PageShell
      eyebrow="Article"
      title={article.title}
      description={`${article.category || "Article"} · Par ${authorName}`}
      actions={
        <Link href="/ressources" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux articles
        </Link>
      }
    >
      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Blog", path: "/ressources" },
            { name: article.title, path: `/ressources/${article.slug ?? article.id}` },
          ]),
        ]}
      />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500">
          <li>
            <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
              <Home size={14} />
              <span>Accueil</span>
            </Link>
          </li>
          <li>
            <ChevronRight size={14} className="text-slate-400" />
          </li>
          <li>
            <Link href="/ressources" className="hover:text-indigo-600 transition-colors">
              Blog
            </Link>
          </li>
          <li>
            <ChevronRight size={14} className="text-slate-400" />
          </li>
          <li className="max-w-xs truncate text-slate-900" aria-current="page">
            {article.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Contenu principal */}
        <div className="space-y-8">
          {/* Header article */}
          <header className="surface p-6 lg:p-8 space-y-4">
            {article.category && (
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                {article.category}
              </span>
            )}
            <h1 className="text-3xl font-black leading-tight text-slate-900">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
              <Link
                href={`/membres/${article.author?.id}`}
                className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors"
              >
                {authorInitials ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {authorInitials}
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <User size={16} />
                  </div>
                )}
                <span>{authorName}</span>
              </Link>
              <span className="text-slate-300">·</span>
              <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : "Récent"}</span>
              <span className="text-slate-300">·</span>
              <span>{article.readTime || "5 min"} de lecture</span>
            </div>
            {article.featuredImage && (
              <div className="surface overflow-hidden">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
          </header>

          {/* Chapô */}
          {article.excerpt && (
            <div className="surface p-6 bg-indigo-50 border-indigo-200">
              <p className="text-lg font-medium leading-8 text-slate-700 italic">
                &ldquo;{article.excerpt}&rdquo;
              </p>
            </div>
          )}

          {/* Contenu */}
          <article className="surface p-6 lg:p-8">
            <div className="prose prose-slate prose-lg max-w-none prose-img:rounded-[14px] prose-img:border-2 prose-img:border-slate-900">
              {article.content ? (
                <ReactMarkdown>{article.content}</ReactMarkdown>
              ) : (
                <p className="text-slate-500">Contenu de l&apos;article en cours de rédaction.</p>
              )}
            </div>
          </article>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-slate-400" />
              {tags.map((tag) => (
                <span key={tag} className="bento-tag border-slate-200 bg-slate-50 text-slate-600 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA fin d'article */}
          <div className="surface p-6 lg:p-8 bg-slate-900 text-white">
            <h2 className="text-xl font-black">Vous avez trouvé cet article utile ?</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              Rejoignez la communauté de professionnels de la propreté et accédez à plus de ressources exclusives.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/inscription" className="bento-btn bento-btn-primary">
                Rejoindre Club Propreté
              </Link>
              <Link href="/association" className="bento-btn bg-white text-slate-900 hover:bg-slate-100">
                Découvrir l'association
              </Link>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Auteur */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Auteur</h2>
            <div className="flex items-start gap-3">
              <Link href={`/membres/${article.author?.id}`} className="shrink-0">
                {authorInitials ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                    {authorInitials}
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                    <User size={20} />
                  </div>
                )}
              </Link>
              <div>
                <Link
                  href={`/membres/${article.author?.id}`}
                  className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  {authorName}
                </Link>
                <p className="text-sm text-slate-500">Contributeur Club Propreté</p>
              </div>
            </div>
          </article>

          {/* Newsletter */}
          <EntityCard
            title="Newsletter"
            subtitle="Recevez nos derniers articles directement"
            meta={["Hebdomadaire", "Gratuit"]}
          >
            <Link href="/dashboard" className="bento-btn bento-btn-primary w-full block text-center">
              S'inscrire
            </Link>
          </EntityCard>
        </div>
      </div>
    </PageShell>
  );
}
