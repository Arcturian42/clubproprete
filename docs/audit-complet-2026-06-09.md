# Audit Complet — ClubProprete.com V0

**Date :** 9 juin 2026  
**Auditeur :** Kimi Code CLI  
**Base auditée :** `/Users/clementgalbi/Documents/ClubProprete`  
**Commit :** `391ad07` (Initial commit : ClubProprete V0 prototype)

---

## 1. Synthèse exécutive

Le projet est une **V0 de démonstration avancée**, pas encore un MVP production-ready, mais avec une base technique solide et une direction UX très cohérente. Le travail d'amélioration est significatif : passage d'une auth localStorage à Auth.js + Prisma, création d'un design system complet, implémentation de Server Actions, seed riche, et documentation QA rigoureuse.

**Verdict :** Bon prototype technique. Les parcours critiques (inscription → onboarding → dashboard → admin) sont fonctionnels en local. Il manque principalement la **profondeur métier** (formulaires complets, édition profil, uploads, notifications réelles) et la **préparation production** (Edge Runtime, rate limit, RGPD complet, tests e2e plus larges).

---

## 2. Architecture technique

| Couche | Technologie | Version | État |
|--------|-------------|---------|------|
| Framework | Next.js (App Router) | 15.3.0 | ✅ Bon |
| Langage | TypeScript | 5.7.2 | ✅ Strict |
| Styling | TailwindCSS + CSS custom | 3.4.17 | ✅ Excellent |
| Auth | Next-Auth (Auth.js v5 beta) | 5.0.0-beta.31 | ⚠️ Beta — à surveiller |
| ORM | Prisma | 6.9.0 | ✅ Bon |
| Base | SQLite (dev) | — | ⚠️ À migrer en PostgreSQL pour prod |
| Hash | bcryptjs | 3.0.3 | ✅ OK |
| Validation | Zod | 3.24.1 | ✅ Bon |
| Icons | lucide-react | 0.468.0 | ✅ Léger |
| E2E | Playwright | 1.60.0 | ✅ Configuré |
| Email | Abstraction Resend-ready | — | ✅ Préparé |

---

## 3. Ce qui est bien fait / amélioré ✅

### 3.1 Design system Bento
- **CSS custom cohérent** : `.surface`, `.bento-card`, `.bento-btn`, `.bento-tag`, `.bento-input` avec ombres portées `box-shadow` et transitions `transform`
- **Palette restreinte** : slate-900, indigo-600, amber-400, emerald — très identitaire
- **Composants réutilisables** : `EntityCard`, `PageShell`, `StatCard`, `StatusPill`, `EmptyState`, `Pagination`
- **Responsive** : menu mobile burger, grid responsive, breakpoints sm/lg
- **Accessibilité de base** : `aria-label`, `aria-invalid`, `aria-describedby`, `aria-expanded`, `aria-hidden`

### 3.2 Authentification
- **Passage réussi** de localStorage à Auth.js v5 avec Credentials provider
- **Hash bcrypt** côté serveur dans `registerUser`
- **Session JWT** avec 30 jours de durée
- **Rôles dans le token** : `role`, `associationMember`, `organization`, `firstName`, `lastName`
- **Auto-login après inscription** : flow `registerUser` → `signIn` → redirect `/onboarding`
- **Comptes de démo** prêts : 7 users seedés avec mots de passe hashés

### 3.3 Schéma de données
- **20 modèles Prisma** très complets : `User`, `Company`, `Supplier`, `Job`, `Training`, `CandidateProfile`, `IndependentProfile`, `SubcontractingMission`, `Article`, `NewsletterSubscriber`, etc.
- **Soft deletes** : `deletedAt` sur presque toutes les tables
- **Relations bien typées** : cascade delete où pertinent
- **Statuts uniformisés** : `draft`, `pending`, `approved`, `rejected`, `suspended`, `archived`, `published`

