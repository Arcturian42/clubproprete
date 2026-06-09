import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const company = await prisma.company.findFirst({
    where: { ownerUserId: session.user.id, deletedAt: null },
    select: { id: true, name: true },
  });

  return NextResponse.json(company);
}
