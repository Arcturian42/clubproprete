import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getApplicationsForJob, updateApplicationStatus } from "@/lib/actions/jobs";
import { getJobById } from "@/lib/actions/jobs";
import { ArrowLeft, Mail, Phone, MapPin, FileText, Calendar, User, StickyNote } from "lucide-react";

async function handleUpdateStatus(formData: FormData) {
  "use server";
  await updateApplicationStatus(formData);
}

const statusLabels: Record<string, string> = {
  submitted: "Reçu",
  viewed: "Vu",
  interview: "Entretien",
  rejected: "Refusé",
  hired: "Retenu",
};

const statusClasses: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-900 border-slate-900",
  viewed: "bg-indigo-50 text-indigo-700 border-indigo-300",
  interview: "bg-amber-50 text-amber-700 border-amber-300",
  rejected: "bg-rose-50 text-rose-700 border-rose-400",
  hired: "bg-emerald-50 text-emerald-700 border-emerald-400",
};

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const { jobId } = await params;

  const [jobResult, applicationsResult] = await Promise.all([
    getJobById(jobId),
    getApplicationsForJob(jobId),
  ]);

  if (!jobResult) {
    notFound();
  }

  if (!applicationsResult.success) {
    return (
      <PageShell
        eyebrow="Recrutement"
        title="Candidatures"
        description=""
        actions={
          <Link href="/dashboard/entreprise" className="bento-btn">
            <ArrowLeft size={16} /> Retour
          </Link>
        }
      >
        <div className="surface p-6 text-center">
          <p className="text-slate-600">{applicationsResult.message || "Vous n'avez pas accès aux candidatures de cette offre."}</p>
        </div>
      </PageShell>
    );
  }

  const applications = applicationsResult.applications ?? [];

  return (
    <PageShell
      eyebrow="Recrutement"
      title={`Candidatures — ${jobResult.title}`}
      description={`${applications.length} candidature${applications.length > 1 ? "s" : ""} pour cette offre.`}
      actions={
        <Link href="/dashboard/entreprise" className="bento-btn">
          <ArrowLeft size={16} /> Retour
        </Link>
      }
    >
      {applications.length === 0 ? (
        <div className="surface p-10 text-center">
          <User size={40} className="mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-black text-slate-900 mb-2">Aucune candidature</h3>
          <p className="text-slate-600">Les candidatures apparaîtront ici dès qu’un candidat postulera à cette offre.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const candidate = app.candidateProfile;
            const user = candidate?.user;
            return (
              <div key={app.id} className="surface p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Colonne candidat */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center text-indigo-700 font-black">
                        {user?.firstName?.[0] ?? "?"}
                        {user?.lastName?.[0] ?? ""}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {user?.id ? (
                            <Link href={`/membres/${user.id}`} className="hover:text-indigo-600 hover:underline">
                              {user.firstName} {user.lastName}
                            </Link>
                          ) : (
                            <>
                              {user?.firstName} {user?.lastName}
                            </>
                          )}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                          {user?.city && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-indigo-600" /> {user.city}
                            </span>
                          )}
                          {user?.email && (
                            <a href={`mailto:${encodeURIComponent(user.email)}`} className="flex items-center gap-1 hover:text-indigo-600">
                              <Mail size={14} className="text-indigo-600" /> {user.email}
                            </a>
                          )}
                          {user?.phone && (
                            <a href={`tel:${encodeURIComponent(user.phone.replace(/\s/g, ""))}`} className="flex items-center gap-1 hover:text-indigo-600">
                              <Phone size={14} className="text-indigo-600" /> {user.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {app.message && (
                      <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-line">{app.message}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm">
                      {candidate?.cvUrl && (
                        <a
                          href={candidate.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bento-btn bento-btn-primary"
                        >
                          <FileText size={14} /> Voir le CV
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar size={14} /> Candidature envoyée le{" "}
                        {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  {/* Colonne actions */}
                  <div className="lg:w-80 space-y-4">
                    <form action={handleUpdateStatus} className="space-y-4">
                      <input type="hidden" name="applicationId" value={app.id} />

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                          Statut
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`bento-tag ${statusClasses[app.status] || ""}`}>
                            {statusLabels[app.status] || app.status}
                          </span>
                        </div>
                        <select
                          name="status"
                          defaultValue={app.status}
                          className="bento-input w-full"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                          <StickyNote size={12} className="inline mr-1" />
                          Notes internes
                        </label>
                        <textarea
                          name="internalNotes"
                          defaultValue={app.internalNotes ?? ""}
                          rows={4}
                          className="bento-input w-full resize-none"
                          placeholder="Ajoutez des notes visibles uniquement par votre équipe..."
                        />
                      </div>

                      <button type="submit" className="bento-btn bento-btn-primary w-full">
                        Enregistrer
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
