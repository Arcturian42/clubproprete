"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowRight, Newspaper } from "lucide-react";
import {
  getResourceById,
  getResourceHref,
  resourceRubrics,
  type Resource,
  type ResourceCategory,
} from "@/lib/resources";

// La rubrique « média » n'est pas une ressource : c'est le blog (actualités &
// publications des auteurs). Elle est présentée à part, en tête du méga-menu,
// et renvoie vers le bloc blog de /ressources.
const BLOG_HREF = "/ressources#actualites";

function CategoryLinks({ category, onNavigate }: { category: ResourceCategory; onNavigate?: () => void }) {
  return (
    <ul className="mt-2 space-y-1">
      {category.menuResourceIds.map((id) => {
        const resource = getResourceById(id);
        if (!resource) return null;
        return (
          <li key={id}>
            <Link
              href={getResourceHref(resource)}
              onClick={onNavigate}
              className="block rounded-[8px] px-1.5 py-0.5 text-xs font-semibold normal-case tracking-normal text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {resource.title}
            </Link>
          </li>
        );
      })}
      <li>
        <Link
          href={`/ressources/${category.slug}`}
          onClick={onNavigate}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-extrabold normal-case tracking-normal text-indigo-600 hover:underline"
        >
          Voir tout <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </li>
    </ul>
  );
}

export function ResourcesMegaMenu() {
  const [open, setOpen] = useState(false);
  // M2 — L'ouverture au survol n'est activée qu'à partir de 1280px. En dessous
  // (≈ tablettes, petits laptops, paysage mobile), le menu s'ouvre uniquement au
  // clic, pour éviter un panneau dense qui se ferme à un déplacement involontaire.
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    const update = () => setHoverEnabled(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Un léger délai avant fermeture permet de traverser l'espace entre le
  // bouton et le panneau (padding du header) sans que le menu se referme.
  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => {
    return () => cancelClose();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => {
        if (!hoverEnabled) return;
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={() => {
        if (!hoverEnabled) return;
        scheduleClose();
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 rounded-[12px] px-2 py-2 uppercase tracking-wide hover:bg-white hover:text-slate-900 ${
          open ? "bg-white text-slate-900" : ""
        }`}
      >
        Ressources
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-h-[calc(100vh-110px)] max-w-7xl overflow-y-auto rounded-[20px] border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_#0f172a]">
            <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {/* Le blog, mis en avant et distinct des rubriques de ressources. */}
              <Link
                href={BLOG_HREF}
                onClick={close}
                className="group flex flex-col justify-center rounded-[14px] border-2 border-slate-900 bg-amber-400 p-4 shadow-[3px_3px_0px_#0f172a] lg:col-span-3 xl:col-span-4"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2 border-slate-900 bg-white text-slate-900">
                    <Newspaper size={15} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-black normal-case tracking-normal text-slate-900">
                    Actualités & média — le blog du secteur
                  </span>
                  <ArrowRight size={14} className="ml-auto text-slate-900" aria-hidden="true" />
                </span>
                <span className="mt-1.5 text-[11px] font-semibold normal-case leading-4 tracking-normal text-slate-700">
                  Tendances, interviews et publications des auteurs de la communauté propreté.
                </span>
              </Link>

              {resourceRubrics.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.slug}>
                    <Link
                      href={`/ressources/${category.slug}`}
                      onClick={close}
                      className="group flex items-center gap-2"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2 border-slate-900 bg-indigo-50 text-indigo-600">
                        <Icon size={15} aria-hidden="true" />
                      </span>
                      <span className="text-sm font-black normal-case tracking-normal text-slate-900 group-hover:text-indigo-600">
                        {category.title}
                      </span>
                    </Link>
                    <p className="mt-1.5 text-[11px] font-semibold normal-case leading-4 tracking-normal text-slate-400">
                      {category.menuDescription}
                    </p>
                    <CategoryLinks category={category} onNavigate={close} />
                  </div>
                );
              })}

              {/* Bandeau CTA */}
              <div className="rounded-[14px] border-2 border-indigo-200 bg-indigo-50 p-4 lg:col-span-3 xl:col-span-1 xl:flex xl:flex-col xl:justify-center">
                <p className="text-sm font-black normal-case tracking-normal text-slate-900">
                  Explorez toutes les ressources Club Propreté
                </p>
                <p className="mt-1.5 text-[11px] font-semibold normal-case leading-4 tracking-normal text-slate-500">
                  Guides, modèles, calculateurs, actualités et ressources pratiques pour développer votre
                  activité dans la propreté.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/ressources" onClick={close} className="bento-btn bento-btn-primary min-h-0 px-3 py-2 text-xs normal-case tracking-normal">
                    Voir toutes les ressources
                  </Link>
                  <Link href="/inscription" onClick={close} className="bento-btn min-h-0 px-3 py-2 text-xs normal-case tracking-normal">
                    Créer un compte gratuit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResourcesMobileMenu({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[12px] px-3 py-2 uppercase tracking-wide hover:bg-indigo-50 hover:text-slate-900"
      >
        Ressources
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
          <Link
            href={BLOG_HREF}
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-[10px] bg-amber-50 px-2 py-1.5 font-extrabold normal-case tracking-normal text-slate-900 hover:bg-amber-100"
          >
            <Newspaper size={14} aria-hidden="true" /> Actualités & média
          </Link>
          {resourceRubrics.map((category) => {
            const isOpen = openCategory === category.slug;
            return (
              <div key={category.slug}>
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : category.slug)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between rounded-[10px] px-2 py-1.5 text-left uppercase tracking-wide hover:bg-indigo-50"
                >
                  {category.title}
                  <ChevronDown
                    size={12}
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <ul className="space-y-0.5 pb-1 pl-2">
                    {category.menuResourceIds.map((id) => {
                      const resource = getResourceById(id);
                      if (!resource) return null;
                      return (
                        <li key={id}>
                          <Link
                            href={getResourceHref(resource)}
                            onClick={onNavigate}
                            className="block rounded-[8px] px-2 py-1 text-xs font-semibold normal-case tracking-normal text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            {resource.title}
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link
                        href={`/ressources/${category.slug}`}
                        onClick={onNavigate}
                        className="block px-2 py-1 text-xs font-extrabold normal-case tracking-normal text-indigo-600"
                      >
                        Voir tout →
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            );
          })}
          <Link
            href="/ressources"
            onClick={onNavigate}
            className="block rounded-[10px] px-2 py-1.5 text-indigo-600 hover:bg-indigo-50"
          >
            Toutes les ressources →
          </Link>
        </div>
      )}
    </div>
  );
}
