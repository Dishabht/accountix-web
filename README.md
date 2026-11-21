# Accountix Web

Frontend web de la plateforme Accountix. L’application fournit l’interface utilisateur pour la gestion des employés, clients, projets, factures, devis, présences, fournisseurs et notifications.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

## Prérequis

- Node.js 20+ recommandé
- Le backend Accountix doit tourner sur `http://localhost:5000`

## Installation

1. Installer les dépendances:
   `npm install`
2. Créer un fichier `.env.local` à la racine du projet à partir de [.env.example](.env.example)
3. Renseigner ta clé `GEMINI_API_KEY`
4. Lancer l’application:
   `npm run dev`

## Variables d’environnement

- `GEMINI_API_KEY`: clé utilisée côté front pour les fonctionnalités liées à Gemini
- `VITE_PORT`: port Vite optionnel, par défaut `5173`

## Scripts

- `npm run dev`: démarre le serveur de développement
- `npm run build`: compile l’application pour la production
- `npm run lint`: vérifie les types TypeScript
- `npm run test:login`: exécute le test Selenium de connexion
- `npm run test:home`: exécute le test d’accueil
- `npm run test:navigation`: exécute le test de navigation
- `npm run test:form`: exécute le test de validation de formulaire

## Notes de déploiement

- Le proxy Vite envoie les requêtes `/api` vers le backend local sur le port `5000`.
- Les dossiers générés comme `dist/` et les secrets `.env*` restent exclus du dépôt via [.gitignore](.gitignore).
