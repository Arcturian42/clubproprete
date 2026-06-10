import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { TrainingForm } from "@/components/training-form";
import { getTrainingPublishingEntitiesForCurrentUser } from "@/lib/actions/trainings";

export default async function NewTrainingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/formations/nouvelle");
  }

  const entities = await getTrainingPublishingEntitiesForCurrentUser();

  return (
    <PageShell
      eyebrow="Formation"
      title="Proposer une formation"
      description="Publiez une formation certifiée au nom d'une société, d'un fournisseur ou d'un centre de formation."
      actions={
        <Link href="/formations" className="bento-btn">
          <ArrowLeft size={16} /> Retour aux formations
        </Link>
      }
    >
      <TrainingForm entities={entities} />
    </PageShell>
  );
}
