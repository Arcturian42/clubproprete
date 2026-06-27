import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Download,
  FileText,
  GraduationCap,
  Mail,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { EmptyState } from "@/components/empty-state";
import { AdminNav } from "@/components/admin/admin-nav";
import { prisma } from "@/lib/prisma";
import { getSuperAdminDashboard } from "@/lib/actions/super-admin";

const ROLE_LABELS: Record<string, string> = {
  registered_user: "Inscrits",
  company_owner: "Sociétés",
  verified_company: "Sociétés vérifiées",
  supplier_owner: "Fournisseurs",
  verified_supplier: "Fournisseurs vérifiés",
  independent_profile: "Indépendants",
  candidate_profile: "Candidats",
  training_organization: "Organismes de formation",
  author: "Auteurs",
  association_member: "Membres association",
  admin: "Admins",
  super_admin: "Super admins",
};

function relativeDate(value: Date) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function fullName(user: { firstName?: string | null; lastName?: string | null; email: string }) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
}

type StatusBreakdown = { total: number; byStatus: Record<string, number> };

function BreakdownCard({
  icon: Icon,
  label,
  data,
  href,
}: {
  icon: typeof Building2;
  label: string;
  data: StatusBreakdown;
  href?: string;
}) {
  const entries = Object.entries(data.byStatus).filter(([, value]) => value > 0);
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
          <Icon size={18} aria-hidden="true" /> {label}
        </span>
        <span className="font-mono text-2xl font-extrabold text-slate-950">{data.total}</span>
      </div>
      {entries.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {entries.map(([status, value]) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <StatusPill status={status} />
              <span className="text-xs font-extrabold text-slate-700">{value}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-slate-400">Aucune donnée pour le moment.</p>
      )}
      {href && (
        <Link href={href} className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-800">
          Gérer <ArrowRight size={13} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export default async function SuperAdminDashboardPage() {
  const session = await auth();
  const databaseUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { mainRole: true, status: true, deletedAt: true },
      })
    : null;
  const isSuperAdmin = databaseUser?.mainRole === "super_admin";

  // Réservé strictement au super admin : un admin classique est renvoyé vers son
  // back-office, un visiteur non autorisé vers l'accueil.
  if (!databaseUser || databaseUser.status !== "active" || databaseUser.deletedAt) {
    redirect("/");
  }
  if (!isSuperAdmin) {
    redirect("/admin");
  }

  const result = await getSuperAdminDashboard();
  if (!result.success) {
    redirect("/admin");
  }
  const { accounts, directory, content, moderation, engagement, recentUsers, recentEvents } = result.data;

  const moderationItems = [
    { label: "Sociétés à vérifier", value: moderation.companies, href: "/admin" },
    { label: "Fournisseurs à vérifier", value: moderation.suppliers, href: "/admin" },
    { label: "Organismes de formation", value: moderation.trainingOrganizations, href: "/admin" },
    { label: "Offres à modérer", value: moderation.jobs, href: "/admin" },
    { label: "Profils à vérifier", value: moderation.profiles, href: "/admin/users?verification=pending" },
    { label: "Adhésions association", value: moderation.memberships, href: "/admin" },
    { label: "Demandes auteur", value: moderation.authors, href: "/admin" },
    { label: "Demandes de vérif. fiche", value: moderation.verificationRequests, href: "/admin" },
    { label: "Recommandations", value: moderation.recommendations, href: "/admin" },
  ];

  const maxRoleCount = accounts.roleDistribution.reduce((max, item) => Math.max(max, item.count), 0) || 1;

  return (
    <PageShell
      eyebrow="Back-office — Super Admin"
      title="Tableau de bord global"
      description="Vision unifiée de toute la plateforme : comptes, annuaires, contenus, file de modération, engagement et activité en temps réel. Pilotez l'ensemble depuis un seul écran."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users" className="bento-btn bento-btn-primary">
            <UserCog size={16} aria-hidden="true" /> Gestion utilisateurs
          </Link>
          <Link href="/admin" className="bento-btn">
            <ShieldCheck size={16} aria-hidden="true" /> File de modération
          </Link>
          <a href="/api/admin/export" className="bento-btn" download>
            <Download size={16} aria-hidden="true" /> Export CSV
          </a>
        </div>
      }
    >
      <AdminNav current="dashboard" isSuperAdmin={isSuperAdmin} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="bento-tag border-rose-400 bg-rose-50 text-rose-700">
          <ShieldCheck size={13} aria-hidden="true" /> Accès super admin exclusif
        </span>
      </div>

      {/* KPI principaux */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={String(accounts.total)} detail={`${accounts.active} actifs · ${accounts.suspended} suspendus`} />
        <StatCard label="Nouveaux (30 j)" value={String(accounts.new30)} detail={`${accounts.new7} sur 7 jours`} />
        <StatCard label="File de modération" value={String(moderation.total)} detail="Éléments en attente d'action" />
        <StatCard label="Engagement events" value={String(engagement.eventsTotal)} detail={`${engagement.leadsNew} leads à traiter`} />
      </div>

      {/* Contrôle des comptes */}
      <section className="mt-8 rounded-[22px] border-2 border-slate-900 bg-slate-900 p-5 text-white shadow-panel sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-300">Contrôle des comptes</p>
            <h2 className="mt-2 text-2xl font-black">Identité &amp; conformité des accès</h2>
          </div>
          <Link href="/admin/users" className="bento-btn border-white bg-white text-slate-900 shadow-[3px_3px_0px_#fbbf24] hover:bg-amber-50">
            <Users size={16} aria-hidden="true" /> Ouvrir la gestion complète
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Profils à vérifier", value: accounts.profilePending, accent: "text-amber-300", href: "/admin/users?verification=pending" },
            { label: "Emails non vérifiés", value: accounts.emailUnverified, accent: "text-white", href: "/admin/users" },
            { label: "Onboardings incomplets", value: accounts.onboardingIncomplete, accent: "text-white", href: "/admin/users" },
            { label: "Comptes suspendus", value: accounts.suspended, accent: "text-rose-300", href: "/admin/users?status=suspended" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="rounded-[16px] border border-slate-700 bg-slate-800 p-4 transition-colors hover:border-amber-300">
              <p className={`text-2xl font-black ${item.accent}`}>{item.value}</p>
              <p className="mt-1 text-xs font-bold text-slate-300">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* File de modération détaillée */}
      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
          <BadgeCheck size={20} className="text-emerald-600" aria-hidden="true" /> File de modération
          {moderation.total > 0 && (
            <span className="bento-tag border-amber-400 bg-amber-50 text-amber-700">{moderation.total}</span>
          )}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {moderationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`surface flex items-center justify-between p-4 transition-colors hover:border-indigo-600 ${
                item.value > 0 ? "" : "opacity-60"
              }`}
            >
              <span className="text-sm font-bold text-slate-700">{item.label}</span>
              <span className={`font-mono text-xl font-extrabold ${item.value > 0 ? "text-rose-600" : "text-slate-400"}`}>
                {item.value}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Répartition par rôle */}
      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
          <Users size={20} className="text-indigo-600" aria-hidden="true" /> Répartition des comptes par rôle
        </h2>
        <div className="surface p-5">
          {accounts.roleDistribution.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400">Aucun compte.</p>
          ) : (
            <ul className="space-y-3">
              {accounts.roleDistribution.map((item) => (
                <li key={item.role} className="grid grid-cols-[180px_1fr_48px] items-center gap-3">
                  <span className="truncate text-sm font-bold text-slate-700">{ROLE_LABELS[item.role] ?? item.role}</span>
                  <span className="h-3 rounded-full bg-slate-100">
                    <span
                      className="block h-3 rounded-full bg-indigo-500"
                      style={{ width: `${Math.max(4, Math.round((item.count / maxRoleCount) * 100))}%` }}
                    />
                  </span>
                  <span className="text-right font-mono text-sm font-extrabold text-slate-900">{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Santé des annuaires */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-black text-slate-900">Annuaires &amp; profils</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BreakdownCard icon={Building2} label="Sociétés" data={directory.companies} href="/annuaire/societes" />
          <BreakdownCard icon={Truck} label="Fournisseurs" data={directory.suppliers} href="/annuaire/fournisseurs" />
          <BreakdownCard icon={GraduationCap} label="Organismes de formation" data={directory.trainingOrganizations} href="/annuaire/centres-formation" />
          <BreakdownCard icon={Users} label="Indépendants" data={directory.independents} href="/independants" />
          <StatCard label="Candidats" value={String(directory.candidates.total)} detail="Profils candidats actifs" />
        </div>
      </section>

      {/* Contenus */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-black text-slate-900">Contenus de la plateforme</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BreakdownCard icon={Briefcase} label="Offres d'emploi" data={content.jobs} href="/emploi" />
          <BreakdownCard icon={GraduationCap} label="Formations" data={content.trainings} href="/formations" />
          <BreakdownCard icon={FileText} label="Articles" data={content.articles} href="/ressources" />
          <BreakdownCard icon={Activity} label="Missions sous-traitance" data={content.missions} />
        </div>
      </section>

      {/* Engagement */}
      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
          <Mail size={20} className="text-indigo-600" aria-hidden="true" /> Engagement
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Abonnés newsletter" value={String(engagement.newsletterActive)} detail="Statut actif" />
          <StatCard label="Leads" value={String(engagement.leadsTotal)} detail={`${engagement.leadsNew} nouveaux`} />
          <StatCard label="Candidatures" value={String(engagement.applicationsTotal)} detail="Total reçues" />
          <StatCard label="Recommandations" value={String(engagement.recommendationsTotal)} detail="Toutes confondues" />
          <StatCard label="Événements analytics" value={String(engagement.eventsTotal)} detail="Journal d'activité" />
        </div>
      </section>

      {/* Activité récente */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-black text-slate-900">Dernières inscriptions</h2>
          {recentUsers.length === 0 ? (
            <EmptyState title="Aucune inscription" description="Les nouveaux comptes apparaîtront ici." />
          ) : (
            <div className="overflow-hidden rounded-[20px] border-2 border-slate-900 bg-white shadow-panel">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Compte</th>
                    <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Rôle</th>
                    <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Inscrit</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-t-2 border-slate-900">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${user.id}`} className="font-extrabold text-slate-900 hover:text-indigo-600">
                          {fullName(user)}
                        </Link>
                        <p className="text-xs font-semibold text-slate-400">
                          {user.email} · {user.emailVerified ? "email vérifié" : "email non vérifié"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-600">{ROLE_LABELS[user.mainRole] ?? user.mainRole}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500">{relativeDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
            <Activity size={20} className="text-indigo-600" aria-hidden="true" /> Activité récente
          </h2>
          {recentEvents.length === 0 ? (
            <EmptyState title="Aucune activité" description="Le journal des événements apparaîtra ici." />
          ) : (
            <ul className="space-y-2">
              {recentEvents.map((event) => (
                <li key={event.id} className="surface flex items-start justify-between gap-3 p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{event.eventName}</p>
                    <p className="text-xs font-semibold text-slate-400">
                      {event.user ? fullName(event.user) : "Système"}
                      {event.entityType ? ` · ${event.entityType}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-400">{relativeDate(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}
