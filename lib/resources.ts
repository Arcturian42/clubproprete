// Architecture de données centralisée de la section Ressources.
// Toutes les rubriques, ressources et liens du méga menu sont définis ici :
// les pages catégories, pages détail et le méga menu sont générés depuis
// cette source unique (aucun lien mort possible).

import {
  BookOpen,
  Calculator,
  FileText,
  Gavel,
  Landmark,
  Newspaper,
  Scale,
  type LucideIcon,
} from "lucide-react";

export type ResourceCategorySlug =
  | "guides"
  | "modeles"
  | "outils"
  | "media"
  | "comparatifs"
  | "reglementation"
  | "appels-offres";

export type ResourceType =
  | "Guide"
  | "Modèle"
  | "Outil"
  | "Rubrique média"
  | "Comparatif"
  | "Fiche réglementaire"
  | "Dossier";

export type AccessLevel = "free" | "account_required" | "premium_future";
export type ContentStatus = "published" | "placeholder_enriched" | "coming_soon";

export type Resource = {
  id: string;
  slug: string;
  category: ResourceCategorySlug;
  title: string;
  description: string;
  type: ResourceType;
  audience: string[];
  tags: string[];
  accessLevel: AccessLevel;
  isFeatured: boolean;
  isPopular: boolean;
  estimatedTime: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  contentStatus: ContentStatus;
  ctaLabel: string;
  relatedResources: string[];
  keyPoints?: string[];
};

export type ResourceCategory = {
  slug: ResourceCategorySlug;
  title: string;
  h1: string;
  menuDescription: string;
  description: string;
  icon: LucideIcon;
  // Ids des ressources mises en avant dans le méga menu (4 à 6).
  menuResourceIds: string[];
};

export const resourceCategories: ResourceCategory[] = [
  {
    slug: "guides",
    title: "Guides métier",
    h1: "Guides métier pour les professionnels de la propreté",
    menuDescription: "Guides pratiques pour créer, gérer et développer une activité dans la propreté.",
    description:
      "Des guides pratiques et structurés pour créer, gérer, développer et professionnaliser votre activité de nettoyage : business, commercial, recrutement, prestations et spécialités.",
    icon: BookOpen,
    menuResourceIds: [
      "creer-entreprise-nettoyage",
      "trouver-clients-nettoyage-b2b",
      "repondre-appel-offres-nettoyage",
      "fixer-prix-nettoyage",
      "recruter-agents-entretien",
      "developper-entreprise-nettoyage",
    ],
  },
  {
    slug: "modeles",
    title: "Modèles & templates",
    h1: "Modèles et templates pour entreprises de nettoyage",
    menuDescription: "Documents prêts à adapter pour gagner du temps et professionnaliser vos démarches.",
    description:
      "Des documents prêts à utiliser ou à adapter : devis, contrats, cahiers des charges, fiches de poste, rapports d'intervention et supports commerciaux pour gagner du temps au quotidien.",
    icon: FileText,
    menuResourceIds: [
      "devis-nettoyage",
      "contrat-prestation-nettoyage",
      "contrat-sous-traitance-nettoyage",
      "cahier-des-charges-nettoyage",
      "fiche-poste-agent-entretien",
      "rapport-intervention-nettoyage",
    ],
  },
  {
    slug: "outils",
    title: "Outils & calculateurs",
    h1: "Outils et calculateurs pour piloter votre activité",
    menuDescription: "Calculateurs, simulateurs et générateurs pour piloter votre activité.",
    description:
      "Des calculateurs, simulateurs et générateurs pensés pour le terrain : chiffrer un devis, calculer une marge, estimer un coût horaire et piloter la rentabilité de vos contrats.",
    icon: Calculator,
    menuResourceIds: [
      "calculateur-prix-nettoyage",
      "calculateur-marge-chantier",
      "calculateur-cout-horaire-agent",
      "simulateur-devis-nettoyage-bureaux",
      "generateur-cahier-des-charges",
      "score-visibilite-entreprise-nettoyage",
    ],
  },
  {
    slug: "media",
    title: "Actualités & média",
    h1: "Actualités et média de la propreté",
    menuDescription: "Actualités, tendances, interviews et analyses du secteur de la propreté.",
    description:
      "Le média métier de Club Propreté : actualités du secteur, tendances, innovations matériel, interviews d'entrepreneurs, portraits d'entreprises et analyses de marché.",
    icon: Newspaper,
    menuResourceIds: [
      "actualites-secteur-proprete",
      "tendances-nettoyage-professionnel",
      "innovations-materiel-machines",
      "produits-ecologiques-nettoyage",
      "emploi-recrutement-proprete",
      "interviews-entrepreneurs-proprete",
    ],
  },
  {
    slug: "comparatifs",
    title: "Comparatifs",
    h1: "Comparatifs matériel, logiciels et fournisseurs",
    menuDescription: "Comparatifs pour choisir vos machines, logiciels, produits et fournisseurs.",
    description:
      "Des comparatifs orientés décision pour bien choisir vos machines, logiciels, produits et fournisseurs : critères de choix, tableaux comparatifs et recommandations par cas d'usage.",
    icon: Scale,
    menuResourceIds: [
      "autolaveuses",
      "monobrosses",
      "logiciels-entreprises-nettoyage",
      "aspirateurs-professionnels",
      "produits-nettoyage-ecologiques",
      "louer-ou-acheter-autolaveuse",
    ],
  },
  {
    slug: "reglementation",
    title: "Bibliothèque réglementaire",
    h1: "Bibliothèque réglementaire de la propreté",
    menuDescription: "Comprendre les obligations essentielles du secteur de la propreté.",
    description:
      "Une base informative pour comprendre les obligations essentielles du secteur : sécurité au travail, EPI, produits chimiques, plan de prévention, sous-traitance et documents obligatoires.",
    icon: Gavel,
    menuResourceIds: [
      "securite-travail-proprete",
      "epi-obligatoires-nettoyage",
      "produits-chimiques-fds",
      "plan-prevention-nettoyage",
      "sous-traitance-obligations-legales",
      "documents-obligatoires-entreprise-nettoyage",
    ],
  },
  {
    slug: "appels-offres",
    title: "Appels d'offres & marchés",
    h1: "Appels d'offres et marchés de nettoyage",
    menuDescription: "Ressources pour trouver, comprendre et répondre aux marchés de nettoyage.",
    description:
      "Tout pour comprendre, préparer et gagner des marchés de nettoyage privés ou publics : dossiers de candidature, mémoires techniques, analyse des cahiers des charges et erreurs à éviter.",
    icon: Landmark,
    menuResourceIds: [
      "comprendre-appels-offres-nettoyage",
      "preparer-dossier-appel-offres",
      "rediger-memoire-technique-nettoyage",
      "analyser-cahier-des-charges-nettoyage",
      "erreurs-appels-offres-nettoyage",
      "modele-memoire-technique",
    ],
  },
];

