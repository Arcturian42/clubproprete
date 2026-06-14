# Connexion / inscription avec Google

## Architecture (important)

Cette application utilise **Auth.js (next-auth) v5** pour l'authentification, et
**Supabase uniquement comme base de données PostgreSQL** (`DATABASE_URL`).

L'app **n'utilise pas Supabase Auth** (le système d'auth intégré de Supabase).
Activer le provider Google dans le tableau de bord Supabase **ne branche donc
rien** sur le login de l'application : Supabase Auth et Auth.js sont deux
systèmes distincts.

Le login/signup Google est géré **par Auth.js directement**. C'est ce qui a été
implémenté ici.

## Ce qui a été codé

- Provider **Google** ajouté à Auth.js (`auth.ts`), activé seulement si les
  identifiants sont présents (sinon le bouton est masqué et seul l'email/mot de
  passe fonctionne — aucun changement de comportement).
- **Création / liaison de compte** lors d'une connexion Google (pas d'adapter
  Prisma : on résout l'utilisateur en base nous-mêmes) :
  - email Google **déjà connu** → connexion au compte existant (liaison par
    email, y compris pour un compte créé au départ par mot de passe) ;
  - email **inconnu** → création d'un `User` (`mainRole: "registered_user"`,
    `emailVerified: true`) + `UserProfile`, comme l'inscription classique ;
  - email Google non vérifié → refusé.
- Bouton **« Continuer avec Google »** sur `/connexion` (→ `/dashboard`) et
  `/inscription` (→ `/onboarding`).

## Étapes pour l'activer (à faire côté toi)

1. **Google Cloud Console → API & Services → Identifiants** :
   créer un identifiant **OAuth 2.0 – Application Web**.
2. **URI de redirection autorisées** (exactement) :
   - `https://<ton-domaine-de-prod>/api/auth/callback/google`
   - `https://clubproprete-...vercel.app/api/auth/callback/google` (si tu testes
     sur le domaine Vercel)
   - `http://localhost:3000/api/auth/callback/google` (dev local)

   > ⚠️ Le callback est celui d'**Auth.js** (`/api/auth/callback/google`), **pas**
   > celui de Supabase (`https://<projet>.supabase.co/auth/v1/callback`).
   > Si tu as déjà créé un client OAuth pointant vers Supabase, tu peux réutiliser
   > le **même** client : ajoute simplement les URI ci-dessus à ses redirections
   > autorisées.
3. **Vercel → Project → Settings → Environment Variables** (Production + Preview) :
   - `AUTH_GOOGLE_ID` = le *Client ID* (`...apps.googleusercontent.com`)
   - `AUTH_GOOGLE_SECRET` = le *Client secret* (`GOCSPX-...`)
   - Vérifier que `AUTH_SECRET` est défini (déjà requis) et que
     `AUTH_TRUST_HOST="true"`.
4. **Redéployer**. Le bouton « Continuer avec Google » apparaît automatiquement.

## Vérifier en local

```bash
# dans .env.local
AUTH_GOOGLE_ID="...apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-..."
npm run dev
# puis /connexion ou /inscription → "Continuer avec Google"
```
