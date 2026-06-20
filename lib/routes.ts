// N1 — Les annuaires (Sociétés, Fournisseurs, Centres de formation, Membres,
// Indépendants) étaient dispersés entre la nav et le pied de page. On les
// regroupe sous un menu déroulant « Annuaires » dans l'en-tête.
export const directoryRoutes = [
  { href: "/annuaire/societes", label: "Sociétés" },
  { href: "/annuaire/fournisseurs", label: "Fournisseurs" },
  { href: "/annuaire/centres-formation", label: "Centres de formation" },
  { href: "/membres", label: "Membres" },
  { href: "/independants", label: "Indépendants" },
];

export const publicRoutes = [
  { href: "/emploi", label: "Emploi" },
  { href: "/formations", label: "Formations" },
  { href: "/association", label: "Association" },
  { href: "/ressources", label: "Ressources" },
  { href: "/a-propos", label: "À propos" },
];

export const appRoutes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" }
];
