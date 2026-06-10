import { ArrowRight, ClipboardCheck } from "lucide-react";
import { OnboardingSession } from "@/components/auth/onboarding-session";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { personas } from "@/lib/seeds";

const steps = [
  "Choix du profil principal",
  "Informations personnelles",
  "Objectif principal",
  "Besoins actuels",
  "Redirection vers le formulaire métier"
];

export default function OnboardingPage() {
  return (
    <PageShell
      eyebrow="Onboarding"
      title="Qualification multi-profils"
      description="Le premier objectif de la V0 est de collecter des données qualifiées sans bloquer l'utilisateur."
    >
      <div className="grid gap-4 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="surface p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border-2 border-slate-900 bg-amber-400 font-mono text-sm font-extrabold text-slate-900 shadow-[3px_3px_0px_#0f172a]">
              {index + 1}
            </div>
            <p className="mt-4 text-sm font-extrabold text-slate-900">{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {personas
          .filter((persona) => persona.key !== "visitor" && persona.key !== "admin")
          .map((persona) => (
            <EntityCard key={persona.key} title={persona.name} subtitle={persona.workflow} meta={[persona.role]}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-500">{persona.goal}</p>
                <ArrowRight className="text-indigo-600" size={20} aria-hidden="true" />
              </div>
            </EntityCard>
          ))}
      </div>

      <div className="surface mt-8 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <ClipboardCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Score de complétion</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              La V0 doit pouvoir calculer un score simple par profil pour distinguer les fiches exploitables,
              incomplètes et prêtes pour vérification.
            </p>
          </div>
        </div>
      </div>

      <OnboardingSession />
    </PageShell>
  );
}
