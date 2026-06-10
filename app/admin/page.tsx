import { redirect } from "next/navigation";
import Link from "next/link";
import { CircleSlash, Download, ShieldAlert, ShieldCheck, Users, ArrowRight, Briefcase } from "lucide-react";
import { auth } from "@/auth";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { EmptyState } from "@/components/empty-state";
import { getAdminQueue, getPendingJobsForModeration, updateEntityStatus } from "@/lib/actions/admin";
import { getAdminStats } from "@/lib/actions/users";
import { needsAdminValidation } from "@/lib/permissions";

export default async function AdminPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "super_admin";
  const isAdmin = session?.user?.role === "admin" || isSuperAdmin;

  if (!isAdmin) {
    redirect("/");
  }

  const [queuesResult, statsResult, pendingJobs] = await Promise.all([
    getAdminQueue(),
    getAdminStats(),
    getPendingJobsForModeration(),
  ]);

  const queues = queuesResult;
  const stats = statsResult.success ? statsResult.stats : null;

  const pendingCount = queues.filter((item) => needsAdminValidation(item.status)).length;
  const approvedCount = queues.filter((item) => item.status === "approved" || item.status === "published").length;

  async function handleValidate(formData: FormData) {
    "use server";
    await updateEntityStatus(formData);
  }

  return (
    <PageShell
      eyebrow={isSuperAdmin ? "Back-office — Super Admin" : "Back-office — Admin"}
      title="Validation et moderation"
      description="Centre de controle pour garder la qualite des donnees, appliquer les restrictions et preparer les exports."
      actions={
        <div className="flex flex-wrap gap-3">
          {isSuperAdmin && (
            <Link href="/admin/users" className="bento-btn bento-btn-primary">
              <Users size={16} aria-hidden="true" /> Gestion utilisateurs
            </Link>
          )}
          <a href="/api/admin/export" className="bento-btn" download>
            <Download size={16} aria-hidden="true" /> Export CSV
          </a>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {isSuperAdmin ? (
          <span className="bento-tag border-rose-400 bg-rose-50 text-rose-700">
            <ShieldCheck size={13} aria-hidden="true" /> Super Admin
          </span>
        ) : (
          <span className="bento-tag border-indigo-400 bg-indigo-50 text-indigo-700">
            <ShieldCheck size={13} aria-hidden="true" /> Admin
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="File admin" value={String(queues.length)} detail="Tous objets moderables" />
        <StatCard label="En attente" value={String(pendingCount)} detail="Action requise" />
        <StatCard label="Publies/valides" value={String(approvedCount)} detail="Visibles selon regles" />
        <StatCard label="Utilisateurs" value={stats ? String(stats.totalUsers) : "—"} detail="Total inscrits" />
      </div>

      {stats && (
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <StatCard label="Societes" value={String(stats.totalCompanies)} detail="Referencees" />
          <StatCard label="Fournisseurs" value={String(stats.totalSuppliers)} detail="Catalogue" />
          <StatCard label="Offres" value={String(stats.totalJobs)} detail="Job board" />
          <StatCard label="Formations" value={String(stats.totalTrainings)} detail="Catalogue" />
        </div>
      )}

      {/* Section modération offres pending */}
      <div className="mt-8">
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-indigo-600" />
          Offres en attente de modération
          {pendingJobs.length > 0 && (
            <span className="bento-tag border-amber-400 bg-amber-50 text-amber-700">{pendingJobs.length}</span>
          )}
        </h2>

        {pendingJobs.length === 0 ? (
          <EmptyState title="Aucune offre en attente" description="Toutes les offres ont été modérées." />
        ) : (
          <div className="overflow-x-auto rounded-[20px] border-2 border-slate-900 bg-white shadow-panel">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Offre</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Société</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Statut société</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Auteur</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Candidatures</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingJobs.map((job) => (
                  <tr key={`pending-job-${job.id}`} className="border-t-2 border-slate-900">
                    <td className="px-4 py-3 font-extrabold text-slate-900">{job.title}</td>
                    <td className="px-4 py-3 font-semibold text-slate-500">{job.employerName || job.company?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={job.employerStatus || job.company?.verificationStatus || "unknown"} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.creator ? `${job.creator.firstName || ""} ${job.creator.lastName || ""}`.trim() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job._count.applications}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <form action={handleValidate}>
                          <input type="hidden" name="entityType" value="job" />
                          <input type="hidden" name="entityId" value={job.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button type="submit" className="bento-tag border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer">Publier</button>
                        </form>
                        <form action={handleValidate} className="flex items-center gap-1">
                          <input type="hidden" name="entityType" value="job" />
                          <input type="hidden" name="entityId" value={job.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <input
                            type="text"
                            name="rejectionReason"
                            placeholder="Motif (optionnel)"
                            maxLength={500}
                            className="w-32 rounded border border-rose-300 bg-white px-2 py-1 text-[11px]"
                          />
                          <button type="submit" className="bento-tag border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer">Refuser</button>
                        </form>
                        <form action={handleValidate}>
                          <input type="hidden" name="entityType" value="job" />
                          <input type="hidden" name="entityId" value={job.id} />
                          <input type="hidden" name="status" value="archived" />
                          <button type="submit" className="bento-tag border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer">Archiver</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File générale */}
      <div className="mt-10">
        <h2 className="text-xl font-black text-slate-900 mb-4">File de modération générale</h2>
        {queues.length === 0 ? (
          <EmptyState title="File vide" description="Aucun element en attente de moderation." />
        ) : (
          <div className="overflow-x-auto rounded-[20px] border-2 border-slate-900 bg-white shadow-panel">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Element</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queues.map((item) => (
                  <tr key={`${item.entityType}-${item.id}`} className="border-t-2 border-slate-900">
                    <td className="px-4 py-3 font-extrabold text-slate-900">{item.type}</td>
                    <td className="px-4 py-3 font-semibold text-slate-500">{item.title}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <form action={handleValidate}>
                          <input type="hidden" name="entityType" value={item.entityType} />
                          <input type="hidden" name="entityId" value={item.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button type="submit" className="bento-tag border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer">Valider</button>
                        </form>
                        <form action={handleValidate} className="flex items-center gap-1">
                          <input type="hidden" name="entityType" value={item.entityType} />
                          <input type="hidden" name="entityId" value={item.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <input
                            type="text"
                            name="rejectionReason"
                            placeholder="Motif (optionnel)"
                            maxLength={500}
                            className="w-32 rounded border border-rose-300 bg-white px-2 py-1 text-[11px]"
                          />
                          <button type="submit" className="bento-tag border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer">Refuser</button>
                        </form>
                        <form action={handleValidate}>
                          <input type="hidden" name="entityType" value={item.entityType} />
                          <input type="hidden" name="entityId" value={item.id} />
                          <input type="hidden" name="status" value="archived" />
                          <button type="submit" className="bento-tag border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer">Archiver</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <EntityCard title="Permissions sensibles" subtitle="Sous-traitance visible uniquement par membres association valides." meta={["Route guard", "Server check", "Admin override"]}>
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
            <ShieldAlert size={18} aria-hidden="true" /> A verrouiller avant prod
          </div>
        </EntityCard>
        <EntityCard title="Actions interdites V1" subtitle="Paiement, abonnement, appels d'offres, achats groupes et sponsoring restent hors scope." meta={["Pas de Stripe", "Pas de premium", "Pas d'appel d'offres"]}>
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
            <CircleSlash size={18} aria-hidden="true" /> Restrictions produit conformes au PRD
          </div>
        </EntityCard>
      </div>

      {isSuperAdmin && (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <EntityCard
            title="Gestion utilisateurs"
            subtitle="Acces exclusif super admin : liste, roles, suspension des comptes."
            meta={["Super admin only", "Modification role", "Suspension compte"]}
          >
            <Link href="/admin/users" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-rose-600">
              Ouvrir <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </EntityCard>
          <EntityCard
            title="Stats plateforme"
            subtitle="Vue d'ensemble des volumes de donnees en temps reel."
            meta={[
              stats ? `${stats.totalUsers} utilisateurs` : "—",
              stats ? `${stats.totalCompanies} societes` : "—",
              stats ? `${stats.totalSuppliers} fournisseurs` : "—",
            ]}
          >
            <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
              <ShieldCheck size={15} aria-hidden="true" /> Super admin
            </span>
          </EntityCard>
        </div>
      )}
    </PageShell>
  );
}
