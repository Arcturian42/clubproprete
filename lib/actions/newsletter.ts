"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

const schema = z.object({
  email: z.string().email("Email invalide."),
});

export type NewsletterResult = { success: boolean; message: string };

export async function subscribeNewsletter(
  _prev: NewsletterResult | undefined,
  formData: FormData
): Promise<NewsletterResult> {
  const ip = await getClientIp();
  const limit = await rateLimitByIp(ip, "newsletter", 3, 60_000);
  if (!limit.success) {
    return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
  }

  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Email invalide." };
  }

  try {
    // Email normalisé en minuscules (déduplication). Un ré-abonnement d'une adresse
    // précédemment désabonnée la réactive (status: "active") — sans ça, le message
    // « Vous êtes inscrit·e » était trompeur car l'update vide laissait le désabonné désabonné.
    const email = parsed.data.email.toLowerCase();
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { status: "active" },
      create: { email, source: "ressources_page" },
    });
    return { success: true, message: "Merci ! Vous êtes inscrit·e à la newsletter." };
  } catch (err) {
    console.error("subscribeNewsletter error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
