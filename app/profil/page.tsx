"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  UserRound,
  LogOut,
  Briefcase,
  Package,
  GraduationCap,
  BadgeCheck,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  MapPin,
  Globe,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { EntityCard } from "@/components/entity-card";
import { roleLabels } from "@/lib/auth-demo";
import { updateUserProfile, getUserProfile } from "@/lib/actions/profile";

type EditableProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  website: string;
  avatar: string | null;
  photos: string[];
  visibility: "public" | "private";
};

function getProfileType(role: string) {
  const map: Record<string, string> = {
    company_owner: "Société de nettoyage",
    verified_company: "Société vérifiée",
    supplier_owner: "Fournisseur",
    verified_supplier: "Fournisseur vérifié",
    independent_profile: "Indépendant",
    candidate_profile: "Candidat",
    training_organization: "Organisme de formation",
    author: "Auteur",
    admin: "Admin",
    super_admin: "Super Admin",
  };
  return map[role] || "Profil";
}

export default function ProfilPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const user = session?.user;

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<EditableProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "Décrivez votre parcours professionnel...",
    address: "",
    city: "",
    website: "",
    avatar: null,
    photos: [],
    visibility: "private",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: "Décrivez votre parcours professionnel...",
        address: "",
        city: user.organization ? "Paris" : "",
        website: "",
        avatar: null,
        photos: [],
        visibility: "private",
      });
      getUserProfile(user.id).then((data) => {
        if (data) {
          setProfile((prev) => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            bio: data.bio || prev.bio,
            address: data.address || prev.address,
            city: data.city || prev.city,
            avatar: data.avatarUrl || prev.avatar,
            photos: data.photos ? JSON.parse(data.photos) : [],
            website: data.companies?.[0]?.website || prev.website,
            visibility: data.profile?.visibility === "public" ? "public" : "private",
          }));
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const result = await updateUserProfile({
      userId: user.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      website: profile.website,
      bio: profile.bio,
      address: profile.address,
      avatar: profile.avatar || undefined,
      photos: profile.photos,
      visibility: profile.visibility,
    });
    if (result.success) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (!user) return;
    setProfile({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: "Décrivez votre parcours professionnel...",
      address: "",
      city: user.organization ? "Paris" : "",
      website: "",
      avatar: null,
      photos: [],
      visibility: "private",
    });
    getUserProfile(user.id).then((data) => {
      if (data) {
        setProfile((prev) => ({
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          bio: data.bio || prev.bio,
          address: data.address || prev.address,
          city: data.city || prev.city,
          avatar: data.avatarUrl || prev.avatar,
          photos: data.photos ? JSON.parse(data.photos) : [],
          website: data.companies?.[0]?.website || prev.website,
          visibility: data.profile?.visibility === "public" ? "public" : "private",
        }));
      }
    });
    setIsEditing(false);
  };

  const handleChange = (field: keyof EditableProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = () => {
    photoInputRef.current?.click();
  };

  const handleRemovePhoto = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleAvatarChange = () => {
    avatarInputRef.current?.click();
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

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setProfile((prev) => ({ ...prev, avatar: url }));
    e.target.value = "";
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setProfile((prev) => ({ ...prev, photos: [...prev.photos, url] }));
    e.target.value = "";
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <PageShell eyebrow="Profil" title="Chargement..." description="">
        <div className="surface p-6 text-center">
          <p className="text-slate-600">Chargement de votre profil...</p>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        eyebrow="Profil"
        title="Non connecté"
        description="Connectez-vous pour accéder à votre profil."
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

  const hasOrganizationProfile = [
    "company_owner",
    "verified_company",
    "supplier_owner",
    "verified_supplier",
    "training_organization",
  ].includes(user.role);

  const getProfileTitle = () => {
    switch (user.role) {
      case "company_owner":
      case "verified_company":
        return "Profil entreprise";
      case "supplier_owner":
      case "verified_supplier":
        return "Profil fournisseur";
      case "training_organization":
        return "Profil organisme";
      default:
        return "Profil professionnel";
    }
  };

  const getProfileIcon = () => {
    switch (user.role) {
      case "company_owner":
      case "verified_company":
        return <Building2 className="text-indigo-600" size={24} />;
      case "supplier_owner":
      case "verified_supplier":
        return <Package className="text-indigo-600" size={24} />;
      case "training_organization":
        return <GraduationCap className="text-indigo-600" size={24} />;
      default:
        return <Briefcase className="text-indigo-600" size={24} />;
    }
  };

  if (showPreview) {
    return (
      <PageShell
        eyebrow="Aperçu"
        title="Votre profil public"
        description="Voici comment les autres utilisateurs voient votre profil."
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
        <div className="max-w-3xl mx-auto">
          <div className="surface p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-32 rounded-[20px] border-4 border-slate-900 object-cover shadow-[4px_4px_0px_#0f172a]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-[20px] border-4 border-slate-900 bg-indigo-100 flex items-center justify-center shadow-[4px_4px_0px_#0f172a]">
                    <UserRound size={48} className="text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-black text-slate-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-lg text-slate-500 mt-1">{roleLabels[user.role as keyof typeof roleLabels] || user.role}</p>
                {user.organization && <p className="text-indigo-600 font-bold mt-2">{user.organization}</p>}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <BadgeCheck className="text-emerald-500" size={20} />
                  <span className="text-emerald-600 font-bold">Profil vérifié</span>
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-3">À propos</h3>
                <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {profile.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-indigo-600" size={20} />
                  <span className="text-slate-700">{profile.city}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="text-indigo-600" size={20} />
                  <a href={`mailto:${encodeURIComponent(profile.email)}`} className="text-slate-700 hover:text-indigo-600">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-indigo-600" size={20} />
                  <a href={`tel:${encodeURIComponent(profile.phone.replace(/\s/g, ""))}`} className="text-slate-700 hover:text-indigo-600">
                    {profile.phone}
                  </a>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-3">
                  <Globe className="text-indigo-600" size={20} />
                  <a
                    href={`https://${profile.website.replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-indigo-600"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            {profile.photos.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">Galerie</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {profile.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-40 object-cover rounded-[14px] border-2 border-slate-900"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Mon compte"
      title={`Bonjour, ${profile.firstName}`}
      description="Gérez vos informations personnelles et votre profil professionnel."
      actions={
        <>
          <button onClick={() => setShowPreview(true)} className="bento-btn">
            <Eye size={16} /> Aperçu
          </button>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bento-btn bento-btn-primary">
              <Edit3 size={16} /> Modifier
            </button>
          ) : (
            <button onClick={handleLogout} className="bento-btn">
              <LogOut size={16} /> Déconnexion
            </button>
          )}
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Profil" value={roleLabels[user.role as keyof typeof roleLabels] || user.role} detail={getProfileType(user.role)} />
        <StatCard label="Association" value={user.associationMember ? "Membre" : "Non membre"} detail={user.associationMember ? "Accès complet" : "Adhésion possible"} />
        <StatCard label="Visibilité" value={profile.visibility === "public" ? "Public" : "Privé"} detail="Profil membre" />
        <StatCard label="Photos" value={String(profile.photos.length)} detail="Dans la galerie" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="surface p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
                <Camera size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Photo de profil</h2>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-32 rounded-[20px] border-4 border-slate-900 object-cover shadow-[4px_4px_0px_#0f172a]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-[20px] border-4 border-slate-900 bg-indigo-100 flex items-center justify-center shadow-[4px_4px_0px_#0f172a]">
                    <UserRound size={48} className="text-indigo-600" />
                  </div>
                )}
                {isEditing && (
                  <button onClick={handleAvatarChange} className="absolute -bottom-2 -right-2 bento-btn bento-btn-primary p-2">
                    <Camera size={16} />
                  </button>
                )}
              </div>
              {isEditing && <p className="text-sm text-slate-500 text-center">Cliquez sur l'icône pour changer votre photo</p>}
            </div>
          </div>

          <div className="surface p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
                <UserRound size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Informations personnelles</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Prénom</label>
                  <input className="bento-input w-full" value={profile.firstName} onChange={(e) => handleChange("firstName", e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Nom</label>
                  <input className="bento-input w-full" value={profile.lastName} onChange={(e) => handleChange("lastName", e.target.value)} disabled={!isEditing} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Mail size={12} className="inline mr-1" /> Email
                </label>
                <input className="bento-input w-full" value={profile.email} onChange={(e) => handleChange("email", e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Phone size={12} className="inline mr-1" /> Téléphone
                </label>
                <input className="bento-input w-full" value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} disabled={!isEditing} placeholder="Votre numéro de téléphone" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <MapPin size={12} className="inline mr-1" /> Ville
                </label>
                <input className="bento-input w-full" value={profile.city} onChange={(e) => handleChange("city", e.target.value)} disabled={!isEditing} placeholder="Votre ville" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Globe size={12} className="inline mr-1" /> Site web
                </label>
                <input className="bento-input w-full" value={profile.website} onChange={(e) => handleChange("website", e.target.value)} disabled={!isEditing} placeholder="www.votresite.com" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Eye size={12} className="inline mr-1" /> Visibilité du profil
                </label>
                <select
                  className="bento-input w-full"
                  value={profile.visibility}
                  onChange={(e) => handleChange("visibility", e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
                <FileText size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Biographie</h2>
            </div>
            <textarea
              className="bento-input w-full min-h-[150px] resize-none"
              value={profile.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              disabled={!isEditing}
              placeholder="Décrivez votre parcours, vos compétences et ce que vous proposez..."
            />
          </div>

          <div className="surface p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
                  <Camera size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Galerie photos</h2>
              </div>
              {isEditing && (
                <button onClick={handleAddPhoto} className="bento-btn bento-btn-primary p-2">
                  <Plus size={16} />
                </button>
              )}
            </div>
            {profile.photos.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-[14px]">
                <Camera size={32} className="text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">Aucune photo pour le moment</p>
                {isEditing && (
                  <button onClick={handleAddPhoto} className="bento-btn bento-btn-primary mt-4">
                    <Plus size={16} className="mr-2" /> Ajouter une photo
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {profile.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-[14px] border-2 border-slate-900" />
                    {isEditing && (
                      <button onClick={() => handleRemovePhoto(index)} className="absolute -top-2 -right-2 bento-btn bg-red-500 text-white p-1 border-red-600 shadow-[2px_2px_0px_#991b1b]">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasOrganizationProfile && user.organization && (
            <EntityCard title={getProfileTitle()} subtitle={user.organization} meta={[user.associationMember ? "✓ Membre vérifié" : "Profil actif"]}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600">
                  <BadgeCheck size={16} />
                  <span className="text-sm font-bold">Profil vérifié</span>
                </div>
                {getProfileIcon()}
              </div>
              <Link href="/dashboard/entreprise" className="bento-btn bento-btn-primary w-full mt-4 block text-center">
                Gérer mon {getProfileTitle().toLowerCase()}
              </Link>
            </EntityCard>
          )}

          {isEditing && (
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="bento-btn bento-btn-primary flex-1">
                <Save size={16} className="mr-2" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button onClick={handleCancel} className="bento-btn flex-1">
                <X size={16} className="mr-2" /> Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        hidden
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
      />
      <input
        type="file"
        accept="image/*"
        hidden
        ref={photoInputRef}
        onChange={handlePhotoFileChange}
      />

      {!isEditing && (
        <div className="mt-8 flex justify-start">
          <Link href="/dashboard" className="bento-btn">
            <ArrowLeft size={16} />
            Retour au dashboard
          </Link>
        </div>
      )}
    </PageShell>
  );
}
