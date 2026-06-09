# ClubPropreté.com — Vision Produit & Backlog d'Epics

**Date :** 9 juin 2026
**Base :** audit `docs/audit-architecture-produit-rbac-2026-06-09.md`
**Format :** vision → epics priorisés (vagues) → détail par epic

---

## 1. Vision produit

> **ClubPropreté est le réseau professionnel métier de la propreté en France — le « LinkedIn du nettoyage ».**

Ce n'est pas une collection d'annuaires juxtaposés, mais un **graphe d'acteurs** reliés par un socle commun : le **compte personnel**.

**Principe architectural non négociable :**
```
Compte personnel  →  Entités rattachées  →  Rôles & permissions  →  Visibilité contrôlée
   (l'humain)          (société, fournisseur,    (owner/admin/        (public / privé /
                        organisme, profils)       recruteur/membre)     conditionnel)
```

**Les 4 piliers du réseau :**
1. **Identité** — chaque acteur a un compte personnel unique, vérifiable, optimisé comme un CV.
2. **Entités** — un compte peut créer/gérer/rejoindre plusieurs entités : société de nettoyage, fournisseur, organisme de formation, profil candidat, profil indépendant.
3. **Confiance** — vérification des comptes et des entités, badges, recommandations entre pairs.
4. **Mise en relation** — job board, sous-traitance, annuaires, formations : des flux où la **visibilité est une permission**, jamais un défaut.

**Promesse de valeur par acteur :**
- *Société de nettoyage* : recruter, sous-traiter, trouver fournisseurs/formations, gagner en visibilité.
- *Fournisseur* : se référencer dans une taxonomie claire (consommables / matériel / machines / logiciels), être trouvé par achat **ou** location.
- *Candidat* : un profil unique réutilisable, des recommandations de pairs, une confidentialité garantie.
- *Organisme / formateur* : référencer son offre et recevoir des demandes qualifiées.
- *Indépendant / sous-traitant* : valoriser ses compétences, accéder aux missions privées.

