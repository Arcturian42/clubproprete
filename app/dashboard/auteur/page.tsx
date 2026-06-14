import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { AuthorDashboard } from "@/components/author-dashboard";
import { PageShell } from "@/components/page-shell";
import { getMyAuthorWorkspace } from "@/lib/actions/articles";
import { getBlogCategories } from "@/lib/resources";

export default async function AuthorDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/dashboard/auteur");
  }

  const workspace = await getMyAuthorWorkspace();

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Espace auteur"
      description="Demandez l'accès auteur, proposez votre premier article et suivez vos brouillons et publications."
      actions={
        <Link href="/dashboard" className="bento-btn">
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>
      }
    >
      <AuthorDashboard
        categories={getBlogCategories()}
        canWrite={workspace.canWrite}
        application={
          workspace.application
            ? {
                status: workspace.application.status,
                articleTitle: workspace.application.article?.title ?? null,
                rejectionReason: workspace.application.rejectionReason ?? null,
              }
            : null
        }
        articles={workspace.articles.map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          status: article.status,
          updatedAt: article.updatedAt.toLocaleDateString("fr-FR"),
          publishedAt: article.publishedAt ? article.publishedAt.toLocaleDateString("fr-FR") : null,
        }))}
      />
    </PageShell>
  );
}