### 3.4 Server Actions
- **`registerUser`** : transaction Prisma créant User + UserProfile + entité métier (Company/Supplier/Candidate/etc.)
- **`updateEntityStatus`** : admin modère 6 types d'entités avec log `AnalyticsEvent`
- **`exportModerationQueue`** : export CSV admin
- **Zod validation** sur toutes les actions critiques
- **`revalidatePath`** utilisé après mutations

### 3.5 Sécurité
- **Middleware NextAuth** sur toutes les routes sauf statiques
- **Route guards** côté serveur : `/admin` bloqué aux non-admins, `/emploi/nouvelle-offre` bloqué aux rôles non entreprise
- **CSP headers** dans `next.config.mjs` : `default-src 'self'`, `frame-ancestors 'none'`, `X-Frame-Options: DENY`
- **HSTS en production** : `max-age=63072000`
- **Permissions policy** : camera/micro/géo désactivés
- **Callback URL sécurisé** : validation `window.location.origin` dans `LoginForm`

### 3.6 Seed et données de test
- **Seed Prisma riche** (317 lignes) : 7 users, 1 company approuvée, 1 job publié, 5 fournisseurs, 2 missions sous-traitance, 1 formation, 1 article, 1 candidat
- **Parcours QA documentés** dans `docs/qa-v0-audit.md`
- **Tests E2E Playwright** : login société, login admin, inscription complète

### 3.7 Pages publiques complètes
- Homepage avec stats dynamiques (count DB)
- Annuaire sociétés avec recherche serveur
- Annuaire fournisseurs (préparé)
- Job board avec recherche, pagination, cartes cliquables
- Formations avec recherche, pagination, badges prix/durée
- Sous-traitance avec **garde serveur stricte** (affiche "Accès refusé" aux non-membres)
- Pages légales : CGU, mentions légales, politique confidentialité
- Onboarding visuel avec les 5 étapes

### 3.8 Dashboards conditionnels
- `MyDashboard` adapte le contenu selon le rôle
- `CandidateDashboard` enrichi avec candidatures réelles
- Fallbacks pour `training_organization`, `author`, `registered_user`
- Badge "Membre association" dynamique

### 3.9 Admin
- Table de modération avec 6 types d'entités
- Actions Valider / Refuser (avec motif) / Archiver
- Stats : file admin, en attente, publiés, paiement
- Export CSV
- Logs `AnalyticsEvent` sur chaque action admin

---

## 4. Problèmes et risques identifiés ⚠️

### 4.1 Bloquant — Edge Runtime warnings
**Symptôme :** `npm run build` passe mais Next.js signale que `Prisma`, `bcryptjs`, `jose` sont importés dans le middleware Edge.

**Risque :** Sur Vercel ou tout hébergeur Edge, le middleware plantera.

**Cause :** `middleware.ts` importe `NextAuth(authConfig)`, mais `auth.config.ts` ne devrait contenir que du code edge-compatible. Or `auth.ts` importe `prisma` et `bcryptjs`.

**Correction requise :**
```ts
// middleware.ts — garder SEULEMENT authConfig edge-safe
import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // sans Prisma/bcrypt
```
Et déplacer la logique credentials Prisma dans `auth.ts` qui tourne en Node runtime.

### 4.2 Bloquant — Annuaire fournisseurs vide en production
**Symptôme :** Le seed crée 5 fournisseurs avec `verificationStatus: "approved"`, mais le QA note 0 fournisseurs visibles.

