import type { Metadata } from "next";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { AuthProvider } from "@/components/providers/session-provider";
import { FlashToast } from "@/components/flash-toast";
import { FounderCard } from "@/components/founder-card";

export const metadata: Metadata = {
  title: "Club Propreté — La boîte à outils des professionnels de la propreté",
  description:
    "La boîte à outils gratuite des professionnels de la propreté : annuaire, emploi, formations, association et sous-traitance privée.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <FlashToast />
          <footer className="border-t-2 border-slate-900 bg-white mt-10">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Club Propreté</h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                    La boîte à outils gratuite des professionnels de la propreté.
                  </p>
                  <a
                    href="https://www.linkedin.com/company/club-proprete"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600"
                  >
                    <Linkedin size={14} aria-hidden="true" />
                    Suivez-nous sur LinkedIn
                  </a>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Annuaires</h3>
                  <ul className="mt-2 space-y-1">
                    <li><Link href="/annuaire/societes" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Sociétés</Link></li>
                    <li><Link href="/annuaire/fournisseurs" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Fournisseurs</Link></li>
                    <li><Link href="/annuaire/centres-formation" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Centres de formation</Link></li>
                    <li><Link href="/inscription?role=candidate_profile" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Profil candidat</Link></li>
                    <li><Link href="/independants" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Indépendants</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Services</h3>
                  <ul className="mt-2 space-y-1">
                    <li><Link href="/emploi" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Emploi</Link></li>
                    <li><Link href="/formations" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Formations</Link></li>
                    <li><Link href="/association" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Association</Link></li>
                    <li><Link href="/ressources" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Ressources</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Légal</h3>
                  <ul className="mt-2 space-y-1">
                    <li><Link href="/mentions-legales" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Mentions légales</Link></li>
                    <li><Link href="/politique-confidentialite" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Politique de confidentialité</Link></li>
                    <li><Link href="/cgu" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">CGU</Link></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-t-2 border-slate-100 pt-6">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">À propos</h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="text-xs font-semibold leading-5 text-slate-500">
                    Club Propreté est une association portée par des professionnels du secteur, fondée par
                    Farid Cherif et Olivier Lerendu pour connecter sociétés de nettoyage, indépendants,
                    fournisseurs et organismes de formation.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <FounderCard
                      name="Farid Cherif"
                      role="Co-fondateur de l'association"
                      photoSrc="/founders/farid-cherif.jpg"
                      linkedinUrl="https://www.linkedin.com/in/farid-cherif/"
                    />
                    <FounderCard
                      name="Olivier Lerendu"
                      role="Co-fondateur de l'association"
                      photoSrc="/founders/olivier-lerendu.jpg"
                      linkedinUrl="https://www.linkedin.com/in/lerenduolivier/"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t-2 border-slate-100 pt-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">© 2026 Club Propreté. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
