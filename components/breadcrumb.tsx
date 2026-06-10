import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="pb-4 mb-4 border-b border-slate-100">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label + index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
              )}
              {isLast || !item.href ? (
                <span
                  className={`font-semibold text-slate-900 ${!isLast ? "text-slate-600" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
