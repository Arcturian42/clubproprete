import { redirect } from "next/navigation";

// « Actualités & média » n'est plus une rubrique de ressources : c'est le blog,
// présenté dans le bloc dédié de /ressources. On redirige les anciens liens.
export default function Page() {
  redirect("/ressources#actualites");
}
