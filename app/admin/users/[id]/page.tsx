import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, Mail, MapPin, Phone, ShieldAlert, UserRound, UserX } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { RoleSelect } from "@/components/admin/role-select";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import {
  getUserAdminDetail,
  updateUserProfileVerification,
  updateUserRole,
  updateUserStatus,
} from "@/lib/actions/users";
import { roleLabels } from "@/lib/auth-demo";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | null | undefined) {
  if (!value) return "Non renseigné";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;
  const result = await getUserAdminDetail(id);
  if (!result.success) redirect("/admin");
  if (!result.user) notFound();

  const user = result.user;
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Utilisateur sans nom";
  const activityTotal =
    user._count.jobs +
    user._count.trainings +
    user._count.articles +
    user._count.subcontractingMissions +
    user._count.subcontractingResponses;

  async function handleRoleChange(formData: FormData) {
    "use server";
    await updateUserRole(formData);
  }

  async function handleStatusChange(formData: FormData) {
    "use server";
    await updateUserStatus(formData);
  }

  async function handleProfileVerification(formData: FormData) {
    "use server";
    await updateUserProfileVerification(formData);
  }

  return (
    <PageShell
      eyebrow="Super Admin — Examen de compte"
      title={fullName}
      description="Vue consolidée de l'identité, du profil, des entités rattachées et de l'activité de ce compte."
      actions={
        <Link href="/admin/users" className="bento-btn">
          <ArrowLeft size={16} aria-hidden="true" /> Retour aux utilisateurs
        </Link>
      }
    >
      <AdminNav current="users" isSuperAdmin />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Compte" value={user.status === "active" ? "Actif" : "Suspendu"} detail={roleLabels[user.mainRole as keyof typeof roleLabels] || user.mainRole} />
        <StatCard label="Profil" value={user.profile?.verificationStatus ?? "Absent"} detail={`${user.profile?.completionScore ?? 0}% complété`} />
        <StatCard label="Entités" value={String(user.companies.length + user.suppliers.length + user.trainingOrganizations.length)} detail="Structures rattachées" />
        <StatCard label="Activité" value={String(activityTotal)} detail="Contenus et opérations" />
      </div>

      <section className="mt-6 rounded-[22px] border-2 border-slate-900 bg-slate-900 p-5 text-white shadow-panel sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-300">Contrôles administratifs</p>
            <h2 className="mt-2 text-2xl font-black">Décision sur le compte</h2>
            <p className="mt-2 text-sm font-semibold text-slate-300">Les changements sont appliqués immédiatement et journalisés par les événements administratifs existants.</p>
          </div>
          {user.mainRole === "super_admin" && (
            <span className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-500/20 px-3 py-2 text-xs font-extrabold text-rose-100">
              <ShieldAlert size={15} aria-hidden="true" /> Compte super admin protégé
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[16px] border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Rôle principal</p>
            {user.mainRole === "super_admin" ? (
              <p className="mt-3 font-black text-rose-200">Super admin</p>
            ) : (
              <form action={handleRoleChange} className="mt-3">
                <input type="hidden" name="userId" value={user.id} />
                <RoleSelect defaultValue={user.mainRole} />
              </form>
            )}
          </div>

          <div className="rounded-[16px] border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Accès au compte</p>
            {user.mainRole === "super_admin" ? (
              <p className="mt-3 text-sm font-bold text-slate-300">Ce compte ne peut pas être suspendu ici.</p>
            ) : (
              <form action={handleStatusChange} className="mt-3">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="status" value={user.status === "active" ? "suspended" : "active"} />
                <button type="submit" className={`bento-btn min-h-0 w-full justify-center px-3 py-2 ${user.status === "active" ? "border-rose-300 bg-rose-100 text-rose-800" : "border-emerald-300 bg-emerald-100 text-emerald-800"}`}>
                  <UserX size={15} aria-hidden="true" /> {user.status === "active" ? "Suspendre le compte" : "Réactiver le compte"}
                </button>
              </form>
            )}
          </div>

          <div className="rounded-[16px] border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Vérification du profil</p>
            {user.profile ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={handleProfileVerification}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="bento-tag cursor-pointer border-emerald-300 bg-emerald-100 text-emerald-800">Valider</button>
                </form>
                <form action={handleProfileVerification}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className="bento-tag cursor-pointer border-rose-300 bg-rose-100 text-rose-800">Refuser</button>
                </form>
                <form action={handleProfileVerification}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="status" value="pending" />
                  <button type="submit" className="bento-tag cursor-pointer border-amber-300 bg-amber-100 text-amber-800">Remettre en attente</button>
                </form>
              </div>
            ) : (
              <p className="mt-3 text-sm font-bold text-slate-300">Aucun profil à vérifier.</p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><UserRound size={20} aria-hidden="true" /> Identité et compte</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Email</dt><dd className="mt-1 font-bold text-slate-800">{user.email}</dd></div>
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Email vérifié</dt><dd className="mt-1 font-bold text-slate-800">{user.emailVerified ? "Oui" : "Non"}</dd></div>
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Téléphone</dt><dd className="mt-1 font-bold text-slate-800">{user.phone || "Non renseigné"}</dd></div>
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Téléphone vérifié</dt><dd className="mt-1 font-bold text-slate-800">{user.phoneVerified ? "Oui" : "Non"}</dd></div>
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Localisation</dt><dd className="mt-1 font-bold text-slate-800">{[user.address, user.city].filter(Boolean).join(", ") || "Non renseignée"}</dd></div>
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Inscription</dt><dd className="mt-1 font-bold text-slate-800">{formatDate(user.createdAt)}</dd></div>
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Dernière mise à jour</dt><dd className="mt-1 font-bold text-slate-800">{formatDate(user.updatedAt)}</dd></div>
            <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">CGU acceptées</dt><dd className="mt-1 font-bold text-slate-800">{formatDate(user.termsAcceptedAt)}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className={`bento-tag ${user.emailVerified ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-400 bg-amber-50 text-amber-700"}`}><Mail size={13} aria-hidden="true" /> Email {user.emailVerified ? "vérifié" : "à vérifier"}</span>
            <span className={`bento-tag ${user.phoneVerified ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-slate-50 text-slate-600"}`}><Phone size={13} aria-hidden="true" /> Téléphone {user.phoneVerified ? "vérifié" : "non vérifié"}</span>
            {user.city && <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600"><MapPin size={13} aria-hidden="true" /> {user.city}</span>}
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><BadgeCheck size={20} aria-hidden="true" /> Profil utilisateur</h2>
          {user.profile ? (
            <>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, user.profile.completionScore)}%` }} /></div>
              <p className="mt-2 text-sm font-black text-slate-900">Complétude : {user.profile.completionScore}%</p>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Type</dt><dd className="mt-1 font-bold text-slate-800">{user.profile.profileType}</dd></div>
                <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Vérification</dt><dd className="mt-1"><StatusPill status={user.profile.verificationStatus} /></dd></div>
                <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Visibilité</dt><dd className="mt-1 font-bold text-slate-800">{user.profile.visibility}</dd></div>
                <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Onboarding terminé</dt><dd className="mt-1 font-bold text-slate-800">{formatDate(user.profile.onboardingCompletedAt)}</dd></div>
                <div className="sm:col-span-2"><dt className="font-extrabold uppercase tracking-wide text-slate-400">Titre</dt><dd className="mt-1 font-bold text-slate-800">{user.profile.headline || "Non renseigné"}</dd></div>
                <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Objectif</dt><dd className="mt-1 font-bold text-slate-800">{user.profile.primaryGoal || "Non renseigné"}</dd></div>
                <div><dt className="font-extrabold uppercase tracking-wide text-slate-400">Besoins</dt><dd className="mt-1 font-bold text-slate-800">{user.profile.mainNeeds || "Non renseignés"}</dd></div>
              </dl>
            </>
          ) : (
            <div className="mt-5"><EmptyState title="Profil absent" description="Ce compte n'a pas encore créé son profil utilisateur." /></div>
          )}
        </section>
      </div>

      <section className="mt-6 surface p-6">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><Building2 size={20} aria-hidden="true" /> Entités et activités rattachées</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {user.companies.map((company) => (
            <article key={company.id} className="rounded-[16px] border-2 border-slate-200 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">Société</p>
              <h3 className="mt-1 font-black text-slate-900">{company.name}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{company.siret ? `SIRET ${company.siret}` : "SIRET non renseigné"}</p>
              <div className="mt-3"><StatusPill status={company.verificationStatus} /></div>
            </article>
          ))}
          {user.suppliers.map((supplier) => (
            <article key={supplier.id} className="rounded-[16px] border-2 border-slate-200 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">Fournisseur</p>
              <h3 className="mt-1 font-black text-slate-900">{supplier.name}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{supplier.category}</p>
              <div className="mt-3"><StatusPill status={supplier.verificationStatus} /></div>
            </article>
          ))}
          {user.trainingOrganizations.map((organization) => (
            <article key={organization.id} className="rounded-[16px] border-2 border-slate-200 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">Centre de formation</p>
              <h3 className="mt-1 font-black text-slate-900">{organization.name}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{organization.siret ? `SIRET ${organization.siret}` : "SIRET non renseigné"}</p>
              <div className="mt-3"><StatusPill status={organization.verificationStatus} /></div>
            </article>
          ))}
          {user.independentProfile && (
            <article className="rounded-[16px] border-2 border-slate-200 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">Indépendant</p>
              <h3 className="mt-1 font-black text-slate-900">{user.independentProfile.displayName}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{user.independentProfile.siret ? `SIRET ${user.independentProfile.siret}` : "SIRET non renseigné"}</p>
              <div className="mt-3"><StatusPill status={user.independentProfile.verificationStatus} /></div>
            </article>
          )}
          {user.candidateProfile && (
            <article className="rounded-[16px] border-2 border-slate-200 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">Profil candidat</p>
              <h3 className="mt-1 font-black text-slate-900">{`${user.candidateProfile.firstName ?? ""} ${user.candidateProfile.lastName ?? ""}`.trim() || fullName}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{user.candidateProfile.city || "Localisation non renseignée"}</p>
            </article>
          )}
          {user.companies.length === 0 && user.suppliers.length === 0 && user.trainingOrganizations.length === 0 && !user.independentProfile && !user.candidateProfile && (
            <p className="text-sm font-semibold text-slate-500">Aucune entité ou activité professionnelle rattachée.</p>
          )}
        </div>

        {(user.entityMemberships.length > 0 || user.memberships.length > 0) && (
          <div className="mt-6 grid gap-4 border-t-2 border-slate-100 pt-6 lg:grid-cols-2">
            <div>
              <h3 className="font-black text-slate-900">Rattachements aux entités</h3>
              <div className="mt-3 space-y-2">
                {user.entityMemberships.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-500">Aucun rattachement secondaire.</p>
                ) : user.entityMemberships.map((membership) => (
                  <div key={membership.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-bold text-slate-800">{membership.entityType} · {membership.entityId}</span>
                    <span className="bento-tag border-slate-300 bg-white text-slate-600">{membership.role} · {membership.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-black text-slate-900">Demandes d'adhésion association</h3>
              <div className="mt-3 space-y-2">
                {user.memberships.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-500">Aucune demande d'adhésion.</p>
                ) : user.memberships.map((membership) => (
                  <div key={membership.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-bold text-slate-800">{membership.profileType} · {membership.entityType}</span>
                    <StatusPill status={membership.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 surface p-6">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><CalendarDays size={20} aria-hidden="true" /> Compteurs d'activité</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Offres publiées", user._count.jobs],
            ["Formations", user._count.trainings],
            ["Articles", user._count.articles],
            ["Missions créées", user._count.subcontractingMissions],
            ["Réponses missions", user._count.subcontractingResponses],
            ["Recommandations reçues", user._count.recommendationsReceived],
            ["Notifications", user._count.notifications],
            ["Événements analytiques", user._count.analyticsEvents],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-[14px] bg-slate-50 p-4"><p className="text-2xl font-black text-slate-900">{value}</p><p className="mt-1 text-xs font-bold text-slate-500">{label}</p></div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
