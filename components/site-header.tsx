"use client";

import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthNav } from "@/components/auth/auth-nav";
import { publicRoutes } from "@/lib/routes";
import { ResourcesMegaMenu, ResourcesMobileMenu } from "@/components/resources-mega-menu";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b-2 border-slate-900 bg-[#f8fafc]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Club Propreté">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-slate-900 bg-amber-400 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-black uppercase tracking-wide text-slate-900">Club Propreté</span>
            <span className="hidden text-xs font-bold text-slate-500 xl:block">Boîte à outils propreté</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden min-w-0 items-center gap-0.5 text-[12px] font-extrabold uppercase tracking-wide text-slate-600 lg:flex">
          {publicRoutes.map((route) =>
            route.href === "/ressources" ? (
              <ResourcesMegaMenu key={route.href} />
            ) : (
              <Link
                key={route.href}
                href={route.href}
                className="whitespace-nowrap rounded-[12px] px-2 py-2 hover:bg-white hover:text-slate-900"
              >
                {route.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden lg:block">
            <AuthNav />
          </div>
          {/* Mobile burger */}
          <button
            className="lg:hidden rounded-[12px] border-2 border-slate-900 p-2 text-slate-900 bg-white shadow-[2px_2px_0px_#0f172a]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t-2 border-slate-900 bg-white px-4 py-4">
          <nav className="flex flex-col gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
            {publicRoutes.map((route) =>
              route.href === "/ressources" ? (
                <ResourcesMobileMenu key={route.href} onNavigate={() => setMobileOpen(false)} />
              ) : (
                <Link
                  key={route.href}
                  href={route.href}
                  className="rounded-[12px] px-3 py-2 hover:bg-indigo-50 hover:text-slate-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {route.label}
                </Link>
              )
            )}
          </nav>
          <div className="mt-4 border-t-2 border-slate-100 pt-4">
            <AuthNav />
          </div>
        </div>
      )}
    </header>
  );
}
