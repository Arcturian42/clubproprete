import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { getPublicProfile } from "@/lib/actions/public";
import { getArticlesByAuthor } from "@/lib/actions/articles";
import { canViewPublicProfile, canViewCandidate } from "@/lib/permissions";
import { getRecommendationsForCandidate } from "@/lib/actions/recommendations";
import {
  UserRound,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  Building2,
  Package,
  GraduationCap,
  Quote,
  Calendar,
  EyeOff,
  Mail,
  FileText,
  Linkedin,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  // Un profil privé reste consultable par un recruteur légitime (candidature
  // reçue) : même règle que pour les recommandations plus bas.
  let canView = await canViewPublicProfile(viewerId, id);
  let recruiterAccess = false;
  if (!canView && viewerId) {
    recruiterAccess = await canViewCandidate(
      { id: viewerId, role: session?.user?.role as string | undefined },
      id
    );
    canView = recruiterAccess;
  }
  if (!canView) {
    notFound();
  }

  const profile = await getPublicProfile(id, { includePrivate: viewerId === id || recruiterAccess });
  if (!profile) {
    notFound();
  }

  const articles = await getArticlesByAuthor(id);

  let recommendations: Awaited<ReturnType<typeof getRecommendationsForCandidate>> | null = null;
  if (viewerId) {
    const hasCandidateAccess = await canViewCandidate(
      { id: viewerId, role: session?.user?.role as string | undefined },
      id
    );
    if (hasCandidateAccess) {
      recommendations = await getRecommendationsForCandidate(id);
    }
  }

  const entityTypeIcon = (type: string) => {
    switch (type) {
      case "company":
        return <Building2 size={18} className="text-indigo-600" />;
      case "supplier":
        return <Package size={18} className="text-indigo-600" />;
      case "training_organization":
        return <GraduationCap size={18} className="text-indigo-600" />;
      default:
        return <Building2 size={18} className="text-indigo-600" />;
    }
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      owner: "Propriétaire",
      admin: "Administrateur",
      recruiter: "Recruteur",
      member: "Membre",
    };
    return map[role] || role;
  };

  const primaryMembership =
    profile.memberships.find((m) => m.role === "owner") || profile.memberships[0];
  const primaryRole = primaryMembership
    ? `${roleLabel(primaryMembership.role)} chez ${primaryMembership.entityName}`
    : null;

  return (
    <PageShell
      eyebrow="Profil public"
      title={`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Profil"}
      description={
        profile.city
          ? `Basé à ${profile.city}`
          : "Membre de ClubPropreté"
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Header profil */}
        <div className="surface p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-[20px] border-4 border-slate-900 object-cover shadow-[4px_4px_0px_#0f172a]"
                />
              ) : (
                <div className="w-32 h-32 rounded-[20px] border-4 border-slate-900 bg-indigo-100 flex items-center justify-center shadow-[4px_4px_0px_#0f172a]">
                  <UserRound size={48} className="text-indigo-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-slate-900">
                {profile.firstName || ""} {profile.lastName || ""}
              </h1>
              {primaryRole && (
                <p className="mt-1 text-lg font-semibold text-slate-700">{primaryRole}</p>
              )}
              {profile.city && (
                <p className="mt-1 flex items-center gap-2 text-slate-500">
                  <MapPin size={16} />
                  {profile.city}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {profile.profile?.verificationStatus === "approved" && (
                  <span className="bento-tag border-emerald-200 bg-emerald-50 text-emerald-700">
                    <BadgeCheck size={14} aria-hidden="true" />
                    Profil vérifié
                  </span>
                )}
                {profile.profile?.associationStatus === "approved" && (
                  <span className="bento-tag border-amber-200 bg-amber-50 text-amber-700">
                    <ShieldCheck size={14} aria-hidden="true" />
                    Membre association
                  </span>
                )}
              </div>
              {(profile.email || profile.profile?.linkedinUrl) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="bento-btn bento-btn-primary inline-flex items-center gap-2"
                    >
                      <Mail size={16} aria-hidden="true" />
                      Contacter
                    </a>
                  )}
                  {profile.profile?.linkedinUrl && (
                    <a
                      href={profile.profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bento-btn inline-flex items-center gap-2"
                    >
                      <Linkedin size={16} aria-hidden="true" />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Résumé professionnel */}
        {(profile.bio || viewerId === id) && (
          <div className="surface p-6 mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-3">Résumé professionnel</h3>
            {profile.bio ? (
              <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
            ) : viewerId === id ? (
              <p className="text-slate-400 italic">
                Ajoutez une bio pour présenter votre expertise.
              </p>
            ) : null}
          </div>
        )}

        {/* Entreprises & organisations */}
        {profile.memberships.length > 0 && (
          <div className="surface p-6 mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-3">Entreprises & organisations</h3>
            <div className="flex flex-col gap-3">
              {profile.memberships.map((membership) => (
                <Link
                  key={`${membership.entityType}-${membership.entityId}`}
                  href={
                    membership.entityType === "company"
                      ? `/annuaire/societes/${membership.entityId}`
                      : membership.entityType === "supplier"
                      ? `/annuaire/fournisseurs/${membership.entityId}`
                      : "#"
                  }
                  className="bento-card p-3 block transition-colors hover:border-indigo-600"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border-2 border-slate-900 bg-indigo-50 text-indigo-600">
                    {entityTypeIcon(membership.entityType)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{membership.entityName}</p>
                    <p className="text-sm text-slate-500">{roleLabel(membership.role)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles publiés */}
        {articles.length > 0 && (
          <div className="surface p-6 mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-3">Articles publiés</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/ressources/${article.slug || article.id}`}
                  className="bento-card p-4 block transition-colors hover:border-indigo-600"
                >
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <FileText size={16} aria-hidden="true" />
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      {article.category || "Article"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} aria-hidden="true" />
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Date non précisée"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommandations */}
        {recommendations &&
          recommendations.success &&
          recommendations.recommendations &&
          recommendations.recommendations.length > 0 && (
            <div className="surface p-6 mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-4">
                Recommandations ({recommendations.recommendations.length})
              </h3>
              <div className="space-y-4">
                {recommendations.recommendations.map((reco) => (
                  <div key={reco.id} className="surface p-5 border-l-4 border-indigo-500">
                    <div className="flex items-start gap-3 mb-3">
                      <Quote size={20} className="text-indigo-400 shrink-0 mt-1" aria-hidden="true" />
                      <p className="text-slate-700 leading-relaxed italic">{reco.comment}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {reco.author ? (
                          <Link
                            href={`/membres/${reco.author.id}`}
                            className="font-bold text-indigo-600 hover:underline"
                          >
                            {reco.author.firstName} {reco.author.lastName}
                          </Link>
                        ) : (
                          <span className="font-bold text-slate-600">
                            {reco.authorEmail || "Auteur anonyme"}
                          </span>
                        )}
                        {reco.authorRole && (
                          <span className="text-slate-400">· {reco.authorRole}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar size={12} aria-hidden="true" />
                        <span>
                          {new Date(reco.createdAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {reco.relationship && (
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Relation : {reco.relationship}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Message si privé mais viewer = soi-même */}
        {viewerId === id && profile.profile?.visibility !== "public" && (
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-[14px]">
            <div className="flex items-center gap-2 text-amber-700">
              <EyeOff size={18} aria-hidden="true" />
              <span className="font-bold">Votre profil est privé</span>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Seul vous pouvez voir cette page. Rendez votre profil public dans vos paramètres pour le partager.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
