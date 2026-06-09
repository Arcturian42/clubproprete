# Plan MVP V0 — ClubProprete.com

Objectif : construire une V0 fonctionnelle pour tous les personas du PRD, testable en local ou staging interne, avant la mise en ligne, le DNS, le domaine, le serveur et la base de données de production.

## Décision produit

La V0 doit être complète en parcours, mais simple en profondeur.

Cela veut dire :

- chaque persona doit pouvoir réaliser son parcours principal de bout en bout ;
- les données doivent être collectées proprement dès le départ ;
- les validations sensibles doivent passer par l'admin ;
- la sous-traitance reste strictement réservée aux membres association validés ;
- aucun paiement, abonnement, sponsoring, appel d'offres ou achat groupé n'est développé ;
- les automatisations avancées peuvent attendre tant que le workflow manuel existe.

## Personas à couvrir

| Persona | Objectif V0 | Parcours minimum fonctionnel |
| --- | --- | --- |
| Visiteur public | Découvrir et consulter | Homepage, annuaires publics, offres, formations, articles, newsletter, création de compte |
| Société de nettoyage | Être visible, recruter, adhérer | Onboarding société, fiche entreprise, job posting, formation, demande association |
| Fournisseur | Se référencer | Onboarding fournisseur, fiche fournisseur, catégories, validation admin |
| Indépendant / sous-traitant | Être visible et accéder aux missions | Profil indépendant, demande association, accès missions si membre |
| Candidat emploi | Candidater | Profil candidat, CV ou infos clés, candidatures, suivi des candidatures |
| Organisme de formation | Référencer ses formations | Profil organisme, création formation/session, demande d'information |
| Chef d'entreprise formateur | Proposer une formation terrain | Formation liée à son compte entreprise, validation admin |
| Auteur / rédacteur | Publier du contenu | Création brouillon article, publication via admin |
| Admin / super admin | Contrôler la plateforme | Back-office, validation, modération, exports simples, pilotage qualité |

## Périmètre V0 fonctionnel

### 1. Socle application

- Next.js, TypeScript, TailwindCSS, architecture modulaire.
- Authentification locale ou dev-ready avec rôles et sessions.
- RBAC simple : public, utilisateur, société, fournisseur, indépendant, candidat, formation, auteur, membre association, admin.
- Dashboard conditionnel selon le rôle principal.
- Données persistées en local/dev pour tester les parcours avant infra prod.
- Seeds de démonstration pour tous les personas.

### 2. Onboarding multi-profils

- Choix du profil principal.
- Informations personnelles.
- Objectif principal.
- Besoins actuels.
- Redirection vers l'onboarding spécialisé.
- Score de complétion simple.

### 3. Annuaires publics

- Annuaire sociétés de nettoyage.
- Annuaire fournisseurs.
- Fiches publiques validées.
- Recherche simple par ville, catégorie, service ou mot-clé.
- Pages détail pour société et fournisseur.

### 4. Profils métier

- Profil société avec SIRET, zones, services, besoins.
- Profil fournisseur avec catégorie, couverture, contact.
- Profil indépendant avec statut, SIRET, compétences, disponibilité.
- Profil candidat avec mobilité, expérience, contrats recherchés.
- Profil formation ou organisme si nécessaire.

### 5. Job board

- Publication d'offre par société connectée.
- Liste publique des offres validées ou actives.
- Candidature par candidat connecté.
- Suivi côté candidat.
- Gestion des candidatures côté société.
- Modération admin.

### 6. Formation

- Création de formation par organisme.
- Création de formation par société ou chef d'entreprise formateur.
- Sessions simples.
- Liste publique des formations validées.
- Demande d'information via formulaire ou lead interne.
- Validation admin obligatoire.

### 7. Association

- Demande d'adhésion gratuite.
- Statuts : brouillon, soumise, validée, refusée, suspendue.
- Validation manuelle admin.
- Badge membre association.
- Dashboard association réservé aux membres validés.

### 8. Sous-traitance privée

- Accès uniquement aux membres association validés.
- Publication de mission par société membre.
- Consultation par membres validés.
- Candidature par indépendant ou société membre.
- Gestion des candidatures par créateur de mission.
- Modération admin.
- Aucun appel d'offres public.

### 9. Blog, ressources, newsletter

- Blog/CMS simple avec brouillon, publié, archivé.
- Pages ressources publiques.
- Inscription newsletter avec profil, région, intérêts.
- Export CSV newsletter en P1 si le temps le permet.

### 10. Back-office admin

- Gestion utilisateurs.
- Validation sociétés, fournisseurs, indépendants, formations, association.
- Modération jobs, missions, articles.
- Changement de statut.
- Badges simples.
- Exports CSV simples si possible.
- Vue qualité data : profils incomplets, en attente, refusés, suspendus.

## Ordre de construction recommandé

### Phase 0 — Cadrage technique et UX

Livrable : carte claire des routes, rôles, entités et écrans.

- Choisir le mode de persistance pré-prod : SQLite/Prisma local ou PostgreSQL local.
- Définir les routes publiques, dashboards et routes admin.
- Transformer les personas en user stories testables.
- Définir les statuts communs : draft, pending, approved, rejected, suspended, archived.
- Préparer les données de démo.

### Phase 1 — Socle app

Livrable : application navigable avec auth, layout et rôles.

- Scaffolder Next.js + TypeScript + Tailwind.
- Créer layout public, layout dashboard, layout admin.
- Ajouter auth, sessions, rôles, protections de routes.
- Ajouter seed users : admin, société, fournisseur, indépendant, candidat, organisme, auteur.
- Créer dashboard général vide mais routé.

