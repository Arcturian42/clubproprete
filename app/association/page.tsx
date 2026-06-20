import Link from "next/link";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { EntityCard } from "@/components/entity-card";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { JoinAssociationButton } from "@/components/join-association-button";
import { Breadcrumb } from "@/components/breadcrumb";
import { hasApprovedAssociationMembership } from "@/lib/actions/memberships";
import { getPublishedSubcontractingMissions, getMySubcontractingMissions, getMySubcontractingApplications } from "@/lib/actions/subcontracting";
import {
  Shield,
  Users,
  Calendar,
  Video,
  Briefcase,
  Send,
  Mail,
  MapPin,
  Clock,
  Zap,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  GraduationCap,
  Newspaper,
  Handshake,
  Truck,
  BadgeCheck,
  Globe,
  Phone,
} from "lucide-react";

export const metadata = {
  title: "L'association Club Propreté | Réseau privé des pros du nettoyage",
  description:
    "Rejoignez l'association Club Propreté : réseau privé, sous-traitance entre membres, entraide et événements.",
};

export default async function AssociationPage() {
  const session = await auth();
  const user = session?.user;
  const dbMembershipApproved = user?.id ? await hasApprovedAssociationMembership(user.id) : false;
  const isMember = user?.associationMember === true || dbMembershipApproved;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // === DASHBOARD MEMBRE ===
  if (isMember || isAdmin) {
    const missions = await getPublishedSubcontractingMissions();
    const myMissions = await getMySubcontractingMissions();
    const myApplications = await getMySubcontractingApplications();

    return (
      <PageShell
        eyebrow="Espace Membre"
        title="Club Propreté — Association"
        description="Bienvenue dans votre espace privé. Accédez aux missions, événements et au réseau d'entraide."
      >
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Association", href: "/association" }, { label: "Espace membre" }]} />

        {/* Stats rapides */}
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Missions actives" value={String(missions.length)} detail="Dans le réseau" />
          <StatCard label="Mes missions" value={String(myMissions.length)} detail="Publiées" />
          <StatCard label="Mes candidatures" value={String(myApplications.length)} detail="Envoyées" />
          <StatCard label="Statut" value="Membre" detail="Actif" />
        </div>

        {/* Événements & Webinaires */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <EntityCard
            title="Événements à venir"
            subtitle="Rencontres, afterworks et salons professionnels"
            meta={["Networking", "Échanges", "Partenariats"]}
          >
            <div className="space-y-3">
              <div className="card-soft p-3 flex items-start gap-3">
                <div className="rounded-[12px] border-2 border-slate-900 bg-indigo-600 p-2 text-white">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Afterwork Club Propreté — Paris</p>
                  <p className="text-xs text-slate-500">15 juillet 2026 · 18h30 · Paris 15e</p>
                </div>
              </div>
              <div className="card-soft p-3 flex items-start gap-3">
                <div className="rounded-[12px] border-2 border-slate-900 bg-amber-400 p-2 text-slate-900">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Webinaire : Subventions 2026</p>
                  <p className="text-xs text-slate-500">22 juillet 2026 · 14h · En ligne</p>
                </div>
              </div>
              <div className="card-soft p-3 flex items-start gap-3">
                <div className="rounded-[12px] border-2 border-slate-900 bg-emerald-500 p-2 text-white">
                  <Handshake size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Journée portes ouvertes — Lyon</p>
                  <p className="text-xs text-slate-500">5 août 2026 · 9h · Lyon 7e</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 font-bold uppercase tracking-wide">
              Inscriptions ouvertes · Places limitées
            </p>
          </EntityCard>

          <EntityCard
            title="Webinaires enregistrés"
            subtitle="Replay des sessions précédentes"
            meta={["Formation continue", "Replay 30j"]}
          >
            <div className="space-y-3">
              <div className="card-soft p-3 flex items-start gap-3">
                <div className="rounded-[12px] border-2 border-slate-900 bg-indigo-600 p-2 text-white">
                  <Video size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Comment monter un dossier de subvention</p>
                  <p className="text-xs text-slate-500">Replay disponible · 45 min</p>
                </div>
              </div>
              <div className="card-soft p-3 flex items-start gap-3">
                <div className="rounded-[12px] border-2 border-slate-900 bg-indigo-600 p-2 text-white">
                  <Video size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Recrutement dans la propreté en 2026</p>
                  <p className="text-xs text-slate-500">Replay disponible · 38 min</p>
                </div>
              </div>
            </div>
          </EntityCard>
        </div>

        {/* Tableau de bord sous-traitance */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              Missions de sous-traitance
            </h2>
            <Link href="/association/missions/nouvelle" className="bento-btn bento-btn-primary text-sm">
              <Briefcase size={14} className="mr-1" />
              Je sous-traite
            </Link>
          </div>

          {missions.length === 0 ? (
            <EmptyState
              title="Aucune mission disponible"
              description="Soyez le premier membre à publier une mission de sous-traitance."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
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
                    <p className="text-sm font-semibold text-slate-500 line-clamp-2">
                      {mission.description || "Aucune description."}
                    </p>
                  </div>
                  <Link
                    href={`/membres/${mission.creator.id}`}
                    className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Publié par {`${mission.creator.firstName ?? ""} ${mission.creator.lastName ?? ""}`.trim() || "un membre"}
                  </Link>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/association/missions/${mission.id}`}
                      className="bento-btn bento-btn-primary text-sm flex-1 text-center"
                    >
                      <ArrowRight size={14} className="mr-1" />
                      Voir la mission
                    </Link>
                    <a
                      href={`mailto:${encodeURIComponent(mission.creator.email || "")}?subject=Candidature%20mission%20${encodeURIComponent(mission.title)}`}
                      className="bento-btn text-sm"
                    >
                      <Mail size={14} className="mr-1" />
                      Contacter
                    </a>
                  </div>
                </EntityCard>
              ))}
            </div>
          )}
        </div>

        {/* Mes candidatures */}
        {myApplications.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <Send size={20} className="text-indigo-600" />
              Mes candidatures
            </h2>
            <div className="grid gap-3">
              {myApplications.map((app) => (
                <div key={app.id} className="surface p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{app.mission.title}</p>
                    <p className="text-sm text-slate-500">{app.mission.city} · {app.mission.serviceType}</p>
                  </div>
                  <span className={`bento-tag text-xs ${
                    app.status === "submitted" ? "border-amber-300 bg-amber-50 text-amber-700" :
                    app.status === "accepted" ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                    "border-rose-300 bg-rose-50 text-rose-700"
                  }`}>
                    {app.status === "submitted" ? "En attente" :
                     app.status === "accepted" ? "Acceptée" : "Refusée"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Réseau d'entraide */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <a
            href="mailto:contact@clubproprete.com?subject=Demande%20d%E2%80%99acc%C3%A8s%20au%20groupe%20WhatsApp%20Club%20Propret%C3%A9"
            className="block no-underline"
          >
            <EntityCard
              title="Groupe WhatsApp"
              subtitle="Échangez en direct avec les membres"
              meta={["Privé", "Membres uniquement"]}
            >
              <div className="flex items-center gap-2 text-emerald-600">
                <MessageCircle size={18} />
                <span className="text-sm font-bold">Accès réservé aux membres actifs</span>
              </div>
            </EntityCard>
          </a>
          <a
            href="mailto:contact@clubproprete.com?subject=Demande%20d%E2%80%99accompagnement%20ou%20d%E2%80%99information%20sur%20les%20subventions"
            className="block no-underline"
          >
            <EntityCard
              title="Accompagnement subventions"
              subtitle="Auto-laveuse à -70% grâce aux aides"
              meta={["Dossier clé en main", "Fournisseur partenaire"]}
            >
              <div className="flex items-center gap-2 text-indigo-600">
                <Truck size={18} />
                <span className="text-sm font-bold">Contactez l'équipe Club Propreté</span>
              </div>
            </EntityCard>
          </a>
          <a
            href="mailto:contact@clubproprete.com?subject=Demande%20d%E2%80%99information%20sur%20les%20opportunit%C3%A9s%20m%C3%A9dias%20et%20visibilit%C3%A9"
            className="block no-underline"
          >
            <EntityCard
              title="Média & Visibilité"
              subtitle="Publiez sur le blog et accédez aux partenariats"
              meta={["Articles sponsorisés", "Visibilité prioritaire"]}
            >
              <div className="flex items-center gap-2 text-amber-600">
                <Newspaper size={18} />
                <span className="text-sm font-bold">Réservé aux membres</span>
              </div>
            </EntityCard>
          </a>
        </div>
      </PageShell>
    );
  }

  // === LANDING PAGE (non membre / non connecté) ===
  return (
    <PageShell
      eyebrow="Association"
      title="Ne développez plus votre société de nettoyage seul"
      description="Club Propreté est le premier écosystème business privé conçu exclusivement pour les professionnels du nettoyage B2B en France."
      actions={<JoinAssociationButton />}
    >
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Association" }]} />

      {/* Hero section */}
      <div className="surface p-8 mb-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-black text-slate-900 mb-4">
            Un espace structuré, sérieux et ambitieux pour les professionnels de la propreté
          </h2>
          <p className="text-base font-medium leading-7 text-slate-600 mb-6">
            Rejoignez le premier réseau d'entraide dédié aux sociétés de nettoyage en France. 
            Connectez-vous avec des professionnels dans toute la France, échangez, collaborez 
            et bénéficiez de la force d'un réseau structuré.
          </p>
          <div className="flex flex-wrap gap-3">
            <JoinAssociationButton />
            <Link href="/connexion" className="bento-btn">
              Déjà membre ? Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Avantages */}
      <div className="grid gap-5 lg:grid-cols-3 mb-6">
        <EntityCard
          title="Sous-traitance privée"
          subtitle="Accédez aux annonces du réseau"
          meta={["Missions exclusives", "Membres vérifiés"]}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
              <Briefcase size={20} />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">
              Proposez et trouvez des missions de sous-traitance entre membres du réseau. 
              Un marché B2B réservé aux professionnels confirmés.
            </p>
          </div>
        </EntityCard>

        <EntityCard
          title="Média & Visibilité"
          subtitle="Publiez et accédez à nos partenariats"
          meta={["Blog", "Partenariats prioritaires"]}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-[14px] border-2 border-slate-900 bg-amber-400 p-3 text-slate-900 shadow-[3px_3px_0px_#0f172a]">
              <Newspaper size={20} />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">
              Participez aux médias de Club Propreté, publiez du contenu et accédez 
              à des partenariats prioritaires pour développer votre visibilité.
            </p>
          </div>
        </EntityCard>

        <EntityCard
          title="Événements & Networking"
          subtitle="Rencontres physiques et webinaires"
          meta={["Afterworks", "Salons", "Formations"]}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
              <Calendar size={20} />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">
              Participez à nos événements privés, webinaires et afterworks. 
              Un networking de qualité pour faire grandir votre activité.
            </p>
          </div>
        </EntityCard>
      </div>

      {/* Accompagnement subventions */}
      <div className="surface p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Truck size={22} />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Accompagnement subventions — Auto-laveuse à -70%
            </h2>
            <p className="text-sm font-semibold leading-6 text-slate-600 mb-4">
              Nous vous accompagnons dans le montage de votre dossier de subventions 
              et dans la recherche du bon fournisseur pour obtenir votre auto-laveuse 
              à moins de 70% de son prix. Un service exclusif pour les membres de l'association.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <CheckCircle2 size={12} className="mr-1" /> Dossier clé en main
              </span>
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <CheckCircle2 size={12} className="mr-1" /> Fournisseur partenaire
              </span>
              <span className="bento-tag border-indigo-200 bg-indigo-50 text-indigo-700">
                <CheckCircle2 size={12} className="mr-1" /> Accompagnement personnalisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Réseau d'entraide */}
      <div className="surface p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border-2 border-slate-900 bg-emerald-500 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <Users size={22} />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Réseau d'entraide et d'accompagnement
            </h2>
            <p className="text-sm font-semibold leading-6 text-slate-600 mb-4">
              Un groupe WhatsApp privé, des événements réguliers et un accompagnement 
              personnalisé pour vous aider à développer votre activité, comprendre 
              comment le marché évolue et trouver des sous-traitants, des partenaires 
              et des fournisseurs de confiance.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bento-tag border-emerald-200 bg-emerald-50 text-emerald-700">
                <MessageCircle size={12} className="mr-1" /> Groupe WhatsApp privé
              </span>
              <span className="bento-tag border-emerald-200 bg-emerald-50 text-emerald-700">
                <Calendar size={12} className="mr-1" /> Événements mensuels
              </span>
              <span className="bento-tag border-emerald-200 bg-emerald-50 text-emerald-700">
                <Handshake size={12} className="mr-1" /> Partenariats exclusifs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment adhérer */}
      <div className="surface p-8 mb-6">
        <h2 className="text-xl font-black text-slate-900 mb-4">Comment devenir membre ?</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-[14px] border-2 border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center mb-3">
              <span className="font-black text-indigo-600">1</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Créez votre compte</h3>
            <p className="text-sm text-slate-500">Inscrivez-vous gratuitement sur Club Propreté en tant que société ou indépendant.</p>
          </div>
          <div className="p-4 rounded-[14px] border-2 border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center mb-3">
              <span className="font-black text-indigo-600">2</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Demandez l'adhésion</h3>
            <p className="text-sm text-slate-500">Soumettez votre demande d'adhésion à l'association. Notre équipe l'étudie sous 48h.</p>
          </div>
          <div className="p-4 rounded-[14px] border-2 border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center mb-3">
              <span className="font-black text-indigo-600">3</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Accédez au réseau</h3>
            <p className="text-sm text-slate-500">Une fois membre, accédez à toutes les missions, événements et avantages exclusifs.</p>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="surface p-8 text-center bg-indigo-50">
        <h2 className="text-2xl font-black text-slate-900 mb-3">
          Prêt à rejoindre le réseau ?
        </h2>
        <p className="text-slate-600 mb-6 max-w-xl mx-auto">
          Une cotisation de membre vous donne accès à tous les outils, 
          l'accompagnement et le réseau d'entraide pour développer votre activité.
        </p>
        <div className="flex justify-center gap-3">
          <JoinAssociationButton />
          <Link href="/inscription?role=company_owner" className="bento-btn">
            Créer un compte
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
