"use client";

import { ArrowRight, Building2, CheckCircle2, GraduationCap, Package, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";
import type { OnboardingIntent } from "@/lib/onboarding";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Compatibilité avec les anciens liens "/inscription?role=..." dispersés sur le
// site : on les convertit en intention d'onboarding au lieu de figer un profil.
const roleToIntent: Record<string, OnboardingIntent> = {
  company_owner: "company",
  supplier_owner: "supplier",
  independent_profile: "independent",
  candidate_profile: "job_seeker",
  training_organization: "training",
};

const unlockedFeatures = [
  {
    icon: Building2,
    title: "Fiche société",
    description: "Visibilité annuaire, recrutement, sous-traitance pour votre entreprise de propreté.",
  },
  {
    icon: Package,
    title: "Fiche fournisseur",
    description: "Présentez vos produits, machines ou logiciels aux professionnels du secteur.",
  },
  {
    icon: GraduationCap,
    title: "Centre de formation",
    description: "Référencez votre organisme et proposez vos formations.",
  },
  {
    icon: UserRound,
    title: "Profil candidat / indépendant",
    description: "CV vivant, candidatures, missions de sous-traitance pour les auto-entrepreneurs.",
  },
];

export function SignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<OnboardingIntent | null>(null);

  useEffect(() => {
    const queryRole = new URLSearchParams(window.location.search).get("role");
    if (queryRole && roleToIntent[queryRole]) {
      setIntent(roleToIntent[queryRole]);
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
    if (!password) {
      nextErrors.pwdError = "Le mot de passe est obligatoire.";
    } else if (password.length < 10) {
      nextErrors.pwdError = "Le mot de passe doit contenir au moins 10 caractères.";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.pwdError = "Le mot de passe doit contenir au moins une majuscule.";
    } else if (!/[a-z]/.test(password)) {
      nextErrors.pwdError = "Le mot de passe doit contenir au moins une minuscule.";
    } else if (!/[0-9]/.test(password)) {
      nextErrors.pwdError = "Le mot de passe doit contenir au moins un chiffre.";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      nextErrors.pwdError = "Le mot de passe doit contenir au moins un symbole.";
    }
    if (!termsAccepted) nextErrors.terms = "Vous devez accepter les conditions.";
    if (!privacyAccepted) nextErrors.privacy = "Vous devez accepter la politique de confidentialité.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function fillExample() {
    const timestamp = Date.now();
    setFirstName("Camille");
    setLastName("Dupont");
    setEmail(`qa-user-${timestamp}@clubproprete.test`);
    setPassword("DemoPass123!");
    setPhone("0600000000");
    setTermsAccepted(true);
    setPrivacyAccepted(true);
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
      termsAccepted: termsAccepted as true,
      privacyAccepted: privacyAccepted as true,
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
    router.push(intent ? `/onboarding?intent=${intent}` : "/onboarding");
    router.refresh();
  }

  function isPasswordValid(pwd: string) {
    return (
      pwd.length >= 10 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    );
  }

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    emailRegex.test(email) &&
    isPasswordValid(password) &&
    termsAccepted &&
    privacyAccepted;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="surface p-6">
        <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Créer un compte gratuit</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Un seul compte, toutes les fonctionnalités</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Pas besoin de choisir un profil maintenant : créez votre compte, répondez à quelques questions et
          activez les fonctionnalités adaptées à votre activité. Vous pourrez cumuler plusieurs fiches
          (par exemple une fiche société et votre profil personnel).
        </p>
        <div className="mt-4 rounded-[16px] border-2 border-indigo-200 bg-indigo-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Sparkles size={16} className="text-indigo-600" aria-hidden="true" />
            Après l&apos;inscription, un onboarding rapide personnalise votre espace.
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          {unlockedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bento-card p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-[12px] border-2 border-slate-900 bg-indigo-50 p-2 text-indigo-700">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900">{feature.title}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">{feature.description}</span>
                  </div>
                </div>
              </div>
            );
          })}
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
              placeholder="email@exemple.fr"
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
              placeholder="Min 10 car., majuscule, minuscule, chiffre, symbole"
              onChange={(event) => { setPassword(event.target.value); setErrors((e) => ({ ...e, pwdError: "" })); }}
              aria-invalid={errors.pwdError ? "true" : "false"}
              aria-describedby={errors.pwdError ? "error-password" : undefined}
            />
            {errors.pwdError && <span id="error-password" className="text-[11px] font-bold text-red-500 normal-case">{errors.pwdError}</span>}
          </label>
          <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600 sm:col-span-2">
            Téléphone (facultatif)
            <input
              type="tel"
              className="bento-input"
              value={phone}
              placeholder="0600000000"
              onChange={(event) => setPhone(event.target.value)}
            />
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
            J&apos;accepte les{" "}
            <a href="/cgu" target="_blank" rel="noopener" className="text-indigo-600 underline hover:text-indigo-800">
              conditions générales d&apos;utilisation
            </a>
            .
            {errors.terms && <span id="error-terms" className="block text-[11px] font-bold text-red-500 normal-case mt-1">{errors.terms}</span>}
          </span>
        </label>

        <label className="mt-3 flex items-start gap-3 text-sm font-bold text-slate-600">
          <input
            checked={privacyAccepted}
            className="mt-1 h-5 w-5 accent-indigo-600"
            type="checkbox"
            onChange={(event) => { setPrivacyAccepted(event.target.checked); setErrors((e) => ({ ...e, privacy: "" })); }}
            aria-invalid={errors.privacy ? "true" : "false"}
            aria-describedby={errors.privacy ? "error-privacy" : undefined}
          />
          <span>
            J&apos;accepte la{" "}
            <a href="/politique-confidentialite" target="_blank" rel="noopener" className="text-indigo-600 underline hover:text-indigo-800">
              politique de confidentialité
            </a>
            {" "}et la collecte de mes données personnelles.
            {errors.privacy && <span id="error-privacy" className="block text-[11px] font-bold text-red-500 normal-case mt-1">{errors.privacy}</span>}
          </span>
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {process.env.NODE_ENV === "development" && (
            <button type="button" className="bento-btn" onClick={fillExample}>
              Remplir un exemple
            </button>
          )}
          <button
            type="button"
            className="bento-btn bento-btn-primary"
            disabled={!canSubmit || loading}
            onClick={submitSignup}
          >
            {loading ? "Création..." : "Créer mon compte"}
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
