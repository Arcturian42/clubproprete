# Plan d'exécution — Corrections UX/UI Club Propreté

## Contexte
Feedback Lead Product Designer couvrant 4 priorités : navigation/bugs, profils publics, dashboards, blog/média.

## Étape 1 — P1 : Navigation et bugs (rapide, haute valeur)

### 1.1 Composant Breadcrumb réutilisable
- **Fichier** : `components/breadcrumb.tsx`
- **Design** : fil d'Ariane discret, élégant, responsive, cohérent avec le design system existant (couleurs slate/indigo, typo [12px] uppercase)
- **Props** : `items: Array<{ label: string; href?: string }>`
- **Usage** : intégré dans `PageShell` ou utilisé manuellement sur les pages profondes

### 1.2 Retirer "Proposer une mission" du header association
- **Fichier** : `app/association/page.tsx`
- **Action** : retirer le bouton du prop `actions` de `PageShell` dans le dashboard membre
- **Rationale** : crée de la confusion, le bouton est déjà dans la section sous-traitance

### 1.3 Mailto sur les 3 cartes association
- **Fichier** : `app/association/page.tsx`
- **Cartes** : Groupe WhatsApp, Accompagnement subventions, Média & Visibilité
- **Action** : transformer les cartes en liens `mailto:contact@clubproprete.com?subject=...`

### 1.4 Corriger "Voir mes candidatures"
- **Fichier** : `components/dashboard/my-dashboard.tsx`
- **Problème** : le lien pointe vers `/dashboard` (la page actuelle), ce qui est inutile
- **Action** : pour `company_owner` et `verified_company`, pointer vers `/dashboard/entreprise/candidatures` (à créer) ou retirer temporairement
- **Décision** : pointer vers `/dashboard/entreprise` pour l'instant, le dashboard entreprise gère les candidatures

### 1.5 Auteurs d'articles cliquables
- **Fichier** : `app/ressources/page.tsx` (listing) et `app/ressources/[id]/page.tsx` (détail)
- **Action** : rendre le nom de l'auteur cliquable vers `/membres/{authorId}`

### 1.6 Membres d'équipe cliquables
- **Fichier** : `app/annuaire/societes/[id]/page.tsx`
- **État actuel** : déjà cliquables si profil public ! Vérifier que ça fonctionne bien
- **Action** : s'assurer que le lien est bien présent et visible

## Étape 2 — P2 : Profils publics

### 2.1 Améliorer `/membres/[id]`
- **Fichier** : `app/membres/[id]/page.tsx`
- **Structure attendue** :
  - Header profil : photo, nom, poste, entreprise liée, localisation, badges
  - Résumé professionnel : bio, expertises
  - Contributions Club Propreté : articles publiés
  - Entreprises & organisations : liens cliquables
  - Recommandations (déjà présent)
- **Action serveur** : `getPublicProfile` doit aussi retourner les articles publiés par l'utilisateur

### 2.2 Articles publiés sur le profil
- **Action serveur** : ajouter `getArticlesByAuthor(authorId)` dans `lib/actions/articles.ts`
- **Page profil** : afficher la section "Articles publiés" si l'auteur a des articles

## Étape 3 — P3 : Dashboards

### 3.1 Repenser le dashboard entreprise
- **Fichier** : `app/dashboard/entreprise/page.tsx` (actuellement c'est le profil éditable)
- **Nouveau fichier** : `app/dashboard/page.tsx` doit devenir le vrai dashboard
- **Bannière score** : pleine largeur, barre de progression, % complétion, CTA "Compléter ma fiche"
- **Retirer** : card "Statut association : Validé"
- **Ajouter** : cards orientées action (compléter fiche, proposer article, voir opportunités, événements)

### 3.2 Score de profil
- **Logique** : calculer un score basé sur les champs remplis (logo, description, services, website, etc.)
- **Affichage** : bannière horizontale en haut du dashboard

## Étape 4 — P4 : Blog / média

### 4.1 Refaire le listing articles
- **Fichier** : `app/ressources/page.tsx`
- **Design** : vrai blog avec grille de cartes aérées, image principale, titre, extrait, auteur, date, temps de lecture discret
- **H1** : vrai titre "Blog & Ressources" avec introduction

### 4.2 Refaire le détail article
- **Fichier** : `app/ressources/[id]/page.tsx`
- **Design** : breadcrumb, H1, chapô, image principale, auteur cliquable, date, contenu structuré, CTA fin d'article
- **Retirer** : les StatCards "Catégorie", "Lecture", "Publication" qui prennent trop de place

### 4.3 Articles démo avec vrai contenu
- **Action** : créer un seed ou des articles via Prisma avec vrai contenu
- **Sujets** :
  1. "Comment trouver des missions de sous-traitance dans la propreté ?"
  2. "Pourquoi créer une fiche professionnelle dans le secteur du nettoyage ?"
  3. "Comment une entreprise de nettoyage peut développer sa visibilité locale ?"
  4. "Les erreurs fréquentes dans la gestion des équipes terrain"
  5. "Comment valoriser ses certifications dans la propreté ?"

## Fichiers à modifier/créer

### Nouveaux fichiers
- `components/breadcrumb.tsx` — composant breadcrumb réutilisable
- `components/profile-completion-banner.tsx` — bannière score profil
- `lib/actions/articles.ts` — `getArticlesByAuthor()`
- `prisma/seed-articles.ts` — articles démo avec vrai contenu

### Fichiers modifiés
- `app/association/page.tsx` — retirer bouton header, mailto cartes
- `app/ressources/page.tsx` — refonte listing blog
- `app/ressources/[id]/page.tsx` — refonte détail article, auteur cliquable
- `app/membres/[id]/page.tsx` — profil public enrichi, articles auteur
- `app/annuaire/societes/[id]/page.tsx` — vérifier liens équipe
- `components/dashboard/my-dashboard.tsx` — corriger liens candidatures
- `app/dashboard/page.tsx` — repenser dashboard
- `lib/actions/public.ts` — enrichir `getPublicProfile` avec articles
- `components/page-shell.tsx` — optionnellement intégrer breadcrumb

## Checklist QA

### Espace Association
- [ ] Dashboard membre : pas de bouton "Proposer une mission" dans le header
- [ ] Carte WhatsApp : clic ouvre mailto avec sujet prérempli
- [ ] Carte Subventions : clic ouvre mailto avec sujet prérempli
- [ ] Carte Média : clic ouvre mailto avec sujet prérempli
- [ ] Breadcrumb présent sur les pages profondes

### Dashboard entreprise
- [ ] Bannière score de profil en haut
- [ ] Pas de card "Statut association : Validé"
- [ ] Cards orientées action visibles
- [ ] "Voir mes candidatures" pointe vers la bonne page

### Fiche Azure Propreté Services
- [ ] Membres d'équipe cliquables
- [ ] Clic sur Claire Martin → profil public

### Profil public
- [ ] Photo, nom, poste, entreprise, localisation
- [ ] Bio professionnelle
- [ ] Articles publiés visibles
- [ ] Entreprise liée cliquable
- [ ] Recommandations visibles

### Blog
- [ ] Listing : grille aérée, images, titres, extraits
- [ ] Détail : breadcrumb, H1, auteur cliquable, contenu structuré
- [ ] Articles démo avec vrai contenu
- [ ] CTA fin d'article

### Auteur cliquable
- [ ] Listing articles : nom auteur cliquable
- [ ] Détail article : nom auteur cliquable
- [ ] Clic → profil public auteur