// Mention affichée sur toutes les pages de la bibliothèque réglementaire.
export const regulatoryDisclaimer =
  "Cette ressource est fournie à titre informatif et ne remplace pas un conseil juridique, social ou réglementaire personnalisé.";

type ResourceInput = {
  // Identifiant global unique ; par défaut le slug (utile quand un même slug
  // existe dans deux catégories différentes).
  id?: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  audience?: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  estimatedTime?: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedResources?: string[];
  keyPoints?: string[];
  accessLevel?: AccessLevel;
  ctaLabel?: string;
};

const categoryDefaults: Record<
  ResourceCategorySlug,
  { type: ResourceType; estimatedTime: string; accessLevel: AccessLevel; ctaLabel: string; audience: string[] }
> = {
  guides: { type: "Guide", estimatedTime: "10 min", accessLevel: "free", ctaLabel: "Lire le guide", audience: ["Entreprise de nettoyage", "Indépendant"] },
  modeles: { type: "Modèle", estimatedTime: "5 min", accessLevel: "account_required", ctaLabel: "Télécharger le modèle", audience: ["Entreprise de nettoyage", "Indépendant"] },
  outils: { type: "Outil", estimatedTime: "3 min", accessLevel: "account_required", ctaLabel: "Utiliser l'outil", audience: ["Entreprise de nettoyage", "Indépendant"] },
  media: { type: "Rubrique média", estimatedTime: "5 min", accessLevel: "free", ctaLabel: "Découvrir la rubrique", audience: ["Tous les professionnels"] },
  comparatifs: { type: "Comparatif", estimatedTime: "8 min", accessLevel: "free", ctaLabel: "Voir le comparatif", audience: ["Entreprise de nettoyage", "Donneur d'ordre"] },
  reglementation: { type: "Fiche réglementaire", estimatedTime: "7 min", accessLevel: "free", ctaLabel: "Consulter la fiche", audience: ["Entreprise de nettoyage"] },
  "appels-offres": { type: "Dossier", estimatedTime: "10 min", accessLevel: "free", ctaLabel: "Lire le dossier", audience: ["Entreprise de nettoyage"] },
};

function defineResources(category: ResourceCategorySlug, items: ResourceInput[]): Resource[] {
  const defaults = categoryDefaults[category];
  return items.map((item) => ({
    id: item.id ?? item.slug,
    slug: item.slug,
    category,
    title: item.title,
    description: item.description,
    type: defaults.type,
    audience: item.audience ?? defaults.audience,
    tags: item.tags,
    accessLevel: item.accessLevel ?? defaults.accessLevel,
    isFeatured: item.isFeatured ?? false,
    isPopular: item.isPopular ?? false,
    estimatedTime: item.estimatedTime ?? defaults.estimatedTime,
    updatedAt: "2026-06-11",
    seoTitle: item.seoTitle ?? `${item.title} | Ressources Club Propreté`,
    seoDescription: item.seoDescription ?? item.description,
    contentStatus: "placeholder_enriched",
    ctaLabel: item.ctaLabel ?? defaults.ctaLabel,
    relatedResources: item.relatedResources ?? [],
    keyPoints: item.keyPoints,
  }));
}

