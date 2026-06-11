import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Find an author: prefer admin/super_admin, fallback to author, or create one
  let author = await prisma.user.findFirst({
    where: {
      mainRole: { in: ["admin", "super_admin", "author"] },
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!author) {
    const passwordHash = await bcrypt.hash("demo", 10);
    author = await prisma.user.create({
      data: {
        email: "auteur-blog@clubproprete.test",
        firstName: "Rédaction",
        lastName: "Club Propreté",
        mainRole: "author",
        passwordHash,
        emailVerified: true,
      },
    });
    console.log(`✅ Created author user: ${author.email} (${author.id})`);
  } else {
    console.log(`✅ Using existing author: ${author.email} (${author.id})`);
  }

  // Chaque utilisateur doit avoir un UserProfile : sans lui, la page
  // /membres/[id] de l'auteur renvoie un 404.
  await prisma.userProfile.upsert({
    where: { userId: author.id },
    update: {},
    create: {
      userId: author.id,
      profileType: author.mainRole,
      visibility: "public",
      verificationStatus: "approved",
      associationStatus: "not_applicable",
      completionScore: 60,
    },
  });

  const articles = [
    {
      slug: "trouver-missions-sous-traitance-proprete",
      title: "Comment trouver des missions de sous-traitance dans la propreté ?",
      excerpt:
        "La sous-traitance est un levier puissant pour les petites entreprises de nettoyage. Découvrez les canaux efficaces pour décrocher des missions régulières et développer votre chiffre d'affaires.",
      content: `Le secteur de la propreté est en pleine transformation. Les entreprises qui savent se positionner sur le marché de la sous-traitance gagnent en flexibilité, en rentabilité et en résilience face aux aléas économiques. Pour une petite structure, une mission de sous-traitance bien négociée peut représenter un volume d'activité stable sur plusieurs mois, voire plusieurs années.

## LE MARCHÉ DE LA SOUS-TRAITANCE PROPRETÉ

La sous-traitance dans le nettoyage concerne principalement les donneurs d'ordre — grandes sociétés de propreté, collectivités, syndics de copropriété ou gestionnaires d'immeubles — qui externalisent une partie de leurs prestations. Ces missions peuvent être ponctuelles (remise en état après chantier, nettoyage post-sinistre) ou récurrentes (entretien courant de bureaux, vitrerie périodique). Comprendre la typologie des besoins permet de cibler les offres les plus adaptées à vos compétences et à votre capacité d'intervention.

## OÙ TROUVER DES MISSIONS

Les missions de sous-traitance se trouvent via plusieurs canaux complémentaires. Les plateformes spécialisées comme Club Propreté centralisent les appels d'offres et permettent de répondre rapidement à des besoins géolocalisés. Les réseaux professionnels — salons, associations sectorielles, groupements d'employeurs — restent des sources incontournables de recommandation. Enfin, les relations directes avec les donneurs d'ordre se construisent par le bouche-à-oreille, la qualité de service et la réactivité commerciale. N'hésitez pas à solliciter les responsables d'exploitation des grandes sociétés de votre région.

## COMMENT SE POSITIONNER

Pour séduire un donneur d'ordre, trois critères comptent : la fiabilité opérationnelle, la conformité réglementaire et la compétitivité du prix. Préparez un dossier de présentation complet incluant votre extrait Kbis, votre attestation de vigilance URSSAF, vos certifications (Qualiopi, ISO 14001, etc.) et des références clients. Proposez une visite technique gratuite pour évaluer le besoin et démontrer votre professionnalisme dès le premier contact.

## LES ERREURS À ÉVITER

La sous-traitance expose à plusieurs écueils. Sous-évaluer les coûts de main-d'œuvre ou de déplacement, accepter des délais irréalistes, ou négliger la qualité au profit du volume sont des erreurs qui mènent rapidement à la rupture de contrat. Enfin, ne jamais travailler sans convention de sous-traitance écrite : elle doit préciser le périmètre, les obligations HSE, les modalités de facturation et les clauses de responsabilité.`,
      category: "Business",
      readTime: "6 min",
      tags: "sous-traitance,missions,business development,réseau",
      status: "published",
      publishedAt: new Date("2026-06-03T08:00:00Z"),
    },
    {
      slug: "creer-fiche-professionnelle-nettoyage",
      title: "Pourquoi créer une fiche professionnelle dans le secteur du nettoyage ?",
      excerpt:
        "Dans un marché de plus en plus digital, la visibilité en ligne conditionne la croissance des entreprises de propreté. Une fiche professionnelle bien construite est votre première carte de visite auprès des clients et des partenaires.",
      content: `La propreté reste un secteur où la confiance se gagne sur le terrain. Pourtant, avant même le premier rendez-vous, vos prospects vous évaluent en ligne. Une fiche professionnelle incomplète ou absente équivaut à une vitrine fermée : le client potentiel passe son chemin sans que vous le sachiez.

## LA VISIBILITÉ DIGITALE DANS LA PROPRETÉ

Les donneurs d'ordre, les syndics et les responsables d'achats utilisent désormais les annuaires spécialisés et les moteurs de recherche pour identifier leurs prestataires. Apparaître dans ces résultats avec une fiche détaillée, des photos de vos réalisations et des témoignages clients crée un effet de légitimité immédiat. C'est particulièrement vrai pour les petites structures qui n'ont pas les moyens d'un service marketing dédié.

## LES ÉLÉMENTS D'UNE FICHE COMPLÈTE

Une fiche professionnelle efficace dans le nettoyage doit contenir : une description claire de votre activité et de vos zones d'intervention, vos coordonnées vérifiées, les types de prestations proposées (tertiaire, industrielle, vitrerie, etc.), vos certifications et habilitations, ainsi que des visuels professionnels. Chaque élément renforce la crédibilité de votre entreprise et réduit les frictions dans le parcours client.

## LE RETOUR SUR INVESTISSEMENT

Le temps consacré à remplir sa fiche professionnelle est un investissement, pas une dépense. Les entreprises disposant d'une fiche complète sur Club Propreté reçoivent significativement plus de demandes de devis et de sollicitations de sous-traitance. Cette visibilité se traduit concrètement par un pipeline commercial plus dense et une meilleure négociation des tarifs, car la concurrence se fait sur la qualité perçue, pas seulement sur le prix.

## COMMENT COMMENCER

Commencez par choisir une plateforme spécialisée qui cible votre secteur géographique et votre typologie de client. Remplissez chaque champ avec soin, privilégiez l'exactitude aux superlatifs marketing, et mettez à jour régulièrement vos informations. Ajoutez progressivement des photos, des certifications et des références. La constance dans la mise à jour de votre fiche est un signal fort de professionnalisme pour les algorithmes de recherche et pour les humains qui vous consultent.`,
      category: "Visibilité",
      readTime: "5 min",
      tags: "visibilité,fiche professionnelle,digital,réputation",
      status: "published",
      publishedAt: new Date("2026-06-05T09:30:00Z"),
    },
    {
      slug: "developper-visibilite-locale-entreprise-nettoyage",
      title: "Comment une entreprise de nettoyage peut développer sa visibilité locale ?",
      excerpt:
        "La bataille de la propreté se joue souvent à l'échelle du quartier ou de la ville. Découvrez les stratégies concrètes pour devenir la référence locale en nettoyage professionnel et capter des clients à proximité.",
      content: `Les entreprises de nettoyage qui prospèrent sur le long terme partagent un point commun : elles sont visibles là où leurs clients vivent et travaillent. La visibilité locale ne se décrète pas, elle se construit méthodiquement à travers plusieurs leviers complémentaires qui, cumulés, créent une présence de marque durable dans votre zone d'intervention.

## LE RÉFÉRENCEMENT LOCAL

Le référencement local commence par l'exactitude de vos données NAP (Nom, Adresse, Téléphone) sur toutes les plateformes où vous apparaissez. Inscrivez votre entreprise sur Google Business Profile, les annuaires professionnels comme Club Propreté, et les pages jaunes digitales. Utilisez des mots-clés géolocalisés dans votre description : « entreprise de nettoyage à Lyon », « société de propreté tertiaire Marseille ». Encouragez vos clients satisfaits à laisser des avis en ligne : chaque témoignage renforce votre crédibilité auprès des algorithmes et des prospects.

## LES RÉSEAUX PROFESSIONNELS

La visibilité locale passe aussi par l'ancrage dans l'écosystème économique territorial. Intégrez votre chambre de commerce, les clubs d'entreprises, les réseaux d'entrepreneurs et les associations sectorielles. Ces réseaux génèrent des opportunités de co-traitance, des recommandations informelles et une meilleure connaissance des appels d'offres locaux. Participez aux afterworks, aux petits-déjeuners d'affaires et aux salons régionaux : la propreté est un métier de confiance, et la confiance se construit face à face.

## LES PARTENARIATS STRATÉGIQUES

Identifier des partenaires non concurrents mais complémentaires est un accélérateur de visibilité. Les agents immobiliers, les syndics de copropriété, les architectes d'intérieur, les entreprises de rénovation et les centres de formation ont besoin de prestataires de nettoyage fiables. Proposez-leur un partenariat formalisé : tarifs préférentiels en échange de recommandation systématique, ou co-organisation d'événements de présentation. Ces alliances multiplient vos points de contact sans multiplier votre budget marketing.

## MESURER SES RÉSULTATS

La visibilité locale doit être mesurée pour être optimisée. Suivez le nombre de demandes de devis par canal, le taux de conversion des prospects issus du référencement local, et la répartition géographique de vos nouveaux contrats. Outils simples : un tableau de suivi mensuel, les statistiques de votre fiche Google Business, et les analytics de votre fiche sur Club Propreté. Ajustez vos efforts en fonction des canaux qui génèrent le meilleur retour sur investissement.`,
      category: "Marketing",
      readTime: "7 min",
      tags: "marketing local,référencement,visibilité,partenariats",
      status: "published",
      publishedAt: new Date("2026-06-06T10:00:00Z"),
    },
    {
      slug: "erreurs-gestion-equipes-terrain-nettoyage",
      title: "Les erreurs fréquentes dans la gestion des équipes terrain",
      excerpt:
        "La gestion d'équipes de nettoyage en terrain est un exercice exigeant. Voici les erreurs les plus courantes commises par les managers et comment les éviter pour des équipes plus performantes et fidèles.",
      content: `Les équipes de nettoyage en terrain représentent le cœur battant de toute entreprise de propreté. Pourtant, la gestion de ces équipes reste souvent empirique, réactive et sous-optimale. Les managers qui corrigent certaines erreurs récurrentes constatent rapidement une amélioration de la qualité de service, de la ponctualité et de l'engagement des agents.

## LA COMMUNICATION AVEC LES ÉQUIPES

La première erreur consiste à sous-estimer l'importance d'une communication structurée. Beaucoup de managers se contentent de briefs oraux rapides ou de messages vocaux laissés en catastrophe. Résultat : les agents ne comprennent pas les attentes spécifiques du site, les horaires de passage changent sans préavis, et les réclamations client explosent. Instaurez un point quotidien ou hebdomadaire fixe, utilisez une application de messagerie dédiée à l'entreprise, et documentez chaque consigne par écrit. La clarté du message prévient 80 % des problèmes d'exécution.

## LA PLANIFICATION DES INTERVENTIONS

La seconde erreur classique est une planification rigide et déconnectée de la réalité terrain. Des tournées mal optimisées, des temps de déplacement non pris en compte, ou des plannings qui ignorent les contraintes de transport public des agents créent du stress, du retard et de l'absentéisme. Utilisez des outils de planification simples, intégrez les temps de trajet réels, et laissez une marge de manœuvre pour les imprévus. Impliquer les agents eux-mêmes dans la construction des plannings améliore l'adhésion et la fiabilité.

## LA FORMATION CONTINUE

Trop de managers considèrent la formation comme un coût, pas comme un investissement. Or, le secteur de la propreté évolue constamment : nouveaux produits, nouvelles machines, normes de sécurité renforcées, exigences environnementales croissantes. Des agents non formés aux bonnes pratiques dégradent la qualité, endommagent les surfaces et exposent l'entreprise à des risques juridiques. Mettez en place un plan de formation annuel minimal, même en interne, et valorisez les certifications obtenues par vos collaborateurs.

## LA RÉTENTION DES TALENTS

Le turnover dans la propreté est un fléau coûteux. Recruter et former un nouvel agent coûte souvent plus cher que fidéliser un salarié existant. Les managers qui perdent leurs meilleurs éléments commettent généralement l'erreur de négliger la reconnaissance, la progression de carrière et les conditions de travail. Un simple entretien annuel d'évolution, une prime de fidélité, ou la possibilité de passer chef d'équipe peuvent transformer un agent en ambassadeur de votre entreprise. Écoutez vos équipes : leur feedback est votre meilleur indicateur de management.`,
      category: "Management",
      readTime: "6 min",
      tags: "management,équipes terrain,RH,communication",
      status: "published",
      publishedAt: new Date("2026-06-08T07:15:00Z"),
    },
    {
      slug: "valoriser-certifications-proprete",
      title: "Comment valoriser ses certifications dans la propreté ?",
      excerpt:
        "Qualiopi, ISO 9001, ISO 14001… Les certifications sont des atouts majeurs dans le secteur du nettoyage. Apprenez à les mettre en avant efficacement sur votre profil, auprès de vos clients et dans vos réponses aux appels d'offres.",
      content: `Dans un secteur où la différenciation par le prix mène souvent à une course au moins-disant, les certifications constituent un avantage concurrentiel solide et défendable. Elles prouvent votre engagement qualité, votre respect des normes environnementales et votre capacité à former vos équipes. Mais posséder une certification ne suffit pas : il faut savoir la valoriser.

## LES CERTIFICATIONS CLÉS DU SECTEUR

Le paysage des certifications en propreté est riche. Qualiopi est indispensable si vous délivrez ou financez des formations. La certification ISO 9001 démontre la maîtrise de vos processus qualité. L'ISO 14001 atteste de votre démarche environnementale, de plus en plus exigée par les grands donneurs d'ordre. Les labels écologiques (Ecolabel, NF Environnement) et les certifications de sécurité (Mase, OHSAS 18001) complètent ce tableau. Chacune de ces certifications répond à un besoin client spécifique : identifiez lesquels sont pertinents pour votre cible.

## METTRE EN AVANT SES CERTIFICATIONS

Vos certifications doivent être visibles sur tous vos supports de communication. Sur votre fiche professionnelle Club Propreté, mentionnez-les en haut de page avec les logos officiels. Sur votre site web, créez une page dédiée expliquant la démarche et les bénéfices concrets pour le client. Dans vos signatures d'email, ajoutez une ligne « Certifié ISO 9001 ». Lors des visites commerciales, présentez votre attestation et expliquez ce que la certification change concrètement dans la prestation : traçabilité, audits internes, amélioration continue.

## LES CERTIFICATIONS DANS LES APPELS D'OFFRES

Les appels d'offres publics et privés intègrent de plus en plus des critères de sélection liés aux certifications. Un critère éliminatoire peut exiger la certification Qualiopi pour toute formation incluse dans le contrat. Un critère d'attribution peut attribuer des points pour l'ISO 14001. Ne vous contentez pas de cocher la case : rédigez une argumentation montrant que la certification se traduit par une prestation plus fiable, plus traçable et plus conforme aux exigences réglementaires. Joignez les attestations à jour, pas seulement les numéros de certification.

## SE FORMER ET ÉVOLUER

Le secteur de la propreté est en mutation permanente : robotisation, produits biosourcés, normes de sécurité renforcées. Les certifications que vous possédez aujourd'hui doivent être maintenues et complétées par de nouvelles compétences. Suivez les formations continues, anticipez les évolutions réglementaires et préparez-vous aux certifications émergentes. Une entreprise qui investit dans la montée en compétence de ses équipes envoie un signal de professionnalisme et de pérennité que les clients et les partenaires remarquent immédiatement.`,
      category: "Carrière",
      readTime: "5 min",
      tags: "certifications,Qualiopi,ISO,appels d'offres",
      status: "published",
      publishedAt: new Date("2026-06-09T11:00:00Z"),
    },
  ];

  let created = 0;
  let updated = 0;

  for (const article of articles) {
    const result = await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        readTime: article.readTime,
        tags: article.tags,
        status: article.status,
        publishedAt: article.publishedAt,
        authorId: author.id,
      },
      create: {
        ...article,
        authorId: author.id,
      },
    });

    const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
    if (isNew) {
      created++;
      console.log(`✅ Created article: "${result.title}" (${result.slug})`);
    } else {
      updated++;
      console.log(`🔄 Updated article: "${result.title}" (${result.slug})`);
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${updated} updated, ${articles.length} total articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
