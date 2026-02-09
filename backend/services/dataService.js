const pool = require('../db');
const {
  produitsSecteurs,
  couleursSecteurs,
  echellesCouleur,
  kpiData, // Keep for now as some KPIs are aggregated mock data
  historiqueAnnuel, // Keep for now, consider making dynamic later
  headerData,
  footerData,
  messagesEtats
} = require('./mockData'); // Still need mockData for products, colors, etc.

// =================================================================
// 1. MAIN MAP INTERFACE - Données cartographiques
// =================================================================

/**
 * Récupère toutes les régions avec leurs données de production
 * @returns {Promise<object>} GeoJSON FeatureCollection of regions with production data.
 */
async function getRegions() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT adm1_name1 AS nom, adm1_name AS nom_en, adm1_pcode AS code, area_sqkm AS superficie, center_lat, center_lon, geometry, production_details FROM regions');
    
    const regions = res.rows.map(row => ({
      type: "Feature",
      properties: {
        nom: row.nom,
        nom_en: row.nom_en,
        code: row.code,
        type_admin: 'region',
        production: row.production_details,
        centre_lat: row.center_lat,
        centre_lon: row.center_lon,
        superficie: row.superficie
      },
      geometry: row.geometry
    }));

    return {
      type: "FeatureCollection",
      features: regions
    };
  } finally {
    client.release();
  }
}

/**
 * Récupère tous les départements (filtrable par région) avec leurs données de production
 * @param {string} regionFilter - Optional filter by region name (adm1_name1).
 * @returns {Promise<object>} GeoJSON FeatureCollection of departments with production data.
 */
async function getDepartements(regionFilter = null) {
  const client = await pool.connect();
  try {
    let query = 'SELECT adm2_name1 AS nom, adm1_name1 AS region_parente, adm2_pcode AS code, area_sqkm AS superficie, center_lat, center_lon, geometry, population FROM departements';
    const params = [];

    if (regionFilter) {
      query += ' WHERE adm1_name1 = $1';
      params.push(regionFilter);
    }

    const res = await client.query(query, params);

    const departements = await Promise.all(res.rows.map(async row => {
      const regionProd = await getRegionProductionDetails(row.region_parente);
      const production = await generateDeptProduction(row.nom, row.region_parente, regionProd);
      return {
        type: "Feature",
        properties: {
          nom: row.nom,
          region_parente: row.region_parente,
          code: row.code,
          type_admin: 'departement',
          production: production,
          population: row.population,
          centre_lat: row.center_lat,
          centre_lon: row.center_lon,
          superficie: row.superficie
        },
        geometry: row.geometry
      };
    }));

    return {
      type: "FeatureCollection",
      features: departements
    };
  } finally {
    client.release();
  }
}

// =================================================================
// 2. SIDEBAR / FILTERS PANEL - Données de filtrage
// =================================================================

/**
 * Récupère toutes les options de filtrage
 */
async function getFilterOptions() {
  const client = await pool.connect();
  try {
    const regionsRes = await client.query('SELECT DISTINCT adm1_name1 FROM regions ORDER BY adm1_name1');
    const regions = regionsRes.rows.map(row => ({ id: row.adm1_name1, label: row.adm1_name1 }));

    const departementsRes = await client.query('SELECT adm2_name1, adm1_name1 FROM departements ORDER BY adm1_name1, adm2_name1');
    const departementsByRegion = {};
    departementsRes.rows.forEach(row => {
      if (!departementsByRegion[row.adm1_name1]) {
        departementsByRegion[row.adm1_name1] = [];
      }
      departementsByRegion[row.adm1_name1].push(row.adm2_name1);
    });

    return {
      secteurs: [
        { id: 'agriculture', label: 'Agriculture', icone: '🌾' },
        { id: 'elevage', label: 'Élevage', icone: '🐄' },
        { id: 'peche', label: 'Pêche', icone: '🦈' }
      ],
      couleursSecteurs: couleursSecteurs,
      regions: regions,
      departementsByRegion: departementsByRegion,
      produits: produitsSecteurs,
      themes: headerData.themes
    };
  } finally {
    client.release();
  }
}

/**
 * Récupère les produits filtrés par secteur
 */
