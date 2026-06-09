"use client";

import { Bot, GitCompareArrows, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { EntityCard } from "@/components/entity-card";
import { StatusPill } from "@/components/status-pill";
import {
  getSupplierFamilyLabel,
  SUPPLIER_FAMILIES,
  type SupplierFamily,
} from "@/lib/supplier-taxonomy";
import type { Supplier } from "@/lib/types";

const starterQuestions = [
  "Quel type de fournisseur ?",
  "Qu'est-ce que vous cherchez ?",
  "Qu'est-ce que vous voulez ?",
  "De quoi avez-vous besoin ?"
];

const categoryKeywords: Record<SupplierFamily, string[]> = {
  consommables: ["consommable", "produit", "chimie", "detergent", "désinfectant", "gant", "sac", "papier"],
  materiel: ["materiel", "matériel", "chariot", "frange", "balai", "seau", "vitrerie", "accessoire", "textile"],
  machines: ["machine", "autolaveuse", "monobrosse", "balayeuse", "aspirateur", "achat", "acheter", "louer", "location"],
  logiciels: ["logiciel", "planning", "devis", "facture", "erp", "gestion", "agent", "tableau de bord"],
};

type SupplierAdvisorProps = {
  suppliers: Supplier[];
};

type Recommendation = {
  supplier: Supplier;
  score: number;
  reasons: string[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectCategory(query: string): SupplierFamily | null {
  const normalizedQuery = normalize(query);

  return (
    SUPPLIER_FAMILIES.find((category) =>
      categoryKeywords[category].some((keyword) => normalizedQuery.includes(normalize(keyword)))
    ) ?? null
  );
}

function scoreSupplier(supplier: Supplier, query: string, selectedCategory: SupplierFamily | null): Recommendation {
  const normalizedQuery = normalize(query);
  const reasons: string[] = [];
  let score = 42;

  if (selectedCategory && supplier.family === selectedCategory) {
    score += 34;
    reasons.push("famille alignée");
  }

  if (supplier.status === "approved") {
    score += 10;
    reasons.push("fiche validée");
  }

  if (normalize(supplier.coverage).includes("france") || normalize(supplier.coverage).includes("national")) {
    score += 6;
    reasons.push("couverture large");
  }

  const matchedSpecialties = supplier.specialties?.filter((specialty) => normalizedQuery.includes(normalize(specialty))) ?? [];
  if (matchedSpecialties.length > 0) {
    score += matchedSpecialties.length * 8;
    reasons.push(`${matchedSpecialties.length} spécialité(s) détectée(s)`);
  }

  if (normalizedQuery.includes(normalize(supplier.city))) {
    score += 8;
    reasons.push("ville ciblée");
  }

  return {
    supplier,
    score: Math.min(score, 99),
    reasons: reasons.length > 0 ? reasons : ["à qualifier"]
  };
}

export function SupplierAdvisor({ suppliers }: SupplierAdvisorProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SupplierFamily | null>(null);

  const activeNeed = submittedQuery || selectedCategory || "";
  const question = starterQuestions[(activeNeed.length + suppliers.length) % starterQuestions.length];

  const recommendations = useMemo(() => {
    const detectedCategory = selectedCategory ?? detectCategory(submittedQuery);
    return suppliers
      .map((supplier) => scoreSupplier(supplier, submittedQuery, detectedCategory))
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);
  }, [selectedCategory, submittedQuery, suppliers]);

  const detectedCategory = detectCategory(submittedQuery);
  const categoryLabel = selectedCategory
    ? getSupplierFamilyLabel(selectedCategory)
    : detectedCategory
    ? getSupplierFamilyLabel(detectedCategory)
    : null;
  const hasConversation = Boolean(submittedQuery || selectedCategory);

  function submitNeed(value = query) {
    const cleanValue = value.trim();
    if (!cleanValue) {
      return;
    }

    setSubmittedQuery(cleanValue);
    setSelectedCategory(detectCategory(cleanValue));
    setQuery("");
  }

  function chooseCategory(category: SupplierFamily) {
    setSelectedCategory(category);
    setSubmittedQuery(getSupplierFamilyLabel(category));
    setQuery("");
  }

  return (
    <section className="mt-6 grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SUPPLIER_FAMILIES.map((category) => {
          const count = suppliers.filter((supplier) => supplier.family === category).length;
          const isActive = category === selectedCategory;

          return (
            <button
              key={category}
              className={`bento-card bento-card-interactive p-4 text-left ${isActive ? "bg-indigo-50" : "bg-white"}`}
              onClick={() => chooseCategory(category)}
            >
              <span className="block text-sm font-black text-slate-900">{getSupplierFamilyLabel(category)}</span>
              <span className="mt-3 inline-flex font-mono text-2xl font-extrabold text-slate-950">{count}</span>
              <span className="ml-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                fournisseur{count > 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="surface p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Bot size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Assistant fournisseur</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{question}</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
              <input
                className="bento-input w-full"
                placeholder="De quoi avez-vous besoin ? Ex : louer une autolaveuse pour un chantier urgent à Lyon"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitNeed();
                  }
                }}
              />
              <button className="bento-btn bento-btn-accent" onClick={() => submitNeed()}>
                Chercher <Send size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Acheter une autolaveuse", "Louer une machine", "Logiciel planning", "Consommables EPI", "Matériel vitrerie"].map(
                (need) => (
                  <button key={need} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700" onClick={() => submitNeed(need)}>
                    {need}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {hasConversation ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Recommandation</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {categoryLabel ?? "Besoin à qualifier"}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  Demande analysée : {submittedQuery || selectedCategory}
                </p>
              </div>
              <Sparkles className="text-indigo-600" size={24} aria-hidden="true" />
            </div>

            <div className="mt-5 grid gap-4">
              {recommendations.map((recommendation) => (
                <EntityCard
                  key={recommendation.supplier.id}
                  title={recommendation.supplier.name}
                  subtitle={`${recommendation.supplier.category} · ${recommendation.supplier.city}`}
                  status={recommendation.supplier.status}
                  meta={[`${recommendation.score}% match`, recommendation.supplier.coverage, ...recommendation.reasons]}
                >
                  <p className="text-sm font-semibold leading-6 text-slate-500">{recommendation.supplier.bestFor}</p>
                </EntityCard>
              ))}
            </div>
          </div>

          <div className="surface p-5">
            <div className="flex items-center gap-3">
              <GitCompareArrows className="text-indigo-600" size={22} aria-hidden="true" />
              <h2 className="text-xl font-black text-slate-900">Comparatif rapide</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {recommendations.map((recommendation) => (
                <div key={recommendation.supplier.id} className="border-t-2 border-slate-900 pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-900">{recommendation.supplier.name}</p>
                    <span className="font-mono text-lg font-extrabold text-slate-950">{recommendation.score}%</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{recommendation.supplier.tradeoffs}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="bento-tag border-slate-300 bg-slate-50 text-slate-700">
                      {recommendation.supplier.responseTime}
                    </span>
                    <StatusPill status={recommendation.supplier.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
