# QA V0 — Audit fonctionnel actuel

Date : 9 juin 2026  
Environnement : local Next.js sur `http://localhost:3000`  
Statut : prototype V0 avancé, pas encore MVP finalisable en production.

## Résultat court

La plateforme est navigable et plusieurs parcours critiques existent maintenant : annuaire sociétés avec fiches détail, login NextAuth, dashboard par rôle, article détail, formation détail, sous-traitance protégée pour société membre et back-office admin.

Mise à jour QA onboarding : la création de compte fonctionne désormais pour les profils société, fournisseur, indépendant, candidat, organisme de formation et auteur. Après inscription, l'utilisateur est connecté automatiquement, arrive sur un onboarding qui lit la session NextAuth réelle, puis rejoint le dashboard correspondant.

Le produit n'est toutefois pas prêt à être mis en ligne : les fournisseurs publics restent vides tant qu'ils ne sont pas validés, les missions de sous-traitance sont vides et certains modules métier restent à compléter.

## Vérifications techniques

| Check | Résultat | Notes |
| --- | --- | --- |
| Serveur dev | OK après nettoyage `.next` | Le premier accès renvoyait `500`, corrigé par redémarrage + suppression du cache local. |
| `npm run typecheck` | OK | TypeScript passe. |
| `npm run build` | OK avec warnings | Build production réussi. Warnings Edge Runtime sur `auth.ts`, Prisma, `bcryptjs` et `jose`. |
| Santé route clé | OK | `/annuaire/societes` répond `200` après relance. |

## QA onboarding — 9 juin 2026

| Profil créé | Création compte | Entité métier créée | Onboarding connecté | Dashboard | Flow métier vérifié |
| --- | --- | --- | --- | --- | --- |
| Société de nettoyage | OK | `Company` pending | OK | Dashboard société | Accès `/emploi/nouvelle-offre` OK ; visiteur redirigé login. |
| Fournisseur | OK | `Supplier` pending | OK | Dashboard fournisseur | Annuaire fournisseurs accessible ; fournisseur non public tant que pending. |
| Indépendant | OK | `IndependentProfile` pending | OK | Dashboard indépendant | `/sous-traitance` affiche un vrai refus d'accès sans fuite de missions. |
| Candidat | OK | `CandidateProfile` | OK | Dashboard candidat | Offre cliquable, candidature créée, visible dans “Mes candidatures”. |
| Organisme de formation | OK | `TrainingOrganization` pending | OK | Espace formation | Catalogue formations accessible depuis le compte. |
| Auteur / rédacteur | OK | `UserProfile` author | OK | Espace rédaction | Ressources accessibles depuis le compte. |

Correctifs appliqués pendant ce QA :

- remplacement de l'onboarding `localStorage` par la session NextAuth ;
- auto-connexion après inscription ;
- bouton “Remplir un exemple” avec email unique pour éviter les collisions QA ;
- création d'une entité métier de base pour chaque rôle ;
- migration des CTA publics vers `useSession` ;
- protection correcte de `/emploi/nouvelle-offre` ;
- pages légales rendues publiques ;
- accès sous-traitance rendu explicite pour les non-membres ;
- cartes offres emploi rendues cliquables ;
- formulaire de candidature branché à `JobApplication` ;
- callback login respecté et sécurisé ;
- correction build `/connexion` avec boundary `Suspense`.

## Volumes base observés

| Entité | Volume | Impact QA |
| --- | ---: | --- |
| Users | 10 | Comptes de test présents. |
| Companies | 4 dont 2 visibles | Annuaire sociétés exploitable. |
| Suppliers | 0 | Annuaire fournisseurs non exploitable. |
| Jobs | 4 | Job board partiel. |
| Trainings | 1 | Catalogue minimal. |
| Articles | 1 | Ressources minimales. |
| Subcontracting missions | 0 | Module privé vide. |
| Candidate profiles | 1 | Dashboard candidat testable. |
| Independent profiles | 0 | Profil indépendant réel absent en base. |

## Parcours validés

