import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { EntityCard } from "@/components/entity-card";
import { requestAssociationMembership, getMyMembershipRequest } from "@/lib/actions/memberships";
import { ArrowLeft, Shield, FileText, Heart, Handshake, CheckCircle2, Clock } from "lucide-react";

export default async function AdhesionPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/connexion?callbackUrl=/association/adhesion");
  }

  const existingRequest = await getMyMembershipRequest();

  if (existingRequest?.status === "approved") {
    redirect("/association");
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await requestAssociationMembership(formData);
    if (result.success) {
      redirect("/association/adhesion?submitted=1");
    }
    redirect(`/association/adhesion?error=${encodeURIComponent(result.message || "Erreur")}`);
  }

  return (
    <PageShell
      eyebrow="Association"
      title="Demander l'adhésion"
      description="Rejoignez le réseau privé des professionnels de la propreté en France."
      actions={
        <Link href="/association" className="bento-btn">
          <ArrowLeft size={16} className="mr-1" />
          Retour
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto">
        {existingRequest?.status === "pending" ? (
          <EntityCard
            title="Demande en cours d'étude"
            subtitle="Notre équipe examine votre candidature"
            meta={["Délai : 48h ouvrées"]}
          >
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-slate-900 bg-amber-100 flex items-center justify-center">
                <Clock size={28} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Votre demande est en attente de validation
              </h3>
              <p className="text-slate-600 mb-4">
                Notre équipe étudie votre candidature sous 48h ouvrées. Vous serez notifié par email dès que votre adhésion sera validée.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bento-tag border-amber-300 bg-amber-50 text-amber-700">
                  <Clock size={12} className="mr-1" /> En attente
                </span>
                <span className="bento-tag border-slate-300 bg-slate-50 text-slate-600">
                  Soumise le {new Date(existingRequest.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </EntityCard>
        ) : existingRequest?.status === "rejected" ? (
          <EntityCard
            title="Demande refusée"
            subtitle="Votre candidature n'a pas été retenue"
            meta={["Contactez-nous pour plus d'informations"]}
          >
            <div className="text-center py-6">
              <p className="text-slate-600 mb-4">
                Votre demande d'adhésion n'a pas été retenue. Si vous souhaitez obtenir plus d'informations, contactez notre équipe.
              </p>
              <a href="mailto:contact@clubproprete.com" className="bento-btn bento-btn-primary">
                Contacter l'équipe
              </a>
            </div>
          </EntityCard>
        ) : (
          <EntityCard
            title="Formulaire d'adhésion"
            subtitle="Réservé aux sociétés de nettoyage et indépendants"
            meta={["Vérification sous 48h", "Cotisation annuelle"]}
          >
            <form action={handleSubmit} className="space-y-6 mt-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <FileText size={12} className="inline mr-1" /> Votre motivation *
                </label>
                <textarea
                  name="motivation"
                  required
                  minLength={10}
                  rows={4}
                  className="bento-input w-full resize-none"
                  placeholder="Pourquoi souhaitez-vous rejoindre l'association Club Propreté ? Décrivez votre activité et vos objectifs..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Heart size={12} className="inline mr-1" /> Vos besoins
                </label>
                <textarea
                  name="needs"
                  rows={3}
                  className="bento-input w-full resize-none"
                  placeholder="Quels sont vos besoins actuels ? Sous-traitants, recrutement, fournisseurs, formation..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  <Handshake size={12} className="inline mr-1" /> Ce que vous apportez au réseau
                </label>
                <textarea
                  name="contribution"
                  rows={3}
                  className="bento-input w-full resize-none"
                  placeholder="Quelles compétences, ressources ou expériences pouvez-vous partager avec les autres membres ?"
                />
              </div>

              <div className="p-4 rounded-[12px] border-2 border-indigo-200 bg-indigo-50">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-indigo-900 mb-1">Adhésion soumise à cotisation</p>
                    <p className="text-xs text-indigo-700">
                      L'adhésion à l'association Club Propreté est soumise à une cotisation annuelle. 
                      Notre équipe vous contactera après validation de votre demande pour finaliser votre inscription.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="bento-btn bento-btn-primary flex-1">
                  <CheckCircle2 size={16} className="mr-2" />
                  Soumettre ma demande
                </button>
                <Link href="/association" className="bento-btn flex-1 text-center">
                  Annuler
                </Link>
              </div>
            </form>
          </EntityCard>
        )}
      </div>
    </PageShell>
  );
}
