# Audit SEO & GEO — Contenu de la section Ressources

**Date :** 12 juin 2026 · **Périmètre :** les 82 pages Ressources (`lib/resources.ts` + `lib/resources-content/`)
Complète l'audit site du 11 juin (`docs/audit-seo-geo-2026-06-11.md`) : ici on audite **le contenu lui-même** — complétude, profondeur, signaux GEO, maillage, métadonnées.

## Synthèse chiffrée

| Indicateur | Mesuré | Cible (checklists internes) |
|---|---|---|
| Pages avec contenu rédactionnel | **43 / 82** | 82 |
| Pages vides mais indexables + dans le sitemap | **39** | 0 |
| Longueur des pages publiées | 335 à 822 mots (médiane ~500) | 800–1 200 mots (guides) |
| Pages publiées avec ≥ 1 H2 en question | **13 / 43** | 1–2 par page |
| Pages avec tableau (format GEO) | 7 / 43 | tous les comparatifs a minima |
| Bloc « À retenir » (`keyPoints`) | **6 / 82** | généralisé |
| Liens `relatedResources` non réciproques | **72** | 0 (règle interne A↔B) |
| `relatedResources` par page | 2 (presque partout) | 3+ |
| `seoTitle` > 60 caractères | 15 | 0 |
| `seoDescription` < 120 caractères | **54 / 82** | 140–155 caractères |
| Valeurs distinctes de `updatedAt` | **1** (`2026-06-11` partout) | dates réelles par page |
| `contentStatus` utilisé dans le code | non (tout = `placeholder_enriched`) | piloter sitemap/index/badges |

---

## 🔴 P0 — Les 39 pages vides indexées (risque thin content)

**Constat.** 39 pages sur 82 n'ont **aucun contenu rédactionnel** (aucune entrée dans `lib/resources-content/`). Elles rendent uniquement la description courte + les tags + un bloc « bientôt disponible », mais :
- elles sont **dans le sitemap** (`app/sitemap.ts` pousse les 82 ressources sans filtre) ;
- elles sont **indexables** (aucun noindex) ;
- elles émettent un **JSON-LD `Article`** décrivant un article qui n'existe pas (`components/resources/resource-detail-page.tsx:117`) ;
- elles affichent « Mis à jour le 11/06/2026 » alors que rien n'a été rédigé.

**Risque.** À l'échelle de la moitié de la section, Google peut déclasser tout le répertoire `/ressources/` pour contenu faible, et les données structurées mensongères (Article sans article, date de mise à jour factice) abîment la confiance — pénalisant aussi les 43 bonnes pages.

**Actions (deux voies cumulables) :**
1. **Produire le contenu** — la vague P2 du plan existant (`docs/plan-production-contenu-ressources.md`) liste exactement ces 39 pages. C'est la vraie solution.
2. **En attendant la production**, dériver l'état de publication de la présence de contenu (`getResourceContent(id)`) et :
   - exclure du sitemap les ressources sans contenu ;
   - ajouter `robots: { index: false }` dans `resourceDetailMetadata` quand le contenu est absent ;
   - ne pas émettre le JSON-LD `Article` (garder seulement `BreadcrumbList`) ;
   - masquer la mention « Mis à jour le » sur les placeholders.

### Liste des 39 pages vides
- **Guides (6)** : nettoyage-bureaux, nettoyage-copropriete, nettoyage-fin-de-chantier, nettoyage-industriel, nettoyage-ecologique, sous-traitance-nettoyage
- **Modèles (6)** : planning-agents-nettoyage, fiche-controle-qualite, relance-client-nettoyage, email-prospection-nettoyage, grille-tarifaire-nettoyage, memoire-technique-nettoyage
- **Outils (6)** : calculateur-temps-intervention, simulateur-devis-fin-chantier, generateur-fiche-poste, generateur-email-prospection, score-maturite-digitale-nettoyage, calculateur-rentabilite-contrat
- **Comparatifs (6)** : machines-nettoyage-professionnel, fournisseurs-consommables-nettoyage, epi-nettoyage, materiel-nettoyage-bureaux, produits-sanitaires-professionnels, logiciels-planning-agents-nettoyage
- **Réglementation (6)** : documents-demander-sous-traitant, travail-nuit-proprete, normes-hygiene-nettoyage, prevention-risques-agent-entretien, affichages-obligatoires-entreprise, duerp-entreprise-nettoyage
- **Appels d'offres (6)** : marches-publics-nettoyage, marches-prives-nettoyage, dossier-candidature-nettoyage, criteres-selection-prestataire-nettoyage, prix-appel-offres-nettoyage, suivi-opportunites-marches
- **Média (3)** : sous-traitance-nettoyage-media, portraits-entreprises-nettoyage, conseils-business-nettoyage

---

## 🟠 P1 — Les 43 pages publiées sont en dessous du standard interne

### 1. Profondeur insuffisante (augmenter)
Le template éditorial interne vise 800–1 200 mots par guide. Mesuré : **aucune page n'atteint 850 mots** ; la médiane est ~500. Les plus faibles :

| Page | Mots | Cible |
|---|---|---|
| media/actualites-secteur-proprete | 335 | 600+ |
| media/emploi-recrutement-proprete | 335 | 600+ |
| media/interviews-entrepreneurs-proprete | 343 | 600+ |
| media/produits-ecologiques-nettoyage | 347 | 600+ |
| media/innovations-materiel-machines | 360 | 600+ |
| comparatifs/aspirateurs-professionnels | 410 | 800+ |
| modeles/rapport-intervention-nettoyage | 413 | 700+ |

