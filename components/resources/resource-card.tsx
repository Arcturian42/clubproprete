import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { getResourceHref, type Resource } from "@/lib/resources";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={getResourceHref(resource)}
      className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
      aria-label={`Voir la ressource ${resource.title}`}
    >
      <article className="surface flex h-full flex-col p-5 transition-colors hover:border-indigo-600">
        <div className="flex items-center gap-2">
          <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">{resource.type}</span>
          {resource.isPopular && (
            <span className="bento-tag border-amber-200 bg-amber-50 text-amber-700">Populaire</span>
          )}
        </div>
        <h3 className="mt-3 text-base font-black text-slate-900">{resource.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-500">{resource.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Clock size={12} aria-hidden="true" /> {resource.estimatedTime}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">
            {resource.ctaLabel} <ArrowRight size={13} aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}
