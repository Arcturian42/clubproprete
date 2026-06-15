# Audit Complet — ClubProprete.com

**Date :** 15 juin 2026  
**Version auditée :** V0 (commit récent, post-audits juin 2026)  
**Auditeur :** Kimi Code CLI  
**Base :** `/Users/clementgalbi/clubproprete`

---

## 1. Synthèse exécutive

Le projet est passé d’un prototype localStorage à une **stack moderne et structurée** (Next.js 15 + Auth.js v5 + Prisma + PostgreSQL). Les parcours critiques (inscription, onboarding, dashboard, admin) sont fonctionnels en local. Cependant, plusieurs **frictions techniques et sécuritaires** empêchent une mise en production immédiate.

**Verdict :** Architecture solide, design system cohérent, schéma de données mûr. **La priorité absolue est le durcissement sécurité (auth, guards serveur, Edge Runtime) suivi de la profondeur métier (formulaires complets, candidatures, sous-traitance).**

**Score global : 6.8 / 10** (bon prototype, besoin de durcissement avant ouverture publique)

---

## 2. Stack technique & architecture

| Couche | Technologie | Version | État |
|--------|-------------|---------|------|
| Framework | Next.js (App Router) | 15.3.0 | ✅ Bon |
| Langage | TypeScript | 5.7.2 | ✅ Strict |
| Styling | TailwindCSS + CSS custom | 3.4.17 | ✅ Excellent |
| Auth | Auth.js (Next-Auth v5 beta) | 5.0.0-beta.31 | ⚠️ Beta + frictions Edge |
| ORM | Prisma | 6.9.0 | ✅ Bon |
| Base | PostgreSQL (Supabase prod / local dev) | 16 | ✅ Bon |
| Hash | bcryptjs | 3.0.3 | ✅ OK |
| Validation | Zod | 3.24.1 | ✅ Bon |
| Icons | lucide-react | 0.468.0 | ✅ Léger |
| E2E | Playwright | 1.60.0 | ⚠️ Désactivé en CI |
| Email | Abstraction Resend-ready | — | ✅ Préparé mais inactif |
| Upload | Vercel Blob | 2.4.0 | ✅ Préparé |
| Carte | Leaflet + react-leaflet | 1.9.4 / 5.0.0 | ✅ Intégré |

**Architecture dossiers :**
- `app/` : Next.js App Router, pages publiques + dashboards + admin
- `components/` : composants réutilisables, design system Bento
- `lib/actions/` : Server Actions par domaine
- `lib/` : permissions, email, rate-limit, prisma, utils
- `prisma/` : schéma complet (20+ modèles)
- `e2e/` : tests Playwright (désactivés en CI)
- `docs/` : documentation riche (plan MVP, audits, roadmaps)

---

## 3. Scoring par module (0–10)

| Module | Score | Commentaire |
|--------|-------|-------------|
| Design system / UI | 8.5 | Bento cohérent, responsive, accessibilité de base |
| Auth / Sessions | 7.0 | Auth.js v5, JWT, rôles, mais Edge warning + comptes démo hardcodés |
| Schéma de données | 8.5 | Très complet, soft deletes, relations propres |
| Inscription / Onboarding | 6.5 | Flow fonctionnel, mais formulaires métier post-onboarding incomplets |
| Dashboards | 7.0 | Conditionnels par rôle, candidat avancé, mais métriques mockées |
| Annuaire sociétés | 7.5 | Liste + recherche + fiches détail OK |
| Annuaire fournisseurs | 5.0 | Seed présent mais affichage vide / 404 détail selon contexte |
| Job board | 6.5 | Liste, recherche, pagination, mais candidature basique + guards à renforcer |
| Formations | 6.5 | Liste + détail, mais création/session partielle |
| Sous-traitance | 6.0 | Garde serveur présent, mais missions vides, pas de candidature réelle |
| Association | 5.5 | Statuts définis, workflow partiellement branché |
| Admin / Back-office | 7.0 | Modération réelle, CSV, logs, mais UI basique + pas de recherche |
| RGPD / Compliance | 4.5 | Pages légales existent, mais manque consentement, oubli, export |
| Sécurité headers / CSP | 8.0 | CSP, HSTS, X-Frame, Permissions-Policy bien configurés |
| Tests automatisés | 4.0 | E2E désactivés, unitaire minimal (permissions), pas de coverage |
| Documentation | 8.5 | 10+ docs riches, plan MVP, audits, QA, roadmaps |
| **Moyenne** | **6.8/10** | Bon prototype, besoin de durcissement + profondeur métier |