Recommandation : densifier en priorité les **6 guides** (requêtes les plus concurrentielles, 643–822 mots actuellement) et les pages média (les plus minces). Ajouter par page : 1–2 sections supplémentaires (cas pratiques, erreurs fréquentes, étapes chiffrées), 1 tableau quand le sujet s'y prête.

### 2. H2 en question quasi absents (GEO)
Seulement **13 pages sur 43** ont au moins un H2 formulé en question, alors que la checklist GEO interne en demande 1–2 par page (People Also Ask + extraction par les moteurs génératifs). Reformuler au moins un H2 par page publiée (« Combien coûte… ? », « Quels documents… ? », « Quand est-ce obligatoire ? »).

### 3. Tableaux sous-utilisés et un comparatif sans tableau
7 pages seulement ont un tableau. **`comparatifs/produits-nettoyage-ecologiques` est publié sans aucun tableau comparatif** — contraire au template du type Comparatif. Les tableaux sont le format le plus repris par les AI Overviews : en ajouter sur les outils (exemples chiffrés), la réglementation (obligations/seuils) et tous les comparatifs.

### 4. Bloc « À retenir » (`keyPoints`) : 6 pages sur 82
Le composant l'affiche déjà automatiquement (`resource-detail-page.tsx:185`), c'est l'extrait citable idéal pour le GEO (3–5 affirmations autonomes). Remplir `keyPoints` sur les 43 pages publiées en priorité — effort purement éditorial, zéro code.

### 5. Maillage interne incomplet et non réciproque
- **72 liens `relatedResources` non réciproques** alors que la règle interne impose la réciprocité A↔B (la moitié des paires modèle↔guide↔outil ne se renvoient pas la balle) ;
- presque toutes les pages n'ont que **2** ressources liées (checklist : 3+).
Corriger les réciprocités existantes puis passer à 3 liens par page (le trio thématique guide + modèle + outil existe déjà sur la plupart des sujets).

### 6. Métadonnées hors gabarit
- **15 `seoTitle` > 60 caractères** : tous dépassent à cause du suffixe ` | Ressources Club Propreté` (27 caractères). Passer le suffixe à ` | Club Propreté` règle la quasi-totalité des cas.
- **54 `seoDescription` < 120 caractères** (cible interne 140–155) : c'est de l'espace SERP gratuit non utilisé. Allonger avec le bénéfice + le public (« …avec exemples chiffrés pour artisans et TPE du nettoyage. »).
- Bon point : aucune description dupliquée, aucune > 155.

### 7. Fraîcheur : un seul `updatedAt` pour 82 pages
Tout est daté `2026-06-11`, y compris les pages vides. Le signal de fraîcheur (affiché + `dateModified` du JSON-LD) n'est pas crédible pour Google ni pour les moteurs génératifs. Dater réellement chaque page à sa dernière révision éditoriale, et ne plus toucher la date sans modification de fond.

---

## 🟡 P2 — Compléments

| # | Sujet | Détail |
|---|---|---|
| 1 | `contentStatus` mort | Le champ existe (`published` / `placeholder_enriched` / `coming_soon`) mais tout est `placeholder_enriched` et **aucun code ne le lit**. Soit le supprimer et dériver l'état de `getResourceContent`, soit le tenir à jour et l'utiliser (sitemap, noindex, badge « à venir » sur les cartes). |
| 2 | JSON-LD `Article` incomplet | Pas de `datePublished` ni d'`image` ; ajouter les deux (l'image OG par défaut suffira une fois créée — cf. audit du 11). |
| 3 | Pages catégories | Descriptions correctes mais aucune FAQ ni `ItemList` JSON-LD : un schéma `ItemList` des ressources de la rubrique aiderait les moteurs à comprendre la structure du hub. |
| 4 | llms.txt | Toujours absent (relevé le 11 juin) — y lister en priorité les 43 pages publiées, pas les 82. |
| 5 | Rappels audit site du 11/06 | Canonical, Open Graph, favicon, Organization/WebSite JSON-LD restent les prérequis transverses. |

---

## ✅ Points forts confirmés

- Architecture centralisée saine : catalogue unique (`lib/resources.ts`), contenus par rubrique, aucun lien mort possible, vrais 404 (`dynamicParams = false`).
- Les 43 pages publiées respectent le principe intro-réponse directe (aucune intro < 40 mots) + FAQ systématique avec `FAQPage` JSON-LD.
- Aucune `seoDescription` dupliquée sur 82 pages.
- `BreadcrumbList` JSON-LD et fil d'Ariane visuels partout.

## Plan d'action recommandé

1. **Neutraliser les 39 pages vides** (noindex + hors sitemap + JSON-LD réduit) — 1 petite PR, protège immédiatement le répertoire.
2. **Quick wins éditoriaux sans code** : `keyPoints` sur les 43 pages, réciprocité des 72 liens, suffixe titre raccourci, 54 descriptions allongées, tableau du comparatif produits écologiques.
3. **Densification** des 43 pages publiées (priorité guides puis média) vers 700–1 200 mots, +1 H2 question, +1 tableau.
4. **Production vague P2** : rédiger les 39 pages selon le calendrier du plan de production (2–3/semaine), en les réintégrant au sitemap au fil des publications.
5. Dates réelles + `datePublished`/`image` dans le JSON-LD au fil des révisions.
