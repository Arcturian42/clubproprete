import { PageShell } from "@/components/page-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Réinitialiser le mot de passe — Club Propreté",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <PageShell
      eyebrow="Auth"
      title="Réinitialiser le mot de passe"
      description="Choisissez un nouveau mot de passe pour votre compte Club Propreté."
    >
      <ResetPasswordForm token={token ?? ""} />
    </PageShell>
  );
}