| Parcours | Statut | Résultat |
| --- | --- | --- |
| Page accueil | OK | Navigation et CTA visibles. |
| Annuaire sociétés | OK | Liste visible, recherche serveur présente. |
| Fiche société | OK | Cartes cliquables, fiches `Test Propreté` et `Azur Proprete Services` affichées. |
| Login candidat | OK | `candidat@clubproprete.test` ouvre le dashboard candidat. |
| Dashboard candidat | Partiel | Candidatures, réponses, formations et brief IA visibles, mais plusieurs blocs sont “À venir en V1.1”. |
| Login société | OK | `societe@clubproprete.test` ouvre dashboard société. |
| Sous-traitance société membre | OK | Accès autorisé, mais aucune mission disponible. |
| Login admin | OK | `admin@clubproprete.test` ouvre `/admin` après session propre. |
| Admin | Partiel | File de modération visible. Actions non exécutées pendant QA pour éviter mutation DB. |
| Formations | OK partiel | Liste + détail fonctionnent. Contact via `mailto`, pas de suivi interne. |
| Ressources | OK partiel | Liste + article détail fonctionnent. Partage/sauvegarde désactivés. |
| Newsletter | Partiel | L'inscription persiste en base, mais sans message succès/erreur visible. |
| Inscription | OK | Crée l'utilisateur DB, l'entité métier de base et connecte automatiquement vers l'onboarding. |

## Bloquants restants

### 1. Annuaire fournisseurs public vide

Symptômes :

- `/annuaire/fournisseurs` affiche les 5 catégories demandées, mais toutes à `0 fournisseur`.
- la “Liste complète” est vide ;
- l'assistant recommande une catégorie, mais aucun fournisseur ni comparatif réel ;
- `/annuaire/fournisseurs/supplier-1` renvoie une 404.

À faire :

- créer un seed fournisseurs minimal par catégorie ;
- connecter l'onboarding fournisseur à `Supplier` + `SupplierService` ;
- ajouter données nécessaires à l'assistant : `bestFor`, `tradeoffs`, `responseTime`, images, zones ;
- afficher un état vide clair avec CTA “Référencer un fournisseur”.

### 2. Warnings production Edge Runtime

Symptômes :

- `npm run build` passe, mais Next signale `Prisma`, `bcryptjs` et certaines API Node importées dans le middleware Edge via `auth.ts`.

Risque :

- le middleware de production peut devenir fragile selon l'environnement d'hébergement.

À faire :

- séparer config Auth.js middleware-compatible et logique credentials Prisma/bcrypt ;
- garder le guard middleware basé uniquement sur JWT/session edge-compatible.

### 3. Formulaires métier post-onboarding encore incomplets

Symptômes :

- le compte et l'entité de base sont créés ;
- le dashboard indique encore “Données persistantes V1” ;
- les profils complets société/fournisseur/candidat/indépendant/formation ne sont pas encore structurés en étapes métier.

À faire :

- créer les formulaires métier post-onboarding ;
- ajouter score de complétion réel ;
- brancher validation admin par champ/document ;
- ajouter messages succès/erreur persistants.

## Priorités P1

- Ajouter un état succès/erreur sur newsletter, admin actions, création offre et formulaires.
- Ajouter une vraie 404 custom cohérente avec le design Bento.
- Remplacer les textes “Page en cours de rédaction” des pages légales.
- Rendre `Partager l'article` et `Sauvegarder` actifs ou les masquer.
- Ajouter données réelles pour indépendants et missions privées.
- Ajouter pages/formulaires de profil par rôle après onboarding.
- Vérifier changement de compte : mieux guider l'utilisateur à se déconnecter avant de changer de persona.
- Ajouter tests e2e Playwright sur login, fiche société, fournisseur vide, signup, sous-traitance, admin.

## Décision QA

Ne pas brancher domaine, DNS, serveur ou base de production maintenant.

Ordre recommandé avant mise en ligne :

1. remplir fournisseurs et missions avec données minimales ;
2. créer les formulaires métier post-onboarding ;
3. ajouter états succès/erreur et 404 custom ;
4. corriger warnings Edge Runtime ;
5. automatiser les flows critiques en e2e.
