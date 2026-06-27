import { PageShell } from "@/components/page-shell";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/lib/email-verification";

// Composant serveur : la vérification interroge la base côté serveur. L'ancienne
// version « use client » importait verifyEmailToken (qui touche Prisma) dans le
// bundle navigateur — à éviter. force-dynamic empêche toute mise en cache du
// résultat (le token est à usage unique).
export const dynamic = "force-dynamic";

export default async function VerificationEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailToken(token)
    : { success: false, message: "Lien de vérification manquant." };

  return (
    <PageShell eyebrow="Compte" title="Vérification d'email" description="">
      <div className="mx-auto max-w-md text-center">
        <div className="card-soft p-8">
          {result.success ? (
            <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={48} />
          ) : (
            <XCircle className="mx-auto mb-4 text-red-600" size={48} />
          )}
          <h2 className="text-lg font-bold text-slate-900">
            {result.success ? "Email vérifié" : "Erreur"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{result.message}</p>
          {result.success && (
            <a href="/connexion" className="bento-btn bento-btn-primary mt-4 inline-block">
              Se connecter
            </a>
          )}
        </div>
      </div>
    </PageShell>
  );
}
