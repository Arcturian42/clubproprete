"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";

export function JoinAssociationButton() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isMember = user?.associationMember === true;
  const isEligible =
    user?.role === "company_owner" ||
    user?.role === "verified_company" ||
    user?.role === "independent_profile" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  if (status === "loading" || !user) {
    return (
      <Link href="/inscription?role=company_owner" className="bento-btn bento-btn-primary">
        <Shield size={16} className="mr-2" />
        Demander l'adhésion
      </Link>
    );
  }

  if (isMember) {
    return (
      <button className="bento-btn bento-btn-gold" disabled>
        <Shield size={16} className="mr-2" />
        Membre actif
      </button>
    );
  }

  if (isEligible) {
    return (
      <Link href="/association/adhesion" className="bento-btn bento-btn-primary">
        <Shield size={16} className="mr-2" />
        Demander l'adhesion
      </Link>
    );
  }

  return (
    <button className="bento-btn" disabled title="Reserve aux societes et independants">
      <Shield size={16} className="mr-2" />
      Demander l'adhesion
    </button>
  );
}
