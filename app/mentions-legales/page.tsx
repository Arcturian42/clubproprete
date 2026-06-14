import { PageShell } from "@/components/page-shell";

export const metadata = {
  title: "Mentions légales — Club Propreté",
  description: "Mentions légales de la plateforme Club Propreté.",
};

export default function MentionsLegalesPage() {
  return (
    <PageShell
      eyebrow="Légal"
      title="Mentions légales"
      description="Informations légales concernant l'éditeur et l'hébergement de Club Propreté."
    >
      <div className="surface p-8 space-y-8">
        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">Éditeur du site</h2>
          <div className="text-sm font-medium leading-7 text-slate-600 space-y-1">
            <p><strong>Raison sociale :</strong> Club Propreté</p>
            <p><strong>Forme juridique :</strong> Association en cours de constitution</p>
            <p><strong>Siège social :</strong> France</p>
            <p><strong>Email :</strong> contact@clubproprete.com</p>
            <p><strong>Directeur de la publication :</strong> Administrateur Club Propreté</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">Hébergement</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Le site est hébergé sur une infrastructure cloud. Les données sont stockées sur des serveurs situés
            dans l'Union Européenne, conformément au RGPD.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">Propriété intellectuelle</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            L'ensemble du site (structure, design, textes, images, logo, code source) est la propriété exclusive de
            Club Propreté. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation
            préalable est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">Données personnelles</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Les données collectées sont traitées conformément à notre politique de confidentialité et au Règlement
            Général sur la Protection des Données (RGPD). Vous disposez d'un droit d'accès, de rectification,
            d'effacement et de portabilité de vos données.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">Cookies</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Le site utilise des cookies techniques strictement nécessaires au fonctionnement (session, authentification).
            Aucun cookie de traçage publicitaire n'est déposé sans consentement explicite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">Contact</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Pour toute question relative aux mentions légales ou au fonctionnement du site, contactez-nous à
            l'adresse <a href="mailto:contact@clubproprete.com" className="text-indigo-600 hover:underline font-bold">contact@clubproprete.com</a>.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
