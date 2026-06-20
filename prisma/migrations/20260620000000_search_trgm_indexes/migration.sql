-- P4 : index de recherche textuelle (trigram) pour les requêtes `contains` +
-- `mode: "insensitive"` (ILIKE '%terme%') des annuaires sociétés et offres.
-- Sans index GIN/trigram, ces recherches dégénèrent en parcours séquentiels de
-- table complète à mesure que les tables grossissent.
--
-- Ces objets ne sont pas représentables dans schema.prisma (GIN + opclass), ils
-- sont donc créés en SQL brut. `IF NOT EXISTS` rend la migration idempotente.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Recherche dans l'annuaire des sociétés (lib/actions/companies.ts).
CREATE INDEX IF NOT EXISTS "idx_company_name_trgm"
  ON "Company" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_company_city_trgm"
  ON "Company" USING gin ("city" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_company_description_short_trgm"
  ON "Company" USING gin ("descriptionShort" gin_trgm_ops);

-- Recherche dans les offres d'emploi (lib/actions/jobs.ts).
CREATE INDEX IF NOT EXISTS "idx_job_title_trgm"
  ON "Job" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_job_description_trgm"
  ON "Job" USING gin ("description" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_job_city_trgm"
  ON "Job" USING gin ("city" gin_trgm_ops);
