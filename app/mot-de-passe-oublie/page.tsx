import { PageShell } from "@/components/page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Mot de passe oublié — Club Propreté",
};

export default function ForgotPasswordPage() {
  return (
    <PageShell
      eyebrow="Auth"
      title="Mot de passe oublié"
      description="Saisissez votre adresse email pour recevoir un lien de réinitialisation."
    >
      <ForgotPasswordForm />
    </PageShell>
  );
}
