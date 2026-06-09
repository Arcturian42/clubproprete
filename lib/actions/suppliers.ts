"use server";

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isOfferType, isSupplierFamily, isSupplierSubCategory } from "@/lib/supplier-taxonomy";
import type { OfferType, SupplierFamily } from "@/lib/supplier-taxonomy";

const supplierFiltersSchema = z.object({
  search: z.string().trim().optional(),
  family: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || isSupplierFamily(value), "Famille fournisseur invalide."),
  subCategory: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || isSupplierSubCategory(value), "Sous-catégorie fournisseur invalide."),
  offerType: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || isOfferType(value), "Type d'offre invalide."),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(48).optional(),
});

type ParsedSupplierFilters = z.infer<typeof supplierFiltersSchema>;

export type SupplierFilters = {
  search?: string;
  family?: SupplierFamily | string;
  subCategory?: string;
  offerType?: OfferType | string;
  page?: number;
  limit?: number;
};

export async function getPublishedSuppliers(
  input?: string | SupplierFilters,
  page?: number,
  limit = 12
) {
  const rawInput =
    typeof input === "string"
      ? { search: input, page, limit }
      : { ...input, page: input?.page ?? page, limit: input?.limit ?? limit };
  const parsed = supplierFiltersSchema.safeParse(rawInput);
  const filters: ParsedSupplierFilters = parsed.success ? parsed.data : { page, limit };

  const where: Prisma.SupplierWhereInput = {
    verificationStatus: "approved",
    deletedAt: null,
  };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { category: { contains: filters.search } },
      { family: { contains: filters.search } },
      { subCategory: { contains: filters.search } },
      { deliveryAreas: { contains: filters.search } },
      { services: { some: { title: { contains: filters.search } } } },
    ];
  }

  if (filters.family && isSupplierFamily(filters.family)) {
    where.family = filters.family;
  }

  if (filters.subCategory && isSupplierSubCategory(filters.subCategory)) {
    where.subCategory = filters.subCategory;
  }

  if (filters.offerType && isOfferType(filters.offerType)) {
    where.offerType =
      filters.offerType === "vente" || filters.offerType === "location"
        ? { in: [filters.offerType, "les_deux"] }
        : filters.offerType;
  }

  const currentPage = Math.max(1, filters.page ?? 1);
  const take = filters.limit ?? limit;
  const skip = (currentPage - 1) * take;

  const [items, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: { services: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.supplier.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);
  return { items, total, page: currentPage, totalPages };
}
