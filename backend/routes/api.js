/**
 * @swagger
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           example: Centre
 *         nom_en:
 *           type: string
 *           example: Centre
 *         code:
 *           type: string
 *           example: CM002
 *         type_admin:
 *           type: string
 *           example: region
 *         production:
 *           type: object
 *           description: Production details for the region
 *         centre_lat:
 *           type: number
 *           format: float
 *         centre_lon:
 *           type: number
 *           format: float
 *         superficie:
 *           type: number
 *           format: float
 *         geometry:
 *           type: object
 *           description: GeoJSON geometry object
 *     Departement:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           example: Mfoundi
 *         region_parente:
 *           type: string
 *           example: Centre
 *         code:
 *           type: string
 *           example: CM002007
 *         type_admin:
 *           type: string
 *           example: departement
 *         production:
 *           type: object
 *           description: Production details for the department
 *         population:
 *           type: number
 *           example: 2800000
 *         centre_lat:
 *           type: number
 *           format: float
 *         centre_lon:
 *           type: number
 *           format: float
 *         superficie:
 *           type: number
 *           format: float
 *         geometry:
 *           type: object
 *           description: GeoJSON geometry object
 *     KPIItem:
 *       type: object
 *       properties:
 *         label: { type: string }
 *         valeur: { type: number }
 *         unite: { type: string }
 *         icone: { type: string }
 *         evolution: { type: number }
 *     KPIData:
 *       type: object
 *       properties:
 *         agriculture:
 *           $ref: '#/components/schemas/KPIItem'
 *         elevage:
 *           $ref: '#/components/schemas/KPIItem'
 *         peche:
 *           $ref: '#/components/schemas/KPIItem'
 *         valeur_economique:
 *           $ref: '#/components/schemas/KPIItem'
 *         regions_actives:
 *           $ref: '#/components/schemas/KPIItem'
 *         departements_actifs:
 *           $ref: '#/components/schemas/KPIItem'
 *         annee:
 *           type: number
 *           example: 2024
 *     ChartDataItem:
 *       type: object
 *       properties:
 *         nom: { type: string }
 *         valeur: { type: number }
 *         type: { type: string }
 *     ChartResponse:
 *       type: object
 *       properties:
 *         produit: { type: string }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChartDataItem'
 *         chartType: { type: string }
 *     HistoricalData:
 *       type: object
 *       properties:
 *         annees:
 *           type: array
 *           items: { type: number }
 *           example: [2019, 2020, 2021, 2022, 2023, 2024]
 *         valeurs:
 *           type: array
 *           items: { type: number }
 *           example: [3200000, 3100000, 3350000, 3420000, 3500000, 3580000]
 *     LocationDetails:
 *       type: object
 *       properties:
 *         nom: { type: string }
 *         nom_en: { type: string }
 *         code: { type: string }
 *         type: { type: string }
 *         superficie: { type: number }
 *         centre:
 *           type: object
 *           properties:
 *             lat: { type: number }
 *             lon: { type: number }
 *         secteur_principal: { type: string }
 *         valeur_economique: { type: number }
 *         production: { type: object }
 *         departements:
 *           type: array
 *           items: { type: string }
 *         annee: { type: number }
 *         error: { type: string }
 *     FilterOption:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         label: { type: string }
 *         icone: { type: string }
 *     FilterOptions:
 *       type: object
 *       properties:
 *         secteurs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FilterOption'
 *         regions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FilterOption'
 *         departementsByRegion: { type: object }
 *         produits: { type: object }
 *         themes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FilterOption'
 *     LegendItem:
 *       type: object
 *       properties:
 *         couleur: { type: string }
 *         label: { type: string }
 *         min: { type: number }
 *         max: { type: number }
 *     LegendData:
 *       type: object
 *       properties:
 *         titre: { type: string }
 *         unite: { type: string }
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LegendItem'
 *     SearchResult:
 *       type: object
 *       properties:
 *         type: { type: string, enum: [region, departement] }
 *         nom: { type: string }
 *         region_parente: { type: string }
 *         code: { type: string }
 *         matchIndex: { type: number }
 *         centre:
 *           type: object
 *           properties:
 *             lat: { type: number }
 *             lon: { type: number }
 *     SearchResponse:
 *       type: object
 *       properties:
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SearchResult'
 *         count: { type: number }
 *         message: { type: string, nullable: true }
 *     HeaderData:
 *       type: object
 *       properties:
 *         titre: { type: string }
 *         sousTitre: { type: string }
 *         version: { type: string }
 *         themes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               label: { type: string }
 *         langues:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               label: { type: string }
 *     FooterData:
 *       type: object
 *       properties:
 *         credits: { type: string }
 *         sources:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               url: { type: string }
 *         derniereMAJ: { type: string }
 *         contact:
 *           type: object
 *           properties:
 *             email: { type: string }
 *             github: { type: string }
 *     Messages:
 *       type: object
 *       properties:
 *         chargement: { type: object }
 *         erreurs: { type: object }
 *         succes: { type: object }
 *     ComparisonItem:
 *       type: object
 *       properties:
 *         nom: { type: string }
 *         type: { type: string }
 *         production: { type: object }
 *     ComparisonData:
 *       type: object
 *       properties:
 *         type: { type: string }
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ComparisonItem'
 *         produits:
 *           type: array
 *           items: { type: string }
 *         annee: { type: number }
 *     ProductsBySector:
 *       type: object
 *       additionalProperties:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             nom: { type: string }
 *             unite: { type: string }
 *             icone: { type: string }
 *             couleur: { type: string }
 *
 * tags:
 *   - name: Map
 *     description: Endpoints for geographical data (regions and departments)
 *   - name: Filters
 *     description: Endpoints for filtering options
 *   - name: KPIs
 *     description: Endpoints for Key Performance Indicators
 *   - name: Charts
 *     description: Endpoints for various chart data
 *   - name: Details
 *     description: Endpoints for detailed information about regions and departments
 *   - name: Legend
 *     description: Endpoints for map legend data
 *   - name: Search
 *     description: Endpoints for search functionality
 *   - name: HeaderFooter
 *     description: Endpoints for header and footer data
 *   - name: Utilities
 *     description: General utility endpoints
 */

