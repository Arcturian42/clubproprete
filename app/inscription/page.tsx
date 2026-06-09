import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { PageShell } from "@/components/page-shell";

export default function InscriptionPage() {
  return (
    <PageShell
      eyebrow="Compte gratuit"
      title="Inscription"
      description="Créez un compte V0 local, choisissez votre persona et continuez vers l'onboarding de qualification."
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
