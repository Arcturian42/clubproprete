import { ResourceCategoryPage, categoryPageMetadata } from "@/components/resources/category-page";

export const metadata = categoryPageMetadata("guides");

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <ResourceCategoryPage categorySlug="guides" searchParams={searchParams} />;
}
