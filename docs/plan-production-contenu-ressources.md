# Plan de production de contenu — Section Ressources

**Date :** 11 juin 2026 · **Périmètre :** méga menu Ressources (7 rubriques, 82 pages) + articles média

## 1. État des lieux

| Statut | Pages | Détail |
|---|---|---|
| ✅ Publiées (contenu complet + FAQ + JSON-LD) | 11 | Voir tableau P0 ci-dessous |
| 🟡 Placeholder enrichi (description, tags, CTA, ressources liées) | 71 | Toutes les autres pages détail |
| Infrastructure | — | Hub, 7 pages catégories, méga menu, sitemap, données structurées |

Toutes les pages existent déjà (aucun lien mort) : la production consiste à **remplacer les placeholders par du contenu complet** dans `lib/resources-content.ts`, sans toucher aux routes.

## 2. Pages publiées (vague P0 — faite)

| Page | Requête cible principale |
|---|---|
| `/ressources/guides/creer-entreprise-nettoyage` | créer une entreprise de nettoyage |
| `/ressources/guides/trouver-clients-nettoyage-b2b` | trouver des clients nettoyage |
| `/ressources/guides/fixer-prix-nettoyage` | prix nettoyage / tarif nettoyage m² |
| `/ressources/guides/repondre-appel-offres-nettoyage` | appel d'offres nettoyage |
| `/ressources/modeles/devis-nettoyage` | modèle devis nettoyage |
| `/ressources/modeles/contrat-sous-traitance-nettoyage` | contrat sous-traitance nettoyage |
| `/ressources/modeles/cahier-des-charges-nettoyage` | cahier des charges nettoyage |
| `/ressources/outils/calculateur-prix-nettoyage` | calculateur prix nettoyage |
| `/ressources/comparatifs/autolaveuses` | comparatif autolaveuse / quelle autolaveuse choisir |
| `/ressources/reglementation/plan-prevention-nettoyage` | plan de prévention nettoyage |
| `/ressources/media/analyses-marche-proprete` | marché de la propreté chiffres |

## 3. Calendrier de production recommandé

Cadence soutenable : **2 à 3 pages/semaine** (rédaction + relecture métier). Prioriser par
intention commerciale puis par volume.

### Vague P1 (semaines 1–4) — intention commerciale forte
1. `modeles/contrat-prestation-nettoyage` — complète le trio devis/contrat/cahier des charges
2. `guides/sous-traitance-nettoyage` — maillage fort avec l'espace association
3. `appels-offres/rediger-memoire-technique-nettoyage` + `modeles/memoire-technique-nettoyage` (paire)
4. `comparatifs/louer-ou-acheter-autolaveuse` — intention d'achat, CTA annuaire fournisseurs
5. `comparatifs/logiciels-entreprises-nettoyage` — fort volume, connecte les fournisseurs logiciels
6. `outils/calculateur-marge-chantier` + `outils/calculateur-cout-horaire-agent` (méthodes, en attendant les outils interactifs)
7. `reglementation/sous-traitance-obligations-legales` + `reglementation/documents-demander-sous-traitant` (paire vigilance)
8. `guides/recruter-agents-entretien` + `modeles/fiche-poste-agent-entretien` (paire RH)

### Vague P2 (semaines 5–10) — couverture des spécialités
- Guides spécialités : `nettoyage-bureaux`, `nettoyage-copropriete`, `nettoyage-fin-de-chantier`, `nettoyage-industriel`, `nettoyage-ecologique`, `developper-entreprise-nettoyage`
- Appels d'offres : `comprendre-appels-offres-nettoyage`, `preparer-dossier-appel-offres`, `analyser-cahier-des-charges-nettoyage`, `erreurs-appels-offres-nettoyage`, `marches-publics-nettoyage`, `marches-prives-nettoyage`
- Réglementation : `securite-travail-proprete`, `epi-obligatoires-nettoyage`, `produits-chimiques-fds`, `duerp-entreprise-nettoyage`
- Modèles restants : `planning-agents-nettoyage`, `rapport-intervention-nettoyage`, `fiche-controle-qualite`, `relance-client-nettoyage`, `email-prospection-nettoyage`, `grille-tarifaire-nettoyage`

