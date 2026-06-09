import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertTriangle, UserCheck, UserX } from "lucide-react";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { getUsersList, updateUserRole, updateUserStatus } from "@/lib/actions/users";
import { roleLabels } from "@/lib/auth-demo";
import { RoleSelect } from "@/components/admin/role-select";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "super_admin") {
    redirect("/admin");
  }

  const result = await getUsersList();
  const users = result.success && result.users ? result.users : [];

  async function handleRoleChange(formData: FormData) {
    "use server";
    await updateUserRole(formData);
  }

  async function handleStatusChange(formData: FormData) {
    "use server";
    await updateUserStatus(formData);
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;
  const adminCount = users.filter((u) => u.mainRole === "admin" || u.mainRole === "super_admin").length;

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
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Utilisateurs" value={String(totalUsers)} detail="Total inscrits" />
        <StatCard label="Actifs" value={String(activeUsers)} detail="Comptes actifs" />
        <StatCard label="Suspendus" value={String(suspendedUsers)} detail="Comptes suspendus" />
        <StatCard label="Admins" value={String(adminCount)} detail="Admin + Super admin" />
      </div>

      {users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" description="La base ne contient aucun utilisateur." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[20px] border-2 border-slate-900 bg-white shadow-panel">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Utilisateur</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Rôle</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Statut</th>
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
                    <div className="flex flex-wrap gap-1">
                      {user._count.companies > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.companies} société(s)
                        </span>
                      )}
                      {user._count.suppliers > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.suppliers} fourn.
                        </span>
                      )}
                      {user._count.jobs > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.jobs} offre(s)
                        </span>
                      )}
                      {user._count.trainings > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.trainings} form.
                        </span>
                      )}
                      {user._count.articles > 0 && (
                        <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600 text-[9px]">
                          {user._count.articles} article(s)
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
