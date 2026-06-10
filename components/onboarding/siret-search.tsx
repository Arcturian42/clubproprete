"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Loader2, Search } from "lucide-react";

export type SiretSuggestion = {
  name: string;
  siret: string;
  city: string;
};

type ApiResult = {
  nom_complet?: string;
  nom_raison_sociale?: string;
  siege?: {
    siret?: string;
    libelle_commune?: string;
    code_postal?: string;
  };
};

// Recherche d'entreprises — API open data du gouvernement français
// (https://recherche-entreprises.api.gouv.fr, gratuite, sans clé).
const API_URL = "https://recherche-entreprises.api.gouv.fr/search";

function formatName(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map((part) => (part.length > 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ");
}

export function SiretSearch({
  label,
  placeholder,
  onSelect,
}: {
  label: string;
  placeholder: string;
  onSelect: (suggestion: SiretSuggestion) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiretSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setFailed(false);
      try {
        const params = new URLSearchParams({ q: trimmed, per_page: "5", page: "1" });
        const res = await fetch(`${API_URL}?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { results?: ApiResult[] };
        const suggestions = (data.results ?? [])
          .map((result) => ({
            name: formatName(result.nom_complet || result.nom_raison_sociale || ""),
            siret: result.siege?.siret ?? "",
            city: formatName(result.siege?.libelle_commune ?? ""),
          }))
          .filter((suggestion) => suggestion.name);
        setResults(suggestions);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // L'API publique peut être indisponible : la saisie manuelle reste possible.
          setResults([]);
          setOpen(false);
          setFailed(true);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative grid gap-2">
      <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
        <span className="flex items-center gap-2">
          <Search size={13} aria-hidden="true" />
          {label}
        </span>
        <span className="relative">
          <input
            className="bento-input w-full"
            value={query}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            autoComplete="off"
          />
          {loading && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-600"
              aria-hidden="true"
            />
          )}
        </span>
      </label>
      <p className="text-[11px] font-semibold normal-case text-slate-400">
        {failed
          ? "Recherche indisponible pour le moment — vous pouvez saisir les informations manuellement."
          : "Annuaire officiel des entreprises françaises (open data) — sélectionnez pour préremplir."}
      </p>
      {open && results.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[14px] border-2 border-slate-900 bg-white shadow-[4px_4px_0px_#0f172a]">
          {results.map((suggestion) => (
            <li key={`${suggestion.siret}-${suggestion.name}`}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-indigo-50"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(suggestion);
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
              >
                <Building2 size={16} className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-black text-slate-900">{suggestion.name}</span>
                  <span className="block text-xs font-bold text-slate-500">
                    {[suggestion.siret && `SIRET ${suggestion.siret}`, suggestion.city]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