**Anti-objectifs (ce que le produit n'est PAS) :** un annuaire ouvert où l'on parcourt librement les CV ; une base de données de contacts revendue ; une plateforme où masquer un bouton suffit à protéger une donnée.

---

## 2. Cartographie des epics & vagues de livraison

| Vague | Objectif | Epics |
|-------|----------|-------|
| **V1 — Socle & sécurité (P0)** | Rendre le réseau sûr et le job board fonctionnel | E1, E2, E5, E6 |
| **V2 — Métier & confiance (P1)** | Structurer entités, fournisseurs, vérification | E3, E4, E7, E8 |
| **V3 — Réseau social (P2)** | Recommandations, profils publics, graphe | E9, E10 |
| **V4 — Croissance (P2/P3)** | Sous-traitance, formations, contenus, RGPD prod | E11, E12, E13, E14 |

> Les numéros d'epic ne sont pas un ordre strict ; la colonne « Vague » donne la priorité de mise en chantier.

```
E1 Identité & comptes ─┬─> E2 RBAC & guards ─┬─> E4 Publication offres
                       │                     ├─> E5 Candidature/profil ─> E6 Visibilité candidats ─> E7 ATS entreprise
                       ├─> E3 Taxonomie fournisseurs
                       └─> E9 Pages entité & profils publics ─> E8 Recommandations
E10 Vérification/modération soutient E4, E6, E7, E9
```

---

## 3. Détail des epics

---

### E1 — Identité & comptes personnels multi-entités  · Vague V1 · P0→P1

**Vision.** Le compte personnel est la racine du système. Un même humain doit pouvoir porter plusieurs casquettes (dirigeant **et** candidat **et** formateur) et rattacher/rejoindre plusieurs entités, sans qu'un « rôle unique » ne l'enferme.

**Problème actuel (audit §1).** `mainRole` est un `String` mono-valué qui sert de proxy de permission partout. `candidateProfile`/`independentProfile` sont en 1→1. Aucune table de membership entité↔utilisateur : seul `ownerUserId` existe → impossible de rejoindre une entité ou d'avoir une équipe.

**Périmètre.**
- Découpler l'identité (compte) des rôles (dans une entité).
- Introduire `EntityMember(userId, entityType, entityId, role, status)`.
- Permettre à un compte de créer une entité supplémentaire post-inscription, et d'**accepter une invitation** à rejoindre une entité existante.
- Champ `UserProfile.visibility` (`public|private`, défaut `private`).

**User stories.**
- En tant qu'utilisateur, je m'inscris et obtiens un compte personnel, indépendamment du type d'entité que je créerai ensuite.
- En tant que dirigeant déjà inscrit, je crée une 2ᵉ entité (ex. un profil candidat) sans casser mes accès existants.
- En tant que collaborateur, je rejoins la page de mon entreprise via une invitation et j'obtiens le rôle « recruteur ».
- En tant qu'utilisateur, je choisis si mon profil personnel est public ou privé.

**Critères d'acceptation.**
- [ ] Un compte peut être lié à ≥2 entités de types différents simultanément.
- [ ] Les permissions sont dérivées de `EntityMember`, plus de `mainRole`.
- [ ] Migration : chaque `ownerUserId` existant devient un `EntityMember(role="owner")`.
- [ ] L'inscription continue de créer `User` + `UserProfile` en transaction.

**Dépendances.** Aucune (fondation). **Débloque** E2, E4, E7, E9.
**Fichiers.** `prisma/schema.prisma`, `lib/actions/auth.ts`, `auth.ts`, `auth.config.ts`, `lib/permissions.ts`.

---

### E2 — Sécurité & RBAC transverse (guards serveur)  · Vague V1 · P0

**Vision.** Chaque point d'entrée (Server Action, route API) applique l'autorisation côté serveur. « Masquer un bouton » n'est jamais une protection. Les ids ne sont jamais pris tels quels depuis le client.

**Problème actuel (audit §9).** Les Server Actions mutants n'appellent pas `auth()` (`createJob`, `applyToJob`, `softDeleteJob`…). Seuls le middleware et l'UI protègent les pages, contournables.

**Périmètre.**
- Helpers centraux : `requireUser()`, `requireEntityRole(entityId, role)`, `canViewCandidate(viewer, candidate)`, `canPublishJob(user, company)`.
- Audit et durcissement de **toutes** les Server Actions exposant ou mutant des données.
- Politique : dériver les ids d'ownership de la session, jamais du `FormData`.
- Suite de tests de permission (les 8 acteurs de la matrice).

**User stories.**
- En tant que plateforme, je refuse toute mutation non authentifiée même si l'appel contourne l'UI.
- En tant qu'auditeur, je dispose d'une matrice de tests couvrant non connecté / candidat / société (non) vérifiée / fournisseur / organisme / admin / super admin.

**Critères d'acceptation.**
- [ ] Toute Server Action mutante commence par `requireUser()`/`requireEntityRole()`.
- [ ] Falsifier `companyId`/`candidateProfileId`/`createdBy` dans le form → refus.
- [ ] Matrice §9 de l'audit couverte par des tests automatisés.

**Dépendances.** S'appuie sur E1 (rôles). **Transverse** à E4, E5, E6, E7.
**Fichiers.** `lib/permissions.ts`, toutes `lib/actions/*`, `e2e/*`.

---

### E3 — Annuaire Fournisseurs structuré  · Vague V2 · P1

**Vision.** Un fournisseur se trouve par une taxonomie claire et métier. On distingue ce qui se **consomme**, ce qui est **matériel**, ce qui est **machine** (et **achat vs. location**), et les **logiciels**. On identifie vendeurs, loueurs et ceux qui font les deux.

**Problème actuel (audit §2).** `Supplier.category` est un texte libre incohérent (« EPI », « Materiel et machines »…). Pas de familles, pas de sous-catégories, pas d'achat/location, pas de vendeur/loueur.

**Périmètre — taxonomie cible.**
- **A. Consommables** : produits d'entretien · désinfectants · papier/essuie-mains/sanitaire · sacs poubelle · produits pour machines · recharges · produits écologiques · produits spécialisés.
- **B. Matériel** : raclettes · balais · franges · seaux · chariots de ménage · pulvérisateurs · accessoires vitrerie · linge & textile · microfibres · uniformes & vêtements pro.
- **C. Machines** (avec `offerType` = vente | location | les deux) : autolaveuses · monobrosses · aspirateurs pro · injecteurs-extracteurs · nettoyeurs vapeur · nettoyeurs haute pression · machines industrielles.
- **D. Logiciels** : planning · CRM · ERP · devis/facturation · RH · pointage · preuve de passage · qualité · gestion agents · logiciels métier propreté.

**User stories.**
- En tant que société, je filtre les fournisseurs par famille, sous-catégorie, et pour les machines par **achat / location / les deux**.
- En tant que fournisseur de machines, je déclare si je vends, je loue, ou les deux.
- En tant qu'admin, j'évite les catégories ambiguës grâce à une liste fermée.

**Critères d'acceptation.**
- [ ] `Supplier.family` + sous-catégorie sur une liste fermée (plus de texte libre).
- [ ] `offerType` (vente/location/les_deux) disponible et filtrable pour les machines.
- [ ] Migration/normalisation des fournisseurs seedés vers la nouvelle taxonomie.
- [ ] Page annuaire avec filtres famille / sous-catégorie / achat-location.

**Dépendances.** Indépendant (peut démarrer tôt).
**Fichiers.** `prisma/schema.prisma`, `lib/actions/suppliers.ts`, `app/annuaire/fournisseurs/**`, `prisma/seed.ts`, `lib/seeds.ts`.

---

### E4 — Job Board : Publication d'offres vérifiées  · Vague V2 · P0 (sécurité) → P1 (UX)

**Vision.** Seules les sociétés légitimes et vérifiées publient. Publier une offre est un acte de confiance : compte perso vérifié + rattaché à une société de nettoyage + société vérifiée + droit de publication.

**Problème actuel (audit §3).** `createJob` ne fait aucun contrôle serveur (IDOR), et n'exige pas que la société soit vérifiée.

**Périmètre.**
- Réécrire `createJob` : `auth()`, ownership/role via `EntityMember`, `company.verificationStatus === "approved"`, compte perso vérifié.
- Workflow d'offre : draft → pending (modération) → published → archived.
- Gestion d'offre (éditer, dépublier) scopée à l'entité.

**User stories.**
- En tant que recruteur d'une société vérifiée, je publie une offre qui part en modération.
- En tant que société **non** vérifiée, je ne peux pas publier (refus serveur, message clair).
- En tant qu'attaquant, falsifier `companyId` ne me permet pas de publier au nom d'autrui.

**Critères d'acceptation.**
- [ ] Publication impossible sans société `approved` + droit `owner/recruiter`.
- [ ] `createdBy` dérivé de la session, jamais du form.
- [ ] Offre créée en `pending`, visible seulement après modération.

**Dépendances.** E1 (rôles), E2 (guards), E10 (modération/vérif).
**Fichiers.** `lib/actions/jobs.ts`, `app/emploi/nouvelle-offre/page.tsx`, `lib/permissions.ts`.

---

### E5 — Candidature & profil candidat « CV vivant »  · Vague V1 · P0 (sécu) → P1 (richesse)

**Vision.** Le candidat a **un** profil réutilisable, structuré comme un CV optimisé (expériences, compétences, certifications, disponibilités, documents, recommandations). Il postule partout sans ressaisir.

**Problème actuel (audit §4).** Flow de candidature OK et CV réutilisé ✅, mais `applyToJob` n'a pas de garde d'ownership (candidature au nom d'autrui), et le profil est pauvre (pas d'expériences/compétences/certifs structurées).

**Périmètre.**
- Sécuriser `applyToJob` (dériver `candidateProfileId` de la session).
- Modèles : `CandidateExperience`, lien `CandidateSkill`, `Certification` rattachée proprement, multi-documents.
- Flow « commencer sans compte → créer compte → revenir à l'offre » (déjà via `callbackUrl`, à consolider).
- Profil affiché comme un CV.

**User stories.**
- En tant que candidat, je remplis mon profil une fois (CV, expériences, compétences, certifs, dispos) et je postule à N offres sans le refaire.
- En tant que visiteur, je lance une candidature, on me demande de créer un compte, puis je reviens automatiquement à l'offre.
- En tant qu'attaquant, je ne peux pas postuler au nom d'un autre candidat.

**Critères d'acceptation.**
- [ ] `applyToJob` refuse si le profil ciblé n'appartient pas à la session.
- [ ] Profil candidat = expériences + compétences + certifs + dispos + documents.
- [ ] Anti-doublon de candidature conservé.

**Dépendances.** E2 (guards). **Précède** E6, E7.
**Fichiers.** `lib/actions/jobs.ts`, `app/profil/page.tsx`, `app/emploi/[id]/page.tsx`, `prisma/schema.prisma`.

---

### E6 — Visibilité conditionnelle des profils candidats  · Vague V1 · P0

**Vision.** Un profil candidat est **privé par défaut**. Personne ne parcourt librement les CV. Une entreprise n'y accède **que** si le candidat a postulé à **une de ses** offres.

**Problème actuel (audit §5).** `/candidats` est public et liste tous les profils nominativement → fuite RGPD.

**Périmètre.**
- Retirer `/candidats` des routes publiques ; supprimer le listing nominatif (ou le transformer en page « créez votre profil »).
- `canViewCandidate(viewer, candidate)` : `viewer == candidat` ∨ `super_admin` ∨ (`entreprise vérifiée` ∧ `a reçu une candidature de ce candidat`).
- Appliquer ce guard partout où un profil candidat est retourné.

**User stories.**
- En tant que candidat, mon profil n'est pas affiché publiquement.
- En tant que société vérifiée, je vois la fiche complète d'un candidat **uniquement** s'il a postulé chez moi.
- En tant que société, je ne peux pas parcourir la base de candidats.

**Critères d'acceptation.**
- [ ] Accès anonyme à un profil candidat → refusé.
- [ ] Société sans candidature de ce candidat → refusé.
- [ ] Société avec candidature → fiche complète.
- [ ] Super admin → accès total ; candidat → son profil.

**Dépendances.** E5 (candidatures), E2 (guards). **Précède** E7.
**Fichiers.** `auth.config.ts`, `app/candidats/page.tsx`, `lib/actions/candidates.ts`, `lib/permissions.ts`.

---

### E7 — Dashboard entreprise / mini-ATS  · Vague V2 · P0 (vue) → P1 (workflow)

**Vision.** Une entreprise pilote son recrutement : ses offres, et pour chacune la liste des candidatures avec profil résumé, CV, certifications, recommandations, statut et notes internes — **strictement limité à ses propres offres**.

**Problème actuel (audit §6).** La fonctionnalité n'existe pas : `/dashboard/entreprise` n'édite que la fiche société, aucune action ne renvoie les candidatures côté entreprise (seul un compteur).

**Périmètre.**
- `getApplicationsForCompany(companyId, viewer)` scopé aux entités du viewer.
- Page liste candidatures par offre + fiche candidat détaillée (via `canViewCandidate`).
- Workflow de candidature : reçu → vu → entretien → refusé / retenu ; `JobApplication.internalNotes`.

**User stories.**
- En tant que recruteur, je clique sur mon offre et vois tous les candidats.
- En tant que recruteur, j'ouvre une fiche candidat (CV, certifs, recos) et je change son statut, j'ajoute une note.
- En tant que recruteur, je ne vois jamais les candidatures d'une autre société.

**Critères d'acceptation.**
- [ ] Liste candidatures = uniquement les offres de mes entités.
- [ ] Tentative d'accès aux candidatures d'une autre société → refus.
- [ ] Statut + notes internes persistés.

**Dépendances.** E5, E6, E1. **Soutenu par** E10.
**Fichiers.** `lib/actions/jobs.ts`, `app/dashboard/entreprise/**`, `prisma/schema.prisma`, `lib/permissions.ts`.

---

### E8 — Recommandations & confiance entre pairs  · Vague V3 · P2

**Vision.** Le cœur « réseau » : un candidat (ou un dirigeant) demande des recommandations à des pairs déjà sur la plateforme ou invités par email. Les recommandations enrichissent le profil et créent le graphe social.

**Problème actuel (audit §7).** Aucun modèle de recommandation.

**Périmètre.**
- Modèle `Recommendation(candidateUserId, authorUserId?, authorEmail?, authorEntityId?, authorRole, relationship, comment, status, date)`.
- Flow : rechercher un user ClubPropreté **ou** inviter par email → l'auteur rédige → la reco s'affiche selon la visibilité.
- Affichage : auteur (cliquable si profil public), entreprise liée, rôle, relation, commentaire, date, statut.

**User stories.**
- En tant que candidat, je demande une reco à un dirigeant déjà membre, ou j'invite un contact par email.
- En tant qu'auteur, je rédige une reco rattachée à mon entreprise et mon rôle.
- En tant que lecteur autorisé, je vois les recos avec auteur cliquable.

**Critères d'acceptation.**
- [ ] Recherche d'un membre existant + invitation externe fonctionnent.
- [ ] Reco affiche les 7 champs requis.
- [ ] Visibilité de la reco soumise aux règles du profil (E6/E9).

**Dépendances.** E1 (comptes/visibilité), E9 (profils publics cliquables).
**Fichiers.** `prisma/schema.prisma`, `lib/actions/recommendations.ts` (nouveau), `app/profil`, fiche candidat.

---

### E9 — Pages entité & profils publics cliquables  · Vague V3 · P2

**Vision.** Comme LinkedIn : une page entreprise/fournisseur montre son **équipe** ; chaque membre renvoie vers son **profil personnel public** s'il l'a rendu visible.

**Problème actuel (audit §8).** Pas d'équipe (ownerUserId unique), pas de page profil public `/membres/[id]`, pas de champ visibilité.

**Périmètre.**
- Page publique `/membres/[userId]` respectant `UserProfile.visibility`.
- Affichage des `EntityMember` sur les pages société/fournisseur/organisme.
- Profil membre cliquable seulement si public.

**User stories.**
- En tant que visiteur, sur une page fournisseur, je vois l'équipe et clique sur le CEO si son profil est public.
- En tant que membre, je contrôle si mon profil est listé/cliquable.

**Critères d'acceptation.**
- [ ] Page entité liste les membres actifs.
- [ ] Lien actif si `visibility = public`, inactif sinon.
- [ ] Accès direct à un profil privé par URL → refusé.

**Dépendances.** E1 (EntityMember + visibility).
**Fichiers.** `app/membres/[id]/page.tsx` (nouveau), `app/annuaire/societes/[id]`, `app/annuaire/fournisseurs/[id]`, `prisma/schema.prisma`.

---

### E10 — Vérification, modération & badges  · Vague V2 · P1 (transverse)

**Vision.** La confiance est explicite : comptes et entités passent par une vérification ; les badges « vérifié » conditionnent l'accès aux actions sensibles (publier, accéder aux candidats).

**État actuel.** Statuts `verificationStatus` présents sur la plupart des modèles + back-office admin existant ; `Badge`/`EntityBadge` modélisés mais peu exploités. À industrialiser et **relier aux permissions** (E4, E6, E7).

**Périmètre.**
- Workflow de vérification compte perso + entité (draft → pending → approved/rejected).
- Back-office : file de modération offres / fiches / adhésions.
- Badges « vérifié » affichés et **utilisés comme gate** dans les guards.

**User stories.**
- En tant qu'admin, je valide une société, ce qui débloque sa capacité à publier.
- En tant que super admin, j'ai accès à tous les profils (y compris candidats).

**Critères d'acceptation.**
- [ ] Une entité non `approved` ne peut pas publier / accéder aux candidats.
- [ ] File de modération opérationnelle pour les nouveaux contenus.

**Dépendances.** Soutient E4, E6, E7, E9.
**Fichiers.** `lib/actions/admin.ts`, `app/admin/**`, `lib/permissions.ts`.

---

### E11 — Sociétés & sous-traitance  · Vague V4 · P2

**Vision.** Au-delà du recrutement salarié : un marché B2B où sociétés et indépendants échangent des missions de sous-traitance, réservé aux membres validés.

**État actuel.** `SubcontractingMission` / `SubcontractingApplication` + `lib/permissions.ts:canPublishMission/canAccessSubcontracting` déjà présents (basés sur `association_member`). À aligner sur le nouveau RBAC (E1/E2) et la vérification (E10).

**Périmètre.** Publication de missions par entités vérifiées ; candidatures d'indépendants/sociétés ; visibilité réservée aux membres ; cohérence des guards serveur.

**Critères d'acceptation.**
- [ ] Publication/consultation des missions alignées sur `EntityMember` + vérification.
- [ ] Guards serveur sur les actions de sous-traitance (comme E2).

**Dépendances.** E1, E2, E10.
**Fichiers.** `lib/actions/subcontracting.ts`, `app/sous-traitance/**`, `lib/permissions.ts`.

---

### E12 — Formations & organismes  · Vague V4 · P2

**Vision.** Référencer l'offre de formation métier (organismes **et** dirigeants formateurs) et générer des demandes qualifiées.

**État actuel.** `TrainingOrganization`, `Training`, `TrainingSession` + pages `/formations` présents. À relier au compte perso/entité (un dirigeant publie une formation au nom de sa société) et à la vérification.

**Périmètre.** Création de formation par entité (organisme ou société) ; sessions ; demandes de contact ; modération.

**Critères d'acceptation.**
- [ ] Une formation est rattachée à une entité dont l'auteur est membre autorisé.
- [ ] Demandes de formation tracées (leads).

**Dépendances.** E1, E10.
**Fichiers.** `lib/actions/trainings.ts`, `app/formations/**`.

---

### E13 — Contenus, SEO & ressources  · Vague V4 · P3

**Vision.** Alimenter l'acquisition par du contenu métier (guides, articles), avec workflow éditorial.

**État actuel.** `Article` + `/ressources` + `robots.ts`/`sitemap.ts` présents. À compléter (workflow brouillon→revue→publication, rôles auteur).

**Périmètre.** Édition d'articles, modération, SEO, catégories.
**Critères d'acceptation.** [ ] Workflow éditorial complet ; [ ] SEO (sitemap, métadonnées) à jour.
**Dépendances.** E2 (rôle auteur). **Fichiers.** `lib/actions/articles.ts`, `app/ressources/**`.

---

### E14 — Notifications, emails & RGPD / production-readiness  · Vague V4 · P2→P3

**Vision.** Une plateforme fiable et conforme : notifications transactionnelles réelles, conformité RGPD (données candidats sensibles), passage en production.

**État actuel.** `lib/email.ts`, `lib/rate-limit.ts`, `lib/ip.ts`, pages légales présents ; SQLite en dev (à migrer Postgres) ; emails à fiabiliser.

**Périmètre.**
- Notifications : nouvelle candidature, changement de statut, invitation à rejoindre une entité, demande de reco.
- RGPD : minimisation des données candidats exposées (lié à E6), droit à l'effacement (`deletedAt` déjà présent), consentements.
- Prod : migration Postgres, durcissement rate-limit, monitoring.

**Critères d'acceptation.**
- [ ] Emails transactionnels clés envoyés et testés.
- [ ] Aucune donnée personnelle candidat exposée hors permission (E6).
- [ ] Base prod (Postgres) + variables d'env gérées.

**Dépendances.** Transverse. **Fichiers.** `lib/email.ts`, `lib/rate-limit.ts`, `prisma/schema.prisma`, config déploiement.

---

## 4. Récapitulatif priorisé

| Epic | Titre | Vague | Priorité | Bloque |
|------|-------|-------|----------|--------|
| E1 | Identité & comptes multi-entités | V1 | P0/P1 | E2,E4,E7,E9 |
| E2 | RBAC & guards serveur | V1 | P0 | tout flux mutant |
| E5 | Candidature & profil candidat | V1 | P0/P1 | E6,E7 |
| E6 | Visibilité candidats | V1 | P0 | E7 |
| E3 | Taxonomie fournisseurs | V2 | P1 | — |
| E4 | Publication d'offres vérifiées | V2 | P0/P1 | — |
| E7 | Dashboard entreprise / ATS | V2 | P0/P1 | — |
| E10 | Vérification & modération | V2 | P1 | E4,E6,E7,E9 |
| E8 | Recommandations | V3 | P2 | — |
| E9 | Pages entité & profils publics | V3 | P2 | E8 |
| E11 | Sous-traitance | V4 | P2 | — |
| E12 | Formations | V4 | P2 | — |
| E13 | Contenus & SEO | V4 | P3 | — |
| E14 | Notifications & RGPD/prod | V4 | P2/P3 | — |

**Chemin critique recommandé :** E1 → E2 → (E5 → E6 → E7) en parallèle de E3/E4, avec E10 en soutien, puis E8/E9 pour la dimension réseau social.
