import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Euro,
  MapPin,
  Target,
  CheckCircle2,
} from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { applyToJob, getJobById } from "@/lib/actions/jobs";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const [job, session] = await Promise.all([getJobById(id), auth()]);

  if (!job || job.deletedAt || job.status !== "published") {
    notFound();
  }

  const candidateProfile =
    session?.user?.role === "candidate_profile"
      ? await prisma.candidateProfile.findFirst({
          where: { userId: session.user.id, deletedAt: null },
        })
      : null;
  const existingApplication = candidateProfile
    ? await prisma.jobApplication.findFirst({
        where: { jobId: job.id, candidateProfileId: candidateProfile.id, deletedAt: null },
      })
    : null;

  async function handleApply(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect(`/connexion?callbackUrl=/emploi/${id}`);
    }

    if (currentSession.user.role !== "candidate_profile") {
      redirect("/inscription?role=candidate_profile");
    }

    const currentCandidateProfile = await prisma.candidateProfile.findFirst({
      where: { userId: currentSession.user.id, deletedAt: null },
    });

    if (!currentCandidateProfile) {
      redirect("/profil");
    }

    const payload = new FormData();
    payload.append("jobId", id);
    payload.append("message", String(formData.get("message") ?? ""));

    await applyToJob(payload);
    redirect("/dashboard");
  }

  const requirements = job.requiredSkills
    ? job.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <PageShell
      eyebrow="Offre d'emploi"
      title={job.title}
      description={`${job.employerName || job.company?.name || "Entreprise"} · ${job.city || ""} · ${job.contractType}`}
      actions={
        <Link href="/emploi" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux offres
        </Link>
      }
    >
      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Contrat" value={job.contractType} detail={job.workingTime || "Non précisé"} />
        <StatCard label="Ville" value={job.city || "Non précisée"} detail={job.postalCode || ""} />
        <StatCard
          label="Salaire"
          value={
            job.salaryMin && job.salaryMax
              ? `${job.salaryMin}€ – ${job.salaryMax}€`
              : job.salaryMin
              ? `À partir de ${job.salaryMin}€`
              : "Non précisé"
          }
          detail="Rémunération"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Description */}
          <article className="surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                <BriefcaseBusiness size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Description du poste</h2>
            </div>
            <p className="text-base font-medium leading-7 text-slate-600">
              {job.description || "Aucune description disponible pour cette offre."}
            </p>
          </article>

          {/* Prérequis */}
          {requirements.length > 0 && (
            <article className="surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-2 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
                  <Target size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Prérequis</h2>
              </div>
              <ul className="space-y-2">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-600 font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Employeur */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Employeur</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Nom</p>
                  <p className="font-bold text-slate-900">{job.employerName || job.company?.name || "Non précisé"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Ville</p>
                  <p className="font-bold text-slate-900">{job.company?.city || job.city || "Non précisée"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Euro className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Salaire</p>
                  <p className="font-bold text-slate-900">
                    {job.salaryMin && job.salaryMax
                      ? `${job.salaryMin}€ – ${job.salaryMax}€`
                      : job.salaryMin
                      ? `À partir de ${job.salaryMin}€`
                      : "Non précisé"}
                  </p>
                </div>
              </div>
            </div>

            {(job.employerHref || job.company?.id) && (
              <div className="mt-6">
                <Link
                  href={job.employerHref || `/annuaire/societes/${job.company?.id}`}
                  className="bento-btn w-full justify-center"
                >
                  Voir la fiche
                </Link>
              </div>
            )}
          </article>

          {/* CTA Postuler */}
          <div className="surface p-6 bg-indigo-50 border-indigo-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Intéressé(e) ?</h3>
            {!session?.user ? (
              <>
                <p className="text-sm text-slate-600 mb-4">
                  Connectez-vous en tant que candidat pour postuler à cette offre.
                </p>
                <Link href={`/connexion?callbackUrl=/emploi/${job.id}`} className="bento-btn bento-btn-primary w-full justify-center block text-center">
                  Se connecter pour postuler
                </Link>
              </>
            ) : session.user.role !== "candidate_profile" ? (
              <>
                <p className="text-sm text-slate-600 mb-4">
                  Cette action est réservée aux profils candidats. Créez ou activez un profil candidat pour postuler.
                </p>
                <Link href="/inscription?role=candidate_profile" className="bento-btn bento-btn-primary w-full justify-center block text-center">
                  Créer un profil candidat
                </Link>
              </>
            ) : existingApplication ? (
              <>
                <p className="text-sm text-slate-600 mb-4">
                  Vous avez déjà postulé à cette offre. Suivez la réponse dans votre dashboard candidat.
                </p>
                <Link href="/dashboard" className="bento-btn bento-btn-primary w-full justify-center block text-center">
                  Voir mes candidatures
                </Link>
              </>
            ) : (
              <form action={handleApply} className="grid gap-3">
                <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                  Message au recruteur
                  <textarea
                    name="message"
                    rows={4}
                    className="bento-input resize-none"
                    placeholder="Présentez rapidement votre expérience et vos disponibilités."
                  />
                </label>
                <button type="submit" className="bento-btn bento-btn-primary w-full justify-center">
                  Postuler
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
