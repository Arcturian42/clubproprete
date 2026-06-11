# Audit SEO & GEO — ClubProprete

**Date :** 11 juin 2026 · **Périmètre :** code (`main`) + production (`clubproprete.vercel.app`)
**GEO** = Generative Engine Optimization : capacité du site à être compris, repris et cité par les moteurs génératifs (Google AI Overviews, ChatGPT, Perplexity…).

## Synthèse

| Domaine | Note | Constat |
|---|---|---|
| Indexabilité technique | 🟢 7/10 | robots.txt propre, sitemap dynamique complet, pas de noindex parasite, vrais 404 |
| Métadonnées de base | 🟡 6/10 | Titles/descriptions présents partout (statiques + dynamiques), mais aucun Open Graph, aucun canonical |
| Partage social / branding | 🔴 2/10 | **Aucune image OG, aucun favicon** : tout partage LinkedIn s'affiche nu — critique pour un réseau B2B |
| Données structurées | 🟡 5/10 | Excellentes sur les 82 pages Ressources (Article + FAQPage + Breadcrumb) ; **absentes partout ailleurs** |
| Domaine & canonicalisation | 🔴 3/10 | Site servi sur `clubproprete.vercel.app`, **aucun domaine personnalisé rattaché**, aucun canonical |
| Contenu & structure Hn | 🟢 8/10 | H1 uniques (PageShell), Hn structurés, 43 pages de contenu optimisé, maillage interne réel |
| GEO | 🟡 6/10 | Contenu très citable (intro-réponses, FAQ, dates) mais entité non déclarée (pas d'Organization), pas de llms.txt |
| Performance & images | 🟡 6/10 | JS partagé raisonnable (~102 kB), Leaflet chargé dynamiquement, mais 16 `<img>` sans `next/image` ni dimensions |

---

## 🔴 P0 — Critique (à traiter en premier)

### 1. Domaine canonique : le site vit sur `clubproprete.vercel.app`
**Constat.** Le projet Vercel n'a aucun domaine personnalisé rattaché ; `NEXT_PUBLIC_APP_URL` pointe en prod vers le sous-domaine vercel.app (visible dans le robots.txt servi). Aucune balise canonical n'est émise sur aucune page.
**Risque.** Toute l'autorité SEO s'accumule sur un sous-domaine que vous ne maîtrisez pas en branding ; le jour où `clubproprete.com` sera branché, sans canonicals ni redirections, Google verra deux sites dupliqués.
**Actions.**
- Rattacher `clubproprete.com` au projet Vercel (les *.vercel.app redirigent alors automatiquement en 308).
- Mettre `NEXT_PUBLIC_APP_URL=https://clubproprete.com` en variable d'env production.
- Ajouter `metadataBase` + `alternates.canonical` dans le layout racine (et canonical auto-référent sur les pages paginées des annuaires).

### 2. Aucun Open Graph, aucune image de partage, aucun favicon
**Constat.** Zéro balise `og:*`/`twitter:*` sur tout le site, pas de fichier `opengraph-image`, pas d'`icon`/favicon (le dossier `public/` ne contient que les photos des fondateurs).
**Risque.** Chaque partage sur **LinkedIn** — votre canal principal — affiche un lien nu sans image ni titre maîtrisé ; l'absence de favicon dégrade la confiance (onglets, résultats Google qui affichent les favicons).
**Actions.**
- Créer `app/icon.png` (+ `apple-icon.png`) et `app/opengraph-image.png` (1200×630, logo + baseline).
- Déclarer dans le layout : `metadataBase`, bloc `openGraph` par défaut (siteName, locale `fr_FR`, type website) et `twitter: { card: "summary_large_image" }`.
- Sur les pages dynamiques (`generateMetadata`), propager `openGraph.title/description` (héritage automatique de l'image par défaut).

### 3. JobPosting absent sur les offres d'emploi → Google for Jobs perdu
**Constat.** `app/emploi/[id]/page.tsx` n'émet aucun JSON-LD.
**Risque/opportunité.** Sans schéma `JobPosting` (titre, description, lieu, type de contrat, date, organisation), les offres sont **inéligibles à Google for Jobs**, qui capte une part majeure du trafic emploi en France. Pour un job board, c'est le levier SEO n°1.
**Action.** Générer le JSON-LD `JobPosting` sur chaque offre publiée (et `validThrough` à la dépublication). Effort : faible — toutes les données existent déjà en base.

---

## 🟠 P1 — Important

### 4. Entité « Club Propreté » non déclarée (SEO + GEO)
Aucun schéma `Organization`/`WebSite` global. Les moteurs génératifs raisonnent par entités : déclarer dans le layout un JSON-LD `Organization` (nom, url, logo, `sameAs` → LinkedIn, description) + `WebSite` (avec `potentialAction` SearchAction vers `/ressources?q=`). C'est le socle GEO du site.

### 5. Données structurées manquantes sur les contenus dynamiques
- **Articles du blog** (`/ressources/[id]`) : pas de schéma `Article` (alors que les 82 pages Ressources statiques en ont un — incohérent).
- **Fiches sociétés/fournisseurs** : pas de `LocalBusiness`/`Organization` (nom, adresse, zone) — utile pour les requêtes locales « entreprise de nettoyage + ville ».
- **Formations** : pas de schéma `Course`.
- **Breadcrumbs** : présents visuellement sur plusieurs pages mais le JSON-LD `BreadcrumbList` n'existe que sur les Ressources.

### 6. Images : aucun usage de `next/image`
16 `<img>` sans dimensions ni lazy-loading optimisé (logos, photos articles, fondateurs). Impact : CLS et LCP dégradés sur les fiches et le blog. Migrer vers `next/image` (prévoir `images.remotePatterns` pour le domaine Vercel Blob maintenant que l'upload y est branché).

### 7. llms.txt absent (GEO émergent)
Le standard `llms.txt` (équivalent de robots.txt pour les LLM) permet de présenter aux moteurs génératifs la structure et les pages clés du site. Créer `public/llms.txt` listant le hub Ressources, les 7 rubriques et les pages piliers, avec une description du site. Effort minime, signal d'avance.

### 8. Fraîcheur et auteur sur les articles du blog
Les pages Ressources affichent une date de mise à jour (bien) ; les articles du blog ont une date mais le schéma auteur n'est pas exposé. Pour le GEO/E-E-A-T : exposer l'auteur (`Person` → profil membre) dans le JSON-LD `Article` et lier la page À propos depuis le footer des contenus.

---

## 🟡 P2 — Améliorations

| # | Sujet | Détail |
|---|---|---|
| 9 | Title template | Définir `title: { default, template: "%s \| Club Propreté" }` dans le layout pour éviter les oublis de suffixe |
| 10 | Pagination des annuaires | `?page=2` indexable sans canonical : ajouter canonical auto-référent et `robots: { index: false }` au-delà de la page 1 si le contenu est dupliqué |
| 11 | Meta descriptions dynamiques | Certaines retombent sur des fallbacks courts (ex. formations sans description) : générer une phrase enrichie (ville, type, organisme) |
| 12 | CSP et JSON-LD | La CSP actuelle (`script-src 'self' 'unsafe-inline'`) autorise les scripts JSON-LD inline — OK, ne pas la durcir sans nonce |
| 13 | Hreflang | Inutile à ce stade (site monolingue FR) — ne rien faire |
| 14 | Page 404 | Vérifier qu'elle propose une recherche/liens vers les hubs (limite la perte des visiteurs SEO sur contenus dépubliés) |

---

## ✅ Points forts (à préserver)

- **Indexabilité saine** : robots.txt correct, sitemap dynamique exhaustif (annuaires, emploi, formations, articles, 82 pages Ressources, catégories), vrais 404 sur les slugs inconnus, pages privées bien disallow.
- **Section Ressources exemplaire** : 43 pages avec intro-réponse directe, H2 en questions, FAQ, JSON-LD complet (Article + FAQPage + BreadcrumbList), dates de mise à jour, maillage par ressources liées réciproques — c'est le standard à généraliser au reste du site.
- **Structure Hn propre** : H1 unique par page via PageShell, hiérarchie cohérente.
- **E-E-A-T** : page À propos avec fondateurs identifiés et LinkedIn, contenu signé par l'organisation, références réglementaires exactes.
- **Maillage interne** : footer riche, breadcrumbs, liens contextuels entre ressources/annuaire/association.

---

## Plan d'action recommandé (ordre d'exécution)

1. **Rattacher le domaine** `clubproprete.com` + env `NEXT_PUBLIC_APP_URL` *(action dashboard Vercel — vous)*
2. **metadataBase + canonical + Open Graph/Twitter par défaut + favicon + opengraph-image** *(code, ~1 PR)*
3. **JSON-LD JobPosting** sur les offres d'emploi *(code, fort ROI)*
4. **JSON-LD Organization + WebSite** global *(code)*
5. **JSON-LD Article (blog), Course (formations), LocalBusiness (fiches)** *(code)*
6. **llms.txt** + migration `next/image` *(code)*
7. P2 au fil de l'eau.

Les points 2 à 6 sont réalisables immédiatement dans le code ; seul le point 1 nécessite une action dans le dashboard Vercel (achat/rattachement du domaine).
