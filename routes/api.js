/**
 * API Routes - Tous les endpoints pour les interfaces frontend
 *
 * Liste des endpoints disponibles :
 *
 * === MAP ===
 * GET /api/regions                     - GeoJSON des régions avec production
 * GET /api/departements                - GeoJSON des départements
 * GET /api/departements?region=X       - Départements filtrés par région
 *
 * === FILTERS ===
 * GET /api/filters                     - Options de filtrage (secteurs, régions, produits)
 *
 * === KPIs ===
 * GET /api/kpis                        - Indicateurs clés globaux
 * GET /api/kpis?region=X               - KPIs filtrés par région
 * GET /api/kpis?secteur=X              - KPIs filtrés par secteur
 *
 * === CHARTS ===
 * GET /api/charts/top10/:produit       - Top 10 producteurs pour un produit
 * GET /api/charts/byregion/:secteur    - Production par région (pie chart)
 * GET /api/charts/distribution         - Distribution des produits
 * GET /api/charts/historical/:secteur  - Données historiques
 *
 * === DETAILS ===
 * GET /api/regions/:nom                - Détails d'une région
 * GET /api/departements/:nom           - Détails d'un département
 *
 * === LEGEND ===
 * GET /api/legend/:theme               - Légende pour un thème
 *
 * === SEARCH ===
 * GET /api/search?q=X                  - Recherche de lieux
 *
 * === HEADER/FOOTER ===
 * GET /api/header                      - Données du header
 * GET /api/footer                      - Données du footer
 * GET /api/messages                    - Messages d'état et erreurs
 *
 * === COMPARISON ===
 * POST /api/compare                    - Comparer plusieurs zones
 */

const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// =================================================================
// 1. MAIN MAP INTERFACE
// =================================================================

/**
 * GET /api/regions
 * Récupère toutes les régions avec leurs données de production
 */
router.get('/regions', (req, res) => {
  try {
    const data = dataService.getRegions();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/regions:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * GET /api/departements
 * GET /api/departements?region=Centre
 * Récupère les départements (filtrable par région)
 */
router.get('/departements', (req, res) => {
  try {
    const { region } = req.query;
    const data = dataService.getDepartements(region || null);
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/departements:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 2. SIDEBAR / FILTERS PANEL
// =================================================================

/**
 * GET /api/filters
 * Récupère toutes les options de filtrage
 */
router.get('/filters', (req, res) => {
  try {
    const data = dataService.getFilterOptions();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/filters:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 3. KPI DASHBOARD
// =================================================================

/**
 * GET /api/kpis
 * GET /api/kpis?region=Centre
 * GET /api/kpis?secteur=agriculture
 * GET /api/kpis?produit=cacao
 */
router.get('/kpis', (req, res) => {
  try {
    const { secteur, region, produit } = req.query;
    const data = dataService.getKPIs({ secteur, region, produit });
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/kpis:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 4. CHARTS SECTION
// =================================================================

/**
 * GET /api/charts/top10/cacao
 * Top 10 producteurs pour un produit donné
 */
router.get('/charts/top10/:produit', (req, res) => {
  try {
    const { produit } = req.params;
    const data = dataService.getTop10Producers(produit);
    res.json({
      produit: produit,
      data: data,
      chartType: 'bar'
    });
  } catch (error) {
    console.error('Erreur /api/charts/top10:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * GET /api/charts/byregion/agriculture
 * Production par région pour un secteur (pie chart)
 */
router.get('/charts/byregion/:secteur', (req, res) => {
  try {
    const { secteur } = req.params;
    const data = dataService.getProductionByRegion(secteur);
    res.json({
      secteur: secteur,
      data: data,
      chartType: 'pie'
    });
  } catch (error) {
    console.error('Erreur /api/charts/byregion:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * GET /api/charts/distribution
 * GET /api/charts/distribution?region=Centre
 * Distribution des produits
 */
router.get('/charts/distribution', (req, res) => {
  try {
    const { region } = req.query;
    const data = dataService.getProductDistribution(region || null);
    res.json({
      region: region || 'all',
      data: data,
      chartType: 'bar'
    });
  } catch (error) {
    console.error('Erreur /api/charts/distribution:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * GET /api/charts/historical/agriculture
 * Données historiques pour graphiques de tendance
 */
router.get('/charts/historical/:secteur', (req, res) => {
  try {
    const { secteur } = req.params;
    const data = dataService.getHistoricalData(secteur);
    res.json({
      secteur: secteur,
      data: data,
      chartType: 'line'
    });
  } catch (error) {
    console.error('Erreur /api/charts/historical:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 5. INFO PANEL / DETAILS MODAL
// =================================================================

/**
 * GET /api/regions/:nom
 * Détails complets d'une région
 */
router.get('/regions/:nom', (req, res) => {
  try {
    const { nom } = req.params;
    const data = dataService.getRegionDetails(decodeURIComponent(nom));

    if (data.error) {
      return res.status(404).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur /api/regions/:nom:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * GET /api/departements/:nom
 * Détails complets d'un département
 */
router.get('/departements/:nom', (req, res) => {
  try {
    const { nom } = req.params;
    const data = dataService.getDepartementDetails(decodeURIComponent(nom));

    if (data.error) {
      return res.status(404).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur /api/departements/:nom:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 6. LEGEND COMPONENT
// =================================================================

/**
 * GET /api/legend/cacao
 * Récupère la légende pour un thème donné
 */
router.get('/legend/:theme', (req, res) => {
  try {
    const { theme } = req.params;
    const data = dataService.getLegend(theme);
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/legend:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 7. SEARCH RESULTS INTERFACE
// =================================================================

/**
 * GET /api/search?q=douala
 * Recherche dans les régions et départements
 */
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    const data = dataService.search(q);
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/search:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 8. HEADER / NAVIGATION
// =================================================================

/**
 * GET /api/header
 * Données du header (titre, thèmes, langues)
 */
router.get('/header', (req, res) => {
  try {
    const data = dataService.getHeaderData();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/header:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 9. FOOTER
// =================================================================

/**
 * GET /api/footer
 * Données du footer (crédits, sources, contact)
 */
router.get('/footer', (req, res) => {
  try {
    const data = dataService.getFooterData();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/footer:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 10. LOADING STATES
// =================================================================

/**
 * GET /api/messages
 * Messages d'état, erreurs et succès
 */
router.get('/messages', (req, res) => {
  try {
    const data = dataService.getMessages();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/messages:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * GET /api/health
 * Vérification de l'état du serveur
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// =================================================================
// 12. COMPARISON INTERFACE
// =================================================================

/**
 * POST /api/compare
 * Body: { ids: ['Centre', 'Est'], type: 'region' }
 * Compare plusieurs régions ou départements
 */
router.post('/compare', express.json(), (req, res) => {
  try {
    const { ids, type } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: 'Paramètre invalide',
        message: 'Le paramètre "ids" doit être un tableau'
      });
    }

    const data = dataService.compare(ids, type || 'departement');

    if (data.error) {
      return res.status(400).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur /api/compare:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// EXPORT
// =================================================================

module.exports = router;
