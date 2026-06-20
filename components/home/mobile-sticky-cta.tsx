"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * V1 — Barre d'appel à l'action collante en bas d'écran, sur mobile uniquement,
 * affichée une fois que l'utilisateur a dépassé le hero. Réduit l'abandon sur la
 * page d'accueil très longue en gardant la conversion à portée de pouce.
 */
export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-slate-900 bg-white/95 p-3 backdrop-blur lg:hidden">
      <Link href="/inscription" className="bento-btn bento-btn-primary w-full justify-center">
        Créer mon compte gratuit <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
