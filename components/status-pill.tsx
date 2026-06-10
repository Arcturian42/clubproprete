import type { WorkflowStatus } from "@/lib/types";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  approved: "Validé",
  rejected: "Refusé",
  suspended: "Suspendu",
  archived: "Archivé",
  published: "Publié",
};

const statusClasses: Record<string, string> = {
  draft: "bg-slate-100 text-slate-900 border-slate-900",
  pending: "bg-amber-100 text-slate-900 border-amber-400",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-400",
  rejected: "bg-rose-50 text-rose-700 border-rose-400",
  suspended: "bg-orange-50 text-orange-700 border-orange-400",
  archived: "bg-slate-100 text-slate-600 border-slate-300",
  published: "bg-indigo-50 text-indigo-700 border-indigo-300",
};

export function StatusPill({ status }: { status: WorkflowStatus | string }) {
  return (
    <span className={`bento-tag ${statusClasses[status] || "bg-slate-100 text-slate-600 border-slate-300"}`}>
      {statusLabels[status] || status}
    </span>
  );
}
