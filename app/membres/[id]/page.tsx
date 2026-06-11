import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPublicProfile } from "@/lib/actions/public";
import { getArticlesByAuthor } from "@/lib/actions/articles";
import { canViewPublicProfile, canViewCandidate } from "@/lib/permissions";
import {
  getPublicRecommendations,
  getRecommendationsForCandidate,
} from "@/lib/actions/recommendations";
import { parsePhotos } from "@/lib/photos";
import { RecommendationForm } from "@/components/profile/recommendation-form";
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
  Phone,
  FileText,
  Linkedin,
  Pencil,
  Users,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) {
    return { title: "Profil membre | Club Propreté" };
  }
  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Membre";
  return {
    title: `${fullName} | Club Propreté`,
    description:
      profile.profile?.headline ||
      profile.bio?.slice(0, 160) ||
      `Profil de ${fullName}, membre du réseau Club Propreté.`,
  };
}

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    owner: "Propriétaire",
    admin: "Administrateur",
    recruiter: "Recruteur",
    member: "Membre",
  };
  return map[role] || role;
};

const entityTypeIcon = (type: string) => {
  switch (type) {
    case "supplier":
      return <Package size={20} className="text-slate-500" />;
    case "training_organization":
      return <GraduationCap size={20} className="text-slate-500" />;
    default:
      return <Building2 size={20} className="text-slate-500" />;
  }
};

