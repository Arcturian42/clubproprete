import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getPublicMembers } from "@/lib/actions/public";
import { BadgeCheck, MapPin, Search, ShieldCheck, UserRound } from "lucide-react";

export const metadata = {
  title: "Annuaire des membres",
  description:
    "Découvrez les professionnels du réseau Club Propreté : dirigeants, indépendants, fournisseurs, formateurs et experts du secteur de la propreté.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MembersDirectoryPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const members = await getPublicMembers({ query: q });

  return (
    <PageShell
      eyebrow="Réseau"
      title="Annuaire des membres"
      description="Les professionnels du réseau Club Propreté qui ont rendu leur profil public : dirigeants, indépendants, fournisseurs, formateurs et experts du secteur."
    >
      <form method="get" className="mb-6 flex max-w-xl gap-2" role="search">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={q || ""}
            placeholder="Rechercher par nom, ville ou activité…"
            className="input-soft pl-10"
            aria-label="Rechercher un membre"
          />
        </div>
        <button type="submit" className="btn-soft btn-soft-primary shrink-0">
          Rechercher
        </button>
      </form>

      {members.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <UserRound size={36} className="mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-semibold text-slate-700">
            {q ? `Aucun membre trouvé pour « ${q} ».` : "Aucun membre public pour le moment."}
          </p>
          {q && (
            <Link href="/membres" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
              Voir tous les membres
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {members.length} membre{members.length > 1 ? "s" : ""}
            {q ? ` pour « ${q} »` : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const fullName =
                `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Membre";
              return (
                <Link
                  key={member.id}
                  href={`/membres/${member.id}`}
                  className="card-soft flex items-start gap-4 p-5 transition-shadow hover:shadow-md"
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <UserRound size={24} className="text-slate-400" aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <span className="truncate">{fullName}</span>
                      {member.profile?.verificationStatus === "approved" && (
                        <BadgeCheck
                          size={16}
                          className="shrink-0 text-sky-600"
                          aria-label="Profil vérifié"
                        />
                      )}
                    </p>
                    {member.profile?.headline && (
                      <p className="mt-0.5 text-sm text-slate-600 line-clamp-2">
                        {member.profile.headline}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {member.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} aria-hidden="true" /> {member.city}
                        </span>
                      )}
                      {member.profile?.associationStatus === "approved" && (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <ShieldCheck size={12} aria-hidden="true" /> Association
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </PageShell>
  );
}
