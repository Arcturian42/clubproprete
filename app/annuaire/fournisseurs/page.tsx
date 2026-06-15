import Link from "next/link";
import { BadgeCheck, Search, SlidersHorizontal } from "lucide-react";
import { auth } from "@/auth";
import { EntityCard } from "@/components/entity-card";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Pagination } from "@/components/pagination";
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

export const metadata = {
  title: "Fournisseurs pour professionnels de la propreté",
  description:
    "L'annuaire des fournisseurs vérifiés du secteur de la propreté : produits, matériel, machines et logiciels. Filtrez par catégorie et sous-catégorie.",
};

const PAGE_SIZE = 12;

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
  const session = await auth();
  const referenceHref = session?.user ? "/dashboard/fournisseur" : "/inscription?role=supplier_owner";
  const page = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const family = isSupplierFamily(params.family) ? params.family : undefined;
  const subCategory = isSupplierSubCategory(params.subCategory) ? params.subCategory : undefined;
  const offerType = isOfferType(params.offerType) ? params.offerType : undefined;
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
      slug: supplier.slug,
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

  // Les sous-catégories proposées suivent la catégorie sélectionnée.
  const subCategoryOptions = family
    ? SUPPLIER_TAXONOMY[family].subs
    : SUPPLIER_FAMILIES.flatMap((supplierFamily) => SUPPLIER_TAXONOMY[supplierFamily].subs);

  const hasFilters = Boolean(search || family || subCategory || offerType);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageShell
      eyebrow="Annuaire"
      title="Fournisseurs"
      description="L'annuaire des fournisseurs vérifiés du secteur de la propreté. Filtrez par catégorie et sous-catégorie."
      actions={
        <Link href={referenceHref} className="bento-btn bento-btn-primary">
          Référencer un fournisseur
        </Link>
      }
    >
      {/* Filtres */}
      <section className="surface p-5">
        <form action="/annuaire/fournisseurs" className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">Rechercher un fournisseur</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              className="bento-input pl-9"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Nom, ville ou service…"
            />
          </label>

          <label>
            <span className="sr-only">Catégorie</span>
            <select className="bento-input" name="family" defaultValue={family ?? ""}>
              <option value="">Catégorie — toutes</option>
              {SUPPLIER_FAMILIES.map((supplierFamily) => (
                <option key={supplierFamily} value={supplierFamily}>
                  {getSupplierFamilyLabel(supplierFamily)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sous-catégorie</span>
            <select className="bento-input" name="subCategory" defaultValue={subCategory ?? ""}>
              <option value="">Sous-catégorie — toutes</option>
              {subCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {getSupplierSubCategoryLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button type="submit" className="bento-btn bento-btn-primary flex-1 justify-center">
              <SlidersHorizontal size={16} aria-hidden="true" /> Filtrer
            </button>
            {hasFilters && (
              <Link href="/annuaire/fournisseurs" className="bento-btn justify-center">
                Réinitialiser
              </Link>
            )}
          </div>
        </form>
      </section>

      {/* Résultats */}
      <div className="mt-8 flex items-end justify-between gap-4">
        <h2 className="text-xl font-black text-slate-900">
          {total} fournisseur{total > 1 ? "s" : ""}
          {hasFilters ? " trouvé" + (total > 1 ? "s" : "") : ""}
        </h2>
      </div>

      {approvedSuppliers.length === 0 ? (
        <EmptyState
          title="Aucun fournisseur ne correspond"
          description={
            hasFilters
              ? "Essayez d'élargir votre recherche ou de réinitialiser les filtres."
              : "Aucun fournisseur n'est encore référencé. Revenez bientôt."
          }
          actionLabel={hasFilters ? "Réinitialiser les filtres" : undefined}
          actionHref={hasFilters ? "/annuaire/fournisseurs" : undefined}
        />
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {approvedSuppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/annuaire/fournisseurs/${supplier.slug ?? supplier.id}`}
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
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/annuaire/fournisseurs"
        searchQuery={search}
        extraParams={{ family, subCategory }}
      />
    </PageShell>
  );
}
