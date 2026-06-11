// Première vague de contenus publiés (P0) : guides piliers, modèles
// devis/sous-traitance/cahier des charges, calculateur de prix, comparatif
// autolaveuses, plan de prévention et analyses marché.

import type { ResourceContent } from "./types";

export const initialContents: Record<string, ResourceContent> = {

  // ── Guides ────────────────────────────────────────────────────────────────
  "creer-entreprise-nettoyage": {
    intro:
      "Pour créer une entreprise de nettoyage en France, il faut choisir un statut juridique (micro-entreprise, EURL ou SASU le plus souvent), immatriculer l'activité, souscrire une assurance responsabilité civile professionnelle, s'équiper en matériel de base, puis décrocher ses premiers contrats B2B. L'activité de nettoyage de locaux est libre d'accès : aucun diplôme n'est exigé pour se lancer, ce qui en fait l'une des créations d'entreprise les plus accessibles — à condition de soigner sa rentabilité dès le départ.",
    sections: [
      {
        heading: "Quel statut juridique choisir pour une entreprise de nettoyage ?",
        paragraphs: [
          "Le choix du statut dépend de votre situation et de vos ambitions. La micro-entreprise est idéale pour tester l'activité seul, avec des démarches minimales et des cotisations proportionnelles au chiffre d'affaires — mais elle plafonne le chiffre d'affaires et ne permet pas de déduire ses charges réelles (produits, matériel, véhicule). L'EURL ou la SASU conviennent dès que vous prévoyez d'investir, d'embaucher ou de répondre à des appels d'offres : elles crédibilisent votre structure auprès des donneurs d'ordre.",
        ],
        bullets: [
          "Micro-entreprise : démarrage rapide, comptabilité allégée, adaptée à un lancement en solo sans gros investissement.",
          "EURL : patrimoine protégé, charges déductibles, image plus solide pour le B2B.",
          "SASU : régime social du dirigeant assimilé salarié, souplesse pour accueillir des associés et lever des fonds.",
          "Dans tous les cas : immatriculation via le guichet unique de l'INPI et code APE généralement 81.21Z (nettoyage courant des bâtiments).",
        ],
      },
      {
        heading: "Quel budget prévoir pour se lancer ?",
        paragraphs: [
          "Une activité de nettoyage de bureaux peut démarrer avec un investissement limité : le matériel de base (chariot, aspirateur professionnel, microfibre, produits) reste abordable, et le poste le plus important est souvent le véhicule. Prévoyez aussi une trésorerie de sécurité : en B2B, les clients paient fréquemment à 30 ou 45 jours, alors que vos charges (salaires, produits, carburant) sont immédiates.",
        ],
        bullets: [
          "Matériel de base bureaux : quelques centaines à environ deux mille euros selon la gamme.",
          "Assurance RC professionnelle : indispensable avant la première intervention — les clients la demandent systématiquement.",
          "Véhicule utilitaire : achat d'occasion ou location longue durée selon la trésorerie.",
          "Trésorerie de démarrage : au minimum deux à trois mois de charges fixes pour absorber les délais de paiement.",
        ],
      },
      {
        heading: "Les obligations à ne pas négliger",
        bullets: [
          "Responsabilité civile professionnelle : couvre les dommages causés chez les clients (casse, dégât des eaux, clé perdue).",
          "Convention collective des entreprises de propreté et services associés : applicable dès la première embauche (grilles de salaires, annexe 7 sur la reprise du personnel).",
          "DUERP (document unique d'évaluation des risques) : obligatoire dès le premier salarié.",
          "Conformité des produits : étiquetage, fiches de données de sécurité (FDS) et stockage adapté.",
        ],
      },
      {
        heading: "Comment trouver ses premiers clients ?",
        paragraphs: [
          "Les premiers contrats viennent rarement de la publicité : ils viennent du réseau de proximité et de la recommandation. Ciblez les structures qui décident vite — TPE, commerces, professions libérales, syndics de petites copropriétés — avant de viser les grands comptes, dont les cycles de décision sont longs.",
        ],
        bullets: [
          "Référencez votre entreprise dans les annuaires professionnels spécialisés, dont l'annuaire Club Propreté.",
          "Travaillez votre visibilité locale : fiche d'établissement Google, avis clients, site simple et clair.",
          "Proposez un audit ou un essai sur un site pilote pour lever les freins.",
          "Soignez le premier contrat : dans la propreté, la recommandation est le premier canal d'acquisition.",
        ],
      },
      {
        heading: "Les erreurs fréquentes des créateurs",
        bullets: [
          "Vendre trop bas pour décrocher le contrat : un prix non rentable est intenable dès qu'il faut salarier ou remplacer.",
          "Sous-estimer les temps de déplacement entre sites dans le calcul du coût de revient.",
          "Accepter des prestations hors de sa zone ou de ses compétences (vitrerie en hauteur, milieux sensibles) sans équipement ni habilitation.",
          "Négliger l'écrit : devis détaillé et contrat signé avant toute intervention récurrente.",
        ],
      },
    ],
    faq: [
      {
        q: "Faut-il un diplôme pour créer une entreprise de nettoyage ?",
        a: "Non. Le nettoyage de locaux est une activité non réglementée : aucun diplôme ni agrément n'est exigé. Des certifications (CQP, habilitations spécifiques) restent toutefois des atouts commerciaux et deviennent nécessaires pour certains environnements (santé, agroalimentaire, travaux en hauteur).",
      },
      {
        q: "Peut-on créer une entreprise de nettoyage en micro-entreprise ?",
        a: "Oui, c'est même le statut le plus utilisé pour démarrer seul. Attention cependant au plafond de chiffre d'affaires des prestations de services et à l'impossibilité de déduire ses charges réelles : dès que l'activité décolle ou qu'une embauche se profile, le passage en société (EURL, SASU) devient généralement plus avantageux.",
      },
      {
        q: "Quelle assurance est obligatoire pour une entreprise de nettoyage ?",
        a: "La responsabilité civile professionnelle est incontournable : elle couvre les dommages causés dans les locaux des clients. S'y ajoutent l'assurance du véhicule utilitaire et, le cas échéant, la garantie des biens confiés (clés, badges d'accès).",
      },
      {
        q: "Combien de temps faut-il pour rentabiliser une entreprise de nettoyage ?",
        a: "Avec des contrats d'entretien récurrents bien chiffrés, une activité en solo peut être rentable dès les premiers mois, car les investissements de départ sont faibles. Le vrai cap financier arrive avec les premières embauches : il faut alors une marge suffisante pour absorber salaires, remplacements et encadrement.",
      },
    ],
  },

  "trouver-clients-nettoyage-b2b": {
    intro:
      "Pour trouver des clients B2B dans le nettoyage, les leviers les plus efficaces sont, dans l'ordre : la recommandation et le réseau professionnel, la visibilité locale (fiche Google, annuaires spécialisés), la prospection directe ciblée (email et téléphone vers les gestionnaires de sites), et la réponse aux consultations et appels d'offres. Le secteur fonctionne historiquement au bouche-à-oreille : structurer ces canaux, c'est transformer un flux aléatoire en acquisition prévisible.",
    sections: [
      {
        heading: "Qui sont les bons clients B2B pour une entreprise de nettoyage ?",
        paragraphs: [
          "Avant de prospecter, définissez votre client idéal : taille des locaux, fréquence de passage, distance de votre base et interlocuteur décisionnaire. Un portefeuille sain combine des contrats récurrents (bureaux, copropriétés, cabinets médicaux) qui sécurisent la trésorerie, et des prestations ponctuelles mieux margées (remises en état, fins de chantier, vitrerie).",
        ],
        bullets: [
          "TPE/PME et professions libérales : décision rapide, contrats accessibles, fidélité forte si la qualité suit.",
          "Syndics et copropriétés : volume récurrent, mais exigence de régularité et de traçabilité.",
          "Commerces et franchises : potentiel de duplication sur plusieurs points de vente.",
          "Grands comptes et facility management : gros volumes, cycles de décision longs, souvent via consultation.",
        ],
      },
      {
        heading: "Construire une offre qui se vend",
        bullets: [
          "Une proposition claire : périmètre, fréquences, fournitures incluses ou non, modalités de contrôle qualité.",
          "Des preuves : références, photos avant/après, attestation d'assurance, certifications éventuelles.",
          "Un devis professionnel remis sous 48 h — la réactivité est un critère de choix majeur des clients B2B.",
          "Un positionnement différenciant : nettoyage en journée, produits éco-labellisés, interlocuteur unique, reporting.",
        ],
      },
      {
        heading: "Les canaux d'acquisition qui fonctionnent dans la propreté",
        paragraphs: [
          "Aucun canal ne suffit seul : les entreprises qui croissent combinent visibilité passive (être trouvable quand un prospect cherche) et prospection active (aller chercher les contrats).",
        ],
        bullets: [
          "Recommandation organisée : demandez systématiquement une mise en relation après quelques mois de prestation réussie.",
          "Visibilité locale : fiche d'établissement Google complète et avis clients, site avec pages par prestation et par ville.",
          "Annuaires professionnels spécialisés : être présent là où les donneurs d'ordre comparent les prestataires, comme l'annuaire Club Propreté.",
          "Prospection directe : emails courts et personnalisés vers les responsables de sites, relancés par téléphone.",
          "Réseau physique : clubs d'entreprises locaux, événements professionnels du secteur.",
          "Sous-traitance pour des confrères : un moyen éprouvé de remplir son planning en phase de lancement.",
        ],
      },
      {
        heading: "Transformer un prospect en contrat récurrent",
        bullets: [
          "Visitez toujours le site avant de chiffrer : un devis à distance se trompe presque toujours, et la visite crée la relation.",
          "Reformulez le besoin réel : le client achète un résultat (locaux impeccables, zéro réclamation), pas des heures.",
          "Proposez une période d'essai ou un site pilote pour réduire le risque perçu.",
          "Verrouillez par écrit : contrat, planning, interlocuteurs et procédure de réclamation.",
        ],
      },
    ],
    faq: [
      {
        q: "Comment prospecter efficacement pour du nettoyage de bureaux ?",
        a: "Ciblez les responsables de sites (office managers, DAF, gérants) avec un email court mentionnant un élément local et concret, puis relancez par téléphone sous une semaine. Une dizaine de prospections bien ciblées valent mieux que des centaines de messages génériques.",
      },
      {
        q: "Les appels d'offres sont-ils accessibles aux petites entreprises de nettoyage ?",
        a: "Oui, notamment les marchés allotis des collectivités locales et les consultations privées de PME. Commencez par des lots de taille raisonnable proches de votre zone, et capitalisez sur chaque réponse : le dossier de candidature et le mémoire technique se réutilisent en grande partie.",
      },
      {
        q: "Faut-il un site internet pour trouver des clients en nettoyage ?",
        a: "Un site simple mais professionnel reste un filtre de crédibilité : la plupart des prospects vérifient en ligne avant de répondre. L'essentiel : vos prestations, votre zone d'intervention, des preuves (références, avis) et un moyen de contact immédiat.",
      },
      {
        q: "Combien de temps pour décrocher ses premiers contrats B2B ?",
        a: "Avec une prospection active et un réseau local mobilisé, les premiers contrats récurrents arrivent généralement en quelques semaines à quelques mois. Les grands comptes, eux, se gagnent sur des cycles de six à dix-huit mois : il faut les travailler en parallèle, pas en premier.",
      },
    ],
  },

  "fixer-prix-nettoyage": {
    intro:
      "Pour fixer un prix de nettoyage rentable, la méthode fiable consiste à partir du temps d'intervention réel (surface × cadence), à le multiplier par votre coût horaire complet (salaire chargé + produits + déplacements + frais de structure), puis à appliquer votre marge. Les prix s'expriment ensuite au m², à l'heure ou au forfait mensuel selon le client — mais le calcul sous-jacent doit toujours partir de vos coûts, jamais du prix du concurrent.",
    sections: [
      {
        heading: "Les trois méthodes de tarification du nettoyage",
        bullets: [
          "Au m² : adaptée aux grandes surfaces homogènes (plateaux de bureaux, surfaces commerciales) ; simple à comparer mais dangereuse si la cadence est mal estimée.",
          "À l'heure : lisible pour le client et sécurisante en prestation ponctuelle ; veillez à facturer le temps réel, déplacements compris.",
          "Au forfait mensuel : la norme pour l'entretien récurrent ; le forfait doit intégrer remplacements, fournitures et aléas, sinon la marge s'érode au fil du contrat.",
        ],
      },
      {
        heading: "Calculer son coût de revient horaire (la base de tout)",
        paragraphs: [
          "Le coût d'un agent ne se limite pas à son salaire brut. Pour obtenir un coût horaire complet, ajoutez les cotisations patronales, les temps non productifs (déplacements, préparation, congés, absences à remplacer), les produits et consommables, l'amortissement du matériel et une quote-part de frais de structure (assurances, véhicule, gestion). En pratique, le coût complet dépasse nettement le simple salaire chargé — c'est l'erreur de chiffrage la plus répandue du secteur.",
        ],
        bullets: [
          "Salaire conventionnel (grille de la convention collective de la propreté) + charges patronales.",
          "Temps invisibles : trajets inter-sites, gestion des clés, contrôles, remplacements.",
          "Produits, consommables et petit matériel rapportés à l'heure travaillée.",
          "Frais fixes répartis : assurance, véhicule, téléphone, logiciels, comptabilité.",
        ],
      },
      {
        heading: "Estimer le temps d'intervention avec les cadences",
        paragraphs: [
          "La cadence (surface traitée par heure) varie fortement selon le type de local, l'encombrement et le niveau d'exigence : un open space dégagé se traite beaucoup plus vite que des sanitaires ou une salle de pause. Construisez vos propres références de cadences en chronométrant vos premières interventions : ce sont elles qui fiabiliseront tous vos devis futurs.",
        ],
        bullets: [
          "Listez les zones (bureaux, circulations, sanitaires, cuisine) plutôt que de chiffrer une surface globale.",
          "Appliquez une cadence par zone, puis ajoutez les tâches périodiques (vitres, sols mécanisés) en lignes séparées.",
          "Majorez pour les contraintes : étages sans ascenseur, sites éclatés, horaires imposés.",
        ],
      },
      {
        heading: "Positionner son prix face au marché",
        bullets: [
          "Comparez votre prix calculé aux prix de marché locaux : s'il est trop au-dessus, cherchez des gains d'organisation plutôt que de raboter la marge.",
          "Ne vous alignez jamais sous votre coût de revient pour « prendre » un contrat : vous financeriez votre client à perte.",
          "Valorisez ce qui justifie l'écart : régularité, contrôles qualité, réactivité, produits éco-labellisés.",
          "Prévoyez la clause de révision annuelle des prix : les salaires conventionnels augmentent chaque année.",
        ],
      },
    ],
    faq: [
      {
        q: "Quel est le prix moyen du nettoyage de bureaux au m² ?",
        a: "Il n'existe pas de prix unique : le tarif dépend de la fréquence, de la densité d'occupation, des prestations incluses et de la région. Plutôt que de partir d'une moyenne nationale, calculez votre coût de revient réel et positionnez votre marge — puis vérifiez la cohérence avec les prix pratiqués localement.",
      },
      {
        q: "Comment facturer une prestation ponctuelle de nettoyage ?",
        a: "Au temps passé estimé après visite du site, avec un minimum de facturation pour couvrir le déplacement. Les prestations ponctuelles (remise en état, fin de chantier) justifient une marge supérieure aux contrats récurrents : pas de récurrence, plus d'aléas.",
      },
      {
        q: "Faut-il afficher ses prix publiquement ?",
        a: "En B2B, rarement : chaque site a ses spécificités et un prix affiché devient un plafond en négociation. En revanche, communiquer une fourchette indicative ou un « à partir de » peut qualifier les demandes entrantes.",
      },
      {
        q: "Comment augmenter ses prix sans perdre ses clients ?",
        a: "Anticipez par une clause de révision contractuelle, appuyez-vous sur des éléments objectifs (revalorisation de la grille conventionnelle, hausse des coûts) et annoncez l'évolution en amont avec un préavis. Un client correctement servi accepte une revalorisation expliquée ; il refuse une surprise.",
      },
    ],
  },

  "repondre-appel-offres-nettoyage": {
    intro:
      "Répondre à un appel d'offres de nettoyage se joue en quatre étapes : analyser le dossier de consultation (DCE) pour décider d'y aller ou non, constituer le dossier de candidature (capacités administratives et références), construire une offre chiffrée cohérente avec le cahier des charges, et rédiger un mémoire technique personnalisé — c'est lui qui fait la différence à prix comparable. Une réponse gagnante se prépare avec méthode, pas dans l'urgence des derniers jours.",
    sections: [
      {
        heading: "Étape 1 — Analyser le dossier et décider de répondre",
        bullets: [
          "Lisez d'abord le règlement de consultation : critères de jugement et leur pondération (prix/valeur technique), pièces exigées, date limite.",
          "Vérifiez l'adéquation : zone géographique, volume d'heures, exigences (certifications, reprise du personnel via l'annexe 7) par rapport à vos capacités réelles.",
          "Estimez vos chances : un marché taillé pour le sortant ou très éloigné de vos références consomme du temps pour rien.",
          "Posez vos questions via la plateforme dans les délais : les réponses profitent à tous, mais montrent votre sérieux.",
        ],
      },
      {
        heading: "Étape 2 — Constituer un dossier de candidature solide",
        bullets: [
          "Pièces administratives à jour : attestations fiscales et sociales, assurance RC pro, Kbis — préparez un dossier permanent réutilisable.",
          "Références : privilégiez des prestations comparables (taille, secteur, contraintes) avec contacts vérifiables.",
          "Capacités : effectifs, encadrement, matériel — chiffres cohérents avec le volume du marché visé.",
          "Pour les marchés publics, le DUME peut remplacer une partie des formulaires : gagnez du temps en le préremplissant.",
        ],
      },
      {
        heading: "Étape 3 — Construire le prix sans se piéger",
        paragraphs: [
          "Le bordereau de prix doit découler d'un calcul d'heures site par site, pas d'un prix au m² plaqué. Identifiez les coûts spécifiques au marché : reprise du personnel (salaires et anciennetés repris), produits et matériel exigés, encadrement, contrôles, gestion des absences. Un prix anormalement bas peut être écarté ; un prix non rentable gagné est pire qu'un marché perdu.",
        ],
        bullets: [
          "Décomposez : heures par site et par prestation × coût horaire complet + frais fixes du marché + marge.",
          "Intégrez la révision des prix et la durée du marché dans votre équilibre économique.",
          "Documentez vos hypothèses : en cas d'offre jugée anormalement basse, vous devrez les justifier.",
        ],
      },
      {
        heading: "Étape 4 — Rédiger un mémoire technique qui marque des points",
        bullets: [
          "Personnalisez systématiquement : reprenez les sites, contraintes et attentes exprimées dans le cahier des charges — un mémoire générique se repère immédiatement.",
          "Structurez selon les critères de notation annoncés : facilitez le travail de l'évaluateur.",
          "Prouvez plutôt qu'affirmez : organigramme dédié, plan de formation, exemples de fiches de contrôle, modalités de remplacement sous délai.",
          "Soignez les volets attendus : qualité, RSE et environnement, continuité de service, gestion des réclamations.",
        ],
      },
      {
        heading: "Après la réponse : gagner ou apprendre",
        bullets: [
          "En cas de rejet, demandez les motifs et les notes obtenues : c'est un droit dans les marchés publics et une mine d'amélioration.",
          "Capitalisez : chaque mémoire enrichit une bibliothèque de contenus réutilisables.",
          "Restez visible auprès de l'acheteur : un marché se rejoue à échéance régulière.",
        ],
      },
    ],
    faq: [
      {
        q: "Une petite entreprise peut-elle gagner un appel d'offres de nettoyage ?",
        a: "Oui, surtout sur les marchés allotis et les volumes adaptés à sa capacité. Les acheteurs valorisent la proximité, la réactivité et un encadrement impliqué — des points où une structure locale bat souvent un grand groupe, à condition de présenter un dossier irréprochable.",
      },
      {
        q: "Qu'est-ce que l'annexe 7 dans les appels d'offres de propreté ?",
        a: "C'est le dispositif conventionnel de reprise du personnel : lorsqu'un marché de nettoyage change de prestataire, le nouveau titulaire reprend les salariés affectés au site sous conditions. Il faut donc intégrer les salaires et anciennetés du personnel repris dans son chiffrage — les informations figurent normalement dans le DCE.",
      },
      {
        q: "Où trouver les appels d'offres de nettoyage ?",
        a: "Pour le public : le BOAMP, les profils d'acheteurs des collectivités et les plateformes de dématérialisation. Pour le privé : les consultations passent par les réseaux, les annuaires professionnels et la prospection — d'où l'intérêt d'être visible et référencé auprès des donneurs d'ordre.",
      },
      {
        q: "Combien de temps faut-il pour répondre à un appel d'offres ?",
        a: "Comptez plusieurs jours de travail effectif pour une première réponse complète (analyse, visites, chiffrage, mémoire). Avec un dossier permanent à jour et une bibliothèque de mémoires, une réponse soignée descend ensuite à une fraction de ce temps.",
      },
    ],
  },

  // ── Modèles ───────────────────────────────────────────────────────────────
  "devis-nettoyage": {
    intro:
      "Un bon devis de nettoyage détaille le périmètre exact (zones et surfaces), les prestations et leurs fréquences, les fournitures incluses, le prix décomposé et les conditions (durée, révision, résiliation). C'est à la fois un document commercial — il doit inspirer confiance et professionnalisme — et la base contractuelle qui vous protégera en cas de litige. Ce modèle vous donne la structure complète et les mentions à ne pas oublier.",
    sections: [
      {
        heading: "Que doit contenir un devis de nettoyage professionnel ?",
        bullets: [
          "Identification complète des deux parties : raison sociale, SIREN/SIRET, adresse, contact.",
          "Description du site : adresse d'intervention, surfaces par zone, contraintes d'accès et horaires.",
          "Prestations détaillées ligne par ligne : tâche, zone, fréquence (quotidien, hebdomadaire, mensuel).",
          "Prestations périodiques distinctes : vitrerie, remise en état des sols, désinfections ponctuelles.",
          "Fournitures et consommables : inclus ou refacturés (préciser lesquels).",
          "Prix : montant HT, TVA applicable, montant TTC ; forfait mensuel ou prix unitaire selon le cas.",
          "Conditions : durée de validité du devis, date de démarrage possible, modalités de paiement, clause de révision annuelle.",
        ],
      },
      {
        heading: "Les erreurs qui décrédibilisent un devis",
        bullets: [
          "Une ligne unique « nettoyage des locaux » sans détail : impossible à comparer, inquiétante pour le client.",
          "L'absence de fréquences : source numéro un des litiges (« je pensais que les vitres étaient incluses »).",
          "Un devis envoyé sans visite du site : le chiffrage sera faux et le client le sent.",
          "Des fautes et une mise en page négligée : dans un métier de rigueur, la forme EST un argument.",
        ],
      },
      {
        heading: "Comment présenter le prix pour vendre mieux",
        paragraphs: [
          "En entretien récurrent, le forfait mensuel est la norme : il lisse le budget du client et sécurise votre revenu. Présentez les prestations périodiques (vitrerie, sols mécanisés) en options chiffrées séparément : le client compare un forfait de base maîtrisé et peut élargir ensuite. Indiquez toujours ce qui justifie votre prix — fréquences, contrôles qualité, remplacements assurés — plutôt que de laisser le seul chiffre parler.",
        ],
      },
      {
        heading: "Du devis au contrat",
        bullets: [
          "Faites signer le devis avec la mention « bon pour accord » : un devis accepté vaut engagement.",
          "Pour l'entretien récurrent, doublez-le d'un contrat de prestation précisant résiliation, préavis et révision.",
          "Archivez chaque version : en cas de désaccord sur le périmètre, le devis signé fait foi.",
        ],
      },
    ],
    faq: [
      {
        q: "Un devis de nettoyage est-il obligatoire ?",
        a: "En B2B, le devis n'est pas toujours juridiquement obligatoire, mais il est indispensable en pratique : il formalise le périmètre, protège les deux parties et conditionne la relation. Aucune prestation récurrente ne devrait démarrer sans devis signé.",
      },
      {
        q: "Quelle TVA appliquer sur un devis de nettoyage ?",
        a: "Les prestations de nettoyage de locaux professionnels relèvent du taux normal de TVA. Les micro-entrepreneurs en franchise de TVA facturent sans TVA avec la mention « TVA non applicable, art. 293 B du CGI » — à faire figurer sur le devis.",
      },
      {
        q: "Combien de temps un devis de nettoyage est-il valable ?",
        a: "C'est vous qui fixez la durée de validité — 30 jours est l'usage courant. Mentionnez-la explicitement : elle vous protège contre une acceptation tardive à des conditions devenues obsolètes (hausse des salaires conventionnels, par exemple).",
      },
    ],
  },

  "contrat-sous-traitance-nettoyage": {
    intro:
      "Un contrat de sous-traitance de nettoyage doit définir précisément la mission confiée (sites, prestations, fréquences), le prix et les conditions de paiement, les obligations réciproques (assurances, conformité sociale, qualité), ainsi que les clauses de responsabilité et de fin de contrat. Il protège autant le donneur d'ordre — tenu à un devoir de vigilance légal — que le sous-traitant, qui sécurise son paiement et son périmètre.",
    sections: [
      {
        heading: "Pourquoi un contrat écrit est indispensable en sous-traitance",
        paragraphs: [
          "La sous-traitance est courante dans la propreté : surcroît d'activité, éloignement géographique, prestations spécialisées. Mais sans écrit, le donneur d'ordre s'expose à des risques juridiques sérieux (solidarité financière en cas de travail dissimulé, requalification) et le sous-traitant à des impayés et des périmètres mouvants. Le contrat est la pièce centrale d'une relation saine.",
        ],
      },
      {
        heading: "Les clauses essentielles du contrat",
        bullets: [
          "Objet et périmètre : sites concernés, prestations, fréquences, niveau de qualité attendu (annexer le cahier des charges).",
          "Durée : date de début, durée déterminée ou indéterminée, conditions de renouvellement.",
          "Prix et paiement : montant, modalités de facturation, délais de paiement, pénalités de retard.",
          "Obligations du sous-traitant : assurance RC pro, respect du droit du travail, personnel déclaré, qualité et traçabilité.",
          "Obligations du donneur d'ordre : accès aux sites, informations nécessaires, paiement dans les délais.",
          "Sous-traitance en cascade : interdite ou soumise à accord écrit préalable.",
          "Confidentialité et non-sollicitation du personnel et des clients.",
          "Résiliation : préavis, manquements justifiant la rupture anticipée, sort des prestations en cours.",
        ],
      },
      {
        heading: "Le devoir de vigilance : les documents à exiger",
        paragraphs: [
          "Dès lors que le contrat atteint le seuil légal, le donneur d'ordre doit vérifier la régularité sociale de son sous-traitant, à la signature puis périodiquement tant que dure le contrat. À défaut, il peut être tenu solidairement responsable des dettes sociales et fiscales du sous-traitant.",
        ],
        bullets: [
          "Attestation de vigilance URSSAF de moins de six mois (à renouveler tous les six mois).",
          "Extrait d'immatriculation (Kbis) ou équivalent.",
          "Attestation d'assurance responsabilité civile professionnelle en cours de validité.",
          "Le cas échéant, liste nominative des salariés étrangers soumis à autorisation de travail.",
        ],
      },
      {
        heading: "Les pièges à éviter",
        bullets: [
          "Le prêt de main-d'œuvre déguisé : le sous-traitant doit rester autonome dans l'exécution (encadrement, consignes, matériel) — sinon, risque de requalification.",
          "Un prix imposé sous le coût de revient : un sous-traitant étranglé finit par dégrader la qualité… sous votre nom.",
          "L'absence de clause qualité : prévoyez contrôles, procédure de réclamation et plan d'action contradictoire.",
          "Oublier la fin de contrat : restitution des accès, transfert d'informations, dernière facturation.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle différence entre sous-traitance et intérim dans le nettoyage ?",
        a: "Le sous-traitant exécute une prestation définie avec son propre personnel, son encadrement et ses méthodes, sous sa responsabilité. L'intérim met du personnel à disposition sous l'autorité de l'entreprise utilisatrice. Confondre les deux expose au délit de prêt de main-d'œuvre illicite.",
      },
      {
        q: "Le donneur d'ordre est-il responsable des salariés du sous-traitant ?",
        a: "Pas directement de leur gestion, mais il a un devoir de vigilance : vérifier la régularité sociale du sous-traitant (attestation URSSAF notamment). En cas de manquement, il peut être solidairement tenu des cotisations, impôts et salaires dus par un sous-traitant en infraction.",
      },
      {
        q: "Un sous-traitant peut-il lui-même sous-traiter la mission ?",
        a: "Uniquement si le contrat l'y autorise. La plupart des contrats l'interdisent ou l'encadrent strictement (accord écrit préalable), car la sous-traitance en cascade dilue la responsabilité et la qualité.",
      },
      {
        q: "Comment fixer le prix d'une mission de sous-traitance ?",
        a: "Sur la même base qu'une prestation directe : temps d'intervention × coût horaire complet du sous-traitant + marge. Le donneur d'ordre conserve sa marge de coordination ; un écart trop important entre prix client et prix sous-traité est le signe d'un montage fragile.",
      },
    ],
  },

  "cahier-des-charges-nettoyage": {
    intro:
      "Un cahier des charges de nettoyage décrit, zone par zone, les prestations attendues, leurs fréquences, le niveau de résultat exigé et les modalités de contrôle. C'est le document de référence qui permet de comparer objectivement les offres des prestataires, puis de piloter la qualité pendant toute la durée du contrat. Ce modèle structure les rubriques indispensables, que vous soyez donneur d'ordre ou prestataire aidant son client à formaliser le besoin.",
    sections: [
      {
        heading: "À quoi sert un cahier des charges de nettoyage ?",
        bullets: [
          "Avant le contrat : exprimer le besoin de façon comparable pour mettre les prestataires en concurrence loyale.",
          "Pendant le contrat : servir de référentiel objectif aux contrôles qualité et au traitement des réclamations.",
          "En cas de litige : trancher sur la base d'un périmètre écrit plutôt que de souvenirs divergents.",
        ],
      },
      {
        heading: "La structure type d'un cahier des charges efficace",
        bullets: [
          "Présentation du site : adresse, surfaces, plans, effectifs présents, horaires d'occupation, contraintes d'accès.",
          "Inventaire des zones : bureaux, circulations, sanitaires, espaces de restauration, zones techniques, extérieurs.",
          "Prestations par zone et par fréquence : tableau zone × tâche × fréquence (quotidien, hebdo, mensuel, périodique).",
          "Obligations de moyens ou de résultat : produits exigés (éco-labellisés…), matériel, qualification du personnel.",
          "Organisation : horaires d'intervention, gestion des clés et alarmes, interlocuteurs, continuité de service.",
          "Contrôle qualité : grille d'évaluation, fréquence des contrôles, procédure de réclamation et délais de correction.",
          "Cadre administratif : durée, révision des prix, assurances, pénalités éventuelles, conditions de résiliation.",
        ],
      },
      {
        heading: "Obligation de moyens ou obligation de résultat ?",
        paragraphs: [
          "Un cahier des charges « de moyens » prescrit les tâches et fréquences ; un cahier des charges « de résultat » définit l'état de propreté attendu et laisse le prestataire organiser ses moyens. Le résultat responsabilise le prestataire et évite les débats de fréquences, mais exige une grille de contrôle solide et partagée. En pratique, les bons cahiers des charges combinent les deux : un socle de fréquences et des exigences de résultat mesurables.",
        ],
      },
      {
        heading: "Les erreurs classiques à éviter",
        bullets: [
          "Copier un cahier des charges générique sans visite du site : les offres reçues seront incomparables entre elles.",
          "Multiplier les exigences sans hiérarchie : tout exiger, c'est renchérir l'offre sans gagner en qualité perçue.",
          "Oublier les prestations périodiques (vitrerie, sols) : elles ressurgissent en avenants coûteux.",
          "Ne prévoir aucune procédure de réclamation : la qualité se pilote, elle ne se constate pas.",
        ],
      },
    ],
    faq: [
      {
        q: "Qui doit rédiger le cahier des charges : le client ou le prestataire ?",
        a: "En principe le donneur d'ordre, car il exprime son besoin. En pratique, beaucoup de clients n'ont pas l'expertise : un prestataire qui aide à formaliser un cahier des charges clair crée de la valeur et part avec un avantage — à condition de rester objectif pour ne pas fausser la consultation.",
      },
      {
        q: "Quelle différence entre cahier des charges et contrat de nettoyage ?",
        a: "Le cahier des charges décrit le besoin technique (quoi, où, à quelle fréquence, avec quel niveau d'exigence). Le contrat organise la relation juridique (prix, durée, responsabilités, résiliation) et annexe généralement le cahier des charges, qui en devient une pièce contractuelle.",
      },
      {
        q: "À quelle fréquence faut-il mettre à jour un cahier des charges ?",
        a: "À chaque évolution significative du site ou du besoin (surfaces, effectifs, horaires, nouvelles zones) et idéalement à chaque échéance de renouvellement du contrat. Un cahier des charges obsolète produit des contrôles qualité injustes et des litiges.",
      },
    ],
  },

  // ── Outils ────────────────────────────────────────────────────────────────
  "calculateur-prix-nettoyage": {
    intro:
      "Le prix d'une prestation de nettoyage se calcule en trois temps : estimer le temps d'intervention (surface de chaque zone divisée par la cadence horaire), le multiplier par le coût horaire complet de votre entreprise (salaire chargé, produits, déplacements, frais de structure), puis appliquer votre marge. Cette page détaille la méthode complète — le calculateur interactif qui l'automatise arrive prochainement.",
    sections: [
      {
        heading: "La formule de calcul d'un prix de nettoyage",
        paragraphs: [
          "Prix de vente = (temps d'intervention × coût horaire complet + coûts spécifiques du site) × (1 + marge). Tout l'enjeu est d'estimer correctement chacun des termes : un seul maillon faux (cadence optimiste, coût horaire incomplet) et le contrat devient déficitaire sans que rien ne le signale avant des mois.",
        ],
      },
      {
        heading: "Étape 1 — Estimer le temps d'intervention",
        bullets: [
          "Découpez le site en zones homogènes : bureaux, circulations, sanitaires, restauration, zones techniques.",
          "Appliquez une cadence par zone (m²/heure) selon l'encombrement et le niveau d'exigence — les sanitaires se traitent plusieurs fois plus lentement qu'un plateau dégagé.",
          "Ajoutez les tâches périodiques en lignes séparées : vitrerie, sols mécanisés, désinfections.",
          "Majorez pour les contraintes : étages, sites multiples, horaires imposés, gestion des accès.",
        ],
      },
      {
        heading: "Étape 2 — Connaître son coût horaire complet",
        bullets: [
          "Salaire conventionnel + cotisations patronales = salaire chargé (le plancher, jamais le coût réel).",
          "Ajoutez les temps non productifs : déplacements, préparation, congés et absences à remplacer.",
          "Ajoutez produits, consommables et amortissement du matériel rapportés à l'heure.",
          "Répartissez les frais de structure : véhicule, assurances, gestion, encadrement.",
        ],
      },
      {
        heading: "Étape 3 — Appliquer une marge soutenable",
        paragraphs: [
          "La marge n'est pas un luxe : elle finance les imprévus (remplacements en urgence, matériel cassé), le développement commercial et la trésorerie nécessaire aux délais de paiement B2B. Une marge trop faible se paie en qualité dégradée ou en épuisement — les deux finissent par coûter le contrat.",
        ],
      },
    ],
    faq: [
      {
        q: "Comment calculer le prix d'un nettoyage de bureaux au m² ?",
        a: "Divisez la surface de chaque zone par sa cadence pour obtenir les heures nécessaires, multipliez par votre coût horaire complet, ajoutez la marge, puis ramenez le total au m² si le client veut comparer en m². Le m² est une unité de présentation, pas une méthode de calcul.",
      },
      {
        q: "Quelle cadence de nettoyage utiliser pour un devis ?",
        a: "Les cadences varient fortement selon le type de zone et le niveau d'exigence. Construisez vos références internes en chronométrant vos interventions réelles : ce sont les seules cadences fiables pour VOTRE organisation, vos équipes et votre matériel.",
      },
      {
        q: "Quand le calculateur interactif sera-t-il disponible ?",
        a: "Il est en cours de développement avec des professionnels du secteur pour refléter les cadences et coûts réels du terrain. Créez votre compte Club Propreté pour être averti de sa mise en ligne.",
      },
    ],
  },

  // ── Comparatifs ───────────────────────────────────────────────────────────
  autolaveuses: {
    intro:
      "Le choix d'une autolaveuse dépend d'abord de la surface à traiter et de la configuration des locaux : autolaveuse compacte à câble ou batterie pour les petites et moyennes surfaces encombrées, autotractée pour les surfaces intermédiaires, autoportée pour les grandes surfaces dégagées (logistique, commerce, industrie). Viennent ensuite l'autonomie, la largeur de travail, la maniabilité, le coût d'entretien et le réseau SAV — souvent plus déterminants à l'usage que le prix d'achat.",
    sections: [
      {
        heading: "Les critères qui comptent vraiment",
        bullets: [
          "Largeur de travail et débit théorique : à dimensionner sur la surface réelle à traiter par passage, pas sur la surface totale du site.",
          "Autonomie batterie : elle doit couvrir une session complète de travail, rechargement compris dans l'organisation.",
          "Maniabilité et encombrement : passages de portes, ascenseurs, zones encombrées — testez sur site avant d'acheter.",
          "Capacité des réservoirs : conditionne les arrêts de remplissage/vidange sur les grandes surfaces.",
          "Coût total de possession : consommables (brosses, raclettes), batteries, maintenance — sur la durée, il dépasse souvent l'écart de prix d'achat.",
          "Réseau SAV et délais de pièces : une machine immobilisée, c'est une prestation à réorganiser en urgence.",
        ],
      },
      {
        heading: "Quel type d'autolaveuse pour quel usage ?",
        table: {
          caption: "Types d'autolaveuses et usages recommandés",
          headers: ["Type", "Surfaces indicatives", "Usages typiques", "Points de vigilance"],
          rows: [
            [
              "Compacte (accompagnée)",
              "Jusqu'à ~1 000 m² par session",
              "Bureaux, commerces, sanitaires, zones encombrées",
              "Autonomie limitée ; vérifier la largeur des passages",
            ],
            [
              "Autotractée (accompagnée)",
              "~1 000 à 3 000 m² par session",
              "Moyennes surfaces, halls, établissements de santé",
              "Encombrement au stockage ; formation des agents",
            ],
            [
              "Autoportée",
              "Au-delà de ~3 000 m² par session",
              "Logistique, industrie, grandes surfaces commerciales",
              "Investissement élevé ; circulation à sécuriser",
            ],
          ],
        },
      },
      {
        heading: "Acheter, louer ou financer ?",
        bullets: [
          "Achat : pertinent si la machine tourne régulièrement sur des contrats stables ; négociez contrat d'entretien et pièces.",
          "Location / leasing : préserve la trésorerie, inclut souvent la maintenance — adapté aux contrats à durée limitée.",
          "Location courte durée : pour les remises en état ponctuelles, plutôt que d'immobiliser du capital.",
          "Aides et subventions : des dispositifs de prévention (notamment via les caisses régionales) peuvent financer une partie de l'équipement ; l'association Club Propreté accompagne ses membres sur ces dossiers.",
        ],
      },
      {
        heading: "Les erreurs d'achat les plus fréquentes",
        bullets: [
          "Surdimensionner « pour plus tard » : une machine trop large pour les locaux reste au placard.",
          "Négliger l'essai sur site avec les agents qui l'utiliseront : l'adoption fait la rentabilité.",
          "Oublier le stockage et la recharge : il faut un local adapté avec point d'eau et prise.",
          "Comparer uniquement les prix d'achat : intégrez consommables, batteries et maintenance sur la durée de vie.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle autolaveuse choisir pour des bureaux ?",
        a: "Pour des plateaux de bureaux et circulations, une autolaveuse compacte accompagnée suffit généralement : maniable, passe les portes standard et se stocke facilement. L'autoportée ne se justifie que sur de très grandes surfaces dégagées.",
      },
      {
        q: "Vaut-il mieux louer ou acheter une autolaveuse ?",
        a: "Achetez si la machine sera utilisée régulièrement sur des contrats durables ; louez si le besoin est ponctuel, si le contrat est à durée limitée ou si vous voulez préserver la trésorerie. Le leasing avec maintenance incluse est un bon compromis pour lisser les coûts.",
      },
      {
        q: "Existe-t-il des aides pour acheter une autolaveuse ?",
        a: "Oui, des dispositifs d'aide à la prévention des risques professionnels peuvent subventionner une partie de l'équipement de mécanisation, sous conditions. Les membres de l'association Club Propreté bénéficient d'un accompagnement pour monter ces dossiers.",
      },
      {
        q: "Quelle est la durée de vie d'une autolaveuse professionnelle ?",
        a: "Avec un entretien régulier (brosses, raclettes, batteries suivies), une autolaveuse professionnelle s'utilise couramment de nombreuses années. La disponibilité des pièces détachées et la qualité du SAV pèsent davantage sur la longévité réelle que la marque elle-même.",
      },
    ],
  },

  // ── Réglementation ────────────────────────────────────────────────────────
  "plan-prevention-nettoyage": {
    intro:
      "Le plan de prévention est obligatoire lorsqu'une entreprise extérieure — comme une entreprise de nettoyage — intervient dans un établissement en activité et que l'opération représente au moins 400 heures de travail sur 12 mois, ou qu'elle comporte des travaux dangereux figurant sur la liste fixée par arrêté, quelle que soit sa durée. Établi par écrit avant le début des travaux, il identifie les risques d'interférence entre les activités et définit les mesures de prévention correspondantes.",
    sections: [
      {
        heading: "Quand le plan de prévention écrit est-il obligatoire ?",
        bullets: [
          "Dès que l'opération atteint 400 heures de travail sur une période inférieure ou égale à 12 mois — seuil vite atteint pour un entretien quotidien régulier.",
          "Quelle que soit la durée, si l'intervention comporte des travaux dangereux listés par arrêté (travaux exposant à certains produits chimiques, travaux en hauteur particuliers, etc.).",
          "En dessous de ces seuils, l'inspection commune préalable et l'analyse des risques d'interférence restent obligatoires ; seule la formalisation écrite ne l'est pas — la rédiger reste néanmoins une bonne pratique.",
        ],
      },
      {
        heading: "Qui établit le plan de prévention ?",
        paragraphs: [
          "Le plan de prévention est établi conjointement par l'entreprise utilisatrice (le client dans les locaux duquel on intervient) et la ou les entreprises extérieures, après une inspection commune des lieux. Côté prestataire de nettoyage, l'encadrement doit y participer activement : c'est lui qui connaît les modes opératoires, les produits utilisés et les contraintes réelles des agents.",
        ],
      },
      {
        heading: "Que doit contenir un plan de prévention ?",
        bullets: [
          "La définition des phases d'activité dangereuses et des risques d'interférence (coactivité, circulations, énergies, produits).",
          "Les mesures de prévention décidées : consignes, balisage, horaires décalés, équipements de protection.",
          "L'adaptation des matériels et installations à la nature des opérations.",
          "Les instructions à donner aux salariés, dont l'organisation des premiers secours.",
          "La liste des postes relevant éventuellement du suivi médical renforcé.",
          "Les modalités de coordination dans la durée : réunions, mises à jour, accueil des nouveaux intervenants.",
        ],
      },
      {
        heading: "Le plan de prévention en pratique pour une entreprise de nettoyage",
        bullets: [
          "Anticipez-le dès la remise du devis sur les sites industriels et tertiaires importants : c'est un signe de professionnalisme.",
          "Faites remonter les risques réellement rencontrés par les agents (sols glissants, coactivité nocturne, produits du client).",
          "Formez les agents aux consignes du plan : un document signé mais inconnu du terrain ne protège personne.",
          "Mettez-le à jour à chaque évolution : nouveaux locaux, nouveaux produits, nouveaux horaires.",
        ],
      },
    ],
    faq: [
      {
        q: "Le plan de prévention est-il obligatoire pour un simple nettoyage de bureaux ?",
        a: "Oui dès que le volume atteint 400 heures sur 12 mois — ce qui est le cas de la plupart des contrats d'entretien quotidien — ou en présence de travaux dangereux listés. En dessous, l'analyse commune des risques d'interférence reste due, même sans écrit obligatoire.",
      },
      {
        q: "Qui doit signer le plan de prévention ?",
        a: "Les représentants de l'entreprise utilisatrice et de chaque entreprise extérieure concernée. Chaque partie en conserve un exemplaire, tenu à la disposition de l'inspection du travail et des services de prévention.",
      },
      {
        q: "Quelle différence entre plan de prévention et DUERP ?",
        a: "Le DUERP évalue les risques propres à votre entreprise pour vos salariés, en permanence. Le plan de prévention traite spécifiquement des risques d'interférence lors d'une intervention chez un client donné. Les deux se complètent et se nourrissent mutuellement.",
      },
      {
        q: "Que risque-t-on sans plan de prévention ?",
        a: "Des sanctions en cas de contrôle, et surtout une responsabilité lourdement engagée en cas d'accident : l'absence de plan de prévention obligatoire est un manquement caractérisé aux obligations de sécurité, pour le client comme pour le prestataire.",
      },
    ],
  },

  // ── Média ─────────────────────────────────────────────────────────────────
  "analyses-marche-proprete": {
    intro:
      "Le marché de la propreté en France est un poids lourd discret de l'économie : plusieurs dizaines de milliers d'entreprises, plus d'un demi-million de salariés et un chiffre d'affaires qui se compte en dizaines de milliards d'euros, porté à plus de 95 % par le B2B. C'est aussi un marché en transformation : nettoyage en journée, exigences RSE des donneurs d'ordre, mécanisation, digitalisation du pilotage et tension durable sur le recrutement. Cette rubrique rassemble nos analyses pour comprendre où va le secteur.",
    sections: [
      {
        heading: "Les caractéristiques structurelles du marché",
        bullets: [
          "Un marché très atomisé : une poignée de grands groupes côtoie des dizaines de milliers de TPE et d'indépendants.",
          "Une demande portée par l'externalisation : la quasi-totalité des entreprises et collectivités confient leur propreté à des prestataires.",
          "Des contrats récurrents à marges serrées : la rentabilité se joue sur l'organisation, les cadences et la fidélisation.",
          "Une intensité de main-d'œuvre élevée : la masse salariale représente l'essentiel des coûts, d'où la sensibilité aux revalorisations conventionnelles.",
        ],
      },
      {
        heading: "Les tendances qui transforment le secteur",
        bullets: [
          "Le travail en journée et en continu : poussé par les donneurs d'ordre et les pouvoirs publics, il améliore les conditions de travail et change l'organisation des prestations.",
          "Les exigences RSE et environnementales : produits éco-labellisés, réduction des consommations, clauses sociales dans les marchés.",
          "La mécanisation et la robotisation : autolaveuses autonomes et matériel connecté sur les grandes surfaces.",
          "La digitalisation du pilotage : traçabilité des passages, contrôles qualité sur mobile, portails clients.",
          "La montée de la sous-traitance structurée et des réseaux de partenaires locaux.",
        ],
      },
      {
        heading: "Les défis : recrutement, valorisation, transmission",
        paragraphs: [
          "Le premier défi du secteur reste humain : attirer, former et fidéliser les agents dans un marché du travail tendu, tout en valorisant des métiers essentiels mais longtemps invisibles. S'y ajoutent la transmission de milliers d'entreprises dont les dirigeants approchent de la retraite, et la nécessité de structurer un secteur qui fonctionne encore largement au bouche-à-oreille — c'est précisément la raison d'être de Club Propreté.",
        ],
      },
      {
        heading: "Ce que vous trouverez dans cette rubrique",
        bullets: [
          "Des décryptages des chiffres clés et de leurs sources officielles (branche professionnelle, INSEE).",
          "Des analyses de segments : tertiaire, santé, industrie, copropriété, fin de chantier.",
          "Des points réguliers sur les évolutions conventionnelles et réglementaires qui impactent les coûts.",
          "Des retours de terrain de dirigeants et d'indépendants du réseau Club Propreté.",
        ],
      },
    ],
    faq: [
      {
        q: "Le marché du nettoyage est-il porteur pour créer une entreprise ?",
        a: "Oui : la demande est récurrente, l'externalisation quasi générale et les barrières à l'entrée faibles. La contrepartie est une concurrence dense et des marges serrées — la réussite se joue sur le chiffrage, l'organisation et la fidélisation des clients comme des équipes.",
      },
      {
        q: "Quels segments du nettoyage sont les plus dynamiques ?",
        a: "Les segments exigeants en technicité ou en confiance (santé, agroalimentaire, remises en état, vitrerie spécialisée) offrent généralement de meilleures marges que l'entretien tertiaire standard, très concurrentiel. Le nettoyage écologique et les prestations en journée sont des relais de croissance transverses.",
      },
      {
        q: "Où trouver des chiffres fiables sur le secteur de la propreté ?",
        a: "Auprès de la branche professionnelle (Fédération des entreprises de propreté et son observatoire), de l'INSEE pour les données d'entreprises, et des publications spécialisées. Nos analyses citent systématiquement leurs sources pour vous permettre de vérifier et d'approfondir.",
      },
    ],
  },
};
