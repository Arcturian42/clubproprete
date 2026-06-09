# Audit Architecture Produit & RBAC — ClubPropreté.com

**Date :** 9 juin 2026
**Cadre :** Vérification de conformité du code à la logique produit « réseau professionnel métier »
**Principe directeur audité :** `compte personnel → entités liées → permissions → visibilité contrôlée`
**Base :** commit `391ad07` + working tree actuel

> ⚠️ Ce document est un **audit** : aucune modification de code n'a été faite. Les corrections sont proposées, pas appliquées.

---

## 0. Synthèse exécutive

Le socle technique est sain (Next.js App Router, Auth.js v5, Prisma, Server Actions, Zod, rate-limit). **Mais l'architecture actuelle n'est pas encore un réseau professionnel ; c'est une suite d'annuaires.** Le modèle « compte personnel comme base, entités rattachées, permissions par rôle dans l'entité » est **partiellement** en place côté données et **insuffisamment** appliqué côté permissions/visibilité.

**Verdict global par exigence :**

| # | Exigence | Statut |
|---|----------|--------|
| 1 | Modèle utilisateur (compte perso + multi-entités + rôles) | 🟠 Partiel |
| 2 | Taxonomie fournisseurs (Consommables/Matériel/Machines/Logiciels + achat/location) | 🔴 Non conforme |
| 3 | Publication d'offre (chaîne de vérification) | 🔴 Non conforme (faille) |
| 4 | Candidature (compte candidat, profil réutilisable) | 🟠 Partiel |
| 5 | Visibilité des profils candidats (privée) | 🔴 Non conforme (fuite de données) |
| 6 | Dashboard entreprise (voir candidatures de SES offres) | 🔴 Manquant |
| 7 | Recommandations candidats | 🔴 Manquant |
| 8 | Pages entité avec membres + profil public cliquable | 🔴 Manquant |
| 9 | Guards serveur (pas seulement UI) | 🔴 Non conforme (failles) |

**3 points P0 bloquants** : publication d'offre sans guard serveur (#3/#9), annuaire candidats public (#5), absence de vue candidatures entreprise (#6).

---

## 1. Modèle utilisateur — 🟠 Partiel

### Conforme
- ✅ **Chaque inscription crée bien un compte personnel.** `registerUser` (`lib/actions/auth.ts:57`) crée toujours un `User` + un `UserProfile` dans une transaction, puis crée l'entité associée. Le compte personnel est bien la racine.
- ✅ Le `User` porte l'identité personnelle (nom, prénom, bio, avatar, photos, ville) — distincte de l'entité.
- ✅ Relations 1→N présentes : `User.companies[]`, `User.suppliers[]`, `User.trainingOrganizations[]` (`prisma/schema.prisma:34-38`). Un même compte **peut** donc techniquement posséder plusieurs sociétés/fournisseurs/organismes.

### Partiellement conforme / Problèmes
- 🟠 **`mainRole` est un `String` unique** (`schema.prisma:24`). Le rôle est traité comme mono-valué et sert de proxy de permission partout (`auth.config.ts`, `nouvelle-offre`, `emploi/[id]`). Or un même humain peut être à la fois CEO d'une société **et** candidat **et** formateur. Le modèle force un choix unique à l'inscription (`signupSchema.role`, `auth.ts:19`). → Le rôle **remplace** de fait le compte personnel comme unité de permission, ce qui contredit le principe produit.
- 🟠 **`candidateProfile` et `independentProfile` sont en relation 1→1** (`@unique` sur `userId`, `schema.prisma:213,182`) alors que companies/suppliers sont 1→N. Asymétrie non justifiée : un CEO ne peut pas avoir en plus un profil candidat « propre ».
- 🔴 **Aucune table de membership entité↔utilisateur avec rôle.** Le lien est uniquement `ownerUserId` (un seul propriétaire) sur `Company`/`Supplier`/`TrainingOrganization`. Il n'existe pas de notion « X est admin/membre/recruteur de l'entité Y ». Donc :
  - impossible qu'un utilisateur **rejoigne** une entité existante (seulement la créer) ;
  - impossible d'avoir plusieurs personnes rattachées à une page entreprise (cf. #8) ;
  - impossible de gérer des droits différenciés (publier une offre vs. éditer la fiche).
  - ⚠️ `AssociationMembership` (`schema.prisma:365`) ressemble à une table de liaison mais ne sert qu'au workflow d'adhésion à l'association — ce n'est **pas** un système de rôles d'entité.

