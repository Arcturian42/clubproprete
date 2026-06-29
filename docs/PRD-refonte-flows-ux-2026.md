# PRD — Refonte complète des flows & de l'UX — ClubProprete.com

> **Statut :** Proposition de reconstruction (v2.0 — rebuild from scratch)
> **Date :** 2026-06-29
> **Auteur :** Analyse produit + audit technique du code existant
> **Décision cadre :** Le produit actuel souffre de problèmes structurels de flow et d'UX trop nombreux pour être corrigés à la marge. Ce document spécifie la **cible** à reconstruire, en s'appuyant sur l'audit ligne-à-ligne du code existant (références `fichier:ligne`).

---

## 0. Résumé exécutif

ClubProprete est une plateforme B2B gratuite pour les professionnels du nettoyage : annuaires (sociétés, fournisseurs, centres de formation, indépendants), emploi, formations, association, sous-traitance privée, blog/ressources et back-office de validation.

L'audit du code révèle que **l'architecture est globalement saine côté sécurité** (RBAC relu en base, pas d'IDOR majeur), mais que **les flows métier sont incomplets ou cassés** et que **l'UX de saisie produit des données sales**. Les symptômes remontés en QA sont les conséquences visibles de causes racines structurelles.

### Les 5 causes racines structurelles

| # | Cause racine | Conséquences visibles |
|---|--------------|------------------------|
| **C1** | **Rôle unique (`mainRole` string) vs permissions pensées multi-rôles (`Role[]`)** | Fonctions `canPublishMission`/`canAccessSubcontracting` mortes ; rétrogradation de rôle au re-onboarding ; `association_member` jamais assigné ; super admin perdu si l'email du script bootstrap ne correspond pas |
| **C2** | **Workflows de modération incomplets (pas de machine à états, actions admin manquantes)** | Offres d'emploi créées en `pending` mais jamais publiées ; adhésions association bloquées en `pending` ; missions/recommandations jamais modérées |
| **C3** | **Saisie non structurée (texte libre partout)** | Ville, compétences, services, disponibilités en champ libre → doublons, fautes, données non filtrables/exploitables |
| **C4** | **Séparation des espaces floue (perso / entreprise / publications / offres)** | Dashboard « usine à gaz » après création d'une fiche ; CTA en double ; utilisateur perdu |
| **C5** | **Dépendances d'environnement non gérées (Blob storage) + erreurs avalées silencieusement** | Image de couverture d'article « ne s'enregistre pas » sans feedback ; uploads perdus |

### Mapping rapide QA → causes → sections de ce PRD

| QA | Sévérité | Cause racine | Section cible |
|----|----------|--------------|---------------|
| QA-001 Super admin redirigé vers dashboard user | P0 | C1 | §6 RBAC, §8.2 |
| QA-002 Dashboard super admin / CRM manquant | P0 | C2 | §9 Back-office |
| QA-003 Ville sans autocomplétion | P2 | C3 | §7 Onboarding, §12 Référentiels |
| QA-004 Compétences en texte libre | P2 | C3 | §7, §12 |
| QA-005 Image de couverture non enregistrée | P1 | C5 | §10 Éditorial |
| QA-006 Disponibilités vérification texte libre | P2 | C3 | §8.4 Vérification |
| QA-007 Champs Google Maps/site/GBP manquants | P2 | — | §8.3 Fiche entreprise |
| QA-008 Liste de services non pertinente | P2 | C3 | §8.3, §12 |
| QA-009 Dashboard incohérent après fiche entreprise | P1 | C4 | §8.1 Architecture des espaces |

---

## 1. Objectifs & non-objectifs

### Objectifs (v2)
1. **Espaces clairs et séparés** : profil personnel, fiche(s) entreprise/fournisseur/centre, publications, offres, paramètres — navigation sans ambiguïté.
2. **Back-office super admin complet** (CRM) : piloter utilisateurs, rôles, entités, demandes (adhésion, publication, rédacteur), modération, blog, paramètres globaux.
3. **Données propres dès la saisie** : villes normalisées (autocomplétion), compétences et services en tags structurés depuis des référentiels métier.
4. **Workflows de modération complets** : chaque entité soumise à validation a un chemin admin réel (approuver/refuser avec motif) et une machine à états explicite.
5. **Uploads fiables** : feedback d'erreur explicite, configuration de stockage vérifiée, persistance garantie.
6. **Cohérence d'accès** : un seul modèle de droits, appliqué uniformément ; rafraîchissement de session après changement de rôle/statut.

### Non-objectifs (v2)
- Paiement / monétisation (la plateforme reste gratuite).
- Messagerie temps réel entre membres (hors périmètre, prévoir un système de leads/contact asynchrone).
- Application mobile native.

---

## 2. Personas & rôles

| Persona | Besoin principal | Rôle plateforme cible |
|---------|------------------|------------------------|
| Dirigeant de société de propreté | Visibilité annuaire, recrutement, sous-traitance, association | `company_owner` → `verified_company` |
| Fournisseur du secteur | Référencer son catalogue (produits, matériel, machines, logiciels) | `supplier_owner` → `verified_supplier` |
| Centre de formation | Référencer l'organisme et ses formations | `training_org_owner` → `verified_training_org` |
| Indépendant / auto-entrepreneur | Missions, sous-traitance, visibilité | `independent` → `verified_independent` |
| Demandeur d'emploi | Postuler aux offres | `candidate` |
| Rédacteur / journaliste | Publier des articles sur le blog | `author` (capacité, voir §6) |
| Membre association | Accéder à la sous-traitance privée | statut `association_member` (voir §6) |
| Admin | Modérer le contenu et les entités | `admin` |
| Super admin | Piloter toute la plateforme | `super_admin` |

---

## 3. Méthode d'audit & sources

Audit lecture-seule, ligne-à-ligne, du code existant (Next.js 15 App Router, Prisma/PostgreSQL, Auth.js v5, Tailwind). Chaque constat ci-dessous est sourcé `fichier:ligne`. Documents internes pertinents : `docs/audit-flux-utilisateurs-2026-06.md`, `plan.md`.

---

## 4. Synthèse des problèmes du code existant (par flow)

### 4.1 Authentification & RBAC
- **Rôle unique en base** : `User.mainRole` est un `String` unique (`prisma/schema.prisma:27`), mais `lib/permissions.ts:248-257` définit `canAccessSubcontracting(roles: Role[])` et `canPublishMission(roles: Role[])` qui attendent un **tableau** → **jamais appelées**, logique morte.
- **`association_member` n'est jamais posé sur `mainRole`** : c'est un statut (table `AssociationMembership` + `UserProfile.associationStatus`), pas un rôle → double source de vérité (`auth.ts:94-100`, `lib/actions/memberships.ts:131-145`).
- **JWT figé 30 jours** (`auth.config.ts:8-11`) : un membre fraîchement approuvé ne voit rien tant qu'il ne se reconnecte pas. Contourné par des relectures DB coûteuses (`app/dashboard/page.tsx:17-30`, `app/sous-traitance/page.tsx:23-28`).
- **Super admin bootstrap fragile** : accordé uniquement par script manuel `scripts/ensure-super-admin.ts:19` ciblant `clement@pershingsolution.com` (singulier, sans accent). Si l'email réel diffère (`clément@pershingsolutions.com`, `pershingsolution@gmail.com`…) ou si le script n'est pas exécuté en prod, le compte reste `registered_user` → **QA-001**.

### 4.2 Onboarding
- **Ville en texte libre** : `components/onboarding/onboarding-flow.tsx:241-249` (contact) et `:352-360` (société). Normalisation cosmétique seulement (`siret-search.tsx:26-32`). → **QA-003**.
- **Code postal & région perdus** : l'API SIRET (`recherche-entreprises.api.gouv.fr`) renvoie `code_postal` et `libelle_commune`, mais `siret-search.tsx:12-20` ne remonte que `city` → `postalCode`/`region` restent **NULL** sur toutes les entités créées. **Bug critique non listé en QA.**
- **Compétences en texte libre** : `onboarding-flow.tsx:534-543` et `:600-609`, stockées brutes dans `bio` (`lib/actions/onboarding.ts:266,298`). Aucune tokenisation/normalisation. → **QA-004**.
- **Sous-catégorie fournisseur forcée** : `lib/actions/onboarding.ts:215` impose `SUPPLIER_TAXONOMY[family].subs[0]` quel que soit le choix réel → données fausses dès la création.
- **Re-onboarding destructeur** : recalcule `mainRole` (peut **rétrograder** un `company_owner` en `candidate`), écrase `mainNeeds`/`visibility` (`onboarding.ts:87-93,138-143`). Avertissement faible et non bloquant.

### 4.3 Dashboard & séparation des espaces
- `app/dashboard/page.tsx:29-41` redirige par rôle : `admin/super_admin → /admin`, `company_owner/verified_company → /dashboard/entreprise`, etc.
- **Confusion** : `/dashboard/entreprise/page.tsx` (763 lignes) est à la fois fiche éditable, stats, aperçu public, et porte d'entrée vers offres/candidatures. Le « dashboard normal » disparaît au profit d'une page monolithique. CTA en double avec `MyDashboard`. → **QA-009**.
- Pas de fil d'Ariane, pas de séparation explicite « Mon profil / Ma fiche / Mes publications / Mes offres ».

### 4.4 Fiche entreprise & vérification
- **Services non pertinents** : `app/dashboard/entreprise/page.tsx:61-64` mélange **types de clients** (`Bureaux`, `Copropriétés`, `Commerce`, `Industriel`) et **services** (`Vitrerie`, `Remise en état`, `Fin de chantier`, `Désinfection`). Liste incomplète, `CompanyService.serviceType` est un string libre sans validation serveur. → **QA-008**.
- **Champs manquants** : pas de lien Google Maps, ni Google Business Profile ; nombreux champs en base mais non éditables (`latitude/longitude`, `serviceAreas`, `interventionRadius`, `directorName`…). → **QA-007**.
- **Disponibilités vérification en texte libre** : `VerificationRequest.preferredSlot` saisi via `<input type="text">` (`components/dashboard/company-verification-card.tsx:218-227`), exemple « mardi ou jeudi, entre 14h et 17h » → non planifiable. → **QA-006**.
- Photos stockées en JSON stringifié (`Company.photos`), suppression par index fragile.

### 4.5 Éditorial / blog
- **Image de couverture « non enregistrée »** (→ **QA-005**) : deux défauts cumulés.
  1. `app/api/upload/route.ts:65-74` renvoie **503** en production si `BLOB_READ_WRITE_TOKEN` absent (et `ALLOW_LOCAL_UPLOADS≠true`) ; sur Vercel le disque est éphémère.
  2. `components/article-editor.tsx:7-17` (`uploadFile`) **avale toutes les erreurs** (`catch { return null }`) et ne donne **aucun feedback** ; si l'upload échoue, `setUrl()` n'est jamais appelé (`:155-163`) et l'`<input hidden name="featuredImage">` reste vide. L'utilisateur croit avoir mis une image.
- `featuredImage` `z.optional()` + `.refine()` (`lib/actions/articles.ts:157-167`) : validation redondante et fragile.
- Rate-limit demande auteur par **IP** et non par utilisateur (`articles.ts:182-185`).

### 4.6 Emploi
- **Offres jamais publiées** : `createJob` crée l'offre en `status: "pending"` (`lib/actions/jobs.ts` ~230), mais **aucun flow admin ne la passe à `published`** ; l'annuaire emploi ne montre que `published` → les offres créées par les sociétés peuvent ne **jamais apparaître**. (À confirmer/figer dans la machine à états — voir §6.4.)
- `PublishJobButton` (`components/publish-job-button.tsx:7-18`) n'opère pas de gating réel : un `registered_user` clique puis échoue à la création (entité requise) → friction.

### 4.7 Association & sous-traitance
- **Aucune action admin d'approbation des adhésions** : `requestAssociationMembership` notifie les admins (`lib/actions/memberships.ts:74-78`) mais il n'existe pas d'action `approveAssociationMembership` → demandes **bloquées en `pending`**.
- Gating sous-traitance réécrit en dur à 4 endroits (`app/sous-traitance/page.tsx:24-28`, `app/association/missions/nouvelle/page.tsx:16-23`, `lib/actions/subcontracting.ts:15-20`) — divergent de `canAccessSubcontracting`/`canPublishMission` (morts).
- Missions créées directement en `published` (`subcontracting.ts:171`), pas de brouillon, pas de modération, pas de transitions de statut côté candidature.

### 4.8 Annuaire (visibilité incohérente)
- **Sociétés** : publiées **immédiatement** (filtre `deletedAt: null`), badge « Fiche vérifiée » si `approved`.
- **Fournisseurs / centres** : visibles **seulement si `approved`**.
- **Candidats** : `getPublishedCandidates()` renvoie **toujours `[]`** (`lib/actions/candidates.ts:6-16`) — annuaire candidats vide par design implicite.
- → Règle de visibilité à **unifier et expliciter**.

### 4.9 Back-office actuel (existe mais partiel)
- `/admin` existe (`app/admin/page.tsx`), `/admin/dashboard` et `/admin/users` réservés `super_admin`.
- **Manque** : modération des adhésions association (pas d'action), des missions de sous-traitance, des recommandations ; bulk actions ; tri/priorité de la file ; audit log lisible ; édition directe d'entités ; gestion documents ; confirmation avant changement de rôle (`role-select.tsx:9-12` auto-submit). → **QA-002**.

---

## 5. Architecture cible — vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                         PUBLIC (non connecté)                  │
│  Accueil · Annuaires · Emploi · Formations · Blog · Association│
└──────────────────────────────────────────────────────────────┘
            │ inscription / connexion (email+pwd, Google)
            ▼
┌──────────────────────────────────────────────────────────────┐
│                    ONBOARDING (wizard structuré)               │
│  Contact → Situation(s) → Étapes métier → Récap                │
│  → crée entité(s), pose mainRole, init UserProfile             │
└──────────────────────────────────────────────────────────────┘
            ▼
┌───────────────────────────┐     ┌───────────────────────────┐
│   ESPACE MEMBRE (/espace)  │     │   BACK-OFFICE (/admin)     │
│  Sidebar persistante :     │     │  CRM super_admin / admin   │
│   • Mon profil             │     │   • Vue d'ensemble (KPI)   │
│   • Ma/Mes fiche(s)        │     │   • Utilisateurs & rôles   │
│   • Mes publications       │     │   • Entités (sociétés…)    │
│   • Mes offres / candidat. │     │   • Demandes (adhésion,    │
│   • Sous-traitance         │     │     publication, rédacteur)│
│   • Paramètres             │     │   • Modération articles    │
│                            │     │   • Blog & contenus        │
│  Le contenu change ;       │     │   • Paramètres plateforme  │
│  la navigation reste.      │     │   • Journal d'audit        │
└───────────────────────────┘     └───────────────────────────┘
```

**Principe directeur (fix QA-009 / C4)** : l'espace membre est **une coquille unique avec navigation latérale persistante**. Créer une fiche entreprise **n'efface jamais** l'espace personnel ; elle ajoute une entrée « Ma fiche société » dans la même navigation.

---

## 6. Spécification — Rôles, permissions & session (résout C1, QA-001)

### 6.1 Modèle de droits unifié
Conserver **un rôle principal** (`mainRole`) pour le routing/l'identité, **mais** :
- Introduire des **capacités** dérivées et des **statuts** explicites, calculés en un seul endroit (`lib/access.ts`), au lieu de comparer des strings dispersés.
- `association_member` devient un **statut** booléen dérivé de la table `AssociationMembership` (source de vérité **unique** ; supprimer `UserProfile.associationStatus` comme source concurrente, ou en faire un simple miroir maintenu par l'admin).
- Supprimer les fonctions mortes `canAccessSubcontracting(Role[])`/`canPublishMission(Role[])` et les remplacer par des helpers basés sur `(user, statuses)` réellement appelés partout.

```ts
// lib/access.ts (cible)
type Capability =
  | "publish_job" | "publish_mission" | "access_subcontracting"
  | "write_article" | "moderate" | "admin_panel";

function capabilities(ctx: AccessContext): Set<Capability> { /* unique source */ }
```

### 6.2 Liste des rôles cible
`public`, `registered_user`, `company_owner`, `verified_company`, `supplier_owner`, `verified_supplier`, `training_org_owner`, `verified_training_org`, `independent`, `verified_independent`, `candidate`, `author`, `admin`, `super_admin`.

> Ajout vs existant : **`verified_independent`** et **`verified_training_org`** pour lever l'asymétrie actuelle (les indépendants/centres n'avaient pas d'état vérifié au niveau du rôle).

### 6.3 Super admin (résout QA-001)
- **Bootstrap robuste** : le ou les emails super admin sont lus depuis une **variable d'environnement** `SUPER_ADMIN_EMAILS` (liste), appliquée idempotemment au démarrage **et** au login (si l'email connecté ∈ liste et `mainRole≠super_admin`, élever automatiquement). Plus de dépendance à un email codé en dur et à un script lancé manuellement.
- **Décision produit attendue** (voir §15 Questions ouvertes) : email(s) exact(s) du/des super admin.
- Le routing `/dashboard` → `/admin` existe déjà et est conservé ; le bug n'était pas le routing mais l'attribution du rôle.

### 6.4 Machine à états & rafraîchissement de session
- **Rafraîchir le rôle/les statuts** après toute action admin via `session.update()` (déjà partiellement câblé dans `auth.config.ts:26-37`) ou réduire `maxAge` + refetch ciblé. Objectif : un membre approuvé voit immédiatement ses accès **sans reconnexion**.
- Toutes les transitions de statut passent par une **machine à états** centrale et auditée (voir §9.4).

---

## 7. Spécification — Inscription & Onboarding (résout C3, QA-003, QA-004)

### 7.1 Parcours cible
`Contact → Situation(s) → Étapes métier (dynamiques) → Récapitulatif → Succès contextualisé`.
Conserver la logique de branchement par situation (`company`, `supplier`, `training`, `independent`, `job_seeker`) mais corriger la saisie et la persistance.

### 7.2 Champ Ville (QA-003)
- Remplacer l'input libre par un **champ à autocomplétion** branché sur l'**API Adresse / découpage communes data.gouv.fr** (`geo.api.gouv.fr/communes`), gratuit et sans clé.
- La sélection renvoie un **objet normalisé** : `{ cityName, inseeCode, postalCode, department, region, lat, lng }`.
- Stocker `inseeCode` (clé stable) + libellés. **Corrige aussi le bug code postal/région perdus** : ces champs ne sont plus NULL.
- Bénéfice : élimine « paris » vs « Paris » vs fautes, et alimente les filtres géographiques de l'annuaire.

### 7.3 Compétences & spécialités (QA-004)
- Remplacer les textarea par un **composant de tags** (sélection + suggestions + saisie contrôlée) alimenté par un **référentiel métier** (voir §12.2).
- **Nouveau modèle de données** : table de liaison `ProfileSkill { profileId, skillId }` (ou `skills String[]` Postgres array indexé GIN) au lieu de stocker dans `bio`.
- Permet matching, filtres « indépendants vitrerie à Lyon », et données propres.

### 7.4 Corrections de fond onboarding
- **Sous-catégorie fournisseur** : la rendre **sélectionnable** (dépendante de la famille), ne plus forcer `subs[0]`.
- **Re-onboarding non destructeur** : ne **jamais rétrograder** `mainRole` ; un re-passage **ajoute** des situations/capacités, ne retire pas. Écran d'édition de profil dédié plutôt que de réutiliser le wizard pour modifier.
- **Validation téléphone** (format FR souple mais validé).
- SIRET : autocomplétion cohérente sur toutes les entités (société, fournisseur, centre, indépendant pro).

---

## 8. Spécification — Espace membre & fiche entreprise (résout C4, QA-006/007/008/009)

### 8.1 Architecture des espaces (QA-009)
Coquille unique `/espace` avec **navigation latérale persistante** :

| Entrée | Contenu | Visible si |
|--------|---------|-----------|
| **Mon profil** | Identité, photo, headline, bio, ville, visibilité, compétences (tags) | toujours |
| **Ma fiche société** | Édition fiche + score de complétion + vérification | a une `Company` |
| **Ma fiche fournisseur** | Idem fournisseur | a un `Supplier` |
| **Mon organisme de formation** | Idem centre + formations | a une `TrainingOrganization` |
| **Mon profil indépendant** | Fiche indépendant | a un `IndependentProfile` |
| **Mes publications** | Articles (brouillons, en attente, publiés) | capacité `write_article` |
| **Mes offres** | Offres + candidatures reçues | a une entité employeur |
| **Mes candidatures** | Suivi de mes candidatures emploi | a postulé |
| **Sous-traitance** | Missions & candidatures | statut `association_member` |
| **Paramètres** | Sécurité, 2FA, RGPD, notifications, suppression | toujours |

Règles :
- **Une fiche n'écrase jamais le profil perso.** Les deux coexistent dans la même nav.
- **Fil d'Ariane** systématique sur les pages profondes.
- **Aperçu public** = vue dédiée non mélangée à l'édition.
- Un utilisateur peut cumuler plusieurs entités (déjà supporté par `EntityMember`) → la nav liste chacune.

### 8.2 Score de complétion
Bannière horizontale en haut de chaque fiche : % de complétion, champs manquants, CTA « Compléter ». Calcul transparent et évolutif (≠ plafond figé à 90 actuel).

### 8.3 Champs fiche société (QA-007 + QA-008)
Champs cible (optionnels sauf mention) :
- Identité : nom commercial, raison sociale*, SIRET/SIREN (autocomplété), forme juridique, année de création, effectif (select), dirigeant.
- Contact : email*, téléphone*, **site web**, LinkedIn.
- **Présence en ligne (nouveau, QA-007)** : **lien Google Maps**, **lien Google Business Profile (GMB)**.
- Localisation : adresse, ville (autocomplétée → `postalCode`/`region`/`lat`/`lng` remplis), zones d'intervention (multi-villes/départements), rayon d'intervention (km).
- Médias : logo, galerie photos (avec ordre).
- **Services (QA-008)** : sélection multiple depuis le **référentiel métier propreté** (§12.1), validé **côté serveur** contre l'énumération. Distinguer **services** (ce que l'entreprise fait) et **segments clients** (qui elle sert) — ne plus les mélanger.

### 8.4 Flow de vérification de fiche (QA-006)
- Remplacer `preferredSlot` texte libre par un **sélecteur de créneaux structuré** : choix de **dates + plages horaires** (date picker + créneaux prédéfinis matin/après-midi, ou liste de créneaux proposés par l'admin).
- Stockage structuré (`requestedSlots: { date, slot }[]`) → planifiable et exploitable côté admin.
- Conserver le questionnaire (ancienneté, effectif, clients) mais en **champs structurés** (selects/ranges) plutôt que texte libre.
- Machine à états explicite : `draft → pending → (approved | rejected[motif obligatoire])`. Badge « Fiche vérifiée » à l'approbation + élévation `company_owner → verified_company` (déjà câblé `lib/actions/admin.ts:110-149`).

---

## 9. Spécification — Back-office / CRM super admin (résout C2, QA-002)

### 9.1 Navigation back-office
`Vue d'ensemble · Utilisateurs · Rôles & accès · Sociétés · Fournisseurs · Centres de formation · Indépendants · Candidats · Offres d'emploi · Sous-traitance · Articles & blog · Demandes (adhésion / publication / rédacteur) · Modération · Leads · Paramètres · Journal d'audit`.

### 9.2 Capacités attendues par section
Pour **chaque** entité : **lister · rechercher · filtrer par statut · trier (date/priorité) · voir le détail · approuver · refuser (motif obligatoire) · éditer · archiver/soft-delete · export**. Plus **bulk actions** (valider/refuser en lot).

### 9.3 Demandes & workflows manquants à implémenter
- **Adhésions association** : file dédiée + actions `approve/reject` (aujourd'hui **absentes**) → débloque la sous-traitance.
- **Demandes de publication / rédacteur-journaliste** (`AuthorApplication`) : `pending → approved (publie l'article + pose rôle author) | rejected (motif)`.
- **Validation des articles** : `draft → pending → published | rejected`.
- **Missions de sous-traitance & recommandations** : modération aujourd'hui inexistante → ajouter.
- **Offres d'emploi** : décision explicite — soit **auto-publication** pour entités vérifiées (recommandé, supprime le blocage `pending` éternel), soit file de validation admin réelle. **À trancher (§15).**

### 9.4 Machine à états & audit
- Définir une **machine à états unique** (`WORKFLOW_STATUSES` existe déjà : `draft, pending, approved, rejected, suspended, archived, published`) avec transitions autorisées et garde côté serveur.
- **Journal d'audit lisible** dans l'UI (qui, quand, quoi, motif) — `AnalyticsEvent` existe mais n'est pas exposé.
- **Confirmation** obligatoire avant changement de rôle/suspension (supprimer l'auto-submit `role-select.tsx:9-12`).

---

## 10. Spécification — Éditorial / blog (résout C5, QA-005)

### 10.1 Correction de l'upload d'image (QA-005)
1. **Garantir le stockage** : vérifier au démarrage la présence de `BLOB_READ_WRITE_TOKEN` (ou activer `ALLOW_LOCAL_UPLOADS` en dev). En prod, **échouer bruyamment et visiblement** si non configuré (bannière admin), pas en 503 silencieux.
2. **Feedback d'erreur** : `uploadFile` doit **propager l'erreur** (message serveur) ; le composant affiche un état d'échec explicite et **ne permet pas** de soumettre en croyant l'image présente.
3. **Validation client** : taille (≤5 Mo) et type avant envoi.
4. **Persistance vérifiée** : après upload, l'URL est dans le state ET dans l'`<input hidden>` ; bloquer la soumission « pending » si l'URL est vide (déjà tenté, mais fiabiliser le chemin state→FormData).
5. Simplifier la validation Zod (`featuredImage` requis pour `pending`, optionnel pour `draft`, sans double `.refine`).

### 10.2 Blog
- Listing blog : grille aérée (image, titre, extrait, auteur cliquable, date, temps de lecture).
- Détail : fil d'Ariane, H1, chapô, image, auteur cliquable → profil public, contenu structuré, CTA de fin.
- Catégories d'articles **validées** contre une énumération centralisée.
- Demande rédacteur : rate-limit **par utilisateur**, pas par IP.

---

## 11. Spécification — Emploi, Association, Sous-traitance, Annuaire

### 11.1 Emploi
- **Résoudre le blocage `pending`** : auto-publication des offres pour entités **vérifiées** (recommandé) OU file admin réelle (§9.3). Une offre publiée doit apparaître dans `/emploi`.
- Gating **réel** au bouton « Publier une offre » : n'afficher l'action que si l'utilisateur a une entité éligible et vérifiée ; sinon proposer « Créer/compléter ma fiche ».
- Candidature : message d'erreur clair (distinguer email non vérifié vs profil non approuvé).
- Machine à états candidature : `submitted → viewed → interview → (hired | rejected)` avec actions côté recruteur.

### 11.2 Association & adhésion
- Source de vérité **unique** : table `AssociationMembership`.
- Workflow complet : `draft → pending → (approved | rejected[motif])` avec **actions admin** (manquantes aujourd'hui).
- À l'approbation : statut `association_member` actif **immédiatement** (refresh session, §6.4).

### 11.3 Sous-traitance
- Gating **centralisé** (un seul helper `capabilities`), basé sur le statut `association_member` (+ admin).
- Missions : brouillon possible, publication, et **transitions de candidature** visibles côté sous-traitant (`submitted → accepted | rejected`).
- PII candidats masquées sauf créateur/admin (déjà en place — conserver).

### 11.4 Annuaire — règle de visibilité unifiée
Décision produit recommandée : **toutes** les fiches (société, fournisseur, centre, indépendant) sont **publiées dès création** (`status ≥ active`), avec **badge « Vérifié »** uniquement si `approved`. Cohérent, prévisible, maximise la visibilité. (Alternative : tout en modération préalable — moins favorable au remplissage de l'annuaire.) **À trancher (§15).**
- Filtres annuaire enrichis : **service** (référentiel), **ville/département/région** (grâce aux données géo normalisées), vérifié/non.
- Annuaire candidats : décider explicitement — **privé par défaut** (recommandé, RGPD) avec accès recruteur via candidature (déjà la logique `canViewCandidate`), au lieu d'un `[]` silencieux.

---

## 12. Référentiels de données métier (à figer en code, administrables ensuite)

### 12.1 Services de propreté (remplace la liste QA-008)
Énumération cible, validée côté serveur, distincte des segments clients :

**Services :**
`nettoyage_bureaux`, `entretien_copropriete`, `nettoyage_commerces`, `nettoyage_industriel`, `nettoyage_fin_chantier`, `remise_en_etat`, `nettoyage_vitres`, `vitres_en_hauteur`, `nettoyage_moquette`, `desinfection`, `nettoyage_cryogenique`, `nettoyage_apres_sinistre`, `bionettoyage_sante`, `nettoyage_agroalimentaire`, `entretien_espaces_verts`, `gestion_dechets`, `nettoyage_haute_pression`, `decapage_protection_sols`, `nettoyage_evenementiel`, `nettoyage_residentiel`.

**Segments clients (séparés) :**
`bureaux_tertiaire`, `copropriétés_syndics`, `commerces_retail`, `industrie_usines`, `santé_médical`, `agroalimentaire`, `hôtellerie_restauration`, `établissements_scolaires`, `collectivités_secteur_public`, `BTP_chantiers`.

### 12.2 Référentiel compétences / spécialités (tags — QA-004)
Base de tags suggérés (extensible, administrable) :
`vitrerie`, `vitres_en_hauteur`, `remise_en_etat`, `nettoyage_bureaux`, `nettoyage_moquette`, `desinfection`, `nettoyage_fin_chantier`, `nettoyage_industriel`, `entretien_copropriete`, `autolaveuse`, `monobrosse`, `injection_extraction`, `nettoyeur_vapeur`, `haute_pression`, `decapage`, `lustrage`, `bionettoyage`, `gestion_equipe_terrain`, `encadrement_chantier`, `controle_qualite`, `habilitation_hauteur`, `caces`, `regles_hygiene_HACCP`.

### 12.3 Villes / géographie (QA-003)
Source : `geo.api.gouv.fr` (communes, codes INSEE, codes postaux, départements, régions). Stockage normalisé par `inseeCode`.

### 12.4 Taxonomie fournisseurs
Conserver la taxonomie existante (`lib/supplier-taxonomy.ts` : `consommables`, `materiel`, `machines`, `logiciels` + sous-catégories) mais rendre la **sous-catégorie sélectionnable** (fix du forçage `subs[0]`).

---

## 13. Modèle de données — évolutions clés vs schéma actuel

| Domaine | Changement |
|--------|------------|
| Géo | Ajouter `inseeCode`, garantir `postalCode/region/department/lat/lng` remplis (User, Company, profils) |
| Compétences | Nouvelle table `Skill` (déjà présente, à exploiter) + liaison `ProfileSkill` / `CompanyService` typé contre l'énum services |
| Vérification | `VerificationRequest.requestedSlots Json` (créneaux structurés) + champs questionnaire structurés |
| Fiche société | Ajouter `googleMapsUrl`, `googleBusinessUrl` ; éditer `serviceAreas`/`interventionRadius` |
| Association | Source unique `AssociationMembership` (déprécier `UserProfile.associationStatus` comme source) |
| Rôles | Ajouter `verified_independent`, `verified_training_org` |
| Audit | Exposer `AnalyticsEvent` en lecture admin ; journaliser chaque transition |
| Candidatures | Index `@@unique([jobId, candidateProfileId])` et `([missionId, applicantUserId])` (anti double-candidature, déjà recommandé dans l'audit) |
| Soft-delete | Cascade de masquage annuaire à la suppression de compte (RGPD) |

---

## 14. Plan de reconstruction par phases

### Phase 0 — Fondations (1 sprint)
- Schéma de données cible (géo, skills, services, créneaux, rôles).
- Module d'accès unique `lib/access.ts` (capacités/statuts), suppression des helpers morts.
- Super admin par `SUPER_ADMIN_EMAILS` + élévation au login (**débloque QA-001**).

### Phase 1 — Espaces & onboarding (P0/P1)
- Coquille `/espace` + navigation persistante (**QA-009**).
- Onboarding : ville autocomplétée (**QA-003**), compétences en tags (**QA-004**), sous-catégorie fournisseur, re-onboarding non destructeur.

### Phase 2 — Back-office CRM (P0)
- Sections complètes + workflows manquants (adhésion, publication, rédacteur, articles, missions) (**QA-002**).
- Machine à états + audit + confirmations + bulk actions.

### Phase 3 — Fiches & vérification (P1/P2)
- Référentiel services propreté (**QA-008**), champs Google Maps/GBP/site (**QA-007**), créneaux de vérification (**QA-006**), score de complétion.

### Phase 4 — Éditorial & emploi (P1)
- Upload fiable + feedback (**QA-005**), blog refondu.
- Emploi : résoudre `pending`/publication, gating réel.

### Phase 5 — Annuaire & polish
- Règle de visibilité unifiée, filtres géo + services, annuaire candidats clarifié, SEO/AEO.

---

## 15. Questions ouvertes (décisions produit requises)

1. **Super admin** : quel(s) email(s) exact(s) faut-il câbler dans `SUPER_ADMIN_EMAILS` ? (Le code actuel vise `clement@pershingsolution.com` ; le QA mentionne `clément@pershingsolutions.com` ; la session indique `pershingsolution@gmail.com`.) → **À confirmer pour résoudre QA-001 définitivement.**
2. **Dashboard admin** : back-office **totalement séparé** (`/admin`, recommandé et déjà en place) vs vue conditionnelle dans le même dashboard ?
3. **Rôle super admin** : attribution **par env/bootstrap** (recommandé) et/ou **depuis l'interface** par un super admin existant ?
4. **Demandes (publication/rédacteur)** : statut simple `pending/approved/rejected` ou workflow avec commentaires de validation ?
5. **Autocomplétion villes** : `geo.api.gouv.fr` (recommandé, gratuit, FR) vs Google Places ?
6. **Services & compétences** : référentiel **figé en code** d'abord (recommandé pour démarrer) puis **administrable** depuis le back-office en v2 ?
7. **Offres d'emploi** : auto-publication pour entités vérifiées (recommandé) vs validation admin systématique ?
8. **Annuaire** : tout publié dès création + badge vérifié (recommandé) vs modération préalable ?
9. **Navigation espace membre** : confirmer les entrées exactes (Mon profil / Ma fiche / Mes publications / Mes offres / Sous-traitance / Paramètres) ?

---

## 16. Critères d'acceptation (QA de la cible)

### Super admin (QA-001/002)
- [ ] Le compte super admin défini en env est `super_admin` après login, **sans script manuel**.
- [ ] « Tableau de bord » d'un super admin ouvre `/admin`, jamais l'onboarding/dashboard user.
- [ ] Le back-office permet de lister/filtrer/valider/refuser/éditer : utilisateurs, rôles, sociétés, fournisseurs, centres, indépendants, candidats, offres, articles, adhésions, demandes de publication/rédacteur.

### Onboarding (QA-003/004)
- [ ] Le champ ville propose une autocomplétion ; la valeur stockée est normalisée (INSEE + CP + région).
- [ ] Les compétences sont des **tags** sélectionnables/suggérés, stockés en données structurées.

### Éditorial (QA-005)
- [ ] L'upload d'image affiche une erreur explicite en cas d'échec ; impossible de soumettre « en croyant » avoir une image.
- [ ] Après publication, l'image de couverture est persistée et visible après refresh.

### Fiche entreprise (QA-006/007/008/009)
- [ ] Disponibilités de vérification via créneaux structurés (date + plage), pas de texte libre.
- [ ] Champs site web, lien Google Maps, lien Google Business présents et sauvegardés.
- [ ] Liste de services = référentiel propreté pertinent (plus de « Bureau » comme service) ; validation serveur.
- [ ] Après création d'une fiche, l'espace personnel **reste accessible** ; navigation claire entre profil / fiche / publications / offres / paramètres.

### Flows transverses
- [ ] Une adhésion association peut être approuvée par un admin et débloque la sous-traitance **sans reconnexion**.
- [ ] Une offre d'emploi publiée par une entité vérifiée apparaît dans l'annuaire emploi.
- [ ] Règle de visibilité de l'annuaire unifiée et documentée.

---

## Annexe A — Index des références code (preuves d'audit)

- RBAC / rôles : `lib/types.ts:1-14`, `lib/permissions.ts:248-281`, `prisma/schema.prisma:27`, `auth.ts:94-119`, `auth.config.ts:8-37`.
- Super admin : `scripts/ensure-super-admin.ts:19`, `scripts/set-user-role.ts`, `lib/actions/users.ts:62-64`, `app/dashboard/page.tsx:33-41`.
- Onboarding : `components/onboarding/onboarding-flow.tsx:108-113,241-249,352-360,534-543,600-609`, `lib/actions/onboarding.ts:55,62,87-93,138-143,215,266,298`, `components/onboarding/siret-search.tsx:12-32`.
- Fiche société & vérification : `app/dashboard/entreprise/page.tsx:61-64`, `lib/actions/companies.ts:77-97,263-357`, `components/dashboard/company-verification-card.tsx:218-227`, `prisma/schema.prisma:131-208,610-636`.
- Éditorial : `components/article-editor.tsx:7-17,141-194`, `components/author-dashboard.tsx:65-129`, `lib/actions/articles.ts:148-167,182-185`, `app/api/upload/route.ts:65-74,117-147`.
- Emploi : `lib/actions/jobs.ts` (createJob, statut pending), `components/publish-job-button.tsx:7-18`, `lib/permissions.ts:101-113`.
- Association / sous-traitance : `lib/actions/memberships.ts:74-78,131-145`, `app/sous-traitance/page.tsx:24-28`, `app/association/missions/nouvelle/page.tsx:16-23`, `lib/actions/subcontracting.ts:15-20,171`.
- Annuaire : `lib/actions/companies.ts:12-44`, `lib/actions/suppliers.ts`, `lib/actions/candidates.ts:6-16`.
- Back-office : `app/admin/page.tsx`, `app/admin/dashboard/page.tsx`, `app/admin/users/page.tsx`, `lib/actions/admin.ts:40-96,110-149,233-277,359-432`, `components/admin/role-select.tsx:9-12`.
