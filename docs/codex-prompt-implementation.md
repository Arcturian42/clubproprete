# PROMPT CODEX — Implémentation ClubPropreté (réseau professionnel métier)

> Copie-colle tout ce qui suit dans Codex, à la racine du repo `ClubPropreté`.

---

## 0. RÔLE & MISSION

Tu es un ingénieur full-stack senior + architecte SaaS + expert RBAC/sécurité. Tu travailles sur **ClubPropreté.com**, une plateforme B2B pour les professionnels du nettoyage en France.

Ta mission : transformer le code actuel (« suite d'annuaires ») en **réseau professionnel métier** (« LinkedIn du nettoyage »), en suivant un principe architectural **non négociable** :

```
compte personnel  →  entités rattachées  →  rôles & permissions  →  visibilité contrôlée
```

Deux documents font autorité et doivent être lus AVANT de coder :
- `docs/audit-architecture-produit-rbac-2026-06-09.md` (constats + fichiers concernés)
- `docs/epics-roadmap-2026-06-09.md` (vision + epics E1→E14 + critères d'acceptation)

En cas de doute sur le « quoi », ces docs priment. Tu décides du « comment ».

---

## 1. STACK & ORIENTATION REPO

- **Next.js 15 (App Router)** · TypeScript strict · **Prisma 6** (SQLite en dev) · **Auth.js v5 (next-auth beta)** · Zod · TailwindCSS · bcryptjs · Playwright (e2e).
- Fichiers clés :
  - Schéma : `prisma/schema.prisma` · seed : `prisma/seed.ts`, `lib/seeds.ts`
  - Auth : `auth.ts`, `auth.config.ts`, `middleware.ts`, `types/next-auth.d.ts`
  - Permissions : `lib/permissions.ts` · types : `lib/types.ts`
  - Server Actions : `lib/actions/*.ts` (`auth.ts`, `jobs.ts`, `candidates.ts`, `companies.ts`, `suppliers.ts`, `subcontracting.ts`, `trainings.ts`, `admin.ts`, …)
  - Pages : `app/**` (job board `app/emploi`, fournisseurs `app/annuaire/fournisseurs`, dashboards `app/dashboard`, profil `app/profil`)
  - API : `app/api/*` (`user-company`, `upload`, `admin/export`)
  - Tests : `e2e/*.spec.ts`, `playwright.config.ts`

Commande d'inspection initiale obligatoire :
```bash
cat prisma/schema.prisma lib/permissions.ts auth.config.ts
ls lib/actions app/dashboard
npx prisma validate
```

---

## 2. RÈGLES D'INGÉNIERIE (À RESPECTER SUR CHAQUE TÂCHE)

1. **Sécurité serveur d'abord.** Toute Server Action qui mute ou expose des données DOIT commencer par une vérification d'auth/permission côté serveur (`auth()` / helper). Ne JAMAIS faire confiance à un id reçu via `FormData`/arguments client (companyId, createdBy, candidateProfileId…). Dériver l'ownership de la session.
2. **Masquer un bouton n'est pas une protection.** Le middleware et l'UI ne suffisent jamais : le guard doit être dans l'action/route.
3. **Pas de régression.** Ne casse pas les flux existants (inscription, login, dashboards, annuaires). Lis le code avant de modifier.
4. **Migrations propres.** Toute évolution de `schema.prisma` → `npx prisma migrate dev --name <desc>` + mise à jour du seed + script de backfill pour les données existantes (ex. `ownerUserId` → `EntityMember`).
5. **TypeScript strict, zéro `any` non justifié.** Valider les entrées avec Zod.
6. **Tests obligatoires.** Chaque tâche P0/P1 ajoute/maj des tests (action unit ou e2e Playwright) couvrant cas passant + cas refusé.
7. **Petits commits atomiques** par tâche, message clair : `feat(rbac): ...`, `fix(security): ...`. Termine chaque commit par :
   `Co-Authored-By: Codex <noreply@openai.com>`
8. **Explique avant de changer.** Pour chaque tâche : résume en 2-3 lignes ce que tu vas modifier et pourquoi, puis applique.
9. **Définition de « terminé » par tâche :** code + types OK (`npx tsc --noEmit`) + lint OK + migration appliquée + tests verts + critères d'acceptation cochés.

Commandes de vérification à lancer après chaque tâche :
```bash
npx tsc --noEmit
npx prisma validate
npm run lint --if-present
npx playwright test --reporter=line   # si serveur de test dispo
```

---

## 3. PLAN D'EXÉCUTION (ORDRE STRICT — NE PAS SAUTER UNE VAGUE)

Travaille **vague par vague**. À la fin de chaque vague : récapitule les changements, lance les vérifs, et NE commence la vague suivante qu'une fois tout vert. Demande validation humaine entre les vagues si un choix de modèle est ambigu.

---

### 🔴 VAGUE 1 — SÉCURITÉ & SOCLE (P0, bloquant)

#### Tâche 1.1 — Helper de permissions serveur (Epic E2)
- Créer dans `lib/permissions.ts` (et un `lib/auth-guards.ts` si besoin) :
  - `requireUser()` → renvoie la session ou `throw`/redirect si non connecté.
  - `requireEntityRole(userId, entityType, entityId, roles[])` → vérifie l'appartenance/rôle.
  - `canPublishJob(user, company)` → compte vérifié + société `approved` + rôle owner/recruiter.
  - `canViewCandidate(viewer, candidateUserId)` → `viewer == candidat` ∨ `super_admin` ∨ (`société vérifiée` ∧ `le candidat a postulé à une offre de cette société`).
- **Critères :** helpers typés, testés unitairement (cas vrai/faux). Aucune action ne les utilise encore (étape suivante).

#### Tâche 1.2 — Sécuriser `createJob` (Epic E4/E9 — FAILLE IDOR)
- Fichier : `lib/actions/jobs.ts` (`createJob`).
- Modifs : appeler `auth()`; **ignorer** `createdBy` du form → utiliser `session.user.id`; charger la société et vérifier ownership/role; vérifier `company.verificationStatus === "approved"`; vérifier compte perso vérifié. Conserver `status: "pending"`.
- Adapter `app/emploi/nouvelle-offre/page.tsx` (ne plus envoyer `createdBy`).
- **Critères (Epic E4) :** publication impossible sans société `approved` + droit ; falsifier `companyId` → refus ; offre créée en `pending`. Test e2e : société non vérifiée → refus ; société vérifiée → succès.

#### Tâche 1.3 — Fermer l'annuaire candidats public (Epic E6 — FUITE RGPD)
- Retirer `/candidats` des routes publiques dans `auth.config.ts` (callback `authorized`, liste `isPublic`).
- `app/candidats/page.tsx` : supprimer le listing nominatif. Le remplacer par une page « Créez votre profil candidat » (CTA), sans données personnelles d'autrui.
- `lib/actions/candidates.ts` : `getPublishedCandidates` ne doit plus exposer de profils ; remplacer par un accès gardé via `canViewCandidate`.
- **Critères (Epic E6) :** accès anonyme à un profil candidat → refusé ; pas de liste nominative publique. Test e2e : visiteur anonyme ne voit aucun nom de candidat.

#### Tâche 1.4 — Sécuriser candidature & actions sensibles (Epic E5/E2)
- `applyToJob` (`lib/actions/jobs.ts`) : `auth()` + dériver `candidateProfileId` du profil de la session (refuser si le profil ciblé n'appartient pas au user). Garder l'anti-doublon.
- `softDeleteJob` : vérifier que le user est owner/recruiter de la société de l'offre, ou admin.
- `updateCompanyProfile` (`lib/actions/companies.ts`) : vérifier ownership.
- **Critères :** falsifier un id → refus serveur ; tests des cas refusés.

> **FIN VAGUE 1 : commit, vérifs vertes, récap. Les 3 P0 de l'audit (createJob, /candidats, vue candidatures—préparée) doivent être traités côté sécurité.**

---

### 🟠 VAGUE 2 — MÉTIER & CONFIANCE (P1)

#### Tâche 2.1 — Modèle de rôles d'entité `EntityMember` (Epic E1)
- `prisma/schema.prisma` : ajouter
  ```prisma
  model EntityMember {
    id String @id @default(cuid())
    userId String
    entityType String   // "company" | "supplier" | "training_organization"
    entityId String
    role String         // "owner" | "admin" | "recruiter" | "member"
    status String @default("active")
    invitedBy String?
    createdAt DateTime @default(now())
    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@unique([userId, entityType, entityId])
  }
  ```
- Ajouter `UserProfile.visibility String @default("private")` (`public|private`).
- Migration + **script de backfill** : pour chaque `Company/Supplier/TrainingOrganization`, créer `EntityMember(role="owner")` à partir de `ownerUserId`.
- Refactor : `requireEntityRole` et les guards (1.1) lisent `EntityMember` (fallback `ownerUserId` tant que la migration n'est pas généralisée).
- **Critères (Epic E1) :** un compte peut être lié à ≥2 entités ; permissions dérivées de `EntityMember` ; backfill idempotent.

#### Tâche 2.2 — Taxonomie fournisseurs structurée (Epic E3)
- `prisma/schema.prisma` : `Supplier.family String` + sous-catégorie sur liste fermée ; `Supplier.offerType String?` (`vente|location|les_deux`) ; idem possible sur `SupplierService`.
- Définir la taxonomie (constante TS partagée) :
  - **Consommables** : produits_entretien, produits_desinfectants, papier_essuie_mains_sanitaire, sacs_poubelle, produits_pour_machines, recharges, produits_ecologiques, produits_specialises
  - **Matériel** : raclettes, balais, franges, seaux, chariots_menage, pulverisateurs, accessoires_vitrerie, linge_textile, microfibres, uniformes_vetements_pro
  - **Machines** (offerType requis) : autolaveuses, monobrosses, aspirateurs_pro, injecteurs_extracteurs, nettoyeurs_vapeur, nettoyeurs_haute_pression, machines_industrielles
  - **Logiciels** : planning, crm, erp, devis_facturation, rh, pointage, preuve_de_passage, qualite, gestion_agents, logiciel_metier_proprete
- Migrer les fournisseurs seedés (`prisma/seed.ts`) vers la nouvelle taxonomie ; mettre à jour `lib/actions/suppliers.ts` (filtres famille/sous-catégorie/achat-location) et `app/annuaire/fournisseurs/**`.
- **Critères (Epic E3) :** plus de catégorie texte libre ; filtre Achat/Location/Les deux opérationnel sur Machines.

#### Tâche 2.3 — Dashboard entreprise / mini-ATS (Epic E7)
- Nouvelle action `getApplicationsForCompany(companyId, viewer)` dans `lib/actions/jobs.ts`, **scopée** aux entités du viewer (`EntityMember`/owner). Inclure profil candidat résumé + CV (via `canViewCandidate`).
- Page `app/dashboard/entreprise/offres/[jobId]/candidatures/page.tsx` : liste des candidats d'une offre + fiche détaillée.
- `prisma/schema.prisma` : `JobApplication.internalNotes String?` ; exploiter `status` (reçu/vu/entretien/refusé/retenu) + action `updateApplicationStatus` gardée.
- **Critères (Epic E7) :** une société ne voit QUE les candidatures de ses offres ; accès aux candidatures d'une autre société → refus ; statut + notes persistés.

#### Tâche 2.4 — Vérification & gating (Epic E10)
- Relier les badges/`verificationStatus` aux guards : une entité non `approved` ne peut pas publier (E4) ni accéder aux candidats (E6/E7).
- Back-office (`lib/actions/admin.ts`, `app/admin/**`) : file de modération des offres `pending`.
- **Critères :** gating effectif testé.

> **FIN VAGUE 2 : commit, vérifs, récap.**

---

### 🟡 VAGUE 3 — RÉSEAU SOCIAL (P2)

#### Tâche 3.1 — Recommandations (Epic E8)
- `prisma/schema.prisma` : `Recommendation(candidateUserId, authorUserId?, authorEmail?, authorEntityId?, authorRole?, relationship?, comment?, status@default("pending"), createdAt)`.
- `lib/actions/recommendations.ts` : demander une reco (rechercher un membre existant OU inviter par email), rédiger, publier. Affichage soumis à la visibilité (E6/E9).
- **Critères (Epic E8) :** reco affiche auteur (cliquable si public), entreprise, rôle, relation, commentaire, date, statut.

#### Tâche 3.2 — Profils publics & équipe sur pages entité (Epic E9)
- Page publique `app/membres/[id]/page.tsx` respectant `UserProfile.visibility` (privé → 404/refus).
- Afficher les `EntityMember` actifs sur `app/annuaire/societes/[id]` et `app/annuaire/fournisseurs/[id]` ; lien actif seulement si profil public.
- **Critères (Epic E9) :** équipe listée ; profil cliquable si public ; profil privé inaccessible par URL.

> **FIN VAGUE 3 : commit, vérifs, récap.**

---

### 🟢 VAGUE 4 — CROISSANCE (P2/P3, optionnel selon temps)
Aligner sous-traitance (E11), formations (E12), contenus/SEO (E13), notifications & RGPD/prod (E14) sur le nouveau RBAC et la vérification. Détails dans `docs/epics-roadmap-2026-06-09.md`. Migration SQLite → Postgres pour la prod.

---

## 4. MATRICE DE TESTS À COUVRIR (Epic E2 §9 audit)

Pour chaque flux, tester ces 8 acteurs : **non connecté · candidat · société non vérifiée · société vérifiée · fournisseur · organisme · admin · super admin**.

| Flux | Attendu clé |
|------|-------------|
| Publier offre | seul owner/recruiter d'une société **vérifiée** réussit ; ids falsifiés → refus |
| Candidater | profil candidat requis ; candidature au nom d'autrui → refus ; pas de double |
| Voir profil candidat | privé par défaut ; société seulement si le candidat a postulé chez elle ; super admin OK |
| Annuaire candidats | aucun listing nominatif public |
| Dashboard entreprise | uniquement ses propres offres/candidatures |
| Recommandation | 7 champs ; visibilité respectée |
| Page entité | équipe affichée ; profil cliquable seulement si public |

---

## 5. CE QUE TU NE DOIS PAS FAIRE
- Ne pas exposer de données personnelles candidats hors permission.
- Ne pas supprimer de fonctionnalités existantes sans équivalent.
- Ne pas introduire de secret en clair ni désactiver les guards « pour tester ».
- Ne pas faire une migration destructive sans backfill.
- Ne pas tout livrer en un seul commit géant.

## 6. LIVRABLE FINAL ATTENDU
À la fin : un résumé par vague (ce qui est fait / testé), la liste des migrations Prisma créées, la liste des nouveaux fichiers, et la matrice de tests §4 cochée. Signale tout point nécessitant une décision produit humaine.

**Commence maintenant par : lire les 2 docs d'audit, lancer les commandes d'inspection §1, puis exécuter la Vague 1 tâche 1.1.**

---

## 7. ANNEXE — SCHÉMAS PRISMA PRÊTS À COLLER

> Conventions du repo à respecter : id `String @id @default(cuid())`, `createdAt/updatedAt`, soft-delete via `deletedAt DateTime?`, statuts en `String` (pas d'enum Prisma — SQLite), relations inverses nommées et `onDelete: Cascade`. **Ajoute aussi les relations inverses dans les modèles existants** (indiquées ci-dessous), sinon `prisma validate` échoue.

### 7.1 `EntityMember` (Vague 2 / Tâche 2.1)
```prisma
model EntityMember {
  id         String    @id @default(cuid())
  userId     String
  entityType String    // "company" | "supplier" | "training_organization"
  entityId   String
  role       String    @default("member") // "owner" | "admin" | "recruiter" | "member"
  status     String    @default("active")  // "active" | "invited" | "revoked"
  invitedBy  String?
  invitedEmail String?  // invitation d'un non-membre par email
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  deletedAt  DateTime?

  user User @relation("UserEntityMemberships", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, entityType, entityId])
  @@index([entityType, entityId])
  @@index([userId])
}
```
**À ajouter dans `model User`** (bloc relations) :
```prisma
  entityMemberships EntityMember[] @relation("UserEntityMemberships")
```

### 7.2 Évolutions de modèles existants

**`model UserProfile`** — visibilité du profil personnel (Vague 2/3) :
```prisma
  visibility String @default("private") // "public" | "private"
```

**`model JobApplication`** — workflow ATS + notes internes (Vague 2 / Tâche 2.3) :
```prisma
  // status existe déjà : étendre la sémantique à
  //   "submitted" | "viewed" | "interview" | "rejected" | "hired"
  internalNotes String?
  viewedAt      DateTime?
  statusUpdatedAt DateTime?
```

**`model Supplier`** — taxonomie structurée (Vague 2 / Tâche 2.2).
Garder `category` temporairement pour le backfill, puis le déprécier. Ajouter :
```prisma
  family        String?  // "consommables" | "materiel" | "machines" | "logiciels"
  subCategory   String?  // valeur de la liste fermée (cf. constante TS)
  offerType     String?  // machines uniquement : "vente" | "location" | "les_deux"
```

**`model SupplierService`** — option d'offre par service :
```prisma
  offerType String? // "vente" | "location" | "les_deux"
```

### 7.3 `Recommendation` (Vague 3 / Tâche 3.1)
```prisma
model Recommendation {
  id              String    @id @default(cuid())
  candidateUserId String                    // bénéficiaire (compte perso)
  authorUserId    String?                   // auteur s'il a un compte ClubPropreté
  authorEmail     String?                   // invitation externe
  authorName      String?                   // affichage si auteur externe
  authorEntityId  String?                   // entreprise liée à l'auteur
  authorEntityType String?                  // "company" | "supplier" | "training_organization"
  authorRole      String?                   // rôle de l'auteur (ex. "Dirigeant")
  relationship    String?                   // relation pro (ex. "A travaillé en freelance pour nous")
  comment         String?
  status          String    @default("pending") // "pending" | "published" | "declined"
  requestedAt     DateTime  @default(now())
  respondedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  candidate User  @relation("RecommendationsReceived", fields: [candidateUserId], references: [id], onDelete: Cascade)
  author    User? @relation("RecommendationsAuthored", fields: [authorUserId], references: [id], onDelete: SetNull)

  @@index([candidateUserId])
  @@index([authorUserId])
}
```
**À ajouter dans `model User`** (bloc relations) :
```prisma
  recommendationsReceived Recommendation[] @relation("RecommendationsReceived")
  recommendationsAuthored Recommendation[] @relation("RecommendationsAuthored")
```

### 7.4 (Optionnel, Vague 2/3) Enrichissement du profil candidat « CV vivant » (Epic E5)
Si le temps le permet, structurer les expériences/compétences plutôt que du texte libre :
```prisma
model CandidateExperience {
  id               String    @id @default(cuid())
  candidateProfileId String
  title            String
  companyName      String?
  city             String?
  startDate        DateTime?
  endDate          DateTime?
  current          Boolean   @default(false)
  description      String?
  createdAt        DateTime  @default(now())

  candidateProfile CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  @@index([candidateProfileId])
}

model CandidateSkill {
  id                 String @id @default(cuid())
  candidateProfileId String
  name               String
  level              String? // "debutant" | "intermediaire" | "expert"

  candidateProfile CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  @@unique([candidateProfileId, name])
}
```
**À ajouter dans `model CandidateProfile`** (bloc relations) :
```prisma
  experiences CandidateExperience[]
  skills      CandidateSkill[]
```

### 7.5 Constante de taxonomie fournisseurs (TS — `lib/supplier-taxonomy.ts`)
```ts
export const SUPPLIER_TAXONOMY = {
  consommables: {
    label: "Consommables",
    subs: [
      "produits_entretien", "produits_desinfectants", "papier_essuie_mains_sanitaire",
      "sacs_poubelle", "produits_pour_machines", "recharges",
      "produits_ecologiques", "produits_specialises",
    ],
    offerTypes: false,
  },
  materiel: {
    label: "Matériel",
    subs: [
      "raclettes", "balais", "franges", "seaux", "chariots_menage",
      "pulverisateurs", "accessoires_vitrerie", "linge_textile",
      "microfibres", "uniformes_vetements_pro",
    ],
    offerTypes: false,
  },
  machines: {
    label: "Machines",
    subs: [
      "autolaveuses", "monobrosses", "aspirateurs_pro", "injecteurs_extracteurs",
      "nettoyeurs_vapeur", "nettoyeurs_haute_pression", "machines_industrielles",
    ],
    offerTypes: true, // "vente" | "location" | "les_deux"
  },
  logiciels: {
    label: "Logiciels",
    subs: [
      "planning", "crm", "erp", "devis_facturation", "rh", "pointage",
      "preuve_de_passage", "qualite", "gestion_agents", "logiciel_metier_proprete",
    ],
    offerTypes: false,
  },
} as const;

export type SupplierFamily = keyof typeof SUPPLIER_TAXONOMY;
export const OFFER_TYPES = ["vente", "location", "les_deux"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];
```

### 7.6 Migrations & backfill — ordre recommandé
```bash
# 2.1 EntityMember + visibility
npx prisma migrate dev --name add_entity_member_and_visibility
# Script backfill (à écrire dans prisma/backfill-entity-members.ts) :
#   pour chaque Company/Supplier/TrainingOrganization non supprimée,
#   upsert EntityMember(userId=ownerUserId, entityType, entityId=id, role="owner")
npx tsx prisma/backfill-entity-members.ts

# 2.2 Taxonomie fournisseurs
npx prisma migrate dev --name supplier_taxonomy
npx tsx prisma/backfill-supplier-taxonomy.ts   # mappe les anciens category -> family/subCategory

# 2.3 ATS
npx prisma migrate dev --name job_application_ats

# 3.1 Recommandations (+ 7.4 si retenu)
npx prisma migrate dev --name recommendations
```
> Les scripts de backfill doivent être **idempotents** (`upsert` / garde sur l'existant) et ne jamais perdre de données. Vérifie `npx prisma validate` après chaque ajout, et `npx tsc --noEmit` après chaque refactor de permissions.
