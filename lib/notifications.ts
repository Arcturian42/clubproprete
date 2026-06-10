import { prisma } from "@/lib/prisma";

export type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
};

/**
 * Crée une notification in-app pour un utilisateur. Best-effort : une erreur ici ne
 * doit jamais faire échouer l'action métier appelante.
 */
export async function notifyUser(input: NotificationInput) {
  try {
    if (!input.userId) return;
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    console.error("notifyUser error:", err);
  }
}
