// Point d'entrée des contenus rédactionnels de la section Ressources.
// Une ressource présente dans `resourceContents` est considérée comme
// publiée : la page détail rend l'intégralité du contenu, la FAQ et les
// données structurées (Article + BreadcrumbList + FAQPage).

import type { ResourceContent } from "./types";
import { initialContents } from "./initial";
import { guidesContents } from "./guides";
import { modelesContents } from "./modeles";
import { outilsContents } from "./outils";
import { mediaContents } from "./media";
import { comparatifsContents } from "./comparatifs";
import { reglementationContents } from "./reglementation";
import { appelsOffresContents } from "./appels-offres";

export type { ContentSection, ResourceFaqItem, ResourceContent } from "./types";

export const resourceContents: Record<string, ResourceContent> = {
  ...initialContents,
  ...guidesContents,
  ...modelesContents,
  ...outilsContents,
  ...mediaContents,
  ...comparatifsContents,
  ...reglementationContents,
  ...appelsOffresContents,
};

export function getResourceContent(id: string): ResourceContent | undefined {
  return resourceContents[id];
}
