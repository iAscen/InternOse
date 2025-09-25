# Plan de Démo - InternOSE

## Vue d'ensemble du projet

**InternOSE** est une plateforme de gestion de stages qui connecte les employeurs et les étudiants. Le projet comprend un backend Spring Boot et un frontend React avec TypeScript.

---

## Démo complète

### Phase 1 : Introduction et contexte

#### Présentation du projet

- **Objectif** : Plateforme de gestion de stages pour connecter employeurs et étudiants
- **Technologies** :
    - Backend : Spring Boot + JPA + JWT
    - Frontend : React + TypeScript + Tailwind CSS
- **Architecture** : API REST + Interface utilisateur moderne

#### Fonctionnalités principales

- Inscription/Connexion pour employeurs et étudiants
- Dashboard employeur avec gestion des offres de stage
- Dashboard étudiant avec téléversement de CV (EQ6-5) - **Frontend uniquement**
- Isolation des données par utilisateur
- Interface responsive et moderne

---

### Phase 2 : Inscription et Connexion

#### 2.1 Inscription Employeur

1. Aller sur `/signup`
2. Sélectionner "Employeur"
3. Remplir le formulaire :
    - Nom : "Dupont"
    - Prénom : "Jean"
    - Email : "jean.dupont@entreprise.com"
    - Mot de passe : "Password123!"
    - Entreprise : "TechCorp"
4. Cliquer "S'inscrire"
5. Résultat : Redirection automatique vers le dashboard employeur

#### 2.2 Inscription Étudiant

1. Aller sur `/signup`
2. Sélectionner "Étudiant"
3. Remplir le formulaire :
    - Nom : "Martin"
    - Prénom : "Sophie"
    - Email : "sophie.martin@student.com"
    - Mot de passe : "Password123!"
4. Cliquer "S'inscrire"
5. Résultat : Redirection automatique vers le dashboard étudiant

#### 2.3 Connexion

1. Aller sur `/login`
2. Tester la connexion avec les comptes créés
3. Démontrer la redirection automatique selon le type d'utilisateur

---

### Phase 3 : Dashboard Employeur

#### 3.1 Interface du dashboard

1. Se connecter avec un compte employeur
2. Expliquer les éléments de l'interface :
    - En-tête avec navigation
    - Cartes de statistiques (Total, En attente, Validées, Expirées)
    - Bouton "Créer une offre"

#### 3.2 Création d'une offre de stage

1. Cliquer "Créer une offre"
2. Remplir le formulaire :
    - Titre du poste : "Développeur Full Stack"
    - Description : "Développement d'applications web modernes"
    - Compétences : "React, Node.js, PostgreSQL"
    - Durée : "12 semaines"
    - Date de début : "2024-06-01"
    - Salaire : "500"
    - Adresse : "123 Rue de la Tech, Montréal"
3. Cliquer "Créer l'offre"
4. Démontrer :
    - Message de succès
    - Rechargement automatique de la liste
    - Mise à jour des statistiques

#### 3.3 Isolation des données

1. Créer un deuxième compte employeur
2. Se connecter avec le nouveau compte
3. Démontrer que les offres du premier employeur ne sont pas visibles
4. Créer une offre avec le deuxième compte
5. Vérifier l'isolation des données

---

### Phase 4 : Dashboard Étudiant

#### 4.1 Interface du dashboard

1. Se connecter avec un compte étudiant
2. Expliquer les éléments de l'interface :
    - Cartes de statistiques (CV validé, Candidatures, etc.)
    - Section de statut du CV
    - Bouton "Téléverser mon CV"

#### 4.2 Téléversement de CV (EQ6-5) - Frontend uniquement

1. Cliquer "Téléverser mon CV"
2. Démontrer la zone de drag & drop moderne
3. Téléverser un fichier PDF :
    - Glisser-déposer un fichier PDF
    - Ou cliquer pour sélectionner
4. Démontrer les validations :
    - Format : Seuls les PDF sont acceptés
    - Taille : Maximum 10MB
    - Feedback visuel : Messages d'erreur clairs
    - Interface désactivée pendant le traitement
5. Démontrer le workflow (simulation) :
    - Changement de statut : "En attente"
    - Simulation de validation après 3 secondes
    - Statut final : "CV validé"

#### 4.3 Gestion des statuts

1. Démontrer les différents statuts :
    - Aucun CV téléversé
    - CV en attente de validation
    - CV validé
    - CV rejeté (avec bouton de retéléversement)

---

### Phase 5 : Story EQ6-5 - Téléversement de CV

#### 5.1 Fonctionnalités implémentées (Frontend uniquement)

1. Interface de téléversement moderne :
    - Zone de drag & drop avec feedback visuel
    - Bouton de sélection de fichier
    - Indicateurs de statut en temps réel