async function getProductsBySector(sectorId) {
  if (sectorId === 'all') {
    return produitsSecteurs; // Return all products grouped by sector
  }
  return { [sectorId]: produitsSecteurs[sectorId] || [] };
}


// =================================================================
// 3. KPI DASHBOARD - Indicateurs clés
// =================================================================

/**
 * Récupère les KPIs globaux ou filtrés
 */
async function getKPIs(filters = {}) {
  const client = await pool.connect();
  try {
    const { secteur, region, produit } = filters;

    let query = 'SELECT adm1_name1, production_details FROM regions';
    const params = [];

    if (region) {
      query += ' WHERE adm1_name1 = $1';
      params.push(region);
    }

    const res = await client.query(query, params);
    const regionsData = res.rows; // [{ adm1_name1: 'RegionName', production_details: {...} }]

    let agricultureTotal = 0;
    let elevageTotal = 0;
    let pecheTotal = 0;
    let valeurTotal = 0;
    let regionsActives = new Set();
    let departementsActifs = 0;

    // Fetch department count
    let deptCountQuery = 'SELECT COUNT(*) FROM departements';
    const deptCountParams = [];
    if (region) {
      deptCountQuery += ' WHERE adm1_name1 = $1';
      deptCountParams.push(region);
    }
    const deptCountRes = await client.query(deptCountQuery, deptCountParams);
    departementsActifs = parseInt(deptCountRes.rows[0].count, 10);


    regionsData.forEach(row => {
      const prod = row.production_details;
      if (!prod) return;

      regionsActives.add(row.adm1_name1);


      // Agriculture
      ['cacao', 'cafe', 'coton', 'manioc', 'mais', 'riz', 'banane', 'tomate',
       'arachide', 'pomme_de_terre', 'huile_palme', 'hevea', 'the', 'oignon',
       'mil', 'sorgho'].forEach(p => {
        if (prod[p]) agricultureTotal += prod[p];
      });

      // Élevage
      ['bovins', 'porc', 'ovins', 'caprins', 'volaille'].forEach(p => {
        if (prod[p]) elevageTotal += prod[p];
      });

      // Pêche
      ['peche', 'crevette', 'poisson_eau_douce'].forEach(p => {
        if (prod[p]) pecheTotal += prod[p];
      });

      // Valeur économique
      if (prod.valeur_economique) valeurTotal += prod.valeur_economique;
    });


    return {
      agriculture: {
        label: 'Production Agricole',
        valeur: agricultureTotal,
        unite: 'tonnes',
        icone: '🌾',
        evolution: kpiData.agriculture.evolution
      },
      elevage: {
        label: 'Cheptel Total',
        valeur: elevageTotal,
        unite: 'têtes',
        icone: '🐄',
        evolution: kpiData.elevage.evolution
      },
      peche: {
        label: 'Production Halieutique',
        valeur: pecheTotal,
        unite: 'tonnes',
        icone: '🐟',
        evolution: kpiData.peche.evolution
      },
      valeur_economique: {
        label: 'Valeur Économique',
        valeur: valeurTotal,
        unite: 'FCFA',
        icone: '💰',
        evolution: kpiData.valeur_economique.evolution
      },
      regions_actives: {
        label: 'Régions Actives',
        valeur: regionsActives.size,
        icone: '📍'
      },
      departements_actifs: {
        label: 'Départements',
        valeur: departementsActifs,
        icone: '🏛️'
      },
      annee: 2024
    };
  } finally {
    client.release();
  }
}

// =================================================================
// 4. CHARTS SECTION - Données pour graphiques
// =================================================================

/**
 * Top 10 producteurs par produit
 */
async function getTop10Producers(produit = 'cacao') {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT adm1_name1 AS nom, production_details FROM regions');
    const producers = [];

    res.rows.forEach(row => {
      const prod = row.production_details;
      if (prod[produit] && prod[produit] > 0) {
        producers.push({
          nom: row.nom,
          valeur: prod[produit],
          type: 'region'
        });
      }
    });

    // Trier par valeur décroissante
    producers.sort((a, b) => b.valeur - a.valeur);

    return producers.slice(0, 10);
  } finally {
    client.release();
  }
}

/**
 * Production par région (pour pie chart)
 */
