"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Hammer,
  Loader2,
  Package,
  PartyPopper,
  UserRound,
} from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import {
  CONTRACT_OPTIONS,
  EXPERIENCE_LEVELS,
  ONBOARDING_SITUATIONS,
  SITUATION_OPTIONS,
  type OnboardingSituation,
} from "@/lib/onboarding";
import { SUPPLIER_TAXONOMY, SUPPLIER_FAMILIES } from "@/lib/supplier-taxonomy";
import { SiretSearch } from "@/components/onboarding/siret-search";

const situationIcons: Record<OnboardingSituation, typeof Building2> = {
  company: Building2,
  supplier: Package,
  training: GraduationCap,
  independent: Hammer,
  job_seeker: Briefcase,
};

export type OnboardingInitialData = {
  firstName: string;
  phone: string;
  city: string;
  linkedinUrl: string;
  alreadyCompleted: boolean;
  existing: {
    company: boolean;
    supplier: boolean;
    training: boolean;
    independent: boolean;
    job_seeker: boolean;
  };
};

type StepId = "contact" | "situation" | OnboardingSituation | "recap";

type CompanyData = { name: string; siret: string; city: string };
type SupplierData = { name: string; family: string };
type TrainingData = { name: string; siret: string; declarationNumber: string; qualiopi: boolean };
type IndependentData = {
  hasBusiness: boolean | null;
  businessName: string;
  siret: string;
  experienceLevel: string;
  skills: string;
};
type JobSeekerData = { experienceLevel: string; contracts: string[]; skills: string };

