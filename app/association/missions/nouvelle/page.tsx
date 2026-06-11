import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { EntityCard } from "@/components/entity-card";
import { createSubcontractingMission } from "@/lib/actions/subcontracting";
import { hasApprovedAssociationMembership } from "@/lib/actions/memberships";
import { ArrowLeft, Briefcase, MapPin, Calendar, Clock, Zap, Users, FileText, Save } from "lucide-react";

export default async function NewMissionPage() {
  const session = await auth();
  const user = session?.user;

  // Le JWT peut être périmé (adhésion validée après connexion) : on vérifie aussi en base.
  const dbMembershipApproved = user?.id ? await hasApprovedAssociationMembership(user.id) : false;
  const isAuthorized =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.associationMember === true ||
    dbMembershipApproved;

  if (!isAuthorized) {
    redirect("/association");
  }

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createSubcontractingMission(formData);
    if (result.success && result.mission) {
      redirect(`/association/missions/${result.mission.id}`);
    }
    redirect(`/association/missions/nouvelle?error=${encodeURIComponent(result.message || "Erreur")}`);
  }

  return (
    <PageShell
      eyebrow="Sous-traitance"
      title="Proposer une mission"
      description="Publiez une mission de sous-traitance réservée aux membres de l'association."
      actions={
        <Link href="/association" className="bento-btn">
          <ArrowLeft size={16} className="mr-1" />
          Retour
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto">
        <EntityCard title="Nouvelle mission" subtitle="Réservée aux membres" meta={["Sous-traitance"]}>
          <form action={handleCreate} className="space-y-6 mt-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                <Briefcase size={12} className="inline mr-1" /> Titre de la mission *
              </label>
              <input
                type="text"
                name="title"
                required
                minLength={5}
                className="bento-input w-full"
                placeholder="Ex : Nettoyage fin de chantier — 500m²"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                <FileText size={12} className="inline mr-1" /> Description *
              </label>
              <textarea
                name="description"
                required
                minLength={20}
                rows={5}
                className="bento-input w-full resize-none"
                placeholder="Décrivez la mission, les surfaces, les contraintes, le matériel fourni..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  Type de service *
                </label>
                <select name="serviceType" required className="bento-input w-full">
                  <option value="">Sélectionner...</option>
                  <option value="Nettoyage industriel">Nettoyage industriel</option>
                  <option value="Nettoyage de bureaux">Nettoyage de bureaux</option>
                  <option value="Remise en état">Remise en état</option>
                  <option value="Fin de chantier">Fin de chantier</option>
                  <option value="Vitrerie">Vitrerie</option>
                  <option value="Désinfection">Désinfection</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Zap size={12} className="inline mr-1" /> Niveau d'urgence
                </label>
                <select name="urgencyLevel" className="bento-input w-full">
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <MapPin size={12} className="inline mr-1" /> Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  className="bento-input w-full"
                  placeholder="Ex : Paris"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  className="bento-input w-full"
                  placeholder="75015"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                Précisions sur le lieu
              </label>
              <input
                type="text"
                name="locationDetails"
                className="bento-input w-full"
                placeholder="Ex : 3ème étage sans ascenseur, parking disponible..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Calendar size={12} className="inline mr-1" /> Date de début
                </label>
                <input type="date" name="startDate" className="bento-input w-full" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Calendar size={12} className="inline mr-1" /> Date de fin
                </label>
                <input type="date" name="endDate" className="bento-input w-full" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Clock size={12} className="inline mr-1" /> Durée estimée
                </label>
                <input
                  type="text"
                  name="durationEstimate"
                  className="bento-input w-full"
                  placeholder="Ex : 2 jours"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Users size={12} className="inline mr-1" /> Personnes nécessaires
                </label>
                <input
                  type="number"
                  name="peopleNeeded"
                  min={1}
                  className="bento-input w-full"
                  placeholder="2"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                Budget / Tarif indicatif
              </label>
              <input
                type="text"
                name="budgetInfoOptional"
                className="bento-input w-full"
                placeholder="Ex : 2500€ TTC ou 'À négocier'"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                Compétences requises
              </label>
              <input
                type="text"
                name="requiredSkills"
                className="bento-input w-full"
                placeholder="Ex : CACES, habilitation électrique, expérience 3 ans..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                Équipement requis
              </label>
              <input
                type="text"
                name="requiredEquipment"
                className="bento-input w-full"
                placeholder="Ex : Auto-laveuse, aspirateur industriel..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                Documents requis
              </label>
              <input
                type="text"
                name="requiredDocuments"
                className="bento-input w-full"
                placeholder="Ex : Attestation URSSAF, assurance RC pro..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="bento-btn bento-btn-primary flex-1">
                <Save size={16} className="mr-2" />
                Publier la mission
              </button>
              <Link href="/association" className="bento-btn flex-1 text-center">
                Annuler
              </Link>
            </div>
          </form>
        </EntityCard>
      </div>
    </PageShell>
  );
}
