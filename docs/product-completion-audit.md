# Audit de finition produit — ClubProprete.com

Date : juin 2026  
Statut : audit après création du prototype V0 interactif

## Synthèse exécutive

Le projet est aujourd'hui une V0 de démonstration avancée, pas encore un MVP produit terminé.

Ce qui est bien en place :

- direction artistique Bento opérationnelle ;
- navigation publique ;
- inscription/connexion de démonstration ;
- dashboards conditionnels par rôle ;
- dashboard candidat enrichi ;
- annuaire sociétés avec fiches détail ;
- annuaire fournisseurs avec assistant de recherche conversationnel local ;
- accès privé sous-traitance simulé selon le rôle ;
- back-office admin visible ;
- schéma Prisma initial.

Ce qui manque pour finir le produit :

- vraie authentification serveur ;
- persistance base de données ;
- formulaires métier complets ;
- actions réelles : créer, modifier, valider, candidater, publier, archiver ;
- pages détail pour toutes les entités ;
- workflows de validation admin ;
- emails et notifications ;
- RGPD complet ;
- tests automatisés ;
- déploiement staging/prod.

Décision importante : ne pas brancher domaine, DNS, serveur ou base production tant que les parcours CRUD critiques ne sont pas réels.

## État actuel par module

| Module | État actuel | Niveau |
| --- | --- | --- |
| UI/design system | Charte Bento appliquée | Bon |
| Homepage | Navigable, CTA présents | Moyen |
| Auth | Démo localStorage, pas serveur | Prototype |
| Onboarding | Visuel + redirection, pas formulaires métier complets | Prototype |
| Dashboard | Conditionnel par rôle, candidat avancé | Moyen |
| Annuaire sociétés | Liste + fiches détail seedées | Moyen |
| Annuaire fournisseurs | Liste + assistant conversationnel local | Moyen |
| Job board | Liste seedée, pas candidature réelle | Prototype |
| Candidats | Liste seedée + dashboard candidat | Moyen |
| Indépendants | Liste seedée, pas profil éditable | Prototype |
| Formations | Liste seedée, pas création/session réelle | Prototype |
| Association | Demandes seedées, pas workflow réel | Prototype |
| Sous-traitance | Accès protégé + missions seedées, pas candidature réelle | Prototype |
| Ressources/blog | Liste seedée + newsletter visuelle | Prototype |
| Admin | Vue de modération, boutons non connectés | Prototype |
| Prisma | Schéma initial complet | Moyen |
| Tests | Build/typecheck seulement | Faible |

## Bloquants P0 avant produit utilisable

### 1. Remplacer l'auth de démonstration

Aujourd'hui :

- login/signup stockés dans `localStorage` ;
- mot de passe non vérifié ;
- rôles simulés ;
- aucune session serveur.

À faire :

- installer Auth.js ou auth maison robuste ;
- créer tables users/sessions/accounts si nécessaire ;
- inscription réelle ;
- connexion réelle ;
- logout serveur ;
- hash mot de passe si auth credentials ;
- protection server-side des routes sensibles ;
- rôles et statuts lus depuis la base.

Critère terminé :

- un utilisateur peut créer un vrai compte, se reconnecter après fermeture navigateur et conserver son profil.

### 2. Brancher Prisma à une base locale réelle

Aujourd'hui :

- schéma Prisma existe ;
- les écrans lisent `lib/data.ts` ;
- rien n'écrit en base.

À faire :

- finaliser schema Prisma ;
- créer migration SQLite locale ;
- créer seed Prisma ;
- remplacer progressivement `lib/data.ts` par queries Prisma ;
- définir repository/services par domaine ;
- ajouter soft delete et statuts uniformes.

Critère terminé :

- les annuaires, dashboards et admin lisent depuis Prisma.

### 3. Créer les vrais formulaires métier après onboarding

Aujourd'hui :

- onboarding choisit un rôle ;
- pas de formulaire complet société/fournisseur/candidat/indépendant/formation ;
- pas de sauvegarde.

À faire :

- `/onboarding/societe` ;
- `/onboarding/fournisseur` ;
- `/onboarding/independant` ;
- `/onboarding/candidat` ;
- `/onboarding/formation` ;
- validation Zod côté client/serveur ;
- sauvegarde brouillon ;
- score de complétion réel.

Critère terminé :

- chaque persona crée son profil complet, visible dans son dashboard et en admin.

### 4. Rendre le back-office admin réel

Aujourd'hui :

- admin voit une file de validation ;
- boutons Valider/Refuser/Archiver ne font rien ;
- aucun audit log.

À faire :

