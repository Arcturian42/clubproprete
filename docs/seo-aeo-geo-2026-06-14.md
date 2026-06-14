# Vérification SEO / AEO / GEO — 14 juin 2026

Vérification de l'état réel du code et correction des manques. Fait suite à
l'audit `audit-seo-geo-2026-06-11.md` (dont la plupart des constats restaient
valides côté code).

- **SEO** : indexation, métadonnées, données structurées classiques.
- **AEO** (Answer Engine Optimization) : éligibilité aux réponses directes
  (Google for Jobs, rich results, FAQ, breadcrumbs).
- **GEO** (Generative Engine Optimization) : compréhension/citation par les
  moteurs génératifs (entité déclarée, `llms.txt`, auteur, fraîcheur).

## État vérifié (avant correction)

| Domaine | État constaté |
|---|---|
| robots.txt / sitemap | ✅ Présents, sitemap dynamique exhaustif |
| Titles / descriptions | ✅ Partout (statiques + `generateMetadata`) |
| `metadataBase` / canonical | ❌ Absents → URLs OG/canonical non résolues |
| Open Graph / Twitter | ❌ Aucun |
| Favicon / image OG | ❌ Aucun (`public/` ne contenait que `founders/`) |
| JSON-LD | ⚠️ **Uniquement** sur les pages Ressources statiques |
| Organization / WebSite | ❌ Entité non déclarée (clé GEO) |
| JobPosting | ❌ Offres inéligibles à Google for Jobs |
| llms.txt | ❌ Absent |

## Corrections appliquées (code)

### Global (`app/layout.tsx`, `lib/seo.ts`, `components/json-ld.tsx`)
- `metadataBase` (depuis `NEXT_PUBLIC_APP_URL`), `title.template`
  `%s | Club Propreté`, `alternates.canonical`, `robots` index/follow.
- **Open Graph + Twitter** par défaut (`summary_large_image`, `fr_FR`,
  `siteName`), hérités par toutes les pages.
- **JSON-LD `Organization` + `WebSite`** (avec `SearchAction` →
  `/ressources?q=`) injecté sur tout le site → entité déclarée pour le GEO.

### Identité visuelle de partage (générée via `next/og`, sans asset binaire)
- `app/icon.tsx` : favicon monogramme « CP ».
- `app/opengraph-image.tsx` : image de partage 1200×630 par défaut
  (LinkedIn, Google, moteurs génératifs).

### Données structurées par type de page (AEO)
- **`app/emploi/[id]`** : JSON-LD `JobPosting` complet (titre, description,
  `datePosted`, `validThrough`, `employmentType` normalisé, `hiringOrganization`,
  `jobLocation`, `baseSalary`) → **éligibilité Google for Jobs** + breadcrumb +
  canonical.
- **`app/ressources/[id]`** (blog) : JSON-LD `Article` avec auteur `Person`
  (lié au profil membre — E-E-A-T), `datePublished`/`dateModified`, image,
  `publisher` → + OG `type: article` + canonical.
- **`app/annuaire/societes/[id]`** : JSON-LD `ProfessionalService`
  (`PostalAddress`, `GeoCoordinates`, `areaServed`) → requêtes locales
  « entreprise de nettoyage + ville » + canonical.
- **`app/formations/[id]`** : JSON-LD `Course` (`provider`, `hasCourseInstance`
  depuis les sessions) + canonical.
- Breadcrumb `BreadcrumbList` ajouté sur ces 4 types de pages.

### GEO
- `public/llms.txt` : présentation du site et liens vers les hubs clés (À propos,
  annuaires, emploi, formations, ressources, légal) pour les moteurs génératifs.

## Vérifications
`typecheck` ✅ · `lint` ✅ (0 erreur) · `build` ✅ (routes `/icon` et
`/opengraph-image` générées).

## Reste à faire (hors code)

1. **Domaine canonique** : rattacher `clubproprete.com` au projet Vercel et
   définir `NEXT_PUBLIC_APP_URL=https://clubproprete.com` en prod. Tant que le
   site vit sur `*.vercel.app`, `metadataBase` pointe sur ce fallback. **Action
   dashboard Vercel — pas du code.**

## Reporté (passe dédiée)

- **Migration `<img>` → `next/image`** (19 occurrences, 20 warnings de lint) :
  gain LCP/CLS, nécessite `images.remotePatterns` pour le domaine Vercel Blob et
  une vérification des dimensions ; à traiter dans une passe perf isolée pour ne
  pas risquer de régression de mise en page.
- `LocalBusiness` sur les fiches **fournisseurs** et profils **membres**
  (`Person`) : même patron que les sociétés, à généraliser si besoin.
