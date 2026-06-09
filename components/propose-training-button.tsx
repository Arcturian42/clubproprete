"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

export function ProposeTrainingButton() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const canCreate =
    user?.role === "training_organization" ||
    user?.role === "company_owner" ||
    user?.role === "verified_company" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  if (status === "loading") {
    return (
      <button className="bento-btn" disabled>
        <Plus size={16} className="mr-2" />
        Chargement...
      </button>
    );
  }

  if (!user) {
    return (
      <Link href="/inscription?role=training_organization" className="bento-btn bento-btn-primary">
        <Plus size={16} className="mr-2" />
        Proposer une formation
      </Link>
    );
  }

  if (canCreate) {
    return (
      <Link href="/dashboard" className="bento-btn bento-btn-primary">
        <Plus size={16} className="mr-2" />
        Proposer une formation
      </Link>
    );
  }

  return (
    <button className="bento-btn" disabled title="Reserve aux organismes et societes">
      <Plus size={16} className="mr-2" />
      Proposer une formation
    </button>
  );
}