---

## 4. Risques & problèmes identifiés

### 🔴 Critiques (bloquants production)

| # | Problème | Impact | Fichier(s) concerné(s) |
|---|----------|--------|------------------------|
| C1 | **Edge Runtime warning** : `middleware.ts` importe `NextAuth(authConfig)` qui dépend indirectement de Prisma/bcryptjs. Build passant mais risque de crash sur Vercel Edge. | Middleware inopérant en production | `middleware.ts`, `auth.config.ts`, `auth.ts` |
| C2 | **Comptes démo hardcodés** : 8 comptes `@clubproprete.test` avec mdp `demo` en dur dans `lib/auth-demo.ts`. Si `NODE_ENV` n’est pas strictement `production`, le sélecteur de démo apparaît. | Porte dérobée publique | `lib/auth-demo.ts`, `components/auth/login-form.tsx` |
| C3 | **Vérification email désactivée** : `emailVerified: true` automatique à l’inscription. Aucun double opt-in. | Usurpation d’identité, spam | `lib/actions/auth.ts` |
| C4 | **Rate limiting en mémoire** : `lib/rate-limit.ts` utilise un `Map` en mémoire. En production multi-instance (Vercel), non partagé entre workers. | Brute-force distribuable | `lib/rate-limit.ts` |
| C5 | **Middleware sans vérification de rôle** : `/admin` protégé contre les anonymes mais pas contre les non-admins au niveau middleware. | Élévation de privilèges partielle | `middleware.ts`, `auth.config.ts` |
| C6 | **JWT stale sur endpoints sensibles** : `/api/admin/export` utilise `session.user.role` sans requête DB. Un admin rétrogradé conserve ses privilèges 30 jours. | Élévation de privilèges persistante | `app/api/admin/export/route.ts` |

### 🟡 Hauts (à corriger avant ouverture publique)

| # | Problème | Impact |
|---|----------|--------|
| H1 | **Politique de mot de passe faible** : min 6 caractères, aucune complexité. | Brute-force facile |
| H2 | **Pas de 2FA / MFA** | Compromission email = compromission totale |
| H3 | **Certaines Server Actions mutantes sans garde serveur** : `createJob`, `applyToJob`, etc. peuvent être appelées sans `auth()` ou sans vérification d’ownership (IDOR). | Falsification de données |
| H4 | **RGPD incomplet** : pas de bannière cookies, pas de route `/supprimer-compte`, pas d’export données, pas de case RGPD séparée des CGU. | Risque juridique |
| H5 | **Tests E2E désactivés en CI** : la suite Playwright est commentée (`if: false`) car les seeds de démo ont été retirés. Régression non détectée. | Qualité en baisse |
| H6 | **Pas de gestion d’erreurs utilisateur** : pas de `Toaster` / `Sonner` global. Les Server Actions retournent `{ success: false, message }` mais l’UI n’affiche pas toujours les messages. | UX dégradée |

### 🟢 Moyens (amélioration continue)

| # | Problème | Impact |
|---|----------|--------|
| M1 | Emails transactionnels inactifs sans `RESEND_API_KEY` | Aucune notification réelle ne part |
| M2 | Upload fichiers partiel : abstraction Vercel Blob présente mais pas utilisée partout (CV, logo, documents) | Formulaires incomplets |
| M3 | SEO : `sitemap.ts` et `robots.ts` existent mais metadata dynamiques manquantes sur certaines pages détail | Référencement sous-optimal |
| M4 | Performance : pas de `React.Suspense` sur tous les segments publics, pas de `loading.tsx` partout | LCP à améliorer |
| M5 | Pas de gestion de sessions actives (liste, révocation, déconnexion à distance) | Impossible de révoquer un token volé |

### 🔵 Faibles / Remarques

- **Password reset** : tokens de 1h, hashés SHA-256, invalidation des anciens → bien fait.
- **Suppression de compte** : soft-delete avec anonymisation (`deletedAt`, `status: suspended`, `passwordHash: null`) → bien fait.
- **Upload** : vérification par magic bytes (`sniffMimeType`) → bonne pratique.
- **CI GitHub Actions** : typecheck, lint, build, unit tests → bonne qualité de pipeline.

