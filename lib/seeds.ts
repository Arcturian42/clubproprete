import type { DashboardSeed } from "@/lib/types";

export const dashboards: DashboardSeed[] = [
  {
    role: "company_owner",
    label: "Dashboard société",
    summary: "Piloter fiche entreprise, offres, formations et adhésion association.",
    actions: ["Compléter la fiche", "Publier une offre", "Demander l'association", "Proposer une formation"],
  },
  {
    role: "supplier_owner",
    label: "Dashboard fournisseur",
    summary: "Gérer fiche fournisseur, catégories, demandes et validation.",
    actions: ["Compléter la fiche", "Ajouter un service", "Vérifier la couverture"],
  },
  {
    role: "independent_profile",
    label: "Dashboard indépendant",
    summary: "Valoriser compétences, disponibilité et accès association.",
    actions: ["Compléter le profil", "Demander l'association", "Voir missions privées"],
  },
  {
    role: "candidate_profile",
    label: "Dashboard candidat",
    summary: "Suivre profil, candidatures, disponibilité et formations utiles.",
    actions: ["Ajouter un CV", "Postuler", "Consulter formations"],
  },
  {
    role: "admin",
    label: "Dashboard admin",
    summary: "Valider, modérer et surveiller la qualité des données.",
    actions: ["Valider profils", "Modération contenus", "Exporter CSV", "Gérer badges"],
  },
  {
    role: "super_admin",
    label: "Dashboard super admin",
    summary: "Gestion globale de la plateforme : utilisateurs, admins, sécurité et stratégie.",
    actions: ["Gérer les utilisateurs", "Modération", "Exporter CSV", "Audit sécurité"],
  },
];