const entityHref = (type: string, id: string) => {
  switch (type) {
    case "company":
      return `/annuaire/societes/${id}`;
    case "supplier":
      return `/annuaire/fournisseurs/${id}`;
    default:
      return null;
  }
};

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });

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

  const isOwner = viewerId === id;
  const profile = await getPublicProfile(id, { includePrivate: isOwner || recruiterAccess });
  if (!profile) {
    notFound();
  }

  const articles = await getArticlesByAuthor(id);

  // Recommandations publiées : visibles par tous quand le profil est public,
  // sinon réservées au membre lui-même et aux recruteurs légitimes.
  let recommendations = await getPublicRecommendations(id);
  if (recommendations.length === 0 && viewerId) {
    const hasCandidateAccess =
      isOwner ||
      recruiterAccess ||
      (await canViewCandidate(
        { id: viewerId, role: session?.user?.role as string | undefined },
        id
      ));
    if (hasCandidateAccess) {
      const gated = await getRecommendationsForCandidate(id);
      if (gated.success && gated.recommendations) {
        recommendations = gated.recommendations;
      }
    }
  }

  const primaryMembership =
    profile.memberships.find((m) => m.role === "owner") || profile.memberships[0];
  const primaryRole = primaryMembership
    ? `${roleLabel(primaryMembership.role)} chez ${primaryMembership.entityName}`
    : null;
  // Le titre saisi par le membre prime sur le rôle déduit (façon LinkedIn).
  const headline = profile.profile?.headline || primaryRole;
  const photos = parsePhotos(profile.photos);
  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Membre";
  const location = [profile.city, profile.profile?.region].filter(Boolean).join(", ");

  return (
    <div className="bg-slate-100/70 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Colonne principale */}
          <div className="min-w-0 space-y-4">
            {/* En-tête : bannière + identité */}
            <div className="card-soft overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 sm:h-40" />
              <div className="px-6 pb-6">
                <div className="-mt-14 flex items-end justify-between sm:-mt-16">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={fullName}
                      className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md sm:h-32 sm:w-32"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-slate-200 shadow-md sm:h-32 sm:w-32">
                      <UserRound size={48} className="text-slate-400" />
                    </div>
                  )}
                  {isOwner && (
                    <Link href="/profil" className="btn-soft mb-2">
                      <Pencil size={15} aria-hidden="true" /> Modifier mon profil
                    </Link>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
                    {profile.profile?.verificationStatus === "approved" && (
                      <span
                        className="inline-flex items-center gap-1 text-sky-600"
                        title="Profil vérifié par Club Propreté"
                      >
                        <BadgeCheck size={20} aria-hidden="true" />
                        <span className="sr-only">Profil vérifié</span>
                      </span>
                    )}
                  </div>
                  {headline && <p className="mt-1 text-base text-slate-600">{headline}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    {location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} aria-hidden="true" /> {location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={14} aria-hidden="true" /> Membre depuis{" "}
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                  {profile.profile?.associationStatus === "approved" && (
                    <div className="mt-3">
                      <span className="tag-soft border-amber-200 bg-amber-50 text-amber-700">
                        <ShieldCheck size={13} aria-hidden="true" /> Membre de l&apos;association
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.email && (
                      <a href={`mailto:${profile.email}`} className="btn-soft btn-soft-primary">
                        <Mail size={15} aria-hidden="true" /> Contacter
                      </a>
                    )}
                    {profile.profile?.linkedinUrl && (
                      <a
                        href={profile.profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-soft"
                      >
                        <Linkedin size={15} aria-hidden="true" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* À propos */}
            {(profile.bio || isOwner) && (
              <section className="card-soft p-6">
                <h2 className="text-lg font-semibold text-slate-900">À propos</h2>
                {profile.bio ? (
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="mt-3 italic text-slate-400">
                    Ajoutez une présentation pour mettre en avant votre expertise.
                  </p>
                )}
              </section>
            )}

            {/* Expérience / organisations */}
            {profile.memberships.length > 0 && (
              <section className="card-soft p-6">
                <h2 className="text-lg font-semibold text-slate-900">Expérience</h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {profile.memberships.map((membership) => {
                    const href = entityHref(membership.entityType, membership.entityId);
                    const content = (
                      <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          {entityTypeIcon(membership.entityType)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {membership.entityName}
                          </p>
                          <p className="text-sm text-slate-500">{roleLabel(membership.role)}</p>
                        </div>
                      </div>
                    );
                    return href ? (
                      <Link
                        key={`${membership.entityType}-${membership.entityId}`}
                        href={href}
                        className="block hover:bg-slate-50"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={`${membership.entityType}-${membership.entityId}`}>{content}</div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recommandations */}
            <section className="card-soft p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recommandations
                  {recommendations.length > 0 && (
                    <span className="ml-2 text-sm font-medium text-slate-400">
                      {recommendations.length}
                    </span>
                  )}
                </h2>
              </div>

              {recommendations.length > 0 ? (
                <div className="mt-4 divide-y divide-slate-100">
                  {recommendations.map((reco) => (
                    <div key={reco.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        {reco.author?.avatarUrl ? (
                          <img
                            src={reco.author.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <UserRound size={18} className="text-slate-400" aria-hidden="true" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {reco.author ? (
                            <Link
                              href={`/membres/${reco.author.id}`}
                              className="font-semibold text-slate-900 hover:text-indigo-600"
                            >
                              {reco.author.firstName} {reco.author.lastName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-700">
                              {reco.authorEmail || "Auteur anonyme"}
                            </span>
                          )}
                          <p className="text-xs text-slate-500">
                            {[
                              reco.authorRole,
                              reco.relationship ? `Relation : ${reco.relationship}` : null,
                              new Date(reco.createdAt).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "short",
                              }),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <Quote size={16} className="mt-1 shrink-0 text-slate-300" aria-hidden="true" />
                        <p className="leading-relaxed text-slate-600">{reco.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Aucune recommandation publiée pour le moment.
                </p>
              )}

              {viewerId && !isOwner && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <RecommendationForm
                    candidateUserId={id}
                    candidateFirstName={profile.firstName || ""}
                  />
                </div>
              )}
              {!viewerId && (
                <p className="mt-5 border-t border-slate-100 pt-5 text-sm text-slate-400">
                  <Link href="/connexion" className="font-medium text-indigo-600 hover:underline">
                    Connectez-vous
                  </Link>{" "}
                  pour rédiger une recommandation.
                </p>
              )}
            </section>

            {/* Articles publiés */}
            {articles.length > 0 && (
              <section className="card-soft p-6">
                <h2 className="text-lg font-semibold text-slate-900">Publications</h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/ressources/${article.slug || article.id}`}
                      className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                        <FileText size={18} className="text-indigo-500" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 line-clamp-2">{article.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {[
                            article.category,
                            article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <section className="card-soft p-6">
                <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, index) => (
                    <img
                      key={photo}
                      src={photo}
                      alt={`Photo ${index + 1} de ${profile.firstName || "ce membre"}`}
                      className="h-36 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Message si privé mais viewer = soi-même */}
            {isOwner && profile.profile?.visibility !== "public" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <EyeOff size={18} aria-hidden="true" />
                  <span className="font-semibold">Votre profil est privé</span>
                </div>
                <p className="mt-1 text-sm text-amber-600">
                  Seul vous pouvez voir cette page. Rendez votre profil public dans{" "}
                  <Link href="/profil" className="font-medium underline">
                    vos paramètres
                  </Link>{" "}
                  pour le partager.
                </p>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <aside className="space-y-4">
            <section className="card-soft p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Coordonnées
              </h2>
              <div className="mt-3 space-y-3 text-sm">
                {profile.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2.5 text-slate-600 hover:text-indigo-600"
                  >
                    <Mail size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{profile.email}</span>
                  </a>
                ) : (
                  <p className="flex items-center gap-2.5 text-slate-400">
                    <Mail size={16} className="shrink-0" aria-hidden="true" />
                    Coordonnées privées
                  </p>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2.5 text-slate-600 hover:text-indigo-600"
                  >
                    <Phone size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                    {profile.phone}
                  </a>
                )}
                {location && (
                  <p className="flex items-center gap-2.5 text-slate-600">
                    <MapPin size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                    {location}
                  </p>
                )}
                {profile.profile?.linkedinUrl && (
                  <a
                    href={profile.profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-slate-600 hover:text-indigo-600"
                  >
                    <Linkedin size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                    Profil LinkedIn
                  </a>
                )}
              </div>
            </section>

            <section className="card-soft p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                En bref
              </h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Organisations</dt>
                  <dd className="font-semibold text-slate-900">{profile.memberships.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Recommandations</dt>
                  <dd className="font-semibold text-slate-900">{recommendations.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Publications</dt>
                  <dd className="font-semibold text-slate-900">{articles.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Membre depuis</dt>
                  <dd className="font-semibold text-slate-900">{formatDate(profile.createdAt)}</dd>
                </div>
              </dl>
            </section>

            <section className="card-soft p-5">
              <div className="flex items-center gap-2 text-slate-700">
                <Users size={16} aria-hidden="true" />
                <h2 className="text-sm font-semibold">Annuaire des membres</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Découvrez les autres professionnels du réseau Club Propreté.
              </p>
              <Link href="/membres" className="btn-soft mt-3 w-full">
                Voir l&apos;annuaire
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
