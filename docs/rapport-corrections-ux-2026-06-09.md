# Rapport d'exécution — Corrections UX/UI Club Propreté

**Date :** 9 juin 2026  
**Source :** Feedback Lead Product Designer / UX/UI / Product Owner  
**Statut :** ✅ Terminé — Build OK, toutes pages 200

---

## 1. Fichiers créés

| Fichier | Description |
|---------|-------------|
| `components/breadcrumb.tsx` | Composant Breadcrumb réutilisable avec props `items: Array<{label: string; href?: string}>` |
| `prisma/seed-articles.ts` | Script d'insertion de 5 articles de démo avec vrai contenu (idempotent via `upsert`) |

---

## 2. Fichiers modifiés

### Navigation & Association
| Fichier | Changements |
|---------|-------------|
| `app/association/page.tsx` | • Retiré le bouton "Proposer une mission" du header PageShell (dashboard membre)  <br>• 3 cartes réseau d'entraide transformées en liens `mailto` cliquables (WhatsApp, Subventions, Média)  <br>• Breadcrumb ajouté : `Accueil > Association > Espace membre` (dashboard) et `Accueil > Association` (landing) |

### Blog / Média
| Fichier | Changements |
|---------|-------------|
| `app/ressources/page.tsx` | • H1 "Blog & Ressources" avec description  <br>• Retrait des 3 StatCards inutiles (Articles, Catégories, Segments)  <br>• Grille `lg:grid-cols-3` avec cartes aérées  <br>• Carte article : image/placeholder, titre, extrait, auteur cliquable (avatar + nom), date, catégorie discrète, temps de lecture, CTA "Lire l'article"  <br>• Barre de recherche conservée  <br>• Newsletter conservée |
| `app/ressources/[id]/page.tsx` | • Breadcrumb : `Accueil > Blog > {titre}`  <br>• Retrait des 3 StatCards (Catégorie, Lecture, Publication)  <br>• Header article : badge catégorie, H1, meta (auteur cliquable + date + temps lecture), image principale  <br>• Chapô : excerpt en italique sur fond indigo-50  <br>• Contenu : prose-lg, leading-relaxed, whitespace-pre-wrap  <br>• Tags plus discrets  <br>• CTA fin d'article : "Rejoindre Club Propreté" + "Découvrir l'association"  <br>• Sidebar : auteur cliquable, newsletter conservée, boutons disabled retirés |
| `lib/actions/articles.ts` | • Fix : ajout de `id: true` dans le select `author` de `getPublishedArticles`  <br>• Nouvelle fonction `getArticlesByAuthor(authorId)` — retourne les articles publiés d'un auteur |

### Profils publics
| Fichier | Changements |
|---------|-------------|
| `app/membres/[id]/page.tsx` | • Header profil : avatar grande taille, nom, poste/entreprise, localisation, badges (vérifié, membre association), CTA "Contacter" (mailto)  <br>• Résumé professionnel : bio ou placeholder si viewer = propriétaire  <br>• Entreprises & organisations : cartes visibles avec icône et rôle  <br>• Articles publiés : nouvelle section avec grille de 2-3 articles (titre cliquable, date, catégorie) — masquée si vide  <br>• Recommandations conservées  <br>• Message profil privé conservé |
| `lib/actions/public.ts` | • `getPublicProfile` enrichi : retourne aussi `email` et `profile.associationStatus` |

