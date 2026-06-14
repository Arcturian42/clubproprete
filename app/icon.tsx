import { ImageResponse } from "next/og";

// Favicon généré à la volée : monogramme « CP » sur fond indigo.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          color: "white",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: -1,
          borderRadius: 7,
        }}
      >
        CP
      </div>
    ),
    { ...size }
  );
}
