import type { Metadata } from "next";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { AuthProvider } from "@/components/providers/session-provider";
import { FlashToast } from "@/components/flash-toast";
import { CookieBanner } from "@/components/cookie-banner";
import { Toaster } from "@/components/toaster";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  getBaseUrl,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const baseUrl = getBaseUrl();
const DEFAULT_TITLE = "Club Propreté — La boîte à outils des professionnels de la propreté";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Club Propreté",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_FR",
    url: baseUrl,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <FlashToast />
          <Toaster />
          <CookieBanner />
          <footer className="border-t-2 border-slate-900 bg-white mt-10">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide text-slate-900">Club Propreté</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    La boîte à outils gratuite des professionnels de la propreté.
                  </p>
                  <a
                    href="https://www.linkedin.com/company/club-proprete"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600"
                  >
                    <Linkedin size={14} aria-hidden="true" />
                    Suivez-nous sur LinkedIn
                  </a>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide text-slate-900">Annuaires</h3>
                  <ul className="mt-2 space-y-1">
                    <li><Link href="/annuaire/societes" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Sociétés</Link></li>
                    <li><Link href="/annuaire/fournisseurs" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Fournisseurs</Link></li>
                    <li><Link href="/annuaire/centres-formation" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Centres de formation</Link></li>
                    <li><Link href="/membres" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Membres</Link></li>
                    <li><Link href="/independants" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Indépendants</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide text-slate-900">Services</h3>
                  <ul className="mt-2 space-y-1">
                    <li><Link href="/emploi" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Emploi</Link></li>
                    <li><Link href="/formations" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Formations</Link></li>
                    <li><Link href="/association" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Association</Link></li>
                    <li><Link href="/ressources" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Ressources</Link></li>
                    <li><Link href="/faq" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">FAQ</Link></li>
                    <li><Link href="/a-propos" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">À propos</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide text-slate-900">Légal</h3>
                  <ul className="mt-2 space-y-1">
                    <li><Link href="/mentions-legales" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Mentions légales</Link></li>
                    <li><Link href="/politique-confidentialite" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Politique de confidentialité</Link></li>
                    <li><Link href="/cgu" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">CGU</Link></li>
                    <li><Link href="/export-donnees" className="block py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">Exporter mes données</Link></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-t-2 border-slate-100 pt-4 text-center">
                <p className="text-xs font-bold text-slate-500">© 2026 Club Propreté. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
