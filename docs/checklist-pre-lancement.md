# Checklist Pré-Lancement — ClubPropreté.com

**Objectif :** Passer de localhost (SQLite) à production (Supabase + Vercel + domaine acheté)

---

## 🔴 BLOQUANT — À faire impérativement avant le lancement

### 1. Base de données

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 1.1 | Convertir Prisma vers Postgres | **Bloquant** : `schema.prisma` et migrations actuelles sont SQLite-only | Code |
| 1.2 | Créer une baseline Postgres propre | Repartir du schéma final ou régénérer un historique compatible Postgres | Prisma |
| 1.3 | Créer un projet Supabase | Nouveau projet, région `eu-west-3` (Paris) | Supabase Dashboard |
| 1.4 | Récupérer `DATABASE_URL` | Connection string Postgres avec pgbouncer | Supabase Settings → Database |
| 1.5 | Migrer le schéma Prisma | `npx prisma migrate deploy` (pas `dev` en prod) sur une base preview vide | CLI Prisma |
| 1.6 | Vérifier les migrations | `npx prisma validate` + test applicatif sur preview | CLI Prisma |
| 1.7 | Seed initial (optionnel) | `npx prisma db seed` avec données de démo | CLI Prisma |
| 1.8 | Activer Row Level Security (RLS) | Sur toutes les tables sensibles (User, CandidateProfile, JobApplication) | Supabase SQL Editor |
| 1.9 | Configurer les backups | Daily backups activés | Supabase Dashboard |

### 2. Authentification & sécurité

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 2.1 | Générer `AUTH_SECRET` | `openssl rand -base64 32` | Terminal |
| 2.2 | Configurer `NEXT_PUBLIC_APP_URL` | `https://clubproprete.com` | Vercel Env |
| 2.3 | Configurer `AUTH_TRUST_HOST` | `true` en production/Vercel | Vercel Env |
| 2.4 | Vérifier bcrypt en prod | `bcryptjs` fonctionne sur Vercel (pas besoin de natif) | Test déploy |
| 2.5 | Rate-limiter Redis | Remplacer le rate-limiter en mémoire par Upstash Redis | Upstash |
| 2.6 | Vérifier CSP en prod | `unsafe-eval` retiré en production | `next.config.mjs` |
| 2.7 | Vérifier middleware Auth.js | Confirmer en preview que le warning Edge `jose` ne bloque pas les routes protégées | Vercel Preview |

### 3. Emails

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 3.1 | Créer compte Resend | `resend.com`, vérifier le domaine | Resend Dashboard |
| 3.2 | Configurer `RESEND_API_KEY` | Clé API dans Vercel Env | Resend |
| 3.3 | Configurer `FROM_EMAIL` | `noreply@clubproprete.com` | Resend |
| 3.4 | Configurer `ADMIN_EMAIL` | `admin@clubproprete.com` | Vercel Env |
| 3.5 | Tester l'envoi d'email | Inscription + notification admin | Test manuel |

### 4. Uploads & fichiers

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 4.1 | Configurer Supabase Storage | Bucket `avatars`, `documents`, `photos` | Supabase |
| 4.2 | RLS sur Storage | Politiques : user = owner du fichier | Supabase |
| 4.3 | Mettre à jour `app/api/upload` | Utiliser Supabase Storage au lieu du filesystem local | Code |
| 4.4 | Bloquer le stockage local en prod | ✅ `public/uploads` refusé en prod sauf `ALLOW_LOCAL_UPLOADS=true` | Code |

---

## 🟠 IMPORTANT — À faire dans les 48h après le lancement

### 5. SEO & Analytics

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 5.1 | Acheter le domaine | `clubproprete.com` (ou `.fr` si disponible) | Registrar |
| 5.2 | Configurer DNS sur Vercel | Nameservers Vercel ou CNAME/A record | Vercel + Registrar |
| 5.3 | Activer HTTPS | Certificat auto par Vercel | Vercel |
| 5.4 | Google Search Console | Ajouter le site, soumettre sitemap | Google |
| 5.5 | Google Analytics 4 | Script dans `layout.tsx` | GA4 |
| 5.6 | Métadonnées OpenGraph | `metadata` sur toutes les pages | Code |

