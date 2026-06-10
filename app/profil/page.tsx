"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Building2,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Package,
  Plus,
  Save,
  Trash2,
  UserRound,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/page-shell";
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

const emptyProfile: EditableProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  address: "",
  city: "",
  website: "",
  avatar: null,
  photos: [],
  visibility: "private",
};

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<EditableProfile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<EditableProfile>(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const base: EditableProfile = {
      ...emptyProfile,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    };
    const data = await getUserProfile(user.id);
    const loaded: EditableProfile = data
      ? {
          firstName: data.firstName || base.firstName,
          lastName: data.lastName || base.lastName,
          email: data.email || base.email,
          phone: data.phone || base.phone,
          bio: data.bio || "",
          address: data.address || "",
          city: data.city || "",
          website: data.companies?.[0]?.website || "",
          avatar: data.avatarUrl || null,
          photos: data.photos ? JSON.parse(data.photos) : [],
          visibility: data.profile?.visibility === "public" ? "public" : "private",
        }
      : base;
    setProfile(loaded);
    setSavedProfile(loaded);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage(null);
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
      setSavedProfile(profile);
      setSaveMessage({ type: "success", text: "Profil enregistré." });
    } else {
      setSaveMessage({
        type: "error",
        text: result.message || "Impossible d'enregistrer. Vérifiez les champs et réessayez.",
      });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setSaveMessage(null);
  };

  const handleChange = (field: keyof EditableProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaveMessage(null);
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

  const handleRemovePhoto = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  if (status === "loading") {
    return (
      <PageShell eyebrow="Mon compte" title="Mon profil" description="">
        <div className="surface p-6 text-center">
          <p className="text-slate-600">Chargement de votre profil...</p>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        eyebrow="Mon compte"
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

  const organizationLabel = (() => {
    switch (user.role) {
      case "company_owner":
      case "verified_company":
        return { label: "fiche société", icon: Building2 };
      case "supplier_owner":
      case "verified_supplier":
        return { label: "fiche fournisseur", icon: Package };
      case "training_organization":
        return { label: "fiche organisme de formation", icon: GraduationCap };
      default:
        return { label: "fiche", icon: Briefcase };
    }
  })();
  const OrganizationIcon = organizationLabel.icon;

  return (
    <PageShell
      eyebrow="Mon compte"
      title="Mon profil"
      description="Ces informations alimentent votre profil membre. Vous choisissez ce qui est visible publiquement."
      actions={
        <>
          <Link href="/dashboard" className="bento-btn">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <Link href={`/membres/${user.id}`} className="bento-btn bento-btn-primary">
            <Eye size={16} /> Voir mon profil public
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 pb-28">
        {/* Identité & coordonnées */}
        <section className="surface p-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="h-20 w-20 rounded-[16px] border-2 border-slate-900 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-[16px] border-2 border-slate-900 bg-indigo-100">
                  <UserRound size={32} className="text-indigo-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 rounded-full border-2 border-slate-900 bg-white p-1.5 text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:bg-indigo-50"
                aria-label="Changer ma photo de profil"
                title="Changer ma photo de profil"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-slate-900">
                {profile.firstName || "Prénom"} {profile.lastName || "Nom"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                {user.organization ? ` · ${user.organization}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profil-firstname" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Prénom
              </label>
              <input
                id="profil-firstname"
                className="bento-input w-full"
                value={profile.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="profil-lastname" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Nom
              </label>
              <input
                id="profil-lastname"
                className="bento-input w-full"
                value={profile.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                autoComplete="family-name"
              />
            </div>
            <div>
              <label htmlFor="profil-email" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                id="profil-email"
                type="email"
                className="bento-input w-full"
                value={profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="profil-phone" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Téléphone
              </label>
              <input
                id="profil-phone"
                type="tel"
                className="bento-input w-full"
                value={profile.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="06 12 34 56 78"
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="profil-city" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Ville
              </label>
              <input
                id="profil-city"
                className="bento-input w-full"
                value={profile.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Votre ville"
                autoComplete="address-level2"
              />
            </div>
            <div>
              <label htmlFor="profil-website" className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                Site web
              </label>
              <input
                id="profil-website"
                className="bento-input w-full"
                value={profile.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="www.votresite.fr"
                autoComplete="url"
              />
            </div>
          </div>
        </section>

        {/* Présentation */}
        <section className="surface p-6">
          <h2 className="text-lg font-black text-slate-900">Présentation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quelques lignes sur votre parcours et ce que vous proposez. C&apos;est la première chose que les
            autres professionnels lisent.
          </p>
          <textarea
            id="profil-bio"
            className="bento-input mt-4 min-h-[140px] w-full resize-none"
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Exemple : Gérant d'une société de nettoyage tertiaire depuis 8 ans, spécialisé bureaux et copropriétés sur la région lyonnaise."
          />

          <div className="mt-6 border-t-2 border-slate-100 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Photos</h3>
                <p className="mt-1 text-sm text-slate-500">Chantiers, équipe, matériel… (facultatif)</p>
              </div>
              <button type="button" onClick={() => photoInputRef.current?.click()} className="bento-btn min-h-0 px-3 py-2">
                <Plus size={14} /> Ajouter
              </button>
            </div>
            {profile.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {profile.photos.map((photo, index) => (
                  <div key={index} className="group relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="h-24 w-full rounded-[12px] border-2 border-slate-900 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute -right-2 -top-2 rounded-full border-2 border-red-700 bg-red-500 p-1 text-white shadow-[2px_2px_0px_#991b1b]"
                      aria-label={`Supprimer la photo ${index + 1}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Visibilité */}
        <section className="surface p-6">
          <h2 className="text-lg font-black text-slate-900">Visibilité du profil</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleChange("visibility", "public")}
              className={`rounded-[14px] border-2 p-4 text-left transition-colors ${
                profile.visibility === "public"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-400"
              }`}
              aria-pressed={profile.visibility === "public"}
            >
              <span className="flex items-center gap-2 font-black text-slate-900">
                <Eye size={16} className="text-indigo-600" /> Public
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                Votre profil apparaît dans l&apos;annuaire des membres et sur les fiches auxquelles vous êtes
                rattaché.
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleChange("visibility", "private")}
              className={`rounded-[14px] border-2 p-4 text-left transition-colors ${
                profile.visibility === "private"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-400"
              }`}
              aria-pressed={profile.visibility === "private"}
            >
              <span className="flex items-center gap-2 font-black text-slate-900">
                <EyeOff size={16} className="text-slate-500" /> Privé
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                Seul vous (et les recruteurs que vous autorisez) pouvez voir votre profil.
              </span>
            </button>
          </div>
        </section>

        {/* Fiche organisation */}
        {hasOrganizationProfile && user.organization && (
          <section className="surface flex items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border-2 border-slate-900 bg-indigo-50">
                <OrganizationIcon size={22} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">{user.organization}</h2>
                <p className="text-sm text-slate-500">Votre {organizationLabel.label} se gère séparément.</p>
              </div>
            </div>
            <Link href="/dashboard/entreprise" className="bento-btn shrink-0">
              Gérer <ExternalLink size={14} />
            </Link>
          </section>
        )}
      </div>

      <input type="file" accept="image/*" hidden ref={avatarInputRef} onChange={handleAvatarFileChange} />
      <input type="file" accept="image/*" hidden ref={photoInputRef} onChange={handlePhotoFileChange} />

      {/* Barre de sauvegarde */}
      {(isDirty || saveMessage) && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-slate-900 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            {saveMessage ? (
              <p
                className={`flex items-center gap-2 text-sm font-bold ${
                  saveMessage.type === "success" ? "text-emerald-600" : "text-red-600"
                }`}
                role="status"
              >
                {saveMessage.type === "success" && <CheckCircle2 size={16} />}
                {saveMessage.text}
              </p>
            ) : (
              <p className="text-sm font-bold text-slate-500">Modifications non enregistrées</p>
            )}
            {isDirty && (
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={handleCancel} className="bento-btn min-h-0 px-3 py-2">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bento-btn bento-btn-primary min-h-0 px-4 py-2"
                >
                  <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