const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// =================================================================
// 1. MAIN MAP INTERFACE
// =================================================================

/**
 * @swagger
 * /regions:
 *   get:
 *     summary: Retrieve a GeoJSON FeatureCollection of all regions with their production data
 *     tags: [Map]
 *     responses:
 *       200:
 *         description: A GeoJSON FeatureCollection containing all regions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: FeatureCollection
 *                 features:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Region'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/regions', async (req, res) => {
  try {
    const data = await dataService.getRegions();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/regions:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * @swagger
 * /departements:
 *   get:
 *     summary: Retrieve a GeoJSON FeatureCollection of all departments, optionally filtered by region, with their production data
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter departments by region name (e.g., Centre)
 *     responses:
 *       200:
 *         description: A GeoJSON FeatureCollection containing all departments, or filtered departments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: FeatureCollection
 *                 features:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Departement'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/departements', async (req, res) => {
  try {
    const { region } = req.query;
    const data = await dataService.getDepartements(region || null);
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
 * @swagger
 * /filters:
 *   get:
 *     summary: Retrieve filtering options (sectors, regions, products, themes)
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: An object containing various filter options.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterOptions'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/filters', async (req, res) => {
  try {
    const data = await dataService.getFilterOptions();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/filters:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * @swagger
 * /products-by-sector/{secteur}:
 *   get:
 *     summary: Retrieve products filtered by sector of activity
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: secteur
 *         schema:
 *           type: string
 *           enum: [agriculture, elevage, peche, all]
 *           example: agriculture
 *         required: true
 *         description: The sector ID (or 'all' to get all products grouped by sector)
 *     responses:
 *       200:
 *         description: An object containing products filtered by the specified sector.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsBySector'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/products-by-sector/:secteur', async (req, res) => {
  try {
    const { secteur } = req.params;
    const data = await dataService.getProductsBySector(secteur);
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/products-by-sector:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// =================================================================
// 3. KPI DASHBOARD

/**
 * @swagger
 * /kpis:
 *   get:
 *     summary: Retrieve global or filtered Key Performance Indicators (KPIs)
 *     tags: [KPIs]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter KPIs by region name (e.g., Centre)
 *       - in: query
 *         name: secteur
 *         schema:
 *           type: string
 *           enum: [agriculture, elevage, peche]
 *         description: Filter KPIs by sector (e.g., agriculture)
 *       - in: query
 *         name: produit
 *         schema:
 *           type: string
 *         description: Filter KPIs by product (e.g., cacao)
 *     responses:
 *       200:
 *         description: An object containing various KPIs.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KPIData'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/kpis', async (req, res) => {
  try {
    const { secteur, region, produit } = req.query;
    const data = await dataService.getKPIs({ secteur, region, produit });
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
 * @swagger
 * /charts/top10/{produit}:
 *   get:
 *     summary: Retrieve the top 10 producers for a given product
 *     tags: [Charts]
 *     parameters:
 *       - in: path
 *         name: produit
 *         schema:
 *           type: string
 *           example: cacao
 *         required: true
 *         description: The ID of the product (e.g., cacao, bovins)
 *     responses:
 *       200:
 *         description: An object containing the product, data for top 10 producers, and chart type.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/charts/top10/:produit', async (req, res) => {
  try {
    const { produit } = req.params;
    const data = await dataService.getTop10Producers(produit);
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
 * @swagger
 * /charts/byregion/{secteur}:
 *   get:
 *     summary: Retrieve production data by region for a given sector (for a pie chart)
 *     tags: [Charts]
 *     parameters:
 *       - in: path
 *         name: secteur
 *         schema:
 *           type: string
 *           enum: [agriculture, elevage, peche]
 *           example: agriculture
 *         required: true
 *         description: The ID of the sector (e.g., agriculture, elevage)
 *     responses:
 *       200:
 *         description: An object containing the sector, data for production by region, and chart type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secteur: { type: string, example: agriculture }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nom: { type: string }
 *                       valeur: { type: number }
 *                       pourcentage: { type: number }
 *                 chartType: { type: string, example: pie }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/charts/byregion/:secteur', async (req, res) => {
  try {
    const { secteur } = req.params;
    const data = await dataService.getProductionByRegion(secteur);
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
 * @swagger
 * /charts/distribution:
 *   get:
 *     summary: Retrieve the distribution of products, optionally filtered by region
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter product distribution by region name (e.g., Centre)
 *     responses:
 *       200:
 *         description: An object containing the region (or 'all'), data for product distribution, and chart type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 region: { type: string, example: all }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       nom: { type: string }
 *                       valeur: { type: number }
 *                       icone: { type: string }
 *                       couleur: { type: string }
 *                 chartType: { type: string, example: bar }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/charts/distribution', async (req, res) => {
  try {
    const { region } = req.query;
    const data = await dataService.getProductDistribution(region || null);
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
 * @swagger
 * /charts/historical/{secteur}:
 *   get:
 *     summary: Retrieve historical data for trend charts for a given sector
 *     tags: [Charts]
 *     parameters:
 *       - in: path
 *         name: secteur
 *         schema:
 *           type: string
 *           enum: [agriculture, elevage, peche, all]
 *           example: agriculture
 *         required: true
 *         description: The ID of the sector (or 'all' for aggregated historical data)
 *     responses:
 *       200:
 *         description: An object containing the sector, historical data (years and values), and chart type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secteur: { type: string, example: agriculture }
 *                 data:
 *                   $ref: '#/components/schemas/HistoricalData'
 *                 chartType: { type: string, example: line }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/charts/historical/:secteur', async (req, res) => {
  try {
    const { secteur } = req.params;
    const data = await dataService.getHistoricalData(secteur);
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
 * @swagger
 * /regions/{nom}:
 *   get:
 *     summary: Retrieve complete details for a specific region
 *     tags: [Details]
 *     parameters:
 *       - in: path
 *         name: nom
 *         schema:
 *           type: string
 *           example: Centre
 *         required: true
 *         description: The name of the region
 *     responses:
 *       200:
 *         description: An object containing detailed information about the region.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationDetails'
 *       404:
 *         description: Region not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Région non trouvée }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/regions/:nom', async (req, res) => {
  try {
    const { nom } = req.params;
    const data = await dataService.getRegionDetails(decodeURIComponent(nom));

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
 * @swagger
 * /departements/{nom}:
 *   get:
 *     summary: Retrieve complete details for a specific department
 *     tags: [Details]
 *     parameters:
 *       - in: path
 *         name: nom
 *         schema:
 *           type: string
 *           example: Mfoundi
 *         required: true
 *         description: The name of the department
 *     responses:
 *       200:
 *         description: An object containing detailed information about the department.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationDetails'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Département non trouvé }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/departements/:nom', async (req, res) => {
  try {
    const { nom } = req.params;
    const data = await dataService.getDepartementDetails(decodeURIComponent(nom));

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
 * @swagger
 * /legend/{theme}:
 *   get:
 *     summary: Retrieve legend data for a given theme
 *     tags: [Legend]
 *     parameters:
 *       - in: path
 *         name: theme
 *         schema:
 *           type: string
 *           example: cacao
 *         required: true
 *         description: The theme for which to retrieve legend data (e.g., cacao, bovins, tous)
 *     responses:
 *       200:
 *         description: An object containing the legend title, unit (if applicable), and items.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LegendData'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/legend/:theme', async (req, res) => {
  try {
    const { theme } = req.params;
    const data = await dataService.getLegend(theme);
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
 * @swagger
 * /search:
 *   get:
 *     summary: Search for regions and departments by name
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           example: douala
 *         required: true
 *         description: The search query (at least 2 characters)
 *     responses:
 *       200:
 *         description: An object containing search results, count, and optional message.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const data = await dataService.search(q);
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
 * @swagger
 * /header:
 *   get:
 *     summary: Retrieve data for the application header (title, themes, languages)
 *     tags: [HeaderFooter]
 *     responses:
 *       200:
 *         description: An object containing header data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderData'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/header', async (req, res) => {
  try {
    const data = await dataService.getHeaderData();
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
 * @swagger
 * /footer:
 *   get:
 *     summary: Retrieve data for the application footer (credits, sources, contact)
 *     tags: [HeaderFooter]
 *     responses:
 *       200:
 *         description: An object containing footer data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterData'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/footer', async (req, res) => {
  try {
    const data = await dataService.getFooterData();
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
 * @swagger
 * /messages:
 *   get:
 *     summary: Retrieve status messages, errors, and success messages
 *     tags: [Utilities]
 *     responses:
 *       200:
 *         description: An object containing various status messages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Messages'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.get('/messages', async (req, res) => {
  try {
    const data = await dataService.getMessages();
    res.json(data);
  } catch (error) {
    console.error('Erreur /api/messages:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check the health and status of the API server
 *     tags: [Utilities]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 timestamp: { type: string, format: date-time }
 *                 version: { type: string, example: 1.0.0 }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
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
 * @swagger
 * /compare:
 *   post:
 *     summary: Compare multiple regions or departments
 *     tags: [Details]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Centre", "Est"]
 *                 description: An array of region or department names to compare
 *               type:
 *                 type: string
 *                 enum: [region, departement]
 *                 example: region
 *                 description: The type of entities being compared
 *     responses:
 *       200:
 *         description: An object containing the comparison results.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComparisonData'
 *       400:
 *         description: Invalid parameters or not enough items for comparison
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Paramètre invalide }
 *                 message: { type: string, example: Le paramètre "ids" doit être un tableau }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: Erreur serveur }
 *                 message: { type: string, example: Something went wrong }
 */
router.post('/compare', express.json(), async (req, res) => {
  try {
    const { ids, type } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: 'Paramètre invalide',
        message: 'Le paramètre "ids" doit être un tableau'
      });
    }

    const data = await dataService.compare(ids, type || 'departement');

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