export function OnboardingFlow({
  initialData,
  intent,
}: {
  initialData: OnboardingInitialData;
  intent: OnboardingSituation | null;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [phone, setPhone] = useState(initialData.phone);
  const [city, setCity] = useState(initialData.city);
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl);
  const [situations, setSituations] = useState<OnboardingSituation[]>(intent ? [intent] : []);

  const [company, setCompany] = useState<CompanyData>({ name: "", siret: "", city: "" });
  const [supplier, setSupplier] = useState<SupplierData>({ name: "", family: "materiel" });
  const [training, setTraining] = useState<TrainingData>({
    name: "",
    siret: "",
    declarationNumber: "",
    qualiopi: false,
  });
  const [independent, setIndependent] = useState<IndependentData>({
    hasBusiness: null,
    businessName: "",
    siret: "",
    experienceLevel: "",
    skills: "",
  });
  const [jobSeeker, setJobSeeker] = useState<JobSeekerData>({
    experienceLevel: "",
    contracts: [],
    skills: "",
  });

  // Les fiches déjà existantes sont créées : on ne repose pas les questions de
  // création, mais la situation reste cochée pour le récapitulatif.
  const steps: StepId[] = useMemo(() => {
    const branchSteps = ONBOARDING_SITUATIONS.filter(
      (situation) => situations.includes(situation) && !initialData.existing[situation]
    );
    return ["contact", "situation", ...branchSteps, "recap"];
  }, [situations, initialData.existing]);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  function toggleSituation(key: OnboardingSituation) {
    setSituations((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }

  function stepIsValid(step: StepId) {
    if (step === "company") return company.name.trim().length > 0;
    if (step === "supplier") return supplier.name.trim().length > 0;
    if (step === "training") return training.name.trim().length > 0;
    return true;
  }

  function goNext() {
    setError(null);
    if (!stepIsValid(currentStep)) {
      setError("Merci de remplir les champs obligatoires avant de continuer.");
      return;
    }
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  async function submit() {
    setLoading(true);
    setError(null);

    const result = await completeOnboarding({
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      situations,
      company: situations.includes("company") ? company : undefined,
      supplier: situations.includes("supplier") ? supplier : undefined,
      training: situations.includes("training") ? training : undefined,
      independent: situations.includes("independent")
        ? {
            hasBusiness: independent.hasBusiness ?? undefined,
            businessName: independent.businessName || undefined,
            siret: independent.siret || undefined,
            experienceLevel: (independent.experienceLevel || undefined) as
              | "debutant"
              | "1_3"
              | "3_plus"
              | undefined,
            skills: independent.skills || undefined,
          }
        : undefined,
      jobSeeker: situations.includes("job_seeker")
        ? {
            experienceLevel: (jobSeeker.experienceLevel || undefined) as
              | "debutant"
              | "1_3"
              | "3_plus"
              | undefined,
            contracts: jobSeeker.contracts,
            skills: jobSeeker.skills || undefined,
          }
        : undefined,
    });

    setLoading(false);

    if (!result.success) {
      const firstFieldError = result.errors
        ? Object.values(result.errors as Record<string, string[]>).flat()[0]
        : null;
      setError(firstFieldError ?? result.message ?? "Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return <OnboardingSuccess situations={situations} firstName={initialData.firstName} />;
  }

  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
          <span>
            Étape {stepIndex + 1} / {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-slate-200">
          <div className="h-3 rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {initialData.alreadyCompleted && stepIndex === 0 && (
        <div className="mb-4 rounded-[14px] border-2 border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-800">
          Vous avez déjà complété votre onboarding : vos réponses ci-dessous mettront votre profil à jour.
        </div>
      )}

      <div className="surface p-6">
        {currentStep === "contact" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Bienvenue {initialData.firstName} !
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Quelques informations pour personnaliser votre espace. Tout est facultatif et modifiable
              ensuite depuis votre profil.
            </p>
            <div className="mt-5 grid gap-4">
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
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Ville
                <input
                  className="bento-input"
                  value={city}
                  placeholder="Paris"
                  onChange={(event) => setCity(event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Profil LinkedIn
                <input
                  type="url"
                  className="bento-input"
                  value={linkedinUrl}
                  placeholder="https://www.linkedin.com/in/votre-profil"
                  onChange={(event) => setLinkedinUrl(event.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {currentStep === "situation" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">Quelle est votre situation ?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Sélectionnez tout ce qui vous concerne : chaque situation débloque les fonctionnalités
              correspondantes. Vous pouvez en cumuler plusieurs, ou passer cette étape pour découvrir la
              plateforme.
            </p>
            <div className="mt-5 grid gap-3">
              {SITUATION_OPTIONS.map((option) => {
                const Icon = situationIcons[option.key];
                const selected = situations.includes(option.key);
                const alreadyDone = initialData.existing[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`bento-card bento-card-interactive p-4 text-left ${
                      selected ? "bg-indigo-50" : "bg-white"
                    }`}
                    onClick={() => toggleSituation(option.key)}
                    aria-pressed={selected}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-[12px] border-2 border-slate-900 p-2 ${
                          selected ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                          {option.title}
                          {selected && <CheckCircle2 size={15} className="text-indigo-600" aria-hidden="true" />}
                        </span>
                        <span className="mt-1 block text-xs font-bold text-slate-500">{option.description}</span>
                        {alreadyDone && (
                          <span className="mt-1 block text-xs font-bold text-emerald-600">
                            Fiche déjà créée — elle sera conservée.
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === "company" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">Votre société de propreté</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              On crée votre fiche société. Vous pourrez la compléter ensuite (logo, services, zones
              d&apos;intervention) pour gagner en visibilité.
            </p>
            <div className="mt-5 grid gap-4">
              <SiretSearch
                label="Retrouver votre société (annuaire officiel)"
                placeholder="Nom de la société ou n° SIRET"
                onSelect={(suggestion) =>
                  setCompany({
                    name: suggestion.name,
                    siret: suggestion.siret,
                    city: suggestion.city,
                  })
                }
              />
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Nom de la société *
                <input
                  className="bento-input"
                  value={company.name}
                  placeholder="Azur Propreté Services"
                  onChange={(event) => setCompany((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Numéro SIRET
                <input
                  className="bento-input"
                  value={company.siret}
                  placeholder="123 456 789 00012"
                  onChange={(event) => setCompany((prev) => ({ ...prev, siret: event.target.value }))}
                />
              </label>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Ville du siège
                <input
                  className="bento-input"
                  value={company.city}
                  placeholder={city || "Paris"}
                  onChange={(event) => setCompany((prev) => ({ ...prev, city: event.target.value }))}
                />
              </label>
            </div>
          </div>
        )}

        {currentStep === "supplier" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">Votre activité de fournisseur</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              On crée votre fiche fournisseur. Vous préciserez votre catalogue (produits, services) après
              l&apos;onboarding.
            </p>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Nom du fournisseur *
                <input
                  className="bento-input"
                  value={supplier.name}
                  placeholder="EcoMatériel Pro"
                  onChange={(event) => setSupplier((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Famille principale
                <select
                  className="bento-input"
                  value={supplier.family}
                  onChange={(event) => setSupplier((prev) => ({ ...prev, family: event.target.value }))}
                >
                  {SUPPLIER_FAMILIES.map((family) => (
                    <option key={family} value={family}>
                      {SUPPLIER_TAXONOMY[family].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {currentStep === "training" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">Votre centre de formation</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              On référence votre organisme. Étape suivante après l&apos;onboarding : proposer vos premières
              formations.
            </p>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Nom de l&apos;organisme *
                <input
                  className="bento-input"
                  value={training.name}
                  placeholder="Institut Hygiène Formation"
                  onChange={(event) => setTraining((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Numéro SIRET
                <input
                  className="bento-input"
                  value={training.siret}
                  placeholder="123 456 789 00012"
                  onChange={(event) => setTraining((prev) => ({ ...prev, siret: event.target.value }))}
                />
              </label>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Numéro de déclaration d&apos;activité
                <input
                  className="bento-input"
                  value={training.declarationNumber}
                  placeholder="11 75 12345 75"
                  onChange={(event) =>
                    setTraining((prev) => ({ ...prev, declarationNumber: event.target.value }))
                  }
                />
              </label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-indigo-600"
                  checked={training.qualiopi}
                  onChange={(event) => setTraining((prev) => ({ ...prev, qualiopi: event.target.checked }))}
                />
                Mon organisme est certifié Qualiopi
              </label>
            </div>
          </div>
        )}

        {currentStep === "independent" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">Votre activité d&apos;indépendant</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Parlez-nous de votre activité pour préparer votre profil sous-traitant.
            </p>
            <div className="mt-5 grid gap-4">
              <fieldset className="grid gap-2">
                <legend className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                  Avez-vous déjà créé votre auto-entreprise ?
                </legend>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`bento-btn ${independent.hasBusiness === true ? "bento-btn-primary" : ""}`}
                    onClick={() => setIndependent((prev) => ({ ...prev, hasBusiness: true }))}
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    className={`bento-btn ${independent.hasBusiness === false ? "bento-btn-primary" : ""}`}
                    onClick={() => setIndependent((prev) => ({ ...prev, hasBusiness: false, siret: "" }))}
                  >
                    Pas encore
                  </button>
                </div>
              </fieldset>
              {independent.hasBusiness === true && (
                <>
                  <SiretSearch
                    label="Retrouver votre auto-entreprise (annuaire officiel)"
                    placeholder="Votre nom, nom commercial ou n° SIRET"
                    onSelect={(suggestion) =>
                      setIndependent((prev) => ({
                        ...prev,
                        businessName: suggestion.name,
                        siret: suggestion.siret,
                      }))
                    }
                  />
                  <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                    Nom commercial
                    <input
                      className="bento-input"
                      value={independent.businessName}
                      placeholder="Karim Services Propreté"
                      onChange={(event) =>
                        setIndependent((prev) => ({ ...prev, businessName: event.target.value }))
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                    Numéro SIRET
                    <input
                      className="bento-input"
                      value={independent.siret}
                      placeholder="123 456 789 00012"
                      onChange={(event) => setIndependent((prev) => ({ ...prev, siret: event.target.value }))}
                    />
                  </label>
                </>
              )}
              <fieldset className="grid gap-2">
                <legend className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                  Votre expérience dans la propreté
                </legend>
                <div className="grid gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label key={level.value} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <input
                        type="radio"
                        name="independent-experience"
                        className="h-4 w-4 accent-indigo-600"
                        checked={independent.experienceLevel === level.value}
                        onChange={() =>
                          setIndependent((prev) => ({ ...prev, experienceLevel: level.value }))
                        }
                      />
                      {level.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Vos compétences / spécialités
                <textarea
                  className="bento-input resize-none"
                  rows={3}
                  value={independent.skills}
                  placeholder="Vitrerie, remise en état, nettoyage de bureaux..."
                  onChange={(event) => setIndependent((prev) => ({ ...prev, skills: event.target.value }))}
                />
              </label>
            </div>
          </div>
        )}

        {currentStep === "job_seeker" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">Votre recherche d&apos;emploi</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Ces réponses préparent votre profil candidat. Il reste privé : seuls les recruteurs auxquels
              vous postulez peuvent le consulter.
            </p>
            <div className="mt-5 grid gap-4">
              <fieldset className="grid gap-2">
                <legend className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                  Votre expérience dans la propreté
                </legend>
                <div className="grid gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label key={level.value} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <input
                        type="radio"
                        name="jobseeker-experience"
                        className="h-4 w-4 accent-indigo-600"
                        checked={jobSeeker.experienceLevel === level.value}
                        onChange={() => setJobSeeker((prev) => ({ ...prev, experienceLevel: level.value }))}
                      />
                      {level.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="grid gap-2">
                <legend className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                  Contrats recherchés
                </legend>
                <div className="flex flex-wrap gap-3">
                  {CONTRACT_OPTIONS.map((contract) => (
                    <label key={contract} className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-indigo-600"
                        checked={jobSeeker.contracts.includes(contract)}
                        onChange={(event) =>
                          setJobSeeker((prev) => ({
                            ...prev,
                            contracts: event.target.checked
                              ? [...prev.contracts, contract]
                              : prev.contracts.filter((item) => item !== contract),
                          }))
                        }
                      />
                      {contract}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                Vos compétences
                <textarea
                  className="bento-input resize-none"
                  rows={3}
                  value={jobSeeker.skills}
                  placeholder="Nettoyage de bureaux, vitrerie, utilisation d'autolaveuse..."
                  onChange={(event) => setJobSeeker((prev) => ({ ...prev, skills: event.target.value }))}
                />
              </label>
            </div>
          </div>
        )}

        {currentStep === "recap" && (
          <div>
            <h2 className="text-2xl font-black text-slate-900">Récapitulatif</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Vérifiez vos réponses : à la validation, votre espace et vos fiches sont créés.
            </p>
            <div className="mt-5 grid gap-3">
              <div className="bento-card p-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Coordonnées</span>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {[phone, city, linkedinUrl].filter(Boolean).join(" · ") || "Aucune information ajoutée"}
                </p>
              </div>
              {situations.length === 0 ? (
                <div className="bento-card p-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Situation</span>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    Aucune situation sélectionnée : vous pourrez activer une fiche à tout moment depuis votre
                    espace.
                  </p>
                </div>
              ) : (
                SITUATION_OPTIONS.filter((option) => situations.includes(option.key)).map((option) => (
                  <div key={option.key} className="bento-card p-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      {option.title}
                    </span>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {option.key === "company" && (company.name || "Fiche société existante conservée")}
                      {option.key === "supplier" &&
                        (supplier.name
                          ? `${supplier.name} · ${SUPPLIER_TAXONOMY[supplier.family as keyof typeof SUPPLIER_TAXONOMY]?.label ?? ""}`
                          : "Fiche fournisseur existante conservée")}
                      {option.key === "training" && (training.name || "Fiche centre existante conservée")}
                      {option.key === "independent" &&
                        (independent.hasBusiness
                          ? `Auto-entreprise${independent.siret ? ` · SIRET ${independent.siret}` : ""}`
                          : "Profil indépendant")}
                      {option.key === "job_seeker" &&
                        (jobSeeker.contracts.length > 0
                          ? `Recherche : ${jobSeeker.contracts.join(", ")}`
                          : "Profil candidat")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="bento-btn" onClick={goBack} disabled={stepIndex === 0 || loading}>
            <ArrowLeft size={16} aria-hidden="true" /> Retour
          </button>
          {currentStep === "recap" ? (
            <button
              type="button"
              className="bento-btn bento-btn-primary"
              onClick={submit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Validation...
                </>
              ) : (
                <>
                  Valider et créer mon espace <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          ) : (
            <button type="button" className="bento-btn bento-btn-primary" onClick={goNext} disabled={loading}>
              Continuer <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* F3 — Sortie sans blocage : l'utilisateur qui n'a pas ses informations
            sous la main (SIRET, etc.) peut accéder à son espace tout de suite et
            finaliser plus tard depuis le tableau de bord, plutôt que de fermer
            l'onglet et ne jamais revenir. */}
        {currentStep !== "recap" && (
          <div className="mt-4 text-center">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-500 underline hover:text-slate-700"
            >
              Passer pour l&apos;instant — je compléterai plus tard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function OnboardingSuccess({
  situations,
  firstName,
}: {
  situations: OnboardingSituation[];
  firstName: string;
}) {
  const nextSteps: Array<{ label: string; description: string; href: string }> = [];

  if (situations.includes("company")) {
    nextSteps.push({
      label: "Compléter ma fiche société",
      description: "Logo, description, services et zones d'intervention pour l'annuaire.",
      href: "/dashboard/entreprise",
    });
  }
  if (situations.includes("supplier")) {
    nextSteps.push({
      label: "Compléter ma fiche fournisseur",
      description: "Précisez votre catalogue et vos zones de livraison.",
      href: "/dashboard/fournisseur",
    });
  }
  if (situations.includes("training")) {
    nextSteps.push({
      label: "Proposer ma première formation",
      description: "Référencez vos formations pour toucher les professionnels du secteur.",
      href: "/formations/nouvelle",
    });
  }
  if (situations.includes("independent")) {
    nextSteps.push({
      label: "Découvrir la sous-traitance",
      description: "Les missions privées sont réservées aux membres de l'association.",
      href: "/association/adhesion",
    });
  }
  if (situations.includes("job_seeker")) {
    nextSteps.push({
      label: "Voir les offres d'emploi",
      description: "Postulez avec votre profil candidat fraîchement créé.",
      href: "/emploi",
    });
  }
  nextSteps.push({
    label: "Optimiser mon profil",
    description: "Photo, bio et visibilité : votre profil public façon LinkedIn.",
    href: "/profil",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="surface p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-50 p-3 text-emerald-700 shadow-[3px_3px_0px_#0f172a]">
            <PartyPopper size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">C&apos;est prêt, {firstName} !</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Votre espace est configuré. Voici les prochaines étapes recommandées pour tirer le meilleur de
              Club Propreté.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {nextSteps.map((step) => (
            <Link key={step.href + step.label} href={step.href} className="bento-card bento-card-interactive p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-black text-slate-900">{step.label}</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">{step.description}</span>
                </div>
                <ArrowRight className="shrink-0 text-indigo-600" size={18} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/dashboard" className="bento-btn bento-btn-primary">
            Ouvrir mon espace <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
