import { ResourceCategoryPage, categoryPageMetadata } from "@/components/resources/category-page";

export const metadata = categoryPageMetadata("modeles");

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <ResourceCategoryPage categorySlug="modeles" searchParams={searchParams} />;
}
