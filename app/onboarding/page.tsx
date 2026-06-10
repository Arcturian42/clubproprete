import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/page-shell";
import { OnboardingFlow, type OnboardingInitialData } from "@/components/onboarding/onboarding-flow";
import { ONBOARDING_SITUATIONS, type OnboardingSituation } from "@/lib/onboarding";

type Props = {
  searchParams: Promise<{ intent?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  if (!session?.user) {
    return (
      <PageShell
        eyebrow="Onboarding"
        title="Bienvenue sur Club Propreté"
        description="L'onboarding personnalise votre espace : créez d'abord votre compte gratuit ou connectez-vous."
      >
        <div className="surface mx-auto max-w-2xl p-6">
          <h2 className="text-xl font-black text-slate-900">Commencez par créer un compte</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Un seul compte suffit : vous choisirez ensuite vos fonctionnalités (fiche société, fournisseur,
            centre de formation, profil candidat ou indépendant).
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/inscription" className="bento-btn bento-btn-primary">
              Créer un compte
            </Link>
            <Link href="/connexion" className="bento-btn">
              Connexion
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      companies: { where: { deletedAt: null }, take: 1, select: { id: true } },
      suppliers: { where: { deletedAt: null }, take: 1, select: { id: true } },
      trainingOrganizations: { where: { deletedAt: null }, take: 1, select: { id: true } },
      independentProfile: { select: { id: true, deletedAt: true } },
      candidateProfile: { select: { id: true, deletedAt: true } },
    },
  });

  const initialData: OnboardingInitialData = {
    firstName: user?.firstName ?? session.user.firstName ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    linkedinUrl: user?.profile?.linkedinUrl ?? "",
    alreadyCompleted: Boolean(user?.profile?.onboardingCompletedAt),
    existing: {
      company: (user?.companies.length ?? 0) > 0,
      supplier: (user?.suppliers.length ?? 0) > 0,
      training: (user?.trainingOrganizations.length ?? 0) > 0,
      independent: Boolean(user?.independentProfile && !user.independentProfile.deletedAt),
      job_seeker: Boolean(user?.candidateProfile && !user.candidateProfile.deletedAt),
    },
  };

  const intent = ONBOARDING_SITUATIONS.includes(params.intent as OnboardingSituation)
    ? (params.intent as OnboardingSituation)
    : null;

  return (
    <PageShell
      eyebrow="Onboarding"
      title={`Bienvenue ${initialData.firstName}`.trim()}
      description="Quelques questions pour personnaliser votre espace et activer les bonnes fonctionnalités."
    >
      <OnboardingFlow initialData={initialData} intent={intent} />
    </PageShell>
  );
}