2. Validations côté client :
    - Format PDF uniquement : Rejet des autres formats
    - Taille maximale 10MB : Message d'erreur si dépassé
    - Feedback immédiat : Validation en temps réel

3. Gestion des statuts :
    - Aucun CV : Interface d'invitation
    - En attente : Indicateur de validation en cours
    - Validé : Confirmation de validation
    - Rejeté : Option de retéléversement

4. Expérience utilisateur :
    - Interface désactivée pendant le traitement
    - Messages d'erreur clairs et contextuels
    - Simulation réaliste du workflow backend

#### 5.2 Démonstration technique

1. Tester les cas d'erreur :
    - Fichier non-PDF → Message d'erreur
    - Fichier > 10MB → Message d'erreur
    - Fichier valide → Workflow normal

2. Démontrer la robustesse :
    - Interface responsive
    - Gestion des états d'erreur
    - Feedback utilisateur constant

#### 5.3 Backend manquant - Prêt pour l'intégration

**IMPORTANT** : Le backend pour la gestion des CV n'est pas encore implémenté.

- API Service : Méthodes `uploadCV()` et `getCVStatus()` prêtes
- Endpoints attendus : `POST /api/student/cv` et `GET /api/student/cv/status`
- Format de données : FormData pour le téléversement
- Gestion d'erreurs : Prête pour les réponses du serveur

---

### Phase 6 : Fonctionnalités techniques

#### 6.1 Sécurité et authentification

1. Démontrer la protection des routes
2. Tester l'accès sans authentification
3. Expliquer le système JWT et l'isolation des données

#### 6.2 Interface responsive

1. Tester sur différentes tailles d'écran
2. Démontrer l'adaptabilité mobile/desktop

#### 6.3 Gestion d'erreurs

1. Tester des cas d'erreur :
    - Mot de passe faible
    - Email déjà existant
    - Fichier non-PDF
    - Fichier trop volumineux

---

### Phase 7 : Architecture et code

#### 7.1 Structure du projet

- Backend : Controllers, Services, DAOs, Modèles
- Frontend : Composants React, Services API, Routing

#### 7.2 Points techniques clés

- Isolation des données par employeur
- Validation côté client et serveur
- Gestion des fichiers (CV) - EQ6-5 (Frontend uniquement)
- Interface utilisateur moderne

#### 7.3 Composants EQ6-5 (Frontend)

- `CVUploadSection` : Zone de téléversement avec drag & drop
- `CVStatusCard` : Affichage des statuts du CV
- `StudentDashboardContent` : Dashboard principal mis à jour
- API Service : Méthodes `uploadCV()` et `getCVStatus()`

---

## Points forts à mettre en avant

### Fonctionnalités implémentées

- Inscription/Connexion sécurisée
- Dashboards spécialisés par type d'utilisateur
- Gestion complète des offres de stage
- **Téléversement et validation de CV (EQ6-5)** - Frontend complet
- Isolation des données par utilisateur
- Interface moderne et responsive

### Qualité technique

- Architecture MVC bien structurée
- Sécurité avec JWT
- Validation des données
- Gestion d'erreurs robuste
- Code propre et maintenable

### Expérience utilisateur

- Interface intuitive
- Feedback visuel clair
- Navigation fluide
- Design professionnel

---

## Script de démo

### Introduction

"Bonjour, je vais vous présenter InternOSE, une plateforme de gestion de stages que j'ai développée. Cette application permet aux employeurs de créer et gérer des offres de stage, et aux étudiants de téléverser leur CV pour postuler."

### Transition entre sections

- "Commençons par l'inscription des utilisateurs..."
- "Maintenant, explorons le dashboard employeur..."
- "Passons au côté étudiant..."
- "Regardons les aspects techniques..."

### Conclusion

"InternOSE est une plateforme complète qui répond aux besoins des employeurs et des étudiants dans la gestion des stages. L'architecture est extensible et prête pour de futures fonctionnalités comme la recherche d'offres ou le système de candidatures."

---

## Préparation technique

### Avant la démo

1. Vérifier que le backend est démarré
2. Vérifier que le frontend est démarré
3. Préparer des fichiers PDF de test
4. Tester tous les scénarios

### Environnement de démo

- Backend : `http://localhost:8080`
- Frontend : `http://localhost:5173`
- Base de données : H2 (en mémoire)

---

## Métriques de succès

- Fonctionnalités : 4/5 des user stories implémentées (EQ6-5 frontend uniquement)
- Sécurité : Isolation des données garantie
- UX : Interface intuitive et responsive
- Code : Architecture propre et maintenable

**Note importante** : La story EQ6-5 (téléversement de CV) est implémentée côté frontend uniquement. Le backend correspondant n'est pas encore développé.
