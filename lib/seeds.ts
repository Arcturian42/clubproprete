import type { DashboardSeed } from "@/lib/types";

export const dashboards: DashboardSeed[] = [
  {
    role: "company_owner",
    label: "Dashboard société",
    summary: "Piloter fiche entreprise, offres, formations et adhésion association.",
    actions: ["Compléter la fiche", "Publier une offre", "Demander l'association", "Proposer une formation"],
    metrics: [
      { label: "Score profil", value: "82%" },
      { label: "Candidatures", value: "4" },
      { label: "Statut association", value: "Validée" },
    ],
  },
  {
    role: "supplier_owner",
    label: "Dashboard fournisseur",
    summary: "Gérer fiche fournisseur, catégories, demandes et validation.",
    actions: ["Compléter la fiche", "Ajouter un service", "Vérifier la couverture"],
    metrics: [
      { label: "Statut fiche", value: "En attente" },
      { label: "Catégories", value: "2" },
      { label: "Leads", value: "0" },
    ],
  },
  {
    role: "independent_profile",
    label: "Dashboard indépendant",
    summary: "Valoriser compétences, disponibilité et accès association.",
    actions: ["Compléter le profil", "Demander l'association", "Voir missions privées"],
    metrics: [
      { label: "Score profil", value: "76%" },
      { label: "Statut association", value: "Soumise" },
      { label: "Missions", value: "Réservées" },
    ],
  },
  {
    role: "candidate_profile",
    label: "Dashboard candidat",
    summary: "Suivre profil, candidatures, disponibilité et formations utiles.",
    actions: ["Ajouter un CV", "Postuler", "Consulter formations"],
    metrics: [
      { label: "Candidatures", value: "1" },
      { label: "Disponibilité", value: "Immédiate" },
      { label: "Profil", value: "68%" },
    ],
  },
  {
    role: "admin",
    label: "Dashboard admin",
    summary: "Valider, modérer et surveiller la qualité des données.",
    actions: ["Valider profils", "Modération contenus", "Exporter CSV", "Gérer badges"],
    metrics: [
      { label: "En attente", value: "7" },
      { label: "Membres", value: "1" },
      { label: "Missions", value: "2" },
    ],
  },
  {
    role: "super_admin",
    label: "Dashboard super admin",
    summary: "Gestion globale de la plateforme : utilisateurs, admins, sécurité et stratégie.",
    actions: ["Gérer les utilisateurs", "Modération", "Exporter CSV", "Audit sécurité"],
    metrics: [
      { label: "En attente", value: "7" },
      { label: "Utilisateurs", value: "10" },
      { label: "Admins", value: "2" },
    ],
  },
];