### Correctif proposé (P1)
Introduire un vrai modèle de rôles d'entité :
```prisma
model EntityMember {
  id         String   @id @default(cuid())
  userId     String
  entityType String   // "company" | "supplier" | "training_organization"
  entityId   String
  role       String   // "owner" | "admin" | "recruiter" | "member"
  status     String   @default("active")
  invitedBy  String?
  createdAt  DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, entityType, entityId])
}
```
Migrer les `ownerUserId` existants en `EntityMember(role="owner")`. Dériver les permissions de `EntityMember`, plus de `mainRole`.

**Fichiers concernés :** `prisma/schema.prisma`, `lib/actions/auth.ts`, `auth.ts`, `auth.config.ts`, `lib/permissions.ts`.

---

## 2. Annuaire fournisseurs — 🔴 Non conforme

### Constat
La catégorie fournisseur est un **`String` libre** (`Supplier.category`, `schema.prisma:150`). Aucune taxonomie, aucune contrainte, aucun enum. Les valeurs réelles (seed + inscription) sont incohérentes et confuses, exactement le problème signalé :
- `prisma/seed.ts` : `"Produits d'entretien ecologiques"`, `"Equipements de protection individuelle"`, `"Materiel et machines de nettoyage"`, `"Linge et textile"`, `"EPI"`, `"Machines"`, `"Textile"`, `"Services aux entreprises"`…
- `lib/actions/auth.ts:99` : valeur par défaut codée en dur `"Fournisseur de matériel"`.
- La page (`app/annuaire/fournisseurs/page.tsx:30`) liste « materiel, logiciels, EPI » dans la description — vocabulaire flou, mélange machine/matériel, **« EPI » non explicité**, **aucune notion de location**.

**Manquants critiques :**
- ❌ Pas de structure à 4 familles (Consommables / Matériel / Machines / Logiciels).
- ❌ Pas de sous-catégories.
- ❌ Pas de distinction **machine à l'achat vs. à la location**.
- ❌ Pas de notion **vendeur / loueur / les deux**.

### Correctif proposé (P1) — taxonomie cible
Remplacer le `String` libre par une taxonomie structurée (idéalement table `SupplierCategory` + champ `offerType` sur le fournisseur ou sur `SupplierService`).

```
A. CONSOMMABLES
   produits_entretien · produits_desinfectants · papier_essuie_mains_sanitaire ·
   sacs_poubelle · produits_pour_machines · recharges · produits_ecologiques · produits_specialises
B. MATERIEL
   raclettes · balais · franges · seaux · chariots_menage · pulverisateurs ·
   accessoires_vitrerie · linge_textile · microfibres · uniformes_vetements_pro
C. MACHINES   (avec offerType: vente | location | les_deux)
   autolaveuses · monobrosses · aspirateurs_pro · injecteurs_extracteurs ·
   nettoyeurs_vapeur · nettoyeurs_haute_pression · machines_industrielles
D. LOGICIELS
   planning · crm · erp · devis_facturation · rh · pointage ·
   preuve_de_passage · qualite · gestion_agents · logiciel_metier_proprete
```

