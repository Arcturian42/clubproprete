import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton, AuthDivider } from "@/components/auth/google-signin-button";
import { PageShell } from "@/components/page-shell";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Club Propreté.",
};

export default async function ConnexionPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

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
      <div className="space-y-4">
        <GoogleSignInButton callbackUrl="/dashboard" label="Se connecter avec Google" />
        <AuthDivider />
        <Suspense
          fallback={
            <div className="surface p-6 text-sm font-bold text-slate-500">
              Chargement du formulaire de connexion...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </PageShell>
  );
}