async function getProductionByRegion(secteur = 'agriculture') {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT adm1_name1 AS nom, production_details FROM regions');
    const data = [];
    const produits = produitsSecteurs[secteur] || produitsSecteurs.agriculture;

    res.rows.forEach(row => {
      const prod = row.production_details;
      let total = 0;
      produits.forEach(p => {
        if (prod[p.id]) total += prod[p.id];
      });

      if (total > 0) {
        data.push({
          nom: row.nom,
          valeur: total,
          pourcentage: 0 // Calculé après
        });
      }
    });

    // Calculer les pourcentages
    const grandTotal = data.reduce((sum, d) => sum + d.valeur, 0);
    data.forEach(d => {
      d.pourcentage = Math.round((d.valeur / grandTotal) * 100 * 10) / 10;
    });

    return data.sort((a, b) => b.valeur - a.valeur);
  } finally {
    client.release();
  }
}

/**
 * Distribution des produits
 */
async function getProductDistribution(region = null) {
  const client = await pool.connect();
  try {
    let query = 'SELECT production_details FROM regions';
    const params = [];
    if (region) {
      query += ' WHERE adm1_name1 = $1';
      params.push(region);
    }
    const res = await client.query(query, params);
    const distribution = {};

    res.rows.forEach(row => {
      const prod = row.production_details;
      if (!prod) return;

      Object.entries(prod).forEach(([produit, valeur]) => {
        if (produit === 'secteur_principal' || produit === 'valeur_economique') return;
        if (typeof valeur !== 'number') return;

        if (!distribution[produit]) {
          distribution[produit] = 0;
        }
        distribution[produit] += valeur;
      });
    });

    // Convertir en tableau et trier
    return Object.entries(distribution)
      .map(([produit, valeur]) => {
        const produitInfo = findProductInfo(produit);
        return {
          id: produit,
          nom: produitInfo?.nom || produit,
          valeur: valeur,
          icone: produitInfo?.icone || '📦',
          couleur: produitInfo?.couleur || '#999999'
        };
      })
      .sort((a, b) => b.valeur - a.valeur);
  } finally {
    client.release();
  }
}

/**
 * Données temporelles pour graphiques de tendance
 */
async function getHistoricalData(secteur = 'all') {
  if (secteur === 'all') {
    return historiqueAnnuel;
  }

  return {
    annees: historiqueAnnuel.annees,
    valeurs: historiqueAnnuel[secteur] || []
  };
}

// =================================================================
// 5. INFO PANEL / DETAILS MODAL
// =================================================================

/**
 * Détails d'une région
 */
async function getRegionDetails(nomRegion) {
  const client = await pool.connect();
  try {
    const regionRes = await client.query('SELECT adm1_name1 AS nom, adm1_name AS nom_en, adm1_pcode AS code, area_sqkm AS superficie, center_lat, center_lon, production_details FROM regions WHERE adm1_name1 = $1', [nomRegion]);
    if (regionRes.rows.length === 0) {
      return { error: 'Région non trouvée' };
    }
    const regionData = regionRes.rows[0];

    const departementsRes = await client.query('SELECT adm2_name1 AS nom FROM departements WHERE adm1_name1 = $1 ORDER BY adm2_name1', [nomRegion]);
    const departements = departementsRes.rows.map(row => row.nom);

    const prod = regionData.production_details || {};

    // Répartition par secteur
    const agriculture = {};
    const elevage = {};
    const peche = {};

    Object.entries(prod).forEach(([produit, valeur]) => {
      if (produit === 'secteur_principal' || produit === 'valeur_economique') return;

      const info = findProductInfo(produit);
      if (!info) return;

      const entry = { valeur, icone: info.icone, unite: info.unite };

      if (produitsSecteurs.agriculture.find(p => p.id === produit)) {
        agriculture[info.nom] = entry;
      } else if (produitsSecteurs.elevage.find(p => p.id === produit)) {
        elevage[info.nom] = entry;
      } else if (produitsSecteurs.peche.find(p => p.id === produit)) {
        peche[info.nom] = entry;
      }
    });

    return {
      nom: regionData.nom,
      nom_en: regionData.nom_en,
      code: regionData.code,
      type: 'region',
      superficie: regionData.superficie,
      centre: {
        lat: regionData.center_lat,
        lon: regionData.center_lon
      },
      secteur_principal: prod.secteur_principal,
      valeur_economique: prod.valeur_economique,
      production: {
        agriculture,
        elevage,
        peche
      },
      departements: departements,
      annee: 2024
    };
  } finally {
    client.release();
  }
}