- page admin utilisateurs ;
- page admin sociétés ;
- page admin fournisseurs ;
- page admin formations ;
- page admin association ;
- page admin jobs ;
- page admin sous-traitance ;
- actions server-side : valider, refuser, suspendre, archiver ;
- logs admin ;
- exports CSV basiques.

Critère terminé :

- un admin peut valider une fiche et le changement est immédiatement visible côté public.

### 5. Rendre les candidatures réelles

Aujourd'hui :

- job board seedé ;
- dashboard candidat simule candidatures/réponses ;
- pas de bouton postuler fonctionnel ;
- pas de gestion recruteur.

À faire :

- détail offre emploi ;
- candidature avec message/CV ;
- statut candidature ;
- dashboard candidat basé base ;
- dashboard société avec candidatures reçues ;
- action recruteur : vu, réponse, entretien, refus ;
- notifications locales/email.

Critère terminé :

- un candidat postule, la société reçoit la candidature, l'admin peut la voir.

### 6. Rendre l'association et la sous-traitance réelles

Aujourd'hui :

- accès sous-traitance protégé côté client ;
- missions seedées ;
- pas de publication/candidature réelle ;
- membership simulé.

À faire :

- demande d'association persistante ;
- validation admin ;
- garde serveur stricte ;
- création mission par membre ;
- candidature mission par membre ;
- gestion candidature par créateur ;
- masquage total aux non-membres.

Critère terminé :

- une société membre publie une mission, un indépendant membre candidate, le créateur accepte/refuse.

## Manques par persona

### Visiteur public

Manque :

- filtres annuaires fonctionnels ;
- pages détail fournisseur ;
- pages SEO locales/services ;
- inscription newsletter persistante ;
- formulaires contact/leads ;
- mentions RGPD visibles.

À faire :

- moteur de recherche public ;
- sitemap ;
- pages locales ;
- capture lead ;
- consentement newsletter.

### Société de nettoyage

Manque :

- création fiche entreprise réelle ;
- édition fiche ;
- upload logo/documents ;
- publication offre ;
- gestion candidatures ;
- demande association ;
- publication mission sous-traitance si membre ;
- création formation terrain.

À faire :

- dashboard société complet ;
- CRUD company/job/training/mission ;
- validation admin ;
- statistiques simples.

### Fournisseur

Manque :

- création fiche fournisseur réelle ;
- édition services/catalogue ;
- page détail fournisseur ;
- assistant fournisseur branché données réelles ;
- formulaire de demande/contact ;
- validation admin.

À faire :

- CRUD supplier/supplier_services ;
- catégories normalisées ;
- comparateur conversationnel alimenté par DB ;
- capture lead fournisseur.

### Candidat

Déjà mieux avancé :

- dashboard candidat métier visible ;
- candidatures/réponses/formations simulées.

Manque :

- profil candidat éditable ;
- upload CV ;
- postuler à une offre ;
- statut réel ;
- recommandations basées sur vraie data ;
- formations suivies réelles ;
- connexions réelles dans la région.

À faire :

- CRUD CandidateProfile ;
- JobApplication ;
- Training enrollment ou table dédiée ;
- recommendation service.

### Indépendant / sous-traitant

Manque :

- profil indépendant éditable ;
- documents assurance/SIRET ;
- adhésion association ;
- candidatures missions ;
- visibilité contrôlée ;
- dashboard dédié.

À faire :

- CRUD independent_profiles ;
- upload documents ;
- membership workflow ;
- mission applications.

### Organisme de formation / formateur

Manque :

- fiche organisme ;
- création formation ;
- création session ;
- validation admin ;
- demande d'information ;
- dashboard demandes.

À faire :

- CRUD TrainingOrganization ;
- CRUD Training ;
- CRUD TrainingSession ;
- Lead formation.

### Auteur / rédacteur

Manque :

- éditeur article ;
- brouillon/publishing réel ;
- catégories ;
- SEO metadata ;
- validation admin.

À faire :

- CMS minimal ;
- markdown ou rich text simple ;
- publication admin.

### Admin

Manque :

- actions réelles ;
- logs ;
- permissions serveur ;
- exports ;
- vues par entité ;
- recherche admin ;
- impersonation éventuelle en V1.

À faire :

- admin CRUD modération ;
- RBAC strict ;
- audit logs.

## Manques techniques

### Architecture

- ajouter couche `server actions` ou API routes ;
- séparer queries/mutations ;
- supprimer dépendance produit à `lib/data.ts` ;
- créer services par domaine ;
- gérer erreurs et loading states.

### Validation

- Zod pour tous les formulaires ;
- validation serveur obligatoire ;
- sanitation textes libres ;
- gestion statuts typés.

### Sécurité

