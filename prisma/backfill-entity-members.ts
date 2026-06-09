import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type BackfillEntity = {
  entityType: "company" | "supplier" | "training_organization";
  entityId: string;
  ownerUserId: string;
};

async function upsertOwnerMembership({ entityType, entityId, ownerUserId }: BackfillEntity) {
  await prisma.entityMember.upsert({
    where: {
      userId_entityType_entityId: {
        userId: ownerUserId,
        entityType,
        entityId,
      },
    },
    update: {
      role: "owner",
      status: "active",
      deletedAt: null,
    },
    create: {
      userId: ownerUserId,
      entityType,
      entityId,
      role: "owner",
      status: "active",
    },
  });
}

async function main() {
  const [companies, suppliers, trainingOrganizations] = await Promise.all([
    prisma.company.findMany({
      where: { deletedAt: null },
      select: { id: true, ownerUserId: true },
    }),
    prisma.supplier.findMany({
      where: { deletedAt: null },
      select: { id: true, ownerUserId: true },
    }),
    prisma.trainingOrganization.findMany({
      where: { deletedAt: null },
      select: { id: true, ownerUserId: true },
    }),
  ]);

  for (const company of companies) {
    await upsertOwnerMembership({
      entityType: "company",
      entityId: company.id,
      ownerUserId: company.ownerUserId,
    });
  }

  for (const supplier of suppliers) {
    await upsertOwnerMembership({
      entityType: "supplier",
      entityId: supplier.id,
      ownerUserId: supplier.ownerUserId,
    });
  }

  for (const trainingOrganization of trainingOrganizations) {
    await upsertOwnerMembership({
      entityType: "training_organization",
      entityId: trainingOrganization.id,
      ownerUserId: trainingOrganization.ownerUserId,
    });
  }

  console.log(
    `Backfilled ${companies.length} companies, ${suppliers.length} suppliers, ${trainingOrganizations.length} training organizations.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
