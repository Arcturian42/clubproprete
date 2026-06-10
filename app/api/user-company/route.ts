import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const userId = session.user.id;

  const memberships = await prisma.entityMember.findMany({
    where: {
      userId,
      entityType: { in: ["company", "supplier"] },
      status: "active",
      deletedAt: null,
      role: { in: ["owner", "recruiter", "admin"] },
    },
    select: { entityId: true, entityType: true, role: true },
    orderBy: { createdAt: "desc" },
  });

  const companyIds = memberships.filter((membership) => membership.entityType === "company").map((membership) => membership.entityId);
  const supplierIds = memberships.filter((membership) => membership.entityType === "supplier").map((membership) => membership.entityId);

  const [companies, suppliers, legacyCompanies, legacySuppliers] = await Promise.all([
    companyIds.length
      ? prisma.company.findMany({
          where: { id: { in: companyIds }, deletedAt: null },
          select: { id: true, name: true, verificationStatus: true },
        })
      : [],
    supplierIds.length
      ? prisma.supplier.findMany({
          where: { id: { in: supplierIds }, deletedAt: null },
          select: { id: true, name: true, verificationStatus: true },
        })
      : [],
    prisma.company.findMany({
      where: { ownerUserId: userId, deletedAt: null },
      select: { id: true, name: true, verificationStatus: true },
    }),
    prisma.supplier.findMany({
      where: { ownerUserId: userId, deletedAt: null },
      select: { id: true, name: true, verificationStatus: true },
    }),
  ]);

  const entitiesByKey = new Map<string, { id: string; name: string; entityType: "company" | "supplier"; verificationStatus: string }>();

  for (const company of [...companies, ...legacyCompanies]) {
    entitiesByKey.set(`company:${company.id}`, {
      id: company.id,
      name: company.name,
      entityType: "company",
      verificationStatus: company.verificationStatus,
    });
  }

  for (const supplier of [...suppliers, ...legacySuppliers]) {
    entitiesByKey.set(`supplier:${supplier.id}`, {
      id: supplier.id,
      name: supplier.name,
      entityType: "supplier",
      verificationStatus: supplier.verificationStatus,
    });
  }

  const entities = Array.from(entitiesByKey.values());

  return NextResponse.json({
    entities,
    id: entities[0]?.id ?? null,
    entityType: entities[0]?.entityType ?? null,
    name: entities[0]?.name ?? null,
  });
}
