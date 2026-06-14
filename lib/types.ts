export type Role =
  | "public"
  | "registered_user"
  | "company_owner"
  | "verified_company"
  | "supplier_owner"
  | "verified_supplier"
  | "independent_profile"
  | "candidate_profile"
  | "training_organization"
  | "author"
  | "association_member"
  | "admin"
  | "super_admin";

export const WORKFLOW_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "suspended",
  "archived",
  "published",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const ADMIN_ENTITY_TYPES = [
  "company",
  "supplier",
  "training_organization",
  "job",
  "training",
  "article",
  "author_application",
  "membership",
] as const;

export type AdminEntityType = (typeof ADMIN_ENTITY_TYPES)[number];

export type Company = {
  id: string;
  name: string;
  city: string;
  region: string;
  services: string[];
  employeeCount: string;
  status: WorkflowStatus;
  wants: string[];
  associationMember: boolean;
};

export type Supplier = {
  id: string;
  slug?: string | null;
  name: string;
  category: string;
  family?: string | null;
  subCategory?: string | null;
  offerType?: string | null;
  city: string;
  coverage: string;
  status: WorkflowStatus;
  specialties?: string[];
  bestFor?: string;
  tradeoffs?: string;
  responseTime?: string;
};

export type IndependentProfile = {
  id: string;
  displayName: string;
  city: string;
  skills: string[];
  availability: string;
  associationStatus: WorkflowStatus;
};

export type CandidateProfile = {
  id: string;
  name: string;
  city: string;
  region?: string;
  contracts: string[];
  experienceYears: number;
  availability: string;
  profileScore?: number;
  skills?: string[];
};

export type CandidateApplication = {
  id: string;
  candidateId: string;
  jobTitle: string;
  company: string;
  city: string;
  contract: string;
  appliedAt: string;
  status: "sent" | "viewed" | "response_received" | "interview" | "rejected";
  response?: string;
};

export type CandidateTrainingRecord = {
  id: string;
  candidateId: string;
  title: string;
  provider: string;
  status: "completed" | "recommended" | "in_progress";
  impact: string;
};

export type CandidateConnection = {
  id: string;
  candidateId: string;
  name: string;
  city: string;
  region: string;
  level: string;
  reason: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  city: string;
  contract: string;
  status: WorkflowStatus;
  applications: number;
};

export type Training = {
  id: string;
  title: string;
  creator: string;
  creatorType: "Societe" | "Organisme";
  category: string;
  city: string;
  format: string;
  status: WorkflowStatus;
  description?: string;
  duration?: string;
  price?: string;
  certification?: string;
  prerequisites?: string[];
  targetAudience?: string;
  fundingOptions?: string[];
  recommendedBy?: string[];
  contactEmail?: string;
  phone?: string;
  website?: string;
};

export type Membership = {
  id: string;
  entity: string;
  profileType: string;
  motivation: string;
  status: WorkflowStatus;
};

export type SubcontractingMission = {
  id: string;
  title: string;
  creator: string;
  city: string;
  serviceType: string;
  urgency: string;
  status: WorkflowStatus;
  applications: number;
};

export type Article = {
  id: string;
  title: string;
  category: string;
  status: WorkflowStatus;
  excerpt?: string;
  content?: string;
  author?: string;
  publishedAt?: string;
  readTime?: string;
  tags?: string[];
};

export type DashboardSeed = {
  role: Role;
  label: string;
  summary: string;
  actions: string[];
};
