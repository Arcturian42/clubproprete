import { z } from "zod";

/**
 * SIRET optionnel : accepté vide, sinon doit comporter exactement 14 chiffres
 * (les espaces sont ignorés). Normalise la valeur stockée sans espaces.
 */
export const optionalSiret = z
  .string()
  .optional()
  .transform((value) => (value ? value.replace(/\s+/g, "") : value))
  .refine((value) => !value || /^\d{14}$/.test(value), "Le SIRET doit comporter 14 chiffres.");
