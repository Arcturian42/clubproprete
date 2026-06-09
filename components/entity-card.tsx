import type { ReactNode } from "react";
import { StatusPill } from "@/components/status-pill";
import type { WorkflowStatus } from "@/lib/types";

type EntityCardProps = {
  title: string;
  subtitle: string;
  status?: WorkflowStatus;
  meta?: string[];
  children?: ReactNode;
};

export function EntityCard({ title, subtitle, status, meta = [], children }: EntityCardProps) {
  return (
    <article className="bento-card bento-card-interactive p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{subtitle}</p>
        </div>
        {status ? <StatusPill status={status} /> : null}
      </div>
      {meta.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {meta.map((item) => (
            <span key={item} className="bento-tag border-slate-300 bg-slate-50 text-slate-700">
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-5 border-t-2 border-slate-900 pt-4">{children}</div> : null}
    </article>
  );
}
