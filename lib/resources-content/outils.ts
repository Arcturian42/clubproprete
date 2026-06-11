// Outils & calculateurs visibles dans le méga menu (complément de initial.ts).
// Chaque page publie la méthode de calcul complète ; l'outil interactif
// viendra l'automatiser (bloc « bientôt disponible » automatique).

import type { ResourceContent } from "./types";

export const outilsContents: Record<string, ResourceContent> = {
  "calculateur-marge-chantier": {
    intro:
      "La marge d'un chantier de nettoyage se calcule en soustrayant du prix de vente l'ensemble des coûts directs (heures réellement passées × coût horaire chargé, produits, consommables, déplacements, matériel dédié) puis une quote-part des frais de structure. Marge nette = prix de vente − coûts directs − frais de structure répartis. Beaucoup de chantiers « rentables » au devis deviennent déficitaires à l'exécution : seul le suivi des heures réelles révèle la vérité.",
    sections: [
      {
        heading: "La formule de calcul de la marge chantier",
        paragraphs: [
          "Marge brute = prix de vente HT − coûts directs du chantier. Marge nette = marge brute − quote-part de frais de structure (encadrement, véhicules, assurances, administratif). Exprimez les deux en euros et en pourcentage du prix de vente : le pourcentage permet de comparer les chantiers entre eux, l'euro montre ce que le chantier rapporte vraiment.",
        ],
      },
      {
        heading: "Recenser tous les coûts directs (sans en oublier)",
        bullets: [
          "Main-d'œuvre : heures réelles pointées × coût horaire chargé — y compris les heures d'encadrement passées sur le chantier.",
          "Déplacements : temps de trajet payé, carburant, usure du véhicule — le poste le plus souvent oublié.",
          "Produits et consommables réellement consommés sur le chantier.",
          "Matériel : location ou amortissement des machines mobilisées (autolaveuse, monobrosse, nacelle).",
          "Sous-traitance éventuelle et coûts spécifiques (contrôle d'accès, formation site, EPI dédiés).",
        ],
      },
      {
        heading: "Comparer devis et réalisé : la boucle d'apprentissage",
        bullets: [
          "Enregistrez les hypothèses du devis (heures, cadences) au moment de la vente.",
          "Pointez les heures réelles dès la première semaine d'exécution : un dérapage se corrige tôt ou ne se corrige pas.",
          "Analysez les écarts : cadence trop optimiste, site plus dégradé que prévu, demandes hors périmètre non facturées.",
          "Réinjectez dans vos prochains devis : vos cadences réelles valent mieux que toutes les références du marché.",
        ],
      },
      {
        heading: "Que faire d'un chantier à marge négative ?",
        bullets: [
          "Identifier la cause : prix de vente trop bas, organisation inefficace, périmètre qui a dérivé sans avenant.",
          "Renégocier à l'échéance avec un dossier factuel : heures réelles, demandes additionnelles documentées.",
          "Réorganiser : regrouper les passages, mécaniser, ajuster l'équipe — souvent plusieurs points de marge récupérables.",
          "Savoir rendre le contrat : conserver un chantier structurellement déficitaire détruit la valeur des autres.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle marge viser sur un chantier de nettoyage ?",
        a: "Il n'existe pas de norme unique : la marge dépend du segment, de la récurrence et du risque. La règle utile est ailleurs : connaître la marge nette réelle de chaque chantier, viser une marge positive après frais de structure sur chacun, et réserver les marges serrées aux contrats stratégiques assumés.",
      },
      {
        q: "Pourquoi mon chantier rentable au devis perd-il de l'argent ?",
        a: "Les trois causes les plus fréquentes : des cadences de devis optimistes par rapport au site réel, des temps de déplacement non comptés, et des demandes additionnelles du client absorbées sans facturation. Le pointage des heures réelles dès le démarrage révèle l'écart pendant qu'il est encore corrigeable.",
      },
      {
        q: "Comment répartir les frais de structure entre les chantiers ?",
        a: "La méthode la plus simple et la plus robuste : au prorata des heures travaillées de chaque chantier. Calculez votre coût de structure par heure travaillée (total des frais fixes annuels ÷ heures productives annuelles) et imputez-le à chaque chantier selon ses heures.",
      },
    ],
  },

  "calculateur-cout-horaire-agent": {
    intro:
      "Le coût horaire complet d'un agent d'entretien va bien au-delà de son salaire brut : il faut ajouter les cotisations patronales, les temps payés non productifs (congés, jours fériés, absences, trajets inter-sites), les produits, consommables et EPI, puis une quote-part de frais de structure. Selon l'organisation, le coût horaire complet dépasse couramment le seul salaire chargé de 20 à 40 % — l'ignorer, c'est vendre à perte sans le savoir.",
    sections: [
      {
        heading: "Les quatre couches du coût horaire",
        bullets: [
          "Couche 1 — Salaire chargé : salaire brut conventionnel + cotisations patronales (variables selon les allègements applicables aux bas salaires).",
          "Couche 2 — Temps payés non productifs : congés payés, jours fériés, absences à remplacer, formation, habillage et trajets payés.",
          "Couche 3 — Coûts d'équipement : EPI, tenues, produits et consommables, petit matériel, rapportés à l'heure travaillée.",
          "Couche 4 — Quote-part de structure : encadrement, véhicules, assurances, administratif, divisés par les heures productives.",
        ],
      },
      {
        heading: "La méthode de calcul pas à pas",
        bullets: [
          "Partez du coût annuel total de l'agent : salaires bruts + charges patronales sur 12 mois, primes conventionnelles incluses.",
          "Calculez ses heures réellement productives sur l'année : heures payées − congés, fériés, absences moyennes, temps non affectables.",
          "Divisez : coût annuel ÷ heures productives = coût horaire productif (déjà supérieur au taux horaire chargé).",
          "Ajoutez l'équipement par heure puis la structure par heure : vous obtenez le coût horaire complet, base de tout devis fiable.",
        ],
      },
      {
        heading: "Les pièges classiques du calcul",
        bullets: [
          "Diviser par les heures payées au lieu des heures productives : l'erreur la plus répandue, qui sous-estime le coût.",
          "Oublier les remplacements : l'absentéisme se paie deux fois (l'absent et le remplaçant) — intégrez un taux d'absence réaliste.",
          "Négliger l'ancienneté et les primes conventionnelles, qui augmentent mécaniquement le coût au fil du contrat.",
          "Utiliser un coût unique pour tous les profils : un agent machiniste ou un chef d'équipe a son propre coût horaire.",
        ],
      },
    ],
    faq: [
      {
        q: "Quel est le coût réel d'un agent payé au SMIC ou au minimum conventionnel ?",
        a: "Une fois ajoutés les cotisations patronales (atténuées par les allègements sur les bas salaires), les temps non productifs payés, l'équipement et la structure, le coût horaire complet dépasse sensiblement le taux horaire brut — couramment de l'ordre de 1,3 à 1,6 fois le brut selon l'organisation. Faites le calcul avec vos propres chiffres : c'est lui qui fixe votre prix plancher.",
      },
      {
        q: "Le coût horaire est-il le même pour tous mes agents ?",
        a: "Non : ancienneté, classification, primes, taux d'absence et affectation (sites regroupés ou dispersés) créent des écarts significatifs. Calculez au minimum un coût moyen par profil (agent de service, machiniste, chef d'équipe) et actualisez-le à chaque revalorisation conventionnelle.",
      },
      {
        q: "À quoi sert le coût horaire complet au quotidien ?",
        a: "C'est la brique de base de tous vos chiffrages : devis (heures estimées × coût complet + marge), analyse de marge des chantiers, décision de sous-traiter ou d'embaucher, et négociation des révisions de prix appuyée sur l'évolution objective de vos coûts.",
      },
    ],
  },

  "simulateur-devis-nettoyage-bureaux": {
    intro:
      "Pour chiffrer un devis de nettoyage de bureaux, la démarche fiable tient en cinq entrées : la surface par type de zone (bureaux, circulations, sanitaires, espaces communs), la fréquence de passage par zone, les cadences applicables, votre coût horaire complet et votre marge. Le résultat s'exprime en forfait mensuel — l'unité de référence du marché tertiaire. Cette page détaille la méthode que le simulateur automatisera.",
    sections: [
      {
        heading: "Les informations à recueillir avant de chiffrer",
        bullets: [
          "Surfaces par zone : plateaux de bureaux, salles de réunion, circulations, sanitaires, espace café/restauration, accueil.",
          "Effectif présent et taux d'occupation : un open space de 50 personnes ne se traite pas comme un plateau semi-vide.",
          "Fréquences souhaitées par zone : quotidien pour sanitaires et points de contact, bihebdomadaire ou hebdomadaire ailleurs selon le budget.",
          "Contraintes : horaires d'intervention imposés, étages et accès, tri des déchets, exigences spécifiques (salles serveurs, direction).",
          "Prestations périodiques à part : vitrerie, entretien mécanisé des sols, nettoyage de moquettes.",
        ],
      },
      {
        heading: "Du temps au forfait mensuel : le calcul",
        bullets: [
          "Temps par passage = somme des (surface de zone ÷ cadence de zone), majoré des tâches fixes (poubelles, consommables, traçabilité).",
          "Heures mensuelles = temps par passage × nombre de passages mensuels par zone.",
          "Coût mensuel = heures mensuelles × coût horaire complet + consommables fournis le cas échéant.",
          "Forfait mensuel = coût mensuel × (1 + marge), prestations périodiques chiffrées en options séparées.",
        ],
      },
      {
        heading: "Les ajustements qui font un devis juste",
        bullets: [
          "Sanitaires et espaces de restauration : cadences nettement plus lentes — c'est là que les devis génériques se trompent.",
          "Premier mois : prévoyez une remise à niveau initiale si le site sort d'une prestation dégradée (à facturer ou à provisionner).",
          "Sites multi-étages sans ascenseur de service, badges, alarmes : du temps réel à intégrer.",
          "Consommables (papier, savon, sacs) : inclus avec refacturation au réel ou forfaitisés — mais jamais oubliés.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle fréquence de nettoyage recommander pour des bureaux ?",
        a: "Le standard tertiaire : sanitaires et zones de contact en quotidien, bureaux et circulations deux à cinq fois par semaine selon l'occupation et le budget, vitrerie et sols mécanisés en périodique. La bonne fréquence est celle qui maintient le niveau attendu entre deux passages — proposez deux scénarios chiffrés au client.",
      },
      {
        q: "Comment présenter le devis : au m², à l'heure ou au forfait ?",
        a: "Calculez en heures, vendez au forfait mensuel : c'est l'unité que les clients tertiaires budgètent et comparent. Le détail des fréquences par zone joint au forfait montre le sérieux du chiffrage sans exposer vos cadences internes.",
      },
      {
        q: "Quand le simulateur interactif sera-t-il disponible ?",
        a: "Il est en cours de développement avec des professionnels du secteur. Créez votre compte Club Propreté pour être averti de sa mise en ligne — en attendant, la méthode ci-dessus se déroule très bien dans un tableur.",
      },
    ],
  },

  "generateur-cahier-des-charges": {
    intro:
      "Pour générer un cahier des charges de nettoyage complet, il suffit de répondre méthodiquement à six familles de questions : description du site, inventaire des zones, prestations et fréquences attendues par zone, exigences particulières (produits, horaires, sécurité), modalités de contrôle qualité et cadre contractuel. Cette page fournit la trame de questions complète — le générateur interactif l'automatisera en produisant un document prêt à envoyer aux prestataires.",
    sections: [
      {
        heading: "Les six blocs de questions du générateur",
        bullets: [
          "1. Le site : adresse, surfaces totales, plans disponibles, effectifs présents, horaires d'occupation, contraintes d'accès.",
          "2. Les zones : liste exhaustive avec surface et spécificité (bureaux, sanitaires, restauration, ateliers, extérieurs, parkings).",
          "3. Les prestations : pour chaque zone, tâches attendues et fréquence — plus les prestations périodiques (vitrerie, sols).",
          "4. Les exigences : produits éco-labellisés ou non, horaires d'intervention, qualifications, confidentialité, tri des déchets.",
          "5. Le contrôle : grille d'évaluation, fréquence des contrôles contradictoires, traitement des réclamations et délais de correction.",
          "6. Le cadre : durée envisagée, date de démarrage, modalités de visite préalable, critères de choix du prestataire.",
        ],
      },
      {
        heading: "Les réglages qui changent le prix (à décider en connaissance de cause)",
        bullets: [
          "Fréquences : le premier levier budgétaire — passer une zone de quotidien à trois fois par semaine change significativement le coût.",
          "Obligation de moyens ou de résultat : le résultat responsabilise le prestataire mais exige une grille de contrôle partagée.",
          "Horaires d'intervention : le nettoyage en journée évite les majorations et améliore les conditions de travail des agents.",
          "Fournitures des consommables : incluses au forfait ou refacturées — à trancher dès le cahier des charges pour comparer les offres.",
        ],
      },
      {
        heading: "Bien utiliser le cahier des charges généré",
        bullets: [
          "Faites visiter le site à chaque prestataire consulté : les offres reçues sans visite ne valent rien.",
          "Exigez des réponses structurées zone par zone pour comparer ligne à ligne.",
          "Annexez le document au contrat signé : il devient la référence des contrôles qualité.",
          "Mettez-le à jour à chaque évolution du site, et systématiquement avant chaque remise en concurrence.",
        ],
      },
    ],
    faq: [
      {
        q: "Qui peut utiliser ce générateur : client ou prestataire ?",
        a: "Les deux. Le donneur d'ordre l'utilise pour formaliser son besoin avant consultation ; le prestataire l'utilise pour aider un client qui n'a pas de cahier des charges — un service apprécié qui structure la relation dès le départ.",
      },
      {
        q: "Quelle longueur pour un bon cahier des charges de nettoyage ?",
        a: "Quelques pages suffisent pour un site tertiaire courant : l'exhaustivité des zones et des fréquences compte plus que le volume. Les cahiers des charges interminables recopiés d'internet produisent des offres incomparables et des litiges d'interprétation.",
      },
      {
        q: "Quand le générateur interactif sera-t-il disponible ?",
        a: "Il est en préparation. Créez votre compte Club Propreté pour être informé de sa sortie ; en attendant, le modèle de cahier des charges téléchargeable et la trame de questions ci-dessus permettent déjà de produire un document solide.",
      },
    ],
  },

  "score-visibilite-entreprise-nettoyage": {
    intro:
      "La visibilité en ligne d'une entreprise de nettoyage s'évalue sur cinq dimensions : sa fiche d'établissement Google (complétude et avis), son site web (clarté, pages locales, preuves), sa présence dans les annuaires professionnels, ses réseaux sociaux professionnels (LinkedIn en tête) et sa réputation (avis, références citées). Cette page fournit la grille d'auto-évaluation complète — le score interactif l'automatisera avec des recommandations personnalisées.",
    sections: [
      {
        heading: "La grille d'auto-évaluation en cinq piliers",
        bullets: [
          "Fiche Google : revendiquée, catégorie correcte, photos réelles, horaires, zone de service, et surtout des avis récents avec réponses.",
          "Site web : prestations claires, zone d'intervention explicite, références et preuves, contact en un clic, version mobile rapide.",
          "Annuaires professionnels : présence et complétude des fiches sur les annuaires du secteur, dont l'annuaire Club Propreté.",
          "LinkedIn : page entreprise active, dirigeant visible, contenu régulier — c'est là que les donneurs d'ordre B2B vérifient.",
          "Réputation : avis clients (volume, note, fraîcheur), témoignages exploités, cohérence des informations partout en ligne.",
        ],
      },
      {
        heading: "Pourquoi la visibilité locale prime en nettoyage",
        paragraphs: [
          "Un client cherche un prestataire de nettoyage près de chez lui : les recherches sont massivement locales (« entreprise de nettoyage + ville »). La fiche Google et les pages locales du site captent l'essentiel de cette demande — bien avant la publicité. Une entreprise invisible localement laisse mécaniquement les demandes entrantes à ses concurrents référencés.",
        ],
      },
      {
        heading: "Les actions à plus fort impact (par ordre de priorité)",
        bullets: [
          "Demander un avis Google à chaque client satisfait, avec le lien direct : le volume et la fraîcheur des avis pèsent lourdement.",
          "Compléter à 100 % sa fiche annuaire Club Propreté et sa fiche Google : dix minutes chacune, effet durable.",
          "Créer une page par prestation et par ville principale sur le site : c'est ce que cherchent réellement les prospects.",
          "Publier une fois par mois sur LinkedIn (chantier livré, recrutement, coulisses) : la régularité bat la quantité.",
          "Harmoniser nom, adresse et téléphone partout en ligne : les incohérences pénalisent le référencement local.",
        ],
      },
    ],
    faq: [
      {
        q: "Combien d'avis Google faut-il pour être crédible ?",
        a: "Il n'y a pas de seuil magique : la régularité compte plus que le total. Quelques avis récents et détaillés avec des réponses du dirigeant rassurent davantage qu'un gros volume ancien. L'objectif réaliste : un nouvel avis par mois, demandé systématiquement après chaque prestation réussie.",
      },
      {
        q: "Une petite entreprise de nettoyage a-t-elle besoin d'un site web ?",
        a: "Oui, même simple : une page claire avec prestations, zone, preuves et contact suffit à passer le filtre de crédibilité que appliquent les prospects B2B. Sans site, la fiche Google et la fiche annuaire Club Propreté constituent le minimum vital.",
      },
      {
        q: "Quand le score de visibilité interactif sera-t-il disponible ?",
        a: "Il est en cours de développement. Créez votre compte Club Propreté pour être averti de sa sortie — et utilisez dès maintenant la grille ci-dessus : chaque pilier évalué honnêtement révèle déjà vos priorités.",
      },
    ],
  },
};