### 6. Monitoring & Logs

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 6.1 | Vercel Analytics | Activer dans le dashboard Vercel | Vercel |
| 6.2 | Vercel Speed Insights | Activer | Vercel |
| 6.3 | Sentry (optionnel) | Capture d'erreurs côté client/serveur | Sentry |
| 6.4 | Logs Supabase | Activer les logs slow queries | Supabase |

### 7. RGPD & Légal

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 7.1 | Page mentions légales | ✅ Déjà présente | — |
| 7.2 | Page CGU | ✅ Déjà présente | — |
| 7.3 | Page politique confidentialité | ✅ Déjà présente | — |
| 7.4 | Bannière cookies | Si Google Analytics ou autre tracker | Code |
| 7.5 | DPO (optionnel) | Désigner un DPO si > 250 salariés | Juridique |
| 7.6 | Register des traitements | Documenter les finalités | Juridique |

---

## 🟡 RECOMMANDÉ — Dans la première semaine

### 8. Performance & Scaling

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 8.1 | CDN images | Utiliser `next/image` avec loader Supabase | Code |
| 8.2 | Cache des pages | `revalidatePath` + `unstable_cache` | Code |
| 8.3 | Pagination sur toutes les listes | `getAdminQueue` n'a pas de pagination | Code |
| 8.4 | Connection pooling | PgBouncer activé côté Supabase | Supabase |

### 9. Tests & CI/CD

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 9.1 | Stabiliser les tests e2e | Timeouts serveur de test Playwright | Playwright |
| 9.2 | GitHub Actions | ✅ Workflow `.github/workflows/ci.yml` : Prisma, typecheck, unit, build, e2e | GitHub |
| 9.3 | Preview deployments | Vercel preview sur chaque PR | Vercel |
| 9.4 | Tests de charge | k6 ou Artillery sur les routes critiques | k6 |

### 10. Produit & Onboarding

| # | Tâche | Détail | Outil |
|---|---|---|---|
| 10.1 | UI demande de reco | Formulaire client pour initier une reco | Code |
| 10.2 | Emails reco | Brancher `sendRecommendationRequestEmail` | Resend + Code |
| 10.3 | Onboarding wizard | Guide pas à pas pour les nouveaux inscrits | Code |
| 10.4 | Notifications in-app | Toast / badge pour nouvelles candidatures | Code |
| 10.5 | Dark mode | `next-themes` | Code |

---

## 📋 Variables d'environnement (Vercel)

```
# Base de données
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Auth.js v5
AUTH_SECRET="[openssl rand -base64 32]"
AUTH_TRUST_HOST="true"

# App
NEXT_PUBLIC_APP_URL="https://clubproprete.com"

# Email
RESEND_API_KEY="re_xxxxxxxx"
FROM_EMAIL="noreply@clubproprete.com"
ADMIN_EMAIL="admin@clubproprete.com"

# Rate limiter (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://[...].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[token]"

# Supabase Storage
ALLOW_LOCAL_UPLOADS="false"
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"
```

---

## 🚀 Ordre de déploiement recommandé

```
Jour 1 : Supabase projet + migrations + seed
Jour 1 : Vercel projet + env vars + déploiement initial
Jour 1 : Domaine + DNS + HTTPS
Jour 2 : Resend + emails test
Jour 2 : Google Search Console + Analytics
Jour 3 : Stabiliser e2e + CI/CD GitHub
Jour 4 : Tests de charge + corrections
Jour 5 : Lancement soft (beta fermée)
Jour 7 : Lancement public
```

---

*Checklist générée après audit complet. À valider point par point avant le go-live.*
