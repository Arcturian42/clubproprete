# Comptes de test

Profils fictifs mais réalistes, créés par `npm run prisma:seed`.
**Mot de passe commun : `demo`** (tous les comptes).

> ⚠️ Le seed refuse de tourner contre une base distante. Pour alimenter un
> environnement de démo hébergé, lancer en connaissance de cause :
> `SEED_ALLOW_REMOTE=true npm run prisma:seed`.
> Ne jamais le faire sur une base de production réelle : les comptes admin
> auraient le mot de passe `demo`.

## Sociétés de nettoyage

| Email | Nom | Société | Ville | À tester |
|---|---|---|---|---|
| societe@clubproprete.test | Claire Martin | Azur Propreté Services (`/annuaire/societes/azur-proprete-services`) | Nice | Dashboard entreprise, membre association, missions sous-traitance, offre job-1 |
| societe2@clubproprete.test | Julien Moreau | Lyon Net Services (`/annuaire/societes/lyon-net-services`) | Lyon | Fiche société non-membre association, offre job-2 |
| societe3@clubproprete.test | Fatou Diallo | Nettéclat (`/annuaire/societes/netteclat`) | Paris | Membre association, offre CDD job-3 |
| societe4@clubproprete.test | Marc Da Silva | Atlantique Propreté (`/annuaire/societes/atlantique-proprete`) | Nantes | Grande structure (51-200), recherche de sous-traitants |

## Autres profils

| Email | Nom | Rôle | À tester |
|---|---|---|---|
| fournisseur@clubproprete.test | Nicolas Bernard | Fournisseur (EcoMateriel Pro + 4 autres fiches) | Dashboard fournisseur, fiches `/annuaire/fournisseurs/ecomateriel-pro`… |
| independant@clubproprete.test | Karim Benali | Indépendant (KB Propreté, Marseille) | Annuaire `/independants`, profil public |
| independant2@clubproprete.test | Sophie Lemaire | Indépendante (SL Propreté Services, Lyon) | Annuaire `/independants`, profil public |
| candidat@clubproprete.test | Laura Dupont | Candidate (Paris) | Profil candidat, candidature déposée sur job-1 |
| formation@clubproprete.test | Marie Lefebvre | Organisme de formation | 3 formations publiées dans `/formations` |
| auteur@clubproprete.test | Philippe Dubois | Auteur | Espace auteur, articles 1 et 3 |
| auteur2@clubproprete.test | Nadia Charpentier | Auteure | Espace auteur, articles 2 et 4 |
| admin@clubproprete.test | Admin Club | Admin | `/admin` (modération) |
| superadmin@clubproprete.test | Super Admin | Super admin | `/admin/users` |

## Visibilité

Tous les comptes (sauf admin/superadmin) ont un **profil membre public**
(`UserProfile.visibility = "public"`) : ils sont cliquables depuis les fiches
(« Équipe »), visibles sur `/membres/[id]` et listés dans `/independants` pour
les indépendants.

Le seed est **idempotent et correctif** : le relancer remet les profils de test
dans cet état de référence (noms, bios, descriptions, slugs), y compris si les
données ont été modifiées entre-temps.
