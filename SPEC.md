SPEC.md — Cahier des charges fonctionnel
Application : MalTrack
1. Présentation générale
1.1 Objectif de l’application

MalTrack est une application web de gestion financière personnelle à orientation banque privée digitale.
Son objectif est d’aider les utilisateurs à :

suivre leurs revenus et dépenses,

organiser leurs portefeuilles financiers,

fixer des objectifs d’épargne,

analyser leurs habitudes de consommation,

détecter automatiquement des dépenses anormales.

L’application vise une expérience simple, sécurisée et premium, accessible à des utilisateurs non techniques.

2. Cible utilisateur
2.1 Utilisateurs visés

Étudiants

Jeunes actifs

Freelancers

Toute personne souhaitant mieux gérer son budget personnel

2.2 Niveau technique

Aucun prérequis informatique

Application pensée pour des utilisateurs grand public

3. Fonctionnalités principales
3.1 Authentification

Objectif : sécuriser l’accès aux données personnelles.

Fonctionnalités :

Inscription utilisateur (email + mot de passe)

Connexion sécurisée

Déconnexion

Gestion de session via JWT

Protection des routes privées

Contraintes :

Mot de passe chiffré (hash)

Token stocké de manière sécurisée

Accès refusé aux utilisateurs non authentifiés

3.2 Wallets (Portefeuilles)

Objectif : permettre la gestion de plusieurs sources d’argent.

Fonctionnalités :

Création de wallets (ex : Cash, Bank, Card)

Modification d’un wallet

Suppression d’un wallet

Définition d’un wallet par défaut

Visualisation du solde

Champs principaux :

Nom

Type (cash / bank / card)

Solde initial

Devise

3.3 Transactions

Objectif : enregistrer toutes les opérations financières.

Fonctionnalités :

Ajouter une transaction (dépense ou revenu)

Modifier une transaction

Supprimer une transaction

Filtrer par :

date

wallet

catégorie

type (income / expense)

Historique chronologique

Champs principaux :

Montant

Type

Date

Description

Catégorie

Wallet

3.4 Objectifs d’épargne (Goals)

Objectif : encourager l’épargne et la planification financière.

Fonctionnalités :

Créer un objectif (ex : Voyage, Laptop)

Définir un montant cible

Ajouter des contributions

Visualiser la progression (%)

Marquer un objectif comme atteint

Champs principaux :

Titre

Montant cible

Montant épargné

Date cible (optionnelle)

3.5 Dashboard (Tableau de bord)

Objectif : donner une vue globale et synthétique de la situation financière.

Fonctionnalités :

Solde global

Total des revenus

Total des dépenses

Graphiques :

dépenses par catégorie

évolution mensuelle

Dernières transactions

Wallets et soldes

3.6 Détection d’anomalies

Objectif : alerter l’utilisateur en cas de dépenses inhabituelles.

Fonctionnalités :

Analyse automatique des dépenses

Comparaison avec l’historique

Marquage des transactions anormales

Affichage des anomalies sur le dashboard

Règle simple :

Une dépense est considérée comme anormale si elle dépasse un seuil défini par rapport à la moyenne des mois précédents.

3.7 Conception API (REST)

Objectif : définir les points d’accès permettant la communication entre le frontend et le backend.

L’application MalTrack repose sur une API REST sécurisée par JWT.
Toutes les données échangées entre le frontend (React) et le backend (Node.js / Express)
passent par ces endpoints.

---

### 🔐 Authentification

| Action | Endpoint | Méthode | Auth requise |
|------|---------|--------|-------------|
| Inscription | /api/auth/register | POST | Non |
| Connexion | /api/auth/login | POST | Non |
| Récupérer profil | /api/auth/me | GET | Oui |

---

### 💼 Wallets

| Action | Endpoint | Méthode | Auth requise |
|------|---------|--------|-------------|
| Liste des wallets | /api/wallets | GET | Oui |
| Créer un wallet | /api/wallets | POST | Oui |
| Modifier un wallet | /api/wallets/:id | PUT | Oui |
| Supprimer un wallet | /api/wallets/:id | DELETE | Oui |

---

### 🏷️ Catégories

| Action | Endpoint | Méthode | Auth requise |
|------|---------|--------|-------------|
| Liste des catégories | /api/categories | GET | Oui |
| Créer une catégorie | /api/categories | POST | Oui |
| Modifier une catégorie | /api/categories/:id | PUT | Oui |
| Supprimer une catégorie | /api/categories/:id | DELETE | Oui |

---

### 💳 Transactions

| Action | Endpoint | Méthode | Auth requise |
|------|---------|--------|-------------|
| Liste des transactions | /api/transactions | GET | Oui |
| Ajouter une transaction | /api/transactions | POST | Oui |
| Modifier une transaction | /api/transactions/:id | PUT | Oui |
| Supprimer une transaction | /api/transactions/:id | DELETE | Oui |

---

### 🎯 Objectifs d’épargne

| Action | Endpoint | Méthode | Auth requise |
|------|---------|--------|-------------|
| Liste des objectifs | /api/goals | GET | Oui |
| Créer un objectif | /api/goals | POST | Oui |
| Modifier un objectif | /api/goals/:id | PUT | Oui |
| Supprimer un objectif | /api/goals/:id | DELETE | Oui |

---

### 📊 Dashboard & statistiques

| Action | Endpoint | Méthode | Auth requise |
|------|---------|--------|-------------|
| Résumé financier | /api/stats/summary | GET | Oui |

---

### ⚙️ Paramètres

| Action | Endpoint | Méthode | Auth requise |
|------|---------|--------|-------------|
| Récupérer paramètres | /api/settings | GET | Oui |
| Modifier paramètres | /api/settings | PUT | Oui |

---

### 🔒 Sécurité API
- Accès sécurisé par token JWT
- Token envoyé via le header Authorization
- Accès limité aux données du propriétaire
- Validation des entrées côté backend


4. Contraintes
4.1 Sécurité

Authentification JWT

Hashage des mots de passe

Accès aux données limité à l’utilisateur propriétaire

Validation des entrées utilisateur

4.2 Performance

API optimisée (requêtes filtrées)

Indexation des données importantes

Temps de réponse rapide (< 1s pour les actions principales)

4.3 Expérience utilisateur (UX)

Interface claire et moderne

Dark mode par défaut

Navigation simple

Feedback visuel (loading, messages de succès/erreur)

5. Technologies (résumé)

Frontend : React + Tailwind CSS

Backend : Node.js + Express

Base de données : MongoDB

Tests API : Postman

Versioning : Git / GitHub

6. Livrables attendus

Application web fonctionnelle (frontend + backend)

Code source structuré sur GitHub

Collection Postman complète

Documentation :

README.md

SPEC.md

Captures d’écran

Rapport final + présentation