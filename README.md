# Atlas Économique du Cameroun

Système d'Information Géographique (SIG) pour la visualisation des productions agricoles, de l'élevage et de la pêche au Cameroun.

## Aperçu

Cette application web interactive permet de visualiser et d'analyser les données économiques des 10 régions et 58 départements du Cameroun à travers une carte interactive et des tableaux de bord.

## Fonctionnalités

### Carte Interactive
- Affichage des régions et départements du Cameroun
- Zoom et navigation
- Coloration dynamique selon les niveaux de production
- Popups informatifs au survol et au clic
- Légende dynamique

### Filtres et Recherche
- Filtrage par secteur (Agriculture, Élevage, Pêche)
- Filtrage par région et département
- Filtrage par type de produit
- Recherche de localités

### Tableaux de Bord
- Indicateurs clés (KPIs) avec évolution
- Graphique Top 10 des producteurs
- Répartition par région (camembert)

### Détails et Comparaison
- Modal de détails pour chaque zone
- Outil de comparaison multi-zones

## Structure du Projet

```
projet-sig-cameroun/
├── public/                    # Frontend
│   ├── index.html            # Page principale
│   ├── css/
│   │   └── styles.css        # Styles de l'application
│   └── js/
│       └── app.bundle.js     # Application JavaScript
├── src/                       # Code source modulaire
│   ├── components/           # Composants UI
│   │   ├── Header.js
│   │   ├── Sidebar.js
│   │   ├── Map.js
│   │   ├── KPIDashboard.js
│   │   ├── Charts.js
│   │   ├── Legend.js
│   │   ├── Modal.js
│   │   ├── Search.js
│   │   ├── Footer.js
│   │   ├── LoadingOverlay.js
│   │   └── ComparisonPanel.js
│   ├── services/
│   │   └── api.js            # Service API
│   ├── utils/
│   │   └── helpers.js        # Fonctions utilitaires
│   └── styles/
│       ├── variables.css     # Variables CSS
│       ├── main.css          # Styles principaux
│       └── components.css    # Styles des composants
├── services/                  # Backend services
│   ├── mockData.js           # Données simulées
│   └── dataService.js        # Traitement des données
├── routes/
│   └── api.js                # Routes API
├── cameroun_regions.json     # GeoJSON des régions
├── cameroun_departements.json # GeoJSON des départements
├── server.js                 # Serveur avec PostgreSQL
├── server-mock.js            # Serveur avec données JSON
└── package.json
```

## Installation

### Prérequis
- Node.js (v16 ou supérieur)
- npm

### Étapes

1. Cloner le projet
```bash
git clone <url-du-repo>
cd projet-sig-cameroun
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer le serveur
```bash
# Mode développement (données JSON locales)
npm run dev

# ou
node server-mock.js
```

4. Ouvrir l'application
```
http://localhost:3000
```

## API Endpoints

### Carte
| Endpoint | Description |
|----------|-------------|
| `GET /api/regions` | GeoJSON des régions avec production |
| `GET /api/departements` | GeoJSON des départements |
| `GET /api/departements?region=X` | Départements filtrés par région |

### Filtres
| Endpoint | Description |
|----------|-------------|
| `GET /api/filters` | Options de filtrage disponibles |

### Indicateurs
| Endpoint | Description |
|----------|-------------|
| `GET /api/kpis` | Indicateurs clés globaux |
| `GET /api/kpis?region=X` | KPIs filtrés par région |

### Graphiques
| Endpoint | Description |
|----------|-------------|
| `GET /api/charts/top10/:produit` | Top 10 producteurs |
| `GET /api/charts/byregion/:secteur` | Production par région |
| `GET /api/charts/distribution` | Distribution des produits |
| `GET /api/charts/historical/:secteur` | Données historiques |

### Détails
| Endpoint | Description |
|----------|-------------|
| `GET /api/regions/:nom` | Détails d'une région |
| `GET /api/departements/:nom` | Détails d'un département |

### Autres
| Endpoint | Description |
|----------|-------------|
| `GET /api/legend/:theme` | Légende pour un thème |
| `GET /api/search?q=X` | Recherche de localités |
| `GET /api/header` | Données du header |
| `GET /api/footer` | Données du footer |
| `POST /api/compare` | Comparer des zones |
| `GET /api/health` | État du serveur |

## Technologies

### Frontend
- HTML5 / CSS3
- JavaScript (ES6+)
- [Leaflet](https://leafletjs.com/) - Cartographie interactive
- [Chart.js](https://www.chartjs.org/) - Graphiques

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) + PostGIS (optionnel)

### Données
- GeoJSON pour les géométries
- Données de production simulées

## Thèmes Disponibles

| Thème | Description | Couleur |
|-------|-------------|---------|
| Vue Administrative | Affichage par défaut | Vert/Gris |
| Cacao | Production de cacao | Marron |
| Café | Production de café | Brun |
| Coton | Production de coton | Bleu |
| Bovins | Élevage bovin | Orange |
| Pêche | Production halieutique | Bleu clair |

## Données de Production

### Agriculture
Cacao, Café, Coton, Manioc, Maïs, Riz, Banane, Tomate, Arachide, Pomme de Terre, Huile de Palme, Hévéa, Thé, Oignon, Mil, Sorgho

### Élevage
Bovins, Porcins, Ovins, Caprins, Volaille

### Pêche
Pêche maritime, Crevettes, Poisson d'eau douce

## Scripts npm

```bash
npm start       # Serveur avec PostgreSQL
npm run dev     # Serveur avec données JSON (développement)
npm run start:mock  # Alias pour dev
```

## Auteurs

Projet 5GI - École Nationale Supérieure Polytechnique Yaoundé

## Sources de Données

- [MINADER](https://www.minader.cm) - Ministère de l'Agriculture
- [HDX](https://data.humdata.org) - Humanitarian Data Exchange

## Licence

ISC
