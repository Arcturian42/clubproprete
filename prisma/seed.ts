import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo", 10);

  const users = [
    {
      email: "societe@clubproprete.test",
      firstName: "Claire",
      lastName: "Martin",
      phone: "06 12 34 56 78",
      mainRole: "company_owner",
      passwordHash,
    },
    {
      email: "fournisseur@clubproprete.test",
      firstName: "Nicolas",
      lastName: "Bernard",
      phone: "06 23 45 67 89",
      mainRole: "supplier_owner",
      passwordHash,
    },
    {
      email: "independant@clubproprete.test",
      firstName: "Karim",
      lastName: "B.",
      phone: "06 34 56 78 90",
      mainRole: "independent_profile",
      passwordHash,
    },
    {
      email: "candidat@clubproprete.test",
      firstName: "Laura",
      lastName: "D.",
      phone: "06 45 67 89 01",
      mainRole: "candidate_profile",
      passwordHash,
    },
    {
      email: "formation@clubproprete.test",
      firstName: "Marie",
      lastName: "Lefebvre",
      phone: "06 56 78 90 12",
      mainRole: "training_organization",
      passwordHash,
    },
    {
      email: "auteur@clubproprete.test",
      firstName: "Philippe",
      lastName: "Dubois",
      phone: "06 67 89 01 23",
      mainRole: "author",
      passwordHash,
    },
    {
      email: "admin@clubproprete.test",
      firstName: "Admin",
      lastName: "Club",
      phone: "06 78 90 12 34",
      mainRole: "admin",
      passwordHash,
    },
    {
      email: "superadmin@clubproprete.test",
      firstName: "Super",
      lastName: "Admin",
      phone: "06 88 99 00 11",
      mainRole: "super_admin",
      passwordHash,
    },
    {
      email: "independant2@clubproprete.test",
      firstName: "Sophie",
      lastName: "L.",
      phone: "06 98 76 54 32",
      mainRole: "independent_profile",
      passwordHash,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        mainRole: u.mainRole,
        passwordHash: u.passwordHash,
        emailVerified: true,
      },
      create: { ...u, emailVerified: true },
    });
  }

  // Seed companies
  const companyOwner = await prisma.user.findUnique({
    where: { email: "societe@clubproprete.test" },
  });

  if (companyOwner) {
    await prisma.company.upsert({
      where: { id: "company-1" },
      update: {},
      create: {
        id: "company-1",
        ownerUserId: companyOwner.id,
        name: "Azur Proprete Services",
        legalName: "Azur Proprete Services SARL",
        siret: "123 456 789 00012",
        city: "Nice",
        region: "Provence-Alpes-Cote d'Azur",
        employeeCount: "11-50",
        descriptionShort: "Entreprise de propreté spécialisée",
        descriptionLong:
          "Description de votre entreprise de nettoyage professionnel...",
        email: "contact@azurproprete.fr",
        phone: "04 93 00 00 01",
        website: "azurproprete.fr",
        address: "123 rue de la Propreté",
        postalCode: "06000",
        foundedAt: new Date("2015-01-01"),
        verificationStatus: "approved",
        associationMember: true,
      },
    });
  }

  // Seed jobs
  const company1 = await prisma.company.findUnique({
    where: { id: "company-1" },
  });
  if (company1 && companyOwner) {
    await prisma.job.upsert({
      where: { id: "job-1" },
      update: {},
      create: {
        id: "job-1",
        companyId: company1.id,
        createdBy: companyOwner.id,
        title: "Chef d'equipe propreté tertiaire",
        description: "Nous recherchons un chef d'équipe expérimenté...",
        contractType: "CDI",
        city: "Nice",
        status: "published",
        publishedAt: new Date(),
      },
    });
  }

  // Seed candidate profile
  const candidateUser = await prisma.user.findUnique({
    where: { email: "candidat@clubproprete.test" },
  });
  if (candidateUser) {
    await prisma.candidateProfile.upsert({
      where: { userId: candidateUser.id },
      update: {},
      create: {
        userId: candidateUser.id,
        firstName: "Laura",
        lastName: "D.",
        city: "Paris",
        desiredContracts: "CDI,CDD",
        experienceYears: 3,
      },
    });
  }

  // Seed independent profiles
  const independantUser1 = await prisma.user.findUnique({
    where: { email: "independant@clubproprete.test" },
  });
  const independantUser2 = await prisma.user.findUnique({
    where: { email: "independant2@clubproprete.test" },
  });

  if (independantUser1) {
    await prisma.independentProfile.upsert({
      where: { userId: independantUser1.id },
      update: {},
      create: {
        userId: independantUser1.id,
        displayName: "Karim B. - Propreté",
        businessName: "KB Propreté",
        legalStatus: "Auto-entrepreneur",
        siret: "123 456 789 00013",
        email: independantUser1.email,
        phone: independantUser1.phone,
        city: "Marseille",
        postalCode: "13001",
        region: "Provence-Alpes-Cote d'Azur",
        mobilityRadius: 30,
        hasVehicle: true,
        hasInsurance: true,
        equipmentOwned: "Aspirateur professionnel, autolaveuse",
        experienceYears: 5,
        availabilityStatus: "immediate",
        hourlyRateRange: "25-35€",
        bio: "Professionnel de la propreté avec 5 ans d'expérience sur Marseille et ses alentours.",
        verificationStatus: "approved",
        associationStatus: "approved",
      },
    });
  }

  if (independantUser2) {
    await prisma.independentProfile.upsert({
      where: { userId: independantUser2.id },
      update: {},
      create: {
        userId: independantUser2.id,
        displayName: "Sophie L. - Services",
        businessName: "SL Propreté Services",
        legalStatus: "Micro-entreprise",
        siret: "123 456 789 00014",
        email: independantUser2.email,
        phone: independantUser2.phone,
        city: "Lyon",
        postalCode: "69001",
        region: "Auvergne-Rhone-Alpes",
        mobilityRadius: 20,
        hasVehicle: false,
        hasInsurance: true,
        equipmentOwned: "Produits écologiques, serpillières",
        experienceYears: 3,
        availabilityStatus: "two_weeks",
        hourlyRateRange: "22-28€",
        bio: "Spécialisée dans le nettoyage écologique de bureaux et espaces tertiaires à Lyon.",
        verificationStatus: "approved",
        associationStatus: "approved",
      },
    });
  }

  // Seed trainings
  const trainingUser = await prisma.user.findUnique({
    where: { email: "formation@clubproprete.test" },
  });
  if (trainingUser) {
    await prisma.training.upsert({
      where: { id: "training-1" },
      update: {},
      create: {
        id: "training-1",
        creatorUserId: trainingUser.id,
        creatorType: "Organisme",
        title: "Remise en etat apres chantier",
        category: "Technique terrain",
        description:
          "Formation pratique pour maîtriser les techniques de remise en état après travaux.",
        duration: "2 jours (14h)",
        format: "Presentiel",
        city: "Nice",
        priceInfoOptional:
          "Gratuit pour les membres association, 290€ HT pour les non-membres",
        certificationName: "Attestation de competence Club Proprete",
        contactEmail: "formation@azurproprete.fr",
        status: "approved",
      },
    });

    await prisma.training.upsert({
      where: { id: "training-2" },
      update: {},
      create: {
        id: "training-2",
        creatorUserId: trainingUser.id,
        creatorType: "Organisme",
        title: "Gestion des dechets et tri selectif",
        category: "Environnement",
        description:
          "Apprenez à mettre en place une gestion efficace des déchets sur vos chantiers de nettoyage.",
        duration: "1 jour (7h)",
        format: "Presentiel",
        city: "Lyon",
        priceInfoOptional:
          "Gratuit pour les membres association, 150€ HT pour les non-membres",
        certificationName: "Attestation de competence Club Proprete",
        contactEmail: "formation@azurproprete.fr",
        status: "approved",
      },
    });

    await prisma.training.upsert({
      where: { id: "training-3" },
      update: {},
      create: {
        id: "training-3",
        creatorUserId: trainingUser.id,
        creatorType: "Organisme",
        title: "Habilitation electrique H0B0",
        category: "Securite",
        description:
          "Formation obligatoire pour tout personnel évoluant à proximité d'installations électriques.",
        duration: "1/2 journee (3h30)",
        format: "Presentiel",
        city: "Paris",
        priceInfoOptional:
          "Gratuit pour les membres association, 120€ HT pour les non-membres",
        certificationName: "Attestation de competence Club Proprete",
        contactEmail: "formation@azurproprete.fr",
        status: "approved",
      },
    });
  }

  // Seed suppliers
  const supplierOwner = await prisma.user.findUnique({
    where: { email: "fournisseur@clubproprete.test" },
  });
  if (supplierOwner) {
    const suppliers = [
      {
        id: "supplier-1",
        name: "EcoMateriel Pro",
        category: "Produits d'entretien ecologiques",
        description: "Gamme complete de produits eco-labellises pour le nettoyage tertiaire et industriel. Basés à Paris.",
        deliveryAreas: "France entiere",
        nationalCoverage: true,
      },
      {
        id: "supplier-2",
        name: "EPI Direct",
        category: "Equipements de protection individuelle",
        description: "Distributeur d'EPI : gants, chaussures, vetements, masques. Stocks importants. Basés à Lyon.",
        deliveryAreas: "France entiere",
        nationalCoverage: true,
      },
      {
        id: "supplier-3",
        name: "MachinesNet Industries",
        category: "Materiel et machines de nettoyage",
        description: "Vente, location et maintenance d'autolaveuses, monobrosses et aspirateurs professionnels. Basés à Lille.",
        deliveryAreas: "Hauts-de-France, Ile-de-France, Normandie",
        nationalCoverage: false,
      },
      {
        id: "supplier-4",
        name: "TextilePro Services",
        category: "Linge et textile",
        description: "Lavage, location et entretien du linge professionnel pour les societes de nettoyage. Basés à Nantes.",
        deliveryAreas: "Grand Ouest",
        nationalCoverage: false,
      },
      {
        id: "supplier-5",
        name: "AssurNet Conseil",
        category: "Services aux entreprises",
        description: "Courtage en assurance, conseil RH et juridique specialise propreté. Basés à Bordeaux.",
        deliveryAreas: "France entiere",
        nationalCoverage: true,
      },
    ];

    for (const s of suppliers) {
      await prisma.supplier.upsert({
        where: { id: s.id },
        update: {},
        create: {
          ...s,
          ownerUserId: supplierOwner.id,
          legalName: s.name,
          contactName: "Nicolas Bernard",
          email: `contact@${s.name.toLowerCase().replace(/\s+/g, "")}.fr`,
          phone: "01 80 00 00 00",
          verificationStatus: "approved",
        },
      });
    }
  }

  // Seed supplier services
  const seededSuppliers = await prisma.supplier.findMany({
    where: {
      id: {
        in: ["supplier-1", "supplier-2", "supplier-3", "supplier-4", "supplier-5"],
      },
    },
  });

  const supplierServicesData = [
    {
      id: "ss-1",
      title: "Produits d'entretien écologiques",
      category: "Produits",
      description: "Gamme complète de produits éco-labellisés pour le nettoyage professionnel.",
    },
    {
      id: "ss-2",
      title: "Equipements de protection individuelle",
      category: "EPI",
      description: "Fourniture d'EPI : gants, chaussures de sécurité, vêtements professionnels.",
    },
    {
      id: "ss-3",
      title: "Location de machines de nettoyage",
      category: "Machines",
      description: "Location et maintenance d'autolaveuses, monobrosses et aspirateurs industriels.",
    },
    {
      id: "ss-4",
      title: "Linge professionnel",
      category: "Textile",
      description: "Lavage, location et entretien du linge professionnel pour sociétés de nettoyage.",
    },
    {
      id: "ss-5",
      title: "Assurance et conseil RH",
      category: "Services",
      description: "Courtage en assurance, conseil juridique et RH spécialisé propreté.",
    },
  ];

  for (let i = 0; i < seededSuppliers.length; i++) {
    const supplier = seededSuppliers[i];
    const serviceData = supplierServicesData[i];
    if (supplier && serviceData) {
      await prisma.supplierService.upsert({
        where: { id: serviceData.id },
        update: {},
        create: {
          id: serviceData.id,
          supplierId: supplier.id,
          title: serviceData.title,
          category: serviceData.category,
          description: serviceData.description,
          isActive: true,
        },
      });
    }
  }

  // Seed company service
  if (company1) {
    await prisma.companyService.upsert({
      where: { id: "cs-1" },
      update: {},
      create: {
        id: "cs-1",
        companyId: company1.id,
        serviceType: "Propreté tertiaire",
        isPrimary: true,
        description: "Nettoyage professionnel de bureaux, espaces communs et surfaces tertiaires.",
      },
    });
  }

  // Seed subcontracting missions
  if (companyOwner && company1) {
    const missions = [
      {
        id: "mission-1",
        title: "Renfort vitrerie centre commercial",
        description: "Intervention urgente sur 3 jours pour nettoyage vitrerie en hauteur. Equipement fourni, accreditation hauteur requise.",
        serviceType: "Vitrerie",
        city: "Nice",
        postalCode: "06000",
        urgencyLevel: "Cette semaine",
        peopleNeeded: 2,
        status: "approved",
      },
      {
        id: "mission-2",
        title: "Equipe remise en etat bureaux",
        description: "Remise en etat post-travaux sur 800m² de bureaux. Materiel sur place, 2 jours estimés.",
        serviceType: "Remise en etat",
        city: "Cannes",
        postalCode: "06400",
        urgencyLevel: "Sous 15 jours",
        peopleNeeded: 3,
        status: "approved",
      },
    ];

    for (const m of missions) {
      await prisma.subcontractingMission.upsert({
        where: { id: m.id },
        update: {},
        create: {
          ...m,
          creatorUserId: companyOwner.id,
          creatorEntityId: company1.id,
        },
      });
    }
  }

  // Seed articles
  const authorUser = await prisma.user.findUnique({
    where: { email: "auteur@clubproprete.test" },
  });
  if (authorUser) {
    await prisma.article.upsert({
      where: { id: "article-1" },
      update: {},
      create: {
        id: "article-1",
        authorId: authorUser.id,
        title: "Comment trouver un fournisseur de nettoyage fiable",
        slug: "trouver-fournisseur-nettoyage-fiable",
        excerpt:
          "Choisir le bon fournisseur est crucial pour votre activité.",
        content:
          "Trouver un fournisseur fiable est un enjeu majeur pour les sociétés de nettoyage...",
        category: "Fournisseurs",
        status: "published",
        publishedAt: new Date("2026-06-01"),
      },
    });

    await prisma.article.upsert({
      where: { id: "article-2" },
      update: {},
      create: {
        id: "article-2",
        authorId: authorUser.id,
        title: "Les normes de securite en entreprise de propreté",
        slug: "normes-securite-entreprise-proprete",
        excerpt:
          "Un guide complet sur les normes de sécurité à respecter dans le secteur du nettoyage.",
        content:
          "La sécurité des agents de propreté est primordiale. Découvrez les équipements de protection individuelle obligatoires...",
        category: "Sécurité",
        status: "published",
        publishedAt: new Date("2026-05-15"),
      },
    });

    await prisma.article.upsert({
      where: { id: "article-3" },
      update: {},
      create: {
        id: "article-3",
        authorId: authorUser.id,
        title: "Comment choisir ses produits d'entretien ecologiques",
        slug: "choisir-produits-entretien-ecologiques",
        excerpt:
          "Les produits écologiques sont de plus en plus demandés par les clients.",
        content:
          "Le choix des produits d'entretien écologiques est un enjeu majeur pour les entreprises de nettoyage...",
        category: "Fournisseurs",
        status: "published",
        publishedAt: new Date("2026-04-20"),
      },
    });
  }

  // Seed association membership
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@clubproprete.test" },
  });
  if (companyOwner && company1) {
    await prisma.associationMembership.upsert({
      where: { id: "membership-1" },
      update: {},
      create: {
        id: "membership-1",
        userId: companyOwner.id,
        profileType: "company_owner",
        entityType: "Company",
        entityId: company1.id,
        motivation: "Rejoindre le réseau Club Propreté pour développer notre activité",
        needs: "Visibilité, sous-traitance, recrutement",
        contribution: "Partager notre expertise en propreté tertiaire",
        status: "approved",
        reviewedBy: adminUser?.id,
        reviewedAt: new Date("2026-01-15"),
      },
    });
  }

  // Seed job application
  const job1 = await prisma.job.findUnique({
    where: { id: "job-1" },
  });
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: candidateUser?.id },
  });
  if (job1 && candidateUser && candidateProfile) {
    await prisma.jobApplication.upsert({
      where: { id: "application-1" },
      update: {},
      create: {
        id: "application-1",
        jobId: job1.id,
        applicantUserId: candidateUser.id,
        candidateProfileId: candidateProfile.id,
        message: "Je suis très intéressée par ce poste de chef d'équipe. J'ai 3 ans d'expérience dans la propreté tertiaire.",
        status: "submitted",
      },
    });
  }

  console.log("✅ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
