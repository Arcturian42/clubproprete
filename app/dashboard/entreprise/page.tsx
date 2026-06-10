"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  BadgeCheck,
  Users,
  Clock,
  Star,
  Plus,
  Trash2,
  Briefcase,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { EntityCard } from "@/components/entity-card";
import { createCompanyProfile, getCompanyByOwner, updateCompanyProfile } from "@/lib/actions/companies";
import { getApplicationsForCompany } from "@/lib/actions/jobs";

type CompanyProfile = {
  name: string;
  legalName: string;
  siret: string;
  description: string;
  shortDesc: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postalCode: string;
  employeeCount: string;
  services: string[];
  logo: string | null;
  photos: string[];
  foundedYear: string;
  clients: string[];
};

const serviceOptions = [
  "Bureaux", "Copropriétés", "Commerce", "Industriel",
  "Vitrerie", "Remise en état", "Fin de chantier", "Désinfection",
];

const employeeOptions = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function EntrepriseProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newService, setNewService] = useState("");
  const [newClient, setNewClient] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Awaited<ReturnType<typeof getApplicationsForCompany>>["applications"] | null>(null);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const user = session?.user;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<CompanyProfile>({
    name: "",
    legalName: "",
    siret: "",
    description: "",
    shortDesc: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    postalCode: "",
    employeeCount: "11-50",
    services: [],
    logo: null,
    photos: [],
    foundedYear: "",
    clients: [],
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.push("/connexion");
      return;
    }
    const loadCompany = async () => {
      const company = await getCompanyByOwner(user.id);
      if (company) {
        setCompanyId(company.id);
        setProfile({
          name: company.name || "",
          legalName: company.legalName || "",
          siret: company.siret || "",
          description: company.descriptionLong || "",
          shortDesc: company.descriptionShort || "",
          email: company.email || "",
          phone: company.phone || "",
          website: company.website || "",
          address: company.address || "",
          city: company.city || "",
          postalCode: company.postalCode || "",
          employeeCount: company.employeeCount || "11-50",
          services: company.services.map((s) => s.serviceType),
          logo: company.logoUrl || null,
          photos: company.photos ? JSON.parse(company.photos) : [],
          foundedYear: company.foundedAt ? String(company.foundedAt.getFullYear()) : "",
          clients: company.clientTypes.map((c) => c.clientType),
        });
      } else {
        setProfile({
          name: user.organization || "Mon Entreprise",
          legalName: user.organization || "Mon Entreprise SARL",
          siret: "",
          description: "Description de votre entreprise de nettoyage professionnel...",
          shortDesc: "Entreprise de propreté spécialisée",
          email: user.email || "",
          phone: "",
          website: "",
          address: "",
          city: "",
          postalCode: "",
          employeeCount: "11-50",
          services: [],
          logo: null,
          photos: [],
          foundedYear: "",
          clients: [],
        });
      }
      setIsLoading(false);
    };
    loadCompany();
  }, [user, status, router]);

  useEffect(() => {
    if (!companyId) return;
    const loadApplications = async () => {
      setApplicationsLoading(true);
      const result = await getApplicationsForCompany(companyId);
      if (result.success) {
        setApplications(result.applications);
      }
      setApplicationsLoading(false);
    };
    loadApplications();
  }, [companyId]);

  const handleSave = async () => {
    const payload = {
      name: profile.name,
      legalName: profile.legalName,
      siret: profile.siret,
      descriptionShort: profile.shortDesc,
      descriptionLong: profile.description,
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      address: profile.address,
      city: profile.city,
      postalCode: profile.postalCode,
      employeeCount: profile.employeeCount,
      foundedYear: profile.foundedYear,
      logo: profile.logo || undefined,
      photos: profile.photos,
      services: profile.services,
      clients: profile.clients,
    };
    const result = companyId
      ? await updateCompanyProfile({ id: companyId, ...payload })
      : await createCompanyProfile(payload);
    if (result.success) {
      if (!companyId && "company" in result && result.company) {
        setCompanyId(result.company.id);
      }
      setIsEditing(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    const company = await getCompanyByOwner(user.id);
    if (company) {
      setCompanyId(company.id);
      setProfile({
        name: company.name || "",
        legalName: company.legalName || "",
        siret: company.siret || "",
        description: company.descriptionLong || "",
        shortDesc: company.descriptionShort || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        address: company.address || "",
        city: company.city || "",
        postalCode: company.postalCode || "",
        employeeCount: company.employeeCount || "11-50",
        services: company.services.map((s) => s.serviceType),
        logo: company.logoUrl || null,
        photos: company.photos ? JSON.parse(company.photos) : [],
        foundedYear: company.foundedAt ? String(company.foundedAt.getFullYear()) : "",
        clients: company.clientTypes.map((c) => c.clientType),
      });
    }
    setIsEditing(false);
  };

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddService = () => {
    if (newService && !profile.services.includes(newService)) {
      setProfile((prev) => ({ ...prev, services: [...prev.services, newService] }));
      setNewService("");
    }
  };

  const handleRemoveService = (service: string) => {
    setProfile((prev) => ({ ...prev, services: prev.services.filter((s) => s !== service) }));
  };

  const handleAddClient = () => {
    if (newClient && !profile.clients.includes(newClient)) {
      setProfile((prev) => ({ ...prev, clients: [...prev.clients, newClient] }));
      setNewClient("");
    }
  };

  const handleRemoveClient = (client: string) => {
    setProfile((prev) => ({ ...prev, clients: prev.clients.filter((c) => c !== client) }));
  };

  const handleRemovePhoto = (index: number) => {
    setProfile((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) return data.url;
      return null;
    } catch {
      return null;
    }
  };

  const handleLogoChange = () => {
    logoInputRef.current?.click();
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setProfile((prev) => ({ ...prev, logo: url }));
    e.target.value = "";
  };

  const handleAddPhoto = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setProfile((prev) => ({ ...prev, photos: [...prev.photos, url] }));
    e.target.value = "";
  };

  if (isLoading || status === "loading") {
    return (
      <PageShell eyebrow="Entreprise" title="Chargement..." description="">
        <div className="surface p-6 text-center">
          <p className="text-slate-600">Chargement du profil...</p>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        eyebrow="Entreprise"
        title="Non connecté"
        description="Connectez-vous pour accéder à votre profil entreprise."
        actions={
          <Link href="/connexion" className="bento-btn bento-btn-primary">
            Connexion
          </Link>
        }
      >
        <div className="surface p-6 text-center">
          <p className="text-slate-600">Vous devez être connecté pour voir cette page.</p>
        </div>
      </PageShell>
    );
  }

  if (showPreview) {
    return (
      <PageShell
        eyebrow="Aperçu"
        title={profile.name}
        description="Voici comment les autres utilisateurs voient votre entreprise."
        actions={
          <>
            <button onClick={() => setShowPreview(false)} className="bento-btn">
              <Edit3 size={16} /> Modifier
            </button>
            <Link href="/dashboard" className="bento-btn bento-btn-primary">
              Retour
            </Link>
          </>
        }
      >
        <div className="max-w-4xl mx-auto">
          <div className="surface p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                {profile.logo ? (
                  <img src={profile.logo} alt="Logo" className="w-32 h-32 rounded-[20px] border-4 border-slate-900 object-cover shadow-[4px_4px_0px_#0f172a]" />
                ) : (
                  <div className="w-32 h-32 rounded-[20px] border-4 border-slate-900 bg-indigo-100 flex items-center justify-center shadow-[4px_4px_0px_#0f172a]">
                    <Building2 size={48} className="text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-black text-slate-900">{profile.name}</h1>
                  <BadgeCheck className="text-emerald-500" size={24} />
                </div>
                <p className="text-lg text-slate-500 mb-4">{profile.shortDesc}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {profile.city && <span className="flex items-center gap-1 text-slate-600"><MapPin size={16} className="text-indigo-600" /> {profile.city}</span>}
                  {profile.employeeCount && <span className="flex items-center gap-1 text-slate-600"><Users size={16} className="text-indigo-600" /> {profile.employeeCount} salariés</span>}
                  {profile.foundedYear && <span className="flex items-center gap-1 text-slate-600"><Clock size={16} className="text-indigo-600" /> Créée en {profile.foundedYear}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="surface p-6">
                <h2 className="text-xl font-black text-slate-900 mb-4">À propos</h2>
                <p className="text-slate-600 leading-relaxed">{profile.description}</p>
              </div>
              <div className="surface p-6">
                <h2 className="text-xl font-black text-slate-900 mb-4">Services proposés</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((service) => (
                    <span key={service} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                      <CheckCircle2 size={12} className="mr-1" /> {service}
                    </span>
                  ))}
                </div>
              </div>
              {profile.photos.length > 0 && (
                <div className="surface p-6">
                  <h2 className="text-xl font-black text-slate-900 mb-4">Galerie</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profile.photos.map((photo, index) => (
                      <img key={index} src={photo} alt={`Réalisation ${index + 1}`} className="w-full h-48 object-cover rounded-[14px] border-2 border-slate-900" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="surface p-6">
                <h2 className="text-lg font-black text-slate-900 mb-4">Contact</h2>
                <div className="space-y-3">
                  {profile.email && <a href={`mailto:${encodeURIComponent(profile.email)}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"><Mail size={18} /> {profile.email}</a>}
                  {profile.phone && <a href={`tel:${encodeURIComponent(profile.phone.replace(/\s/g, ""))}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"><Phone size={18} /> {profile.phone}</a>}
                  {profile.website && <a href={`https://${profile.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"><Globe size={18} /> {profile.website}</a>}
                  {profile.address && <p className="flex items-center gap-2 text-slate-600"><MapPin size={18} /> {profile.address}, {profile.postalCode} {profile.city}</p>}
                </div>
              </div>
              {profile.clients.length > 0 && (
                <div className="surface p-6">
                  <h2 className="text-lg font-black text-slate-900 mb-4">Types de clients</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.clients.map((client) => (
                      <span key={client} className="bento-tag border-amber-200 bg-amber-50 text-amber-700"><Star size={12} className="mr-1" /> {client}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="surface p-6 bg-indigo-50 border-indigo-200">
                <h3 className="text-lg font-black text-slate-900 mb-2">Intéressé ?</h3>
                <p className="text-sm text-slate-600 mb-4">Contactez {profile.name} pour un devis ou plus d'informations.</p>
                <a href={`mailto:${encodeURIComponent(profile.email)}`} className="bento-btn bento-btn-primary w-full block text-center">
                  <Mail size={16} className="inline mr-2" /> Contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Mon entreprise"
      title={profile.name}
      description="Gérez la fiche de votre entreprise et son visibilité."
      actions={
        <>
          <button onClick={() => setShowPreview(true)} className="bento-btn">
            <Eye size={16} /> Aperçu
          </button>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bento-btn bento-btn-primary">
              <Edit3 size={16} /> Modifier
            </button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Services" value={String(profile.services.length)} detail="Proposés" />
        <StatCard label="Photos" value={String(profile.photos.length)} detail="Dans la galerie" />
        <StatCard label="Clients" value={String(profile.clients.length)} detail="Types servis" />
        <StatCard label="Effectif" value={profile.employeeCount} detail="Salariés" />
      </div>

      <div className="mt-6 surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Candidatures reçues</h2>
          <Link href="/dashboard/entreprise/offres" className="bento-btn">
            Voir mes offres
          </Link>
        </div>
        {applicationsLoading ? (
          <p className="text-slate-600">Chargement des candidatures...</p>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-2 border-slate-200 rounded-[14px]">
                <div>
                  <p className="font-bold text-slate-900">
                    {app.candidateProfile?.user?.id ? (
                      <Link
                        href={`/membres/${app.candidateProfile.user.id}`}
                        className="hover:text-indigo-600 hover:underline"
                      >
                        {app.candidateProfile.user.firstName ?? ""} {app.candidateProfile.user.lastName ?? ""}
                      </Link>
                    ) : (
                      <>
                        {app.candidateProfile?.user?.firstName ?? ""} {app.candidateProfile?.user?.lastName ?? ""}
                      </>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">Offre : {app.job?.title}</p>
                  <span className="inline-block mt-1 bento-tag border-slate-300 bg-slate-50 text-slate-700">{app.status}</span>
                </div>
                <p className="text-sm text-slate-500 shrink-0">
                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString("fr-FR") : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Aucune candidature pour le moment.</p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="surface p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]"><Camera size={22} /></div>
              <h2 className="text-xl font-black text-slate-900">Logo</h2>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profile.logo ? (
                  <img src={profile.logo} alt="Logo" className="w-32 h-32 rounded-[20px] border-4 border-slate-900 object-cover shadow-[4px_4px_0px_#0f172a]" />
                ) : (
                  <div className="w-32 h-32 rounded-[20px] border-4 border-slate-900 bg-indigo-100 flex items-center justify-center shadow-[4px_4px_0px_#0f172a]">
                    <Building2 size={48} className="text-indigo-600" />
                  </div>
                )}
                {isEditing && (
                  <button onClick={handleLogoChange} className="absolute -bottom-2 -right-2 bento-btn bento-btn-primary p-2">
                    <Camera size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]"><Building2 size={22} /></div>
              <h2 className="text-xl font-black text-slate-900">Informations</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Nom commercial</label>
                <input className="bento-input w-full" value={profile.name} onChange={(e) => handleChange("name", e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Forme juridique</label>
                <input className="bento-input w-full" value={profile.legalName} onChange={(e) => handleChange("legalName", e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">SIRET</label>
                <input className="bento-input w-full" value={profile.siret} onChange={(e) => handleChange("siret", e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Effectif</label>
                <select className="bento-input w-full" value={profile.employeeCount} onChange={(e) => handleChange("employeeCount", e.target.value)} disabled={!isEditing}>
                  {employeeOptions.map((opt) => <option key={opt} value={opt}>{opt} salariés</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Année de création</label>
                <input className="bento-input w-full" value={profile.foundedYear} onChange={(e) => handleChange("foundedYear", e.target.value)} disabled={!isEditing} placeholder="2010" />
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-3 text-white shadow-[3px_3px_0px_#0f172a]"><Mail size={22} /></div>
              <h2 className="text-xl font-black text-slate-900">Contact</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Email</label>
                <input className="bento-input w-full" value={profile.email} onChange={(e) => handleChange("email", e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Téléphone</label>
                <input className="bento-input w-full" value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Site web</label>
                <input className="bento-input w-full" value={profile.website} onChange={(e) => handleChange("website", e.target.value)} disabled={!isEditing} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]"><FileText size={22} /></div>
              <h2 className="text-xl font-black text-slate-900">Description</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Accroche (courte)</label>
                <input className="bento-input w-full" value={profile.shortDesc} onChange={(e) => handleChange("shortDesc", e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Description complète</label>
                <textarea className="bento-input w-full min-h-[200px] resize-none" value={profile.description} onChange={(e) => handleChange("description", e.target.value)} disabled={!isEditing} />
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]"><Briefcase size={22} /></div>
                <h2 className="text-xl font-black text-slate-900">Services</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.services.map((service) => (
                <span key={service} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                  {service}
                  {isEditing && <button onClick={() => handleRemoveService(service)} className="ml-2 text-red-500 hover:text-red-700"><X size={12} /></button>}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <select className="bento-input flex-1" value={newService} onChange={(e) => setNewService(e.target.value)}>
                  <option value="">Ajouter un service...</option>
                  {serviceOptions.filter((s) => !profile.services.includes(s)).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button onClick={handleAddService} className="bento-btn bento-btn-primary" disabled={!newService}><Plus size={16} /></button>
              </div>
            )}
          </div>

          <div className="surface p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]"><Camera size={22} /></div>
                <h2 className="text-xl font-black text-slate-900">Galerie photos</h2>
              </div>
              {isEditing && <button onClick={handleAddPhoto} className="bento-btn bento-btn-primary p-2"><Plus size={16} /></button>}
            </div>
            {profile.photos.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-[14px]">
                <Camera size={32} className="text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">Aucune photo pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {profile.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt={`Réalisation ${index + 1}`} className="w-full h-32 object-cover rounded-[14px] border-2 border-slate-900" />
                    {isEditing && <button onClick={() => handleRemovePhoto(index)} className="absolute -top-2 -right-2 bento-btn bg-red-500 text-white p-1 border-red-600 shadow-[2px_2px_0px_#991b1b]"><Trash2 size={14} /></button>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">Types de clients</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.clients.map((client) => (
                <span key={client} className="bento-tag border-amber-200 bg-amber-50 text-amber-700">
                  <Star size={12} className="mr-1" /> {client}
                  {isEditing && <button onClick={() => handleRemoveClient(client)} className="ml-2 text-red-500 hover:text-red-700"><X size={12} /></button>}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input className="bento-input flex-1" value={newClient} onChange={(e) => setNewClient(e.target.value)} placeholder="Nouveau type de client..." />
                <button onClick={handleAddClient} className="bento-btn bento-btn-primary" disabled={!newClient}><Plus size={16} /></button>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3">
              <button onClick={handleSave} className="bento-btn bento-btn-primary flex-1"><Save size={16} className="mr-2" /> Sauvegarder</button>
              <button onClick={handleCancel} className="bento-btn flex-1"><X size={16} className="mr-2" /> Annuler</button>
            </div>
          )}
        </div>
      </div>

      <input type="file" accept="image/*" hidden ref={logoInputRef} onChange={handleLogoFileChange} />
      <input type="file" accept="image/*" hidden ref={photoInputRef} onChange={handlePhotoFileChange} />

      {!isEditing && (
        <div className="mt-8 flex justify-start">
          <Link href="/dashboard" className="bento-btn"><ArrowLeft size={16} /> Retour au dashboard</Link>
        </div>
      )}
    </PageShell>
  );
}