/**
 * Détails d'un département
 */
async function getDepartementDetails(nomDept) {
  const client = await pool.connect();
  try {
    const deptRes = await client.query('SELECT adm2_name1 AS nom, adm1_name1 AS region_parente, adm2_pcode AS code, area_sqkm AS superficie, center_lat, center_lon, population FROM departements WHERE adm2_name1 = $1', [nomDept]);
    if (deptRes.rows.length === 0) {
      return { error: 'Département non trouvé' };
    }
    const deptData = deptRes.rows[0];

    const nomRegion = deptData.region_parente;
    const regionProd = await getRegionProductionDetails(nomRegion);
    const production = await generateDeptProduction(nomDept, nomRegion, regionProd);

    return {
      nom: deptData.nom,
      region_parente: deptData.region_parente,
      code: deptData.code,
      type: 'departement',
      superficie: deptData.superficie,
      population: deptData.population,
      centre: {
        lat: deptData.center_lat,
        lon: deptData.center_lon
      },
      production: production,
      annee: 2024
    };
  } finally {
    client.release();
  }
}

// =================================================================
// 6. LEGEND COMPONENT
// =================================================================

/**
 * Récupère la légende pour un thème donné
 */
function getLegend(theme = 'tous') {
  if (theme === 'tous') {
    return {
      titre: 'Légende Administrative',
      items: [
        { couleur: '#2ecc71', label: 'Régions', opacite: 0.6 },
        { couleur: '#95a5a6', label: 'Départements', opacite: 0.6 }
      ]
    };
  }

  const echelle = echellesCouleur[theme] || echellesCouleur.default;
  const produitInfo = findProductInfo(theme);

  return {
    titre: produitInfo ? `Production: ${produitInfo.nom}` : 'Légende',
    unite: produitInfo?.unite || 'unités',
    items: echelle.map(e => ({
      couleur: e.couleur,
      label: e.label,
      min: e.min,
      max: e.max === Infinity ? null : e.max
    }))
  };
}

// =================================================================
// 7. SEARCH RESULTS INTERFACE
// =================================================================

/**
 * Recherche dans les régions et départements
 */
async function search(query) {
  if (!query || query.length < 2) {
    return { results: [], message: 'Entrez au moins 2 caractères' };
  }

  const results = [];
  const queryLower = query.toLowerCase();
  const client = await pool.connect();

  try {
    // Rechercher dans les régions
    const regionsRes = await client.query('SELECT adm1_name1 AS nom, adm1_pcode AS code, center_lat, center_lon FROM regions WHERE LOWER(adm1_name1) LIKE $1', [`%${queryLower}%`]);
    regionsRes.rows.forEach(row => {
      results.push({
        type: 'region',
        nom: row.nom,
        code: row.code,
        matchIndex: row.nom.toLowerCase().indexOf(queryLower),
        centre: {
          lat: row.center_lat,
          lon: row.center_lon
        }
      });
    });

    // Rechercher dans les départements
    const deptsRes = await client.query('SELECT adm2_name1 AS nom, adm1_name1 AS region_parente, adm2_pcode AS code, center_lat, center_lon FROM departements WHERE LOWER(adm2_name1) LIKE $1', [`%${queryLower}%`]);
    deptsRes.rows.forEach(row => {
      results.push({
        type: 'departement',
        nom: row.nom,
        region_parente: row.region_parente,
        code: row.code,
        matchIndex: row.nom.toLowerCase().indexOf(queryLower),
        centre: {
          lat: row.center_lat,
          lon: row.center_lon
        }
      });
    });

    // Trier par pertinence (match au début d'abord)
    results.sort((a, b) => a.matchIndex - b.matchIndex);

    return {
      results: results,
      count: results.length,
      message: results.length === 0 ? 'Aucun résultat trouvé' : null
    };
  } finally {
    client.release();
  }
}

// =================================================================
// 8. HEADER / NAVIGATION
// =================================================================

function getHeaderData() {
  return headerData;
}

