"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

export function ProposeTrainingButton() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const canCreate =
    !!user &&
    (user.role === "training_organization" ||
      user.role === "company_owner" ||
      user.role === "verified_company" ||
      user.role === "supplier_owner" ||
      user.role === "verified_supplier" ||
      user.role === "registered_user" ||
      user.role === "admin" ||
      user.role === "super_admin");

  if (status === "loading" || !user) {
    return (
      <Link href="/inscription?role=training_organization" className="bento-btn bento-btn-primary">
        <Plus size={16} className="mr-2" />
        Proposer une formation
      </Link>
    );
  }

  if (canCreate) {
    return (
      <Link href="/formations/nouvelle" className="bento-btn bento-btn-primary">
        <Plus size={16} className="mr-2" />
        Proposer une formation
      </Link>
    );
  }

  return (
    <Link href="/formations/nouvelle" className="bento-btn bento-btn-primary">
      <Plus size={16} className="mr-2" />
      Proposer une formation
    </Link>
  );
}