---

## 5. Liste d’Épics priorisées

### Vague V1 — Socle sécurisé & confiance (P0)

> **Objectif :** rendre la plateforme sûre, conforme et prête à recevoir des données réelles.

---

#### **E1 — Auth & Identité production-grade**
- Corriger **Edge Runtime** : isoler `auth.config.ts` (edge-safe) de `auth.ts` (Node runtime avec Prisma/bcrypt)
- Retirer ou sécuriser les **comptes démo** (feature-flag sécurisé, pas basé sur `NODE_ENV`)
- Implémenter la **vérification email réelle** (double opt-in avec token expirable)
- Renforcer la **politique de mot de passe** (min 10 car, majuscule, chiffre, symbole)
- Ajouter **rate limiting distribué** (Upstash Redis / Vercel KV) sur login, register, newsletter
- Implémenter **2FA TOTP** pour les rôles admin/super_admin
- Ajouter **audit log auth** (connexions, échecs, changements de rôle)

**Critères d’acceptation :**
- [ ] Build 100% clean sans warning Edge
- [ ] Aucun compte démo accessible en production
- [ ] Email vérifié obligatoire avant première action sensible
- [ ] Rate limit distribué opérationnel

**Dépendances :** Aucune. **Bloque tout le reste.**

---

#### **E2 — RBAC & Guards serveur**
- Durcir **toutes les Server Actions mutantes** : `requireUser()` + `requireEntityRole()` systématiques
- Vérifier l’**ownership** côté serveur (pas seulement l’ID du formulaire)
- Ajouter la **vérification de rôle dans le middleware** (admin uniquement sur `/admin`, etc.)
- Rafraîchir le **rôle depuis la DB** sur tous les endpoints admin/API sensibles (anti-JWT stale)
- Créer une **matrice de tests automatisés** (8 acteurs × N actions)
- Protéger `/candidats` contre l’accès public (fuite RGPD)

**Critères d’acceptation :**
- [ ] Toute mutation commence par auth + ownership check
- [ ] Falsifier `companyId`/`candidateProfileId` dans un form → refus serveur
- [ ] Middleware rejette les non-admin sur `/admin`
- [ ] Tests unitaires/couverture de la matrice permissions

**Dépendances :** E1. **Transverse à tous les flux métier.**

---

#### **E3 — RGPD, Compliance & Production-readiness**
- Bannière **cookies / consentement** (obligatoire avant analytics, cookies tiers)
- Case **RGPD séparée** des CGU à l’inscription
- Route **suppression de compte** (`/supprimer-compte`) avec anonymisation complète
- **Export données personnelles** (JSON téléchargeable depuis le profil)
- Page **DPO / contact RGPD** dans les mentions légales
- Documentation de la **durée de conservation** des données
- Préparer **variables d’environnement production** (Supabase, Resend, Vercel Blob)
- Migration **SQLite → PostgreSQL** finalisée (déjà préparée)

**Critères d’acceptation :**
- [ ] Consentement explicite collecté à l’inscription
- [ ] Droit à l’effacement fonctionnel (soft-delete + anonymisation)
- [ ] Export JSON des données utilisateur disponible

**Dépendances :** E1, E2.

---

### Vague V2 — Profondeur métier (P1)

> **Objectif :** transformer les écrans en vrais workflows persistants et complets.

---

#### **E4 — Formulaires métier & Onboarding profond**
- Formulaire **société complet** : SIRET (avec validation API), zones, services (multi-select), besoins, documents
- Formulaire **fournisseur complet** : taxonomie normalisée (famille/sous-catégorie), couverture, catalogue, contact
- Formulaire **indépendant complet** : statut, SIRET, assurance, équipement, tarifs, mobilité, disponibilité
- Formulaire **candidat complet** : expériences, compétences, certifications, documents, dispos
- Formulaire **organisme de formation** : Qualiopi, numéro déclaration, sessions
- **Score de complétion réel** calculé depuis les champs remplis
- Sauvegarde **brouillon** pendant l’onboarding

**Critères d’acceptation :**
- [ ] Chaque persona peut créer un profil complet et le modifier
- [ ] Score de complétion dynamique et persistant
- [ ] Validation Zod côté client + serveur

