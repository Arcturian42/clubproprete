"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PermissionError, requireUser } from "@/lib/permissions";

export async function getMyNotifications(limit = 30) {
  try {
    const session = await requireUser();
    return await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (err) {
    if (err instanceof PermissionError) return [];
    console.error("getMyNotifications error:", err);
    return [];
  }
}

export async function getUnreadNotificationCount() {
  try {
    const session = await requireUser();
    return await prisma.notification.count({ where: { userId: session.user.id, readAt: null } });
  } catch (err) {
    if (err instanceof PermissionError) return 0;
    console.error("getUnreadNotificationCount error:", err);
    return 0;
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const session = await requireUser();
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) return { success: false, message: err.message };
    console.error("markNotificationRead error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function markAllNotificationsRead() {
  try {
    const session = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) return { success: false, message: err.message };
    console.error("markAllNotificationsRead error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
