import { ResourceCategoryPage, categoryPageMetadata } from "@/components/resources/category-page";

export const metadata = categoryPageMetadata("reglementation");

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <ResourceCategoryPage categorySlug="reglementation" searchParams={searchParams} />;
}
