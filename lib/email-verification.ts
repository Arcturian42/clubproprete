// Gestion des tokens de vérification d'email
// En production, brancher sur un service d'email transactionnel (Resend).

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 heures

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  // Invalide les anciens tokens
  await prisma.verificationRequest.deleteMany({
    where: { requestedBy: userId, entityType: "email_verification" },
  });

  await prisma.verificationRequest.create({
    data: {
      entityType: "email_verification",
      entityId: userId,
      requestedBy: userId,
      status: "pending",
      // On réutilise les champs du modèle VerificationRequest pour stocker
      // le token hashé et l'expiration.
      additionalInfo: tokenHash,
      preferredSlot: expiresAt.toISOString(),
    },
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; message: string }> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const request = await prisma.verificationRequest.findFirst({
    where: {
      entityType: "email_verification",
      additionalInfo: tokenHash,
      status: "pending",
    },
  });

  if (!request) {
    return { success: false, message: "Lien de vérification invalide ou déjà utilisé." };
  }

  const expiresAt = new Date(request.preferredSlot || 0);
  if (expiresAt < new Date()) {
    return { success: false, message: "Ce lien de vérification a expiré." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: request.requestedBy },
      data: { emailVerified: true },
    }),
    prisma.verificationRequest.update({
      where: { id: request.id },
      data: { status: "approved", reviewedAt: new Date() },
    }),
  ]);

  return { success: true, message: "Votre adresse email a été vérifiée." };
}
