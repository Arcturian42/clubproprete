"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

const requestSchema = z.object({
  email: z.string().email("Veuillez saisir un email valide."),
});

export async function requestPasswordReset(formData: FormData) {
  try {
    const limit = await rateLimitByIp(await getClientIp(), "password_reset_request", 5, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de demandes. Veuillez réessayer plus tard." };
    }

    const parsed = requestSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, deletedAt: true } });

    // On répond toujours succès pour ne pas divulguer l'existence d'un compte.
    if (user && !user.deletedAt) {
      // Invalide les anciens jetons non utilisés du compte.
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

      const rawToken = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      await sendPasswordResetEmail(email, `${baseUrl}/reinitialiser-mot-de-passe?token=${rawToken}`);
    }

    return { success: true };
  } catch (err) {
    console.error("requestPasswordReset error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

const resetSchema = z.object({
  token: z.string().min(10, "Lien invalide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export async function resetPassword(formData: FormData) {
  try {
    const limit = await rateLimitByIp(await getClientIp(), "password_reset_confirm", 10, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
    }

    const parsed = resetSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { token, password } = parsed.data;
    const tokenHash = hashToken(token);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, usedAt: true, expiresAt: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return { success: false, message: "Ce lien de réinitialisation est invalide ou expiré." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      // Invalide tout autre jeton actif du compte.
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
    ]);

    return { success: true };
  } catch (err) {
    console.error("resetPassword error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
