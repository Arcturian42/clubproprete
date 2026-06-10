import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/page-shell";

export default function ConnexionPage() {
  return (
    <PageShell
      eyebrow="Espace membre"
      title="Connexion"
      description="Connectez-vous à votre espace Club Propreté."
      actions={
        <Link href="/inscription" className="bento-btn">
          Créer un compte
        </Link>
      }
    >
      <Suspense
        fallback={
          <div className="surface p-6 text-sm font-bold text-slate-500">
            Chargement du formulaire de connexion...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
