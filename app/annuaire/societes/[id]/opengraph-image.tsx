import { getCompanyById } from "@/lib/actions/public";
import { brandedOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Société de nettoyage — Club Propreté";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const company = await getCompanyById(id).catch(() => null);

  const location = [company?.city, company?.region].filter(Boolean).join(", ");
  return brandedOgImage({
    eyebrow: "Société de nettoyage",
    title: company?.name ?? "Société de nettoyage",
    subtitle: company?.descriptionShort || location || "Annuaire Club Propreté",
  });
}
