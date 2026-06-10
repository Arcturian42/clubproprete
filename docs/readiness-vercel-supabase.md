# Readiness Vercel + Supabase

Date : 10 juin 2026

## Verdict court

Le code Next.js est exploitable en local et passe les validations actuelles. Le point bloquant avant Supabase n'est pas l'applicatif, mais la couche Prisma : le projet est encore configure pour SQLite et les migrations existantes sont du SQL SQLite.

Il ne faut pas executer les migrations actuelles sur Supabase/Postgres.

## Deja sain cote code

- Build Next.js OK.
- TypeScript OK.
- Schema Prisma valide en configuration locale.
- Tests unitaires permissions OK.
- Tests E2E Playwright OK lors de l'audit local.
- Auth.js isole la logique credentials Prisma/bcrypt dans `auth.ts`.
- Middleware edge-safe cote imports applicatifs : il ne charge pas directement Prisma/bcrypt.
- Uploads proteges par auth, rate limit, extension, taille et signature binaire.
- Upload local bloque en production sauf opt-in `ALLOW_LOCAL_UPLOADS=true`.
- Headers securite configures dans `next.config.mjs`.
- Sitemap et robots dynamiques presents.

## Bloquant avant Supabase

### Prisma est encore en SQLite

Le fichier `prisma/schema.prisma` declare :

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Les migrations contiennent aussi du SQL SQLite (`DATETIME`, `REAL`, `PRAGMA foreign_keys`, rebuild de table via `new_Job`, `TEXT NOT NULL PRIMARY KEY`). Elles ne sont pas un historique Postgres deployable.

### Action requise

Avant Vercel + Supabase :

1. Creer une branche dediee de migration Postgres.
2. Basculer `provider = "postgresql"` dans `prisma/schema.prisma`.
3. Remplacer l'historique SQLite par une baseline Postgres propre, ou repartir d'une migration initiale Postgres generee depuis le schema final.
4. Lancer `prisma migrate deploy` sur une base Supabase vide de preview.
5. Relancer seed, typecheck, build et E2E contre cette base preview.

## Points a verifier en preview Vercel

- Warning build `next-auth` / `jose` dans le middleware Edge : verifier que les routes protegees fonctionnent bien en preview.
- Emails : sans `RESEND_API_KEY`, les emails sont refuses en production.
- Uploads : brancher Supabase Storage/R2/S3 avant d'autoriser les uploads prod.
- Rate limiting : le store en memoire est acceptable en local, pas fiable en multi-instance.
- Monitoring : activer au minimum Vercel logs/analytics, idealement Sentry.

## Go / No-Go

No-Go Supabase tant que Prisma reste en SQLite.

Go pour continuer le polish produit local, les tests, et la preparation Vercel hors base de donnees.
