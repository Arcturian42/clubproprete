"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { profileOptions } from "@/lib/auth-demo";
import type { Role } from "@/lib/types";
import { registerUser } from "@/lib/actions/auth";

type SignupFormProps = {
  defaultRole?: Role;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rolesWithRequiredStructure: Role[] = ["company_owner", "supplier_owner", "training_organization"];

function getStructureLabel(role: Role) {
  if (role === "candidate_profile") return "Ville / zone de recherche";
  if (role === "independent_profile") return "Ville / nom commercial";
  if (role === "author") return "Spécialité / média";
  if (role === "supplier_owner") return "Nom du fournisseur";
  if (role === "training_organization") return "Nom de l'organisme";
  return "Société / structure";
}

function getDemoStructure(role: Role) {
  if (role === "candidate_profile") return "Paris";
  if (role === "independent_profile") return "Karim Services Propreté";
  if (role === "supplier_owner") return "EcoMatériel QA";
  if (role === "training_organization") return "Institut Hygiène QA";
  if (role === "author") return "Ressources terrain";
  return "Nouvelle Propreté QA";
}

export function SignupForm({ defaultRole = "company_owner" }: SignupFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(defaultRole);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedProfile = useMemo(
    () => profileOptions.find((option) => option.role === role) ?? profileOptions[0],
    [role]
  );
  const requiresStructure = rolesWithRequiredStructure.includes(role);

  useEffect(() => {
    const queryRole = new URLSearchParams(window.location.search).get("role") as Role | null;
    if (queryRole && profileOptions.some((option) => option.role === queryRole)) {
      setRole(queryRole);
    }
  }, []);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "Le prénom est obligatoire.";
    if (!lastName.trim()) nextErrors.lastName = "Le nom est obligatoire.";
    if (!email.trim()) {
      nextErrors.email = "L'email est obligatoire.";
    } else if (!emailRegex.test(email)) {
      nextErrors.email = "Veuillez saisir un email valide.";
    }
    if (!password || password.length < 6) {
      nextErrors.pwdError = "Saisissez au moins 6 caractères.";
    }
    if (requiresStructure && !organization.trim()) {
      nextErrors.organization = "La structure est obligatoire pour ce profil.";
    }
    if (!termsAccepted) nextErrors.terms = "Vous devez accepter les conditions.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function fillExample() {
    const timestamp = Date.now();
    setFirstName("Camille");
    setLastName("Dupont");
    setEmail(`qa-${role}-${timestamp}@clubproprete.test`);
    setPassword("demo123");
    setPhone("0600000000");
    setOrganization(getDemoStructure(role));
    setTermsAccepted(true);
    setErrors({});
  }

  async function submitSignup() {
    if (!validate()) return;
    setLoading(true);

    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      organization,
      role: role as "company_owner" | "supplier_owner" | "independent_profile" | "candidate_profile" | "training_organization",
      termsAccepted: termsAccepted as true,
    });

    if (!result.success) {
      const flatErrors = (result.errors ?? {}) as Record<string, string[]>;
      const mapped: Record<string, string> = {};
      for (const [key, vals] of Object.entries(flatErrors)) {
        mapped[key] = vals[0];
      }
      if (Object.keys(mapped).length === 0) {
        mapped.general = result.message ?? "Impossible de créer ce compte pour le moment.";
      }
      setErrors(mapped);
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setErrors({
        general: "Compte créé, mais la connexion automatique a échoué. Connectez-vous avec votre email et mot de passe.",
      });
      setLoading(false);
      router.push("/connexion");
      return;
    }

    setLoading(false);
    router.push("/onboarding");
    router.refresh();
  }

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    emailRegex.test(email) &&
    password.length >= 6 &&
    termsAccepted &&
    (!requiresStructure || organization.trim());

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="surface p-6">
        <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Créer un compte gratuit</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Choisissez votre profil principal</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Créez votre compte sécurisé. Vos données sont stockées en base de données.
        </p>
        <div className="mt-4 rounded-[16px] border-2 border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-bold text-slate-700">
            Profil sélectionné : <span className="text-indigo-700">{selectedProfile.label}</span>
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Après création, vous serez connecté automatiquement puis redirigé vers l'onboarding.
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          {profileOptions.map((option) => (
            <button
              key={option.role}
              type="button"
              className={`bento-card bento-card-interactive p-4 text-left ${
                role === option.role ? "bg-indigo-50" : "bg-white"
              }`}
              onClick={() => setRole(option.role)}
            >
              <span className="text-sm font-black text-slate-900">{option.label}</span>
              <span className="mt-1 block text-xs font-bold text-slate-500">
                {option.associationEligible ? "Eligible association" : "Profil public / validation admin"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="surface p-6">
        {errors.general && (
          <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
            {errors.general}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
            Prénom *
            <input
              className={`bento-input ${errors.firstName ? "border-red-500 shadow-[2px_2px_0_#ef4444]" : ""}`}
              value={firstName}
              placeholder="Camille"
              onChange={(event) => { setFirstName(event.target.value); setErrors((e) => ({ ...e, firstName: "" })); }}
              aria-invalid={errors.firstName ? "true" : "false"}
              aria-describedby={errors.firstName ? "error-firstName" : undefined}
            />
            {errors.firstName && <span id="error-firstName" className="text-[11px] font-bold text-red-500 normal-case">{errors.firstName}</span>}
          </label>
          <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
            Nom *
            <input
              className={`bento-input ${errors.lastName ? "border-red-500 shadow-[2px_2px_0_#ef4444]" : ""}`}
              value={lastName}
              placeholder="Dupont"
              onChange={(event) => { setLastName(event.target.value); setErrors((e) => ({ ...e, lastName: "" })); }}
              aria-invalid={errors.lastName ? "true" : "false"}
              aria-describedby={errors.lastName ? "error-lastName" : undefined}
            />
            {errors.lastName && <span id="error-lastName" className="text-[11px] font-bold text-red-500 normal-case">{errors.lastName}</span>}
          </label>
          <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
            Email *
            <input
              type="email"
              className={`bento-input ${errors.email ? "border-red-500 shadow-[2px_2px_0_#ef4444]" : ""}`}
              value={email}
              placeholder="email@entreprise.fr"
              onChange={(event) => { setEmail(event.target.value); setErrors((e) => ({ ...e, email: "" })); }}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "error-email" : undefined}
            />
            {errors.email && <span id="error-email" className="text-[11px] font-bold text-red-500 normal-case">{errors.email}</span>}
          </label>
          <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
            Mot de passe *
            <input
              type="password"
              className={`bento-input ${errors.pwdError ? "border-red-500 shadow-[2px_2px_0_#ef4444]" : ""}`}
              value={password}
              placeholder="Minimum 6 caractères"
              onChange={(event) => { setPassword(event.target.value); setErrors((e) => ({ ...e, pwdError: "" })); }}
              aria-invalid={errors.pwdError ? "true" : "false"}
              aria-describedby={errors.pwdError ? "error-password" : undefined}
            />
            {errors.pwdError && <span id="error-password" className="text-[11px] font-bold text-red-500 normal-case">{errors.pwdError}</span>}
          </label>
          <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
            Téléphone
            <input
              type="tel"
              className="bento-input"
              value={phone}
              placeholder="0600000000"
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600 sm:col-span-2">
            {getStructureLabel(role)} {requiresStructure ? "*" : ""}
            <input
              className={`bento-input ${errors.organization ? "border-red-500 shadow-[2px_2px_0_#ef4444]" : ""}`}
              value={organization}
              placeholder={getDemoStructure(role)}
              onChange={(event) => { setOrganization(event.target.value); setErrors((e) => ({ ...e, organization: "" })); }}
              aria-invalid={errors.organization ? "true" : "false"}
              aria-describedby={errors.organization ? "error-organization" : undefined}
            />
            {errors.organization && <span id="error-organization" className="text-[11px] font-bold text-red-500 normal-case">{errors.organization}</span>}
          </label>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm font-bold text-slate-600">
          <input
            checked={termsAccepted}
            className="mt-1 h-5 w-5 accent-indigo-600"
            type="checkbox"
            onChange={(event) => { setTermsAccepted(event.target.checked); setErrors((e) => ({ ...e, terms: "" })); }}
            aria-invalid={errors.terms ? "true" : "false"}
            aria-describedby={errors.terms ? "error-terms" : undefined}
          />
          <span>
            J'accepte la collecte de ces informations pour créer mon profil Club Propreté.
            {errors.terms && <span id="error-terms" className="block text-[11px] font-bold text-red-500 normal-case mt-1">{errors.terms}</span>}
          </span>
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" className="bento-btn" onClick={fillExample}>
            Remplir un exemple
          </button>
          <button
            type="button"
            className="bento-btn bento-btn-primary"
            disabled={!canSubmit || loading}
            onClick={submitSignup}
          >
            {loading ? "Création..." : "Continuer l'onboarding"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <span className="bento-tag border-emerald-400 bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={13} aria-hidden="true" />
            Gratuit
          </span>
        </div>
      </div>
    </div>
  );
}
