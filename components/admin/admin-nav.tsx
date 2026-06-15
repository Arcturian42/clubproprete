import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Users } from "lucide-react";

type AdminNavProps = {
  current: "overview" | "users";
  isSuperAdmin: boolean;
};

export function AdminNav({ current, isSuperAdmin }: AdminNavProps) {
  const links = [
    { key: "overview", href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
    ...(isSuperAdmin
      ? [{ key: "users", href: "/admin/users", label: "Utilisateurs et profils", icon: Users }]
      : []),
  ] as const;

  return (
    <nav className="mb-6 flex flex-wrap gap-2 rounded-[18px] border-2 border-slate-900 bg-white p-2 shadow-panel" aria-label="Navigation administration">
      {links.map((link) => {
        const Icon = link.icon;
        const active = current === link.key;
        return (
          <Link
            key={link.key}
            href={link.href}
            className={`inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-extrabold transition-colors ${
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
      <span className="ml-auto hidden items-center gap-2 px-3 text-xs font-extrabold uppercase tracking-wide text-slate-400 sm:flex">
        <ShieldCheck size={15} aria-hidden="true" /> Back-office sécurisé
      </span>
    </nav>
  );
}
