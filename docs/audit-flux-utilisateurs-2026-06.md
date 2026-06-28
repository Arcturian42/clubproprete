# Audit des flux & utilisateurs — Club Propreté (juin 2026)

> Audit lecture seule de l'authentification, du RBAC, de l'onboarding/entités, des
> flux de contenu & engagement et du back-office. Chaque constat est référencé
> `fichier:ligne`. Ce document indique aussi ce qui a été **corrigé** dans la PR
> associée et ce qui reste **à suivre**.

Légende statut : ✅ corrigé · ⏳ à suivre (migration/refonte/décision produit).

## Synthèse

Cause structurelle principale : deux familles de gardes coexistaient — rôle relu
**en base** (`requireUser()`, sûr) vs rôle lu sur le **JWT figé 30 j** (non sûr) —
et les rôles « vérifié » n'étaient jamais attribués.

## P0 — Critiques

| # | Constat | Preuve | Statut |
|---|---------|--------|--------|
| P0-1 | `requireAdmin()` autorisait sur le JWT brut (admin rétrogradé/suspendu actif jusqu'à 30 j) | `lib/actions/admin.ts` | ✅ → `requireUser()` |
| P0-2 | `getUserAdminDetail` fuyait `passwordHash` + `twoFactorSecret` dans la payload RSC | `lib/actions/users.ts` | ✅ → `omit` des secrets |
| P0-3 | Connexion par mot de passe sans rate-limit (brute-force illimité) | `auth.ts` (authorize) | ✅ → `rateLimitByEmail` (10/min) |
| P0-4 | 2FA jamais vérifiée au login (`verifyTwoFactorForLogin` non branché) | `lib/actions/two-factor.ts` | ⏳ implémenter le challenge ou retirer l'option UI |
| P0-5 | `email-verification.ts` (Prisma) importé dans un composant client | `app/verification-email/page.tsx` | ✅ → page convertie en composant serveur |
| P0-6 | Export RGPD utilisateur sans contrôle `deletedAt` | `app/api/user/export/route.ts` | ✅ → bloque les comptes supprimés |
| P0-7 | Rôles `verified_company`/`verified_supplier` jamais attribués à l'approbation | `lib/actions/admin.ts` | ✅ → élévation/rétrogradation ciblée du `mainRole` |

> Note P0-7 : `association_member` n'est volontairement **pas** posé sur `mainRole`
> (l'accès sous-traitance est gaté par la table `AssociationMembership`, pas par
> le rôle). Les helpers `canPublishMission`/`canAccessSubcontracting` restent morts → ⏳.

## P1 — Importants

| # | Constat | Statut |
|---|---------|--------|
| P1 | `updateUserRole` pouvait créer un `super_admin` et permettait l'auto-modification | ✅ rôle super_admin non assignable + interdiction de se modifier soi-même + filtre `deletedAt` |
| P1 | Fuite PII candidats sous-traitance dans la payload RSC | ✅ PII chargée uniquement pour le créateur/admin |
| P1 | Candidature emploi ouverte aux comptes non vérifiés | ✅ `emailVerified` (ou profil approuvé) requis |
| P1 | Politique de mot de passe contournable via le reset (6 car.) | ✅ politique forte alignée sur l'inscription |
| P1 | Emails non normalisés → doublons / comptes non reliés | ✅ minuscules à l'inscription + lookup login insensible à la casse |
| P1 | Newsletter : ré-abonnement trompeur (désabonné reste désabonné) | ✅ `status: "active"` au ré-abonnement + email normalisé |
| P1 | Garde de page `/sous-traitance` sur le JWT (membre fraîchement approuvé ne voit rien) | ⏳ (pas de fuite : l'action serveur re-vérifie en base) |
| P1 | Middleware `/admin` sur rôle JWT seul (défense en profondeur) | ⏳ exiger une vérif. base dans tout futur `/api/admin/*` |
| P1 | Pas de `@@unique` sur les candidatures → double candidature (race) | ⏳ migration `@@unique([jobId, candidateProfileId])` / `([missionId, applicantUserId])` |
| P1 | Pas de soft-delete d'entités ; `deleteMyAccount` ne masque pas les fiches (orphelins RGPD) | ⏳ soft-delete en cascade + masquage annuaire |
| P1 | Transitions de statut admin non contraintes (machine à états absente) | ⏳ |
| P1 | Édition fiche fournisseur/centre rétrograde une fiche `approved` en `pending` | ⏳ |
| P1 | Re-onboarding écrase `visibility` (confidentialité annulée) | ⏳ |
| P1 | `getClientIp` → `"unknown"` global hors Edge Vercel | ⏳ rendre l'en-tête de confiance configurable |

## P2 — Mineurs / dette (à suivre)

`completionScore` plafonné à 90 et figé · création d'entité hors onboarding laissant
`UserProfile`/`onboardingCompletedAt` non initialisés · validations laxistes (SIRET,
email/url société) + champ `website` profil mort · audit log absent sur exports/consultations
PII et hors transaction pour `updateEntityStatus` · rate-limit mémoire (sans KV) et
désactivé si `ENABLE_DEMO_ACCOUNTS=true` · borne TOTP absente, fallback `AUTH_SECRET`
constant · changement d'email profil sans re-vérification · reset limité par IP seule ·
modèle `Lead` sans flux de création · source de vérité des rôles éclatée
(`types.ts` vs `users.ts` vs `schema.prisma`) · frictions back-office (refus sans motif
obligatoire, pas de confirmation, retours d'action ignorés).

## Points sains vérifiés

Pas d'IDOR en écriture sur les entités (`requireEntityRole` + ownership + `approved`).
`canPublishJob` rejette un `ownerUserId` forgé. Super_admin protégé contre
modification/suspension. Brouillons d'articles non exposés. `deleteMyAccount` bloque
la reconnexion. Export admin/RGPD via `select` liste blanche (hors secrets).
