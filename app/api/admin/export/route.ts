import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { exportModerationQueue } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rafraîchir le rôle depuis la base pour éviter les JWT stale (élévation
  // de privilèges persistante après rétrogradation d'un admin).
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mainRole: true, status: true, deletedAt: true },
  });

  if (!dbUser || dbUser.deletedAt || dbUser.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = dbUser.mainRole;
  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csv = await exportModerationQueue();
  const filename = `moderation-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