- auth serveur ;
- RBAC serveur ;
- protection admin ;
- protection sous-traitance ;
- CSRF selon stratégie ;
- rate limit formulaires publics ;
- permissions fichiers upload.

### RGPD

- consentement newsletter ;
- consentement création compte ;
- politique confidentialité ;
- suppression/anonymisation ;
- export données utilisateur ;
- durée conservation ;
- mentions sur leads/contact.

### Emails

- confirmation compte ;
- demande association reçue ;
- validation/refus association ;
- fiche validée/refusée ;
- candidature reçue ;
- réponse candidature ;
- formation validée ;
- mission publiée/candidature reçue.

### Uploads

- CV candidat ;
- logo société/fournisseur ;
- documents SIRET/assurance ;
- catalogues fournisseurs ;
- documents formation.

### Tests

- tests unitaires utilitaires ;
- tests server actions ;
- tests permissions ;
- tests e2e Playwright :
  - signup ;
  - create company ;
  - admin validates company ;
  - candidate applies ;
  - company responds ;
  - member publishes mission ;
  - non-member blocked.

## Roadmap recommandée pour finir la V0

### Sprint 1 — Socle data/auth

Objectif : arrêter la simulation.

- Auth réelle.
- Prisma migrate/seed.
- Session server-side.
- RBAC serveur.
- Remplacer auth localStorage.
- Créer layout dashboard avec user réel.

Livrable :

- compte réel + profil basique persistant.

### Sprint 2 — Onboarding et profils

Objectif : collecter la donnée.

- formulaires société/fournisseur/candidat/indépendant/formation ;
- sauvegarde brouillon ;
- score complétion ;
- dashboard par profil depuis DB ;
- admin voit les profils en attente.

Livrable :

- chaque persona crée son profil.

### Sprint 3 — Annuaires publics

Objectif : rendre les fiches réelles.

- listes DB ;
- filtres fonctionnels ;
- fiches détail société/fournisseur ;
- contact/lead ;
- validation admin visible publiquement ;
- SEO metadata.

Livrable :

- annuaires exploitables.

### Sprint 4 — Emploi/candidat

Objectif : faire tourner un vrai recrutement.

- création offre par société ;
- détail offre ;
- candidature candidat ;
- dashboard candidat réel ;
- dashboard société candidatures ;
- réponse recruteur.

Livrable :

- un candidat peut postuler et recevoir une réponse.

### Sprint 5 — Formation/contenu/newsletter

Objectif : activer acquisition et montée en compétence.

- création formation/session ;
- demande information ;
- newsletter persistante ;
- blog CMS minimal ;
- validation admin.

Livrable :

- formation et contenu gérés en base.

### Sprint 6 — Association/sous-traitance

Objectif : activer le réseau privé.

- demande association ;
- validation admin ;
- dashboard association ;
- création mission ;
- candidature mission ;
- acceptation/refus ;
- garde serveur.

Livrable :

- sous-traitance privée utilisable entre membres.

### Sprint 7 — Stabilisation pré-prod

Objectif : préparer mise en ligne.

- RGPD minimum ;
- emails ;
- exports CSV ;
- tests e2e ;
- monitoring ;
- seed staging ;
- scripts deploy ;
- audit sécurité permissions.

Livrable :

- staging prêt pour recette.

## Priorité absolue des prochaines tâches

1. Auth réelle + DB.
2. Onboarding métier persistant.
3. Admin validation réelle.
4. CRUD société/fournisseur/candidat.
5. Job application réelle.
6. Association + sous-traitance réelle.
7. RGPD + emails + tests.

## Ce qu'il ne faut pas faire tout de suite

- brancher paiement ;
- lancer domaine public ;
- acheter serveur prod avant stabilité ;
- ajouter IA complexe avant données réelles ;
- développer achats groupés ;
- développer marketplace payante ;
- développer chat temps réel ;
- surdesigner avant les CRUD.

## Définition d'une V0 finie

La V0 est finie quand :

- un visiteur crée un compte ;
- chaque persona crée son profil ;
- l'admin valide/refuse ;
- les fiches validées apparaissent publiquement ;
- une société publie une offre ;
- un candidat postule ;
- la société répond ;
- un organisme/société publie une formation ;
- un utilisateur demande l'association ;
- l'admin valide ;
- un membre publie une mission de sous-traitance ;
- un autre membre candidate ;
- les non-membres sont bloqués ;
- toutes les données persistent en base ;
- les emails essentiels partent ;
- les droits sont testés ;
- la suppression/anonymisation RGPD existe.

## Conclusion

Le prototype actuel est une bonne base visuelle et UX. Pour finir le produit, le travail principal n'est plus le design : c'est la transformation des écrans en vrais workflows persistants, validés par admin et protégés par permissions serveur.

