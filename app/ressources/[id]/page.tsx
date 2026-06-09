import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Tag,
  User,
  Share2,
  Bookmark
} from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { getArticleById } from "@/lib/actions/public";

type Props = {
  params: Promise<{ id: string }>;
};

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
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          label="Categorie" 
          value={article.category || "Non classé"} 
          detail="Thematique" 
        />
        <StatCard 
          label="Lecture" 
          value={article.readTime || "5 min"} 
          detail="Temps estimé" 
        />
        <StatCard 
          label="Publication" 
          value={article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : "Recent"} 
          detail="Date" 
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Contenu principal */}
        <div className="space-y-6">
          {/* Résumé */}
          {article.excerpt && (
            <article className="surface p-6 bg-indigo-50 border-indigo-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">En résumé</h2>
              </div>
              <p className="text-lg font-medium text-slate-700 italic">
                &ldquo;{article.excerpt}&rdquo;
              </p>
            </article>
          )}

          {/* Contenu */}
          <article className="surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Contenu</h2>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-base font-medium leading-7 text-slate-600 whitespace-pre-wrap">
                {article.content || "Contenu de l'article en cours de rédaction."}
              </p>
            </div>
          </article>

          {/* Tags */}
          {tags.length > 0 && (
            <article className="surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-2 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
                  <Tag size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Auteur */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Auteur</h2>
            <div className="flex items-start gap-3">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-100 p-3 text-indigo-600 shadow-[3px_3px_0px_#0f172a]">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{authorName}</p>
                <p className="text-sm text-slate-500">Contributeur Club Propreté</p>
              </div>
            </div>
          </article>

          {/* Actions */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button className="bento-btn w-full" disabled>
                <Share2 size={16} /> Partager l'article
              </button>
              <button className="bento-btn w-full" disabled>
                <Bookmark size={16} /> Sauvegarder
              </button>
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
