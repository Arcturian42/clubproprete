"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "cookie-consent";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) setShow(true);
    } catch {
      // localStorage indisponible (mode privé, etc.)
      setShow(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: false, date: new Date().toISOString() }));
    } catch {
      // ignore
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-slate-900 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm font-semibold text-slate-700">
          Ce site utilise des cookies essentiels au fonctionnement de la plateforme.
          En continuant, vous acceptez notre{" "}
          <a href="/politique-confidentialite" className="text-indigo-600 hover:underline">
            politique de confidentialité
          </a>
          .
        </p>
        <button
          onClick={accept}
          className="bento-btn bento-btn-primary shrink-0"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}
