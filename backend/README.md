# Backend — Application de mise en relation des prestataires et clients locaux

API REST développée avec **Django 6.1.1** + **Django REST Framework**, authentification **JWT** (`djangorestframework-simplejwt`), base de données **MySQL**.

## Sommaire

- [Installation](#installation)
- [Authentification](#authentification)
- [Utilisateurs & profils](#utilisateurs--profils)
- [Catalogue (catégories / services)](#catalogue-catégories--services)
- [Demandes](#demandes)
- [Propositions](#propositions)
- [Missions](#missions)
- [Avis](#avis)
- [Statistiques / dashboards](#statistiques--dashboards)
- [Intelligence artificielle](#intelligence-artificielle)
- [Rôles et permissions](#rôles-et-permissions)
- [Documentation interactive (Swagger)](#documentation-interactive-swagger)

---

## Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Créer un fichier `.env` à la racine de `backend/` :

```env
SECRET_KEY=...
DEBUG=True
DB_NAME=projet_m1_miage
DB_USER=...
DB_PASSWORD=...
DB_HOST=localhost
DB_PORT=3306
OPENROUTER_API_KEY=...
```

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

L'API est servie sur `http://127.0.0.1:8000/`. Toutes les routes ci-dessous sont préfixées par `/api/` (sauf `/admin/`).

---

## Authentification

Authentification par **JWT** (JSON Web Token). Le token `access` doit être envoyé dans l'en-tête `Authorization: Bearer <token>` pour tous les endpoints protégés.

| Méthode | Endpoint               | Auth requise | Description                                                                                                                                                                    |
| ------- | ---------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST    | `/api/token/`          | Non          | Connexion. Body : `{"username", "password"}`. Retourne `{"access", "refresh"}`.                                                                                                |
| POST    | `/api/token/refresh/`  | Non          | Renouvelle un `access` token à partir d'un `refresh` token.                                                                                                                    |
| POST    | `/api/users/register/` | Non          | Inscription. Body : `{"username", "email", "password", "role", "telephone"}`. `role` ∈ `CLIENT` / `PRESTATAIRE`. Crée automatiquement le profil Client ou Prestataire associé. |

---

## Utilisateurs & profils

| Méthode         | Endpoint                         | Rôle requis | Description                                                                                                                                                               |
| --------------- | -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET, PUT, PATCH | `/api/users/client/me/`          | CLIENT      | Consulter / modifier son propre profil client (adresse, ville, latitude, longitude).                                                                                      |
| GET, PUT, PATCH | `/api/users/prestataire/me/`     | PRESTATAIRE | Consulter / modifier son propre profil prestataire (description, adresse, latitude, longitude, années d'expérience, disponibilité). `statut_validation` en lecture seule. |
| GET             | `/api/users/prestataires/carte/` | Authentifié | Liste des prestataires **validés** et géolocalisés (id, username, ville, latitude, longitude, expérience, disponibilité). Alimente la carte interactive.                  |

---

## Catalogue (catégories / services)

CRUD standard (GET liste, POST création, GET/PUT/PATCH/DELETE par id). Lecture libre pour tout utilisateur authentifié, écriture réservée aux administrateurs (sauf `prestataire-services`, réservé aux prestataires).

| Méthode                 | Endpoint                          | Rôle requis (écriture)                                                         |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| GET, POST               | `/api/categories/`                | ADMIN                                                                          |
| GET, PUT, PATCH, DELETE | `/api/categories/{id}/`           | ADMIN                                                                          |
| GET, POST               | `/api/services/`                  | ADMIN                                                                          |
| GET, PUT, PATCH, DELETE | `/api/services/{id}/`             | ADMIN                                                                          |
| GET, POST               | `/api/prestataire-services/`      | PRESTATAIRE (associe un service à son propre profil, avec tarif_min/tarif_max) |
| GET, PUT, PATCH, DELETE | `/api/prestataire-services/{id}/` | Prestataire propriétaire ou ADMIN                                              |

---

## Demandes

Une demande représente le besoin exprimé par un client.

| Méthode                 | Endpoint                              | Rôle requis                                    | Description                                                                                                                                   |
| ----------------------- | ------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| GET                     | `/api/demandes/`                      | Authentifié                                    | Liste des demandes (visibilité publique entre utilisateurs authentifiés, pour permettre aux prestataires de parcourir les demandes ouvertes). |
| POST                    | `/api/demandes/`                      | CLIENT                                         | Créer une demande. Le champ `client` est déduit automatiquement de l'utilisateur connecté.                                                    |
| GET, PUT, PATCH, DELETE | `/api/demandes/{id}/`                 | Client propriétaire ou ADMIN (pour l'écriture) |                                                                                                                                               |
| GET                     | `/api/demandes/{id}/recommandations/` | Authentifié                                    | Calcule et retourne les prestataires recommandés pour cette demande, classés par score pondéré, avec justification.                           |

**Champs** : `client`, `service`, `titre`, `description`, `budget_min`, `budget_max`, `date_souhaitee`, `urgence`, `adresse`, `latitude`, `longitude`, `statut` (`BROUILLON`/`PUBLIEE`/`EN_COURS`/`TERMINEE`/`ANNULEE`), `date_creation`, `date_modification`.

---

## Propositions

Une proposition est la réponse d'un prestataire à une demande.

| Méthode                 | Endpoint                           | Rôle requis                                   | Description                                                                                                                                         |
| ----------------------- | ---------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET                     | `/api/propositions/`               | Authentifié                                   | Un prestataire ne voit que ses propositions ; un client ne voit que celles reçues sur ses demandes ; l'admin voit tout.                             |
| POST                    | `/api/propositions/`               | PRESTATAIRE                                   | Créer une proposition. Le champ `prestataire` est déduit automatiquement. Contrainte : un seul prestataire par demande (unicité en base).           |
| GET, PUT, PATCH, DELETE | `/api/propositions/{id}/`          | Prestataire auteur ou ADMIN (pour l'écriture) |                                                                                                                                                     |
| POST                    | `/api/propositions/{id}/accepter/` | Client propriétaire de la demande             | Accepte la proposition : marque les autres propositions `REFUSEE`, passe la demande à `EN_COURS`, crée automatiquement la `Mission` correspondante. |

**Champs** : `demande`, `prestataire`, `message`, `tarif_propose`, `statut` (`EN_ATTENTE`/`ACCEPTEE`/`REFUSEE`/`ANNULEE`), `date_proposition`, `date_reponse`.

---

## Missions

Une mission naît automatiquement de l'acceptation d'une proposition (voir ci-dessus). Pas de création directe via l'API.

| Méthode                 | Endpoint              | Rôle requis                                                                             |
| ----------------------- | --------------------- | --------------------------------------------------------------------------------------- |
| GET                     | `/api/missions/`      | Authentifié — filtré par rôle (client / prestataire concernés, ou admin pour tout voir) |
| GET, PUT, PATCH, DELETE | `/api/missions/{id}/` | Client ou prestataire concerné, ou ADMIN                                                |

**Champs** : `proposition`, `statut` (`EN_COURS`/`TERMINEE`/`ANNULEE`), `date_debut`, `date_fin`.

---

## Avis

Un avis est laissé par le client après une mission terminée.

| Méthode                 | Endpoint          | Rôle requis                              | Description                                                                                                                                       |
| ----------------------- | ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET                     | `/api/avis/`      | Authentifié — filtré par rôle            |                                                                                                                                                   |
| POST                    | `/api/avis/`      | CLIENT                                   | Body : `{"mission", "note" (1-5), "commentaire"}`. Validations : mission `TERMINEE`, client propriétaire de la mission, un seul avis par mission. |
| GET, PUT, PATCH, DELETE | `/api/avis/{id}/` | Client auteur ou ADMIN (pour l'écriture) |                                                                                                                                                   |

---

## Statistiques / dashboards

| Méthode | Endpoint                                   | Rôle requis | Contenu                                                                                                                                                                                                                                                |
| ------- | ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET     | `/api/statistiques/dashboard/`             | ADMIN       | Vue globale plateforme : nb demandes/missions, missions par statut, taux d'acceptation, délai moyen de réponse, temps moyen de réalisation, répartition géographique des demandes, catégories les plus recherchées, évolution mensuelle de l'activité. |
| GET     | `/api/statistiques/dashboard/client/`      | CLIENT      | Ses demandes par statut, ses missions en cours/terminées, propositions en attente de sa décision, ses 5 dernières demandes.                                                                                                                            |
| GET     | `/api/statistiques/dashboard/prestataire/` | PRESTATAIRE | Ses missions en cours/terminées, sa note moyenne, ses avis reçus, ses propositions en attente, son taux d'acceptation, son revenu total estimé, ses opportunités disponibles (demandes ouvertes sur ses services).                                     |

---

## Intelligence artificielle

| Méthode | Endpoint                         | Rôle requis | Description                                                                                                                                                      |
| ------- | -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST    | `/api/ia/ameliorer-description/` | Authentifié | Body : `{"texte", "contexte": "annonce"\|"service"}`. Reformule le texte via un modèle de langage (OpenRouter). Retourne `{"texte_original", "texte_ameliore"}`. |

---

## Moteur de recommandation

Le score de chaque prestataire pour une demande est calculé ainsi :

```
score_global = 0.30 × proximité
             + 0.25 × note
             + 0.20 × disponibilité
             + 0.15 × expérience
             + 0.10 × nombre de missions terminées
```

Chaque critère est normalisé sur une échelle de 0 à 100 avant pondération :

- **Proximité** : distance Haversine (km) entre client et prestataire, décroissante jusqu'à 50 km (0 au-delà).
- **Note** : moyenne des avis reçus, ramenée sur 100 (50 si aucun avis).
- **Disponibilité** : 100 si `disponible=True`, sinon 0.
- **Expérience** : `annee_experience` plafonnée à 10 ans.
- **Missions** : nombre de missions terminées, plafonné à 20.

Le résultat est persisté dans le modèle `Recommandation` (avec chaque sous-score et une justification textuelle), recalculé à chaque appel de `/api/demandes/{id}/recommandations/`.

---

## Rôles et permissions

Trois rôles : `CLIENT`, `PRESTATAIRE`, `ADMIN`.

Règles générales appliquées sur tous les endpoints métier :

- La **lecture** est filtrée par rôle : chacun ne voit que ce qui le concerne (sauf catalogue, public en lecture, et ADMIN qui voit tout).
- La **création** est réservée au rôle cohérent (un client crée des demandes, un prestataire crée des propositions).
- La **modification/suppression** est réservée au propriétaire de la ressource, ou à l'ADMIN.

---

## Documentation interactive (Swagger)

Si `drf-spectacular` est installé (voir configuration dans `settings.py`) :

- Schéma OpenAPI brut : `GET /api/schema/`
- Interface Swagger UI : `GET /api/docs/`

Permet de tester tous les endpoints directement depuis le navigateur (bouton "Authorize" pour coller un token JWT).

---

## Stack technique

- **Backend** : Django 6.1.1, Django REST Framework, djangorestframework-simplejwt
- **Base de données** : MySQL
- **IA** : OpenRouter (modèle via le Free Models Router)
- **Frontend** (séparé) : React + Vite
