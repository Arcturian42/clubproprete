import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOW_LOCAL_UPLOADS_IN_PROD = process.env.ALLOW_LOCAL_UPLOADS === "true";
// En production (Vercel), le disque est éphémère : les fichiers partent sur
// Vercel Blob dès que le store est configuré (BLOB_READ_WRITE_TOKEN présent).
const HAS_BLOB_STORAGE = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * Vérifie la signature binaire (magic bytes) du fichier au lieu de se fier au
 * `file.type` déclaré par le navigateur (qui est falsifiable).
 */
function sniffMimeType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
    return "application/pdf";
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production" && !HAS_BLOB_STORAGE && !ALLOW_LOCAL_UPLOADS_IN_PROD) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Le stockage des fichiers n'est pas encore activé sur la plateforme. Réessayez plus tard ou contactez le support.",
      },
      { status: 503 }
    );
  }

  const limit = await rateLimitByIp(await getClientIp(), "upload", 40, 600_000);
  if (!limit.success) {
    return NextResponse.json({ success: false, error: "Trop d'envois. Veuillez réessayer plus tard." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Aucun fichier fourni." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "Fichier trop volumineux (max 5Mo)." }, { status: 400 });
    }

    const rawExt = path.extname(file.name).toLowerCase();
    const ext = ALLOWED_EXT.has(rawExt) ? rawExt : ".bin";
    if (ext === ".bin") {
      return NextResponse.json({ success: false, error: "Extension non autorisée." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Sécurité : on valide par la signature binaire (magic bytes), source fiable,
    // et NON par le `file.type` déclaré par le navigateur — celui-ci est
    // falsifiable et parfois incohérent (image/jpg, image/pjpeg, type vide),
    // ce qui rejetait à tort des fichiers valides.
    const detectedType = sniffMimeType(buffer);
    if (!detectedType || !ALLOWED_TYPES.includes(detectedType)) {
      return NextResponse.json(
        { success: false, error: "Le contenu du fichier ne correspond pas à un type autorisé." },
        { status: 400 }
      );
    }

    // Le nom contient l'id du propriétaire + un UUID aléatoire : l'URL n'est pas
    // devinable. Ce n'est PAS un contrôle d'autorisation (cf. TODO S3 ci-dessous).
    const fileName = `${session.user.id}-${randomUUID()}${ext}`;

    if (HAS_BLOB_STORAGE) {
      // TODO (S3 — confidentialité des documents) : ces fichiers sont publics.
      //   `access: "public"` est aujourd'hui nécessaire car la même route sert
      //   aussi bien des ressources destinées à l'affichage public (avatars,
      //   logos, photos de fiches d'annuaire rendues par <Image> sur des pages
      //   non authentifiées) que des documents potentiellement sensibles (PDF).
      //   Rendre l'ensemble privé casserait l'annuaire public ; basculer en privé
      //   suppose donc :
      //     1. distinguer le *type* d'upload (public: avatar/logo/photo vs privé:
      //        document/CV) côté appelant ;
      //     2. pour les fichiers privés, stocker une correspondance
      //        propriétaire → clé blob en base, puis les servir via une route
      //        proxy authentifiée (/api/files/[id]) qui vérifie la propriété et
      //        renvoie une URL signée à courte durée de vie.
      //   C'est une décision produit (quels uploads sont sensibles) + une
      //   évolution de schéma : hors périmètre de ce correctif pour ne pas casser
      //   l'affichage public existant.
      const blob = await put(`uploads/${fileName}`, buffer, {
        access: "public",
        contentType: detectedType,
      });
      return NextResponse.json({ success: true, url: blob.url });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'upload." }, { status: 500 });
  }
}
