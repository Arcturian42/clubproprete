import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { SupplierAdvisor } from "@/components/suppliers/supplier-advisor";
import { prisma } from "@/lib/prisma";
import type { Supplier } from "@/lib/types";

export default async function SuppliersPage() {
  const dbSuppliers = await prisma.supplier.findMany({
    where: { verificationStatus: "approved", deletedAt: null },
    include: { services: true },
    orderBy: { createdAt: "desc" },
  });

  const approvedSuppliers: Supplier[] = dbSuppliers.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    city: s.deliveryAreas || "",
    coverage: s.nationalCoverage ? "National" : s.deliveryAreas || "Local",
    status: s.verificationStatus as Supplier["status"],
    specialties: s.services.map((svc) => svc.title),
  }));

  return (
    <PageShell
      eyebrow="Annuaire"
      title="Fournisseurs"
      description="Fournisseurs verifies pour les societes de nettoyage : materiel, logiciels, EPI, services et formations."
      actions={
        <Link href="/inscription?role=supplier_owner" className="bento-btn bento-btn-primary">
          Referencer un fournisseur
        </Link>
      }
    >
      <SupplierAdvisor suppliers={approvedSuppliers} />

      <div className="mt-10">
        <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Tous les fournisseurs</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">Liste complete</h2>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {approvedSuppliers.map((supplier) => (
          <Link
            key={supplier.id}
            href={`/annuaire/fournisseurs/${supplier.id}`}
            className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
            aria-label={`Voir la fiche de ${supplier.name}`}
          >
            <EntityCard
              title={supplier.name}
              subtitle={`${supplier.category} · ${supplier.coverage}`}
              meta={["✓ Verifie", supplier.coverage]}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-emerald-600">
                  <BadgeCheck size={14} /> Fournisseur verifie
                </span>
                <span className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
                  Voir la fiche →
                </span>
              </div>
            </EntityCard>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
