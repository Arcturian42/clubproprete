// Dossiers appels d'offres & marchés visibles dans le méga menu.

import type { ResourceContent } from "./types";

export const appelsOffresContents: Record<string, ResourceContent> = {
  "comprendre-appels-offres-nettoyage": {
    intro:
      "Un appel d'offres de nettoyage est une mise en concurrence formalisée : l'acheteur publie un dossier de consultation (DCE) décrivant son besoin, les candidats remettent une offre dans un délai imparti, et l'attribution se fait selon des critères pondérés annoncés à l'avance — typiquement le prix et la valeur technique. Marchés publics (collectivités, État, hôpitaux) et consultations privées (entreprises, syndics, foncières) suivent la même logique avec des règles différentes : comprendre le vocabulaire et la mécanique est le préalable à toute réponse sérieuse.",
    sections: [
      {
        heading: "Le vocabulaire à maîtriser",
        bullets: [
          "DCE (dossier de consultation des entreprises) : l'ensemble des pièces remises aux candidats — règlement de consultation, CCAP (clauses administratives), CCTP ou cahier des charges (clauses techniques), bordereau de prix.",
          "Règlement de consultation : le mode d'emploi de la réponse — pièces exigées, critères et pondérations, date limite. À lire en premier.",
          "Candidature vs offre : la candidature prouve vos capacités (administratif, références) ; l'offre répond au besoin (prix, mémoire technique).",
          "Allotissement : le découpage du marché en lots (par site, par zone géographique) — la porte d'entrée des PME.",
          "DUME : le document unique européen qui simplifie la partie candidature des marchés publics.",
        ],
      },
      {
        heading: "Marchés publics et consultations privées : les différences",
        table: {
          caption: "Marchés publics vs consultations privées de nettoyage",
          headers: ["Aspect", "Marché public", "Consultation privée"],
          rows: [
            [
              "Publicité",
              "Obligatoire selon les seuils (BOAMP, profils d'acheteurs)",
              "Au choix de l'acheteur (réseau, panel, sourcing)",
            ],
            [
              "Procédure",
              "Encadrée par le code de la commande publique",
              "Libre, définie par l'acheteur",
            ],
            [
              "Critères",
              "Annoncés et pondérés, attribution motivée",
              "Souvent annoncés, négociation fréquente",
            ],
            [
              "Recours",
              "Motifs de rejet communicables, voies de recours",
              "Pas d'obligation de motivation",
            ],
            [
              "Paiement",
              "Délais réglementés, avance possible",
              "Conditions négociées au contrat",
            ],
          ],
        },
      },
      {
        heading: "Comment se déroule une consultation type",
        bullets: [
          "Publication du DCE et période de questions-réponses (utilisez-la : les réponses engagent l'acheteur).",
          "Visite de site, parfois obligatoire — ne répondez jamais sans avoir visité.",
          "Remise des plis dématérialisée avant la date limite (anticipez la signature électronique pour le public).",
          "Analyse des offres selon les critères pondérés, éventuelles négociations ou auditions.",
          "Attribution, information des candidats écartés, puis démarrage — souvent avec reprise du personnel (annexe 7).",
        ],
      },
    ],
    faq: [
      {
        q: "Où sont publiés les appels d'offres de nettoyage ?",
        a: "Les marchés publics paraissent sur le BOAMP, les profils d'acheteurs des collectivités et les plateformes de dématérialisation ; une veille par mots-clés et zone géographique permet de ne rien rater. Les consultations privées circulent par réseau et sourcing direct — d'où l'importance d'être visible et référencé auprès des donneurs d'ordre.",
      },
      {
        q: "Qu'est-ce qu'un marché alloti et pourquoi est-ce important ?",
        a: "C'est un marché découpé en lots attribués séparément (par site, par secteur géographique). L'allotissement, principe de base de la commande publique, permet aux PME de candidater sur des volumes à leur mesure sans affronter les groupes sur la totalité du marché.",
      },
      {
        q: "Peut-on négocier dans un appel d'offres ?",
        a: "Dans le privé, presque toujours. Dans le public, cela dépend de la procédure : certaines l'autorisent, l'appel d'offres formalisé l'exclut. Le règlement de consultation l'indique — d'où l'importance de rendre une première offre déjà optimale.",
      },
    ],
  },

  "preparer-dossier-appel-offres": {
    intro:
      "Un dossier de candidature d'appel d'offres se prépare avant d'en avoir besoin : pièces administratives à jour (attestations fiscales et sociales, assurance, immatriculation), références structurées et comparables, présentation des moyens humains et matériels, et certificats éventuels. Les entreprises qui gagnent entretiennent un « dossier permanent » réutilisable qui réduit chaque réponse à son contenu spécifique : le chiffrage et le mémoire technique.",
    sections: [
      {
        heading: "Le dossier permanent : les pièces à tenir prêtes",
        bullets: [
          "Administratif : extrait d'immatriculation récent, attestations de régularité fiscale et sociale, attestation de vigilance URSSAF, attestation d'assurance RC professionnelle.",
          "Capacités financières : chiffres d'affaires des derniers exercices (souvent demandés sur trois ans), présentés simplement.",
          "Capacités techniques : effectifs par qualification, encadrement, liste du matériel significatif (mécanisation, véhicules).",
          "Références : fiches normalisées par contrat — client, période, surface/volume, prestations, contact vérifiable.",
          "Qualité et RSE : certifications éventuelles, démarche produits éco-labellisés, politique de formation — même modestes, formalisées.",
        ],
      },
      {
        heading: "Bien présenter ses références (le nerf de la candidature)",
        bullets: [
          "Sélectionnez des références comparables au marché visé : taille, type de site, contraintes — trois références pertinentes battent dix génériques.",
          "Structurez chaque fiche à l'identique : l'acheteur doit pouvoir comparer en trente secondes.",
          "Prévenez les contacts cités : un référent injoignable ou surpris dévalorise la référence.",
          "Jeune entreprise : valorisez l'expérience des dirigeants et encadrants, les prestations ponctuelles réussies et la montée en charge maîtrisée proposée.",
        ],
      },
      {
        heading: "Les réflexes qui évitent l'élimination administrative",
        bullets: [
          "Lisez le règlement de consultation avec une check-list : chaque pièce exigée, cochée, au bon format.",
          "Respectez les formulaires demandés (DC1/DC2 ou DUME pour le public) sans les réinventer.",
          "Anticipez la signature électronique et les contraintes de la plateforme de dépôt : les rejets pour pli hors délai ou illisible sont fréquents et définitifs.",
          "Déposez la veille au plus tard : les incidents de dernière heure ne sont jamais excusés.",
        ],
      },
    ],
    faq: [
      {
        q: "Combien de temps faut-il pour constituer un dossier de candidature ?",
        a: "La première constitution demande quelques jours pour rassembler et mettre en forme les pièces. Ensuite, un dossier permanent tenu à jour (alertes sur les attestations périssables) ramène la partie candidature de chaque réponse à quelques heures.",
      },
      {
        q: "Une entreprise récente sans références peut-elle candidater ?",
        a: "Oui : l'absence de références ne peut à elle seule justifier un rejet dans les marchés publics, et les acheteurs évaluent les capacités par d'autres moyens — expérience des dirigeants, moyens mobilisés, plan de démarrage. Visez d'abord des lots à votre mesure et soignez la crédibilité du mémoire.",
      },
      {
        q: "Qu'est-ce que le DUME et quand l'utiliser ?",
        a: "Le document unique de marché européen est une déclaration sur l'honneur standardisée qui remplace une grande partie des pièces de candidature des marchés publics. Préremplissez-le une fois : il se réutilise de consultation en consultation.",
      },
    ],
  },

  "rediger-memoire-technique-nettoyage": {
    intro:
      "Le mémoire technique est le document qui départage les offres à prix comparables : il décrit comment vous exécuterez ce marché précis — organisation et moyens dédiés, méthodologie par type de zone, contrôle qualité, gestion des absences et remplacements, démarche RSE. La règle d'or : structurer le mémoire selon les critères de notation annoncés et le personnaliser site par site. Un mémoire générique se repère en deux pages et coûte la note technique.",
    sections: [
      {
        heading: "La structure type d'un mémoire qui note bien",
        bullets: [
          "1. Compréhension du besoin : reformulez les enjeux du marché (sites, contraintes, attentes) — prouvez la visite et la lecture du cahier des charges.",
          "2. Organisation dédiée : organigramme du marché, encadrement nommé, volumes d'heures par site, plan de démarrage (et de reprise du personnel le cas échéant).",
          "3. Méthodologie : protocoles par type de zone, matériel affecté, produits (avec démarche éco-labellisée), gestion des clés et accès.",
          "4. Qualité : autocontrôles, contrôles encadrement, traçabilité des passages, traitement des réclamations avec délais engagés.",
          "5. Continuité de service : remplacement des absences (délais chiffrés), astreinte, polyvalence des équipes.",
          "6. RSE et social : formation, stabilité des équipes, insertion, environnement — des engagements concrets, pas des slogans.",
        ],
      },
      {
        heading: "Personnaliser sans tout réécrire : la méthode bibliothèque",
        paragraphs: [
          "Constituez une bibliothèque de briques éprouvées (protocoles, fiches méthodes, démarche qualité, politique RH) et personnalisez systématiquement trois couches pour chaque marché : la compréhension du besoin (toujours spécifique), l'organisation dédiée (sites, effectifs, encadrement nommés) et les exemples (adaptés au type de site). Vous gagnez le temps des généralités pour le réinvestir là où se gagnent les points.",
        ],
      },
      {
        heading: "Ce que sanctionnent les évaluateurs",
        bullets: [
          "Le copier-coller révélé par un nom de site ou de client d'un autre marché resté dans le texte — éliminatoire en crédibilité.",
          "Les promesses invérifiables (« réactivité maximale ») sans engagement chiffré (délai de remplacement, fréquence de contrôle).",
          "L'incohérence avec le prix : un mémoire luxueux sur une offre financière au plancher éveille la suspicion d'offre anormalement basse.",
          "Le hors-sujet : répondre à côté des critères pondérés annoncés, ou noyer l'évaluateur sous le volume au lieu de suivre sa grille.",
        ],
      },
      {
        heading: "Forme et lisibilité : des points faciles à prendre",
        bullets: [
          "Suivez l'ordre des critères du règlement de consultation : facilitez la notation, l'évaluateur vous en saura gré.",
          "Sommaire, pages aérées, schémas (organigramme, circuit qualité) : un document agréable se note mieux.",
          "Chiffrez tout ce qui peut l'être : heures, délais, fréquences, taux d'encadrement.",
          "Faites relire par quelqu'un d'extérieur au dossier : il verra les jargons et les trous.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle longueur pour un mémoire technique de nettoyage ?",
        a: "Celle que demande le règlement de consultation s'il fixe une limite ; sinon, la densité prime sur le volume — un mémoire structuré d'une vingtaine de pages personnalisées bat un pavé générique. Chaque page doit servir un critère de notation.",
      },
      {
        q: "Le mémoire technique engage-t-il juridiquement ?",
        a: "Oui : il devient généralement une pièce contractuelle du marché. Les engagements qu'il contient (délais de remplacement, fréquences de contrôle, moyens dédiés) sont exigibles — n'écrivez que ce que vous tiendrez.",
      },
      {
        q: "Comment valoriser la RSE dans un mémoire technique ?",
        a: "Par des éléments vérifiables : gamme éco-labellisée avec liste des produits, plan de formation chiffré, stabilité des équipes, actions d'insertion, organisation du travail en journée quand le marché s'y prête. Les déclarations d'intention sans preuve ne rapportent plus de points.",
      },
    ],
  },

  "analyser-cahier-des-charges-nettoyage": {
    intro:
      "Analyser un cahier des charges avant de chiffrer, c'est chercher quatre choses : le périmètre réel (zones, surfaces, fréquences — et leurs incohérences), les exigences qui coûtent (horaires imposés, produits, traçabilité, pénalités), les informations manquantes à demander avant la remise, et les signaux d'alerte (budget irréaliste, marché taillé pour le sortant, pénalités disproportionnées). Cette grille de lecture décide de la suite : répondre, répondre avec réserves chiffrées, ou passer son tour.",
    sections: [
      {
        heading: "La grille de lecture en quatre passes",
        bullets: [
          "Passe 1 — Le périmètre : listez zones, surfaces et fréquences ; traquez les incohérences (surfaces totales ≠ somme des zones, fréquences contradictoires entre articles) et les zones « oubliées » qui réapparaîtront en exécution.",
          "Passe 2 — Les coûts cachés : horaires imposés (majorations), produits ou matériels exigés, traçabilité et reporting demandés, gestion des consommables, pénalités et leur mécanique de déclenchement.",
          "Passe 3 — Les manques : tout ce qu'il faut demander en questions-réponses — effectif à reprendre (annexe 7) avec salaires et anciennetés, plans, état initial des locaux, volumes de consommables.",
          "Passe 4 — Les signaux : durée et conditions de résiliation, révision des prix prévue ou absente, cohérence du budget annoncé avec le volume demandé.",
        ],
      },
      {
        heading: "Le point critique : la reprise du personnel",
        paragraphs: [
          "Sur un marché existant, l'annexe 7 de la convention collective impose généralement la reprise du personnel affecté. Les salaires, anciennetés, primes et taux d'absence du personnel repris déterminent l'essentiel de votre coût réel : exiger ces informations (normalement fournies dans le DCE) et les intégrer au chiffrage n'est pas optionnel. Chiffrer sur vos coûts standards un marché à personnel repris plus coûteux est l'erreur fatale classique.",
        ],
      },
      {
        heading: "Poser les bonnes questions avant la remise",
        bullets: [
          "Utilisez la phase de questions-réponses : les réponses écrites engagent l'acheteur et profitent à votre analyse.",
          "Questions types : liste détaillée du personnel reprenable, surfaces par zone si absentes, état des sols et vitrerie, modalités d'accès et d'alarme, volumes de consommables constatés.",
          "Une question intelligente signale aussi votre sérieux à l'acheteur — et déstabilise les candidats qui chiffrent à l'aveugle.",
        ],
      },
      {
        heading: "Décider : répondre, réserver ou renoncer",
        bullets: [
          "Répondez si le périmètre est clair, le volume à votre portée et l'équation économique tenable après intégration des coûts cachés.",
          "Chiffrez avec hypothèses explicites quand une zone d'ombre subsiste : annoncer ses hypothèses protège mieux que les taire.",
          "Renoncez sans regret si le budget est structurellement intenable ou le marché verrouillé : une non-réponse coûte zéro, un marché perdant coûte des années.",
        ],
      },
    ],
    faq: [
      {
        q: "Que faire si le cahier des charges ne donne pas les surfaces ?",
        a: "Demandez-les en questions-réponses et exigez la visite de site pour les vérifier ou les estimer zone par zone. À défaut de réponse, chiffrez sur vos métrés de visite en annonçant explicitement l'hypothèse dans votre offre.",
      },
      {
        q: "Comment repérer un appel d'offres « écrit pour » le prestataire sortant ?",
        a: "Indices classiques : exigences très spécifiques calquées sur l'organisation du sortant, délais de réponse très courts, informations clés absentes du DCE que seul le sortant connaît. Ce n'est pas toujours rédhibitoire, mais ajustez votre investissement de réponse en conséquence.",
      },
      {
        q: "Les pénalités prévues au cahier des charges sont-elles négociables ?",
        a: "Dans le privé, oui, lors de la mise au point du contrat. Dans le public, rarement : elles s'imposent telles quelles — intégrez leur risque dans le prix et surtout dans votre dispositif qualité (autocontrôles, traçabilité) qui en réduit la probabilité.",
      },
    ],
  },

  "erreurs-appels-offres-nettoyage": {
    intro:
      "Les réponses aux appels d'offres de nettoyage échouent presque toujours sur les mêmes erreurs, et la plupart sont évitables : pli incomplet ou hors délai (élimination administrative immédiate), prix décroché du cahier des charges réel (reprise du personnel ignorée, visites bâclées), mémoire technique générique, promesses incohérentes avec le prix, et absence de retour d'expérience après les échecs. Ce dossier les passe en revue avec, pour chacune, la parade concrète.",
    sections: [
      {
        heading: "Les erreurs administratives (éliminatoires et bêtes)",
        bullets: [
          "Pièce manquante ou périmée : la check-list du règlement de consultation, cochée à deux, est la seule parade fiable.",
          "Dépôt à la dernière heure : plateformes saturées, signature électronique défaillante — déposez la veille, point.",
          "Formulaires modifiés ou remplacés par vos propres documents : suivez les cadres imposés, même imparfaits.",
          "Mauvais destinataire ou mauvais lot coché dans une consultation allotie : vérification finale systématique.",
        ],
      },
      {
        heading: "Les erreurs de chiffrage (les plus coûteuses)",
        bullets: [
          "Ignorer la reprise du personnel : chiffrer sur vos coûts standards un marché dont vous reprendrez des salariés plus anciens et mieux primés — l'erreur fatale numéro un.",
          "Chiffrer sans visite : les surfaces réelles, l'état des locaux et les contraintes d'accès ne se devinent pas sur plan.",
          "Plaquer un prix au m² générique au lieu de construire les heures site par site.",
          "Oublier les coûts du marché lui-même : reporting exigé, encadrement dédié, matériel imposé, pénalités probables.",
          "Casser le prix « pour prendre le marché » : une offre anormalement basse peut être écartée, et une offre gagnée à perte se paie pendant toute la durée du contrat.",
        ],
      },
      {
        heading: "Les erreurs de mémoire technique",
        bullets: [
          "Le générique recyclé — surtout avec le nom d'un autre client resté dans le texte.",
          "Ignorer la pondération des critères : investir dix pages sur un critère à 5 % et trois lignes sur celui à 40 %.",
          "Promettre l'invérifiable au lieu d'engager du chiffré (délais de remplacement, fréquences de contrôle).",
          "L'incohérence prix/moyens : annoncer un encadrement renforcé que votre prix ne peut financer.",
        ],
      },
      {
        heading: "L'erreur d'après : ne rien apprendre",
        bullets: [
          "Demandez systématiquement les motifs de rejet et vos notes (un droit dans les marchés publics) : c'est la matière première de la réponse suivante.",
          "Tenez un journal des réponses : taux de succès par type de marché, écarts de prix constatés avec les attributaires, faiblesses récurrentes du mémoire.",
          "Restez en relation avec l'acheteur : les marchés se rejouent, les attributaires défaillent, les avenants s'ouvrent.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle est l'erreur la plus fréquente dans les réponses aux appels d'offres de nettoyage ?",
        a: "Le chiffrage déconnecté du marché réel — au premier rang : l'oubli ou la sous-estimation du personnel à reprendre au titre de l'annexe 7. Vient ensuite le mémoire technique générique, qui coûte la note technique face à des concurrents qui personnalisent.",
      },
      {
        q: "Une offre anormalement basse est-elle vraiment rejetée ?",
        a: "Dans les marchés publics, l'acheteur doit interroger le candidat dont l'offre paraît anormalement basse et peut la rejeter si les justifications ne tiennent pas. Et même acceptée, une offre à perte se paie en exécution : qualité dégradée, pénalités, relation conflictuelle.",
      },
      {
        q: "Combien de réponses faut-il pour gagner son premier marché ?",
        a: "Il n'y a pas de règle, mais la courbe d'apprentissage est réelle : les premières réponses servent aussi à construire le dossier permanent et la bibliothèque de mémoires. En ciblant des lots à votre mesure et en exploitant chaque retour de rejet, les chances progressent nettement dès les réponses suivantes.",
      },
    ],
  },

  "modele-memoire-technique": {
    intro:
      "Cette trame de mémoire technique pour appels d'offres de nettoyage suit la structure attendue par les acheteurs : compréhension du besoin, organisation et moyens dédiés au marché, méthodologie par type de zone, dispositif qualité et traçabilité, continuité de service, engagements RSE. Chaque section indique le contenu attendu et les pièges à éviter — il vous reste à la personnaliser marché par marché, condition absolue d'une bonne note technique.",
    sections: [
      {
        heading: "La trame section par section",
        bullets: [
          "1. Présentation ciblée de l'entreprise : une page orientée vers CE marché (implantation locale, références comparables) — pas une plaquette générique.",
          "2. Compréhension du besoin : reformulation des enjeux, contraintes observées en visite, attentes spécifiques relevées dans le cahier des charges.",
          "3. Organisation dédiée : organigramme nominatif, volumes d'heures par site et par prestation, plan de démarrage semaine par semaine, reprise du personnel le cas échéant.",
          "4. Méthodologie d'exécution : protocoles par type de zone, matériel affecté (avec mécanisation), produits et démarche éco-labellisée, gestion des accès.",
          "5. Qualité et traçabilité : autocontrôles, contrôles d'encadrement avec fréquences engagées, outils de traçabilité, procédure de réclamation avec délais.",
          "6. Continuité de service : remplacements (délai engagé), astreinte, polyvalence, gestion des congés et pics.",
          "7. RSE : formation, stabilité et conditions de travail des équipes, insertion, environnement — engagements concrets et mesurables.",
          "8. Annexes utiles : exemples de fiches de contrôle, attestations, certificats — uniquement ce qui appuie le propos.",
        ],
      },
      {
        heading: "Comment utiliser cette trame efficacement",
        bullets: [
          "Réordonnez les sections selon les critères pondérés du règlement de consultation de chaque marché : la trame s'adapte à la grille de notation, jamais l'inverse.",
          "Remplissez d'abord les trois sections toujours spécifiques : compréhension du besoin, organisation dédiée, plan de démarrage.",
          "Chiffrez chaque engagement : heures, délais, fréquences — les adjectifs ne rapportent pas de points.",
          "Relecture finale anti-copier-coller : noms de sites, de clients et chiffres cohérents avec le marché visé.",
        ],
      },
      {
        heading: "Les compléments disponibles sur Club Propreté",
        bullets: [
          "Le guide « Rédiger un mémoire technique » détaille la méthode de personnalisation et les attentes des évaluateurs.",
          "Le dossier « Préparer son dossier » couvre la partie candidature (pièces administratives, références).",
          "Le guide « Analyser un cahier des charges » sécurise le chiffrage qui doit rester cohérent avec le mémoire.",
        ],
      },
    ],
    faq: [
      {
        q: "Peut-on réutiliser le même mémoire technique pour plusieurs appels d'offres ?",
        a: "On réutilise des briques (protocoles, démarche qualité, politique RH), jamais le document entier : la compréhension du besoin, l'organisation dédiée et les exemples doivent être propres à chaque marché. Les évaluateurs repèrent immédiatement un mémoire recyclé — et le notent en conséquence.",
      },
      {
        q: "Faut-il joindre des annexes au mémoire technique ?",
        a: "Oui, si elles prouvent un engagement : exemple de fiche de contrôle qualité, modèle de rapport de passage, certificats. Non, si elles ne font que gonfler le volume — l'évaluateur note ce qui répond à sa grille, pas l'épaisseur du pli.",
      },
      {
        q: "Quand le modèle téléchargeable sera-t-il disponible ?",
        a: "La version téléchargeable et personnalisable est en préparation. Créez votre compte Club Propreté pour être informé de sa mise en ligne — la trame détaillée ci-dessus permet déjà de structurer une réponse complète.",
      },
    ],
  },
};
