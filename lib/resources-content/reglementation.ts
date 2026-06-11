// Bibliothèque réglementaire visible dans le méga menu (complément de initial.ts).
// La mention informative est ajoutée automatiquement sur toutes ces pages.

import type { ResourceContent } from "./types";

export const reglementationContents: Record<string, ResourceContent> = {
  "securite-travail-proprete": {
    intro:
      "L'employeur d'une entreprise de propreté a une obligation générale de sécurité envers ses salariés (article L. 4121-1 du Code du travail) : évaluer les risques de chaque poste (DUERP), mettre en place les mesures de prévention, former et informer les agents, fournir et entretenir les équipements de protection. Particularité du secteur : les agents travaillent chez les clients — la prévention doit donc couvrir des sites que l'employeur ne maîtrise pas directement, d'où l'importance des plans de prévention et de la coordination avec les entreprises utilisatrices.",
    sections: [
      {
        heading: "Les principaux risques du métier d'agent de propreté",
        bullets: [
          "Troubles musculo-squelettiques (TMS) : gestes répétitifs, postures, port de charges — la première cause de maladie professionnelle du secteur.",
          "Chutes de plain-pied et de hauteur : sols mouillés, escaliers, vitrerie — des risques quotidiens souvent banalisés.",
          "Risque chimique : produits d'entretien, mélanges dangereux, dosages — voir notre fiche dédiée aux produits et FDS.",
          "Risques liés aux horaires : travail isolé tôt ou tard, trajets multiples, vigilance réduite.",
          "Risques propres aux sites clients : coactivité, équipements du client, zones dangereuses — traités par le plan de prévention.",
        ],
      },
      {
        heading: "Les obligations concrètes de l'employeur",
        bullets: [
          "Évaluer les risques et les transcrire dans le DUERP, mis à jour régulièrement et à chaque changement significatif.",
          "Former à la sécurité : accueil sécurité de chaque nouvel agent, formation au poste, gestes et postures, produits chimiques.",
          "Fournir gratuitement les EPI adaptés et veiller à leur port effectif et à leur entretien.",
          "Organiser le suivi médical des salariés auprès du service de prévention et de santé au travail.",
          "Coordonner la prévention avec les clients : inspection commune et plan de prévention quand il est requis.",
          "Mettre en place l'organisation des secours : conduite à tenir, numéros d'urgence, trousse de secours, sauveteurs formés selon l'effectif.",
        ],
      },
      {
        heading: "La prévention comme investissement (pas comme contrainte)",
        paragraphs: [
          "Dans un secteur tendu sur le recrutement, la prévention est aussi un levier économique : moins d'accidents et de TMS, c'est moins d'absences à remplacer, des cotisations accidents du travail maîtrisées et des agents fidélisés. La mécanisation (autolaveuses, matériel ergonomique) et l'organisation (sites regroupés, horaires stabilisés) font partie de la prévention au même titre que les EPI — et des aides financières existent pour s'équiper.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelles formations sécurité sont obligatoires pour un agent d'entretien ?",
        a: "Au minimum : l'accueil sécurité et la formation au poste de travail (risques du site, produits, matériel, consignes). S'y ajoutent selon l'activité des formations spécifiques : habilitations pour certains environnements, travail en hauteur, conduite d'autolaveuse autoportée. L'employeur doit pouvoir prouver ces formations.",
      },
      {
        q: "Qui est responsable de la sécurité d'un agent sur le site d'un client ?",
        a: "L'employeur reste responsable de la sécurité de son salarié, mais l'entreprise utilisatrice a ses propres obligations de coordination (inspection commune, plan de prévention le cas échéant, information sur les risques du site). En cas d'accident, les responsabilités s'examinent des deux côtés.",
      },
      {
        q: "Comment réduire les TMS dans une entreprise de nettoyage ?",
        a: "En combinant matériel adapté (manches télescopiques, microfibre, mécanisation), organisation (rotation des tâches, pauses, limitation du port de charges) et formation aux gestes et postures. Les caisses régionales proposent des accompagnements et aides financières dédiés à la prévention des TMS.",
      },
    ],
  },

  "epi-obligatoires-nettoyage": {
    intro:
      "L'employeur doit fournir gratuitement aux agents de propreté les équipements de protection individuelle adaptés aux risques de leur poste, en assurer l'entretien et le remplacement, et veiller à leur port effectif (Code du travail, notamment l'article R. 4323-95). Pour le nettoyage courant, le socle type comprend gants de protection adaptés aux produits, chaussures antidérapantes et tenue de travail ; s'y ajoutent selon les tâches lunettes, protection respiratoire ou équipements spécifiques (vitrerie en hauteur, milieux à risque).",
    sections: [
      {
        heading: "Quels EPI pour quelles tâches de nettoyage ?",
        table: {
          caption: "EPI selon les situations de travail en propreté",
          headers: ["Situation", "EPI types", "Points d'attention"],
          rows: [
            [
              "Entretien courant",
              "Gants adaptés aux produits, chaussures antidérapantes, tenue de travail",
              "Gants : matière compatible avec les produits utilisés (voir FDS)",
            ],
            [
              "Produits chimiques (dilution, détartrants, décapants)",
              "Gants résistants au produit, lunettes de protection, tablier le cas échéant",
              "La FDS du produit indique les EPI requis — s'y référer systématiquement",
            ],
            [
              "Sanitaires et risque biologique",
              "Gants, hygiène des mains renforcée, le cas échéant protections complémentaires",
              "Protocoles spécifiques en milieux de soins",
            ],
            [
              "Vitrerie et travail en hauteur",
              "Équipements antichute selon les situations, casque le cas échéant",
              "Formation obligatoire ; privilégier les solutions évitant la hauteur (perches)",
            ],
            [
              "Environnements industriels",
              "EPI du site (casque, gilet, bouchons d'oreilles…) en plus des EPI métier",
              "Définis lors du plan de prévention avec le client",
            ],
          ],
        },
      },
      {
        heading: "Les obligations de l'employeur sur les EPI",
        bullets: [
          "Fourniture gratuite : les EPI sont à la charge exclusive de l'employeur, qui ne peut en imputer le coût aux salariés.",
          "Choix sur la base de l'évaluation des risques : les EPI découlent du DUERP et des FDS des produits utilisés.",
          "Entretien, vérification et remplacement : un EPI usé ou défectueux n'est plus un EPI.",
          "Information et formation au port : pourquoi, quand, comment — le port effectif se vérifie sur le terrain.",
          "Conformité : équipements marqués CE, adaptés à la morphologie de chaque agent.",
        ],
      },
      {
        heading: "Faire porter les EPI : le défi du terrain",
        bullets: [
          "Choisissez avec les agents : un gant confortable et une chaussure légère sont portés ; les EPI pénibles finissent au vestiaire.",
          "Dotez individuellement et renouvelez sans friction : la demande de remplacement doit être simple et rapide.",
          "Exemplarité de l'encadrement : un chef d'équipe sans EPI annule toutes les consignes.",
          "Tracez la dotation : fiche de remise signée — utile au quotidien et indispensable en cas d'accident.",
        ],
      },
    ],
    faq: [
      {
        q: "L'employeur peut-il faire payer les EPI aux agents ?",
        a: "Non. La fourniture, l'entretien et le remplacement des EPI sont à la charge exclusive de l'employeur. Toute retenue sur salaire ou caution pour les EPI est illicite.",
      },
      {
        q: "Un agent peut-il refuser de porter ses EPI ?",
        a: "Le port des EPI prescrits est une obligation du salarié dès lors que l'employeur a rempli ses obligations (fourniture, formation, consignes). Le refus persistant peut justifier une sanction disciplinaire — mais la première réponse efficace reste de traiter les causes du non-port (inconfort, taille, manque d'explication).",
      },
      {
        q: "Quels gants choisir pour les produits de nettoyage ?",
        a: "Ceux que prescrit la fiche de données de sécurité de chaque produit : la matière (nitrile, latex, néoprène…) et l'épaisseur dépendent de la chimie utilisée. Pour l'entretien courant multi-produits, le nitrile réutilisable est devenu le standard, avec remplacement dès usure.",
      },
    ],
  },

  "produits-chimiques-fds": {
    intro:
      "Toute entreprise de nettoyage qui utilise des produits chimiques doit disposer des fiches de données de sécurité (FDS) fournies obligatoirement par ses fournisseurs, les tenir à disposition des salariés et du service de santé au travail, former les agents aux risques et aux dosages, et organiser un stockage conforme. Les règles d'or du terrain en découlent : jamais de mélange de produits, jamais de transvasement dans un contenant non étiqueté, toujours doser selon la fiche technique.",
    sections: [
      {
        heading: "La FDS : ce qu'elle contient et où la trouver",
        bullets: [
          "La FDS est fournie gratuitement par le fournisseur du produit, en français, lors de la première livraison puis à chaque mise à jour.",
          "Elle détaille en 16 rubriques : dangers, composition, premiers secours, manipulation et stockage, EPI requis, élimination.",
          "Elle doit être accessible aux agents qui utilisent le produit et transmise au service de prévention et de santé au travail.",
          "En pratique : un classeur ou un dossier numérique des FDS par site ou par véhicule, tenu à jour à chaque changement de gamme.",
        ],
      },
      {
        heading: "L'étiquetage CLP : lire les pictogrammes",
        bullets: [
          "Les produits dangereux portent des pictogrammes normalisés (corrosif, irritant, danger pour l'environnement…), des mentions de danger (H…) et des conseils de prudence (P…).",
          "Tout contenant doit rester étiqueté : le transvasement dans une bouteille anonyme est l'une des premières causes d'accident chimique du secteur.",
          "Les flacons de dilution réutilisés doivent porter une étiquette conforme au produit qu'ils contiennent.",
        ],
      },
      {
        heading: "Les règles d'or sur le terrain",
        bullets: [
          "Ne jamais mélanger les produits : l'association d'un acide et d'un produit chloré dégage des gaz toxiques — c'est l'accident type du métier.",
          "Doser selon la fiche technique : le surdosage n'améliore pas le résultat, il augmente les risques, les coûts et les résidus.",
          "Porter les EPI prescrits par la FDS, notamment lors des dilutions de produits concentrés.",
          "Stocker correctement : local ventilé, produits incompatibles séparés, rétention pour les concentrés, hors d'accès des tiers sur les sites clients.",
          "Former chaque agent aux produits qu'il utilise réellement, et tracer cette formation.",
        ],
      },
      {
        heading: "Réduire le risque à la source",
        bullets: [
          "Rationaliser la gamme : moins de produits = moins de risques de confusion et de mélange, et une formation plus simple.",
          "Privilégier les systèmes de dosage (centrales, pompes, doses hydrosolubles) qui suppriment la manipulation des concentrés.",
          "Substituer quand c'est possible : produits éco-labellisés moins agressifs pour l'entretien courant.",
          "Intégrer le risque chimique au DUERP et le réévaluer à chaque nouveau produit.",
        ],
      },
    ],
    faq: [
      {
        q: "Où trouver la FDS d'un produit d'entretien ?",
        a: "Auprès de votre fournisseur ou distributeur, qui a l'obligation de la fournir, et le plus souvent en téléchargement sur le site du fabricant. Si un fournisseur ne fournit pas la FDS d'un produit dangereux, changez de fournisseur.",
      },
      {
        q: "Quels mélanges de produits sont dangereux ?",
        a: "Le plus connu : eau de javel (ou tout produit chloré) avec un acide (détartrant, vinaigre) ou de l'ammoniaque, qui dégage des gaz toxiques. La règle absolue est de ne jamais mélanger de produits, ni dans un récipient, ni successivement sur une même surface non rincée.",
      },
      {
        q: "Les produits écologiques dispensent-ils des FDS ?",
        a: "Non : tout produit chimique mis sur le marché professionnel a une FDS, écolabellisé ou non. Les produits écologiques réduisent souvent la dangerosité, mais les obligations (FDS disponible, étiquetage, formation, dosage) demeurent.",
      },
    ],
  },

  "sous-traitance-obligations-legales": {
    intro:
      "Recourir à un sous-traitant en nettoyage déclenche des obligations légales précises pour le donneur d'ordre : le devoir de vigilance s'applique à tout contrat d'au moins 5 000 € HT (vérification de l'immatriculation et de l'attestation de vigilance URSSAF du sous-traitant, à la signature puis tous les six mois), sous peine de solidarité financière en cas de travail dissimulé. S'y ajoutent l'interdiction du prêt de main-d'œuvre illicite et du marchandage, et les règles de la loi de 1975 sur la sous-traitance.",
    sections: [
      {
        heading: "Le devoir de vigilance : qui, quand, comment",
        bullets: [
          "Champ : tout contrat de prestation d'au moins 5 000 € HT (apprécié sur l'ensemble de la relation, même fractionnée en plusieurs commandes).",
          "À la conclusion du contrat puis tous les six mois jusqu'à sa fin : attestation de vigilance URSSAF (authentifiable en ligne) et justificatif d'immatriculation (Kbis ou équivalent).",
          "Salariés étrangers : obtenir le cas échéant la liste nominative des salariés soumis à autorisation de travail.",
          "Conservez les justificatifs datés : en cas de contrôle, c'est la traçabilité des vérifications qui vous protège.",
        ],
      },
      {
        heading: "Ce que vous risquez sans vigilance",
        bullets: [
          "Solidarité financière : si le sous-traitant est verbalisé pour travail dissimulé, le donneur d'ordre négligent peut être tenu au paiement de ses impôts, cotisations et rémunérations dues.",
          "Sanctions propres en cas de recours conscient au travail dissimulé, et risques pénaux pour prêt de main-d'œuvre illicite ou marchandage.",
          "Risque commercial et réputationnel : les donneurs d'ordre finaux répercutent ces exigences en cascade — un maillon défaillant fait perdre le marché.",
        ],
      },
      {
        heading: "Prêt de main-d'œuvre illicite : la frontière à ne pas franchir",
        paragraphs: [
          "La sous-traitance licite suppose que le sous-traitant exécute une prestation définie, avec son propre personnel, son encadrement, ses méthodes et sous sa responsabilité. Si, en réalité, ses agents travaillent sous les ordres directs du donneur d'ordre, intégrés à ses équipes, avec son matériel et sans prestation distincte, l'opération risque la requalification en prêt de main-d'œuvre illicite ou marchandage — pénalement sanctionnés des deux côtés.",
        ],
        bullets: [
          "Le sous-traitant encadre lui-même ses agents (consignes, plannings, contrôles).",
          "La prestation est définie par un résultat ou un périmètre, pas par une mise à disposition d'heures.",
          "Le prix rémunère une prestation, pas une simple refacturation de salaires.",
        ],
      },
      {
        heading: "Les bons réflexes contractuels",
        bullets: [
          "Un contrat écrit systématique (voir notre modèle de contrat de sous-traitance) avec annexion du cahier des charges.",
          "Un dossier de vigilance par sous-traitant, avec alertes à six mois pour le renouvellement des attestations.",
          "L'interdiction ou l'encadrement strict de la sous-traitance en cascade.",
          "Côté sous-traitant : fournir spontanément ses documents à jour est un argument commercial — c'est tout l'esprit du réseau vérifié de l'association Club Propreté.",
        ],
      },
    ],
    faq: [
      {
        q: "À partir de quel montant le devoir de vigilance s'applique-t-il ?",
        a: "Dès 5 000 € HT, apprécié sur l'ensemble de la relation contractuelle avec le sous-traitant — y compris lorsque plusieurs commandes successives franchissent ensemble ce seuil. En pratique, la quasi-totalité des sous-traitances récurrentes de nettoyage sont concernées.",
      },
      {
        q: "Comment vérifier l'authenticité d'une attestation URSSAF ?",
        a: "Chaque attestation de vigilance comporte un code de sécurité vérifiable en ligne sur le site de l'URSSAF. Cette vérification d'authenticité fait partie du devoir de vigilance : une attestation falsifiée ne protège pas le donneur d'ordre qui ne l'a pas contrôlée.",
      },
      {
        q: "Le client final peut-il interdire la sous-traitance ?",
        a: "Oui : de nombreux contrats de prestation interdisent la sous-traitance ou la soumettent à accord écrit préalable. Sous-traiter en violation de cette clause expose à la résiliation pour faute — vérifiez toujours votre contrat client avant de confier un site.",
      },
    ],
  },

  "documents-obligatoires-entreprise-nettoyage": {
    intro:
      "Une entreprise de nettoyage doit tenir à jour un socle de documents obligatoires : le DUERP dès le premier salarié, le registre unique du personnel, les affichages et informations obligatoires, les documents liés aux salariés (contrats, visites médicales, formations sécurité), les attestations d'assurance, et — spécificité du secteur — les pièces exigées par les clients et donneurs d'ordre (vigilance, plans de prévention, dotations EPI). Un dossier documentaire à jour est aussi un argument commercial face aux acheteurs.",
    sections: [
      {
        heading: "Le socle obligatoire dès le premier salarié",
        bullets: [
          "DUERP (document unique d'évaluation des risques professionnels) : obligatoire dès le premier salarié, mis à jour régulièrement et à chaque changement significatif.",
          "Registre unique du personnel : entrées et sorties de tous les salariés, tenu à jour à chaque mouvement.",
          "Affichages et informations obligatoires : inspection du travail, médecine du travail, secours, égalité, harcèlement, convention collective applicable, horaires.",
          "Dossiers salariés : contrats de travail, DPAE, suivi des visites médicales, traçabilité des formations sécurité, fiches de remise des EPI.",
          "Assurances : attestation de responsabilité civile professionnelle en cours de validité — demandée par la quasi-totalité des clients B2B.",
        ],
      },
      {
        heading: "Les documents spécifiques au métier de la propreté",
        bullets: [
          "FDS des produits utilisés, accessibles aux agents (voir notre fiche produits chimiques & FDS).",
          "Plans de prévention signés avec les clients lorsque les seuils sont atteints, conservés et tenus à disposition.",
          "Documents de l'annexe 7 en cas de transfert de marché : liste du personnel affecté, ancienneté, contrats.",
          "Dossier de vigilance pour chaque sous-traitant (attestations URSSAF semestrielles, immatriculation).",
          "Pour répondre aux marchés : attestations fiscales et sociales à jour, à regrouper dans un dossier permanent.",
        ],
      },
      {
        heading: "Seuils d'effectif : ce qui s'ajoute en grandissant",
        bullets: [
          "À partir de 11 salariés : mise en place du comité social et économique (CSE), avec ses obligations d'élections et de réunions.",
          "À partir de 50 salariés : règlement intérieur obligatoire, attributions élargies du CSE et obligations supplémentaires.",
          "À chaque seuil : vérifiez les obligations conventionnelles propres à la branche propreté, qui peuvent compléter la loi.",
        ],
      },
      {
        heading: "Organiser la conformité sans s'y noyer",
        bullets: [
          "Un dossier permanent numérique unique : statuts, assurances, attestations, DUERP, FDS — mis à jour à date fixe chaque trimestre.",
          "Des alertes de renouvellement : attestations de vigilance (6 mois), assurance (annuelle), visites médicales.",
          "La conformité comme argument de vente : un dossier complet remis spontanément rassure les acheteurs et accélère les contractualisations.",
        ],
      },
    ],
    faq: [
      {
        q: "Le DUERP est-il vraiment obligatoire pour une petite entreprise de nettoyage ?",
        a: "Oui, dès le premier salarié, quelle que soit la taille de l'entreprise. Son absence est sanctionnable en cas de contrôle et pèse lourdement en cas d'accident du travail. Pour une petite structure, un DUERP simple, sincère et mis à jour vaut mieux qu'un document type jamais relu.",
      },
      {
        q: "Quels documents un client peut-il exiger de son prestataire de nettoyage ?",
        a: "Classiquement : Kbis, attestation d'assurance RC professionnelle, attestations de vigilance URSSAF et de régularité fiscale, et selon les sites le plan de prévention signé et les justificatifs de formation des agents. Préparer ce dossier en standard fait gagner chaque négociation.",
      },
      {
        q: "Combien de temps conserver les documents sociaux ?",
        a: "Les durées varient selon les documents (bulletins de paie, registre du personnel, documents de vigilance…), avec des planchers légaux de plusieurs années. La règle pratique sûre : archivage numérique organisé d'au moins cinq ans, et davantage pour les documents de paie et de personnel.",
      },
    ],
  },
};
