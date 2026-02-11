# Atlas Économique du Cameroun (CMR-Atlas)

Ce projet est une application SIG (Système d'Information Géographique) interactive permettant de visualiser les données de production (Agriculture, Élevage, Pêche) par région et département au Cameroun.



## 🚀 Architecture

- **Frontend** : React 18 (Vite), TypeScript, Leaflet (Cartographie), Chart.js.

- **Backend** : Node.js (Express), PostgreSQL (Base de données), Swagger (Documentation API).


## Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (Local ou en ligne comme Supabase/Neon)


## Installation Rapide

1. **Cloner le projet** :

```bash
git clone https://github.com/Ntye/Atlas-Economique-SIG.git
cd projet-sig-cameroun
```

2. **Configuration de la base de données** :

- Créez une base de données PostgreSQL (ex: atlas_db).
- Allez dans le dossier backend et créez un fichier .env (voir section Backend pour les détails).

---

## Lancer le Backend :
API REST fournissant les données géographiques et statistiques du Cameroun.

### Configuration (.env)

Créez un fichier `.env` à la racine du dossier `backend` :


1. **Option A : Base de données LOCALE**

```env
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/atlas_db
DB_SSL=false
PORT=3000
```

2. **Option B : Base de données EN LIGNE** (Supabase, Neon, etc.)

```env
DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.aws.neon.tech/atlas_db?sslmode=require
DB_SSL=true
PORT=3000
```

### Lancement

1. Installer les dépendances :
```bash
npm install
```


2. Initialiser les données (Important lors de la première installation) :

    Ce script crée les tables et importe les fichiers JSON du dossier data/ vers votre base PostgreSQL.

```bash
node db/upload_data.js
```


3. Démarrer le serveur :

```bash
npm start
```

### Documentation API
Une fois lancé, accédez à la documentation interactive Swagger sur :

http://localhost:3000/api-docs


### Structure des données
Les données sources se trouvent dans **backend/data/** :

- **cameroun_regions.json** & **cameroun_departements.json** (GeoJSON)
- **production.json** (Statistiques économiques)
- **products.json** (Métadonnées des produits)

---

## Lancer le Frontend :
``` bash
cd atlas-react-vite
npm install
npm run dev
```

L'application sera disponible sur http://localhost:5173.




Interface utilisateur pour la visualisation spatiale des données économiques du Cameroun.



### Lancement en développement

1. **Configuration** :

- Assurez-vous que le backend tourne sur `http://localhost:3000`.
- Si vous changez l'URL de l'API, créez un fichier `.env` :

```env
VITE_API_BASE_URL=http://localhost:3000
```

2. **Installer et lancer** :

```bash
npm install

npm run dev
```

3. **Fonctionnalités**

- **Carte Interactive** : Navigation entre les régions et zoom automatique sur les départements.
- **Tableau de Bord KPI** : Indicateurs dynamiques mis à jour selon les filtres.
- **Système de Filtres** : Filtrage par secteur (Agri, Élevage, Pêche) ou par zone.
- **Module de Comparaison** : Comparez jusqu'à 4 zones (données tabulaires et export JSON).
- **Statistiques Détaillées** : Graphiques Barres (Top 10) et Beignets (Répartition).
- **Export JSON** : Téléchargement des statistiques de la zone sélectionnée.



### Scripts disponibles

- **npm run dev** : Lance le serveur de dev.
- **npm run build** : Compile l'application pour la production (dossier dist).

---

## License

[MIT](https://choosealicense.com/licenses/mit/)