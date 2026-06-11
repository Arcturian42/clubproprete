# Analyse de l'audit QA du 11 juin 2026

Verdict global : l'audit est sérieux et utile, mais il a été réalisé sur un
**déploiement en retard sur le code**. Environ 40 % des points « critiques »
étaient déjà corrigés dans `main` au moment de l'analyse. Le reste a été trié
en 3 catégories : corrigé dans cette PR, déjà corrigé avant, reporté (avec
raison).

## 1. Points de l'audit déjà corrigés avant cette PR

| Réf. audit | Constat | État réel du code |
|---|---|---|
| B01 / A03 / A18 | Politique de confidentialité en 404 | La page `/politique-confidentialite` existe ; le footer et le formulaire d'inscription pointent dessus |
| B02, B05, B06 | 404 footer (indépendants, centres de formation, profil candidat) | Les liens du footer pointent vers `/independants`, `/annuaire/centres-formation`, `/inscription?role=candidate_profile` — tous existants |
| B03 | Aucun annuaire de profils | `/independants` + profils publics `/membres/[id]` existent |
| B09 / A01 | Pas de menu hamburger mobile | `components/site-header.tsx` a un menu mobile complet |
| B13 / A13 | Pas de bouton Sauvegarder sur /profil | Le bouton existait (en mode édition) ; l'UX restait confuse → refondue dans cette PR |
| B12 / A14 | Scores de complétion contradictoires (10 % vs 82 %) | Une seule source de calcul côté société ; le score candidat codé en dur (68 %) a été remplacé par un vrai calcul dans cette PR |
| A15 | Onboarding absent | `/onboarding` existe avec un tunnel par intention |
| A17 | Adhésion association sans formulaire | `/association/adhesion` existe |

**Action recommandée hors code : redéployer.** La prod testée par l'auditeur
ne reflète pas `main`.

## 2. Points corrigés dans cette PR

| Réf. audit | Epic | Correction |
|---|---|---|
| — (demande produit) | **Profils de test** | Seed entièrement réécrit : 13 comptes réalistes avec identifiants (`docs/comptes-test.md`), profils membres **publics**, 4 sociétés géolocalisées avec slugs, 3 offres d'emploi rédigées, 4 articles complets signés par 2 auteurs |
| — (demande produit) | **Page /profil** | Refonte : une colonne, formulaire toujours éditable, barre « Enregistrer » collante à l'apparition de modifications, visibilité public/privé expliquée, lien « Voir mon profil public », correction du bug bio-placeholder enregistrée comme vraie bio |
| B07, B10, A19, B08 | **Slugs SEO** | Champ `slug` sur Company et Supplier (+ migration), génération automatique à la création (onboarding + formulaires), résolution id *ou* slug, liens des listings/sitemap/job board par slug ; articles liés par slug |
| B15 / A07 | Contenu | Descriptions d'offres d'emploi complètes dans le seed |
| A06 | Contenu | Textes « V0 » supprimés de la fiche société ; description courte/longue réelles affichées |
| B20 / A04 | Contenu | 2 auteurs avec bios, articles réattribués et rédigés |
| A02 / A10 | Hero | Sous 10 sociétés référencées, les compteurs sont remplacés par un panneau « membres fondateurs » |
| A08 | Confiance | Coordonnées des fournisseurs visibles uniquement connecté |
| B11 | UX | `/connexion` et `/inscription` redirigent vers `/dashboard` si déjà connecté |
| B16 | UX | FAQ : chevron ▼ qui pivote (au lieu de la flèche →) |
| A09 | UX | Header : bouton déconnexion en icône (plus de texte rogné), capsule utilisateur allégée (prénom seul) |
| B17 / A11 | Annuaire | Filtre par région sur `/annuaire/societes` (conservé dans la pagination) |
| A12 | Carte | La carte se centre sur les sociétés géolocalisées (seedées avec lat/lng) au lieu de la France vide |
| Typos §7 | Contenu | « 1 offre(s) », « membre(s) actif(s) », « formation(s) » → pluriels conditionnels ; titres de formations accentués via le seed correctif |
| §7 | Copywriting | « Revendiquer / compléter » → « C'est ma société · Compléter ma fiche » |
| A22 / §8 | SEO | `<title>`/description uniques sur 11 pages clés + `generateMetadata` sur les fiches société, fournisseur, article, emploi, formation ; sitemap en slugs |

Note : le seed est désormais **correctif** (les `update` des upserts réécrivent
les champs). Relancé sur l'environnement de démo
(`SEED_ALLOW_REMOTE=true npm run prisma:seed`), il remplace les anciennes
données sans accents (« Azur Proprete Services », « Habilitation electrique »)
et les descriptions tronquées.

## 3. Points reportés (et pourquoi)

| Réf. audit | Sujet | Raison du report |
|---|---|---|
| B14 | Lenteur fiche société (3-5 s) | Symptôme probable du cold start Vercel/Supabase, pas reproductible localement (<100 ms). À mesurer en prod avant d'optimiser ; un skeleton loading est un plus si confirmé |
| A05 | Images dans les articles | Le champ `featuredImage` existe ; nécessite de vrais visuels (choix éditorial), pas du code |
| A20 | Témoignages / logos partenaires | Nécessite du contenu réel ; en mettre des faux contredirait l'objectif crédibilité |
| A16 | Filtres catégorie sur /ressources | Pertinent mais faible impact avec 4 articles ; à faire quand le volume le justifie |
| B04 | Landing recruteur | Vraie opportunité produit (persona absent), mais demande un travail de positionnement (recruteur ≠ société ?) — à cadrer avant de coder |
| §8 GEO | Pages piliers SEO (nettoyage bureaux Paris…) | Chantier éditorial de fond, hors périmètre d'un correctif |
| A21 | Audit accessibilité complet | À traiter en passe dédiée (aXe) ; les formulaires refondus de /profil ont déjà des `label for`/`id` |
| B19 | Breadcrumb homogène | Cosmétique, faible priorité |

## 4. Désaccords avec l'audit

- **« Implémenter un menu hamburger » (B09)** : déjà fait — l'audit a testé une
  vieille version déployée.
- **« La politique de confidentialité est un 404, illégal RGPD » (B01)** :
  faux sur le code actuel ; vrai uniquement sur le déploiement audité.
- **« Masquer la page annuaire » (§5)** : préférer le panneau « membres
  fondateurs » (mis en place) plutôt que de masquer l'annuaire, qui est le
  cœur de la promesse produit.
