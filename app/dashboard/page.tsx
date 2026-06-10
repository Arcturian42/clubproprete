import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MyDashboard } from "@/components/dashboard/my-dashboard";
import { PageShell } from "@/components/page-shell";
import { prisma } from "@/lib/prisma";
import { getCandidateApplications } from "@/lib/actions/jobs";
import { hasApprovedAssociationMembership } from "@/lib/actions/memberships";

import { getCompanyByOwner } from "@/lib/actions/companies";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  // La session JWT est figée au login. On relit le rôle et le statut association
  // depuis la base pour refléter immédiatement les approbations admin et les
  // élévations de rôle (création d'entité), sans imposer une reconnexion.
  const [freshUser, associationMember] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mainRole: true },
    }),
    hasApprovedAssociationMembership(session.user.id),
  ]);

  const role = freshUser?.mainRole ?? session.user.role;
  const user = { ...session.user, role, associationMember };

  let candidateApplications: Awaited<ReturnType<typeof getCandidateApplications>> | undefined;
  let jobsCount = 0;
  let trainingsCount = 0;
  let company: Awaited<ReturnType<typeof getCompanyByOwner>> | undefined;

  if (role === "candidate_profile") {
    const candidateProfile = await prisma.candidateProfile.findFirst({
      where: { userId: user.id, deletedAt: null },
    });
    if (candidateProfile) {
      candidateApplications = await getCandidateApplications(candidateProfile.id);
    }
  }

  if (role === "company_owner" || role === "verified_company") {
    company = await getCompanyByOwner(user.id);
  }

  const [jobsTotal, trainingsTotal] = await Promise.all([
    prisma.job.count({ where: { status: "published", deletedAt: null } }),
    prisma.training.count({ where: { status: "approved", deletedAt: null } }),
  ]);

  jobsCount = jobsTotal;
  trainingsCount = trainingsTotal;

  return (
    <PageShell
      eyebrow="Espace connecté"
      title="Mon espace"
      description="Bienvenue dans votre espace personnel Club Propreté."
    >
      <MyDashboard user={user} candidateApplications={candidateApplications} jobsCount={jobsCount} trainingsCount={trainingsCount} company={company} />
    </PageShell>
  );
}