### Vague P3 (continu) — média & longue traîne
- Rubriques média : 1 à 2 articles/semaine via l'espace auteur (les pages rubriques `/ressources/media/*` servent de hubs)
- Comparatifs restants, réglementation longue traîne, pages restantes appels d'offres
- Développement des **vrais outils interactifs** (calculateur de prix en premier : la page méthode publiée capte déjà la requête, l'outil convertira)

## 4. Template éditorial par type de page

Le contenu se rédige dans `lib/resources-content.ts` (`intro`, `sections[]`, `faq[]`).
La page rend automatiquement le JSON-LD (Article + BreadcrumbList + FAQPage).

| Type | Structure attendue | Spécificité |
|---|---|---|
| Guide | Intro-réponse → 4-6 H2 (dont 1-2 en question) → erreurs fréquentes → FAQ (4) | 800-1 200 mots |
| Modèle | Que contient le doc → erreurs → conseils d'usage → FAQ | CTA téléchargement (bloc dédié automatique) |
| Outil | Formule/méthode complète → étapes → FAQ | La méthode publiée capte le SEO avant l'outil interactif |
| Comparatif | Critères → tableau (`table`) → financement → erreurs → FAQ | Tableau par segments/usages, pas de claims marques ; CTA annuaire fournisseurs automatique |
| Réglementation | Quand obligatoire → qui → contenu → pratique → FAQ | Mention informative automatique ; citer les textes (Code du travail) sans inventer de chiffres |
| Média | Analyse structurée + sources citées | Alimenté aussi par les articles DB (espace auteur) |

## 5. Checklist SEO (chaque page avant publication)

- [ ] H1 unique = requête principale reformulée naturellement
- [ ] `seoTitle` ≤ 60 caractères avec la requête en tête ; `seoDescription` 140-155 caractères avec bénéfice
- [ ] H2 structurés, dont 1-2 formulés en question (People Also Ask)
- [ ] 3+ liens internes contextuels (`relatedResources` + liens en dur vers annuaire/inscription/association)
- [ ] FAQ 3-5 questions = requêtes associées réelles
- [ ] Aucun chiffre inventé : ordres de grandeur prudents ou sources citées (branche, INSEE, Code du travail)
- [ ] CTA contextualisé (inscription, annuaire fournisseurs pour les comparatifs)

## 6. Checklist GEO (Generative Engine Optimization)

Objectif : être la source citée par les réponses IA (AI Overviews, assistants).

- [ ] **Réponse directe dans l'intro** : les 2 premières phrases répondent à la question de la page (citables telles quelles)
- [ ] **Affirmations autonomes** : chaque bullet est compréhensible hors contexte (sujet explicite, pas de « il » flottant)
- [ ] **Listes et tableaux** : formats préférés des moteurs génératifs pour l'extraction
- [ ] **FAQPage en JSON-LD** : déjà automatique dès qu'une FAQ existe
- [ ] **Entités nommées cohérentes** : « Club Propreté », « convention collective de la propreté », « annexe 7 » écrits en toutes lettres
- [ ] **Fraîcheur** : `updatedAt` mis à jour à chaque révision (affiché + dans le JSON-LD)
- [ ] **E-E-A-T** : signaux d'expérience terrain (« en pratique », retours de pros), auteur = organisation identifiable

## 7. Maillage interne (règles)

- Chaque page publiée pointe vers 2-3 `relatedResources` **réciproques** (A↔B)
- Les paires modèle ↔ guide ↔ outil du même sujet se citent mutuellement (ex. devis → calculateur de prix → guide prix)
- Comparatifs → annuaire fournisseurs (automatique) ; guides sous-traitance → association ; guides RH → emploi
- Le hub et les pages catégories remontent automatiquement `isPopular` : passer une page en populaire après publication si la requête est stratégique

## 8. Mesure

- Search Console : impressions/clics par répertoire (`/ressources/guides/`, `/modeles/`…) — revue mensuelle
- Suivi des positions sur les 11 requêtes P0, puis P1 au fil des publications
- Conversion : clics sur les CTA « Créer un compte » et « Être informé » depuis les pages ressources
- Citations IA : vérifier périodiquement la reprise des pages dans les réponses génératives sur les requêtes cibles