**Hypothèses :**
- Le filtre `getPublishedSuppliers` exclut peut-être les fournisseurs sans `deletedAt: null` (le seed ne set pas `deletedAt`, donc c'est `null` — OK)
- Ou la fonction `getPublishedSuppliers` filtre sur un autre champ

**Vérification nécessaire :** lire `lib/actions/suppliers.ts` et comparer avec le seed.

### 4.3 Bloquant — Pas de page détail fournisseur
**Symptôme :** `/annuaire/fournisseurs/supplier-1` renvoie 404.

**Impact :** L'assistant conversationnel et les cartes ne mènent nulle part.

### 4.4 Haut — Formulaires métier post-onboarding incomplets
**Symptôme :** Après inscription, l'utilisateur arrive sur `/onboarding` (visuel) puis `/dashboard`, mais :
- Pas de formulaire complet société (SIRET, zones, services, documents)
- Pas de formulaire fournisseur (catégories, catalogue, couverture)
- Pas de formulaire indépendant (assurance, SIRET, équipement)
- Pas de formulaire organisme (Qualiopi, numéro déclaration)
- Score de complétion mocké (30-35% en dur)

### 4.5 Haut — RGPD incomplet
**Manque :**
- Bannière cookies / consentement
- Case RGPD explicite séparée des CGU (actuellement fusionnée dans "termsAccepted")
- Droit à l'oubli (pas de route `/supprimer-compte`)
- Export données utilisateur
- Durée de conservation non documentée
- DPO / contact RGPD non indiqué

### 4.6 Haut — Pas de rate limiting
**Risque :** Brute force sur `/connexion`, spam inscription, spam newsletter.

**Solution :** `lru-cache` ou `rate-limiter-flexible` sur les Server Actions critiques.

### 4.7 Moyen — Pas d'upload fichiers
**Impact :** Pas de CV, pas de logo entreprise, pas de documents SIRET/assurance.

**Solution :** Préparer une abstraction upload (S3 / Cloudflare R2 / UploadThing) avec validation type/mime/taille.

### 4.8 Moyen — Tests insuffisants
- Seulement 3 specs E2E (auth + navigation)
- Manque : candidature, admin validation, sous-traitance, inscription avec chaque rôle
- Pas de tests unitaires sur les permissions, les Server Actions, le CSV

### 4.9 Moyen — Email en mode console uniquement
**État :** `RESEND_API_KEY` manquant → emails loggués en console.
**Impact :** Aucune vraie notification ne part.

### 4.10 Moyen — Pas de gestion d'erreurs utilisateur
- Les Server Actions retournent `{ success: false, message: "..." }` mais le UI n'affiche pas toujours les toasts/flash messages
- Pas de composant `Toaster` / `Sonner`
- Le refus admin affiche le motif dans la DB mais pas dans l'UI du demandeur

### 4.11 Faible — SEO technique
- Pas de `robots.txt`
- Pas de `sitemap.xml`
- Pas de ` StructuredData` (Schema.org Organization/JobPosting/Course)
- Pas de métadonnées dynamiques par page détail
- Pas de `OpenGraph` images

### 4.12 Faible — Performance
- Pas de `next/image` optimisé (pas vu dans les composants lus)
- Pas de lazy loading sur les listes longues
- Pas de `React.Suspense` sur les pages publiques (sauf `/connexion`)
- Pas de `loading.tsx` par segment

---

## 5. Scoring par module (0-10)

| Module | Score | Commentaire |
|--------|-------|-------------|
| Design system / UI | 8.5 | Bento cohérent, responsive, accessible de base |
| Auth / Sessions | 7.5 | Auth.js v5 beta, JWT, rôles, mais Edge warning |
| Schéma données | 8.5 | Très complet, soft deletes, relations propres |
| Inscription / Onboarding | 6.5 | Flow fonctionnel, mais manque formulaires métier profonds |
| Dashboards | 7.0 | Conditionnels, candidat avancé, mais metrics mockées |
| Annuaire sociétés | 7.5 | Liste + recherche + fiches détail OK |
| Annuaire fournisseurs | 4.0 | Seed présent mais affichage vide / 404 détail |
| Job board | 6.5 | Liste, recherche, pagination, mais candidature basique |
| Formations | 6.5 | Liste + détail, mais pas de création/session réelle |
| Sous-traitance | 6.0 | Garde serveur stricte, mais missions vides, pas de candidature |
| Association | 5.0 | Statuts définis, mais workflow pas entièrement branché |
| Admin | 7.0 | Modération réelle, CSV, logs, mais UI basique |
| RGPD | 4.0 | Pages légales existent, mais manque consentement, oubli, export |
| Sécurité headers | 8.0 | CSP, HSTS, X-Frame, Permissions-Policy |
| Tests | 4.5 | E2E basiques, pas de tests unitaires, pas de coverage |
| Documentation | 8.5 | 3 docs riches (plan, audit produit, QA) |
| **Moyenne** | **6.6/10** | Bon prototype, besoin de profondeur métier + infra |

---

## 6. Roadmap recommandée (priorisée)

### Sprint 1 — Stabilité technique (1-2 jours)
1. **Corriger Edge Runtime** : séparer `auth.config.ts` (edge-safe) de `auth.ts` (Node)
2. **Vérifier `getPublishedSuppliers`** : pourquoi les 5 fournisseurs seedés n'apparaissent pas
3. **Ajouter `loading.tsx`** sur les segments principaux
4. **Ajouter `error.tsx`** ou boundary global

### Sprint 2 — Profondeur métier (3-5 jours)
5. **Formulaire société complet** : SIRET, adresse, services (multi-select), zones, documents
6. **Formulaire fournisseur complet** : catégorie, services, couverture, contact
7. **Formulaire indépendant** : SIRET, assurance, équipement, tarifs, mobilité
8. **Formulaire candidat** : CV upload, expérience, contrats, disponibilité
9. **Score de complétion réel** : calculé depuis les champs remplis

### Sprint 3 — Parcours critiques (2-3 jours)
10. **Candidature complète** : page offre → formulaire candidature → suivi
11. **Dashboard société** : candidatures reçues, actions recruteur
12. **Création mission sous-traitance** : par membre associé
13. **Candidature mission** : par indépendant membre

### Sprint 4 — Production-ready (2-3 jours)
14. **Rate limiting** : login, signup, newsletter, contact
15. **RGPD minimum** : cookie banner, suppression compte, export données
16. **SEO** : sitemap, robots, metadata dynamiques
17. **Emails** : brancher Resend (ou au moins logguer proprement)
18. **Tests E2E** : candidature, admin validation, sous-traitance, 404

### Sprint 5 — Infra (1 jour de préparation)
19. **Migrer SQLite → PostgreSQL** (Supabase ou autre)
20. **Préparer variables d'environnement prod**
21. **Vérifier build sans warning**

---

## 7. Décision produit : faut-il mettre en ligne ?

**Réponse : NON encore.**

**Critères bloquants avant mise en ligne :**
- [ ] Edge Runtime corrigé
- [ ] Rate limiting en place
- [ ] RGPD minimum (consentement + suppression)
- [ ] Fournisseurs visibles + pages détail
- [ ] Candidature complète fonctionnelle
- [ ] Pas de 404 sur les liens publics
- [ ] Build 100% clean (0 warning critique)

**Ce qui peut attendre V1.1 :**
- Upload fichiers réel
- Notifications email réelles
- Matching IA
- Messagerie interne
- Application mobile
- Analytics avancés

---

## 8. Conclusion

**Tu as bien amélioré le projet.** Le passage d'un prototype localStorage à une vraie stack Next.js + Auth.js + Prisma est un saut qualitatif énorme. Le design system Bento est professionnel, le schema DB est mature, et les parcours critiques (inscription, login, dashboard, admin) sont fonctionnels.

**Le prochain niveau** n'est plus technique : c'est **métier**. Il faut maintenant remplir les formulaires post-onboarding, finaliser les parcours candidature/sous-traitance, et corriger les frictions Edge/RGPD avant d'ouvrir au public.

**Le fichier le plus important à corriger en priorité :** `middleware.ts` + `auth.config.ts` pour isoler le code Edge-compatible.
