import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertTriangle, UserCheck, UserX, Search, SlidersHorizontal, Eye } from "lucide-react";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { getUserAccountStats, getUsersList, updateUserRole, updateUserStatus } from "@/lib/actions/users";
import { roleLabels } from "@/lib/auth-demo";
import { RoleSelect } from "@/components/admin/role-select";
import { AdminNav } from "@/components/admin/admin-nav";
import { Pagination } from "@/components/pagination";
import { prisma } from "@/lib/prisma";

type AdminUsersPageProps = {
  searchParams: Promise<{ page?: string; search?: string; status?: string; verification?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await auth();
  const [params, databaseUser] = await Promise.all([
    searchParams,
    session?.user?.id
      ? prisma.user.findUnique({ where: { id: session.user.id }, select: { mainRole: true, status: true, deletedAt: true } })
      : null,
  ]);
  if (databaseUser?.mainRole !== "super_admin" || databaseUser.status !== "active" || databaseUser.deletedAt) {
    redirect("/admin");
  }

  const page = Math.max(1, Number(params.page) || 1);
  const [result, statsResult] = await Promise.all([
    getUsersList({ page, query: params.search, status: params.status, verification: params.verification }),
    getUserAccountStats(),
  ]);
  const users = result.success && result.users ? result.users : [];
  const stats = statsResult.success ? statsResult.stats : null;

  async function handleRoleChange(formData: FormData) {
    "use server";
    await updateUserRole(formData);
  }

  async function handleStatusChange(formData: FormData) {
    "use server";
    await updateUserStatus(formData);
  }

  return (
    <PageShell
      eyebrow="Super Admin"
      title="Gestion des utilisateurs"
      description="Liste complète des utilisateurs, rôles et statuts. Seul le super admin peut modifier les rôles et suspendre des comptes."
      actions={
        <Link href="/admin" className="bento-btn">
          <ArrowLeft size={16} /> Retour admin
        </Link>
      }
    >
      <AdminNav current="users" isSuperAdmin />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Utilisateurs" value={stats ? String(stats.total) : "—"} detail="Total inscrits" />
        <StatCard label="À vérifier" value={stats ? String(stats.profilePending) : "—"} detail="Profils en attente" />
        <StatCard label="Emails non vérifiés" value={stats ? String(stats.emailUnverified) : "—"} detail="Contrôle de compte" />
        <StatCard label="Suspendus" value={stats ? String(stats.suspended) : "—"} detail="Accès bloqués" />
      </div>

      <form method="get" className="mt-6 grid gap-3 rounded-[20px] border-2 border-slate-900 bg-white p-4 shadow-panel lg:grid-cols-[minmax(260px,1fr)_190px_220px_auto]">
        <label className="relative">
          <span className="sr-only">Rechercher un utilisateur</span>
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Nom, email ou téléphone"
            className="w-full rounded-[12px] border-2 border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold outline-none focus:border-indigo-500"
          />
        </label>
        <label>
          <span className="sr-only">Filtrer par statut</span>
          <select name="status" defaultValue={params.status ?? ""} className="w-full rounded-[12px] border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-700">
            <option value="">Tous les comptes</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filtrer par vérification</span>
          <select name="verification" defaultValue={params.verification ?? ""} className="w-full rounded-[12px] border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-700">
            <option value="">Toutes les vérifications</option>
            <option value="pending">Profils à vérifier</option>
            <option value="approved">Profils vérifiés</option>
            <option value="rejected">Profils refusés</option>
            <option value="draft">Profils en brouillon</option>
            <option value="missing">Profil absent</option>
          </select>
        </label>
        <button type="submit" className="bento-btn bento-btn-primary justify-center">
          <SlidersHorizontal size={16} aria-hidden="true" /> Filtrer
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
        <p>{result.success ? `${result.total} utilisateur${result.total === 1 ? "" : "s"} trouvé${result.total === 1 ? "" : "s"}` : "Impossible de charger les utilisateurs"}</p>
        {(params.search || params.status || params.verification) && (
          <Link href="/admin/users" className="text-indigo-600 hover:underline">Réinitialiser les filtres</Link>
        )}
      </div>

      {users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" description="La base ne contient aucun utilisateur." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[20px] border-2 border-slate-900 bg-white shadow-panel">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Utilisateur</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Rôle</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Vérification</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Entités</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Inscrit</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t-2 border-slate-900">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-extrabold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">{user.email}</p>
                      <div className="mt-1 flex gap-1">
                        {user.emailVerified && (
                          <span className="bento-tag border-emerald-300 bg-emerald-50 text-emerald-700 text-[9px]">
                            Email vérifié
                          </span>
                        )}
                        {user.phoneVerified && (
                          <span className="bento-tag border-emerald-300 bg-emerald-50 text-emerald-700 text-[9px]">
                            Tel vérifié
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`bento-tag text-[10px] ${
                        user.mainRole === "super_admin"
                          ? "border-rose-400 bg-rose-50 text-rose-700"
                          : user.mainRole === "admin"
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : "border-slate-300 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {roleLabels[user.mainRole as keyof typeof roleLabels] || user.mainRole}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`bento-tag text-[10px] ${
                        user.status === "active"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-amber-400 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {user.status === "active" ? "Actif" : "Suspendu"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={`bento-tag text-[9px] ${
                        user.profile?.verificationStatus === "approved"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : user.profile?.verificationStatus === "pending"
                            ? "border-amber-400 bg-amber-50 text-amber-700"
                            : user.profile?.verificationStatus === "rejected"
                              ? "border-rose-400 bg-rose-50 text-rose-700"
                              : "border-slate-300 bg-slate-50 text-slate-600"
                      }`}>
                        {user.profile?.verificationStatus === "approved"
                          ? "Profil vérifié"
                          : user.profile?.verificationStatus === "pending"
                            ? "À examiner"
                            : user.profile?.verificationStatus === "rejected"
                              ? "Refusé"
                              : user.profile ? "Brouillon" : "Profil absent"}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400">Complété à {user.profile?.completionScore ?? 0}%</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user._count.companies > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.companies} {user._count.companies > 1 ? "sociétés" : "société"}
                        </span>
                      )}
                      {user._count.suppliers > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.suppliers} fourn.
                        </span>
                      )}
                      {user._count.jobs > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.jobs} {user._count.jobs > 1 ? "offres" : "offre"}
                        </span>
                      )}
                      {user._count.trainings > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.trainings} form.
                        </span>
                      )}
                      {user._count.articles > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.articles} {user._count.articles > 1 ? "articles" : "article"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {user.mainRole !== "super_admin" && (
                        <>
                          <form action={handleRoleChange} className="flex items-center gap-1">
                            <input type="hidden" name="userId" value={user.id} />
                            <RoleSelect defaultValue={user.mainRole} />
                          </form>
                          <form action={handleStatusChange}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={user.status === "active" ? "suspended" : "active"}
                            />
                            <button
                              type="submit"
                              className={`bento-tag cursor-pointer text-[10px] ${
                                user.status === "active"
                                  ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {user.status === "active" ? (
                                <><UserX size={12} /> Suspendre</>
                              ) : (
                                <><UserCheck size={12} /> Réactiver</>
                              )}
                            </button>
                          </form>
                        </>
                      )}
                      <Link href={`/admin/users/${user.id}`} className="bento-tag border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[10px]">
                        <Eye size={12} aria-hidden="true" /> Examiner
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.success && (
        <Pagination
          currentPage={result.page ?? page}
          totalPages={result.totalPages ?? 1}
          basePath="/admin/users"
          searchQuery={params.search}
          extraParams={{ status: params.status, verification: params.verification }}
        />
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <EntityCard
          title="Règles super admin"
          subtitle="Le super admin a des pouvoirs étendus sur la plateforme."
          meta={["Gestion utilisateurs", "Modification rôles", "Suspension comptes"]}
        >
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-rose-600">
            <ShieldCheck size={18} aria-hidden="true" />
            Accès exclusif super admin
          </div>
        </EntityCard>
        <EntityCard
          title="Sécurité"
          subtitle="Les super admins ne peuvent pas être modifiés ou suspendus depuis cette interface."
          meta={["Protection intégrée", "Audit des actions", "Logs système"]}
        >
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-amber-600">
            <AlertTriangle size={18} aria-hidden="true" />
            Accès protégé
          </div>
        </EntityCard>
      </div>
    </PageShell>
  );
}
