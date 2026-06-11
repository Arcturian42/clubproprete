// Comparatifs visibles dans le méga menu (complément de initial.ts).
// Comparaisons par segments et cas d'usage, sans claims de marques :
// la mise en relation se fait via l'annuaire fournisseurs.

import type { ResourceContent } from "./types";

export const comparatifsContents: Record<string, ResourceContent> = {
  monobrosses: {
    intro:
      "Le choix d'une monobrosse se joue d'abord sur la vitesse de rotation : basse vitesse pour le décapage et les travaux mécaniques exigeants, haute vitesse pour le lustrage et la brillance, bi-vitesse pour la polyvalence. Viennent ensuite le diamètre du plateau (selon les surfaces), le poids (qui fait la puissance de décapage mais aussi la pénibilité) et les accessoires disponibles — c'est la machine la plus polyvalente du nettoyage mécanisé, à condition de prendre la bonne version.",
    sections: [
      {
        heading: "Basse, haute vitesse ou bi-vitesse : le critère décisif",
        table: {
          caption: "Types de monobrosses et usages recommandés",
          headers: ["Type", "Usages typiques", "Points forts", "Points de vigilance"],
          rows: [
            [
              "Basse vitesse",
              "Décapage, shampoing moquette, ponçage léger",
              "Couple élevé, polyvalence des travaux lourds",
              "Ne lustre pas ; technique de prise en main à acquérir",
            ],
            [
              "Haute vitesse",
              "Lustrage, spray méthode, brillance des sols protégés",
              "Rendu et productivité sur l'entretien des sols nobles",
              "Inadaptée au décapage ; sols durs uniquement",
            ],
            [
              "Bi-vitesse",
              "Structures qui font les deux types de travaux",
              "Une seule machine pour décaper et lustrer",
              "Prix supérieur ; compromis sur les usages extrêmes",
            ],
          ],
        },
      },
      {
        heading: "Les autres critères qui comptent",
        bullets: [
          "Diamètre du plateau : plus large = plus productif sur surfaces dégagées, moins maniable en zones encombrées.",
          "Poids : une machine lourde décape mieux mais fatigue davantage et se transporte mal entre sites.",
          "Accessoires et disques : vérifiez la disponibilité et le coût des brosses, plateaux et disques pour vos usages réels.",
          "Réservoir et alimentation : réservoir intégré pour le shampoing, longueur de câble adaptée à vos sites.",
          "SAV et pièces : comme pour toute machine, la disponibilité des pièces conditionne la durée de vie réelle.",
        ],
      },
      {
        heading: "Monobrosse ou autolaveuse ?",
        paragraphs: [
          "Les deux machines ne se remplacent pas : l'autolaveuse lave et sèche en un passage les surfaces régulières (entretien quotidien des grands sols), tandis que la monobrosse réalise les travaux mécaniques (décapage, lustrage, rénovation) et traite les zones où l'autolaveuse ne passe pas. Une entreprise qui fait de la remise en état a besoin d'une monobrosse ; une entreprise qui entretient de grandes surfaces a besoin d'une autolaveuse — beaucoup finissent par avoir les deux.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle monobrosse pour débuter en remise en état de sols ?",
        a: "Une basse vitesse de diamètre standard : c'est elle qui réalise les travaux facturés en remise en état (décapage, shampoing). Le lustrage haute vitesse s'ajoute ensuite si vos clients ont des sols protégés à entretenir régulièrement.",
      },
      {
        q: "Combien coûte une monobrosse professionnelle ?",
        a: "L'investissement reste nettement inférieur à celui d'une autolaveuse, avec un large éventail selon la gamme et les accessoires. Comptez le coût complet : disques et brosses consommables, transport entre sites et formation à la prise en main — une monobrosse mal maîtrisée abîme les sols.",
      },
      {
        q: "La prise en main d'une monobrosse est-elle difficile ?",
        a: "La basse vitesse demande un vrai apprentissage : la machine « tire » latéralement et se pilote par l'inclinaison du manche. Quelques heures de pratique encadrée suffisent généralement ; les CQP de branche incluent cette compétence (agent machiniste).",
      },
    ],
  },

  "logiciels-entreprises-nettoyage": {
    intro:
      "Les logiciels pour entreprises de nettoyage couvrent quatre besoins : la planification et le pointage des agents (le cœur du métier), le suivi qualité et la traçabilité des passages, la gestion commerciale (devis, contrats, facturation) et le portail client. Le bon choix dépend de votre taille et de votre priorité du moment : inutile de déployer une suite complète si le problème urgent est le planning — mieux vaut un outil bien adopté qu'une usine à gaz abandonnée.",
    sections: [
      {
        heading: "Les quatre familles de logiciels métier",
        table: {
          caption: "Familles de logiciels pour entreprises de propreté",
          headers: ["Famille", "Ce qu'elle résout", "Pour qui en priorité", "Points de vigilance"],
          rows: [
            [
              "Planning & pointage",
              "Affectations, remplacements, heures réelles, préparation paie",
              "Dès une dizaine d'agents multi-sites",
              "Adoption terrain (simplicité mobile) décisive",
            ],
            [
              "Qualité & traçabilité",
              "Passages horodatés, contrôles, photos, anomalies",
              "Contrats exigeants, appels d'offres",
              "Doit alimenter le reporting client sans ressaisie",
            ],
            [
              "Devis-facturation",
              "Chiffrage, contrats, facturation récurrente, relances",
              "Toutes tailles dès la création",
              "Gérer la récurrence mensuelle et les révisions de prix",
            ],
            [
              "Suites métier intégrées",
              "Tout-en-un planning + qualité + commercial",
              "PME structurées en croissance",
              "Coût et conduite du changement ; éviter la sur-configuration",
            ],
          ],
        },
      },
      {
        heading: "Comment choisir sans se tromper",
        bullets: [
          "Partez du problème le plus coûteux aujourd'hui (plannings chronophages ? litiges de passage ? facturation en retard ?) et traitez-le d'abord.",
          "Testez avec vos agents les moins technophiles : si l'application mobile ne passe pas ce test, le déploiement échouera.",
          "Vérifiez les exports : heures vers la paie, factures vers la comptabilité — la ressaisie annule le gain.",
          "Chiffrez le coût complet : abonnement par agent/par mois + paramétrage + formation, rapporté au temps réellement économisé.",
          "Demandez des références d'entreprises de propreté de votre taille — pas des références d'autres secteurs.",
        ],
      },
      {
        heading: "Les erreurs de déploiement classiques",
        bullets: [
          "Tout déployer d'un coup : commencez par un périmètre pilote (un secteur, un chef d'équipe motivé) avant de généraliser.",
          "Sous-estimer la conduite du changement : sans formation et sans relais terrain, l'outil le mieux choisi meurt en trois mois.",
          "Configurer pour des cas théoriques : collez à vos processus réels d'aujourd'hui, optimisez ensuite.",
          "Oublier la sortie : vérifiez la récupération de vos données si vous changez d'outil plus tard.",
        ],
      },
    ],
    faq: [
      {
        q: "À partir de quelle taille faut-il un logiciel de planning ?",
        a: "Le besoin devient critique autour d'une dizaine d'agents répartis sur plusieurs sites : les plannings sur tableur et les remplacements par téléphone consomment alors des heures hebdomadaires d'encadrement que l'outil rentabilise rapidement.",
      },
      {
        q: "Combien coûte un logiciel métier pour entreprise de nettoyage ?",
        a: "Les modèles sont généralement à l'abonnement, facturé par agent ou par utilisateur et par mois, avec des écarts importants selon le périmètre fonctionnel. Comparez en coût complet (abonnement + mise en place + formation) rapporté aux heures d'encadrement économisées et aux litiges évités.",
      },
      {
        q: "Faut-il un logiciel spécialisé propreté ou un outil généraliste ?",
        a: "Les spécificités du secteur — multi-sites, vacations courtes, remplacements, annexe 7, traçabilité des passages — plaident pour les solutions spécialisées dès que le planning devient le cœur du besoin. Les outils généralistes restent pertinents pour la seule facturation en début d'activité.",
      },
    ],
  },

  "aspirateurs-professionnels": {
    intro:
      "Le choix d'un aspirateur professionnel se résume à trois questions : poussière seule ou eau et poussière (selon vos prestations), traîneau ou dorsal (selon la configuration des sites), filaire ou batterie (selon l'organisation des vacations). S'y ajoutent la filtration (indispensable en environnements sensibles), le niveau sonore (critique pour le travail en journée) et la robustesse à l'usage intensif — un aspirateur professionnel travaille chaque jour, là où un modèle grand public s'épuise en quelques mois.",
    sections: [
      {
        heading: "Quel type d'aspirateur pour quel usage ?",
        table: {
          caption: "Types d'aspirateurs professionnels et usages",
          headers: ["Type", "Usages typiques", "Points forts", "Points de vigilance"],
          rows: [
            [
              "Traîneau poussière",
              "Entretien courant bureaux, circulations, moquettes",
              "Polyvalent, économique, capacité correcte",
              "Câble à gérer ; encombrement dans les zones denses",
            ],
            [
              "Dorsal",
              "Zones encombrées, escaliers, transports, open spaces denses",
              "Productivité et liberté de mouvement",
              "Poids porté : ergonomie et réglages essentiels",
            ],
            [
              "Eau et poussière",
              "Remises en état, fins de chantier, sinistres, sanitaires",
              "Polyvalence liquides/solides",
              "Plus lourd et bruyant ; entretien des filtres",
            ],
            [
              "Batterie (tous formats)",
              "Travail en journée, sites sans prises accessibles, interventions rapides",
              "Aucun câble, gain de temps et de sécurité",
              "Autonomie à valider sur vacation réelle ; coût batteries",
            ],
          ],
        },
      },
      {
        heading: "Les critères transverses à vérifier",
        bullets: [
          "Filtration : exigée en environnements sensibles (santé, laboratoires) et recommandée partout pour la qualité de l'air et la santé des agents.",
          "Niveau sonore : déterminant pour le nettoyage en journée en présence des occupants.",
          "Poids et ergonomie : un aspirateur porté ou monté quotidiennement dans les étages se choisit aussi au gramme.",
          "Consommables : prix et disponibilité des sacs et filtres — un coût récurrent souvent négligé à l'achat.",
          "Robustesse : châssis, câble renforcé, disponibilité des pièces — l'usage professionnel pardonne peu.",
        ],
      },
    ],
    faq: [
      {
        q: "Aspirateur dorsal ou traîneau : lequel choisir ?",
        a: "Le dorsal gagne en productivité dans les zones encombrées, les escaliers et les open spaces denses ; le traîneau reste plus confortable sur les grandes surfaces dégagées et pour les agents qui supportent mal le port. Beaucoup d'équipes mixent les deux selon les sites.",
      },
      {
        q: "Un aspirateur à batterie tient-il une vacation complète ?",
        a: "Sur les gammes professionnelles récentes, une vacation type d'entretien tertiaire est généralement couverte, surtout avec une seconde batterie en rotation. Validez l'autonomie réelle sur votre site avant l'achat : elle varie selon la puissance utilisée et le type de sols.",
      },
      {
        q: "Pourquoi ne pas utiliser un aspirateur grand public ?",
        a: "Parce qu'il n'est conçu ni pour l'usage quotidien intensif ni pour la réparation : moteur, filtration et durée de vie ne suivent pas, et le coût de remplacement répété dépasse vite l'écart de prix avec un matériel professionnel garanti et réparable.",
      },
    ],
  },

  "produits-nettoyage-ecologiques": {
    intro:
      "Comparer des produits de nettoyage écologiques se fait sur quatre critères objectifs : la certification (les écolabels officiels garantissent impact réduit ET efficacité testée, contrairement aux simples allégations marketing), le coût à l'usage (un concentré bien dosé bat un prêt-à-l'emploi « vert »), la couverture des besoins (sols, surfaces, sanitaires, vitres) et la sécurité d'utilisation (FDS, étiquetage, formation). L'enjeu : une gamme courte, certifiée et maîtrisée plutôt qu'une collection de bidons verts.",
    sections: [
      {
        heading: "Les critères de comparaison qui comptent",
        bullets: [
          "Certification officielle (Écolabel européen ou équivalent certifié) : la seule garantie vérifiée par tierce partie — méfiance envers les logos auto-déclarés.",
          "Coût à la dilution : comparez au litre de solution prête à l'emploi, pas au litre de bidon — les concentrés changent le calcul.",
          "Couverture de gamme : un fournisseur qui couvre sols, multi-surfaces, sanitaires et vitres simplifie commandes, formation et stockage.",
          "Sécurité : FDS disponibles, étiquetage clair, compatibilité avec vos systèmes de dosage.",
          "Logistique : disponibilité, délais, formats adaptés à vos sites, reprise éventuelle des emballages.",
        ],
      },
      {
        heading: "Construire une gamme écologique efficace (et courte)",
        bullets: [
          "Quatre à six références couvrent l'essentiel de l'entretien courant : nettoyant sols, multi-surfaces, sanitaire détartrant, vitres, dégraissant.",
          "Standardisez le dosage : centrales de dilution ou pompes doseuses — le surdosage ruine l'écologie et le budget à la fois.",
          "Formez les agents au changement : produits qui moussent moins, temps d'action différents — sans explication, le terrain surdose « pour compenser ».",
          "Conservez les produits réglementés là où ils s'imposent (désinfection normée) : l'écologie ne dispense pas des obligations.",
        ],
      },
      {
        heading: "Valoriser la démarche auprès des clients",
        bullets: [
          "Documentez : liste des produits avec labels, protocoles de dosage, FDS — un dossier prêt à joindre aux offres et mémoires techniques.",
          "Chiffrez les indicateurs simples : litres de chimie économisés, emballages évités — les acheteurs RSE y sont sensibles.",
          "Affichez la progressivité : une transition documentée site par site est plus crédible qu'un « 100 % vert » déclaratif.",
        ],
      },
    ],
    faq: [
      {
        q: "Quels labels écologiques sont fiables pour les produits d'entretien ?",
        a: "Les écolabels officiels certifiés par tierce partie — l'Écolabel européen est la référence la plus répandue pour les produits d'entretien professionnels. Les mentions auto-déclarées (« vert », « naturel », logos maison) n'offrent aucune garantie vérifiée.",
      },
      {
        q: "Les produits écologiques désinfectent-ils ?",
        a: "La désinfection répond à une réglementation spécifique (normes d'efficacité biocide) indépendante du caractère écologique. Certains produits certifiés répondent aux deux exigences ; vérifiez les normes revendiquées sur la fiche technique pour les usages qui exigent une désinfection prouvée.",
      },
      {
        q: "Comment éviter le greenwashing des fournisseurs ?",
        a: "Exigez trois preuves : le certificat du label officiel (numéro vérifiable), la FDS du produit, et la fiche technique avec dosages et tests d'efficacité. Un fournisseur sérieux les fournit immédiatement ; les autres parlent d'« ingrédients naturels ».",
      },
    ],
  },

  "louer-ou-acheter-autolaveuse": {
    intro:
      "La règle de décision est simple : achetez une machine qui travaillera régulièrement sur des contrats durables (l'amortissement joue pour vous), louez pour les besoins ponctuels, les contrats à durée incertaine ou pour tester avant d'investir, et passez par le leasing/la location longue durée pour équiper sans immobiliser la trésorerie, maintenance incluse. À machine équivalente, c'est la stabilité de votre besoin — pas le prix affiché — qui détermine la bonne formule.",
    sections: [
      {
        heading: "Comparer les quatre formules",
        table: {
          caption: "Formules d'équipement en autolaveuse",
          headers: ["Formule", "Quand elle s'impose", "Avantages", "Inconvénients"],
          rows: [
            [
              "Achat",
              "Usage régulier sur contrats stables",
              "Coût total minimal à long terme ; actif au bilan",
              "Trésorerie immobilisée ; maintenance à organiser",
            ],
            [
              "Location courte durée",
              "Remises en état, fins de chantier, pics ponctuels",
              "Zéro engagement ; machine adaptée à chaque chantier",
              "Coût journalier élevé ; disponibilité à anticiper",
            ],
            [
              "Location longue durée / leasing",
              "Équipement d'un contrat pluriannuel sans immobiliser",
              "Loyer lissé, maintenance souvent incluse, machine récente",
              "Coût total supérieur à l'achat ; engagement sur la durée",
            ],
            [
              "Occasion / reconditionné",
              "Budget serré avec usage régulier",
              "Prix d'entrée réduit pour une machine pro",
              "Historique et batteries à vérifier ; garantie limitée",
            ],
          ],
        },
      },
      {
        heading: "Le calcul à faire avant de décider",
        bullets: [
          "Estimez les heures d'utilisation mensuelles réelles : une machine sous-utilisée détruit l'avantage de l'achat.",
          "Comparez sur la durée du contrat support : coût d'achat + maintenance + batteries vs loyers cumulés sur la même période.",
          "Intégrez le risque de perte du contrat : si la machine ne sert qu'à un client, la location longue durée alignée sur le contrat protège.",
          "Vérifiez les aides : les dispositifs de prévention peuvent subventionner l'achat de matériel de mécanisation — l'association Club Propreté accompagne ses membres sur ces dossiers.",
        ],
      },
      {
        heading: "Les pièges des deux côtés",
        bullets: [
          "À l'achat : oublier le contrat de maintenance et le remplacement des batteries — les deux postes qui font le coût réel.",
          "En location : les clauses de remise en état et d'assurance en fin de contrat, parfois coûteuses.",
          "Dans les deux cas : choisir la machine avant de connaître le site — testez sur place avec vos agents avant tout engagement.",
        ],
      },
    ],
    faq: [
      {
        q: "À partir de quel usage l'achat d'une autolaveuse devient-il rentable ?",
        a: "Dès que la machine travaille régulièrement chaque semaine sur des contrats dont la durée couvre l'amortissement. En dessous, la location courte durée à la prestation reste plus économique ; entre les deux, le leasing avec maintenance lisse le risque.",
      },
      {
        q: "Le leasing d'autolaveuse inclut-il la maintenance ?",
        a: "Souvent, mais pas systématiquement : vérifiez le périmètre exact (pièces d'usure, batteries, délais d'intervention, machine de remplacement). Une formule « full service » avec machine de prêt en cas de panne vaut généralement son surcoût pour un prestataire engagé contractuellement.",
      },
      {
        q: "Une autolaveuse d'occasion est-elle un bon plan ?",
        a: "Oui si trois conditions sont réunies : un historique d'entretien vérifiable, des batteries récentes ou remplacées (premier poste de coût caché), et la disponibilité des pièces auprès d'un distributeur. Achetez de préférence reconditionné avec garantie auprès d'un professionnel.",
      },
    ],
  },
};
