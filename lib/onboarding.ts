// Constantes et types partagés entre le wizard d'onboarding (client) et
// l'action serveur completeOnboarding.

export const ONBOARDING_SITUATIONS = [
  "company",
  "supplier",
  "training",
  "independent",
  "job_seeker",
] as const;

export type OnboardingSituation = (typeof ONBOARDING_SITUATIONS)[number];

// Intention transmise par les CTA du site ("/onboarding?intent=supplier") pour
// présélectionner une situation dans le wizard.
export type OnboardingIntent = OnboardingSituation;

export const SITUATION_OPTIONS: Array<{
  key: OnboardingSituation;
  title: string;
  description: string;
}> = [
  {
    key: "company",
    title: "Je dirige une société de propreté",
    description: "Créez votre fiche société : annuaire, recrutement, sous-traitance, association.",
  },
  {
    key: "supplier",
    title: "Je suis fournisseur du secteur",
    description: "Produits, matériel, machines ou logiciels : créez votre fiche fournisseur.",
  },
  {
    key: "training",
    title: "Je gère un centre de formation",
    description: "Référencez votre organisme puis proposez vos premières formations.",
  },
  {
    key: "independent",
    title: "Je suis indépendant / auto-entrepreneur",
    description: "Sous-traitance, missions, visibilité : créez votre profil indépendant.",
  },
  {
    key: "job_seeker",
    title: "Je cherche un emploi",
    description: "CDI, CDD ou intérim : créez votre profil candidat et postulez aux offres.",
  },
];

export const EXPERIENCE_LEVELS = [
  { value: "debutant", label: "Je débute dans le secteur", years: 0 },
  { value: "1_3", label: "1 à 3 ans d'expérience", years: 2 },
  { value: "3_plus", label: "Plus de 3 ans d'expérience", years: 5 },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["value"];

export const CONTRACT_OPTIONS = ["CDI", "CDD", "Intérim", "Temps partiel"] as const;

// Rôle principal résultant des situations choisies, par ordre de priorité.
export const SITUATION_ROLE: Record<OnboardingSituation, string> = {
  company: "company_owner",
  supplier: "supplier_owner",
  training: "training_organization",
  independent: "independent_profile",
  job_seeker: "candidate_profile",
};
