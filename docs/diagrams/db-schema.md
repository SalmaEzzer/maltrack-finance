# 🗄️ Schéma de base de données – MalTrack

## 🎯 Choix technologique
L’application **MalTrack** utilise **MongoDB**, une base de données NoSQL orientée document.
La modélisation repose sur des **collections** et des **références ObjectId** via l’ODM **Mongoose**,
ce qui permet une bonne flexibilité et une évolution progressive du schéma.

---

## 📁 Collections

### 👤 USERS
Contient les informations liées aux comptes utilisateurs.
- Email unique pour l’authentification
- Préférences de langue et de devise
- Sécurité assurée par un mot de passe hashé

Relations :
- 1 utilisateur → N wallets
- 1 utilisateur → N transactions
- 1 utilisateur → N categories
- 1 utilisateur → N goals
- 1 utilisateur → 1 settings

---

### 💼 WALLETS
Représente les moyens financiers de l’utilisateur  
(exemples : cash, compte bancaire, carte).

Relations :
- 1 wallet → N transactions
- appartient à un utilisateur

Règle :
- Un seul wallet peut être défini comme wallet par défaut (`isDefault = true`)

---

### 🏷️ CATEGORIES
Catégories de revenus ou de dépenses.
Elles peuvent contenir un budget limite mensuel.

Relations :
- 1 catégorie → N transactions
- appartient à un utilisateur

---

### 💳 TRANSACTIONS
Enregistre l’ensemble des revenus et dépenses de l’utilisateur.
Cette collection est centrale pour le calcul des statistiques
et la détection d’anomalies.

Relations :
- liée à un utilisateur
- liée à un wallet
- liée à une catégorie

Règles :
- Le montant doit être strictement positif
- Chaque transaction est soit un revenu, soit une dépense

---

### 🎯 GOALS
Objectifs financiers (épargne, achat, projet).
Ils permettent de suivre la progression via des contributions.

Relations :
- appartient à un utilisateur

---

### ⚙️ SETTINGS
Paramètres globaux de l’utilisateur.
Ils centralisent la configuration de l’application.

Fonctionnalités :
- Détection d’anomalies
- Notifications (transactions, budgets, objectifs)

Relations :
- 1 settings par utilisateur (relation 1–1)

---

## 🔐 Règles métier principales
- Un utilisateur possède un seul document `settings`
- Un seul wallet par utilisateur peut être défini comme défaut
- Les anomalies sont détectées à partir de l’historique des transactions
- Les montants des transactions sont strictement positifs
- Les données sont isolées par utilisateur via `userId`

---

## 📌 Conclusion
Ce schéma de base de données est adapté à une **architecture MERN moderne**.
Il assure une bonne séparation des responsabilités, une cohérence des données
et permet une évolution future de l’application MalTrack.
