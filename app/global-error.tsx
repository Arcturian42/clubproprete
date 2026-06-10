"use client";

import { useEffect } from "react";

// Filet de sécurité de dernier recours : capture les erreurs survenant dans le
// root layout lui-même (que `app/error.tsx` ne couvre pas). Doit rendre <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ fontFamily: "sans-serif", margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Une erreur critique est survenue</h1>
          <p style={{ color: "#64748b", fontWeight: 600 }}>
            Veuillez réessayer dans un instant. Si le problème persiste, contactez le support.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              background: "#4f46e5",
              color: "white",
              border: "2px solid #0f172a",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
