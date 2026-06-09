# ClubProprete.com

Plateforme B2B gratuite pour les professionnels du nettoyage : annuaires, emploi, formations, association, sous-traitance privée et back-office de validation.

## Demarrage local

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Scripts

- `npm run dev` : lance l'application en developpement.
- `npm run build` : verifie la compilation Next.js.
- `npm run typecheck` : verifie TypeScript.
- `npm run prisma:migrate` : prepare la base locale SQLite.
- `npm run prisma:studio` : ouvre l'interface Prisma.

## V0

Le cadrage de construction est dans `docs/mvp-v0-plan.md`.

## Connexion et inscription V0

L'application contient une authentification de demonstration locale, stockee dans le navigateur. Elle permet de tester les parcours avant le branchement Auth.js/base de donnees.

Comptes de test disponibles sur `/connexion` :

- `societe@clubproprete.test` : societe membre association.
- `fournisseur@clubproprete.test` : fournisseur non membre.
- `independant@clubproprete.test` : independant membre association.
- `candidat@clubproprete.test` : candidat sans acces sous-traitance.
- `admin@clubproprete.test` : admin back-office.

L'inscription est disponible sur `/inscription`. Elle cree une session locale et redirige vers `/onboarding`, puis `/dashboard`.

Cette premiere version de projet contient :

- structure Next.js App Router ;
- pages publiques principales ;
- dashboards par role ;
- back-office de depart ;
- donnees seedees en TypeScript ;
- schema Prisma local pret a migrer.
