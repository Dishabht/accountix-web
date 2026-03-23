<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Accountix Web

Frontend React/Vite de l'application Accountix.

## Prerequisites

- Node.js
- MongoDB (local ou cloud)
- accountix-server demarre sur le port 5000

## Run (mode developpement)

1. Demarrer MongoDB.
2. Demarrer le backend dans accountix-server:
   `npm run dev`
3. Dans ce dossier (accountix-web), installer les dependances:
   `npm install`
4. Demarrer le frontend:
   `npm run dev`

Le frontend tourne sur Vite et les appels `/api/*` sont automatiquement proxies vers `http://localhost:5000`.

## Optionnel: changer la cible API

Tu peux changer la cible du proxy avec la variable suivante:

`VITE_API_PROXY_TARGET=http://localhost:5000`

Exemple dans `.env.local` de accountix-web:

`VITE_API_PROXY_TARGET=http://localhost:5000`