export const resources: Resource[] = [
  // ── Guides métier ────────────────────────────────────────────────────────
  ...defineResources("guides", [
    {
      slug: "creer-entreprise-nettoyage",
      title: "Créer une entreprise de nettoyage",
      description:
        "Statut juridique, budget de départ, assurances, premiers clients : toutes les étapes pour lancer une entreprise de nettoyage solide en France.",
      tags: ["création", "statut juridique", "business plan"],
      isFeatured: true,
      isPopular: true,
      estimatedTime: "15 min",
      seoTitle: "Créer une entreprise de nettoyage : le guide complet 2026",
      seoDescription:
        "Statut, budget, assurances, premiers clients : le guide étape par étape pour créer votre entreprise de nettoyage en France.",
      relatedResources: ["trouver-clients-nettoyage-b2b", "devis-nettoyage", "calculateur-prix-nettoyage"],
      keyPoints: [
        "Choisir le bon statut juridique selon votre situation (micro-entreprise, EURL, SASU…)",
        "Estimer le budget de départ : matériel, assurances, véhicule et trésorerie",
        "Obtenir les assurances indispensables : RC professionnelle et garanties adaptées",
        "Décrocher vos premiers contrats B2B sans budget commercial",
      ],
    },
    {
      slug: "trouver-clients-nettoyage-b2b",
      title: "Trouver des clients B2B",
      description:
        "Prospection, réseau, visibilité locale, annuaires et recommandation : les leviers concrets pour signer des contrats d'entretien réguliers.",
      tags: ["prospection", "commercial", "B2B"],
      isFeatured: true,
      isPopular: true,
      relatedResources: ["fixer-prix-nettoyage", "email-prospection-nettoyage", "creer-entreprise-nettoyage"],
      keyPoints: [
        "Cibler les bons segments : bureaux, copropriétés, commerces, cabinets médicaux",
        "Construire une offre claire et différenciante avant de prospecter",
        "Activer les canaux qui fonctionnent dans la propreté : réseau, annuaire, recommandation",
        "Transformer un devis en contrat d'entretien récurrent",
      ],
    },
    {
      slug: "repondre-appel-offres-nettoyage",
      title: "Répondre à un appel d'offres",
      description:
        "Comprendre le dossier de consultation, structurer sa réponse et valoriser son mémoire technique pour maximiser ses chances de gagner.",
      tags: ["appel d'offres", "marchés", "mémoire technique"],
      isPopular: true,
      relatedResources: ["rediger-memoire-technique-nettoyage", "comprendre-appels-offres-nettoyage"],
    },
    {
      slug: "fixer-prix-nettoyage",
      title: "Fixer ses prix de nettoyage",
      description:
        "Méthodes de chiffrage au m², au forfait ou à l'heure : calculer un prix rentable qui reste compétitif sur votre marché local.",
      tags: ["tarification", "rentabilité", "devis"],
      isPopular: true,
      relatedResources: ["calculateur-prix-nettoyage", "grille-tarifaire-nettoyage"],
    },
    {
      slug: "recruter-agents-entretien",
      title: "Recruter des agents d'entretien",
      description:
        "Sourcing, fiches de poste, entretiens et fidélisation : les bonnes pratiques pour recruter et garder des agents fiables dans un marché tendu.",
      tags: ["recrutement", "RH", "agents"],
      relatedResources: ["fiche-poste-agent-entretien", "calculateur-cout-horaire-agent"],
    },
    {
      slug: "developper-entreprise-nettoyage",
      title: "Développer son entreprise de nettoyage",
      description:
        "Structurer ses équipes, diversifier ses prestations et passer les paliers de croissance sans dégrader la qualité de service.",
      tags: ["croissance", "organisation", "stratégie"],
      relatedResources: ["calculateur-marge-chantier", "trouver-clients-nettoyage-b2b"],
    },
    {
      slug: "nettoyage-bureaux",
      title: "Le nettoyage de bureaux",
      description:
        "Cadences, fréquences, protocoles et points de contrôle : tout ce qu'il faut maîtriser pour des prestations tertiaires irréprochables.",
      tags: ["tertiaire", "bureaux", "protocoles"],
      relatedResources: ["simulateur-devis-nettoyage-bureaux", "materiel-nettoyage-bureaux"],
    },
    {
      slug: "nettoyage-copropriete",
      title: "Le nettoyage de copropriété",
      description:
        "Parties communes, sortie des containers, relation syndic : les spécificités du marché de la copropriété et comment s'y positionner.",
      tags: ["copropriété", "syndic", "parties communes"],
      relatedResources: ["devis-nettoyage", "fixer-prix-nettoyage"],
    },
    {
      slug: "nettoyage-fin-de-chantier",
      title: "Le nettoyage de fin de chantier",
      description:
        "Chiffrage, organisation et points de vigilance d'une prestation exigeante mais rentable, de la visite technique à la livraison.",
      tags: ["fin de chantier", "BTP", "remise en état"],
      relatedResources: ["simulateur-devis-fin-chantier", "calculateur-marge-chantier"],
    },
    {
      slug: "nettoyage-industriel",
      title: "Le nettoyage industriel",
      description:
        "Environnements sensibles, habilitations, matériel spécifique : comprendre les exigences du nettoyage en milieu industriel.",
      tags: ["industriel", "habilitations", "sécurité"],
      relatedResources: ["securite-travail-proprete", "epi-obligatoires-nettoyage"],
    },
    {
      slug: "nettoyage-ecologique",
      title: "Le nettoyage écologique",
      description:
        "Produits éco-labellisés, méthodes raisonnées et arguments commerciaux : faire du nettoyage durable un avantage concurrentiel.",
      tags: ["écologie", "éco-label", "RSE"],
      relatedResources: ["produits-nettoyage-ecologiques", "produits-ecologiques-nettoyage"],
    },
    {
      slug: "sous-traitance-nettoyage",
      title: "La sous-traitance dans le nettoyage",
      description:
        "Trouver des donneurs d'ordre ou des sous-traitants fiables, contractualiser proprement et sécuriser la relation dans la durée.",
      tags: ["sous-traitance", "partenariats", "contrats"],
      relatedResources: ["contrat-sous-traitance-nettoyage", "sous-traitance-obligations-legales"],
    },
  ]),

  // ── Modèles & templates ──────────────────────────────────────────────────
  ...defineResources("modeles", [
    {
      slug: "devis-nettoyage",
      title: "Modèle de devis nettoyage",
      description:
        "Un modèle de devis clair et professionnel pour présenter vos prestations de nettoyage, vos fréquences et vos conditions.",
      tags: ["devis", "vente", "administratif"],
      isFeatured: true,
      isPopular: true,
      seoTitle: "Modèle de devis nettoyage professionnel à télécharger",
      seoDescription:
        "Téléchargez un modèle de devis nettoyage pour présenter vos prestations de manière claire et professionnelle.",
      relatedResources: ["calculateur-prix-nettoyage", "contrat-prestation-nettoyage"],
      keyPoints: [
        "Une structure de devis lisible : prestations, fréquences, surfaces et conditions",
        "Les mentions indispensables pour être conforme et crédible",
        "Des formulations prêtes à adapter à votre activité",
      ],
    },
    {
      slug: "contrat-prestation-nettoyage",
      title: "Modèle de contrat de prestation",
      description:
        "Une trame de contrat de prestation de nettoyage couvrant le périmètre, les fréquences, la durée, la révision des prix et la résiliation.",
      tags: ["contrat", "juridique", "prestation"],
      isPopular: true,
      relatedResources: ["devis-nettoyage", "cahier-des-charges-nettoyage"],
    },
    {
      slug: "contrat-sous-traitance-nettoyage",
      title: "Modèle de contrat de sous-traitance",
      description:
        "Encadrez vos relations de sous-traitance : obligations réciproques, vigilance, assurances et conditions de paiement.",
      tags: ["sous-traitance", "contrat", "juridique"],
      isPopular: true,
      relatedResources: ["sous-traitance-obligations-legales", "documents-demander-sous-traitant"],
    },
    {
      slug: "cahier-des-charges-nettoyage",
      title: "Modèle de cahier des charges",
      description:
        "Un cahier des charges de nettoyage structuré : zones, prestations, fréquences, niveau d'exigence et modalités de contrôle.",
      tags: ["cahier des charges", "qualité", "donneur d'ordre"],
      isPopular: true,
      audience: ["Donneur d'ordre", "Entreprise de nettoyage"],
      relatedResources: ["generateur-cahier-des-charges", "analyser-cahier-des-charges-nettoyage"],
    },
    {
      slug: "fiche-poste-agent-entretien",
      title: "Modèle de fiche de poste",
      description:
        "Une fiche de poste d'agent d'entretien complète : missions, compétences, consignes de sécurité et critères d'évaluation.",
      tags: ["RH", "recrutement", "fiche de poste"],
      relatedResources: ["recruter-agents-entretien", "generateur-fiche-poste"],
    },
    {
      slug: "planning-agents-nettoyage",
      title: "Modèle de planning agents",
      description:
        "Un planning hebdomadaire prêt à adapter pour organiser les tournées, les sites et les remplacements de vos équipes.",
      tags: ["planning", "organisation", "équipes"],
      relatedResources: ["fiche-poste-agent-entretien", "rapport-intervention-nettoyage"],
    },
    {
      slug: "rapport-intervention-nettoyage",
      title: "Modèle de rapport d'intervention",
      description:
        "Tracez vos prestations avec un rapport d'intervention simple : tâches réalisées, anomalies constatées et validation client.",
      tags: ["qualité", "traçabilité", "intervention"],
      relatedResources: ["fiche-controle-qualite", "contrat-prestation-nettoyage"],
    },
    {
      slug: "fiche-controle-qualite",
      title: "Modèle de fiche de contrôle qualité",
      description:
        "Une grille de contrôle qualité par zone et par prestation pour objectiver vos passages et rassurer vos clients.",
      tags: ["qualité", "contrôle", "audit"],
      relatedResources: ["rapport-intervention-nettoyage", "cahier-des-charges-nettoyage"],
    },
    {
      slug: "relance-client-nettoyage",
      title: "Modèle de relance client",
      description:
        "Des trames d'emails de relance polies et efficaces : devis sans réponse, impayés et réactivation d'anciens clients.",
      tags: ["relance", "commercial", "email"],
      relatedResources: ["email-prospection-nettoyage", "devis-nettoyage"],
    },
    {
      slug: "email-prospection-nettoyage",
      title: "Modèle d'email de prospection",
      description:
        "Des emails de prospection B2B courts et personnalisables pour décrocher des rendez-vous avec les bons interlocuteurs.",
      tags: ["prospection", "email", "commercial"],
      relatedResources: ["trouver-clients-nettoyage-b2b", "generateur-email-prospection"],
    },
    {
      slug: "grille-tarifaire-nettoyage",
      title: "Modèle de grille tarifaire",
      description:
        "Une grille tarifaire structurée par prestation et par fréquence pour cadrer vos prix et accélérer vos chiffrages.",
      tags: ["tarification", "prix", "vente"],
      relatedResources: ["fixer-prix-nettoyage", "calculateur-prix-nettoyage"],
    },
    {
      slug: "memoire-technique-nettoyage",
      title: "Modèle de mémoire technique",
      description:
        "Une trame de mémoire technique pour appels d'offres : moyens humains, matériels, méthodologie, qualité et RSE.",
      tags: ["mémoire technique", "appel d'offres", "marchés"],
      relatedResources: ["rediger-memoire-technique-nettoyage", "modele-memoire-technique"],
    },
  ]),

  // ── Outils & calculateurs ────────────────────────────────────────────────
  ...defineResources("outils", [
    {
      slug: "calculateur-prix-nettoyage",
      title: "Calculateur de prix nettoyage",
      description:
        "Estimez un prix de prestation cohérent à partir de la surface, de la fréquence, des cadences et de votre coût horaire.",
      tags: ["prix", "chiffrage", "devis"],
      isFeatured: true,
      isPopular: true,
      seoTitle: "Calculateur de prix nettoyage : estimez vos prestations",
      seoDescription:
        "Calculez un prix de prestation de nettoyage rentable à partir de la surface, de la fréquence et de vos coûts réels.",
      relatedResources: ["fixer-prix-nettoyage", "devis-nettoyage"],
      keyPoints: [
        "Un chiffrage basé sur les cadences réelles du métier",
        "La prise en compte de vos coûts : main-d'œuvre, produits, déplacements",
        "Un prix de vente conseillé avec marge paramétrable",
      ],
    },
    {
      slug: "calculateur-marge-chantier",
      title: "Calculateur de marge chantier",
      description:
        "Vérifiez la rentabilité réelle de chaque chantier : coûts directs, frais de structure et marge nette dégagée.",
      tags: ["marge", "rentabilité", "pilotage"],
      isPopular: true,
      relatedResources: ["calculateur-prix-nettoyage", "calculateur-rentabilite-contrat"],
    },
    {
      slug: "calculateur-cout-horaire-agent",
      title: "Calculateur de coût horaire agent",
      description:
        "Calculez le coût horaire complet d'un agent : salaire, charges, équipements, encadrement et temps non productifs.",
      tags: ["coût horaire", "RH", "charges"],
      relatedResources: ["recruter-agents-entretien", "calculateur-marge-chantier"],
    },
    {
      slug: "calculateur-temps-intervention",
      title: "Calculateur de temps d'intervention",
      description:
        "Estimez le temps nécessaire par type de local et de prestation grâce aux cadences de référence du secteur.",
      tags: ["cadences", "temps", "organisation"],
      relatedResources: ["calculateur-prix-nettoyage", "nettoyage-bureaux"],
    },
    {
      slug: "simulateur-devis-nettoyage-bureaux",
      title: "Simulateur de devis bureaux",
      description:
        "Simulez un devis de nettoyage de bureaux complet en quelques champs : surfaces, fréquences et prestations annexes.",
      tags: ["devis", "bureaux", "simulation"],
      relatedResources: ["nettoyage-bureaux", "devis-nettoyage"],
    },
    {
      slug: "simulateur-devis-fin-chantier",
      title: "Simulateur de devis fin de chantier",
      description:
        "Chiffrez une remise en état après travaux : surfaces, niveau de salissure, vitrerie et évacuation des déchets.",
      tags: ["fin de chantier", "devis", "simulation"],
      relatedResources: ["nettoyage-fin-de-chantier", "calculateur-marge-chantier"],
    },
    {
      slug: "generateur-cahier-des-charges",
      title: "Générateur de cahier des charges",
      description:
        "Générez un cahier des charges de nettoyage personnalisé à partir de vos locaux, zones et niveaux d'exigence.",
      tags: ["cahier des charges", "générateur", "donneur d'ordre"],
      audience: ["Donneur d'ordre", "Entreprise de nettoyage"],
      relatedResources: ["cahier-des-charges-nettoyage", "analyser-cahier-des-charges-nettoyage"],
    },
    {
      slug: "generateur-fiche-poste",
      title: "Générateur de fiche de poste",
      description:
        "Créez une fiche de poste d'agent ou de chef d'équipe adaptée à vos sites en quelques questions.",
      tags: ["RH", "générateur", "fiche de poste"],
      relatedResources: ["fiche-poste-agent-entretien", "recruter-agents-entretien"],
    },
    {
      slug: "generateur-email-prospection",
      title: "Générateur d'email de prospection",
      description:
        "Générez un email de prospection personnalisé selon votre cible : bureaux, syndics, commerces ou industries.",
      tags: ["prospection", "email", "générateur"],
      relatedResources: ["email-prospection-nettoyage", "trouver-clients-nettoyage-b2b"],
    },
    {
      slug: "score-visibilite-entreprise-nettoyage",
      title: "Score de visibilité entreprise",
      description:
        "Évaluez la visibilité en ligne de votre entreprise de nettoyage et recevez des recommandations concrètes pour progresser.",
      tags: ["visibilité", "score", "marketing"],
      relatedResources: ["trouver-clients-nettoyage-b2b", "score-maturite-digitale-nettoyage"],
    },
    {
      slug: "score-maturite-digitale-nettoyage",
      title: "Score de maturité digitale",
      description:
        "Mesurez la digitalisation de votre activité : devis, planning, suivi qualité, communication client et outils internes.",
      tags: ["digital", "score", "outils"],
      relatedResources: ["logiciels-entreprises-nettoyage", "score-visibilite-entreprise-nettoyage"],
    },
    {
      slug: "calculateur-rentabilite-contrat",
      title: "Calculateur de rentabilité contrat",
      description:
        "Analysez la rentabilité d'un contrat d'entretien sur la durée : revalorisations, absences, remplacements et coûts cachés.",
      tags: ["rentabilité", "contrat", "pilotage"],
      relatedResources: ["calculateur-marge-chantier", "contrat-prestation-nettoyage"],
    },
  ]),

  // ── Actualités & média ───────────────────────────────────────────────────
  ...defineResources("media", [
    {
      slug: "actualites-secteur-proprete",
      title: "Actualités du secteur",
      description:
        "L'essentiel de l'actualité de la propreté en France : marché, réglementation, conventions collectives et grands mouvements.",
      tags: ["actualités", "secteur", "marché"],
      isFeatured: true,
      relatedResources: ["analyses-marche-proprete", "tendances-nettoyage-professionnel"],
    },
    {
      slug: "tendances-nettoyage-professionnel",
      title: "Tendances du nettoyage professionnel",
      description:
        "Les évolutions qui transforment le métier : nettoyage en journée, exigences RSE, attentes clients et nouveaux modèles.",
      tags: ["tendances", "innovation", "métier"],
      relatedResources: ["actualites-secteur-proprete", "innovations-materiel-machines"],
    },
    {
      slug: "innovations-materiel-machines",
      title: "Innovations matériel & machines",
      description:
        "Robots, autolaveuses connectées, capteurs et nouveautés fabricants : ce qui change concrètement sur le terrain.",
      tags: ["matériel", "machines", "innovation"],
      relatedResources: ["autolaveuses", "machines-nettoyage-professionnel"],
    },
    {
      slug: "produits-ecologiques-nettoyage",
      title: "Produits écologiques",
      description:
        "Éco-labels, chimie raisonnée, dosage et alternatives durables : suivre l'évolution des produits d'entretien écologiques.",
      tags: ["écologie", "produits", "éco-label"],
      relatedResources: ["produits-nettoyage-ecologiques", "nettoyage-ecologique"],
    },
    {
      slug: "emploi-recrutement-proprete",
      title: "Emploi & recrutement",
      description:
        "Tension du marché, salaires, fidélisation et bonnes pratiques RH : l'actualité de l'emploi dans la propreté.",
      tags: ["emploi", "recrutement", "RH"],
      relatedResources: ["recruter-agents-entretien", "fiche-poste-agent-entretien"],
    },
    {
      id: "sous-traitance-nettoyage-media",
      slug: "sous-traitance-nettoyage",
      title: "Sous-traitance",
      description:
        "Décryptages et retours d'expérience sur la sous-traitance dans la propreté : pratiques, encadrement et opportunités.",
      tags: ["sous-traitance", "décryptage", "partenariats"],
      relatedResources: ["sous-traitance-nettoyage", "sous-traitance-obligations-legales"],
    },
    {
      slug: "interviews-entrepreneurs-proprete",
      title: "Interviews d'entrepreneurs",
      description:
        "Des dirigeants et indépendants du nettoyage racontent leur parcours, leurs réussites et leurs erreurs à éviter.",
      tags: ["interviews", "entrepreneurs", "parcours"],
      relatedResources: ["portraits-entreprises-nettoyage", "conseils-business-nettoyage"],
    },
    {
      slug: "portraits-entreprises-nettoyage",
      title: "Portraits d'entreprises",
      description:
        "Zoom sur des entreprises de propreté qui se démarquent : positionnement, organisation et facteurs clés de succès.",
      tags: ["portraits", "entreprises", "inspiration"],
      relatedResources: ["interviews-entrepreneurs-proprete", "developper-entreprise-nettoyage"],
    },
    {
      slug: "conseils-business-nettoyage",
      title: "Conseils business",
      description:
        "Gestion, commercial, organisation, pricing : des conseils actionnables pour piloter et développer votre activité.",
      tags: ["business", "conseils", "gestion"],
      relatedResources: ["developper-entreprise-nettoyage", "fixer-prix-nettoyage"],
    },
    {
      slug: "analyses-marche-proprete",
      title: "Analyses marché",
      description:
        "Chiffres clés, segments porteurs et dynamique concurrentielle : comprendre le marché de la propreté pour mieux décider.",
      tags: ["marché", "analyses", "chiffres"],
      seoTitle: "Analyses du marché de la propreté en France",
      seoDescription:
        "Chiffres clés, segments porteurs et tendances : les analyses du marché de la propreté par Club Propreté.",
      relatedResources: ["actualites-secteur-proprete", "tendances-nettoyage-professionnel"],
    },
  ]),

  // ── Comparatifs ──────────────────────────────────────────────────────────
  ...defineResources("comparatifs", [
    {
      slug: "autolaveuses",
      title: "Comparatif autolaveuses",
      description:
        "Autoportées, accompagnées, compactes : comparer les autolaveuses selon vos surfaces, budgets et contraintes terrain.",
      tags: ["autolaveuse", "machines", "comparatif"],
      isFeatured: true,
      isPopular: true,
      seoTitle: "Comparatif autolaveuses professionnelles 2026",
      seoDescription:
        "Quelle autolaveuse choisir ? Critères, comparatif et recommandations par cas d'usage pour les professionnels du nettoyage.",
      relatedResources: ["louer-ou-acheter-autolaveuse", "machines-nettoyage-professionnel"],
      keyPoints: [
        "Les critères qui comptent : largeur de travail, autonomie, maniabilité, SAV",
        "Quel type d'autolaveuse selon la surface et la configuration des locaux",
        "Achat, location ou subvention : les options de financement à connaître",
      ],
    },
    {
      slug: "monobrosses",
      title: "Comparatif monobrosses",
      description:
        "Basse, haute vitesse ou bi-vitesse : choisir la monobrosse adaptée à vos sols et à vos prestations de remise en état.",
      tags: ["monobrosse", "machines", "sols"],
      relatedResources: ["autolaveuses", "machines-nettoyage-professionnel"],
    },
    {
      slug: "logiciels-entreprises-nettoyage",
      title: "Comparatif logiciels nettoyage",
      description:
        "Planning, pointage, qualité, devis-facturation : comparer les logiciels métier pour entreprises de propreté.",
      tags: ["logiciels", "digital", "gestion"],
      isPopular: true,
      relatedResources: ["logiciels-planning-agents-nettoyage", "score-maturite-digitale-nettoyage"],
    },
    {
      slug: "aspirateurs-professionnels",
      title: "Comparatif aspirateurs professionnels",
      description:
        "Poussière, eau et poussière, dorsaux : choisir des aspirateurs fiables et adaptés à l'usage intensif.",
      tags: ["aspirateurs", "matériel", "comparatif"],
      relatedResources: ["materiel-nettoyage-bureaux", "machines-nettoyage-professionnel"],
    },
    {
      slug: "produits-nettoyage-ecologiques",
      title: "Comparatif produits écologiques",
      description:
        "Éco-labels, efficacité réelle et coût à l'usage : comparer les gammes de produits d'entretien écologiques.",
      tags: ["produits", "écologie", "éco-label"],
      relatedResources: ["nettoyage-ecologique", "produits-ecologiques-nettoyage"],
    },
    {
      slug: "machines-nettoyage-professionnel",
      title: "Comparatif machines professionnelles",
      description:
        "Panorama des machines du nettoyage professionnel : usages, gammes de prix et critères de choix par prestation.",
      tags: ["machines", "matériel", "investissement"],
      relatedResources: ["autolaveuses", "monobrosses"],
    },
    {
      slug: "louer-ou-acheter-autolaveuse",
      title: "Louer ou acheter une machine ?",
      description:
        "Location, achat, leasing ou subventions : la bonne stratégie d'équipement selon votre trésorerie et vos contrats.",
      tags: ["financement", "location", "achat"],
      isPopular: true,
      relatedResources: ["autolaveuses", "calculateur-rentabilite-contrat"],
    },
    {
      slug: "fournisseurs-consommables-nettoyage",
      title: "Comparatif fournisseurs consommables",
      description:
        "Papier, sacs, produits, microfibre : comparer les fournisseurs de consommables sur les prix, la livraison et le service.",
      tags: ["fournisseurs", "consommables", "achats"],
      relatedResources: ["produits-nettoyage-ecologiques", "epi-nettoyage"],
    },
    {
      slug: "epi-nettoyage",
      title: "Comparatif EPI",
      description:
        "Gants, chaussures, protections : choisir des équipements de protection individuelle conformes et confortables.",
      tags: ["EPI", "sécurité", "équipements"],
      relatedResources: ["epi-obligatoires-nettoyage", "securite-travail-proprete"],
    },
    {
      slug: "materiel-nettoyage-bureaux",
      title: "Comparatif matériel bureaux",
      description:
        "Chariots, microfibre, aspirateurs silencieux : le matériel adapté aux prestations tertiaires et au nettoyage en journée.",
      tags: ["matériel", "bureaux", "tertiaire"],
      relatedResources: ["nettoyage-bureaux", "aspirateurs-professionnels"],
    },
    {
      slug: "produits-sanitaires-professionnels",
      title: "Comparatif produits sanitaires",
      description:
        "Détartrants, désinfectants, odorisants : comparer les produits sanitaires professionnels selon l'efficacité et la sécurité.",
      tags: ["sanitaires", "produits", "hygiène"],
      relatedResources: ["produits-chimiques-fds", "normes-hygiene-nettoyage"],
    },
    {
      slug: "logiciels-planning-agents-nettoyage",
      title: "Comparatif logiciels de planning",
      description:
        "Comparer les solutions de planification et de pointage des agents : fonctionnalités, prix et facilité de déploiement.",
      tags: ["planning", "logiciels", "agents"],
      relatedResources: ["logiciels-entreprises-nettoyage", "planning-agents-nettoyage"],
    },
  ]),

  // ── Bibliothèque réglementaire ───────────────────────────────────────────
  ...defineResources("reglementation", [
    {
      slug: "securite-travail-proprete",
      title: "Sécurité au travail",
      description:
        "Les obligations de sécurité de l'employeur dans la propreté : évaluation des risques, formation, consignes et suivi.",
      tags: ["sécurité", "obligations", "prévention"],
      isFeatured: true,
      relatedResources: ["epi-obligatoires-nettoyage", "duerp-entreprise-nettoyage"],
    },
    {
      slug: "epi-obligatoires-nettoyage",
      title: "EPI obligatoires",
      description:
        "Quels équipements de protection individuelle fournir à vos agents selon les prestations et les produits utilisés.",
      tags: ["EPI", "sécurité", "agents"],
      relatedResources: ["epi-nettoyage", "securite-travail-proprete"],
    },
    {
      slug: "produits-chimiques-fds",
      title: "Produits chimiques & FDS",
      description:
        "Fiches de données de sécurité, étiquetage, stockage et formation : utiliser les produits chimiques en conformité.",
      tags: ["chimie", "FDS", "sécurité"],
      relatedResources: ["produits-sanitaires-professionnels", "securite-travail-proprete"],
    },
    {
      slug: "plan-prevention-nettoyage",
      title: "Plan de prévention",
      description:
        "Quand et comment établir un plan de prévention lors d'interventions chez un client : seuils, contenu et signatures.",
      tags: ["plan de prévention", "intervention", "obligations"],
      isPopular: true,
      seoTitle: "Plan de prévention nettoyage : obligations et modèle",
      seoDescription:
        "Quand établir un plan de prévention pour vos prestations de nettoyage ? Seuils, contenu obligatoire et bonnes pratiques.",
      relatedResources: ["securite-travail-proprete", "documents-obligatoires-entreprise-nettoyage"],
      keyPoints: [
        "Les cas où le plan de prévention est obligatoire (durée, travaux dangereux)",
        "Le contenu attendu : risques d'interférence, consignes, moyens de prévention",
        "Qui signe, qui conserve, et comment le faire vivre dans le temps",
      ],
    },
    {
      slug: "sous-traitance-obligations-legales",
      title: "Sous-traitance & obligations",
      description:
        "Devoir de vigilance, documents à collecter, travail dissimulé : sécuriser juridiquement vos relations de sous-traitance.",
      tags: ["sous-traitance", "vigilance", "juridique"],
      relatedResources: ["documents-demander-sous-traitant", "contrat-sous-traitance-nettoyage"],
    },
    {
      slug: "documents-obligatoires-entreprise-nettoyage",
      title: "Documents obligatoires",
      description:
        "Registres, affichages, DUERP, attestations : la liste des documents obligatoires pour une entreprise de nettoyage.",
      tags: ["documents", "conformité", "obligations"],
      relatedResources: ["affichages-obligatoires-entreprise", "duerp-entreprise-nettoyage"],
    },
    {
      slug: "documents-demander-sous-traitant",
      title: "Documents à demander à un sous-traitant",
      description:
        "Kbis, URSSAF, assurances, liste des salariés étrangers : les pièces à collecter avant de confier une mission.",
      tags: ["sous-traitance", "vigilance", "documents"],
      relatedResources: ["sous-traitance-obligations-legales", "contrat-sous-traitance-nettoyage"],
    },
    {
      slug: "travail-nuit-proprete",
      title: "Travail de nuit",
      description:
        "Encadrement du travail de nuit dans la propreté : définition, contreparties, suivi médical et organisation.",
      tags: ["travail de nuit", "horaires", "convention"],
      relatedResources: ["securite-travail-proprete", "documents-obligatoires-entreprise-nettoyage"],
    },
    {
      slug: "normes-hygiene-nettoyage",
      title: "Normes d'hygiène",
      description:
        "Les référentiels d'hygiène applicables selon les environnements : tertiaire, agroalimentaire, santé et collectivités.",
      tags: ["hygiène", "normes", "protocoles"],
      relatedResources: ["produits-sanitaires-professionnels", "nettoyage-industriel"],
    },
    {
      slug: "prevention-risques-agent-entretien",
      title: "Prévention des risques agents",
      description:
        "TMS, chutes, risque chimique : identifier et prévenir les principaux risques professionnels des agents d'entretien.",
      tags: ["prévention", "risques", "TMS"],
      relatedResources: ["securite-travail-proprete", "duerp-entreprise-nettoyage"],
    },
    {
      slug: "affichages-obligatoires-entreprise",
      title: "Affichages obligatoires",
      description:
        "Les affichages et informations obligatoires dans une entreprise de nettoyage, au siège comme sur les sites clients.",
      tags: ["affichages", "conformité", "obligations"],
      relatedResources: ["documents-obligatoires-entreprise-nettoyage", "securite-travail-proprete"],
    },
    {
      slug: "duerp-entreprise-nettoyage",
      title: "DUERP",
      description:
        "Le document unique d'évaluation des risques professionnels : contenu, mise à jour et spécificités du nettoyage.",
      tags: ["DUERP", "risques", "obligations"],
      relatedResources: ["prevention-risques-agent-entretien", "securite-travail-proprete"],
    },
  ]),

  // ── Appels d'offres & marchés ────────────────────────────────────────────
  ...defineResources("appels-offres", [
    {
      slug: "comprendre-appels-offres-nettoyage",
      title: "Comprendre les appels d'offres",
      description:
        "Marchés publics et privés, procédures, calendrier et vocabulaire : les bases pour aborder les appels d'offres sereinement.",
      tags: ["appel d'offres", "marchés", "bases"],
      isFeatured: true,
      relatedResources: ["preparer-dossier-appel-offres", "repondre-appel-offres-nettoyage"],
    },
    {
      slug: "preparer-dossier-appel-offres",
      title: "Préparer son dossier",
      description:
        "Pièces administratives, références, attestations : constituer un dossier de candidature complet et réutilisable.",
      tags: ["dossier", "candidature", "pièces"],
      relatedResources: ["dossier-candidature-nettoyage", "comprendre-appels-offres-nettoyage"],
    },
    {
      slug: "rediger-memoire-technique-nettoyage",
      title: "Rédiger un mémoire technique",
      description:
        "Structurer un mémoire technique convaincant : moyens, méthodologie, qualité, RSE et personnalisation par marché.",
      tags: ["mémoire technique", "rédaction", "méthodologie"],
      isPopular: true,
      relatedResources: ["modele-memoire-technique", "memoire-technique-nettoyage"],
    },
    {
      slug: "analyser-cahier-des-charges-nettoyage",
      title: "Analyser un cahier des charges",
      description:
        "Lire entre les lignes d'un cahier des charges : périmètre réel, points de vigilance, pièges de chiffrage et questions à poser.",
      tags: ["cahier des charges", "analyse", "chiffrage"],
      relatedResources: ["cahier-des-charges-nettoyage", "prix-appel-offres-nettoyage"],
    },
    {
      slug: "erreurs-appels-offres-nettoyage",
      title: "Éviter les erreurs fréquentes",
      description:
        "Les erreurs qui éliminent une candidature : pièces manquantes, prix incohérents, mémoire générique et délais ratés.",
      tags: ["erreurs", "candidature", "bonnes pratiques"],
      relatedResources: ["preparer-dossier-appel-offres", "rediger-memoire-technique-nettoyage"],
    },
    {
      slug: "marches-publics-nettoyage",
      title: "Marchés publics de nettoyage",
      description:
        "Fonctionnement des marchés publics : seuils, plateformes, DUME, critères d'attribution et exécution du marché.",
      tags: ["marchés publics", "procédures", "attribution"],
      relatedResources: ["comprendre-appels-offres-nettoyage", "marches-prives-nettoyage"],
    },
    {
      slug: "marches-prives-nettoyage",
      title: "Marchés privés de nettoyage",
      description:
        "Consultations privées, gré à gré et référencements : comment les grands comptes sélectionnent leurs prestataires.",
      tags: ["marchés privés", "grands comptes", "consultation"],
      relatedResources: ["marches-publics-nettoyage", "trouver-clients-nettoyage-b2b"],
    },
    {
      slug: "dossier-candidature-nettoyage",
      title: "Dossier de candidature",
      description:
        "Le contenu type d'un dossier de candidature gagnant et comment le maintenir à jour pour répondre vite et bien.",
      tags: ["candidature", "dossier", "organisation"],
      relatedResources: ["preparer-dossier-appel-offres", "erreurs-appels-offres-nettoyage"],
    },
    {
      slug: "criteres-selection-prestataire-nettoyage",
      title: "Critères de sélection des prestataires",
      description:
        "Comprendre comment les acheteurs notent les offres : pondération prix/technique, références et engagements de service.",
      tags: ["critères", "sélection", "acheteurs"],
      audience: ["Donneur d'ordre", "Entreprise de nettoyage"],
      relatedResources: ["analyser-cahier-des-charges-nettoyage", "rediger-memoire-technique-nettoyage"],
    },
    {
      slug: "modele-memoire-technique",
      title: "Modèles pour appels d'offres",
      description:
        "Trames et modèles dédiés aux appels d'offres : mémoire technique, lettre de candidature et cadres de réponse.",
      tags: ["modèles", "mémoire technique", "trames"],
      relatedResources: ["memoire-technique-nettoyage", "rediger-memoire-technique-nettoyage"],
    },
    {
      slug: "prix-appel-offres-nettoyage",
      title: "Construire son prix en appel d'offres",
      description:
        "Décomposer son prix, anticiper les revalorisations et rester compétitif sans sacrifier la marge sur la durée du marché.",
      tags: ["prix", "chiffrage", "marge"],
      relatedResources: ["fixer-prix-nettoyage", "calculateur-rentabilite-contrat"],
    },
    {
      slug: "suivi-opportunites-marches",
      title: "Suivre les opportunités de marchés",
      description:
        "Mettre en place une veille efficace sur les marchés de nettoyage : sources, alertes et organisation de la réponse.",
      tags: ["veille", "opportunités", "organisation"],
      relatedResources: ["marches-publics-nettoyage", "comprendre-appels-offres-nettoyage"],
    },
  ]),
];

