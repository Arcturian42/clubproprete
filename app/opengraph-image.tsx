import { ImageResponse } from "next/og";

// Image de partage par défaut (LinkedIn, Google, moteurs génératifs).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Club Propreté — La boîte à outils des professionnels de la propreté";

export default function OpengraphImage() {
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
          <div style={{ display: "flex", color: "white", fontSize: 40, fontWeight: 800 }}>
            Club Propreté
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", color: "white", fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
            La boîte à outils des pros de la propreté
          </div>
          <div style={{ display: "flex", color: "#94a3b8", fontSize: 30, fontWeight: 500 }}>
            Annuaire · Emploi · Formations · Association · Sous-traitance
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
