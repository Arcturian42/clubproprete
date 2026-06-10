import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";
import { PageShell } from "@/components/page-shell";

export const metadata = {
  title: "Inscription gratuite | Club Propreté",
  description:
    "Créez votre compte gratuit Club Propreté : annuaire, emploi, formations et réseau des professionnels de la propreté.",
};

export default async function InscriptionPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <PageShell
      eyebrow="Compte gratuit"
      title="Inscription"
      description="Créez votre compte gratuit en 2 minutes : un onboarding rapide active ensuite les fonctionnalités adaptées à votre activité."
      actions={
        <Link href="/connexion" className="bento-btn">
          Déjà inscrit
        </Link>
      }
    >
      <SignupForm />
    </PageShell>
  );
}
