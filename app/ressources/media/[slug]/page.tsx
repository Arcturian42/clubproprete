import { redirect } from "next/navigation";
import { resourceStaticParams } from "@/components/resources/resource-detail-page";

// Les anciennes pages « média » (landing statiques) sont remplacées par le blog
// (bloc Actualités de /ressources). On garde les slugs connus (404 sinon) et on
// redirige vers le blog.
export const dynamicParams = false;

export function generateStaticParams() {
  return resourceStaticParams("media");
}

export default function Page() {
  redirect("/ressources#actualites");
}
