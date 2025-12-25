# 📊 Diagrammes d'architecture - MalTrack

Ce diagramme présente l’architecture globale de l’application MalTrack basée sur une approche client–serveur.

Ce dossier contient les diagrammes d'architecture du projet MalTrack.

## 📁 Fichiers

### architecture.png
![Architecture MalTrack](./architecture.png)

**Description** : Diagramme d'architecture globale montrant les 3 composants principaux du système.

**Composants** :
1. **Frontend** - React + Tailwind CSS
   - Interface utilisateur
   - Authentification (Login/Register)
   - Stockage du token JWT
   - Appels API

2. **Backend** - Node.js + Express
   - Routes API REST (/api/*)
   - Middleware JWT
   - Logique métier
   - Connexion MongoDB via Mongoose

3. **Database (NoSQL)** - MongoDB
   - Users (utilisateurs)
   - Wallets (portefeuilles)
   - Categories (catégories)
   - Transactions
   - Goals (objectifs)
   - Settings (paramètres)

**Flux** :
- Frontend → Backend : HTTP avec JWT
- Backend → MongoDB : Requêtes Mongoose

## 🛠️ Technologies

| Composant | Technologies |
|-----------|--------------|
| Frontend | React, Tailwind CSS, Axios |
| Backend | Node.js, Express, JWT |
| Database | MongoDB, Mongoose |
| Authentification | JWT, bcryptjs |

## 📋 Informations
- **Date création** : 25 décembre 2025
- **Format** : PNG
- **Statut** : ✅ Complet

---
*Documentation de l'architecture système MalTrack*
