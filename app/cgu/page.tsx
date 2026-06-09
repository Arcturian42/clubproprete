import { PageShell } from "@/components/page-shell";

export const metadata = {
  title: "Conditions générales d'utilisation — Club Propreté",
  description: "Conditions générales d'utilisation de la plateforme Club Propreté.",
};

export default function CGUPage() {
  return (
    <PageShell
      eyebrow="Légal"
      title="Conditions générales d'utilisation"
      description="Les présentes conditions régissent l'utilisation de la plateforme Club Propreté."
    >
      <div className="surface p-8 space-y-8">
        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">1. Objet</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Club Propreté est une plateforme B2B gratuite dédiée aux professionnels du nettoyage. Elle propose des annuaires,
            un job board, un espace formations, un module association et un espace sous-traitance privé entre membres vérifiés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">2. Accès et inscription</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            L'accès aux services nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes
            et à les maintenir à jour. Chaque compte est strictement personnel. Le mot de passe est stocké de manière sécurisée
            (hashé) et ne transite jamais en clair.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">3. Services gratuits</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Tous les services de la V0/V1 sont gratuits. Aucun paiement, abonnement, sponsoring ou appel d'offres public
            n'est proposé. Club Propreté se réserve le droit d'introduire des services payants ultérieurement avec
            information préalable des utilisateurs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">4. Vérification et modération</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Les fiches société, fournisseur, indépendant et formation sont soumises à une validation manuelle par
            l'administration. Club Propreté se réserve le droit de refuser, suspendre ou supprimer tout contenu ne
            respectant pas les règles de qualité ou la réglementation en vigueur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">5. Responsabilité</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Club Propreté agit comme intermédiaire technique et ne peut être tenu responsable des litiges entre
            utilisateurs. Les utilisateurs sont seuls responsables des informations publiées sur leur profil et des
            conséquences de leurs échanges.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">6. Propriété intellectuelle</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Les contenus publiés par les utilisateurs restent leur propriété. En publiant sur Club Propreté, l'utilisateur
            accorde une licence non exclusive pour la diffusion sur la plateforme. Le design, le code et la marque
            Club Propreté sont protégés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">7. Modification des CGU</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés par email ou
            notification sur la plateforme. L'utilisation continue des services vaut acceptation des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-3">8. Droit applicable</h2>
          <p className="text-sm font-medium leading-7 text-slate-600">
            Les présentes conditions sont soumises au droit français. En cas de litige, les parties rechercheront une
            solution amiable avant toute action judiciaire.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
