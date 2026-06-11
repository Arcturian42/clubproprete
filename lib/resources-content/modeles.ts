// Modèles & templates visibles dans le méga menu (complément de initial.ts).

import type { ResourceContent } from "./types";

export const modelesContents: Record<string, ResourceContent> = {
  "contrat-prestation-nettoyage": {
    intro:
      "Un contrat de prestation de nettoyage formalise la relation entre le prestataire et son client : périmètre des prestations (en annexant le cahier des charges), prix et révision, durée et renouvellement, obligations réciproques, assurances et conditions de résiliation. C'est lui qui sécurise vos revenus récurrents — un contrat d'entretien sans écrit solide peut s'arrêter du jour au lendemain, avec le personnel affecté sur les bras.",
    sections: [
      {
        heading: "Les clauses indispensables d'un contrat de nettoyage",
        bullets: [
          "Identification des parties et objet : sites concernés, nature des prestations, renvoi au cahier des charges annexé.",
          "Durée et renouvellement : date d'effet, durée initiale, tacite reconduction éventuelle et fenêtres de dénonciation.",
          "Prix : montant et périodicité de facturation, prestations incluses/exclues, conditions des prestations supplémentaires.",
          "Clause de révision des prix : indispensable — les salaires conventionnels de la propreté sont revalorisés régulièrement et représentent l'essentiel de vos coûts.",
          "Conditions de paiement : délai, pénalités de retard et indemnité forfaitaire de recouvrement (mentions obligatoires en B2B).",
          "Obligations du client : accès aux locaux, fluides, local de stockage, information sur les risques du site.",
          "Assurances et responsabilité : RC professionnelle du prestataire, plafonds éventuels, gestion des clés et badges.",
          "Résiliation : préavis de part et d'autre, cas de résiliation pour faute, sort du préavis non effectué.",
        ],
      },
      {
        heading: "Durée et préavis : protéger la récurrence",
        paragraphs: [
          "L'équilibre économique d'un contrat d'entretien repose sur sa durée : vous investissez en début de contrat (mise en place, dotation matériel, formation au site) et vous vous rémunérez dans la durée. Un préavis de résiliation suffisant — couramment trois mois pour un contrat annuel — vous laisse le temps de redéployer le personnel et de compenser commercialement la perte.",
        ],
      },
      {
        heading: "Le lien avec l'annexe 7 (reprise du personnel)",
        bullets: [
          "Si votre client passe à un autre prestataire, le dispositif conventionnel de reprise du personnel peut s'appliquer : les agents affectés au site sont repris par le successeur sous conditions.",
          "Tenez à jour les éléments qui seront demandés : affectations, ancienneté, contrats des agents par site.",
          "À l'inverse, intégrez ce risque quand vous reprenez un marché : demandez la liste du personnel reprenable avant de chiffrer.",
        ],
      },
      {
        heading: "Les erreurs qui coûtent cher",
        bullets: [
          "Démarrer la prestation avant signature : en cas de litige, vous n'avez ni périmètre opposable ni conditions de paiement.",
          "Oublier la révision des prix : à grille conventionnelle en hausse et prix figé, la marge s'évapore mécaniquement.",
          "Un périmètre flou (« entretien des locaux ») : chaque demande additionnelle devient un débat au lieu d'un avenant facturé.",
          "Ne pas encadrer les prestations exceptionnelles : remises en état et interventions d'urgence méritent leurs propres conditions tarifaires.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle durée pour un contrat de nettoyage ?",
        a: "L'usage en B2B est un contrat d'un an renouvelable par tacite reconduction, avec un préavis de dénonciation de un à trois mois. Les marchés plus importants se concluent souvent sur deux à quatre ans, ce qui sécurise les investissements de mise en place.",
      },
      {
        q: "Un devis signé suffit-il ou faut-il un contrat ?",
        a: "Un devis signé vaut accord sur la prestation et le prix, et peut suffire pour une intervention ponctuelle. Pour de l'entretien récurrent, le contrat reste indispensable : durée, révision des prix, préavis et responsabilités ne figurent pas dans un devis.",
      },
      {
        q: "Comment augmenter le prix d'un contrat en cours ?",
        a: "Par la clause de révision prévue au contrat (indexation ou révision annuelle négociée), en vous appuyant sur des éléments objectifs comme la revalorisation de la grille conventionnelle. Sans clause, toute hausse exige l'accord du client — d'où l'importance de la prévoir dès la signature.",
      },
    ],
  },

  "fiche-poste-agent-entretien": {
    intro:
      "Une fiche de poste d'agent d'entretien décrit la mission, les tâches par site, les horaires et lieux d'intervention, le matériel et les produits utilisés, les consignes de sécurité et les critères d'évaluation. Elle sert trois usages : recruter sur des bases claires, intégrer et former efficacement, puis évaluer objectivement. C'est aussi une pièce utile en cas de litige prud'homal sur le contenu réel du poste.",
    sections: [
      {
        heading: "Que doit contenir une fiche de poste d'agent d'entretien ?",
        bullets: [
          "Intitulé et positionnement : agent de service, agent machiniste, chef d'équipe — en cohérence avec la classification conventionnelle.",
          "Rattachement : responsable direct, site(s) d'affectation, horaires et jours d'intervention.",
          "Missions principales : liste des tâches par zone et fréquence (en cohérence avec le cahier des charges du site).",
          "Matériel et produits : équipements utilisés, dotation EPI, règles de dosage et de stockage.",
          "Consignes de sécurité : gestes et postures, produits chimiques, travail isolé le cas échéant, conduite à tenir en cas d'incident.",
          "Qualité : autocontrôle attendu, traçabilité (feuille de passage, application mobile), gestion des réclamations.",
          "Compétences et savoir-être attendus : ponctualité, discrétion, autonomie, relation avec les occupants du site.",
        ],
      },
      {
        heading: "Adapter la fiche au site, pas l'inverse",
        paragraphs: [
          "Une fiche de poste générique recopiée pour tous les sites ne sert à rien : c'est la déclinaison concrète — ce site, ces zones, ces horaires, ces consignes spécifiques du client — qui rend la fiche utile à l'agent et opposable en cas de désaccord. Le bon réflexe : une trame commune, déclinée par site en une page lors de chaque prise de poste.",
        ],
      },
      {
        heading: "La fiche de poste comme outil de management",
        bullets: [
          "À l'embauche : elle cadre l'entretien et évite les malentendus sur le contenu réel du poste.",
          "À l'intégration : elle structure le parcours d'accueil et la formation au site.",
          "En suivi : elle sert de référence aux contrôles qualité et aux entretiens annuels.",
          "En évolution : elle objective le passage vers agent machiniste ou chef d'équipe (nouvelles tâches, nouvelle classification).",
        ],
      },
    ],
    faq: [
      {
        q: "La fiche de poste est-elle obligatoire ?",
        a: "Non, aucune obligation légale générale n'impose la fiche de poste. Elle est en revanche fortement recommandée : elle clarifie la relation de travail, facilite l'évaluation des risques professionnels poste par poste (utile au DUERP) et constitue un élément de preuve en cas de contentieux.",
      },
      {
        q: "Quelle différence entre fiche de poste et contrat de travail ?",
        a: "Le contrat de travail crée la relation juridique (durée, rémunération, classification) ; la fiche de poste décrit le contenu opérationnel du travail. La fiche peut évoluer avec l'organisation sans avenant, tant qu'elle ne modifie pas un élément essentiel du contrat.",
      },
      {
        q: "Qui rédige la fiche de poste ?",
        a: "L'employeur ou l'encadrant direct, idéalement en associant un agent expérimenté du poste concerné : c'est le meilleur moyen d'obtenir une fiche réaliste, à jour des tâches réelles et des contraintes du site.",
      },
    ],
  },

  "rapport-intervention-nettoyage": {
    intro:
      "Un rapport d'intervention de nettoyage trace ce qui a été réalisé lors d'un passage : date et heure, agent, tâches effectuées, anomalies constatées (dégradations, dysfonctionnements, consommables manquants) et, le cas échéant, validation du client. C'est l'outil de base de la traçabilité : il prouve la prestation, objective la qualité et désamorce la plupart des litiges « personne n'est passé ».",
    sections: [
      {
        heading: "Que doit contenir un rapport d'intervention ?",
        bullets: [
          "Identification : site, date, heure d'arrivée et de départ, nom de l'agent ou de l'équipe.",
          "Prestations réalisées : cases à cocher par zone/tâche plutôt que texte libre — plus rapide et plus exploitable.",
          "Anomalies constatées : dégradation, équipement défectueux, accès impossible à une zone, produit manquant.",
          "Observations et demandes du client recueillies sur place.",
          "Signature ou validation : visa du client quand c'est possible, sinon horodatage de l'application ou photo.",
        ],
      },
      {
        heading: "Papier ou numérique ?",
        paragraphs: [
          "La feuille de passage papier reste répandue et suffit sur les petits sites, mais elle se perd, se falsifie et ne remonte pas l'information. Les solutions numériques (application mobile, QR code scanné sur site) horodatent les passages, photographient les anomalies et alimentent automatiquement le reporting client — un argument commercial croissant face aux donneurs d'ordre qui exigent de la traçabilité.",
        ],
      },
      {
        heading: "Exploiter les rapports plutôt que les empiler",
        bullets: [
          "Traitez chaque anomalie remontée : un rapport ignoré apprend aux agents que la traçabilité ne sert à rien.",
          "Compilez par site : récurrence d'anomalies = problème d'organisation, de dotation ou de cadence à corriger.",
          "Partagez avec le client : un point qualité mensuel appuyé sur les rapports renforce la relation et prépare la révision du contrat.",
          "Reliez aux contrôles qualité : rapports d'intervention (quotidien) et grilles de contrôle (périodique) forment ensemble la preuve de la qualité.",
        ],
      },
    ],
    faq: [
      {
        q: "Le rapport d'intervention est-il obligatoire ?",
        a: "Il n'est pas imposé par la loi pour le nettoyage courant, mais il est souvent exigé contractuellement par les clients, et il devient indispensable dès qu'un litige survient : sans trace des passages, la parole du prestataire vaut celle du réclamant.",
      },
      {
        q: "Qui doit signer le rapport d'intervention ?",
        a: "L'agent qui a réalisé la prestation, et idéalement un représentant du client quand le site est occupé. Sur les sites vides (interventions tôt ou tard), l'horodatage numérique ou la photo remplacent utilement le visa client.",
      },
      {
        q: "Combien de temps conserver les rapports d'intervention ?",
        a: "Au minimum la durée du contrat plus la période de prescription contractuelle. En pratique, un archivage numérique de cinq ans est une règle simple et sûre, qui couvre les litiges commerciaux courants.",
      },
    ],
  },
};
