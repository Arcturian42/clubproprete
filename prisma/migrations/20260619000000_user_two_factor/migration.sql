-- Réconcilie une dérive schéma/migration : les colonnes `twoFactorSecret` et
-- `twoFactorEnabled` existaient dans schema.prisma (modèle User) mais n'avaient
-- jamais été matérialisées par une migration. Résultat : `prisma migrate deploy`
-- produisait une table `User` sans ces colonnes, alors que le client Prisma
-- (généré depuis le schéma) les référence dans ses INSERT/SELECT — d'où l'échec
-- en base.
--
-- `IF NOT EXISTS` rend l'opération idempotente : sans effet sur une base où les
-- colonnes auraient déjà été créées (ex. `prisma db push`).

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
