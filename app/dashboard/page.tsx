import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MyDashboard } from "@/components/dashboard/my-dashboard";
import { PageShell } from "@/components/page-shell";
import { prisma } from "@/lib/prisma";
import { getCandidateApplications } from "@/lib/actions/jobs";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  let candidateApplications: Awaited<ReturnType<typeof getCandidateApplications>> | undefined;
  let jobsCount = 0;
  let trainingsCount = 0;

  if (session.user.role === "candidate_profile") {
    const candidateProfile = await prisma.candidateProfile.findFirst({
      where: { userId: session.user.id, deletedAt: null },
    });
    if (candidateProfile) {
      candidateApplications = await getCandidateApplications(candidateProfile.id);
    }
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
      <MyDashboard user={session.user} candidateApplications={candidateApplications} jobsCount={jobsCount} trainingsCount={trainingsCount} />
    </PageShell>
  );
}
