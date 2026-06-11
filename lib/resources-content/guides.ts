// Guides métier visibles dans le méga menu (complément de initial.ts).

import type { ResourceContent } from "./types";

export const guidesContents: Record<string, ResourceContent> = {
  "recruter-agents-entretien": {
    intro:
      "Pour recruter des agents d'entretien dans un marché en tension, il faut combiner plusieurs canaux de sourcing (France Travail, candidatures spontanées, cooptation, job boards spécialisés), une fiche de poste claire et réaliste, un processus de sélection rapide — les bons candidats partent en quelques jours — et surtout une politique de fidélisation : dans la propreté, mieux vaut garder un bon agent que devoir en recruter trois.",
    sections: [
      {
        heading: "Où trouver des candidats agents d'entretien ?",
        bullets: [
          "France Travail et missions locales : le canal le plus volumique, gratuit, avec des dispositifs d'aide à l'embauche selon les profils.",
          "La cooptation : vos meilleurs agents connaissent souvent d'autres bons professionnels — une prime de cooptation coûte moins cher qu'une annonce.",
          "Les job boards spécialisés secteur, dont l'espace emploi de Club Propreté, où les candidats cherchent spécifiquement des postes de propreté.",
          "Les candidatures spontanées et le vivier : conservez et recontactez les candidats sérieux non retenus.",
          "L'intérim d'insertion et les structures IAE : un moyen de tester une collaboration avant l'embauche.",
        ],
      },
      {
        heading: "Rédiger une annonce qui attire les bons profils",
        bullets: [
          "Soyez concret : lieu exact, horaires précis, volume hebdomadaire, type de site — les agents choisissent d'abord sur la compatibilité avec leurs contraintes.",
          "Annoncez le salaire : la grille conventionnelle est publique, la cacher fait perdre des candidatures.",
          "Valorisez ce qui compte vraiment : stabilité du planning, sites regroupés, matériel fourni, encadrement présent, perspectives (chef d'équipe).",
          "Simplifiez la candidature : un appel ou un SMS suffit — exiger CV et lettre de motivation filtre surtout les bons profils peu à l'aise avec l'écrit.",
        ],
      },
      {
        heading: "Sélectionner vite et bien",
        paragraphs: [
          "Dans la propreté, le délai entre candidature et réponse est un facteur de réussite majeur : un candidat disponible reçoit souvent plusieurs propositions la même semaine. Privilégiez un entretien court et concret — disponibilités réelles, mobilité, expérience des types de sites — suivi si possible d'une mise en situation ou d'une période d'essai bien accompagnée.",
        ],
        bullets: [
          "Répondez à toute candidature sous 48 h, même négativement : votre réputation locale d'employeur se construit là.",
          "Vérifiez les fondamentaux : droit de travailler, mobilité réelle vers les sites, compatibilité d'horaires.",
          "Évaluez le savoir-être avant le savoir-faire : la technique s'apprend, la fiabilité beaucoup moins.",
        ],
      },
      {
        heading: "Fidéliser : le vrai levier contre la pénurie",
        bullets: [
          "Des plannings stables et des sites regroupés : la première cause de départ est l'amplitude et les déplacements subis.",
          "Un accueil structuré : binôme les premiers jours, consignes écrites, matériel en état — un agent lâché seul le premier soir ne reste pas.",
          "De la reconnaissance concrète : remplacements équitablement répartis, heures complémentaires proposées aux volontaires, primes de site.",
          "Des perspectives : formation (CQP), évolution vers chef d'équipe, polyvalence vitrerie ou mécanisation mieux rémunérée.",
        ],
      },
    ],
    faq: [
      {
        q: "Quel salaire pour un agent d'entretien ?",
        a: "La rémunération minimale est fixée par la grille de la convention collective des entreprises de propreté, selon l'échelon et l'ancienneté, revalorisée régulièrement. En pratique, les zones tendues et les horaires contraignants imposent souvent de se positionner au-dessus du minimum conventionnel pour attirer et garder les bons profils.",
      },
      {
        q: "Faut-il un diplôme pour être agent d'entretien ?",
        a: "Non, le métier est accessible sans diplôme. Les certifications de branche (CQP agent machiniste, agent d'entretien et rénovation…) et les habilitations spécifiques constituent en revanche de vrais accélérateurs d'évolution et des arguments commerciaux pour l'employeur.",
      },
      {
        q: "Comment réduire le turnover des agents de propreté ?",
        a: "En agissant sur les causes réelles de départ : plannings morcelés, sites éloignés, absence d'accueil et d'encadrement, manque de reconnaissance. Les entreprises qui regroupent les sites, stabilisent les horaires et structurent l'intégration constatent un turnover nettement inférieur à la moyenne du secteur.",
      },
      {
        q: "Quelles aides à l'embauche pour une entreprise de nettoyage ?",
        a: "Selon les profils recrutés, des dispositifs publics peuvent réduire le coût d'embauche : contrats de professionnalisation et d'apprentissage, aides à l'embauche de demandeurs d'emploi ou de travailleurs handicapés, dispositifs d'insertion. Renseignez-vous auprès de France Travail et de votre OPCO avant chaque recrutement.",
      },
    ],
  },

  "developper-entreprise-nettoyage": {
    intro:
      "Développer une entreprise de nettoyage repose sur quatre piliers : sécuriser la rentabilité des contrats existants (la croissance ne répare pas des marges négatives), structurer l'encadrement intermédiaire pour ne plus dépendre du dirigeant, systématiser l'acquisition de nouveaux contrats, et diversifier progressivement les prestations vers des segments mieux margés. Passer de l'artisan débordé à l'entreprise structurée est avant tout un enjeu d'organisation, pas de volume.",
    sections: [
      {
        heading: "Étape 1 — Assainir avant de grandir",
        bullets: [
          "Mesurez la marge réelle de chaque contrat : temps passés réels, déplacements, remplacements — beaucoup d'entreprises découvrent des contrats déficitaires qu'elles « compensent » avec les autres.",
          "Renégociez ou abandonnez les contrats structurellement perdants : grossir avec eux, c'est industrialiser la perte.",
          "Standardisez vos méthodes : fiches de poste par site, protocoles, dotations matériel — la condition pour déléguer sans perte de qualité.",
        ],
      },
      {
        heading: "Étape 2 — Structurer l'encadrement",
        paragraphs: [
          "Le plafond de verre classique du secteur se situe au moment où le dirigeant ne peut plus tout contrôler lui-même. Le passage de cap exige un premier relais terrain : chef d'équipe ou responsable de secteur, souvent promu en interne, qui prend en charge contrôles qualité, plannings et remplacements sur un portefeuille de sites.",
        ],
        bullets: [
          "Promouvoir en interne d'abord : un bon agent qui connaît vos méthodes et vos clients est le meilleur candidat chef d'équipe.",
          "Formaliser le rôle : périmètre de sites, autonomie de décision, temps d'encadrement dédié et rémunéré.",
          "Outiller le pilotage : contrôles qualité tracés, remontées d'anomalies, tableaux de bord simples (heures, marge, réclamations).",
        ],
      },
      {
        heading: "Étape 3 — Systématiser l'acquisition",
        bullets: [
          "Transformez la recommandation en processus : demande systématique de mise en relation après chaque trimestre réussi.",
          "Capitalisez sur la visibilité : fiche Google active, annuaires professionnels (dont Club Propreté), site avec preuves et références.",
          "Montez en gamme commerciale : réponses aux consultations privées puis aux appels d'offres publics, avec une bibliothèque de mémoires réutilisable.",
          "Suivez votre pipeline : un simple tableau prospects/relances/devis suffit à doubler le taux de transformation par rapport au « au fil de l'eau ».",
        ],
      },
      {
        heading: "Étape 4 — Diversifier intelligemment",
        bullets: [
          "Prestations connexes vendues aux clients existants : vitrerie, remises en état périodiques, espaces verts légers, gestion des déchets — le coût d'acquisition est nul.",
          "Segments mieux margés à technicité supérieure : santé, agroalimentaire, fin de chantier — en s'équipant et en se formant avant de vendre.",
          "Sous-traitance maîtrisée : confier les débordements à des partenaires fiables (réseau, association) plutôt que de refuser ou de mal servir.",
          "Mécanisation des grandes surfaces : une autolaveuse bien amortie améliore marge et conditions de travail simultanément.",
        ],
      },
      {
        heading: "Les pièges de la croissance",
        bullets: [
          "Le gros contrat qui déséquilibre tout : au-delà d'une part trop importante du chiffre d'affaires, un seul client peut emporter l'entreprise en partant.",
          "La trésorerie oubliée : la croissance consomme du cash (salaires avancés, délais de paiement) — anticipez avec votre banque avant d'en avoir besoin.",
          "L'embauche en retard : recruter sous la contrainte coûte plus cher que recruter en anticipation.",
          "La qualité qui décroche : chaque nouveau site doit entrer dans le système de contrôle dès la première semaine.",
        ],
      },
    ],
    faq: [
      {
        q: "Quel chiffre d'affaires peut atteindre une entreprise de nettoyage ?",
        a: "Il n'y a pas de plafond type : le secteur compte aussi bien des indépendants que des PME régionales à plusieurs millions d'euros et des groupes nationaux. Les paliers structurants sont moins le chiffre d'affaires que les caps d'organisation : premier salarié, premier encadrant, premier appel d'offres gagné.",
      },
      {
        q: "Faut-il se spécialiser ou rester généraliste ?",
        a: "Les deux modèles fonctionnent. La spécialisation (santé, agroalimentaire, vitrerie, fin de chantier) protège les marges et la différenciation ; le généraliste de proximité gagne sur la densité géographique et la relation client. Le piège est l'entre-deux : accepter tout, partout, sans excellence nulle part.",
      },
      {
        q: "Comment financer la croissance d'une entreprise de nettoyage ?",
        a: "Principalement par l'autofinancement (d'où l'importance des marges), complété par le crédit bancaire pour le matériel et les véhicules, le leasing pour la mécanisation, et les dispositifs d'aide à l'équipement de prévention. La trésorerie liée aux délais de paiement B2B se gère avec des lignes court terme négociées en amont.",
      },
    ],
  },
};
