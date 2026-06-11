import { ResourceCategoryPage, categoryPageMetadata } from "@/components/resources/category-page";

export const metadata = categoryPageMetadata("appels-offres");

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <ResourceCategoryPage categorySlug="appels-offres" searchParams={searchParams} />;
}
