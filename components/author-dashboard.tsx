"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, FileText, PenLine, Save } from "lucide-react";
import { createArticle, requestAuthorAccess, submitDraftArticle } from "@/lib/actions/articles";
import { ArticleEditor, ImageUploadField } from "@/components/article-editor";
import { StatusPill } from "@/components/status-pill";

type AuthorArticle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  publishedAt: string | null;
};

type AuthorApplication = {
  status: string;
  articleTitle: string | null;
  rejectionReason: string | null;
} | null;

function CategorySelect({ categories, defaultValue = "" }: { categories: string[]; defaultValue?: string }) {
  return (
    <select name="category" required defaultValue={defaultValue} className="bento-input w-full">
      <option value="" disabled>
        Choisir une catégorie…
      </option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] font-semibold text-slate-400">{hint}</span>}
    </label>
  );
}

export function AuthorDashboard({
  application,
  articles,
  canWrite,
  categories,
}: {
  application: AuthorApplication;
  articles: AuthorArticle[];
  canWrite: boolean;
  categories: string[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!String(formData.get("featuredImage") || "").trim()) {
      setMessage("");
      setErrors({ featuredImage: "L'image de couverture est obligatoire." });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setMessage("");

    const result = await requestAuthorAccess(formData);
    setSubmitting(false);

    if (!result.success) {
      const mapped: Record<string, string> = {};
      const fieldErrors = "errors" in result ? (result.errors as Record<string, string[]> | undefined) : undefined;
      for (const [key, values] of Object.entries(fieldErrors || {})) mapped[key] = values[0];
      if ("message" in result && result.message) mapped.general = result.message;
      setErrors(mapped);
      return;
    }

    setMessage("Demande envoyée. Votre premier article sera publié après acceptation admin.");
  }

  async function submitArticle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = submitter?.value === "draft" ? "draft" : "pending";

    const formData = new FormData(form);
    formData.set("status", status);

    // L'image de couverture est obligatoire pour soumettre à la modération
    // (mais pas pour enregistrer un simple brouillon).
    if (status === "pending" && !String(formData.get("featuredImage") || "").trim()) {
      setMessage("");
      setErrors({ featuredImage: "L'image de couverture est obligatoire." });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setMessage("");

    const result = await createArticle(formData);
    setSubmitting(false);

    if (!result.success) {
      const mapped: Record<string, string> = {};
      const fieldErrors = "errors" in result ? (result.errors as Record<string, string[]> | undefined) : undefined;
      for (const [key, values] of Object.entries(fieldErrors || {})) mapped[key] = values[0];
      if ("message" in result && result.message) mapped.general = result.message;
      setErrors(mapped);
      return;
    }

    form.reset();
    setMessage(status === "draft" ? "Brouillon enregistré." : "Article soumis à la modération.");
  }

  async function submitDraft(articleId: string) {
    setSubmitting(true);
    setErrors({});
    setMessage("");

    const result = await submitDraftArticle(articleId);
    setSubmitting(false);

    if (!result.success) {
      setErrors({ general: result.message || "Impossible de soumettre le brouillon." });
      return;
    }

    setMessage("Brouillon soumis à la modération.");
  }

  // ── Pas encore d'accès auteur ──────────────────────────────────────────────
  if (!canWrite) {
    // Demande déjà envoyée et en attente : on ne redemande PAS la motivation.
    if (application && application.status === "pending") {
      return (
        <section className="surface mx-auto max-w-xl p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] border-2 border-slate-900 bg-amber-400 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <Clock size={22} aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">Demande auteur en cours d&apos;examen</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Votre demande a bien été reçue. Dès qu&apos;elle est validée, vous pourrez rédiger et publier vos articles
            directement depuis cet espace.
          </p>
          {application.articleTitle && (
            <p className="mt-4 text-sm font-bold text-slate-700">Article proposé : {application.articleTitle}</p>
          )}
          <div className="mt-4 flex justify-center">
            <StatusPill status={application.status} />
          </div>
        </section>
      );
    }

    // Première demande (ou après refus) : on demande la motivation + 1er article.
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <PenLine size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Accès auteur</p>
            <h2 className="text-xl font-black text-slate-900">Proposez votre premier article</h2>
          </div>
        </div>

        {application?.status === "rejected" && application.rejectionReason && (
          <div className="mb-4 rounded-[14px] border-2 border-red-300 bg-red-50 p-3 text-sm font-bold text-red-600">
            Demande précédente refusée : {application.rejectionReason}
          </div>
        )}

        <form onSubmit={submitRequest} className="surface grid gap-4 p-6">
          {message && (
            <div className="flex items-center gap-2 rounded-[14px] border-2 border-emerald-300 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={16} /> {message}
            </div>
          )}
          {errors.general && (
            <div className="rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">{errors.general}</div>
          )}
          <Field label="Titre de l'article">
            <input name="title" required className="bento-input w-full" placeholder="Titre de votre premier article" />
          </Field>
          <Field label="Catégorie">
            <CategorySelect categories={categories} />
          </Field>
          <Field label="Image de couverture" hint="Obligatoire : affichée en tête d'article et sur le blog.">
            <ImageUploadField name="featuredImage" required />
            {errors.featuredImage && (
              <p className="mt-1 text-[11px] font-bold text-red-500">{errors.featuredImage}</p>
            )}
          </Field>
          <Field label="Résumé" hint="Une à deux phrases qui donnent envie de lire.">
            <textarea name="excerpt" required rows={3} className="bento-input w-full resize-none" placeholder="Résumé de l'article" />
          </Field>
          <Field label="Contenu de l'article">
            <ArticleEditor name="content" required placeholder="Rédigez votre article…" />
          </Field>
          <Field label="Pourquoi voulez-vous écrire sur Club Propreté ?" hint="Demandé uniquement pour cette première demande.">
            <textarea name="motivation" required rows={3} className="bento-input w-full resize-none" placeholder="Votre motivation" />
          </Field>
          <Field label="Votre expertise (optionnel)">
            <input name="expertise" className="bento-input w-full" placeholder="Ex. : gérant d'entreprise de propreté depuis 10 ans" />
          </Field>
          {Object.entries(errors)
            .filter(([key]) => key !== "general")
            .map(([key, value]) => (
              <p key={key} className="text-[11px] font-bold text-red-500">{value}</p>
            ))}
          <button type="submit" disabled={submitting} className="bento-btn bento-btn-primary justify-center">
            <PenLine size={16} /> {submitting ? "Envoi…" : "Demander l'accès auteur"}
          </button>
        </form>
      </div>
    );
  }

  // ── Accès auteur accordé : rédaction + suivi ───────────────────────────────
  const drafts = articles.filter((article) => article.status === "draft");
  const pending = articles.filter((article) => article.status === "pending");
  const published = articles.filter((article) => article.status === "published");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Rédaction */}
      <section className="surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <PenLine size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Auteur</p>
            <h2 className="text-xl font-black text-slate-900">Rédiger un nouvel article</h2>
          </div>
        </div>
        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-[14px] border-2 border-emerald-300 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}
        {errors.general && (
          <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">{errors.general}</div>
        )}
        <form onSubmit={submitArticle} className="grid gap-4">
          <Field label="Titre">
            <input name="title" required className="bento-input w-full" placeholder="Titre de l'article" />
          </Field>
          <Field label="Catégorie">
            <CategorySelect categories={categories} />
          </Field>
          <Field label="Image de couverture" hint="Obligatoire pour soumettre à la modération.">
            <ImageUploadField name="featuredImage" required />
            {errors.featuredImage && (
              <p className="mt-1 text-[11px] font-bold text-red-500">{errors.featuredImage}</p>
            )}
          </Field>
          <Field label="Résumé">
            <textarea name="excerpt" rows={3} className="bento-input w-full resize-none" placeholder="Résumé affiché dans le blog" />
          </Field>
          <Field label="Contenu">
            <ArticleEditor name="content" placeholder="Rédigez votre article…" />
          </Field>

          <details className="rounded-[14px] border-2 border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-black text-slate-900">Métadonnées & SEO (optionnel)</summary>
            <div className="mt-4 grid gap-4">
              <Field label="Titre SEO" hint="Affiché dans Google. Laissez vide pour utiliser le titre.">
                <input name="seoTitle" className="bento-input w-full" placeholder="Titre optimisé pour le référencement" />
              </Field>
              <Field label="Méta-description">
                <textarea name="seoDescription" rows={2} className="bento-input w-full resize-none" placeholder="Description pour les moteurs de recherche" />
              </Field>
              <Field label="Temps de lecture">
                <input name="readTime" className="bento-input w-full" placeholder="Ex. : 5 min" />
              </Field>
              <Field label="Tags" hint="Séparés par des virgules.">
                <input name="tags" className="bento-input w-full" placeholder="propreté, recrutement, RSE" />
              </Field>
            </div>
          </details>

          <div className="flex flex-wrap gap-3">
            <button type="submit" name="status" value="pending" disabled={submitting} className="bento-btn bento-btn-primary">
              <Save size={16} /> {submitting ? "Envoi…" : "Soumettre à la modération"}
            </button>
            <button type="submit" name="status" value="draft" disabled={submitting} className="bento-btn">
              <FileText size={16} /> Enregistrer le brouillon
            </button>
          </div>
        </form>
      </section>

      {/* Suivi */}
      <section className="space-y-5">
        <ArticleGroup title="Brouillons" articles={drafts} onSubmitDraft={submitDraft} submitting={submitting} />
        <ArticleGroup title="En attente de validation" articles={pending} />
        <ArticleGroup title="Publiés" articles={published} />
        {articles.length === 0 && (
          <div className="surface p-6 text-sm font-semibold text-slate-500">
            Aucun article pour le moment. Rédigez votre premier article à gauche.
          </div>
        )}
      </section>
    </div>
  );
}

