import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo", 10);

  const users = [
    { email: "societe@clubproprete.test", firstName: "Claire", lastName: "Martin", role: "company_owner" },
    { email: "fournisseur@clubproprete.test", firstName: "Nicolas", lastName: "Bernard", role: "supplier_owner" },
    { email: "independant@clubproprete.test", firstName: "Karim", lastName: "B.", role: "independent_profile" },
    { email: "candidat@clubproprete.test", firstName: "Laura", lastName: "D.", role: "candidate_profile" },
    { email: "formation@clubproprete.test", firstName: "Marie", lastName: "Lefebvre", role: "training_organization" },
    { email: "auteur@clubproprete.test", firstName: "Philippe", lastName: "Dubois", role: "author" },
    { email: "admin@clubproprete.test", firstName: "Admin", lastName: "Club", role: "admin" },
    { email: "superadmin@clubproprete.test", firstName: "Super", lastName: "Admin", role: "super_admin" },
  ];

  const userIdByEmail = new Map<string, string>();
  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        mainRole: u.role,
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });
    userIdByEmail.set(u.email, created.id);
  }

  const companyOwnerId = userIdByEmail.get("societe@clubproprete.test")!;
  const supplierOwnerId = userIdByEmail.get("fournisseur@clubproprete.test")!;

  // Société de démonstration. L'id fixe « company-1 » est référencé par les tests
  // E2E (admin) pour rattacher une offre en attente de modération.
  await prisma.company.upsert({
    where: { id: "company-1" },
    update: {
      ownerUserId: companyOwnerId,
      name: "Azur Propreté Services",
      verificationStatus: "approved",
      deletedAt: null,
    },
    create: {
      id: "company-1",
      ownerUserId: companyOwnerId,
      name: "Azur Propreté Services",
      slug: "azur-proprete-services",
      city: "Paris",
      region: "Île-de-France",
      verificationStatus: "approved",
      associationMember: true,
    },
  });

  // Fournisseurs vérifiés affichés dans l'annuaire (/annuaire/fournisseurs) et
  // ciblés par les tests E2E. La famille « machines » permet de valider le filtre.
  const suppliers = [
    {
      id: "supplier-eco",
      name: "EcoMateriel Pro",
      slug: "ecomateriel-pro",
      family: "materiel",
      category: "materiel",
      offerType: "vente",
    },
    {
      id: "supplier-epi",
      name: "EPI Direct",
      slug: "epi-direct",
      family: "consommables",
      category: "consommables",
      offerType: "vente",
    },
    {
      id: "supplier-machines",
      name: "MachinesNet Industries",
      slug: "machinesnet-industries",
      family: "machines",
      category: "machines",
      offerType: "les_deux",
    },
  ];

  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { id: s.id },
      update: {
        ownerUserId: supplierOwnerId,
        name: s.name,
        family: s.family,
        category: s.category,
        offerType: s.offerType,
        verificationStatus: "approved",
        deletedAt: null,
      },
      create: {
        id: s.id,
        ownerUserId: supplierOwnerId,
        name: s.name,
        slug: s.slug,
        family: s.family,
        category: s.category,
        offerType: s.offerType,
        deliveryAreas: "France entière",
        verificationStatus: "approved",
      },
    });
  }

  console.log("Seed completed:", users.length, "users,", "1 company,", suppliers.length, "suppliers");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