// =================================================================
// 9. FOOTER
// =================================================================

function getFooterData() {
  return footerData;
}

// =================================================================
// 10. LOADING STATES
// =================================================================

function getMessages() {
  return messagesEtats;
}

// =================================================================
// 11. COMPARISON INTERFACE
// =================================================================

/**
 * Compare plusieurs départements ou régions
 */
async function compare(ids, type = 'departement') {
  if (!ids || ids.length < 2) {
    return { error: 'Sélectionnez au moins 2 éléments à comparer' };
  }

  const items = [];
  for (const id of ids) {
    if (type === 'region') {
      const details = await getRegionDetails(id);
      if (!details.error) items.push(details);
    } else {
      const details = await getDepartementDetails(id);
      if (!details.error) items.push(details);
    }
  }
  
  if (items.length < 2) {
    return { error: 'Pas assez d\'éléments trouvés pour la comparaison' };
  }

  // This part now uses the fetched production data
  const allProducts = new Set();
  items.forEach(item => {
    if (item.production) {
      if (type === 'region') { // For regions, production is already separated by sector
        Object.keys(item.production.agriculture || {}).forEach(p => allProducts.add(p));
        Object.keys(item.production.elevage || {}).forEach(p => allProducts.add(p));
        Object.keys(item.production.peche || {}).forEach(p => allProducts.add(p));
      } else { // For departments, production is a flat object
        Object.keys(item.production).forEach(p => allProducts.add(p));
      }
    }
  });

  return {
    type: type,
    items: items,
    produits: [...allProducts].filter(p => p !== 'valeur_economique'),
    annee: 2024
  };
}

// =================================================================
// UTILITAIRES
// =================================================================

/**
 * Helper function to get production_details for a region from the database
 */
async function getRegionProductionDetails(regionName) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT production_details FROM regions WHERE adm1_name1 = $1', [regionName]);
    return res.rows.length > 0 ? res.rows[0].production_details : {};
  } finally {
    client.release();
  }
}

/**
 * Helper function to get department count for a region from the database
 */
async function getDepartmentCountForRegion(regionName) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT COUNT(*) FROM departements WHERE adm1_name1 = $1', [regionName]);
    return parseInt(res.rows[0].count, 10);
  } finally {
    client.release();
  }
}

/**
 * Génère des données de production pour un département basées sur sa région
 */
async function generateDeptProduction(nomDept, nomRegion, regionProd) {
  const seed = hashString(nomDept);
  const random = seededRandom(seed);

  const production = {};

  // Fetch the number of departments in the given region from the database
  const nbDepts = await getDepartmentCountForRegion(nomRegion);

  if (nbDepts === 0) return production; // Avoid division by zero

  for (const [produit, valeur] of Object.entries(regionProd)) {
    if (produit === 'secteur_principal' || produit === 'valeur_economique') continue;

    if (typeof valeur === 'number' && valeur > 0) {
      // Variation de 50% à 150% de la moyenne
      const moyenne = valeur / nbDepts;
      const variation = 0.5 + random() * 1;
      production[produit] = Math.floor(moyenne * variation);
    }
  }

  // Ajouter la valeur économique estimée
  production.valeur_economique = Math.floor(
    (regionProd.valeur_economique || 1000000000) / nbDepts * (0.5 + random() * 1)
  );

  return production;
}


/**
 * Hash simple pour générer un seed à partir d'une chaîne
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Générateur de nombres aléatoires avec seed
 */
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

/**
 * Trouve les informations d'un produit
 */
function findProductInfo(productId) {
  for (const secteur of Object.values(produitsSecteurs)) {
    const found = secteur.find(p => p.id === productId);
    if (found) return found;
  }
  return null;
}

// =================================================================
// EXPORTS
// =================================================================

module.exports = {
  // Map
  getRegions,
  getDepartements,

  // Filters
  getFilterOptions,
  getProductsBySector,

  // KPIs
  getKPIs,

  // Charts
  getTop10Producers,
  getProductionByRegion,
  getProductDistribution,
  getHistoricalData,

  // Details
  getRegionDetails,
  getDepartementDetails,

  // Legend
  getLegend,

  // Search
  search,

  // Header/Footer
  getHeaderData,
  getFooterData,
  getMessages,

  // Comparison
  compare
};
