import { ImageResponse } from "next/og";

// Dimensions standard des images de partage (Open Graph / Twitter / IA).
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Image de partage « brandée » générée à la volée pour une entité (offre,
 * société, etc.). Mutualise la mise en page avec l'OG racine pour une identité
 * visuelle cohérente sur les réseaux et dans les aperçus des moteurs génératifs.
 */
export function brandedOgImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f172a",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              background: "#4f46e5",
              color: "white",
              fontSize: 44,
              fontWeight: 800,
              borderRadius: 18,
            }}
          >
            CP
          </div>
          <div style={{ display: "flex", color: "white", fontSize: 36, fontWeight: 800 }}>
            Club Propreté
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", color: "#818cf8", fontSize: 28, fontWeight: 700, textTransform: "uppercase" }}>
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              color: "white",
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {title.length > 80 ? `${title.slice(0, 79)}…` : title}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", color: "#94a3b8", fontSize: 30, fontWeight: 500 }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
