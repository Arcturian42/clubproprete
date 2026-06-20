import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { faq } from "@/lib/landing-content";
import { PageShell } from "@/components/page-shell";
import { JsonLd } from "@/components/json-ld";

export const metadata = {
  title: "Questions fréquentes",
  description:
    "Toutes les réponses sur Club Propreté : inscription gratuite, annuaire, emploi, formations, association et réseau des professionnels de la propreté.",
  alternates: { canonical: "/faq" },
};

// Données structurées FAQ (AEO) : éligibilité aux réponses directes Google/IA.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqPage() {
  return (
    <PageShell
      eyebrow="Vous vous demandez…"
      title="Questions fréquentes"
      description="Les réponses aux questions les plus courantes sur Club Propreté. Vous ne trouvez pas la vôtre ? Créez votre compte gratuit et explorez la plateforme."
      actions={
        <Link href="/inscription" className="bento-btn bento-btn-primary">
          Créer mon compte gratuit <ArrowRight size={16} aria-hidden="true" />
        </Link>
      }
    >
      <JsonLd data={faqJsonLd} />
      <div className="grid gap-3">
        {faq.map(({ q, a }) => (
          <details key={q} className="bento-card group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-slate-900">
              {q}
              <ChevronDown
                size={18}
                className="shrink-0 text-indigo-600 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
