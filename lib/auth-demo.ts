import type { Role } from "@/lib/types";

export const roleLabels: Record<Role, string> = {
  public: "Visiteur",
  registered_user: "Utilisateur inscrit",
  company_owner: "Societe de nettoyage",
  verified_company: "Societe verifiee",
  supplier_owner: "Fournisseur",
  verified_supplier: "Fournisseur verifie",
  independent_profile: "Independant",
  candidate_profile: "Candidat",
  training_organization: "Organisme de formation",
  author: "Auteur",
  association_member: "Membre association",
  admin: "Admin",
  super_admin: "Super admin",
};

export type DemoAccount = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organization?: string;
  role: Role;
  profileType: string;
  associationMember: boolean;
};

export const demoAccounts: DemoAccount[] = [
  {
    id: "demo-company",
    email: "societe@clubproprete.test",
    firstName: "Claire",
    lastName: "Martin",
    organization: "Azur Proprete Services",
    role: "company_owner",
    profileType: "Societe",
    associationMember: true,
  },
  {
    id: "demo-supplier",
    email: "fournisseur@clubproprete.test",
    firstName: "Nicolas",
    lastName: "Bernard",
    organization: "EcoMateriel Pro",
    role: "supplier_owner",
    profileType: "Fournisseur",
    associationMember: false,
  },
  {
    id: "demo-independent",
    email: "independant@clubproprete.test",
    firstName: "Karim",
    lastName: "B.",
    role: "independent_profile",
    profileType: "Independant",
    associationMember: true,
  },
  {
    id: "demo-candidate",
    email: "candidat@clubproprete.test",
    firstName: "Laura",
    lastName: "D.",
    role: "candidate_profile",
    profileType: "Candidat",
    associationMember: false,
  },
  {
    id: "demo-training",
    email: "formation@clubproprete.test",
    firstName: "Marie",
    lastName: "Lefebvre",
    organization: "Institut Hygiene Formation",
    role: "training_organization",
    profileType: "Organisme de formation",
    associationMember: false,
  },
  {
    id: "demo-author",
    email: "auteur@clubproprete.test",
    firstName: "Philippe",
    lastName: "Dubois",
    role: "author",
    profileType: "Auteur",
    associationMember: false,
  },
  {
    id: "demo-admin",
    email: "admin@clubproprete.test",
    firstName: "Admin",
    lastName: "Club",
    role: "admin",
    profileType: "Admin",
    associationMember: true,
  },
  {
    id: "demo-super-admin",
    email: "superadmin@clubproprete.test",
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    profileType: "Super Admin",
    associationMember: true,
  },
];

export const profileOptions: Array<{ label: string; role: Role; associationEligible: boolean }> = [
  { label: "Societe de nettoyage", role: "company_owner", associationEligible: true },
  { label: "Fournisseur", role: "supplier_owner", associationEligible: false },
  { label: "Independant / sous-traitant", role: "independent_profile", associationEligible: true },
  { label: "Candidat emploi", role: "candidate_profile", associationEligible: false },
  { label: "Organisme de formation", role: "training_organization", associationEligible: false },
];
