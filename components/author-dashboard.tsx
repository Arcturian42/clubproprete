"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, PenLine, Save } from "lucide-react";
import { createArticle, requestAuthorAccess, submitDraftArticle } from "@/lib/actions/articles";
import { EntityCard } from "@/components/entity-card";
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

export function AuthorDashboard({
  application,
  articles,
  canWrite,
}: {
  application: AuthorApplication;
  articles: AuthorArticle[];
  canWrite: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setMessage("");

    const result = await requestAuthorAccess(new FormData(event.currentTarget));
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

    setSubmitting(true);
    setErrors({});
    setMessage("");

    const formData = new FormData(form);
    formData.set("status", status);

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

  if (!canWrite) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <EntityCard
          title="Devenir auteur"
          subtitle="La demande doit contenir votre premier article."
          meta={[application ? `Statut ${application.status}` : "Demande requise", "Validation admin"]}
        >
          {application && (
            <div className="space-y-3">
              <StatusPill status={application.status} />
              <p className="text-sm font-semibold text-slate-500">
                Article proposé : {application.articleTitle || "Non renseigné"}
              </p>
              {application.rejectionReason && <p className="text-sm font-bold text-red-600">{application.rejectionReason}</p>}
            </div>
          )}
        </EntityCard>

        <form onSubmit={submitRequest} className="surface p-6">
          {message && (
            <div className="mb-4 flex items-center gap-2 rounded-[14px] border-2 border-emerald-300 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={16} /> {message}
            </div>
          )}
          {errors.general && <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">{errors.general}</div>}
          <div className="grid gap-4">
            <input name="title" required className="bento-input w-full" placeholder="Titre du premier article" />
            <input name="category" className="bento-input w-full" placeholder="Catégorie" />
            <textarea name="excerpt" required rows={3} className="bento-input w-full resize-none" placeholder="Résumé de l'article" />
            <textarea name="content" required rows={9} className="bento-input w-full resize-none" placeholder="Premier article complet" />
            <textarea name="motivation" required rows={3} className="bento-input w-full resize-none" placeholder="Pourquoi voulez-vous écrire sur Club Propreté ?" />
            <input name="expertise" className="bento-input w-full" placeholder="Votre expertise principale" />
          </div>
          {Object.entries(errors).filter(([key]) => key !== "general").map(([key, value]) => (
            <p key={key} className="mt-2 text-[11px] font-bold text-red-500">{value}</p>
          ))}
          <button type="submit" disabled={submitting} className="bento-btn bento-btn-primary mt-5">
            <PenLine size={16} /> {submitting ? "Envoi..." : "Demander l'accès auteur"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <PenLine size={20} />
          </div>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Auteur</p>
            <h2 className="text-xl font-black text-slate-900">Nouvel article</h2>
          </div>
        </div>
        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-[14px] border-2 border-emerald-300 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}
        {errors.general && <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">{errors.general}</div>}
        <form onSubmit={submitArticle} className="grid gap-4">
          <input name="title" required className="bento-input w-full" placeholder="Titre" />
          <input name="slug" className="bento-input w-full" placeholder="Slug optionnel" />
          <input name="category" className="bento-input w-full" placeholder="Catégorie" />
          <textarea name="excerpt" rows={3} className="bento-input w-full resize-none" placeholder="Résumé" />
          <textarea name="content" rows={9} className="bento-input w-full resize-none" placeholder="Contenu" />
          <input name="readTime" className="bento-input w-full" placeholder="Temps de lecture" />
          <input name="tags" className="bento-input w-full" placeholder="Tags séparés par des virgules" />
          <div className="flex flex-wrap gap-3">
            <button type="submit" name="status" value="pending" disabled={submitting} className="bento-btn bento-btn-primary">
              <Save size={16} /> {submitting ? "Envoi..." : "Soumettre à la modération"}
            </button>
            <button type="submit" name="status" value="draft" disabled={submitting} className="bento-btn">
              <FileText size={16} /> Enregistrer le brouillon
            </button>
          </div>
        </form>
      </section>

      <section className="surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <FileText size={22} className="text-indigo-600" />
          <h2 className="text-xl font-black text-slate-900">Mes articles</h2>
        </div>
        {articles.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">Aucun article pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div key={article.id} className="rounded-[14px] border-2 border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{article.title}</p>
                    <p className="text-xs font-semibold text-slate-500">Mis à jour le {article.updatedAt}</p>
                  </div>
                  <StatusPill status={article.status} />
                </div>
                {article.status === "published" && (
                  <Link href={`/ressources/${article.id}`} className="mt-3 inline-flex text-xs font-extrabold uppercase tracking-wide text-indigo-600">
                    Voir l'article
                  </Link>
                )}
                {article.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => submitDraft(article.id)}
                    disabled={submitting}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-indigo-600 hover:text-indigo-800"
                  >
                    <Save size={14} /> Soumettre à la modération
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
