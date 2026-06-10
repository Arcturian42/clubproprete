import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { getMyTrainingOrganization, upsertTrainingOrganization } from "@/lib/actions/training-organizations";

interface TrainingCenterDashboardProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function TrainingCenterDashboardPage({ searchParams }: TrainingCenterDashboardProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/dashboard/centre-formation");
  }

  const params = await searchParams;
  const organization = await getMyTrainingOrganization();

  async function saveTrainingCenter(formData: FormData) {
    "use server";
    const result = await upsertTrainingOrganization(formData);
    if (!result.success) {
      redirect("/dashboard/centre-formation?error=1");
    }
    redirect("/annuaire/centres-formation");
  }

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Centre de formation"
      description="Créez ou mettez à jour votre page centre. Elle sera visible après validation admin."
      actions={
        <Link href="/dashboard" className="bento-btn">
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>
      }
    >
      <form action={saveTrainingCenter} className="surface mx-auto max-w-3xl p-6">
        {params.error && (
          <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
            Impossible d'enregistrer le centre. Vérifiez les champs obligatoires.
          </div>
        )}
        {organization && <input type="hidden" name="id" value={organization.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Nom du centre *</label>
            <input name="name" required defaultValue={organization?.name ?? ""} className="bento-input w-full" />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Raison sociale</label>
            <input name="legalName" defaultValue={organization?.legalName ?? ""} className="bento-input w-full" />
          </div>
          <input name="siret" defaultValue={organization?.siret ?? ""} className="bento-input w-full" placeholder="SIRET" />
          <input name="declarationNumber" defaultValue={organization?.declarationNumber ?? ""} className="bento-input w-full" placeholder="N° déclaration d'activité" />
          <input name="qualiopiStatus" defaultValue={organization?.qualiopiStatus ?? ""} className="bento-input w-full" placeholder="Statut Qualiopi" />
          <input name="website" defaultValue={organization?.website ?? ""} className="bento-input w-full" placeholder="Site web" />
          <input name="email" type="email" defaultValue={organization?.email ?? ""} className="bento-input w-full" placeholder="Email" />
          <input name="phone" defaultValue={organization?.phone ?? ""} className="bento-input w-full" placeholder="Téléphone" />
          <input name="contactName" defaultValue={organization?.contactName ?? ""} className="bento-input w-full sm:col-span-2" placeholder="Contact principal" />
          <textarea
            name="description"
            rows={6}
            defaultValue={organization?.description ?? ""}
            className="bento-input w-full resize-none sm:col-span-2"
            placeholder="Présentation du centre, expertises, certifications..."
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" className="bento-btn bento-btn-primary">
            <Save size={16} /> Enregistrer et soumettre
          </button>
          {organization && (
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Statut : {organization.verificationStatus}
            </span>
          )}
        </div>
      </form>
    </PageShell>
  );
}
