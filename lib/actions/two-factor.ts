"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, getTotpUri, verifyTotpCode } from "@/lib/totp";
import { encrypt, decrypt } from "@/lib/crypto-utils";
import { z } from "zod";

const codeSchema = z.string().length(6).regex(/^\d+$/);

export async function getTwoFactorSetup() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Non authentifié." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, email: true },
  });
  if (!user) return { success: false, message: "Utilisateur introuvable." };

  if (user.twoFactorEnabled) return { success: true, enabled: true };

  const secret = generateTotpSecret();
  const uri = getTotpUri(secret, user.email);
  return { success: true, enabled: false, secret, uri };
}

export async function confirmTwoFactorSetup(secret: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Non authentifié." };

  if (!codeSchema.safeParse(code).success) {
    return { success: false, message: "Code invalide." };
  }

  if (!verifyTotpCode(secret, code)) {
    return { success: false, message: "Le code est incorrect." };
  }

  const encryptedSecret = encrypt(secret);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: encryptedSecret, twoFactorEnabled: true },
  });

  return { success: true, message: "Authentification à deux facteurs activée." };
}

export async function disableTwoFactor(code: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Non authentifié." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false, message: "2FA non activé." };
  }

  const secret = decrypt(user.twoFactorSecret);
  if (!verifyTotpCode(secret, code)) {
    return { success: false, message: "Code incorrect." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: null, twoFactorEnabled: false },
  });

  return { success: true, message: "Authentification à deux facteurs désactivée." };
}

// Fonction utilitaire pour vérifier le TOTP au login (à brancher dans le flow auth plus tard)
export async function verifyTwoFactorForLogin(userId: string, code: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false, message: "2FA non requis." };
  }
  const secret = decrypt(user.twoFactorSecret);
  if (!verifyTotpCode(secret, code)) {
    return { success: false, message: "Code incorrect." };
  }
  return { success: true };
}