function ArticleGroup({
  title,
  articles,
  onSubmitDraft,
  submitting,
}: {
  title: string;
  articles: AuthorArticle[];
  onSubmitDraft?: (articleId: string) => void;
  submitting?: boolean;
}) {
  if (articles.length === 0) return null;
  return (
    <div className="surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">{title}</h3>
        <span className="text-xs font-extrabold text-slate-400">{articles.length}</span>
      </div>
      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="rounded-[14px] border-2 border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-black text-slate-900">{article.title}</p>
                <p className="text-xs font-semibold text-slate-500">
                  {article.publishedAt ? `Publié le ${article.publishedAt}` : `Mis à jour le ${article.updatedAt}`}
                </p>
              </div>
              <StatusPill status={article.status} />
            </div>
            {article.status === "published" && (
              <Link
                href={`/ressources/${article.slug || article.id}`}
                className="mt-3 inline-flex text-xs font-extrabold uppercase tracking-wide text-indigo-600 hover:text-indigo-800"
              >
                Voir l&apos;article
              </Link>
            )}
            {article.status === "draft" && onSubmitDraft && (
              <button
                type="button"
                onClick={() => onSubmitDraft(article.id)}
                disabled={submitting}
                className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-indigo-600 hover:text-indigo-800"
              >
                <Save size={14} /> Soumettre à la modération
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
