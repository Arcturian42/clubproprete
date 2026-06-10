import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { auth } from "@/auth";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatusPill } from "@/components/status-pill";
import { getJobsForCurrentPublisher } from "@/lib/actions/jobs";

export default async function PublisherJobsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/dashboard/entreprise/offres");
  }

  const jobs = await getJobsForCurrentPublisher();

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Mes offres d'emploi"
      description="Suivez les offres soumises, publiées et les candidatures reçues."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="bento-btn">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <Link href="/emploi/nouvelle-offre" className="bento-btn bento-btn-primary">
            Publier une offre
          </Link>
        </div>
      }
    >
      {jobs.length === 0 ? (
        <div className="surface p-8 text-center">
          <Briefcase size={34} className="mx-auto text-slate-400" />
          <h2 className="mt-3 text-xl font-black text-slate-900">Aucune offre</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Publiez votre première offre pour recevoir des candidatures.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => (
            <EntityCard
              key={job.id}
              title={job.title}
              subtitle={`${job.employerName || job.company?.name || "Structure"} · ${job.city || ""}`}
              meta={[job.contractType, `${job._count.applications} candidature(s)`]}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusPill status={job.status} />
                <div className="flex gap-2">
                  {job.status === "published" && (
                    <Link href={`/emploi/${job.id}`} className="bento-btn text-sm">
                      Voir
                    </Link>
                  )}
                  <Link href={`/dashboard/entreprise/offres/${job.id}/candidatures`} className="bento-btn bento-btn-primary text-sm">
                    Candidatures
                  </Link>
                </div>
              </div>
            </EntityCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
