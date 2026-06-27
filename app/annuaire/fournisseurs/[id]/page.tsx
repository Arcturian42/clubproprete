import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Globe,
  Mail,
  Package,
  Phone,
  UsersRound,
  UserRound,
} from "lucide-react";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { auth } from "@/auth";
import { getSupplierById, getEntityMembers } from "@/lib/actions/public";
import {
  getOfferTypeLabel,
  getSupplierFamilyLabel,
  getSupplierSubCategoryLabel,
} from "@/lib/supplier-taxonomy";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, getBaseUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

function externalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supplier = await getSupplierById(id);
  if (!supplier) {
    return { title: "Fournisseur introuvable" };
  }
  const description =
    supplier.description ||
    `Fiche de ${supplier.name}, fournisseur vérifié pour les professionnels du nettoyage.`;
  const title = `${supplier.name} — Fournisseur propreté`;
  return {
    title,
    description,
    alternates: { canonical: `/annuaire/fournisseurs/${supplier.slug ?? id}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `${getBaseUrl()}/annuaire/fournisseurs/${supplier.slug ?? id}`,
    },
  };
}

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params;
  const [supplier, session] = await Promise.all([getSupplierById(id), auth()]);
  const isLoggedIn = Boolean(session?.user);

  if (!supplier || supplier.verificationStatus !== "approved") {
    notFound();
  }

  const members = await getEntityMembers("supplier", supplier.id);

  const specialties = supplier.services.map((s) => s.title);
  const coverage = supplier.nationalCoverage ? "National" : supplier.deliveryAreas || "Local";
  const familyLabel = getSupplierFamilyLabel(supplier.family);
  const subCategoryLabel = getSupplierSubCategoryLabel(supplier.subCategory ?? supplier.category);
  const offerTypeLabel = getOfferTypeLabel(supplier.offerType);
  const taxonomyLabel = offerTypeLabel
    ? `${familyLabel} · ${subCategoryLabel} · ${offerTypeLabel}`
    : `${familyLabel} · ${subCategoryLabel}`;

  const baseUrl = getBaseUrl();
  const supplierUrl = `${baseUrl}/annuaire/fournisseurs/${supplier.slug ?? supplier.id}`;
  // Donnée structurée Organization : identifie le fournisseur, son offre et sa
  // zone de couverture pour les moteurs (SEO) et les IA génératives (AEO/GEO).
  const supplierJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${supplierUrl}#supplier`,
    name: supplier.name,
    description: supplier.description || `${supplier.name} — ${taxonomyLabel}`,
    url: supplierUrl,
    ...(supplier.logoUrl?.startsWith("http") ? { logo: supplier.logoUrl } : {}),
    ...(supplier.email ? { email: supplier.email } : {}),
    ...(supplier.phone ? { telephone: supplier.phone } : {}),
    ...(supplier.website ? { sameAs: [externalUrl(supplier.website)] } : {}),
    areaServed: supplier.nationalCoverage
      ? { "@type": "Country", name: "France" }
      : supplier.deliveryAreas || "France",
    ...(specialties.length > 0 ? { knowsAbout: specialties } : {}),
  };

  return (
    <PageShell
      eyebrow="Fournisseur"
      title={supplier.name}
      description={`${taxonomyLabel} · ${coverage}`}
      actions={
        <Link href="/annuaire/fournisseurs" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux fournisseurs
        </Link>
      }
    >
      <JsonLd
        data={[
          supplierJsonLd,
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Fournisseurs", path: "/annuaire/fournisseurs" },
            { name: supplier.name, path: `/annuaire/fournisseurs/${supplier.slug ?? supplier.id}` },
          ]),
        ]}
      />
      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Famille" value={familyLabel} detail={subCategoryLabel} />
        <StatCard label="Couverture" value={coverage} detail="Zone d'intervention" />
        <StatCard label="Offre" value={offerTypeLabel || "Non précisé"} detail="Type d'offre" />
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
              <h2 className="text-xl font-black text-slate-900">À propos</h2>
            </div>
            <p className="text-base font-medium leading-7 text-slate-600">
              {supplier.name} est un fournisseur spécialisé dans &ldquo;{taxonomyLabel}&rdquo;.
              Il intervient sur {coverage}.
            </p>
            
            {specialties.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Spécialités</p>
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
                  <p className="text-sm text-slate-500">Fournisseur vérifié</p>
                </div>
              </div>
            </div>
          </article>

          {/* Contact */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Contact</h2>
            {!isLoggedIn ? (
              <div>
                <p className="text-sm text-slate-600">
                  Les coordonnées des fournisseurs sont réservées aux membres connectés.
                </p>
                <Link href="/connexion" className="bento-btn bento-btn-primary mt-4 w-full block text-center">
                  Se connecter pour voir les coordonnées
                </Link>
              </div>
            ) : (
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
            )}
          </article>

          {/* CTA */}
          <div className="surface p-6 bg-indigo-50 border-indigo-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Intéressé ?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Contactez {supplier.name} pour obtenir un devis ou plus d'informations.
            </p>
            <Link href="/inscription" className="bento-btn bento-btn-primary w-full block text-center">
              <Mail size={16} className="inline mr-2" /> Envoyer une demande
            </Link>
          </div>
        </div>
      </div>

      {/* Équipe */}
      <div className="surface mt-8 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <UsersRound size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Équipe</h2>
            <p className="mt-1 text-sm text-slate-500">
              {members.length > 0
                ? `${members.length} ${members.length > 1 ? "membres actifs" : "membre actif"} chez ce fournisseur.`
                : "Aucun membre public pour le moment."}
            </p>
          </div>
        </div>

        {members.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const isPublic = member.user.profile?.visibility === "public";
              const roleLabels: Record<string, string> = {
                owner: "Propriétaire",
                admin: "Administrateur",
                recruiter: "Recruteur",
                member: "Membre",
              };

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-[14px] border-2 border-slate-200 bg-white"
                >
                  {member.user.avatarUrl ? (
                    <Image
                      src={member.user.avatarUrl}
                      alt={`${member.user.firstName} ${member.user.lastName}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center">
                      <UserRound size={18} className="text-indigo-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    {isPublic ? (
                      <Link
                        href={`/membres/${member.user.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                      >
                        {member.user.firstName} {member.user.lastName}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-900 truncate block">
                        {member.user.firstName} {member.user.lastName}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{roleLabels[member.role] || member.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
