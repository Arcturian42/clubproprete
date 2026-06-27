import { getJobById } from "@/lib/actions/jobs";
import { SITE_NAME } from "@/lib/seo";
import { brandedOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Offre d'emploi — Club Propreté";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const job = await getJobById(id).catch(() => null);

  const subtitleParts = [job?.contractType, job?.company?.city || job?.city].filter(Boolean);
  return brandedOgImage({
    eyebrow: "Offre d'emploi",
    title: job?.title ?? "Offre d'emploi propreté",
    subtitle: subtitleParts.length > 0 ? subtitleParts.join(" · ") : SITE_NAME,
  });
}