**Dépendances :** E1, E2.

---

#### **E5 — Annuaires publics & Fiches détail**
- Annuaire **sociétés** : filtres fonctionnels (ville, services, taille, membre association)
- Annuaire **fournisseurs** : taxonomie structurée (consommables / matériel / machines / logiciels), filtre achat/location
- Annuaire **indépendants** (visibilité contrôlée, pas de listing nominatif public)
- **Pages détail** pour toutes les entités (société, fournisseur, indépendant, organisme)
- CTA **contact / lead** sur chaque fiche (formulaire capturé en base)
- Badge **"Fiche vérifiée"** affiché publiquement après validation admin

**Critères d’acceptation :**
- [ ] Toutes les fiches validées apparaissent dans les annuaires
- [ ] Filtres fonctionnels côté serveur
- [ ] Aucun 404 sur les liens publics

**Dépendances :** E4.

---

#### **E6 — Job Board & Mini-ATS**
- Publication d’offre par société **vérifiée** uniquement (`verificationStatus === "approved"`)
- Workflow offre : `draft` → `pending` (modération) → `published` → `archived`
- **Candidature complète** : message + CV + profil réutilisable
- **Dashboard recruteur** : liste des candidatures par offre, fiche candidat détaillée (CV, certifs, recos)
- **Workflow candidature** : `submitted` → `viewed` → `interview` → `rejected` / `hired`
- Notes internes sur les candidatures (`JobApplication.internalNotes`)
- Anti-doublon de candidature

**Critères d’acceptation :**
- [ ] Société non vérifiée = publication refusée serveur
- [ ] Candidature dérivée de la session (pas falsifiable)
- [ ] Recruteur ne voit que les candidatures de SES offres

**Dépendances :** E2, E4, E5.

---

#### **E7 — Sous-traitance privée & Association**
- **Demande d’adhésion** persistante avec motivation et besoins
- **Validation admin** de l’adhésion (workflow `draft` → `pending` → `approved`/`rejected`)
- **Dashboard association** réservé aux membres validés
- **Publication de missions** par société membre vérifiée
- **Candidature aux missions** par indépendant/société membre
- **Gestion des candidatures** par créateur de mission
- **Garde serveur strict** : accès totalement masqué aux non-membres (pas seulement UI)

**Critères d’acceptation :**
- [ ] Non-membre = 403 sur toutes les routes sous-traitance (API + pages)
- [ ] Workflow adhésion + mission + candidature fonctionnel bout-en-bout

**Dépendances :** E2, E4.

---

#### **E8 — Formations & Organismes**
- Création de formation par **organisme** ou **société** (chef d’entreprise formateur)
- Gestion des **sessions** (dates, lieux, places)
- **Demande d’information** sur une formation (lead en base)
- **Validation admin** obligatoire avant publication
- Dashboard organisme : formations, sessions, demandes reçues

**Critères d’acceptation :**
- [ ] Formation rattachée à une entité vérifiée
- [ ] Sessions CRUD fonctionnel
- [ ] Leads tracés et visibles par l’organisme

**Dépendances :** E2, E4.

---

### Vague V3 — Réseau, contenu & croissance (P2)

> **Objectif :** activer la dimension réseau social et l’acquisition par le contenu.

---

#### **E9 — Recommandations & Confiance entre pairs**
- Modèle `Recommendation` (déjà en base) exploité : demande, rédaction, affichage
- Flow : rechercher un membre existant **ou** inviter par email externe
- Affichage sur le profil : auteur (cliquable si public), entreprise liée, rôle, relation, commentaire
- Visibilité des recommandations soumise aux règles du profil (E10)

**Critères d’acceptation :**
- [ ] Recommandation demandée, rédigée et affichée
- [ ] Lien actif si profil public, inactif sinon

**Dépendances :** E4, E10.

---

#### **E10 — Profils publics cliquables & Visibilité**
- Page publique `/membres/[userId]` respectant `UserProfile.visibility`
- Affichage de l’**équipe** sur les pages entité (`EntityMember`)
- Profil membre cliquable seulement si `visibility = public`
- Accès direct à un profil privé par URL → refusé

**Critères d’acceptation :**
- [ ] Page entité liste les membres actifs
- [ ] Profil privé = 403/404 au direct access

**Dépendances :** E2.

---