Modèle suggéré :
```prisma
model Supplier {
  // ...
  family      String   // "consommables" | "materiel" | "machines" | "logiciels"
  offerType   String?  // machines uniquement : "vente" | "location" | "les_deux"
}
model SupplierService {
  category    String   // sous-catégorie de la liste ci-dessus
  offerType   String?  // "vente" | "location" si pertinent
}
```
Filtres annuaire à ajouter : famille, sous-catégorie, et pour Machines un filtre **Achat / Location / Les deux**.

**Fichiers concernés :** `prisma/schema.prisma`, `lib/actions/suppliers.ts`, `app/annuaire/fournisseurs/page.tsx`, `app/annuaire/fournisseurs/[id]/page.tsx`, formulaire de création fournisseur, `prisma/seed.ts`, `lib/seeds.ts`.

---

## 3. Job Board — Publication d'offre — 🔴 Non conforme (FAILLE P0)

### Règle attendue
Publier une offre exige : compte perso **vérifié** + rattaché à une **société de nettoyage** + société **vérifiée** + **droit de publication** sur cette société.

### Constat
- 🔴 **`createJob` (`lib/actions/jobs.ts:19`) n'effectue AUCUN contrôle serveur.** Il lit `companyId` et `createdBy` **depuis le `FormData` envoyé par le client** et crée l'offre directement. Aucune vérification que :
  - l'appelant est authentifié (`auth()` n'est jamais appelé) ;
  - `createdBy` == utilisateur de session ;
  - l'utilisateur possède bien `companyId` ;
  - le compte perso est vérifié ;
  - la société est vérifiée.
  → **N'importe qui peut appeler ce Server Action avec n'importe quel `companyId`/`createdBy`** et créer une offre au nom de n'importe quelle société. C'est une faille d'autorisation directe (IDOR).
- 🟠 Les seuls garde-fous sont **côté UI/middleware** : `app/emploi/nouvelle-offre/page.tsx:45-60` (redirection client) et `auth.config.ts:42-50` (middleware sur la route). Ces deux contrôles protègent la **page**, pas le **Server Action**, qui est invocable indépendamment. « Il ne suffit pas de masquer les boutons » — ici c'est exactement le défaut.
- 🟠 Le contrôle de rôle vérifie `company_owner | verified_company | admin | super_admin` mais **n'exige pas que la société soit `verificationStatus === "approved"`**. Un `company_owner` non vérifié passe.
- ✅ Atténuation partielle : l'offre est créée en `status: "pending"` (`jobs.ts:41`) → modération avant visibilité publique. La faille reste réelle (pollution, usurpation, charge de modération).

### Correctif proposé (P0)
Réécrire `createJob` pour qu'il :
1. appelle `auth()` et rejette si non connecté ;
2. **ignore** `createdBy` du form et utilise `session.user.id` ;
3. charge la société et vérifie `company.ownerUserId === session.user.id` (ou `EntityMember` avec droit `recruiter`/`owner`) ;
4. vérifie `company.verificationStatus === "approved"` ;
5. vérifie la vérification du compte perso (`UserProfile.verificationStatus === "approved"` / `User.emailVerified`).

**Fichiers concernés :** `lib/actions/jobs.ts`, `app/emploi/nouvelle-offre/page.tsx`, `lib/permissions.ts` (ajouter `canPublishJob(user, company)`).

---

## 4. Job Board — Candidature — 🟠 Partiel

### Conforme
- ✅ Le flow exige un **profil candidat** : `handleApply` (`app/emploi/[id]/page.tsx:43`) appelle `auth()`, redirige les non-connectés vers `/connexion?callbackUrl=...`, et les non-candidats vers `/inscription?role=candidate_profile`.
- ✅ **Profil réutilisable** : la candidature ne resaisit pas le CV ; elle référence `candidateProfileId` (`jobs.ts:137`). Le CV vit sur `CandidateProfile.cvUrl`. Postuler à plusieurs offres ne redemande pas les infos. ✔ conforme à « postuler sans ressaisir ».
- ✅ Anti-doublon : `applyToJob` bloque une 2ᵉ candidature (`jobs.ts:129`).
- ✅ « Commencer le flow sans compte puis devoir en créer un » : géré via `callbackUrl`.

