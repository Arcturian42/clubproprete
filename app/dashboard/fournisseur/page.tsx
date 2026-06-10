import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { SupplierForm } from "@/components/supplier-form";
import { getSupplierByOwner } from "@/lib/actions/suppliers";

export default async function SupplierDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/dashboard/fournisseur");
  }

  const supplier = await getSupplierByOwner(session.user.id);

  const initialData = supplier
    ? {
        id: supplier.id,
        name: supplier.name,
        legalName: supplier.legalName ?? "",
        siret: supplier.siret ?? "",
        family: supplier.family ?? "",
        subCategory: supplier.subCategory ?? "",
        offerType: supplier.offerType ?? "",
        description: supplier.description ?? "",
        website: supplier.website ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        contactName: supplier.contactName ?? "",
        deliveryAreas: supplier.deliveryAreas ?? "",
        nationalCoverage: supplier.nationalCoverage,
        services: supplier.services.map((service) => service.title).join("\n"),
        verificationStatus: supplier.verificationStatus,
      }
    : null;

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Ma fiche fournisseur"
      description="Créez ou mettez à jour votre fiche fournisseur. Elle sera visible dans l'annuaire après validation admin."
      actions={
        <Link href="/dashboard" className="bento-btn">
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>
      }
    >
      <SupplierForm supplier={initialData} />
    </PageShell>
  );
}