### Phase 2 — Onboarding et profils

Livrable : chaque persona peut créer son profil.

- Onboarding général.
- Formulaires société, fournisseur, indépendant, candidat, organisme.
- Sauvegarde profil et score de complétion.
- Pages dashboard profil.
- Pages admin de validation profil.

### Phase 3 — Annuaires publics

Livrable : la plateforme commence à collecter et afficher les acteurs.

- Listing sociétés.
- Listing fournisseurs.
- Fiches détail.
- Filtres simples.
- Statut de publication basé sur validation admin.
- CTA vers inscription, revendication ou contact.

### Phase 4 — Emploi et candidats

Livrable : une société recrute et un candidat postule.

- CRUD offres d'emploi.
- Publication/modération.
- Candidature.
- Suivi candidat.
- Vue candidatures reçues côté société.
- Vue admin.

### Phase 5 — Formations et contenus

Livrable : les acteurs peuvent référencer formations et contenus publics.

- CRUD formations.
- Sessions simples.
- Demandes d'information.
- Validation admin.
- Blog/CMS simple.
- Newsletter.

### Phase 6 — Association et sous-traitance

Livrable : le coeur confiance/réseau est testable.

- Demande d'adhésion association.
- Validation admin.
- Dashboard association.
- Accès privé sous-traitance.
- Missions et candidatures.
- Vérification stricte des permissions.

### Phase 7 — Stabilisation avant mise en ligne

Livrable : V0 prête pour branchement infra.

- Tester tous les parcours persona.
- Corriger permissions et statuts.
- Ajouter messages d'erreur et états vides.
- Vérifier RGPD minimum : consentement, suppression/anonymisation, mentions de collecte.
- Vérifier SEO pages publiques.
- Préparer variables d'environnement pour prod.
- Lister les intégrations à brancher ensuite : base prod, emails, stockage fichiers, domaine, DNS, monitoring.

## Définition de terminé par persona

| Persona | Critère de validation |
| --- | --- |
| Visiteur | Consulte les pages publiques, filtre un annuaire, s'inscrit à la newsletter, crée un compte |
| Société | Crée sa fiche, publie une offre, reçoit une candidature, demande l'association |
| Fournisseur | Crée une fiche, attend validation, apparaît dans l'annuaire après validation |
| Indépendant | Crée profil, demande association, voit/candidate aux missions après validation |
| Candidat | Crée profil, postule à une offre, suit le statut |
| Organisme formation | Crée formation/session, reçoit une demande d'information |
| Chef d'entreprise formateur | Crée une formation depuis son compte société |
| Auteur | Crée un brouillon article, admin le publie |
| Admin | Valide, rejette, suspend, modère et exporte les données clés |

## Priorités P0

P0 doit être terminé avant toute mise en ligne :

- Authentification et rôles.
- Onboarding multi-profils.
- CRUD profils principaux.
- Annuaires sociétés et fournisseurs.
- Job board avec candidatures.
- Formations avec validation.
- Association avec validation.
- Sous-traitance privée réservée aux membres.
- Dashboards par rôle.
- Admin de validation/modération.
- RGPD minimum.
- Seeds de test et parcours QA.

## Priorités P1 après V0 utilisable

P1 peut être ajouté avant ou juste après la mise en ligne selon le temps :

- Exports CSV plus propres.
- Imports CSV simples.
- Notifications email réelles.
- Upload fichiers réel.
- Filtres avancés.
- Favoris.
- Signalements.
- Logs admin détaillés.
- Statistiques dashboard.
- Ressources téléchargeables.

## Hors scope V0

- Paiement.
- Abonnement.
- Premium.
- Sponsoring.
- Appels d'offres.
- Achats groupés.
- Matching IA.
- Messagerie avancée.
- Chat temps réel.
- Application mobile.
- Avis publics.
- CRM complet.
- Comparateur fournisseurs avancé.

## Stratégie avant base prod, domaine et serveur

La V0 doit être testée avec une persistance de développement et des données seedées.

Recommandation :

- utiliser Prisma dès le départ pour ne pas jeter le modèle data ;
- utiliser SQLite local ou PostgreSQL local tant que la base prod n'est pas décidée ;
- éviter les dépendances bloquantes à un service externe ;
- remplacer les vrais emails par un journal local ou une table notifications ;
- remplacer l'upload réel par des URLs ou métadonnées jusqu'au choix du stockage ;
- prévoir les variables d'environnement, mais ne pas bloquer la V0 dessus.

Quand tous les parcours sont validés, on branche ensuite :

- base de données de production ;
- stockage fichiers ;
- service email ;
- domaine et DNS ;
- serveur/hébergement ;
- analytics et monitoring ;
- sauvegardes ;
- politiques RGPD finales.

## Risques principaux

- Scope très large : il faut livrer les parcours de bout en bout avant les raffinements.
- Permissions sensibles : la sous-traitance doit rester invisible aux non-membres.
- Données métier nombreuses : les formulaires doivent être progressifs pour éviter l'abandon.
- Admin indispensable : sans validation/modération, le modèle de confiance ne tient pas.
- Mise en ligne prématurée : ne pas connecter domaine et prod avant validation des parcours persona.

## Prochaine action recommandée

Créer le squelette applicatif et commencer par Phase 1, puis livrer chaque phase avec des comptes de test correspondant aux personas.
