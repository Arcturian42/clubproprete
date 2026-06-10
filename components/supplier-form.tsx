"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package, Save } from "lucide-react";
import { upsertSupplierProfile } from "@/lib/actions/suppliers";
import {
  OFFER_TYPES,
  SUPPLIER_FAMILIES,
  SUPPLIER_TAXONOMY,
  getOfferTypeLabel,
  getSupplierFamilyLabel,
  getSupplierSubCategoryLabel,
} from "@/lib/supplier-taxonomy";

type SupplierFormData = {
  id: string;
  name: string;
  legalName: string;
  siret: string;
  family: string;
  subCategory: string;
  offerType: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  contactName: string;
  deliveryAreas: string;
  nationalCoverage: boolean;
  services: string;
  verificationStatus: string;
};

export function SupplierForm({ supplier }: { supplier?: SupplierFormData | null }) {
  const router = useRouter();
  const initialFamily =
    supplier?.family && (SUPPLIER_FAMILIES as readonly string[]).includes(supplier.family)
      ? supplier.family
      : SUPPLIER_FAMILIES[0];

  const [family, setFamily] = useState<string>(initialFamily);
  const [subCategory, setSubCategory] = useState<string>(supplier?.subCategory ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subCategories = useMemo(() => {
    const familyKey = family as keyof typeof SUPPLIER_TAXONOMY;
    return SUPPLIER_TAXONOMY[familyKey] ? [...SUPPLIER_TAXONOMY[familyKey].subs] : [];
  }, [family]);

  const showOfferType = useMemo(() => {
    const familyKey = family as keyof typeof SUPPLIER_TAXONOMY;
    return Boolean(SUPPLIER_TAXONOMY[familyKey]?.offerTypes);
  }, [family]);

  function handleFamilyChange(value: string) {
    setFamily(value);
    const familyKey = value as keyof typeof SUPPLIER_TAXONOMY;
    const subs = SUPPLIER_TAXONOMY[familyKey]?.subs as readonly string[] | undefined;
    // Réinitialise la sous-catégorie si elle n'appartient pas à la nouvelle famille.
    if (!subs || !subs.includes(subCategory)) {
      setSubCategory(subs?.[0] ?? "");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    formData.set("family", family);
    formData.set("subCategory", subCategory || subCategories[0] || "");

    const result = await upsertSupplierProfile(formData);
    setSubmitting(false);

    if (!result.success) {
      const mapped: Record<string, string> = {};
      const fieldErrors = "errors" in result ? (result.errors as Record<string, string[]> | undefined) : undefined;
      for (const [key, values] of Object.entries(fieldErrors || {})) {
        mapped[key] = values[0];
      }
      if ("message" in result && result.message) {
        mapped.general = result.message;
      }
      setErrors(mapped);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/annuaire/fournisseurs"), 1800);
  }

  if (success) {
    return (
      <div className="surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Fiche fournisseur enregistrée</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Elle sera visible dans l'annuaire après validation par l'administration.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface mx-auto max-w-3xl p-6">
      {errors.general && (
        <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
          {errors.general}
        </div>
      )}
      {supplier?.id && <input type="hidden" name="id" value={supplier.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Nom commercial *</label>
          <input name="name" required defaultValue={supplier?.name ?? ""} className="bento-input w-full" />
          {errors.name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Raison sociale</label>
          <input name="legalName" defaultValue={supplier?.legalName ?? ""} className="bento-input w-full" />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">SIRET</label>
          <input name="siret" defaultValue={supplier?.siret ?? ""} className="bento-input w-full" />
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Contact principal</label>
          <input name="contactName" defaultValue={supplier?.contactName ?? ""} className="bento-input w-full" />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Famille *</label>
          <select className="bento-input w-full" value={family} onChange={(event) => handleFamilyChange(event.target.value)}>
            {SUPPLIER_FAMILIES.map((option) => (
              <option key={option} value={option}>
                {getSupplierFamilyLabel(option)}
              </option>
            ))}
          </select>
          {errors.family && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.family}</p>}
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Sous-catégorie *</label>
          <select className="bento-input w-full" value={subCategory} onChange={(event) => setSubCategory(event.target.value)}>
            {subCategories.map((option) => (
              <option key={option} value={option}>
                {getSupplierSubCategoryLabel(option)}
              </option>
            ))}
          </select>
          {errors.subCategory && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.subCategory}</p>}
        </div>

        {showOfferType && (
          <div className="sm:col-span-2">
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Type d'offre (achat / location)</label>
            <select name="offerType" defaultValue={supplier?.offerType ?? ""} className="bento-input w-full">
              <option value="">Non précisé</option>
              {OFFER_TYPES.map((option) => (
                <option key={option} value={option}>
                  {getOfferTypeLabel(option)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Description</label>
          <textarea
            name="description"
            rows={5}
            defaultValue={supplier?.description ?? ""}
            className="bento-input w-full resize-none"
            placeholder="Présentation, gammes de produits, points forts..."
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Email</label>
          <input name="email" type="email" defaultValue={supplier?.email ?? ""} className="bento-input w-full" />
          {errors.email && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Téléphone</label>
          <input name="phone" defaultValue={supplier?.phone ?? ""} className="bento-input w-full" />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Site web</label>
          <input name="website" defaultValue={supplier?.website ?? ""} className="bento-input w-full" />
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Zones de livraison</label>
          <input
            name="deliveryAreas"
            defaultValue={supplier?.deliveryAreas ?? ""}
            className="bento-input w-full"
            placeholder="Ex: Île-de-France, Hauts-de-France"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            id="nationalCoverage"
            name="nationalCoverage"
            type="checkbox"
            defaultChecked={supplier?.nationalCoverage ?? false}
            className="h-4 w-4 rounded border-2 border-slate-900"
          />
          <label htmlFor="nationalCoverage" className="text-sm font-bold text-slate-700">
            Couverture nationale
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
            Services / produits (une ligne par entrée)
          </label>
          <textarea
            name="services"
            rows={4}
            defaultValue={supplier?.services ?? ""}
            className="bento-input w-full resize-none"
            placeholder={"Autolaveuse compacte\nMonobrosse haute vitesse\nContrat de maintenance"}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={submitting} className="bento-btn bento-btn-primary">
          {submitting ? "Envoi..." : <><Save size={16} /> Enregistrer et soumettre</>}
        </button>
        <Link href="/annuaire/fournisseurs" className="bento-btn">
          Annuler
        </Link>
        {supplier && supplier.verificationStatus !== "approved" && (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-700">
            <Package size={14} />
            Statut : {supplier.verificationStatus}
          </span>
        )}
      </div>
    </form>
  );
}
