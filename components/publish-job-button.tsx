"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

export function PublishJobButton() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const canOpenPublisher =
    !!user &&
    (user.role === "company_owner" ||
    user.role === "verified_company" ||
    user.role === "supplier_owner" ||
    user.role === "verified_supplier" ||
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "registered_user");

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
      <Link href="/inscription?role=company_owner" className="bento-btn bento-btn-primary">
        <Plus size={16} className="mr-2" />
        Publier une offre
      </Link>
    );
  }

  if (canOpenPublisher) {
    return (
      <Link href="/emploi/nouvelle-offre" className="bento-btn bento-btn-primary">
        <Plus size={16} className="mr-2" />
        Publier une offre
      </Link>
    );
  }

  return (
    <Link href="/emploi/nouvelle-offre" className="bento-btn bento-btn-primary">
      <Plus size={16} className="mr-2" />
      Publier une offre
    </Link>
  );
}
