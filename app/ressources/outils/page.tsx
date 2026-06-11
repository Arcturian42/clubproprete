import { ResourceCategoryPage, categoryPageMetadata } from "@/components/resources/category-page";

export const metadata = categoryPageMetadata("outils");

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <ResourceCategoryPage categorySlug="outils" searchParams={searchParams} />;
}
