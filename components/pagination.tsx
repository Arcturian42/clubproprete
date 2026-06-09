import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchQuery?: string;
}

export function Pagination({ currentPage, totalPages, basePath, searchQuery }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
  }

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (searchQuery) params.set("search", searchQuery);
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      <Link
        href={currentPage > 1 ? buildHref(currentPage - 1) : "#"}
        className={`bento-btn px-3 py-2 text-sm ${currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
        aria-disabled={currentPage <= 1}
      >
        Précédent
      </Link>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-slate-500">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p as number)}
            className={`bento-btn px-3 py-2 text-sm ${
              currentPage === p
                ? "bg-indigo-600 text-white border-indigo-600 shadow-[3px_3px_0px_#0f172a]"
                : ""
            }`}
            aria-current={currentPage === p ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={currentPage < totalPages ? buildHref(currentPage + 1) : "#"}
        className={`bento-btn px-3 py-2 text-sm ${currentPage >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
        aria-disabled={currentPage >= totalPages}
      >
        Suivant
      </Link>
    </nav>
  );
}
