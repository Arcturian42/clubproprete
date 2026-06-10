"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PermissionError, requireEntityRole, requireUser } from "@/lib/permissions";
import { isOfferType, isSupplierFamily, isSupplierSubCategory, SUPPLIER_TAXONOMY } from "@/lib/supplier-taxonomy";
import type { OfferType, SupplierFamily } from "@/lib/supplier-taxonomy";
import { optionalSiret } from "@/lib/validators";

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

export async function getSupplierByOwner(userId: string) {
  const session = await requireUser();
  if (session.user.id !== userId && session.user.role !== "admin" && session.user.role !== "super_admin") {
    throw new PermissionError("FORBIDDEN", "Vous ne pouvez accéder qu'à vos propres données.");
  }

  const membership = await prisma.entityMember.findFirst({
    where: {
      userId,
      entityType: "supplier",
      status: "active",
      deletedAt: null,
    },
    select: { entityId: true },
    orderBy: { createdAt: "desc" },
  });

  if (membership) {
    return prisma.supplier.findFirst({
      where: { id: membership.entityId, deletedAt: null },
      include: { services: true },
    });
  }

  return prisma.supplier.findFirst({
    where: { ownerUserId: userId, deletedAt: null },
    include: { services: true },
  });
}

const supplierProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Le nom du fournisseur est obligatoire."),
  legalName: z.string().optional(),
  siret: optionalSiret,
  family: z.string().refine(isSupplierFamily, "Famille fournisseur invalide."),
  subCategory: z.string().refine(isSupplierSubCategory, "Sous-catégorie invalide."),
  offerType: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  contactName: z.string().optional(),
  deliveryAreas: z.string().optional(),
  nationalCoverage: z.boolean().default(false),
  services: z.string().optional(),
});

export async function upsertSupplierProfile(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = supplierProfileSchema.safeParse({
      ...raw,
      nationalCoverage: formData.get("nationalCoverage") === "on",
    });

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;
    const offerType = isOfferType(data.offerType) ? data.offerType : null;
    let supplierId = data.id || null;

    if (supplierId) {
      await requireEntityRole(session.user.id, "supplier", supplierId, ["owner", "admin"]);
    } else {
      const existing = await getSupplierByOwner(session.user.id);
      supplierId = existing?.id ?? null;
    }

    const supplierData = {
      name: data.name,
      legalName: data.legalName || null,
      siret: data.siret || null,
      family: data.family,
      subCategory: data.subCategory,
      category: data.subCategory,
      offerType,
      description: data.description || null,
      website: data.website || null,
      email: data.email || null,
      phone: data.phone || null,
      contactName: data.contactName || null,
      deliveryAreas: data.deliveryAreas || null,
      nationalCoverage: data.nationalCoverage,
      verificationStatus: "pending",
    };

    const supplier = supplierId
      ? await prisma.supplier.update({ where: { id: supplierId }, data: supplierData })
      : await prisma.supplier.create({
          data: {
            ownerUserId: session.user.id,
            ...supplierData,
          },
        });

    await prisma.entityMember.upsert({
      where: {
        userId_entityType_entityId: {
          userId: session.user.id,
          entityType: "supplier",
          entityId: supplier.id,
        },
      },
      update: { role: "owner", status: "active", deletedAt: null },
      create: {
        userId: session.user.id,
        entityType: "supplier",
        entityId: supplier.id,
        role: "owner",
      },
    });

    // Élève un compte générique au rôle fournisseur (cumul préservé pour les autres rôles).
    await prisma.user.updateMany({
      where: { id: session.user.id, mainRole: "registered_user" },
      data: { mainRole: "supplier_owner" },
    });

    await prisma.supplierService.deleteMany({ where: { supplierId: supplier.id } });
    const serviceLines = (data.services || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12);

    if (serviceLines.length > 0) {
      await prisma.supplierService.createMany({
        data: serviceLines.map((title) => ({
          supplierId: supplier.id,
          title,
          category: data.subCategory,
          offerType,
          description: null,
          isActive: true,
        })),
      });
    } else {
      await prisma.supplierService.create({
        data: {
          supplierId: supplier.id,
          title: SUPPLIER_TAXONOMY[data.family].label,
          category: data.subCategory,
          offerType,
          isActive: true,
        },
      });
    }

    revalidatePath("/dashboard/fournisseur");
    revalidatePath("/annuaire/fournisseurs");
    revalidatePath(`/annuaire/fournisseurs/${supplier.id}`);
    revalidatePath("/admin");
    return { success: true, supplier };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("upsertSupplierProfile error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