### Problèmes
- 🟠 **`applyToJob` (`jobs.ts:109`) est lui aussi sans garde serveur propre** : il fait confiance au `candidateProfileId` du `FormData` et ne vérifie pas que ce profil appartient à l'utilisateur de session. La page `handleApply` injecte le bon id, mais le Server Action exporté reste appelable directement avec l'id d'un autre candidat → un tiers peut créer une candidature au nom d'autrui (intégrité). **P1.**
- 🟠 **Profil candidat incomplet vs. spec.** Champs attendus : CV ✅, expériences ❌ (pas de table), compétences ❌ (table `Skill` existe mais non reliée à `CandidateProfile`), certifications ⚠️ (`Certification` générique par `ownerType/ownerId`, pas de lien fort ni d'UI), disponibilités ✅ (`availabilityDate`), documents ⚠️ (seulement `cvUrl`), recommandations ❌ (cf. #7). Le profil n'est pas « optimisé comme un CV » (pas d'historique de missions structuré).

### Correctif proposé (P1)
- Sécuriser `applyToJob` (dériver `candidateProfileId` de la session).
- Ajouter `CandidateExperience`, relier `CandidateSkill`, rattacher `Certification` proprement, support multi-documents.

**Fichiers concernés :** `lib/actions/jobs.ts`, `app/profil/page.tsx`, `prisma/schema.prisma`.

---

## 5. Visibilité des profils candidats — 🔴 Non conforme (FUITE P0)

### Règle attendue
Profils candidats **privés**. Visibles uniquement par : le candidat lui-même · les super admins · une entreprise vérifiée **seulement** si le candidat a postulé à une de ses offres. **Aucun parcours libre**, même pour une société vérifiée.

### Constat
- 🔴 **Annuaire candidats entièrement public.** La route `/candidats` est listée comme publique dans `auth.config.ts:58` (`path.startsWith("/candidats")`). La page `app/candidats/page.tsx` appelle `getPublishedCandidates` qui **retourne TOUS les `CandidateProfile`** (`lib/actions/candidates.ts:5`, filtre `deletedAt: null` uniquement) avec **nom, prénom, ville, expérience, disponibilité, contrats recherchés** — affichés à tout visiteur anonyme (`candidats/page.tsx:71-87`).
  → Violation directe de la règle de confidentialité **et** risque RGPD (données personnelles de demandeurs d'emploi exposées publiquement, recherche full-text incluse).
- 🔴 **Aucun mécanisme « entreprise ↔ candidat via candidature »** n'existe pour ouvrir l'accès de façon contrôlée (cf. #6, inexistant).
- 🔴 Aucun champ de visibilité sur le profil ; aucune fonction `canViewCandidate(viewer, candidate)`.

### Correctif proposé (P0)
1. **Retirer `/candidats` des routes publiques** (`auth.config.ts`).
2. Soit supprimer l'annuaire public, soit le transformer en page « créez votre profil candidat » sans listing nominatif.
3. Créer `getCandidateProfileForViewer(candidateId, viewer)` appliquant la règle : `viewer === candidat` ∨ `super_admin` ∨ (`entreprise vérifiée` ∧ `candidat a postulé à une offre de cette entreprise`).
4. Appliquer ce guard dans **toute** action qui retourne un profil candidat.

**Fichiers concernés :** `auth.config.ts`, `app/candidats/page.tsx`, `lib/actions/candidates.ts`, nouveau `lib/permissions.ts:canViewCandidate`.

---

## 6. Dashboard entreprise — voir les candidatures — 🔴 Manquant

### Règle attendue
Une entreprise vérifiée voit **ses** offres, et pour chacune : liste des candidatures, profil résumé, CV, certifications, recommandations, statut, notes internes. **Uniquement ses propres offres.**

### Constat
- 🔴 **La fonctionnalité n'existe pas.** `app/dashboard/entreprise/page.tsx` est **uniquement l'édition de la fiche société** (logo, services, photos, contacts). Aucune liste de candidatures, aucun accès aux candidats.
- 🔴 **Aucun Server Action** ne retourne les candidatures d'une société. `prisma.jobApplication.findMany` n'est utilisé que pour le **candidat** (`getCandidateApplications`, `jobs.ts:169`). Côté entreprise, seul un **compteur** est exposé (`_count.applications`, `emploi/page.tsx`).
- 🔴 Conséquence : un recruteur **ne peut pas** consulter qui a postulé. Le cœur du job board est absent.
- ❌ Pas de `status` workflow de candidature exploité (le champ existe : `submitted`…), pas de **notes internes** (champ inexistant sur `JobApplication`).

### Correctif proposé (P0/P1)
- **P0 (débloque le produit)** : `getApplicationsForCompany(companyId, viewer)` scopant strictement `job.companyId ∈ entités du viewer`, + page `/dashboard/entreprise/offres/[jobId]/candidatures`.
- Réutiliser `canViewCandidate` (#5) pour la fiche détaillée.
- **P1** : ajouter `JobApplication.internalNotes`, exploiter `status` (vu/entretien/refusé), relier certifications & recommandations.

**Fichiers concernés :** `lib/actions/jobs.ts` (nouvelle action scopée), `app/dashboard/entreprise/...`, `prisma/schema.prisma` (notes), `lib/permissions.ts`.

---

## 7. Recommandations candidats — 🔴 Manquant

### Règle attendue
Demander des recommandations ; chercher un utilisateur existant **ou** inviter par email ; recevoir et afficher selon la visibilité. Une reco affiche : auteur, entreprise liée, rôle de l'auteur, relation professionnelle, commentaire, date, statut.

### Constat
- 🔴 **Aucun modèle `Recommendation`** dans le schéma. Le seul « recommend » du code est :
  - `Training.recommendedBy` (texte libre, sans rapport) ;
  - `components/suppliers/supplier-advisor.tsx` (moteur de reco **produit**, sans rapport).
- 🔴 Aucune notion de « profil cliquable d'un chef d'entreprise qui recommande », aucun graphe social entre comptes persos.

### Correctif proposé (P2, après P0)
```prisma
model Recommendation {
  id              String   @id @default(cuid())
  candidateUserId String          // bénéficiaire
  authorUserId    String?         // si auteur a un compte
  authorEmail     String?         // si invitation externe
  authorEntityId  String?         // entreprise liée
  authorRole      String?         // rôle de l'auteur
  relationship    String?         // relation professionnelle
  comment         String?
  status          String   @default("pending") // pending|published|declined
  createdAt       DateTime @default(now())
}
```
+ flow d'invitation (recherche utilisateur existant / email), + affichage soumis à `canViewCandidate`.

**Fichiers concernés :** `prisma/schema.prisma`, nouveau `lib/actions/recommendations.ts`, `app/profil`, fiche candidat.

---

## 8. Pages entreprises / fournisseurs — membres & profil public — 🔴 Manquant

### Règle attendue
La page entité affiche les personnes liées (équipe) ; le profil perso du membre est **cliquable** si sa visibilité est publique.

### Constat
- 🔴 **Pas de notion d'équipe** : `ownerUserId` unique, pas de `EntityMember` (cf. #1). Les pages `app/annuaire/societes/[id]` et `app/annuaire/fournisseurs/[id]` n'affichent **aucun membre**.
- 🔴 **Pas de page profil public d'un utilisateur.** Il n'existe aucune route `/u/[id]` / `/membres/[id]`. `app/profil/page.tsx` est le **profil privé du user connecté**. Donc « profil du CEO cliquable » est impossible aujourd'hui.
- 🔴 `UserProfile` n'a **pas de champ de visibilité** (`public/private`). Impossible d'appliquer « cliquable si visibilité publique ».

### Correctif proposé (P2)
- Ajouter `UserProfile.visibility` (`public|private`, défaut `private`).
- Créer une page publique `/membres/[userId]` respectant la visibilité.
- Sur les pages entité, lister `EntityMember` (statut visible) avec lien vers le profil public quand `visibility === "public"`.

**Fichiers concernés :** `prisma/schema.prisma`, `app/membres/[id]/page.tsx` (nouveau), `app/annuaire/societes/[id]`, `app/annuaire/fournisseurs/[id]`.

---

## 9. Sécurité & permissions — 🔴 Non conforme (défaut systémique)

### Constat structurel
Le projet protège les **routes** (middleware `auth.config.ts:authorized`) et l'**UI** (redirections `useEffect`), mais **pas les Server Actions**, qui sont des points d'entrée HTTP à part entière. Or la plupart des mutations sensibles sont des Server Actions sans `auth()` :

| Server Action | Guard serveur ? | Risque |
|---------------|-----------------|--------|
| `createJob` (`jobs.ts:19`) | ❌ aucun | Création d'offre au nom d'autrui (IDOR) — **P0** |
| `applyToJob` (`jobs.ts:109`) | ❌ aucun | Candidature au nom d'autrui — **P1** |
| `getPublishedCandidates` (`candidates.ts:5`) | ❌ public | Fuite profils candidats — **P0** |
| `softDeleteJob` (`jobs.ts:177`) | ❌ aucun | Suppression d'offre arbitraire — **P1** |
| `updateCompanyProfile` (`actions/companies.ts`) | à vérifier | Édition fiche d'autrui si non scopé — **P1** |

> Le pattern correct est déjà présent **une fois** : `handleApply` (`emploi/[id]/page.tsx`) appelle `auth()` côté serveur. Il faut le généraliser à **toutes** les actions, pas seulement aux wrappers de page.

### Matrice de tests par rôle attendue (à implémenter en e2e + tests d'action)
| Acteur | Publier offre | Voir candidatures (siennes / autres) | Voir profil candidat | Annuaire candidats | Admin |
|--------|:---:|:---:|:---:|:---:|:---:|
| Non connecté | ❌ | ❌ / ❌ | ❌ | ❌ | ❌ |
| Candidat | ❌ | ❌ / ❌ | soi-même ✅ | ❌ | ❌ |
| Société non vérifiée | ❌ | ❌ / ❌ | ❌ | ❌ | ❌ |
| Société vérifiée | ✅ | ✅ / ❌ | si a postulé chez elle ✅ | ❌ (pas de parcours libre) | ❌ |
| Fournisseur | ❌ | ❌ / ❌ | ❌ | ❌ | ❌ |
| Organisme | ❌ | ❌ / ❌ | ❌ | ❌ | ❌ |
| Admin / Super admin | (modère) | — | ✅ | ✅ | ✅ |

Aujourd'hui, plusieurs cases ❌ sont en réalité ✅ (annuaire candidats public ; offre publiable sans vérification ; profils candidats lisibles par tous).

### Correctif (P0)
Créer un helper unique `requireUser()` / `requireEntityRole(entityId, role)` et l'appeler **en tête de chaque Server Action mutant ou exposant des données**. Ne jamais faire confiance aux ids passés dans `FormData`.

---

## 10. Plan de correction priorisé

### 🔴 P0 — Bloquant (sécurité / cœur produit)
1. **Sécuriser `createJob`** : `auth()`, ownership société, société + compte vérifiés (#3, #9).
2. **Fermer l'annuaire candidats public** : retirer `/candidats` des routes publiques, supprimer le listing nominatif, guard `canViewCandidate` (#5).
3. **Vue candidatures entreprise** : action scopée `getApplicationsForCompany` + page dédiée (#6).
4. **Helper d'autorisation serveur** appliqué à toutes les Server Actions (#9).

### 🟠 P1 — Important (intégrité & métier)
5. Sécuriser `applyToJob`, `softDeleteJob`, `updateCompanyProfile` (ownership via session) (#4, #9).
6. **Taxonomie fournisseurs** 4 familles + sous-catégories + achat/location + vendeur/loueur (#2).
7. **Modèle `EntityMember`** (rôles d'entité, multi-membres, rejoindre une entité) ; dériver les permissions de ce modèle plutôt que de `mainRole` (#1).
8. Profil candidat complet (expériences, compétences, certifications, documents) (#4).

### 🟡 P2 — Structurant (réseau social)
9. **Recommandations** (modèle + flow invitation + visibilité) (#7).
10. **Profils publics `/membres/[id]`** + champ `UserProfile.visibility` + équipe sur pages entité (#8).
11. Autoriser un compte perso à porter plusieurs profils (candidat + dirigeant) sans conflit de `mainRole` (#1).

---

## 11. Checklist QA par flow utilisateur

### Inscription / compte personnel
- [ ] Toute inscription crée `User` + `UserProfile` (✅ déjà le cas).
- [ ] Un user peut créer une 2ᵉ entité d'un autre type sans casser `mainRole`.
- [ ] Un user peut rejoindre une entité existante (après `EntityMember`).

### Publication d'offre
- [ ] Non connecté → refus **serveur** (pas juste redirection UI).
- [ ] `company_owner` non vérifié → refus.
- [ ] Société non vérifiée → refus.
- [ ] User non rattaché à la société ciblée → refus (IDOR).
- [ ] `createdBy`/`companyId` falsifiés dans le form → ignorés / refus.
- [ ] Société vérifiée + droit publication → succès, offre en modération.

### Candidature
- [ ] Visiteur lance le flow → invité à créer un compte, revient à l'offre (callbackUrl).
- [ ] Non-candidat → redirigé vers création profil candidat.
- [ ] Candidat sans profil complété → bloqué proprement.
- [ ] `candidateProfileId` falsifié → refus (ownership session).
- [ ] Double candidature → bloquée.
- [ ] Postuler à une 2ᵉ offre ne redemande pas le CV.

### Visibilité profil candidat
- [ ] Anonyme sur `/candidats` → pas de listing nominatif.
- [ ] Société vérifiée **sans** candidature de ce candidat → accès refusé.
- [ ] Société vérifiée **avec** candidature → fiche complète (CV, certifs, recos).
- [ ] Candidat → voit son propre profil.
- [ ] Super admin → accès total.

### Dashboard entreprise
- [ ] Voit uniquement SES offres.
- [ ] Voit les candidatures de SES offres uniquement.
- [ ] Tentative d'accès aux candidatures d'une autre société → refus.
- [ ] Statut de candidature et notes internes modifiables.

### Recommandations
- [ ] Recherche d'un user existant ClubPropreté.
- [ ] Invitation par email d'un non-membre.
- [ ] Reco affichée avec auteur/entreprise/rôle/relation/commentaire/date/statut.
- [ ] Reco respectant la visibilité du profil.

### Pages entité & profils publics
- [ ] Page société/fournisseur liste les membres.
- [ ] Profil membre cliquable si `visibility = public`, sinon non.
- [ ] Profil privé non accessible en direct URL.

### Sécurité transverse
- [ ] Chaque Server Action mutant appelle `auth()`/`requireUser()`.
- [ ] Aucun id de ressource pris tel quel depuis `FormData` sans contrôle d'ownership.
- [ ] e2e couvrant les 8 rôles de la matrice §9.

---

*Fin de l'audit. Aucune modification de code n'a été effectuée ; les correctifs ci-dessus sont à valider avant implémentation.*
