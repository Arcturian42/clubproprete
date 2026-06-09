import type { Role } from "@/lib/types";

export function canAccessSubcontracting(roles: Role[]) {
  return roles.includes("association_member") || roles.includes("admin") || roles.includes("super_admin");
}

export function canPublishMission(roles: Role[]) {
  return (
    roles.includes("association_member") &&
    (roles.includes("company_owner") || roles.includes("verified_company") || roles.includes("admin"))
  );
}

export function canModerate(roles: Role[]) {
  return roles.includes("admin") || roles.includes("super_admin");
}

export function needsAdminValidation(status: string) {
  return status === "pending" || status === "draft";
}

