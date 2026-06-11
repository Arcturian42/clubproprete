import {
  ResourceDetailPage,
  resourceDetailMetadata,
  resourceStaticParams,
} from "@/components/resources/resource-detail-page";

// Toutes les ressources valides sont connues au build : tout autre slug renvoie un vrai 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return resourceStaticParams("comparatifs");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return resourceDetailMetadata("comparatifs", slug);
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ResourceDetailPage categorySlug="comparatifs" params={params} />;
}