### Dashboards
| Fichier | Changements |
|---------|-------------|
| `components/dashboard/my-dashboard.tsx` | • **Bannière score de profil** (`ProfileCompletionBanner`) : calcul dynamique 0-100% basé sur les champs remplis (logo 20%, descriptions 30%, services 15%, website 10%, ville 10%, téléphone 10%, photos 5%). Barre de progression indigo, 3 actions recommandées, CTA "Compléter ma fiche". Uniquement pour `company_owner` et `verified_company`.  <br>• **Cards orientées action** (grille `lg:grid-cols-3`) : "Optimiser ma fiche", "Recrutement", "Visibilité & Média", "Association" (si membre), "Devenir membre" (si non membre)  <br>• **Retiré** : badge "Non membre association" du header  <br>• **Corrigé** : "Voir mes candidatures" pointe vers `/dashboard/entreprise` (au lieu de `/dashboard`)  <br>• Metrics conservées mais déplacées sous la bannière |
| `app/dashboard/page.tsx` | • Import et passage de `company` à `MyDashboard` pour les rôles entreprise |
| `app/dashboard/entreprise/page.tsx` | • Ajout d'une section "Candidatures reçues" en haut de page (avant le formulaire)  <br>• Appel `getApplicationsForCompany` via useEffect  <br>• Liste des candidatures avec nom, offre, statut, date  <br>• Bouton "Voir mes offres" → `/dashboard/entreprise/offres` |

### Annuaire
| Fichier | Changements |
|---------|-------------|
| `app/annuaire/societes/[id]/page.tsx` | • **Vérifié** : membres d'équipe déjà cliquables vers `/membres/{id}` quand profil public — aucune modification nécessaire |

---

## 3. Routes ajoutées / modifiées

| Route | État | Description |
|-------|------|-------------|
| `/association` | Modifiée | Dashboard membre sans bouton header, cartes mailto, breadcrumb |
| `/association/adhesion` | Existante | Formulaire adhésion |
| `/ressources` | Modifiée | Listing blog refondu, grille 3 colonnes, auteurs cliquables |
| `/ressources/[id]` | Modifiée | Détail article refondu, breadcrumb, CTA fin article |
| `/membres/[id]` | Modifiée | Profil public enrichi LinkedIn-like, articles auteur |
| `/dashboard` | Modifiée | Dashboard entreprise repensé avec bannière score |
| `/dashboard/entreprise` | Modifiée | Section candidatures reçues ajoutée |
| `/annuaire/societes/[id]` | Vérifiée | Équipe cliquable (déjà fonctionnel) |

---

## 4. Composants créés / modifiés

### Nouveaux composants
- **`Breadcrumb`** (`components/breadcrumb.tsx`) — fil d'Ariane réutilisable, accessible, responsive
- **`ProfileCompletionBanner`** (inline dans `my-dashboard.tsx`) — bannière score de profil avec barre de progression

### Composants modifiés
- **`PageShell`** — utilisé avec breadcrumb sur les pages profondes
- **`EntityCard`** — utilisé dans les nouvelles cards orientées action
- **`StatCard`** — conservé, déplacé sous la bannière score

---

## 5. Bugs corrigés

| Bug | Correction |
|-----|------------|
| Bouton "Proposer une mission" dans le header association (inapproprié) | Retiré du `actions` de `PageShell` |
| Cartes association non cliquables | Transformées en liens `mailto` avec sujet prérempli |
| "Voir mes candidatures" pointe vers la page actuelle | Corrigé → `/dashboard/entreprise` |
| Blog : design pas assez professionnel | Refonte complète listing + détail |
| Blog : auteurs non cliquables | Liens vers `/membres/{authorId}` ajoutés |
| Blog : StatCards prennent trop de place | Retirés, remplacés par header article propre |
| Profil public trop basique | Enrichi : header, bio, entreprises, articles, CTA contact |
| Dashboard entreprise trop générique | Bannière score + cards orientées action |
| Card "Statut association : Validé" inutile | Retirée, remplacée par badge discret |
| Articles de démo sans vrai contenu | 5 articles créés avec 300-500 mots chacun |

---

## 6. Points encore à vérifier

1. **Responsive mobile** : vérifier que la grille `lg:grid-cols-3` du blog et les cards du dashboard se comportent bien sur mobile
2. **Performance images** : les articles n'ont pas d'images (`featuredImage` = null), les placeholders sont utilisés
3. **Emails mailto** : vérifier que les liens `mailto` s'ouvrent correctement dans le client mail de l'utilisateur
4. **Breadcrumb sur toutes les pages profondes** : actuellement uniquement sur association et blog. À étendre aux autres pages si besoin.

