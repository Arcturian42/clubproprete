import type { Role } from "@/lib/types";

export const roleLabels: Record<Role, string> = {
  public: "Visiteur",
  registered_user: "Utilisateur inscrit",
  company_owner: "Société de nettoyage",
  verified_company: "Société vérifiée",
  supplier_owner: "Fournisseur",
  verified_supplier: "Fournisseur vérifié",
  independent_profile: "Indépendant",
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
    organization: "Azur Propreté Services",
    role: "company_owner",
    profileType: "Société",
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
    profileType: "Indépendant",
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
    organization: "Institut Hygiène Formation",
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

