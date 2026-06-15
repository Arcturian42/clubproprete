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

  for (const u of users) {
    await prisma.user.upsert({
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
  }

  console.log("Seed completed:", users.length, "users");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
