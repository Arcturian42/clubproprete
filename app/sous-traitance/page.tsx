import Link from "next/link";
import { LockKeyhole, Send } from "lucide-react";
import { auth } from "@/auth";
import { EntityCard } from "@/components/entity-card";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { getPublishedSubcontractingMissions } from "@/lib/actions/subcontracting";

export default async function SubcontractingPage() {
  const session = await auth();
  const user = session?.user;

  const canAccess =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.associationMember === true;

  const missions = canAccess ? await getPublishedSubcontractingMissions() : [];
  const applicationsCount = missions.reduce(
    (total, mission) => total + mission._count.applications,
    0
  );

  return (
    <PageShell
      eyebrow="Privé"
      title="Sous-traitance entre membres"
      description="Module réservé aux membres vérifiés de l'association. Accès exclusif aux professionnels confirmés."
      actions={
        <Link href="/association" className="bento-btn bento-btn-primary">
          Vérifier l'association
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Accès"
          value={canAccess ? "Autorisé" : "Bloqué"}
          detail="Membre association"
        />
        <StatCard
          label="Missions"
          value={canAccess ? String(missions.length) : "Réservé"}
          detail={canAccess ? "Disponibles actuellement" : "Membres uniquement"}
        />
        <StatCard
          label="Candidatures"
          value={canAccess ? String(applicationsCount) : "Réservé"}
          detail={canAccess ? "Postulées" : "Membres uniquement"}
        />
      </div>

      <div className="surface mt-6 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <LockKeyhole size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Règle d'accès</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Non connecté, utilisateur simple, candidat seul, fournisseur non membre ou société non membre : aucune
              consultation des missions privées. Les membres vérifiés ont accès à toutes les missions.
            </p>
          </div>
        </div>
      </div>

      {canAccess ? (
        missions.length === 0 ? (
          <EmptyState
            title="Aucune mission disponible"
            description="Les missions publiées apparaîtront ici dès qu'un membre en publiera une."
          />
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {missions.map((mission) => (
              <EntityCard
                key={mission.id}
                title={mission.title}
                subtitle={`${mission.creator.firstName ?? ""} ${mission.creator.lastName ?? ""} · ${mission.city ?? ""}`}
                meta={[
                  mission.serviceType,
                  mission.urgencyLevel,
                  `${mission._count.applications} candidature(s)`,
                ].filter((m): m is string => !!m)}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-500">Postulez directement à cette mission.</p>
                  <Send className="text-indigo-600" size={22} aria-hidden="true" />
                </div>
              </EntityCard>
            ))}
          </div>
        )
      ) : (
        <div className="surface mt-6 p-8 text-center">
          <h2 className="text-lg font-black text-slate-900">Accès refusé</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
            Vous devez être membre vérifié de l'association pour consulter les missions privées.
            Rejoignez l'association ou connectez-vous avec un compte autorisé.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {!user ? (
              <Link href="/connexion" className="bento-btn bento-btn-primary">
                Se connecter
              </Link>
            ) : null}
            <Link href="/association" className="bento-btn">
              Devenir membre
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
