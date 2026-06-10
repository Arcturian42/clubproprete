import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";
import { getSubcontractingMissionById, applyToSubcontractingMission } from "@/lib/actions/subcontracting";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Zap,
  Users,
  Mail,
  Phone,
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MissionDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user;

  const mission = await getSubcontractingMissionById(id);

  if (!mission) {
    notFound();
  }

  const isOwner = mission.creatorUserId === user?.id;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  async function handleApply(formData: FormData) {
    "use server";
    const result = await applyToSubcontractingMission(formData);
    if (result.success) {
      redirect(`/association/missions/${id}?applied=1`);
    }
    redirect(`/association/missions/${id}?error=${encodeURIComponent(result.message || "Erreur")}`);
  }

  return (
    <PageShell
      eyebrow="Sous-traitance"
      title={mission.title}
      description={`${mission.serviceType} · ${mission.city || "Ville non précisée"}`}
      actions={
        <Link href="/association" className="bento-btn">
          <ArrowLeft size={16} className="mr-1" />
          Retour
        </Link>
      }
    >
      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Type" value={mission.serviceType} detail="Service recherché" />
        <StatCard label="Ville" value={mission.city || "Non précisée"} detail={mission.postalCode || ""} />
        <StatCard label="Urgence" value={mission.urgencyLevel || "Normal"} detail="Priorité" />
        <StatCard label="Candidatures" value={String(mission._count.applications)} detail="Reçues" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Description */}
          <article className="surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Description</h2>
            </div>
            <p className="text-base font-medium leading-7 text-slate-600">
              {mission.description || "Aucune description disponible."}
            </p>
          </article>

          {/* Détails */}
          <article className="surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-2 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
                <Briefcase size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Détails de la mission</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {mission.startDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-indigo-600" />
                  <span>Début : {new Date(mission.startDate).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {mission.endDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-indigo-600" />
                  <span>Fin : {new Date(mission.endDate).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {mission.durationEstimate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} className="text-indigo-600" />
                  <span>Durée estimée : {mission.durationEstimate}</span>
                </div>
              )}
              {mission.peopleNeeded && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} className="text-indigo-600" />
                  <span>Personnes nécessaires : {mission.peopleNeeded}</span>
                </div>
              )}
              {mission.budgetInfoOptional && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap size={16} className="text-indigo-600" />
                  <span>Budget : {mission.budgetInfoOptional}</span>
                </div>
              )}
              {mission.locationDetails && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={16} className="text-indigo-600" />
                  <span>Lieu : {mission.locationDetails}</span>
                </div>
              )}
            </div>

            {mission.requiredSkills && (
              <div className="mt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Compétences requises</p>
                <div className="flex flex-wrap gap-2">
                  {mission.requiredSkills.split(",").map((skill) => (
                    <span key={skill.trim()} className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {mission.requiredEquipment && (
              <div className="mt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Équipement requis</p>
                <p className="text-sm text-slate-600">{mission.requiredEquipment}</p>
              </div>
            )}

            {mission.requiredDocuments && (
              <div className="mt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Documents requis</p>
                <p className="text-sm text-slate-600">{mission.requiredDocuments}</p>
              </div>
            )}
          </article>

          {/* Candidatures reçues (si propriétaire) */}
          {(isOwner || isAdmin) && mission.applications.length > 0 && (
            <article className="surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-2 text-white shadow-[3px_3px_0px_#0f172a]">
                  <Send size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Candidatures reçues ({mission.applications.length})</h2>
              </div>
              <div className="space-y-4">
                {mission.applications.map((app) => (
                  <div key={app.id} className="p-4 rounded-[12px] border-2 border-slate-200 bg-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {app.applicant.firstName?.[0]}{app.applicant.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{app.applicant.firstName} {app.applicant.lastName}</p>
                        <p className="text-xs text-slate-500">{app.applicant.email}</p>
                      </div>
                    </div>
                    {app.message && (
                      <p className="text-sm text-slate-600 mb-2 bg-slate-50 p-2 rounded">{app.message}</p>
                    )}
                    {app.proposedPriceOptional && (
                      <p className="text-sm text-slate-600 mb-1">Prix proposé : {app.proposedPriceOptional}</p>
                    )}
                    {app.availability && (
                      <p className="text-sm text-slate-600 mb-2">Disponibilité : {app.availability}</p>
                    )}
                    <div className="flex gap-2">
                      <a
                        href={`mailto:${encodeURIComponent(app.applicant.email || "")}?subject=Re:%20Mission%20${encodeURIComponent(mission.title)}`}
                        className="bento-btn bento-btn-primary text-xs"
                      >
                        <Mail size={12} className="mr-1" />
                        Contacter par email
                      </a>
                      {app.applicant.phone && (
                        <a
                          href={`tel:${encodeURIComponent(app.applicant.phone.replace(/\s/g, ""))}`}
                          className="bento-btn text-xs"
                        >
                          <Phone size={12} className="mr-1" />
                          Appeler
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Créateur */}
          <article className="surface p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Publié par</h2>
            <div className="flex items-center gap-3 mb-4">
              {mission.creator.avatarUrl ? (
                <img src={mission.creator.avatarUrl} alt="" className="w-12 h-12 rounded-full border-2 border-slate-900 object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {mission.creator.firstName?.[0]}{mission.creator.lastName?.[0]}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900">{mission.creator.firstName} {mission.creator.lastName}</p>
                <p className="text-xs text-slate-500">Membre Club Propreté</p>
              </div>
            </div>
            <div className="space-y-2">
              {mission.creator.email && (
                <a href={`mailto:${encodeURIComponent(mission.creator.email)}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600">
                  <Mail size={16} className="text-indigo-600" />
                  {mission.creator.email}
                </a>
              )}
              {mission.creator.phone && (
                <a href={`tel:${encodeURIComponent(mission.creator.phone.replace(/\s/g, ""))}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600">
                  <Phone size={16} className="text-indigo-600" />
                  {mission.creator.phone}
                </a>
              )}
            </div>
          </article>

          {/* CTA Candidature */}
          {!isOwner && !isAdmin && (
            <div className="surface p-6 bg-indigo-50 border-indigo-200">
              <h3 className="text-lg font-black text-slate-900 mb-2">Intéressé par cette mission ?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Envoyez votre candidature directement au propriétaire de la mission.
              </p>
              <form action={handleApply} className="space-y-3">
                <input type="hidden" name="missionId" value={mission.id} />
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-1">
                    Votre message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className="bento-input w-full resize-none"
                    placeholder="Présentez votre expérience, vos disponibilités et votre proposition..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-1">
                    Prix proposé (optionnel)
                  </label>
                  <input
                    name="proposedPriceOptional"
                    type="text"
                    className="bento-input w-full"
                    placeholder="Ex : 2500€ TTC"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-1">
                    Disponibilité
                  </label>
                  <input
                    name="availability"
                    type="text"
                    className="bento-input w-full"
                    placeholder="Ex : Immédiate, à partir du 15/07..."
                  />
                </div>
                <button type="submit" className="bento-btn bento-btn-primary w-full">
                  <Send size={14} className="mr-1" />
                  Candidater
                </button>
              </form>
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <a
                  href={`mailto:${encodeURIComponent(mission.creator.email || "")}?subject=Candidature%20mission%20${encodeURIComponent(mission.title)}`}
                  className="bento-btn w-full text-center text-sm"
                >
                  <Mail size={14} className="mr-1" />
                  Contacter par email
                </a>
              </div>
            </div>
          )}

          {(isOwner || isAdmin) && (
            <div className="surface p-6 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertTriangle size={18} />
                <span className="font-bold">Vous êtes le propriétaire</span>
              </div>
              <p className="text-sm text-amber-600">
                Les candidatures apparaissent dans la section "Candidatures reçues" ci-contre.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
