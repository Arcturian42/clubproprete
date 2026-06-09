import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Globe,
  Mail,
  Package,
  Phone
} from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { getSupplierById } from "@/lib/actions/public";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier || supplier.verificationStatus !== "approved") {
    notFound();
  }

  const specialties = supplier.services.map((s) => s.title);
  const coverage = supplier.nationalCoverage ? "National" : supplier.deliveryAreas || "Local";

  return (
    <PageShell
      eyebrow="Fournisseur"
      title={supplier.name}
      description={`${supplier.category} · ${coverage}`}
      actions={
        <Link href="/annuaire/fournisseurs" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux fournisseurs
        </Link>
      }
    >
      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Categorie" value={supplier.category} detail="Specialite" />
        <StatCard label="Couverture" value={coverage} detail="Zone d'intervention" />
        <StatCard label="Contact" value={supplier.contactName || "Non précisé"} detail="Interlocuteur" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Description */}
          <article className="surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                <Package size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">A propos</h2>
            </div>
            <p className="text-base font-medium leading-7 text-slate-600">
              {supplier.name} est un fournisseur specialise dans la categorie &ldquo;{supplier.category}&rdquo;. 
              Il intervient sur {coverage}.
            </p>
            
            {specialties.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Specialites</p>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <span key={specialty} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Infos pratiques */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Nom</p>
                  <p className="font-bold text-slate-900">{supplier.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="text-indigo-600 shrink-0" size={20} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Couverture</p>
                  <p className="font-bold text-slate-900">{coverage}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <BadgeCheck className="text-emerald-500" size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Statut</p>
                  <p className="text-sm text-slate-500">Fournisseur verifie</p>
                </div>
              </div>
            </div>
          </article>

          {/* Contact */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Contact</h2>
            <div className="space-y-3">
              {supplier.email ? (
                <a href={`mailto:${encodeURIComponent(supplier.email)}`} className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors">
                  <Mail size={18} />
                  <span className="font-medium">{supplier.email}</span>
                </a>
              ) : (
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail size={18} />
                  <span className="font-medium">Contact via Club Propreté</span>
                </div>
              )}
              {supplier.phone ? (
                <a href={`tel:${encodeURIComponent(supplier.phone.replace(/\s/g, ""))}`} className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors">
                  <Phone size={18} />
                  <span className="font-medium">{supplier.phone}</span>
                </a>
              ) : (
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone size={18} />
                  <span className="font-medium">Disponible sur demande</span>
                </div>
              )}
            </div>
          </article>

          {/* CTA */}
          <div className="surface p-6 bg-indigo-50 border-indigo-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Interesse ?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Contactez {supplier.name} pour obtenir un devis ou plus d'informations.
            </p>
            <Link href="/inscription" className="bento-btn bento-btn-primary w-full block text-center">
              <Mail size={16} className="inline mr-2" /> Envoyer une demande
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
