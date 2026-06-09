import Link from "next/link";
import { BadgeCheck, LockKeyhole } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { JoinAssociationButton } from "@/components/join-association-button";
import { getApprovedMemberships } from "@/lib/actions/memberships";
import { prisma } from "@/lib/prisma";

export default async function AssociationPage() {
  const approvedMemberships = await getApprovedMemberships();
  const publishedMissionsCount = await prisma.subcontractingMission.count({
    where: { status: "published", deletedAt: null },
  });

  return (
    <PageShell
      eyebrow="Association"
      title="Club gratuit avec adhésion"
      description="Rejoignez le club des professionnels vérifiés : accès au réseau, missions privées et sous-traitance."
      actions={<JoinAssociationButton />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Membres" value={String(approvedMemberships.length)} detail="Actifs dans le club" />
        <StatCard label="Missions" value={String(publishedMissionsCount)} detail="Disponibles ce mois" />
        <StatCard label="Accès" value="Réservé" detail="Membres vérifiés" />
      </div>

      {approvedMemberships.length === 0 ? (
        <EmptyState
          title="Aucun membre pour le moment"
          description="Les adhésions approuvées apparaîtront ici. Rejoignez le club pour devenir le premier membre vérifié."
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {approvedMemberships.map((membership) => (
            <EntityCard
              key={membership.id}
              title={`${membership.user.firstName ?? ""} ${membership.user.lastName ?? ""}`.trim() || membership.user.email}
              subtitle={membership.profileType}
              meta={["✓ Vérifié", membership.motivation].filter((m): m is string => !!m)}
            >
              <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-emerald-600">
                <BadgeCheck size={18} aria-hidden="true" />
                Membre vérifié
              </div>
            </EntityCard>
          ))}
        </div>
      )}

      <div className="surface mt-8 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <LockKeyhole size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Sous-traitance privée</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Accès réservé aux membres de l'association. Devenez membre pour accéder aux missions exclusives
              et bénéficier du réseau Club Propreté.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
