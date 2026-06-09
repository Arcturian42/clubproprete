import Link from "next/link";
import { BadgeCheck, Filter } from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { SupplierAdvisor } from "@/components/suppliers/supplier-advisor";
import { getPublishedSuppliers } from "@/lib/actions/suppliers";
import {
  getOfferTypeLabel,
  getSupplierFamilyLabel,
  getSupplierSubCategoryLabel,
  isOfferType,
  isSupplierFamily,
  isSupplierSubCategory,
  OFFER_TYPES,
  SUPPLIER_FAMILIES,
  SUPPLIER_TAXONOMY,
} from "@/lib/supplier-taxonomy";
import type { Supplier } from "@/lib/types";

interface SuppliersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    family?: string;
    subCategory?: string;
    offerType?: string;
  }>;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const family = isSupplierFamily(params.family) ? params.family : undefined;
  const subCategory = isSupplierSubCategory(params.subCategory) ? params.subCategory : undefined;
  const offerType = family === "machines" && isOfferType(params.offerType) ? params.offerType : undefined;
  const search = params.search?.trim() || undefined;

  const { items: dbSuppliers, total } = await getPublishedSuppliers({
    search,
    family,
    subCategory,
    offerType,
    page,
  });

  const approvedSuppliers: Supplier[] = dbSuppliers.map((supplier) => {
    const familyLabel = getSupplierFamilyLabel(supplier.family);
    const subCategoryLabel = getSupplierSubCategoryLabel(supplier.subCategory ?? supplier.category);
    const offerTypeLabel = getOfferTypeLabel(supplier.offerType);

    return {
      id: supplier.id,
      name: supplier.name,
      category: offerTypeLabel ? `${familyLabel} · ${subCategoryLabel} · ${offerTypeLabel}` : `${familyLabel} · ${subCategoryLabel}`,
      family: supplier.family,
      subCategory: supplier.subCategory,
      offerType: supplier.offerType,
      city: supplier.deliveryAreas || "",
      coverage: supplier.nationalCoverage ? "National" : supplier.deliveryAreas || "Local",
      status: supplier.verificationStatus as Supplier["status"],
      specialties: supplier.services.map((service) => getSupplierSubCategoryLabel(service.category)),
    };
  });

  const subCategoryOptions = family
    ? SUPPLIER_TAXONOMY[family].subs
    : SUPPLIER_FAMILIES.flatMap((supplierFamily) => SUPPLIER_TAXONOMY[supplierFamily].subs);

  return (
    <PageShell
      eyebrow="Annuaire"
      title="Fournisseurs"
      description="Fournisseurs vérifiés par famille métier : consommables, matériel, machines et logiciels."
      actions={
        <Link href="/inscription?role=supplier_owner" className="bento-btn bento-btn-primary">
          Référencer un fournisseur
        </Link>
      }
    >
      <SupplierAdvisor suppliers={approvedSuppliers} />

      <section className="surface mt-8 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Filter size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Filtres métier</p>
            <h2 className="text-xl font-black text-slate-900">Famille, sous-catégorie et achat/location</h2>
          </div>
        </div>

        <form action="/annuaire/fournisseurs" className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.8fr_1fr_0.8fr_auto]">
          <input
            className="bento-input"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Recherche fournisseur, ville, service..."
          />
          <select className="bento-input" name="family" defaultValue={family ?? ""}>
            <option value="">Toutes les familles</option>
            {SUPPLIER_FAMILIES.map((supplierFamily) => (
              <option key={supplierFamily} value={supplierFamily}>
                {getSupplierFamilyLabel(supplierFamily)}
              </option>
            ))}
          </select>
          <select className="bento-input" name="subCategory" defaultValue={subCategory ?? ""}>
            <option value="">Toutes les sous-catégories</option>
            {subCategoryOptions.map((option) => (
              <option key={option} value={option}>
                {getSupplierSubCategoryLabel(option)}
              </option>
            ))}
          </select>
          <select className="bento-input" name="offerType" defaultValue={offerType ?? ""}>
            <option value="">Achat/location</option>
            {OFFER_TYPES.map((option) => (
              <option key={option} value={option}>
                {getOfferTypeLabel(option)}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="bento-btn bento-btn-primary">
              Filtrer
            </button>
            <Link href="/annuaire/fournisseurs" className="bento-btn">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <div className="mt-10">
        <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Tous les fournisseurs</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">Liste complète · {total} résultat(s)</h2>
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
              meta={["✓ Vérifié", supplier.coverage]}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-emerald-600">
                  <BadgeCheck size={14} /> Fournisseur vérifié
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