#### **E11 — Contenus, SEO & Acquisition**
- Workflow éditorial complet : brouillon → revue → publication
- **CMS minimal** pour les articles (markdown / rich text simple)
- **Rôles auteur** : création brouillon, publication par admin
- **SEO dynamique** : metadata OpenGraph par article, par offre, par fiche
- **Newsletter** : inscription persistante avec segmentation (profil, région, intérêts)
- Export CSV newsletter
- **Pages ressources** alimentées par la base (guides, comparatifs, modèles)

**Critères d’acceptation :**
- [ ] Workflow éditorial bout-en-bout
- [ ] Metadata dynamiques sur toutes les pages détail
- [ ] Newsletter segmentée et exportable

**Dépendances :** E2.

---

### Vague V4 — Finitions & opérations (P2/P3)

> **Objectif :** fiabiliser la plateforme en production.

---

#### **E12 — Notifications, Emails & Communication**
- Brancher **Resend** (ou alternative) en production
- Notifications transactionnelles : bienvenue, candidature reçue, changement de statut, validation/refus, invitation entité
- **Notifications in-app** (`Notification` table déjà en base) : bell + liste + marquage lu
- Email admin : nouvelle candidature, nouvelle demande adhésion, nouvelle fiche en attente

**Critères d’acceptation :**
- [ ] Tous les emails transactionnels clés partent et sont testés
- [ ] Notifications in-app fonctionnelles (création, lecture, lien)

**Dépendances :** E1, E3.

---

#### **E13 — Tests, QA & Monitoring**
- Réactiver et **réécrire les tests E2E** Playwright (créer leurs propres données)
- Tests unitaires sur **permissions**, **Server Actions**, **CSV export**
- Tests de sécurité : matrice 8 acteurs × N actions
- **Monitoring** : Sentry ou équivalent pour le tracking d’erreurs
- **Analytics** : événements métier (inscription, candidature, publication)

**Critères d’acceptation :**
- [ ] CI verte avec E2E + unitaires
- [ ] Coverage > 60% sur les actions et permissions

**Dépendances :** E1, E2.

---

#### **E14 — Performance, UX Polish & Design System**
- `loading.tsx` sur tous les segments principaux
- `React.Suspense` + `ErrorBoundary` sur les pages publiques
- `next/image` optimisé partout (logos, photos, avatars)
- Lazy loading sur les listes longues (annuaires, offres)
- **Toaster global** (`Sonner`) pour les retours serveur
- Amélioration des états vides et messages d’erreur

**Critères d’acceptation :**
- [ ] Lighthouse > 80 sur mobile (Performance, A11y, SEO)
- [ ] Aucune action sans feedback visuel

**Dépendances :** Transverse.

---

## 6. Chemin critique recommandé

```
E1 (Auth/Edge) → E2 (Guards) → (E4 + E5 + E6 en parallèle) → E3 (RGPD)
                                      ↓
                              E7, E8 (métier avancé)
                                      ↓
                        E9, E10, E11 (réseau + contenu)
                                      ↓
                        E12, E13, E14 (prod-ready)
```

**Sprints suggérés :**
- **Sprint 1 (1 semaine)** : E1 + E2 — Durcissement sécurité
- **Sprint 2 (1 semaine)** : E4 — Formulaires métier complets
- **Sprint 3 (1 semaine)** : E5 + E6 — Annuaires + Job board + Sous-traitance
- **Sprint 4 (1 semaine)** : E3 + E7 + E8 — RGPD + ATS + Formations
- **Sprint 5 (1 semaine)** : E9 + E10 + E11 + E12 — Réseau + Contenu + Emails
- **Sprint 6 (1 semaine)** : E13 + E14 — Tests + Perf + Monitoring

---

## 7. Conclusion

Le projet ClubProprete.com a une **base technique solide** et une **vision produit claire**. Le travail prioritaire n’est plus l’architecture mais le **durcissement sécuritaire** et la **profondeur métier**. Avec les 14 épics ci-dessus, le projet peut passer d’un prototype avancé à une **V0 production-ready** en 6 semaines de développement concentré.

**Top 3 priorités immédiates :**
1. **Corriger Edge Runtime + retirer comptes démo** (E1)
2. **Durcir tous les guards serveur** (E2)
3. **Compléter les formulaires métier post-onboarding** (E4)
