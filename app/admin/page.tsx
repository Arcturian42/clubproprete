import { redirect } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, CircleSlash, Download, Gauge, ShieldAlert, ShieldCheck, Users, ArrowRight, Briefcase, UserRoundCheck, UserCog } from "lucide-react";
import { auth } from "@/auth";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { EmptyState } from "@/components/empty-state";
import { getAdminQueue, getPendingJobsForModeration, getPendingVerificationRequests, updateEntityStatus } from "@/lib/actions/admin";
import { getAdminStats, getPendingUserProfiles, getUserAccountStats, updateUserProfileVerification } from "@/lib/actions/users";
import { needsAdminValidation } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminPage() {
  const session = await auth();
  const databaseUser = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { mainRole: true, status: true, deletedAt: true } })
    : null;
  const isSuperAdmin = databaseUser?.mainRole === "super_admin";
  const isAdmin = databaseUser?.mainRole === "admin" || isSuperAdmin;

  if (!isAdmin || databaseUser?.status !== "active" || databaseUser.deletedAt) {
    redirect("/");
  }

  const [queuesResult, statsResult, pendingJobs, verificationRequests, accountStatsResult, pendingUserProfiles] = await Promise.all([
    getAdminQueue(),
    getAdminStats(),
    getPendingJobsForModeration(),
    getPendingVerificationRequests(),
    isSuperAdmin ? getUserAccountStats() : Promise.resolve(null),
    isSuperAdmin ? getPendingUserProfiles() : Promise.resolve([]),
  ]);

  const queues = queuesResult;
  const stats = statsResult.success ? statsResult.stats : null;
  const accountStats = accountStatsResult?.success ? accountStatsResult.stats : null;

  const pendingCount = queues.filter((item) => needsAdminValidation(item.status)).length;
  const approvedCount = queues.filter((item) => item.status === "approved" || item.status === "published").length;

  async function handleValidate(formData: FormData) {
    "use server";
    await updateEntityStatus(formData);
  }

  async function handleProfileVerification(formData: FormData) {
    "use server";
    await updateUserProfileVerification(formData);
  }

  return (
    <PageShell
      eyebrow={isSuperAdmin ? "Back-office — Super Admin" : "Back-office — Admin"}
      title={isSuperAdmin ? "Centre de contrôle" : "Validation et modération"}
      description={
        isSuperAdmin
          ? "Pilotage des utilisateurs, vérifications, validations métier, modération et sécurité de la plateforme."
          : "Centre de validation pour garder la qualité des données, appliquer les restrictions et préparer les exports."
      }
      actions={
        <div className="flex flex-wrap gap-3">
          {isSuperAdmin && (
            <Link href="/admin/dashboard" className="bento-btn bento-btn-primary">
              <Gauge size={16} aria-hidden="true" /> Tableau de bord global
            </Link>
          )}
          {isSuperAdmin && (
            <Link href="/admin/users" className="bento-btn">
              <Users size={16} aria-hidden="true" /> Gestion utilisateurs
            </Link>
          )}
          <a href="/api/admin/export" className="bento-btn" download>
            <Download size={16} aria-hidden="true" /> Export CSV
          </a>
        </div>
      }
    >
      <AdminNav current="overview" isSuperAdmin={isSuperAdmin} />

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
        <StatCard label="File admin" value={String(queues.length)} detail="Tous objets modérables" />
        <StatCard label="En attente" value={String(pendingCount)} detail="Action requise" />
        <StatCard label="Publiés/validés" value={String(approvedCount)} detail="Visibles selon règles" />
        <StatCard label="Utilisateurs" value={stats ? String(stats.totalUsers) : "—"} detail="Total inscrits" />
      </div>

      {stats && (
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <StatCard label="Sociétés" value={String(stats.totalCompanies)} detail="Référencées" />
          <StatCard label="Fournisseurs" value={String(stats.totalSuppliers)} detail="Catalogue" />
          <StatCard label="Offres" value={String(stats.totalJobs)} detail="Job board" />
          <StatCard label="Formations" value={String(stats.totalTrainings)} detail="Catalogue" />
        </div>
      )}

      {isSuperAdmin && accountStats && (
        <section className="mt-8 rounded-[22px] border-2 border-slate-900 bg-slate-900 p-5 text-white shadow-panel sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-300">Contrôle des comptes</p>
              <h2 className="mt-2 text-2xl font-black">Utilisateurs, identité et profils</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                Suivez les comptes à examiner, les profils en attente et les accès suspendus depuis un espace réservé au super admin.
              </p>
            </div>
            <Link href="/admin/users" className="bento-btn border-white bg-white text-slate-900 shadow-[3px_3px_0px_#fbbf24] hover:bg-amber-50">
              <UserCog size={16} aria-hidden="true" /> Ouvrir la gestion complète
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[16px] border border-slate-700 bg-slate-800 p-4">
              <p className="text-2xl font-black text-amber-300">{accountStats.profilePending}</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Profils à vérifier</p>
            </div>
            <div className="rounded-[16px] border border-slate-700 bg-slate-800 p-4">
              <p className="text-2xl font-black">{accountStats.emailUnverified}</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Emails non vérifiés</p>
            </div>
            <div className="rounded-[16px] border border-slate-700 bg-slate-800 p-4">
              <p className="text-2xl font-black">{accountStats.onboardingIncomplete}</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Onboardings incomplets</p>
            </div>
            <div className="rounded-[16px] border border-slate-700 bg-slate-800 p-4">
              <p className="text-2xl font-black text-rose-300">{accountStats.suspended}</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Comptes suspendus</p>
            </div>
          </div>
        </section>
      )}

      {isSuperAdmin && (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-indigo-600">Identité membre</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-black text-slate-900">
                <UserRoundCheck size={20} aria-hidden="true" /> Profils utilisateurs à examiner
              </h2>
            </div>
            <Link href="/admin/users?verification=pending" className="bento-btn min-h-0 px-3 py-2 text-xs">
              Voir toute la file <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {pendingUserProfiles.length === 0 ? (
            <EmptyState title="Aucun profil en attente" description="Les demandes de vérification de profils utilisateurs apparaîtront ici." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingUserProfiles.map((user) => (
                <article key={user.id} className="rounded-[20px] border-2 border-slate-900 bg-white p-5 shadow-panel">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-slate-900">{`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Utilisateur sans nom"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{user.email}</p>
                    </div>
                    <span className="bento-tag border-amber-400 bg-amber-50 text-amber-700">À vérifier</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-extrabold uppercase tracking-wide text-slate-400">Complétude</p>
                      <p className="mt-1 text-base font-black text-slate-900">{user.profile?.completionScore ?? 0}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-extrabold uppercase tracking-wide text-slate-400">Contrôles</p>
                      <p className="mt-1 font-bold text-slate-700">Email {user.emailVerified ? "vérifié" : "non vérifié"}</p>
                    </div>
                  </div>
                  {user.profile?.headline && <p className="mt-3 text-sm font-semibold text-slate-600">{user.profile.headline}</p>}
                  <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-slate-100 pt-4">
                    <Link href={`/admin/users/${user.id}`} className="bento-tag border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      Examiner le compte
                    </Link>
                    <form action={handleProfileVerification}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button type="submit" className="bento-tag cursor-pointer border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                        Valider le profil
                      </button>
                    </form>
                    <form action={handleProfileVerification}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button type="submit" className="bento-tag cursor-pointer border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100">
                        Refuser
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Demandes de vérification de fiche (RDV + questionnaire) */}
      <div className="mt-8">
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <BadgeCheck size={20} className="text-emerald-600" />
          Demandes de vérification de fiche
          {verificationRequests.length > 0 && (
            <span className="bento-tag border-amber-400 bg-amber-50 text-amber-700">{verificationRequests.length}</span>
          )}
        </h2>

        {verificationRequests.length === 0 ? (
          <EmptyState
            title="Aucune demande de vérification"
            description="Quand une société demandera la vérification de sa fiche, vous trouverez ici son questionnaire et le créneau de rendez-vous souhaité."
          />
        ) : (
          <div className="space-y-4">
            {verificationRequests.map((request) => (
              <div key={request.id} className="rounded-[20px] border-2 border-slate-900 bg-white p-5 shadow-panel">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black text-slate-900">{request.entityName}</p>
                    <p className="text-sm text-slate-500">
                      {[
                        request.entityCity,
                        request.entitySiret ? `SIRET ${request.entitySiret}` : null,
                        `Demandé par ${request.requester.firstName ?? ""} ${request.requester.lastName ?? ""}`.trim(),
                        request.requester.email,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-slate-400">
                    {new Date(request.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Ancienneté</dt>
                    <dd className="font-semibold text-slate-700">{request.yearsInBusiness || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Effectif</dt>
                    <dd className="font-semibold text-slate-700">{request.employeeCount || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Clients principaux</dt>
                    <dd className="font-semibold text-slate-700">{request.mainClients || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">RDV souhaité</dt>
                    <dd className="font-semibold text-indigo-700">{request.preferredSlot || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Téléphone</dt>
                    <dd className="font-semibold text-slate-700">{request.contactPhone || request.requester.phone || "—"}</dd>
                  </div>
                  {request.additionalInfo && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Informations complémentaires</dt>
                      <dd className="font-medium text-slate-600">{request.additionalInfo}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-slate-100 pt-4">
                  <form action={handleValidate}>
                    <input type="hidden" name="entityType" value="company" />
                    <input type="hidden" name="entityId" value={request.entityId} />
                    <input type="hidden" name="status" value="approved" />
                    <button type="submit" className="bento-tag border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer">
                      Vérifier la fiche (après RDV)
                    </button>
                  </form>
                  <form action={handleValidate} className="flex items-center gap-1">
                    <input type="hidden" name="entityType" value="company" />
                    <input type="hidden" name="entityId" value={request.entityId} />
                    <input type="hidden" name="status" value="rejected" />
                    <input
                      type="text"
                      name="rejectionReason"
                      placeholder="Motif (optionnel)"
                      maxLength={500}
                      className="w-40 rounded border border-rose-300 bg-white px-2 py-1 text-[11px]"
                    />
                    <button type="submit" className="bento-tag border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer">
                      Refuser
                    </button>
                  </form>
                  <Link
                    href={`/annuaire/societes/${request.entityId}`}
                    className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    Voir la fiche
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <EmptyState title="File vide" description="Aucun élément en attente de modération." />
        ) : (
          <div className="overflow-x-auto rounded-[20px] border-2 border-slate-900 bg-white shadow-panel">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Élément</th>
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
        <EntityCard title="Permissions sensibles" subtitle="Sous-traitance visible uniquement par membres association validés." meta={["Route guard", "Server check", "Admin override"]}>
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
            <ShieldAlert size={18} aria-hidden="true" /> À verrouiller avant prod
          </div>
        </EntityCard>
        <EntityCard title="Actions interdites V1" subtitle="Paiement, abonnement, appels d'offres, achats groupés et sponsoring restent hors scope." meta={["Pas de Stripe", "Pas de premium", "Pas d'appel d'offres"]}>
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
            <CircleSlash size={18} aria-hidden="true" /> Restrictions produit conformes au PRD
          </div>
        </EntityCard>
      </div>

      {isSuperAdmin && (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <EntityCard
            title="Gestion utilisateurs"
            subtitle="Accès exclusif super admin : liste, rôles, suspension des comptes."
            meta={["Super admin only", "Modification rôle", "Suspension compte"]}
          >
            <Link href="/admin/users" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-rose-600">
              Ouvrir <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </EntityCard>
          <EntityCard
            title="Stats plateforme"
            subtitle="Vue d'ensemble des volumes de données en temps réel."
            meta={[
              stats ? `${stats.totalUsers} utilisateurs` : "—",
              stats ? `${stats.totalCompanies} sociétés` : "—",
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
