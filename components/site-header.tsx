"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AuthNav } from "@/components/auth/auth-nav";
import { publicRoutes, directoryRoutes } from "@/lib/routes";
import { ResourcesMegaMenu, ResourcesMobileMenu } from "@/components/resources-mega-menu";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

// N1 — Menu déroulant « Annuaires » (desktop), clic pour ouvrir + fermeture au
// clic extérieur et touche Échap (accessibilité clavier).
function AnnuairesMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = directoryRoutes.some((route) => isActivePath(pathname, route.href));

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1 whitespace-nowrap rounded-[12px] px-2 py-2 hover:bg-white hover:text-slate-900 ${
          active ? "bg-white text-slate-900 shadow-[2px_2px_0px_#0f172a]" : ""
        }`}
      >
        Annuaires
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-60 overflow-hidden rounded-[14px] border-2 border-slate-900 bg-white shadow-[4px_4px_0px_#0f172a]"
        >
          {directoryRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm font-bold normal-case tracking-normal hover:bg-indigo-50 hover:text-indigo-700 ${
                isActivePath(pathname, route.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "/";

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
          <AnnuairesMenu pathname={pathname} />
          {publicRoutes.map((route) =>
            route.href === "/ressources" ? (
              <ResourcesMegaMenu key={route.href} />
            ) : (
              <Link
                key={route.href}
                href={route.href}
                aria-current={isActivePath(pathname, route.href) ? "page" : undefined}
                className={`whitespace-nowrap rounded-[12px] px-2 py-2 hover:bg-white hover:text-slate-900 ${
                  isActivePath(pathname, route.href) ? "bg-white text-slate-900 shadow-[2px_2px_0px_#0f172a]" : ""
                }`}
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

      {/* Mobile menu — M3 : hauteur bornée + défilement interne pour ne pas
          occuper tout le viewport sur les petits téléphones. */}
      {mobileOpen && (
        <div className="lg:hidden max-h-[80vh] overflow-y-auto border-t-2 border-slate-900 bg-white px-4 py-4">
          <nav className="flex flex-col gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
            {/* N1 — Section Annuaires en accordéon simple (toujours déplié sur mobile). */}
            <p className="px-3 pt-1 text-[11px] font-black uppercase tracking-wide text-slate-400">Annuaires</p>
            {directoryRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                aria-current={isActivePath(pathname, route.href) ? "page" : undefined}
                className={`rounded-[12px] px-3 py-3 hover:bg-indigo-50 hover:text-slate-900 ${
                  isActivePath(pathname, route.href) ? "bg-indigo-50 text-slate-900" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            <div className="my-1 border-t-2 border-slate-100" />
            {publicRoutes.map((route) =>
              route.href === "/ressources" ? (
                <ResourcesMobileMenu key={route.href} onNavigate={() => setMobileOpen(false)} />
              ) : (
                <Link
                  key={route.href}
                  href={route.href}
                  aria-current={isActivePath(pathname, route.href) ? "page" : undefined}
                  className={`rounded-[12px] px-3 py-3 hover:bg-indigo-50 hover:text-slate-900 ${
                    isActivePath(pathname, route.href) ? "bg-indigo-50 text-slate-900" : ""
                  }`}
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
