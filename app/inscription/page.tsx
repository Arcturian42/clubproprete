import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { PageShell } from "@/components/page-shell";

export default function InscriptionPage() {
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
