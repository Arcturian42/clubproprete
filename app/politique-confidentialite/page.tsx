import { PageShell } from "@/components/page-shell";

export const metadata = {
  title: "Politique de confidentialité — Club Propreté",
  description: "Politique de confidentialité et de protection des données personnelles de Club Propreté.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <PageShell
      eyebrow="Légal"
      title="Politique de confidentialité"
      description="Comment Club Propreté collecte, utilise et protège vos données personnelles."
    >
      <div className="surface p-8 space-y-8">
        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">1. Responsable du traitement</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Le responsable du traitement des données est Club Propreté. Contact : contact@clubproprete.com.
            Les données sont hébergées sur des serveurs situés dans l'Union Européenne.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">2. Données collectées</h2>
          <ul className="list-disc list-inside text-sm font-medium leading-7 text-slate-600 space-y-1">
            <li>Identité (nom, prénom, email, téléphone)</li>
            <li>Informations professionnelles (société, SIRET, adresse, ville, site web)</li>
            <li>Documents professionnels (CV, certifications, logo)</li>
            <li>Données de navigation et de connexion</li>
            <li>Préférences newsletter et consentements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">3. Finalités</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Les données sont collectées pour : créer et gérer votre compte, référencer votre profil professionnel,
            permettre la mise en relation entre professionnels, envoyer la newsletter (avec consentement),
            assurer la modération et la sécurité de la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">4. Base légale</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Le traitement repose sur l'exécution du contrat (CGU), l'intérêt légitime (sécurité, modération) et
            le consentement explicite pour la newsletter et les cookies non essentiels.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">5. Durée de conservation</h2>
          <ul className="list-disc list-inside text-sm font-medium leading-7 text-slate-600 space-y-1">
            <li>Données de compte : 3 ans après la dernière activité</li>
            <li>Candidatures : 1 an après la clôture de l'offre</li>
            <li>Données newsletter : jusqu'au désabonnement</li>
            <li>Logs de sécurité : 1 an</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">6. Vos droits</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-sm font-medium leading-7 text-slate-600 space-y-1 mt-2">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition et de limitation du traitement</li>
            <li>Droit de retirer votre consentement à tout moment</li>
          </ul>
          <p className="text-sm font-medium leading-7 text-slate-600 mt-2">
            Pour exercer ces droits, contactez-nous à <a href="mailto:contact@clubproprete.com" className="text-indigo-600 hover:underline font-bold">contact@clubproprete.com</a>.
            Vous pouvez également introduire une réclamation auprès de la CNIL.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">7. Sécurité</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
            chiffrement des mots de passe (bcrypt), connexions HTTPS, headers de sécurité (CSP, HSTS),
            accès restreints et journalisation des actions administratives.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">8. Sous-traitants</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Club Propreté peut faire appel à des sous-traitants pour l'hébergement et l'envoi d'emails.
            Ces sous-traitants sont soumis à des obligations contractuelles de confidentialité et de sécurité
            conformes au RGPD.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">9. Modifications</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Cette politique peut être modifiée à tout moment. La date de dernière mise à jour est indiquée
            ci-dessous. Nous vous invitons à la consulter régulièrement.
          </p>
          <p className="text-xs font-bold text-slate-400 mt-2">Dernière mise à jour : 9 juin 2026</p>
        </section>
      </div>
    </PageShell>
  );
}
