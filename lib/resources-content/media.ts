// Rubriques média visibles dans le méga menu (complément de initial.ts).
// Ces pages sont des hubs éditoriaux : elles posent le cadre de la rubrique
// et seront alimentées en continu par les articles publiés via l'espace auteur.

import type { ResourceContent } from "./types";

export const mediaContents: Record<string, ResourceContent> = {
  "actualites-secteur-proprete": {
    intro:
      "Cette rubrique suit l'actualité du secteur de la propreté en France : évolutions de la convention collective et des salaires, réglementation, mouvements des grands acteurs, marchés et appels d'offres significatifs, initiatives de la branche. L'objectif : permettre aux dirigeants, indépendants et fournisseurs de rester informés sans dépouiller dix sources — l'essentiel, contextualisé pour les professionnels du terrain.",
    sections: [
      {
        heading: "Ce que nous couvrons",
        bullets: [
          "Social et conventionnel : revalorisations de la grille des salaires, accords de branche, annexe 7 et jurisprudences marquantes.",
          "Réglementation : évolutions du droit du travail, sécurité, produits, environnement et achats publics qui impactent les prestataires.",
          "Marché : consolidations, arrivées de nouveaux acteurs, grands contrats, dynamique des segments (tertiaire, santé, industrie).",
          "Branche et institutions : initiatives de la fédération professionnelle, campagnes de valorisation des métiers, données de l'observatoire.",
        ],
      },
      {
        heading: "Pourquoi suivre l'actualité du secteur change la gestion au quotidien",
        paragraphs: [
          "Les revalorisations conventionnelles déterminent vos coûts et le calendrier de vos révisions de prix ; les évolutions réglementaires créent des obligations (et des arguments commerciaux pour les plus réactifs) ; les mouvements de marché annoncent les appels d'offres et les opportunités de reprise. Une veille structurée n'est pas du confort : c'est un outil de pilotage.",
        ],
      },
      {
        heading: "Comment recevoir l'essentiel",
        bullets: [
          "Les articles de la rubrique sont publiés au fil de l'actualité par l'équipe et les contributeurs de Club Propreté.",
          "La newsletter sectorielle reprend l'essentiel à intervalle régulier : inscription gratuite depuis la page Ressources.",
          "Les membres de l'association reçoivent en complément une newsletter privée avec décryptages approfondis.",
        ],
      },
    ],
    faq: [
      {
        q: "À quelle fréquence la grille des salaires de la propreté évolue-t-elle ?",
        a: "La grille conventionnelle fait l'objet de négociations de branche régulières, généralement au moins une fois par an. Chaque revalorisation impacte directement les coûts des prestataires : c'est l'actualité à suivre en priorité pour caler ses révisions de prix contractuelles.",
      },
      {
        q: "Comment proposer une actualité ou un communiqué à la rédaction ?",
        a: "Les professionnels du secteur peuvent devenir contributeurs via l'espace auteur de Club Propreté, ou contacter l'équipe à contact@clubproprete.com pour signaler une actualité, un événement ou une initiative à couvrir.",
      },
    ],
  },

  "tendances-nettoyage-professionnel": {
    intro:
      "Le nettoyage professionnel vit une transformation de fond portée par quatre tendances structurantes : le travail en journée et en continu qui réorganise les prestations, les exigences RSE des donneurs d'ordre qui redéfinissent les critères d'achat, la mécanisation et la robotisation qui montent en puissance sur les grandes surfaces, et la digitalisation du pilotage qui devient un standard attendu. Cette rubrique décrypte ces évolutions et ce qu'elles changent concrètement pour les prestataires.",
    sections: [
      {
        heading: "Les quatre tendances de fond",
        bullets: [
          "Le travail en journée : poussé par les donneurs d'ordre publics et privés, il améliore les conditions de travail, rend les agents visibles et change la relation de service — mais exige de repenser l'organisation des prestations.",
          "La RSE comme critère d'achat : produits éco-labellisés, clauses sociales, bilan carbone des prestations — les consultations intègrent de plus en plus ces exigences, qui deviennent des différenciants.",
          "Mécanisation et robotique : autolaveuses autonomes, matériel connecté, données d'usage — la productivité progresse sur les grandes surfaces, le métier glisse vers la supervision.",
          "Digitalisation du pilotage : traçabilité des passages, contrôles qualité sur mobile, portails clients — la preuve de service devient un standard attendu, plus seulement un plus.",
        ],
      },
      {
        heading: "Ce que ces tendances changent pour un prestataire",
        bullets: [
          "Commercialement : savoir proposer le travail en journée et documenter sa démarche RSE ouvre des consultations autrefois inaccessibles.",
          "Opérationnellement : la mécanisation se rentabilise par la densité — regrouper les sites devient encore plus stratégique.",
          "Socialement : le travail en journée et la mécanisation sont aussi des arguments de recrutement et de fidélisation des agents.",
          "Sur la preuve : tracer ses passages et ses contrôles n'est plus optionnel face à des acheteurs qui comparent sur la transparence.",
        ],
      },
    ],
    faq: [
      {
        q: "Le nettoyage en journée va-t-il devenir la norme ?",
        a: "La dynamique est clairement engagée, portée par les donneurs d'ordre publics et les grandes entreprises, parce qu'il améliore les conditions de travail et valorise les agents. Tous les sites ne s'y prêtent pas, mais savoir le proposer et l'organiser devient un avantage concurrentiel net.",
      },
      {
        q: "Les robots vont-ils remplacer les agents de propreté ?",
        a: "Non à horizon prévisible : la robotisation traite des tâches répétitives sur grandes surfaces dégagées, soit une fraction du métier. Elle déplace le travail vers la supervision, les finitions et les zones complexes — et répond surtout à la difficulté de recruter, pas à une volonté de remplacer.",
      },
    ],
  },

  "innovations-materiel-machines": {
    intro:
      "Cette rubrique suit les innovations du matériel de nettoyage professionnel : autolaveuses autonomes et connectées, matériel à batterie qui remplace le filaire, microfibre et consommables nouvelle génération, équipements ergonomiques qui réduisent les TMS, et solutions de dosage qui maîtrisent la chimie. Avec un angle constant : ce que l'innovation change réellement sur le terrain — productivité, conditions de travail, coût total — au-delà des promesses des fabricants.",
    sections: [
      {
        heading: "Les familles d'innovation que nous suivons",
        bullets: [
          "Machines autonomes et connectées : robots de lavage, données d'usage, maintenance prédictive — où en est la maturité réelle.",
          "La transition batterie : aspirateurs dorsaux, autolaveuses compactes, matériel sans fil — autonomie, coûts et retours terrain.",
          "Ergonomie et prévention : matériel léger, manches télescopiques, chariots repensés — l'innovation qui réduit les TMS est aussi rentable.",
          "Chimie et dosage : centrales de dilution, produits concentrés, alternatives écologiques — maîtriser les coûts et les risques.",
          "Textiles et consommables : microfibres haute performance, lavage et réemploi, alternatives aux usages uniques.",
        ],
      },
      {
        heading: "Comment évaluer une innovation avant d'investir",
        bullets: [
          "Exigez un essai sur votre site, avec vos agents : l'adoption terrain fait ou défait la rentabilité d'un équipement.",
          "Calculez en coût total de possession : prix d'achat + consommables + maintenance + formation, rapportés aux heures économisées.",
          "Vérifiez le SAV et les pièces : une innovation immobilisée faute de pièces coûte plus cher qu'un matériel classique fiable.",
          "Croisez les retours de pairs : le réseau Club Propreté permet d'interroger des confrères qui utilisent déjà le matériel.",
        ],
      },
    ],
    faq: [
      {
        q: "Le matériel à batterie vaut-il vraiment le filaire ?",
        a: "Sur la plupart des usages tertiaires, oui : l'autonomie actuelle couvre une vacation type, le gain de temps (pas de prises, pas de câble) et la sécurité (pas de câble au sol) compensent le surcoût d'achat. Les points de vigilance restent la gestion des batteries (cycles, remplacement) et les usages intensifs en continu.",
      },
      {
        q: "Une autolaveuse autonome est-elle rentable pour une PME de propreté ?",
        a: "Elle se justifie aujourd'hui surtout sur de grandes surfaces régulières et dégagées (logistique, retail, halls). Pour une PME, la location ou l'essai longue durée sur un contrat adapté est la bonne porte d'entrée — avant tout investissement, comparez avec une autolaveuse classique bien utilisée.",
      },
    ],
  },

  "produits-ecologiques-nettoyage": {
    intro:
      "Le nettoyage écologique professionnel repose sur des repères vérifiables : les écolabels officiels (Écolabel européen en tête) qui garantissent un impact réduit à efficacité prouvée, le dosage maîtrisé qui réduit la chimie consommée, les méthodes alternatives (microfibre, vapeur, eau ozonée selon les usages) et la gestion des emballages. Cette rubrique suit les produits, les labels et les pratiques — en distinguant l'écologie réelle du greenwashing marketing.",
    sections: [
      {
        heading: "Les repères fiables pour acheter écologique",
        bullets: [
          "Les écolabels officiels (Écolabel européen, autres référentiels certifiés) : critères d'impact ET d'efficacité vérifiés par tierce partie.",
          "Les fiches de données de sécurité restent obligatoires : écologique ne veut pas dire sans risque ni sans précaution d'usage.",
          "La concentration et le dosage : un produit concentré bien dosé bat un produit « vert » surdosé, en impact comme en coût.",
          "La cohérence d'ensemble : produits, microfibre lavable, gestion de l'eau et des emballages — l'écologie se joue sur le système, pas sur un bidon.",
        ],
      },
      {
        heading: "L'argument commercial : répondre aux exigences RSE des clients",
        bullets: [
          "Les consultations intègrent de plus en plus de critères environnementaux : une gamme éco-labellisée documentée y répond directement.",
          "Formalisez votre démarche : liste des produits et labels, protocoles de dosage, formation des agents — un dossier d'une page vaut mieux que des déclarations.",
          "Chiffrez ce qui est chiffrable : consommation de chimie réduite, déchets d'emballage évités — les acheteurs RSE aiment les indicateurs.",
          "Restez honnête : promettre le « 100 % écologique » irréaliste expose au retour de bâton ; une démarche progressive documentée est plus crédible.",
        ],
      },
    ],
    faq: [
      {
        q: "Les produits écologiques sont-ils aussi efficaces que les produits classiques ?",
        a: "Pour l'entretien courant, oui : les écolabels officiels imposent des tests d'efficacité. Les écarts subsistent sur certains usages intensifs (désinfection réglementée, dégraissage industriel lourd) où les alternatives s'évaluent au cas par cas — d'où l'intérêt des essais terrain avant bascule complète.",
      },
      {
        q: "Le nettoyage écologique coûte-t-il plus cher ?",
        a: "À l'achat au litre, souvent un peu ; en coût d'usage, pas nécessairement : produits concentrés, dosage maîtrisé et microfibre réduisent les consommations. Le surcoût résiduel éventuel se valorise commercialement auprès des clients à exigences RSE.",
      },
    ],
  },

  "emploi-recrutement-proprete": {
    intro:
      "L'emploi est le sujet numéro un du secteur de la propreté : plus d'un demi-million de salariés en France, une tension durable sur le recrutement, un turnover élevé et des métiers essentiels en quête de reconnaissance. Cette rubrique suit le marché de l'emploi du secteur — salaires conventionnels, dispositifs de formation, bonnes pratiques de recrutement et de fidélisation, évolutions du travail (journée, temps complet) — côté employeurs comme côté candidats.",
    sections: [
      {
        heading: "Les sujets que nous suivons",
        bullets: [
          "Salaires et convention collective : revalorisations de la grille, primes, classifications et leurs effets concrets sur l'attractivité.",
          "Recrutement : canaux qui fonctionnent, aides à l'embauche, intégration des nouveaux agents, lutte contre le turnover.",
          "Formation et évolution : CQP de branche, passerelles vers chef d'équipe et responsable de secteur, dispositifs de financement.",
          "Transformation du travail : développement du temps complet et du travail en journée, lutte contre les horaires morcelés.",
          "Côté candidats : comment trouver les bonnes offres, valoriser son expérience et évoluer dans le secteur.",
        ],
      },
      {
        heading: "Employeurs : les leviers qui fonctionnent vraiment",
        bullets: [
          "Publier des offres précises (lieu, horaires, volume, salaire) sur les canaux spécialisés — dont l'espace emploi de Club Propreté.",
          "Répondre vite : dans un marché tendu, le délai de réponse est le premier facteur de réussite d'un recrutement.",
          "Structurer l'intégration : binôme, consignes écrites, matériel prêt — la moitié des départs précoces se jouent la première semaine.",
          "Construire des parcours : formation, polyvalence, évolution vers l'encadrement — la perspective retient plus que la prime ponctuelle.",
        ],
      },
    ],
    faq: [
      {
        q: "Pourquoi le secteur de la propreté peine-t-il à recruter ?",
        a: "Le déficit d'image, les horaires décalés et morcelés et la concurrence d'autres secteurs en tension se cumulent. Les entreprises qui recrutent bien sont celles qui traitent les causes : sites regroupés, horaires stabilisés, travail en journée quand c'est possible, intégration soignée et perspectives d'évolution réelles.",
      },
      {
        q: "Comment publier une offre d'emploi sur Club Propreté ?",
        a: "Créez votre compte entreprise gratuitement, puis publiez vos offres depuis votre tableau de bord : elles sont visibles des candidats qui cherchent spécifiquement dans les métiers de la propreté.",
      },
    ],
  },

  "interviews-entrepreneurs-proprete": {
    intro:
      "Cette rubrique donne la parole à celles et ceux qui font le secteur : créateurs d'entreprises de nettoyage, dirigeants de PME établies, indépendants, repreneurs, spécialistes d'un segment. Chaque interview suit la même exigence : du concret — comment ils ont trouvé leurs premiers clients, leurs erreurs de chiffrage, leurs caps de croissance, leurs pratiques de recrutement — plutôt que des récits lissés. Des retours d'expérience directement actionnables par les professionnels.",
    sections: [
      {
        heading: "Ce que vous trouverez dans chaque interview",
        bullets: [
          "Le parcours : d'où ils partent, pourquoi la propreté, comment les débuts se sont réellement passés.",
          "Les chiffres qu'ils acceptent de partager : structure de coûts, caps de chiffre d'affaires, premiers salariés.",
          "Les erreurs assumées : contrats mal chiffrés, recrutements ratés, croissance mal digérée — et ce qu'ils en ont tiré.",
          "Leurs pratiques actuelles : acquisition clients, organisation terrain, outils, fidélisation des équipes.",
          "Leur conseil à ceux qui se lancent — souvent la partie la plus citée.",
        ],
      },
      {
        heading: "Proposer votre témoignage",
        paragraphs: [
          "Vous dirigez une entreprise de nettoyage, vous êtes indépendant ou vous portez un projet singulier dans le secteur ? La rédaction de Club Propreté recherche en permanence des parcours à raconter — réussites comme rebonds après difficulté. Une interview est aussi un levier de visibilité : elle est publiée sur le média, relayée sur les réseaux du Club et reliée à votre fiche annuaire.",
        ],
        bullets: [
          "Contactez l'équipe via contact@clubproprete.com ou depuis votre tableau de bord (« Média Club Propreté »).",
          "Format souple : échange d'une heure environ, relecture avant publication, photos fournies par vos soins.",
          "Les membres de l'association bénéficient d'une priorité sur les formats longs (portraits, podcasts).",
        ],
      },
    ],
    faq: [
      {
        q: "Qui peut être interviewé par Club Propreté ?",
        a: "Tout professionnel du secteur avec un retour d'expérience utile aux pairs : dirigeants de sociétés de nettoyage, indépendants, repreneurs, spécialistes d'un segment, fournisseurs innovants. Le critère n'est pas la taille de l'entreprise mais la valeur concrète du témoignage.",
      },
      {
        q: "L'interview est-elle payante ou sponsorisée ?",
        a: "Les interviews éditoriales sont gratuites et non sponsorisées : la rédaction choisit les parcours pour leur intérêt. Les contenus partenaires éventuels sont, eux, toujours identifiés comme tels.",
      },
    ],
  },
};