---

## 7. Limites et données non disponibles

| Limite | Explication |
|--------|-------------|
| Pas d'image pour les articles | `featuredImage` est null sur les articles démo — placeholder utilisé |
| Pas de vraies événements | Les événements dans le dashboard association sont des données statiques (hardcodées) |
| Pas de vraies formations liées à un auteur | La section "Formations" sur le profil public n'est pas implémentée (pas de relation directe) |
| Pas de workflow contributeur complet | L'action "Proposer un article" pointe vers `/ressources` (listing) en attendant le vrai workflow rédactionnel |
| Score de profil simplifié | Basé sur la présence des champs, pas sur leur qualité |
| Candidatures sur dashboard entreprise | Appel asynchrone via useEffect (Client Component) — pas de SSR pour cette section |

---

## 8. Checklist QA

### Espace Association
- [x] Dashboard membre : pas de bouton "Proposer une mission" dans le header
- [x] Carte WhatsApp : clic ouvre mailto avec sujet "Demande d'accès au groupe WhatsApp Club Propreté"
- [x] Carte Subventions : clic ouvre mailto avec sujet "Demande d'accompagnement ou d'information sur les subventions"
- [x] Carte Média : clic ouvre mailto avec sujet "Demande d'information sur les opportunités médias et visibilité"
- [x] Breadcrumb présent sur le dashboard association
- [x] Breadcrumb présent sur la landing association

### Dashboard entreprise
- [x] Bannière score de profil en haut (pleine largeur, barre de progression, %, CTA)
- [x] Pas de card "Statut association : Validé"
- [x] Cards orientées action visibles (Optimiser fiche, Recrutement, Visibilité, Association/Devenir membre)
- [x] "Voir mes candidatures" pointe vers `/dashboard/entreprise`
- [x] Section "Candidatures reçues" visible sur `/dashboard/entreprise`

### Fiche entreprise (Azure Propreté Services)
- [x] Membres d'équipe cliquables vers profil public (si profil public)
- [x] Badge "Profil public" visible sur les membres cliquables

### Profil public
- [x] Photo, nom, poste/entreprise, localisation
- [x] Bio professionnelle (ou placeholder si vide et viewer = propriétaire)
- [x] Badges : "Profil vérifié", "Membre association"
- [x] CTA "Contacter" (mailto)
- [x] Entreprises liées cliquables
- [x] Articles publiés visibles (si l'auteur a des articles)
- [x] Recommandations visibles

### Blog
- [x] Listing : grille aérée, titres, extraits, auteurs cliquables, dates
- [x] Détail : breadcrumb, H1, auteur cliquable, chapô, contenu structuré
- [x] 5 articles démo avec vrai contenu (300-500 mots chacun)
- [x] CTA fin d'article (Rejoindre / Association)
- [x] Tags discrets

### Auteur cliquable
- [x] Listing articles : nom auteur cliquable → profil public
- [x] Détail article : nom auteur cliquable → profil public

---

## 9. Commandes de vérification

```bash
# TypeScript
npm run typecheck        # ✅ Passe

# Build
npm run build            # ✅ Passe

# Articles en base
sqlite3 prisma/dev.db "SELECT title, slug, category, status FROM Article WHERE status='published';"

# Pages en localhost
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ressources        # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/association       # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/membres/{id}     # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/association/adhesion  # 200
```

---

## 10. Prochaines étapes recommandées (hors scope du feedback)

1. **Étendre le Breadcrumb** à toutes les pages profondes (formations, emploi, fournisseurs, etc.)
2. **Ajouter des images** aux articles de démo (`featuredImage`)
3. **Workflow contributeur** : créer la page `/ressources/nouveau` pour rédiger un article
4. **Page événements** : remplacer les événements hardcodés par des données en base
5. **SEO articles** : ajouter `metadata` dynamique sur `/ressources/[id]` (title, description, OG)
6. **Analytics** : tracker les clics sur les CTA (score profil, candidatures, articles)

---

*Rapport généré automatiquement après exécution des corrections.*