// ── Accès aux données ─────────────────────────────────────────────────────

const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
const categoryBySlug = new Map(resourceCategories.map((category) => [category.slug, category]));

export function getResourceCategory(slug: string): ResourceCategory | undefined {
  return categoryBySlug.get(slug as ResourceCategorySlug);
}

export function getResourcesByCategory(slug: ResourceCategorySlug): Resource[] {
  return resources.filter((resource) => resource.category === slug);
}

export function getResource(category: ResourceCategorySlug, slug: string): Resource | undefined {
  const resource = resources.find((r) => r.category === category && r.slug === slug);
  return resource;
}

export function getResourceById(id: string): Resource | undefined {
  return resourceById.get(id);
}

export function getResourceHref(resource: Resource): string {
  return `/ressources/${resource.category}/${resource.slug}`;
}

export function getPopularResources(): Resource[] {
  return resources.filter((resource) => resource.isPopular);
}

export function searchResources(query: string): Resource[] {
  const normalized = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (!normalized) return [];
  const matches = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .includes(normalized);
  return resources.filter(
    (resource) =>
      matches(resource.title) ||
      matches(resource.description) ||
      resource.tags.some((tag) => matches(tag))
  );
}

// Recommandations de ressources par profil pour la page hub.
export const resourcesByProfile: Array<{ title: string; description: string; categories: ResourceCategorySlug[] }> = [
  {
    title: "Entreprise de nettoyage",
    description: "Guides métier, modèles de contrats, calculateurs de marge, appels d'offres et comparatifs matériel.",
    categories: ["guides", "modeles", "outils", "appels-offres"],
  },
  {
    title: "Indépendant",
    description: "Modèles de devis, simulateurs de prix, guides pour trouver des clients et contenus pour structurer son activité.",
    categories: ["modeles", "outils", "guides"],
  },
  {
    title: "Sous-traitant",
    description: "Contrats de sous-traitance, obligations légales, guides partenariats et opportunités de missions.",
    categories: ["modeles", "reglementation", "guides"],
  },
  {
    title: "Fournisseur",
    description: "Comparatifs, actualités matériel, portraits d'entreprises et contenus liés aux achats professionnels.",
    categories: ["comparatifs", "media"],
  },
  {
    title: "Recruteur",
    description: "Fiches de poste, guides de recrutement, coût horaire agent et actualités emploi du secteur.",
    categories: ["modeles", "outils", "media"],
  },
  {
    title: "Donneur d'ordre",
    description: "Cahiers des charges, comparatifs, réglementation et guides pour choisir un prestataire.",
    categories: ["modeles", "comparatifs", "reglementation"],
  },
];
