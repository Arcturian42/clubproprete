import { redirect } from "next/navigation";
import { CircleSlash, Download, ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { EmptyState } from "@/components/empty-state";
import { getAdminQueue, updateEntityStatus } from "@/lib/actions/admin";
import { needsAdminValidation } from "@/lib/permissions";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin" && session?.user?.role !== "super_admin") {
    redirect("/");
  }

  const queues = await getAdminQueue();
  const pendingCount = queues.filter((item) => needsAdminValidation(item.status)).length;
  const approvedCount = queues.filter((item) => item.status === "approved" || item.status === "published").length;

  async function handleValidate(formData: FormData) {
    "use server";
    await updateEntityStatus(formData);
  }

  return (
    <PageShell
      eyebrow="Back-office"
      title="Admin validation et moderation"
      description="Centre de contrôle pour garder la qualité des données, appliquer les restrictions et préparer les exports."
    >
      <div className="mb-5 flex flex-wrap gap-3">
        <a href="/api/admin/export" className="bento-btn" download>
          <Download size={16} aria-hidden="true" /> Export CSV
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="File admin" value={String(queues.length)} detail="Tous objets modérables" />
        <StatCard label="En attente" value={String(pendingCount)} detail="Action requise" />
        <StatCard label="Publiés/validés" value={String(approvedCount)} detail="Visibles selon règles" />
        <StatCard label="Paiement" value="0" detail="Interdit en V1" />
      </div>

      {queues.length === 0 ? (
        <EmptyState title="File vide" description="Aucun élément en attente de modération." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[20px] border-2 border-slate-900 bg-white shadow-panel">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Élément</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((item) => (
                <tr key={`${item.entityType}-${item.id}`} className="border-t-2 border-slate-900">
                  <td className="px-4 py-3 font-extrabold text-slate-900">{item.type}</td>
                  <td className="px-4 py-3 font-semibold text-slate-500">{item.title}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={handleValidate}>
                        <input type="hidden" name="entityType" value={item.entityType} />
                        <input type="hidden" name="entityId" value={item.id} />
                        <input type="hidden" name="status" value="approved" />
                        <button type="submit" className="bento-tag border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer">Valider</button>
                      </form>
                      <form action={handleValidate} className="flex items-center gap-1">
                        <input type="hidden" name="entityType" value={item.entityType} />
                        <input type="hidden" name="entityId" value={item.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <input
                          type="text"
                          name="rejectionReason"
                          placeholder="Motif (optionnel)"
                          maxLength={500}
                          className="w-32 rounded border border-rose-300 bg-white px-2 py-1 text-[11px]"
                        />
                        <button type="submit" className="bento-tag border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer">Refuser</button>
                      </form>
                      <form action={handleValidate}>
                        <input type="hidden" name="entityType" value={item.entityType} />
                        <input type="hidden" name="entityId" value={item.id} />
                        <input type="hidden" name="status" value="archived" />
                        <button type="submit" className="bento-tag border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer">Archiver</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <EntityCard title="Permissions sensibles" subtitle="Sous-traitance visible uniquement par membres association validés." meta={["Route guard", "Server check", "Admin override"]}>
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
            <ShieldAlert size={18} aria-hidden="true" /> À verrouiller avant prod
          </div>
        </EntityCard>
        <EntityCard title="Actions interdites V1" subtitle="Paiement, abonnement, appels d'offres, achats groupés et sponsoring restent hors scope." meta={["Pas de Stripe", "Pas de premium", "Pas d'appel d'offres"]}>
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
            <CircleSlash size={18} aria-hidden="true" /> Restrictions produit conformes au PRD
          </div>
        </EntityCard>
      </div>
    </PageShell>
  );
}
