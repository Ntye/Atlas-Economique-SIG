/**
 * Server Mock - Serveur utilisant les données JSON locales
 *
 * Ce serveur utilise les fichiers GeoJSON locaux au lieu de la base de données PostgreSQL.
 * Idéal pour le développement et les tests sans dépendance à une BDD.
 *
 * Pour lancer : node server-mock.js
 * Puis ouvrir : http://localhost:3000
 *
 * === LISTE DES ENDPOINTS DISPONIBLES ===
 *
 * CARTE (Map Interface)
 * - GET /api/regions                     - Toutes les régions (GeoJSON)
 * - GET /api/departements                - Tous les départements (GeoJSON)
 * - GET /api/departements?region=Centre  - Départements d'une région
 *
 * FILTRES (Sidebar/Filters Panel)
 * - GET /api/filters                     - Options de filtrage
 *
 * KPIs (Dashboard)
 * - GET /api/kpis                        - Indicateurs globaux
 * - GET /api/kpis?region=Centre          - KPIs par région
 * - GET /api/kpis?secteur=agriculture    - KPIs par secteur
 *
 * GRAPHIQUES (Charts Section)
 * - GET /api/charts/top10/cacao          - Top 10 producteurs
 * - GET /api/charts/byregion/agriculture - Production par région
 * - GET /api/charts/distribution         - Distribution des produits
 * - GET /api/charts/historical/all       - Données historiques
 *
 * DÉTAILS (Info Panel/Modal)
 * - GET /api/regions/:nom                - Détails d'une région
 * - GET /api/departements/:nom           - Détails d'un département
 *
 * LÉGENDE (Legend Component)
 * - GET /api/legend/:theme               - Légende pour un thème
 *
 * RECHERCHE (Search Interface)
 * - GET /api/search?q=douala             - Recherche de lieux
 *
 * HEADER/FOOTER
 * - GET /api/header                      - Données du header
 * - GET /api/footer                      - Données du footer
 * - GET /api/messages                    - Messages d'état
 * - GET /api/health                      - État du serveur
 *
 * COMPARAISON (Comparison Interface)
 * - POST /api/compare                    - Comparer des zones
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/src', express.static('src'));

// Import des routes API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Route racine - redirige vers index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /api/regions',
      'GET /api/departements',
      'GET /api/filters',
      'GET /api/kpis',
      'GET /api/charts/top10/:produit',
      'GET /api/charts/byregion/:secteur',
      'GET /api/charts/distribution',
      'GET /api/charts/historical/:secteur',
      'GET /api/regions/:nom',
      'GET /api/departements/:nom',
      'GET /api/legend/:theme',
      'GET /api/search?q=',
      'GET /api/header',
      'GET /api/footer',
      'GET /api/messages',
      'GET /api/health',
      'POST /api/compare'
    ]
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                   ATLAS ÉCONOMIQUE DU CAMEROUN                ║');
  console.log('║                      Serveur Mock (JSON)                      ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  Serveur démarré sur : http://localhost:${port}                   ║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  ENDPOINTS DISPONIBLES:                                       ║');
  console.log('║                                                               ║');
  console.log('║  CARTE                                                        ║');
  console.log(`║    GET  http://localhost:${port}/api/regions                      ║`);
  console.log(`║    GET  http://localhost:${port}/api/departements                 ║`);
  console.log('║                                                               ║');
  console.log('║  FILTRES                                                      ║');
  console.log(`║    GET  http://localhost:${port}/api/filters                      ║`);
  console.log('║                                                               ║');
  console.log('║  KPIs                                                         ║');
  console.log(`║    GET  http://localhost:${port}/api/kpis                         ║`);
  console.log('║                                                               ║');
  console.log('║  GRAPHIQUES                                                   ║');
  console.log(`║    GET  http://localhost:${port}/api/charts/top10/cacao           ║`);
  console.log(`║    GET  http://localhost:${port}/api/charts/byregion/agriculture  ║`);
  console.log(`║    GET  http://localhost:${port}/api/charts/distribution          ║`);
  console.log(`║    GET  http://localhost:${port}/api/charts/historical/all        ║`);
  console.log('║                                                               ║');
  console.log('║  DÉTAILS                                                      ║');
  console.log(`║    GET  http://localhost:${port}/api/regions/Centre               ║`);
  console.log(`║    GET  http://localhost:${port}/api/departements/Mfoundi         ║`);
  console.log('║                                                               ║');
  console.log('║  AUTRES                                                       ║');
  console.log(`║    GET  http://localhost:${port}/api/legend/cacao                 ║`);
  console.log(`║    GET  http://localhost:${port}/api/search?q=douala              ║`);
  console.log(`║    GET  http://localhost:${port}/api/header                       ║`);
  console.log(`║    GET  http://localhost:${port}/api/footer                       ║`);
  console.log(`║    GET  http://localhost:${port}/api/health                       ║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
});
