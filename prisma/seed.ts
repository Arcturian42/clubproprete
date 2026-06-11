import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Le seed crée des comptes de démonstration (mot de passe "demo", dont un
// admin) : il ne doit JAMAIS tourner contre une base distante/production.
const databaseUrl = process.env.DATABASE_URL ?? "";
const isLocalDatabase = /localhost|127\.0\.0\.1/.test(databaseUrl);
if (!isLocalDatabase && process.env.SEED_ALLOW_REMOTE !== "true") {
  console.error(
    "❌ Seed refusé : DATABASE_URL ne pointe pas vers une base locale. " +
      "Les comptes de démo (mot de passe \"demo\", rôle admin inclus) ne doivent pas être créés en production. " +
      "Pour forcer en connaissance de cause : SEED_ALLOW_REMOTE=true."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Profils de test : des personnes fictives mais réalistes, chacune avec un
// identifiant (email + mot de passe "demo") et un profil public complet.
// La liste est documentée dans docs/comptes-test.md.
// ---------------------------------------------------------------------------

type SeedUser = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  bio: string;
  mainRole: string;
  visibility: "public" | "private";
  region?: string;
};

const seedUsers: SeedUser[] = [
  {
    email: "societe@clubproprete.test",
    firstName: "Claire",
    lastName: "Martin",
    phone: "06 12 34 56 78",
    city: "Nice",
    region: "Provence-Alpes-Côte d'Azur",
    bio: "Fondatrice et gérante d'Azur Propreté Services depuis 2015. Spécialiste du nettoyage tertiaire sur la Côte d'Azur : bureaux, copropriétés et commerces. Membre active de l'association Club Propreté.",
    mainRole: "company_owner",
    visibility: "public",
  },
  {
    email: "societe2@clubproprete.test",
    firstName: "Julien",
    lastName: "Moreau",
    phone: "06 21 43 65 87",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    bio: "Dirigeant de Lyon Net Services, entreprise familiale de propreté créée en 2010. Nous intervenons sur la métropole lyonnaise pour les bureaux, les résidences et les surfaces commerciales.",
    mainRole: "company_owner",
    visibility: "public",
  },
  {
    email: "societe3@clubproprete.test",
    firstName: "Fatou",
    lastName: "Diallo",
    phone: "06 32 54 76 98",
    city: "Paris",
    region: "Île-de-France",
    bio: "Gérante de Nettéclat, société de nettoyage francilienne. 25 collaborateurs, spécialisés dans l'entretien de bureaux et la remise en état après travaux. Engagée pour l'insertion professionnelle.",
    mainRole: "company_owner",
    visibility: "public",
  },
  {
    email: "societe4@clubproprete.test",
    firstName: "Marc",
    lastName: "Da Silva",
    phone: "06 43 65 87 09",
    city: "Nantes",
    region: "Pays de la Loire",
    bio: "Co-fondateur d'Atlantique Propreté à Nantes. Nettoyage industriel et tertiaire sur le Grand Ouest. Nous cherchons régulièrement des sous-traitants fiables pour nos chantiers.",
    mainRole: "company_owner",
    visibility: "public",
  },
  {
    email: "fournisseur@clubproprete.test",
    firstName: "Nicolas",
    lastName: "Bernard",
    phone: "06 23 45 67 89",
    city: "Paris",
    region: "Île-de-France",
    bio: "Responsable commercial chez EcoMateriel Pro. J'accompagne les sociétés de nettoyage dans le choix de produits éco-labellisés et de matériel professionnel depuis plus de 10 ans.",
    mainRole: "supplier_owner",
    visibility: "public",
  },
  {
    email: "independant@clubproprete.test",
    firstName: "Karim",
    lastName: "Benali",
    phone: "06 34 56 78 90",
    city: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    bio: "Auto-entrepreneur en propreté depuis 5 ans (KB Propreté). Vitrerie, remise en état et entretien régulier sur Marseille et alentours. Véhiculé, équipé, assuré. Disponible pour de la sous-traitance.",
    mainRole: "independent_profile",
    visibility: "public",
  },
  {
    email: "independant2@clubproprete.test",
    firstName: "Sophie",
    lastName: "Lemaire",
    phone: "06 98 76 54 32",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    bio: "Micro-entrepreneuse spécialisée dans le nettoyage écologique de bureaux et d'espaces tertiaires à Lyon. Produits éco-labellisés exclusivement. 3 ans d'expérience en propreté tertiaire.",
    mainRole: "independent_profile",
    visibility: "public",
  },
  {
    email: "candidat@clubproprete.test",
    firstName: "Laura",
    lastName: "Dupont",
    phone: "06 45 67 89 01",
    city: "Paris",
    region: "Île-de-France",
    bio: "Agent de propreté avec 3 ans d'expérience en environnement tertiaire (bureaux, accueil de sites). Je recherche un poste en CDI ou CDD sur Paris, avec une évolution possible vers un poste de chef d'équipe.",
    mainRole: "candidate_profile",
    visibility: "public",
  },
  {
    email: "formation@clubproprete.test",
    firstName: "Marie",
    lastName: "Lefebvre",
    phone: "06 56 78 90 12",
    city: "Nice",
    region: "Provence-Alpes-Côte d'Azur",
    bio: "Responsable pédagogique, je conçois des formations courtes et pratiques pour les équipes de propreté : techniques terrain, sécurité, environnement. Certifiée Qualiopi.",
    mainRole: "training_organization",
    visibility: "public",
  },
  {
    email: "auteur@clubproprete.test",
    firstName: "Philippe",
    lastName: "Dubois",
    phone: "06 67 89 01 23",
    city: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    bio: "Journaliste spécialisé BtoB, j'écris depuis 15 ans sur les services aux entreprises. Pour Club Propreté, je couvre les fournisseurs, les achats responsables et les évolutions du secteur.",
    mainRole: "author",
    visibility: "public",
  },
  {
    email: "auteur2@clubproprete.test",
    firstName: "Nadia",
    lastName: "Charpentier",
    phone: "06 77 88 99 00",
    city: "Lille",
    region: "Hauts-de-France",
    bio: "Consultante QHSE et formatrice, j'accompagne les entreprises de propreté sur la sécurité au travail et la conformité réglementaire. Je partage ici des guides pratiques issus du terrain.",
    mainRole: "author",
    visibility: "public",
  },
  {
    email: "admin@clubproprete.test",
    firstName: "Admin",
    lastName: "Club",
    phone: "06 78 90 12 34",
    city: "Paris",
    bio: "",
    mainRole: "admin",
    visibility: "private",
  },
  {
    email: "superadmin@clubproprete.test",
    firstName: "Super",
    lastName: "Admin",
    phone: "06 88 99 00 11",
    city: "Paris",
    bio: "",
    mainRole: "super_admin",
    visibility: "private",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("demo", 10);

  const usersByEmail = new Map<string, { id: string }>();

  for (const u of seedUsers) {
    const data = {
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      city: u.city,
      bio: u.bio || null,
      mainRole: u.mainRole,
      passwordHash,
      emailVerified: true,
    };
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: data,
      create: { email: u.email, ...data },
    });
    usersByEmail.set(u.email, user);

    // Profil membre : visible publiquement pour les comptes de test (hors admin).
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        profileType: u.mainRole,
        visibility: u.visibility,
        city: u.city,
        region: u.region ?? null,
        completionScore: u.visibility === "public" ? 80 : 40,
        verificationStatus: "approved",
        onboardingCompletedAt: new Date("2026-02-01"),
      },
      create: {
        userId: user.id,
        profileType: u.mainRole,
        visibility: u.visibility,
        city: u.city,
        region: u.region ?? null,
        completionScore: u.visibility === "public" ? 80 : 40,
        verificationStatus: "approved",
        onboardingCompletedAt: new Date("2026-02-01"),
      },
    });
  }

  const getUser = (email: string) => {
    const user = usersByEmail.get(email);
    if (!user) throw new Error(`Seed user manquant : ${email}`);
    return user;
  };

  // -------------------------------------------------------------------------
  // Sociétés de nettoyage (fiches vérifiées, géolocalisées, slugs SEO)
  // -------------------------------------------------------------------------
  const companies = [
    {
      id: "company-1",
      ownerEmail: "societe@clubproprete.test",
      name: "Azur Propreté Services",
      slug: "azur-proprete-services",
      legalName: "Azur Propreté Services SARL",
      siret: "123 456 789 00012",
      city: "Nice",
      postalCode: "06000",
      region: "Provence-Alpes-Côte d'Azur",
      address: "12 avenue Jean Médecin",
      latitude: 43.7102,
      longitude: 7.262,
      employeeCount: "11-50",
      descriptionShort: "Nettoyage tertiaire de bureaux, copropriétés et commerces sur la Côte d'Azur.",
      descriptionLong:
        "Créée en 2015 à Nice, Azur Propreté Services accompagne les entreprises et syndics de la Côte d'Azur pour l'entretien régulier de leurs locaux : bureaux, parties communes, commerces et cabinets médicaux.\n\nNotre équipe de 30 agents formés intervient de Cannes à Monaco, avec un encadrement de proximité et des produits éco-labellisés. Nous assurons également des prestations ponctuelles : remise en état après travaux, vitrerie et nettoyage haute pression.",
      email: "contact@azurproprete.fr",
      phone: "04 93 00 00 01",
      website: "azurproprete.fr",
      foundedAt: new Date("2015-01-01"),
      associationMember: true,
      services: [
        { id: "cs-1", serviceType: "Propreté tertiaire", isPrimary: true, description: "Nettoyage de bureaux, espaces communs et surfaces tertiaires." },
        { id: "cs-2", serviceType: "Vitrerie", isPrimary: false, description: "Nettoyage de vitres et surfaces vitrées, y compris en hauteur." },
      ],
    },
    {
      id: "company-2",
      ownerEmail: "societe2@clubproprete.test",
      name: "Lyon Net Services",
      slug: "lyon-net-services",
      legalName: "Lyon Net Services SAS",
      siret: "234 567 891 00023",
      city: "Lyon",
      postalCode: "69003",
      region: "Auvergne-Rhône-Alpes",
      address: "45 cours Lafayette",
      latitude: 45.764,
      longitude: 4.8357,
      employeeCount: "11-50",
      descriptionShort: "Entreprise familiale de propreté sur la métropole lyonnaise depuis 2010.",
      descriptionLong:
        "Lyon Net Services est une entreprise familiale créée en 2010. Nous entretenons au quotidien des bureaux, résidences et surfaces commerciales sur l'ensemble de la métropole lyonnaise.\n\nNotre force : des équipes stables, un interlocuteur unique pour chaque client et un contrôle qualité mensuel documenté. Nous recrutons toute l'année des agents et chefs d'équipe.",
      email: "contact@lyonnetservices.fr",
      phone: "04 72 00 00 02",
      website: "lyonnetservices.fr",
      foundedAt: new Date("2010-03-01"),
      associationMember: false,
      services: [
        { id: "cs-3", serviceType: "Propreté tertiaire", isPrimary: true, description: "Entretien régulier de bureaux et locaux professionnels." },
        { id: "cs-4", serviceType: "Entretien d'immeubles", isPrimary: false, description: "Parties communes, sorties de conteneurs, vitrerie de halls." },
      ],
    },
    {
      id: "company-3",
      ownerEmail: "societe3@clubproprete.test",
      name: "Nettéclat",
      slug: "netteclat",
      legalName: "Nettéclat SARL",
      siret: "345 678 912 00034",
      city: "Paris",
      postalCode: "75011",
      region: "Île-de-France",
      address: "8 rue de la Roquette",
      latitude: 48.8566,
      longitude: 2.3522,
      employeeCount: "11-50",
      descriptionShort: "Nettoyage de bureaux et remise en état après travaux en Île-de-France.",
      descriptionLong:
        "Nettéclat intervient dans tout Paris et la petite couronne pour l'entretien de bureaux, d'espaces de coworking et de commerces.\n\nNotre spécialité : la remise en état après travaux, avec des équipes dédiées capables d'intervenir en horaires décalés et le week-end. Entreprise engagée, nous favorisons l'insertion professionnelle et la formation interne de nos 25 collaborateurs.",
      email: "contact@netteclat.fr",
      phone: "01 48 00 00 03",
      website: "netteclat.fr",
      foundedAt: new Date("2017-09-01"),
      associationMember: true,
      services: [
        { id: "cs-5", serviceType: "Propreté tertiaire", isPrimary: true, description: "Bureaux, coworking et commerces." },
        { id: "cs-6", serviceType: "Remise en état", isPrimary: false, description: "Fin de chantier, après travaux, gros nettoyages ponctuels." },
      ],
    },
    {
      id: "company-4",
      ownerEmail: "societe4@clubproprete.test",
      name: "Atlantique Propreté",
      slug: "atlantique-proprete",
      legalName: "Atlantique Propreté SAS",
      siret: "456 789 123 00045",
      city: "Nantes",
      postalCode: "44000",
      region: "Pays de la Loire",
      address: "3 quai de la Fosse",
      latitude: 47.2184,
      longitude: -1.5536,
      employeeCount: "51-200",
      descriptionShort: "Nettoyage industriel et tertiaire sur le Grand Ouest.",
      descriptionLong:
        "Atlantique Propreté est un acteur régional du nettoyage industriel et tertiaire basé à Nantes, avec des agences à Rennes et Angers.\n\nNous intervenons sur des sites industriels, agroalimentaires et logistiques, ainsi que sur des immeubles de bureaux. Certifiés MASE, nous travaillons régulièrement avec des sous-traitants locaux qualifiés pour absorber les pics d'activité.",
      email: "contact@atlantiqueproprete.fr",
      phone: "02 40 00 00 04",
      website: "atlantiqueproprete.fr",
      foundedAt: new Date("2008-05-01"),
      associationMember: false,
      services: [
        { id: "cs-7", serviceType: "Nettoyage industriel", isPrimary: true, description: "Sites industriels, agroalimentaires et logistiques." },
        { id: "cs-8", serviceType: "Propreté tertiaire", isPrimary: false, description: "Immeubles de bureaux et sièges sociaux." },
      ],
    },
  ];

  for (const c of companies) {
    const owner = getUser(c.ownerEmail);
    const { services, ownerEmail, ...companyData } = c;
    const data = {
      ...companyData,
      ownerUserId: owner.id,
      verificationStatus: "approved",
      wantsRecruitment: true,
      wantsSubcontracting: true,
    };
    await prisma.company.upsert({
      where: { id: c.id },
      update: data,
      create: data,
    });
    await prisma.entityMember.upsert({
      where: {
        userId_entityType_entityId: {
          userId: owner.id,
          entityType: "company",
          entityId: c.id,
        },
      },
      update: { role: "owner", status: "active", deletedAt: null },
      create: {
        userId: owner.id,
        entityType: "company",
        entityId: c.id,
        role: "owner",
        status: "active",
      },
    });
    for (const service of services) {
      const { id: serviceId, ...serviceData } = service;
      await prisma.companyService.upsert({
        where: { id: serviceId },
        update: { ...serviceData, companyId: c.id },
        create: { id: serviceId, ...serviceData, companyId: c.id },
      });
    }
  }

  // -------------------------------------------------------------------------
  // Offres d'emploi (descriptions complètes et réalistes)
  // -------------------------------------------------------------------------
  const jobs = [
    {
      id: "job-1",
      companyId: "company-1",
      createdByEmail: "societe@clubproprete.test",
      title: "Chef d'équipe propreté tertiaire",
      contractType: "CDI",
      city: "Nice",
      description:
        "Azur Propreté Services recrute un chef d'équipe pour encadrer 8 agents sur un portefeuille de sites tertiaires à Nice et Cagnes-sur-Mer.\n\nVos missions :\n- Organiser et contrôler les prestations quotidiennes (bureaux, parties communes)\n- Former les nouveaux agents aux protocoles et aux règles de sécurité\n- Assurer la relation de proximité avec les clients du portefeuille\n- Gérer les stocks de produits et le matériel\n\nProfil recherché :\n- Expérience de 3 ans minimum en propreté, dont 1 an en encadrement\n- Permis B indispensable (véhicule de service fourni)\n- Sens du service et rigueur\n\nConditions : CDI 35h, salaire selon profil (grille FEP + prime), mutuelle d'entreprise, téléphone professionnel.",
    },
    {
      id: "job-2",
      companyId: "company-2",
      createdByEmail: "societe2@clubproprete.test",
      title: "Agent d'entretien bureaux (H/F)",
      contractType: "CDI",
      city: "Lyon",
      description:
        "Lyon Net Services recherche un agent d'entretien pour des bureaux situés à Lyon Part-Dieu.\n\nVos missions :\n- Entretien courant des bureaux, salles de réunion et sanitaires\n- Vidage des corbeilles et tri des déchets\n- Réapprovisionnement des consommables\n\nHoraires : du lundi au vendredi, de 6h à 9h (15h/semaine, évolutif).\n\nProfil : une première expérience en propreté est un plus, mais les débutants motivés sont les bienvenus — formation assurée à la prise de poste. Poste accessible en transports en commun.",
    },
    {
      id: "job-3",
      companyId: "company-3",
      createdByEmail: "societe3@clubproprete.test",
      title: "Agent de remise en état après travaux",
      contractType: "CDD",
      city: "Paris",
      description:
        "Nettéclat renforce ses équipes de remise en état pour un chantier de 6 mois dans le 11e arrondissement de Paris.\n\nVos missions :\n- Nettoyage de fin de chantier : dépoussiérage, lessivage, vitrerie accessible\n- Évacuation des protections et déchets de chantier\n- Travail en binôme sous la responsabilité d'un chef d'équipe\n\nCDD 6 mois, 35h, du lundi au vendredi en journée. Panier repas + remboursement Navigo à 100%. Expérience en remise en état appréciée.",
    },
  ];

  for (const j of jobs) {
    const creator = getUser(j.createdByEmail);
    const { createdByEmail, ...jobData } = j;
    const data = {
      ...jobData,
      employerType: "company",
      employerEntityId: j.companyId,
      createdBy: creator.id,
      status: "published",
      publishedAt: new Date("2026-05-20"),
    };
    await prisma.job.upsert({
      where: { id: j.id },
      update: data,
      create: data,
    });
  }

  // -------------------------------------------------------------------------
  // Profil candidat (Laura Dupont)
  // -------------------------------------------------------------------------
  const candidateUser = getUser("candidat@clubproprete.test");
  const candidateData = {
    firstName: "Laura",
    lastName: "Dupont",
    email: "candidat@clubproprete.test",
    phone: "06 45 67 89 01",
    city: "Paris",
    postalCode: "75019",
    mobilityRadius: 20,
    hasVehicle: false,
    desiredContracts: "CDI,CDD",
    experienceYears: 3,
    bio: "Agent de propreté expérimentée en environnement tertiaire, je recherche un poste stable sur Paris avec une perspective d'évolution vers l'encadrement.",
  };
  await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: candidateData,
    create: { userId: candidateUser.id, ...candidateData },
  });

  // -------------------------------------------------------------------------
  // Profils indépendants (Karim Benali, Sophie Lemaire)
  // -------------------------------------------------------------------------
  const independents = [
    {
      email: "independant@clubproprete.test",
      displayName: "Karim Benali — KB Propreté",
      businessName: "KB Propreté",
      legalStatus: "Auto-entrepreneur",
      siret: "123 456 789 00013",
      city: "Marseille",
      postalCode: "13001",
      region: "Provence-Alpes-Côte d'Azur",
      mobilityRadius: 30,
      hasVehicle: true,
      hasInsurance: true,
      equipmentOwned: "Aspirateur professionnel, autolaveuse, perche vitrerie",
      experienceYears: 5,
      availabilityStatus: "immediate",
      hourlyRateRange: "25-35€",
      bio: "Professionnel de la propreté avec 5 ans d'expérience sur Marseille et ses alentours. Vitrerie, remise en état et entretien régulier. Véhiculé, équipé et assuré — disponible pour des missions de sous-traitance régulières ou ponctuelles.",
    },
    {
      email: "independant2@clubproprete.test",
      displayName: "Sophie Lemaire — SL Propreté Services",
      businessName: "SL Propreté Services",
      legalStatus: "Micro-entreprise",
      siret: "123 456 789 00014",
      city: "Lyon",
      postalCode: "69001",
      region: "Auvergne-Rhône-Alpes",
      mobilityRadius: 20,
      hasVehicle: false,
      hasInsurance: true,
      equipmentOwned: "Matériel d'entretien complet, produits éco-labellisés",
      experienceYears: 3,
      availabilityStatus: "two_weeks",
      hourlyRateRange: "22-28€",
      bio: "Spécialisée dans le nettoyage écologique de bureaux et espaces tertiaires à Lyon. J'utilise exclusivement des produits éco-labellisés. Disponible en semaine pour des prestations régulières.",
    },
  ];

  for (const ind of independents) {
    const user = getUser(ind.email);
    const { email, ...profileData } = ind;
    const data = {
      ...profileData,
      email,
      phone: seedUsers.find((u) => u.email === email)?.phone ?? null,
      verificationStatus: "approved",
      associationStatus: "approved",
    };
    await prisma.independentProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });
  }

  // -------------------------------------------------------------------------
  // Formations
  // -------------------------------------------------------------------------
  const trainingUser = getUser("formation@clubproprete.test");
  const trainings = [
    {
      id: "training-1",
      title: "Remise en état après chantier",
      category: "Technique terrain",
      description:
        "Formation pratique pour maîtriser les techniques de remise en état après travaux : protocoles, matériel, produits adaptés et organisation du chantier.",
      duration: "2 jours (14h)",
      format: "Présentiel",
      city: "Nice",
      priceInfoOptional: "Gratuit pour les membres association, 290€ HT pour les non-membres",
    },
    {
      id: "training-2",
      title: "Gestion des déchets et tri sélectif",
      category: "Environnement",
      description:
        "Apprenez à mettre en place une gestion efficace des déchets sur vos chantiers de nettoyage : obligations réglementaires, filières de tri et valorisation auprès de vos clients.",
      duration: "1 jour (7h)",
      format: "Présentiel",
      city: "Lyon",
      priceInfoOptional: "Gratuit pour les membres association, 150€ HT pour les non-membres",
    },
    {
      id: "training-3",
      title: "Habilitation électrique H0B0",
      category: "Sécurité",
      description:
        "Formation obligatoire pour tout personnel évoluant à proximité d'installations électriques : risques, distances de sécurité et conduite à tenir en cas d'incident.",
      duration: "1/2 journée (3h30)",
      format: "Présentiel",
      city: "Paris",
      priceInfoOptional: "Gratuit pour les membres association, 120€ HT pour les non-membres",
    },
  ];

  for (const t of trainings) {
    const data = {
      ...t,
      creatorUserId: trainingUser.id,
      creatorType: "Organisme",
      certificationName: "Attestation de compétence Club Propreté",
      contactEmail: "formation@clubproprete.test",
      status: "approved",
    };
    await prisma.training.upsert({
      where: { id: t.id },
      update: data,
      create: data,
    });
  }

  // -------------------------------------------------------------------------
  // Fournisseurs (slugs SEO, contacts cohérents)
  // -------------------------------------------------------------------------
  const supplierOwner = getUser("fournisseur@clubproprete.test");
  const suppliers = [
    {
      id: "supplier-1",
      name: "EcoMateriel Pro",
      slug: "ecomateriel-pro",
      category: "produits_ecologiques",
      family: "consommables",
      subCategory: "produits_ecologiques",
      offerType: null,
      description:
        "Gamme complète de produits éco-labellisés pour le nettoyage tertiaire et industriel. Basés à Paris.",
      deliveryAreas: "France entière",
      nationalCoverage: true,
    },
    {
      id: "supplier-2",
      name: "EPI Direct",
      slug: "epi-direct",
      category: "uniformes_vetements_pro",
      family: "materiel",
      subCategory: "uniformes_vetements_pro",
      offerType: null,
      description:
        "Distributeur d'EPI : gants, chaussures, vêtements, masques. Stocks importants. Basés à Lyon.",
      deliveryAreas: "France entière",
      nationalCoverage: true,
    },
    {
      id: "supplier-3",
      name: "MachinesNet Industries",
      slug: "machinesnet-industries",
      category: "autolaveuses",
      family: "machines",
      subCategory: "autolaveuses",
      offerType: "les_deux",
      description:
        "Vente, location et maintenance d'autolaveuses, monobrosses et aspirateurs professionnels. Basés à Lille.",
      deliveryAreas: "Hauts-de-France, Île-de-France, Normandie",
      nationalCoverage: false,
    },
    {
      id: "supplier-4",
      name: "TextilePro Services",
      slug: "textilepro-services",
      category: "linge_textile",
      family: "materiel",
      subCategory: "linge_textile",
      offerType: null,
      description:
        "Lavage, location et entretien du linge professionnel pour les sociétés de nettoyage. Basés à Nantes.",
      deliveryAreas: "Grand Ouest",
      nationalCoverage: false,
    },
    {
      id: "supplier-5",
      name: "AssurNet Conseil",
      slug: "assurnet-conseil",
      category: "logiciel_metier_proprete",
      family: "logiciels",
      subCategory: "logiciel_metier_proprete",
      offerType: null,
      description:
        "Courtage en assurance, conseil RH et juridique spécialisé propreté. Basés à Bordeaux.",
      deliveryAreas: "France entière",
      nationalCoverage: true,
    },
  ];

  for (const s of suppliers) {
    const supplier = await prisma.supplier.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        slug: s.slug,
        category: s.category,
        family: s.family,
        subCategory: s.subCategory,
        offerType: s.offerType,
        description: s.description,
        deliveryAreas: s.deliveryAreas,
        nationalCoverage: s.nationalCoverage,
        verificationStatus: "approved",
      },
      create: {
        ...s,
        ownerUserId: supplierOwner.id,
        legalName: s.name,
        contactName: "Nicolas Bernard",
        email: `contact@${s.slug.replace(/-/g, "")}.fr`,
        phone: "01 80 00 00 00",
        verificationStatus: "approved",
      },
    });
    await prisma.entityMember.upsert({
      where: {
        userId_entityType_entityId: {
          userId: supplierOwner.id,
          entityType: "supplier",
          entityId: supplier.id,
        },
      },
      update: { role: "owner", status: "active", deletedAt: null },
      create: {
        userId: supplierOwner.id,
        entityType: "supplier",
        entityId: supplier.id,
        role: "owner",
        status: "active",
      },
    });
  }

  // Services fournisseurs
  const supplierServicesData = [
    {
      id: "ss-1",
      supplierId: "supplier-1",
      title: "Produits d'entretien écologiques",
      category: "produits_ecologiques",
      offerType: null,
      description: "Gamme complète de produits éco-labellisés pour le nettoyage professionnel.",
    },
    {
      id: "ss-2",
      supplierId: "supplier-2",
      title: "Équipements de protection individuelle",
      category: "uniformes_vetements_pro",
      offerType: null,
      description: "Fourniture d'EPI : gants, chaussures de sécurité, vêtements professionnels.",
    },
    {
      id: "ss-3",
      supplierId: "supplier-3",
      title: "Location de machines de nettoyage",
      category: "autolaveuses",
      offerType: "location",
      description: "Location et maintenance d'autolaveuses, monobrosses et aspirateurs industriels.",
    },
    {
      id: "ss-4",
      supplierId: "supplier-4",
      title: "Linge professionnel",
      category: "linge_textile",
      offerType: null,
      description: "Lavage, location et entretien du linge professionnel pour sociétés de nettoyage.",
    },
    {
      id: "ss-5",
      supplierId: "supplier-5",
      title: "Assurance et conseil RH",
      category: "logiciel_metier_proprete",
      offerType: null,
      description: "Courtage en assurance, conseil juridique et RH spécialisé propreté.",
    },
  ];

  for (const serviceData of supplierServicesData) {
    await prisma.supplierService.upsert({
      where: { id: serviceData.id },
      update: { ...serviceData, isActive: true },
      create: { ...serviceData, isActive: true },
    });
  }

  // -------------------------------------------------------------------------
  // Missions de sous-traitance
  // -------------------------------------------------------------------------
  const companyOwner = getUser("societe@clubproprete.test");
  const missions = [
    {
      id: "mission-1",
      title: "Renfort vitrerie centre commercial",
      description:
        "Intervention urgente sur 3 jours pour nettoyage vitrerie en hauteur. Équipement fourni, accréditation hauteur requise.",
      serviceType: "Vitrerie",
      city: "Nice",
      postalCode: "06000",
      urgencyLevel: "Cette semaine",
      peopleNeeded: 2,
      status: "approved",
    },
    {
      id: "mission-2",
      title: "Équipe remise en état bureaux",
      description:
        "Remise en état post-travaux sur 800m² de bureaux. Matériel sur place, 2 jours estimés.",
      serviceType: "Remise en état",
      city: "Cannes",
      postalCode: "06400",
      urgencyLevel: "Sous 15 jours",
      peopleNeeded: 3,
      status: "approved",
    },
  ];

  for (const m of missions) {
    const data = {
      ...m,
      creatorUserId: companyOwner.id,
      creatorEntityId: "company-1",
    };
    await prisma.subcontractingMission.upsert({
      where: { id: m.id },
      update: data,
      create: data,
    });
  }

  // -------------------------------------------------------------------------
  // Articles (2 auteurs, contenus rédigés)
  // -------------------------------------------------------------------------
  const author1 = getUser("auteur@clubproprete.test");
  const author2 = getUser("auteur2@clubproprete.test");

  const articles = [
    {
      id: "article-1",
      authorId: author1.id,
      title: "Comment trouver un fournisseur de nettoyage fiable",
      slug: "trouver-fournisseur-nettoyage-fiable",
      excerpt:
        "Prix, délais, SAV, conformité : les 6 critères qui comptent vraiment pour choisir un fournisseur quand on dirige une société de nettoyage.",
      content:
        "Choisir un fournisseur ne se résume pas à comparer des prix au catalogue. Pour une société de nettoyage, un fournisseur défaillant signifie des chantiers retardés, des agents mal équipés et des clients mécontents.\n\n1. La fiabilité des délais\nDemandez les délais réels constatés, pas les délais annoncés. Un bon réflexe : commander un petit volume test avant de signer un contrat cadre.\n\n2. La disponibilité du SAV\nUne autolaveuse immobilisée, c'est un site qui n'est plus nettoyé correctement. Vérifiez les délais d'intervention et l'existence de matériel de prêt.\n\n3. La conformité des produits\nFiches de données de sécurité à jour, étiquetage CLP, écolabels vérifiables : exigez les documents avant la première commande.\n\n4. La logistique\nLivraison sur site ou en dépôt ? Franco de port à partir de quel montant ? Ces détails pèsent lourd sur une année complète.\n\n5. Les conditions de paiement\nUn fournisseur qui accepte le paiement à 30 jours fin de mois vous aide à préserver votre trésorerie.\n\n6. La proximité\nUn interlocuteur dédié qui connaît votre activité vaut mieux qu'une plateforme anonyme. C'est aussi l'esprit de l'annuaire fournisseurs du Club Propreté : des contacts identifiés et vérifiés.",
      category: "Fournisseurs",
      readTime: "4 min",
      publishedAt: new Date("2026-06-01"),
    },
    {
      id: "article-2",
      authorId: author2.id,
      title: "Les normes de sécurité en entreprise de propreté",
      slug: "normes-securite-entreprise-proprete",
      excerpt:
        "EPI obligatoires, document unique, habilitations : le point complet sur les obligations de sécurité d'une entreprise de nettoyage en 2026.",
      content:
        "La sécurité des agents de propreté n'est pas une option : c'est une obligation légale de l'employeur et un facteur clé de fidélisation des équipes.\n\nLes EPI obligatoires\nGants adaptés aux produits manipulés, chaussures antidérapantes, lunettes de protection pour les produits corrosifs : l'employeur fournit les EPI et s'assure de leur utilisation effective.\n\nLe document unique (DUERP)\nObligatoire dès le premier salarié, il recense les risques par poste : chutes de plain-pied, troubles musculo-squelettiques, risque chimique, travail isolé, horaires décalés. Il doit être mis à jour au moins une fois par an.\n\nLes habilitations\nCertaines interventions exigent une habilitation spécifique : H0B0 pour travailler à proximité d'installations électriques, CACES pour les nacelles, formation travail en hauteur pour la vitrerie.\n\nLe protocole de sécurité\nPour toute intervention sur un site client, un plan de prévention est requis dès 400 heures annuelles d'intervention ou en présence de travaux dangereux.\n\nPar où commencer ?\nSi votre DUERP date de plus d'un an, commencez par là. Puis vérifiez que chaque agent a reçu les EPI adaptés à ses sites, avec une fiche de remise signée.",
      category: "Sécurité",
      readTime: "5 min",
      publishedAt: new Date("2026-05-15"),
    },
    {
      id: "article-3",
      authorId: author1.id,
      title: "Comment choisir ses produits d'entretien écologiques",
      slug: "choisir-produits-entretien-ecologiques",
      excerpt:
        "Écolabels fiables, pièges du greenwashing, coût réel à la dilution : le guide pour passer au nettoyage écologique sans sacrifier l'efficacité.",
      content:
        "La demande de nettoyage écologique explose chez les donneurs d'ordre, notamment dans le tertiaire. Mais tous les produits « verts » ne se valent pas.\n\nLes labels qui font foi\nDeux références fiables : l'Écolabel Européen et Ecocert. Ils garantissent à la fois l'impact environnemental réduit et l'efficacité du produit. Méfiez-vous des logos « maison » créés par les fabricants eux-mêmes.\n\nLe piège du greenwashing\n« Formule naturelle », « respecte la planète » : ces mentions n'ont aucune valeur réglementaire. Vérifiez toujours la présence d'un label officiel et demandez la fiche technique.\n\nLe coût réel : raisonnez à la dilution\nUn produit concentré éco-labellisé à 8€ le litre peut revenir moins cher qu'un produit classique à 3€ : tout dépend du taux de dilution. Calculez le coût au litre de solution prête à l'emploi.\n\nFormer les équipes\nLe passage à l'écologique échoue souvent par manque de formation : dosage, temps de pose, conditions d'utilisation diffèrent des produits classiques. Prévoyez une session de prise en main avec votre fournisseur.\n\nLes fournisseurs spécialisés référencés sur Club Propreté peuvent vous accompagner dans cette transition.",
      category: "Fournisseurs",
      readTime: "4 min",
      publishedAt: new Date("2026-04-20"),
    },
    {
      id: "article-4",
      authorId: author2.id,
      title: "Recruter et fidéliser ses agents de propreté en 2026",
      slug: "recruter-fideliser-agents-proprete",
      excerpt:
        "Le secteur recrute massivement mais peine à fidéliser. Salaires, horaires, parcours d'intégration : ce qui fonctionne vraiment sur le terrain.",
      content:
        "Avec un turnover qui dépasse 30% dans de nombreuses entreprises, le recrutement est devenu le premier frein à la croissance des sociétés de nettoyage.\n\nSoigner l'annonce\nUne annonce précise (lieu exact, horaires, salaire affiché) reçoit deux fois plus de candidatures qualifiées qu'une annonce générique. Indiquez toujours si le site est accessible en transports en commun.\n\nRépondre vite\nDans un marché en tension, un candidat sans réponse sous 48h est déjà chez un concurrent. Mettez en place un circuit court : un appel téléphonique vaut mieux qu'un long processus.\n\nL'intégration, le moment critique\nLa majorité des départs ont lieu dans les trois premiers mois. Un binôme avec un agent expérimenté la première semaine et un point RH à 30 jours réduisent significativement les abandons de poste.\n\nLes leviers de fidélisation\n- Regrouper les sites pour limiter les déplacements\n- Proposer des compléments d'heures avant de recruter à l'extérieur\n- Former (et certifier) : une perspective d'évolution vers chef d'équipe retient les meilleurs profils\n\nPublier ses offres sur un job board spécialisé comme celui du Club Propreté permet de toucher des candidats déjà familiers du secteur.",
      category: "Recrutement",
      readTime: "5 min",
      publishedAt: new Date("2026-05-28"),
    },
  ];

  for (const a of articles) {
    const data = { ...a, status: "published" };
    await prisma.article.upsert({
      where: { id: a.id },
      update: data,
      create: data,
    });
  }

  // -------------------------------------------------------------------------
  // Adhésion association + candidature emploi
  // -------------------------------------------------------------------------
  const adminUser = getUser("admin@clubproprete.test");
  await prisma.associationMembership.upsert({
    where: { id: "membership-1" },
    update: {},
    create: {
      id: "membership-1",
      userId: companyOwner.id,
      profileType: "company_owner",
      entityType: "Company",
      entityId: "company-1",
      motivation: "Rejoindre le réseau Club Propreté pour développer notre activité",
      needs: "Visibilité, sous-traitance, recrutement",
      contribution: "Partager notre expertise en propreté tertiaire",
      status: "approved",
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-01-15"),
    },
  });

  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: candidateUser.id },
  });
  if (candidateProfile) {
    await prisma.jobApplication.upsert({
      where: { id: "application-1" },
      update: {},
      create: {
        id: "application-1",
        jobId: "job-1",
        applicantUserId: candidateUser.id,
        candidateProfileId: candidateProfile.id,
        message:
          "Je suis très intéressée par ce poste de chef d'équipe. J'ai 3 ans d'expérience dans la propreté tertiaire et je souhaite évoluer vers l'encadrement.",
        status: "submitted",
      },
    });
  }

  console.log("✅ Seed terminé.");
  console.log("");
  console.log("Comptes de test (mot de passe : demo) — détail dans docs/comptes-test.md :");
  for (const u of seedUsers) {
    console.log(`  - ${u.email.padEnd(36)} ${u.firstName} ${u.lastName} (${u.mainRole}, profil ${u.visibility})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
