import {
  BookOpen,
  Briefcase,
  Building2,
  Crown,
  Eye,
  GraduationCap,
  Handshake,
  Network,
  Package,
  PenLine,
  Search,
  Shield,
  Sparkles,
  Truck,
  UserCircle,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type Feature = { icon: LucideIcon; title: string; description: string; meta: string };
export type Audience = { icon: LucideIcon; title: string; description: string };
export type Level = { icon: LucideIcon; tag: string; title: string; description: string };
export type Step = { title: string; description: string };
export type Reason = { icon: LucideIcon; title: string; description: string };
export type Faq = { q: string; a: string };

export const features: Feature[] = [
  {
    icon: Building2,
    title: "Annuaire professionnel",
    description:
      "Référencez votre entreprise, votre activité ou votre organisation sur une fiche claire. Entreprises, indépendants, fournisseurs, organismes et experts gagnent en visibilité auprès du secteur.",
    meta: "L'objectif : permettre aux bons acteurs de se trouver plus facilement.",
  },
  {
    icon: BookOpen,
    title: "Média & ressources métier",
    description:
      "Articles, guides, modèles et conseils pratiques pour mieux comprendre les enjeux du secteur : recrutement, gestion, sous-traitance, réglementation, matériel, rentabilité, qualité de service.",
    meta: "Toutes les ressources utiles centralisées au même endroit.",
  },
  {
    icon: Briefcase,
    title: "Job board spécialisé",
    description:
      "Publiez ou consultez des offres dédiées aux métiers de la propreté : agents d'entretien, chefs d'équipe, responsables de secteur, inspecteurs, commerciaux, profils administratifs ou reconversions.",
    meta: "Connecter les recruteurs et les talents du secteur.",
  },
  {
    icon: GraduationCap,
    title: "Formations",
    description:
      "Techniques terrain, sécurité, management, habilitations, environnement, qualité, encadrement ou digitalisation. Les organismes de formation présentent leurs offres à une audience ciblée.",
    meta: "Monter en compétence et professionnaliser les équipes.",
  },
  {
    icon: Truck,
    title: "Annuaire fournisseurs",
    description:
      "Consommables, produits d'entretien, matériel, machines, location d'équipements, linge et textile, logiciels, outils RH ou services spécialisés : identifiez les bons partenaires plus rapidement.",
    meta: "Trouver des fournisseurs adaptés aux besoins du secteur.",
  },
  {
    icon: Wrench,
    title: "Outils gratuits",
    description:
      "Progressivement : modèles de documents, checklists, calculateurs, comparatifs, guides téléchargeables, ressources RH, modèles de devis et de contrats, supports opérationnels.",
    meta: "Des outils pratiques pensés pour le quotidien.",
  },
  {
    icon: Network,
    title: "Association & réseau privé",
    description:
      "Après inscription, candidatez pour rejoindre l'association Club Propreté : badge membre, événements, newsletter privée, réseau interne et espace de sous-traitance entre professionnels vérifiés.",
    meta: "Un niveau supplémentaire pour les membres engagés.",
  },
];

export const problemPoints = [
  "Les entreprises ont besoin de recruter plus facilement.",
  "Les indépendants cherchent des missions sérieuses.",
  "Les fournisseurs manquent de visibilité auprès des bons clients.",
  "Les formations sont difficiles à identifier.",
  "Les candidats ne savent pas toujours où trouver les bonnes opportunités.",
  "Le secteur fonctionne souvent au bouche-à-oreille, sans espace structuré.",
];

export const accountBenefits = [
  "créer votre profil professionnel",
  "référencer votre entreprise, activité ou organisme",
  "apparaître dans l'annuaire",
  "consulter les ressources métier",
  "découvrir des fournisseurs",
  "publier ou consulter des offres d'emploi",
  "explorer les formations disponibles",
  "recevoir les actualités du secteur",
  "accéder aux futurs outils gratuits",
  "candidater ensuite à l'association Club Propreté",
];

export const audiences: Audience[] = [
  {
    icon: Building2,
    title: "Entreprise de nettoyage",
    description:
      "Gagnez en visibilité, présentez vos services, développez votre réseau et trouvez plus facilement les bons partenaires. Référencez votre entreprise, publiez des offres, découvrez des fournisseurs et accédez au réseau privé en rejoignant l'association.",
  },
  {
    icon: UserCircle,
    title: "Indépendant ou sous-traitant",
    description:
      "Créez un profil professionnel : compétences, zones d'intervention et spécialités. Renforcez votre crédibilité, faites-vous identifier par d'autres professionnels et accédez à un réseau plus structuré.",
  },
  {
    icon: Package,
    title: "Fournisseur",
    description:
      "Présentez vos produits, services ou solutions à une audience spécialisée : produits d'entretien, consommables, machines, équipements, textile, logiciels ou services aux entreprises.",
  },
  {
    icon: GraduationCap,
    title: "Organisme de formation",
    description:
      "Référencez vos formations et mettez-les en avant auprès des entreprises, salariés, indépendants et candidats du secteur. Facilitez la découverte des formations utiles pour monter en compétence.",
  },
  {
    icon: Search,
    title: "Candidat",
    description:
      "Trouvez des offres d'emploi spécialisées dans les métiers de la propreté. Consultez des opportunités adaptées au secteur et comprenez mieux les compétences recherchées par les entreprises.",
  },
  {
    icon: PenLine,
    title: "Expert ou contributeur",
    description:
      "Partagez votre expertise avec les professionnels de la propreté. Club Propreté accueille des contenus, guides, analyses ou ressources utiles pour aider le secteur à mieux se structurer.",
  },
];

export const associationPerks = [
  "un badge membre visible sur votre profil",
  "un espace privé réservé aux membres",
  "une newsletter dédiée",
  "des invitations à des événements",
  "des rencontres professionnelles",
  "des opportunités réservées",
  "un réseau interne de membres",
  "un système de sous-traitance entre professionnels de confiance",
];

export const subcontractingPerks = [
  "publier des besoins de renfort",
  "proposer vos disponibilités",
  "trouver des partenaires par zone géographique",
  "échanger avec d'autres membres identifiés",
  "développer votre réseau professionnel",
  "créer des relations de sous-traitance durables",
  "accéder à des opportunités non publiées publiquement",
];

export const levels: Level[] = [
  {
    icon: Eye,
    tag: "Niveau 1",
    title: "Visiteur",
    description:
      "Découvrez la plateforme, consultez certains contenus publics et comprenez l'écosystème de la propreté.",
  },
  {
    icon: UserPlus,
    tag: "Niveau 2",
    title: "Utilisateur inscrit",
    description:
      "Créez votre compte, complétez votre profil, référencez votre activité, consultez les ressources et utilisez les outils ouverts.",
  },
  {
    icon: Crown,
    tag: "Niveau 3",
    title: "Membre de l'association",
    description:
      "Accédez au niveau supplémentaire : badge, événements, newsletter privée, réseau interne et sous-traitance entre membres.",
  },
];

export const steps: Step[] = [
  {
    title: "Créez votre compte gratuitement",
    description:
      "Inscrivez-vous en quelques minutes et choisissez le profil qui correspond à votre activité : entreprise, indépendant, fournisseur, organisme, candidat, recruteur ou contributeur.",
  },
  {
    title: "Complétez votre fiche",
    description:
      "Activité, zone d'intervention, services, spécialités, contact, site web, description, logo. Plus votre fiche est claire, plus elle est utile pour les autres professionnels.",
  },
  {
    title: "Utilisez les outils ouverts",
    description:
      "Consultez les ressources, explorez l'annuaire, découvrez les fournisseurs, publiez ou consultez des offres, regardez les formations et suivez les actualités.",
  },
  {
    title: "Candidatez à l'association",
    description:
      "Pour accéder au réseau privé, aux événements, à la newsletter membre et à l'espace de sous-traitance, déposez une candidature pour rejoindre l'association.",
  },
  {
    title: "Développez votre réseau",
    description:
      "Une fois membre, accédez à un cercle plus engagé de professionnels du secteur, avec des opportunités et des échanges réservés aux membres.",
  },
];

export const reasons: Reason[] = [
  {
    icon: Eye,
    title: "Gagner en visibilité",
    description:
      "Votre activité mérite d'être visible dans un espace spécialisé, consulté par des professionnels du secteur.",
  },
  {
    icon: Handshake,
    title: "Trouver les bons partenaires",
    description:
      "Le secteur fonctionne beaucoup par réseau. Club Propreté le rend plus accessible, plus structuré et plus lisible.",
  },
  {
    icon: Briefcase,
    title: "Recruter plus facilement",
    description:
      "Le job board spécialisé connecte les entreprises et les candidats autour des métiers de la propreté.",
  },
  {
    icon: BookOpen,
    title: "Accéder aux bonnes ressources",
    description:
      "Guides, modèles, articles, formations, fournisseurs et outils pratiques centralisés pour aider à progresser.",
  },
  {
    icon: Shield,
    title: "Rejoindre un cercle de confiance",
    description:
      "L'association donne accès à un réseau interne, des événements et un espace de sous-traitance réservé.",
  },
  {
    icon: Sparkles,
    title: "Structurer le secteur",
    description:
      "Valoriser les métiers de la propreté, faciliter les échanges et créer une plateforme utile à toute la filière.",
  },
];

export const fieldRealities = [
  "des dirigeants qui manquent de temps",
  "des équipes à recruter rapidement",
  "des sites à couvrir",
  "des fournisseurs à comparer",
  "des sous-traitants à identifier",
  "des formations à trouver",
  "des documents à préparer",
  "des relations de confiance à construire",
];

export const resourceTags = [
  "guides pratiques",
  "articles métier",
  "modèles gratuits",
  "comparatifs",
  "conseils recrutement",
  "fiches fournisseurs",
  "ressources pour dirigeants",
  "réglementation",
  "organisation terrain",
  "digitalisation du secteur",
];

export const faq: Faq[] = [
  {
    q: "Club Propreté est-il gratuit ?",
    a: "Oui. L'inscription est gratuite : elle permet de créer un compte, de rejoindre la plateforme et d'accéder aux fonctionnalités ouvertes. Certaines fonctionnalités privées sont réservées aux membres de l'association.",
  },
  {
    q: "Qui peut créer un compte ?",
    a: "Club Propreté s'adresse aux professionnels de la propreté et aux acteurs liés au secteur : entreprises de nettoyage, indépendants, fournisseurs, organismes de formation, candidats, recruteurs, experts et contributeurs.",
  },
  {
    q: "Quelle différence entre inscription et adhésion à l'association ?",
    a: "L'inscription permet de rejoindre gratuitement la plateforme et d'utiliser les outils ouverts. L'adhésion à l'association est une étape supplémentaire, sur candidature, qui donne accès aux fonctionnalités privées : badge, événements, newsletter réservée, réseau interne et sous-traitance entre membres.",
  },
  {
    q: "La sous-traitance est-elle ouverte à tous ?",
    a: "Non. L'espace de sous-traitance est réservé aux membres de l'association afin de préserver un cadre plus qualifié, plus sérieux et plus confidentiel.",
  },
  {
    q: "Puis-je référencer mon entreprise ?",
    a: "Oui. Les entreprises de nettoyage peuvent créer ou compléter leur fiche professionnelle pour présenter leur activité, leurs services et leur zone d'intervention.",
  },
  {
    q: "Les fournisseurs peuvent-ils s'inscrire ?",
    a: "Oui. Les fournisseurs de produits, matériels, machines, logiciels, services ou solutions spécialisées peuvent créer une fiche pour être visibles auprès des professionnels du secteur.",
  },
  {
    q: "Puis-je publier une offre d'emploi ?",
    a: "Oui. Le job board permet aux entreprises et recruteurs de publier des offres dédiées aux métiers de la propreté.",
  },
  {
    q: "Puis-je proposer une formation ?",
    a: "Oui. Les organismes de formation peuvent présenter leurs formations pour être découverts par les entreprises, salariés, indépendants et candidats du secteur.",
  },
  {
    q: "Comment devenir membre de l'association ?",
    a: "Après avoir créé votre compte, vous pouvez déposer une candidature pour rejoindre l'association. Votre demande, si elle est acceptée, donne accès au cercle membre et aux fonctionnalités privées.",
  },
  {
    q: "Club Propreté est-il réservé aux grandes entreprises ?",
    a: "Non. Club Propreté s'adresse aussi bien aux petites structures, indépendants, sous-traitants, PME, fournisseurs, organismes et candidats qu'aux entreprises plus établies.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Club Propreté respecte les règles applicables en matière de protection des données personnelles. Les informations de votre profil et les données liées à votre compte sont traitées dans le cadre de l'utilisation de la plateforme.",
  },
];
