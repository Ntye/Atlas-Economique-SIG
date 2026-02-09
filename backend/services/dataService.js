const pool = require('../db');

// Note: We no longer import mockData.old.js.
// All data (Products, Colors, Settings) is now fetched from the DB.

// =================================================================
// 0. INTERNAL HELPERS (Data Fetching)
// =================================================================

/**
 * Fetch all products from DB and format them
 */
async function getAllProductsFromDB() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM products');
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * Fetch App Configuration (Header, Footer, KPI settings)
 */
async function getAppConfig() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT data FROM app_settings WHERE key = 'config'");
    if (res.rows.length > 0) {
      return res.rows[0].data;
    }
    return {}; // Fallback empty
  } finally {
    client.release();
  }
}

// =================================================================
// 1. MAIN MAP INTERFACE
// =================================================================

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

    // Optimization: Fetch all region production details once to avoid N+1 queries
    const allRegionsRes = await client.query('SELECT adm1_name1, production_details FROM regions');
    const regionProdMap = {};
    allRegionsRes.rows.forEach(r => {
      regionProdMap[r.adm1_name1] = r.production_details;
    });

    // Optimization: Fetch dept counts per region
    const deptCountRes = await client.query('SELECT adm1_name1, COUNT(*) as count FROM departements GROUP BY adm1_name1');
    const regionDeptCounts = {};
    deptCountRes.rows.forEach(r => {
      regionDeptCounts[r.adm1_name1] = parseInt(r.count, 10);
    });

    const departements = res.rows.map(row => {
      const regionProd = regionProdMap[row.region_parente] || {};
      const deptCount = regionDeptCounts[row.region_parente] || 1;
      const production = generateDeptProduction(row.nom, regionProd, deptCount);

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
    });

    return {
      type: "FeatureCollection",
      features: departements
    };
  } finally {
    client.release();
  }
}

// =================================================================
// 2. SIDEBAR / FILTERS PANEL
// =================================================================

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

    // Fetch Products and group by sector
    const allProducts = await getAllProductsFromDB();
    const produitsSecteurs = { agriculture: [], elevage: [], peche: [] };

    allProducts.forEach(p => {
      if (produitsSecteurs[p.secteur]) {
        produitsSecteurs[p.secteur].push(p);
      }
    });

    // Fetch Config for Themes
    const config = await getAppConfig();

    return {
      secteurs: [
        { id: 'agriculture', label: 'Agriculture', icone: '🌾' },
        { id: 'elevage', label: 'Élevage', icone: '🐄' },
        { id: 'peche', label: 'Pêche', icone: '🦈' }
      ],
      // Hardcoded sector colors as they are UI specific, or could be in DB
      couleursSecteurs: {
        agriculture: { couleur: '#4CAF50', label: 'Agriculture', icone: '🌾' },
        elevage: { couleur: '#FF9800', label: 'Élevage', icone: '🐄' },
        peche: { couleur: '#2196F3', label: 'Pêche', icone: '🐟' }
      },
      regions: regions,
      departementsByRegion: departementsByRegion,
      produits: produitsSecteurs,
      themes: config.header ? config.header.themes : []
    };
  } finally {
    client.release();
  }
}

async function getProductsBySector(sectorId) {
  const allProducts = await getAllProductsFromDB();
  const produitsSecteurs = { agriculture: [], elevage: [], peche: [] };

  allProducts.forEach(p => {
    if (produitsSecteurs[p.secteur]) {
      produitsSecteurs[p.secteur].push(p);
    }
  });

  if (sectorId === 'all') {
    return produitsSecteurs;
  }
  return { [sectorId]: produitsSecteurs[sectorId] || [] };
}


// =================================================================
// 3. KPI DASHBOARD
// =================================================================

async function getKPIs(filters = {}) {
  const client = await pool.connect();
  try {
    const { region } = filters;
    const config = await getAppConfig();
    const kpiEvolutions = config.kpi_evolutions || { peche: 0, elevage: 0, agriculture: 0, valeur_economique: 0 };

    let query = 'SELECT adm1_name1, production_details FROM regions';
    const params = [];
    if (region) {
      query += ' WHERE adm1_name1 = $1';
      params.push(region);
    }
    const res = await client.query(query, params);

    let agricultureTotal = 0;
    let elevageTotal = 0;
    let pecheTotal = 0;
    let valeurTotal = 0;
    let regionsActives = new Set();

    // Get product definitions to know which sector they belong to
    const products = await getAllProductsFromDB();

    res.rows.forEach(row => {
      const prod = row.production_details;
      if (!prod) return;
      regionsActives.add(row.adm1_name1);

      Object.entries(prod).forEach(([key, val]) => {
        if (key === 'valeur_economique') {
          valeurTotal += val;
          return;
        }
        const productDef = products.find(p => p.id === key);
        if (productDef) {
          if (productDef.secteur === 'agriculture') agricultureTotal += val;
          if (productDef.secteur === 'elevage') elevageTotal += val;
          if (productDef.secteur === 'peche') pecheTotal += val;
        }
      });
    });

    // Fetch department count
    let deptCountQuery = 'SELECT COUNT(*) FROM departements';
    const deptCountParams = [];
    if (region) {
      deptCountQuery += ' WHERE adm1_name1 = $1';
      deptCountParams.push(region);
    }
    const deptCountRes = await client.query(deptCountQuery, deptCountParams);
    const departementsActifs = parseInt(deptCountRes.rows[0].count, 10);

    return {
      agriculture: {
        label: 'Production Agricole',
        valeur: agricultureTotal,
        unite: 'tonnes',
        icone: '🌾',
        evolution: kpiEvolutions.agriculture
      },
      elevage: {
        label: 'Cheptel Total',
        valeur: elevageTotal,
        unite: 'têtes',
        icone: '🐄',
        evolution: kpiEvolutions.elevage
      },
      peche: {
        label: 'Production Halieutique',
        valeur: pecheTotal,
        unite: 'tonnes',
        icone: '🐟',
        evolution: kpiEvolutions.peche
      },
      valeur_economique: {
        label: 'Valeur Économique',
        valeur: valeurTotal,
        unite: 'FCFA',
        icone: '💰',
        evolution: kpiEvolutions.valeur_economique
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
// 4. CHARTS SECTION
// =================================================================

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

    return producers.sort((a, b) => b.valeur - a.valeur).slice(0, 10);
  } finally {
    client.release();
  }
}

async function getProductionByRegion(secteur = 'agriculture') {
  const client = await pool.connect();
  try {
    // Get products for this sector
    const allProducts = await getAllProductsFromDB();
    const sectorProducts = allProducts.filter(p => p.secteur === secteur).map(p => p.id);

    const res = await client.query('SELECT adm1_name1 AS nom, production_details FROM regions');
    const data = [];

    res.rows.forEach(row => {
      const prod = row.production_details;
      let total = 0;
      sectorProducts.forEach(pid => {
        if (prod[pid]) total += prod[pid];
      });

      if (total > 0) {
        data.push({ nom: row.nom, valeur: total, pourcentage: 0 });
      }
    });

    const grandTotal = data.reduce((sum, d) => sum + d.valeur, 0);
    data.forEach(d => {
      d.pourcentage = grandTotal ? Math.round((d.valeur / grandTotal) * 100 * 10) / 10 : 0;
    });

    return data.sort((a, b) => b.valeur - a.valeur);
  } finally {
    client.release();
  }
}

async function getProductDistribution(region = null) {
  const client = await pool.connect();
  try {
    const allProducts = await getAllProductsFromDB();
    const productMap = new Map(allProducts.map(p => [p.id, p]));

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

      Object.entries(prod).forEach(([produitId, valeur]) => {
        if (produitId === 'secteur_principal' || produitId === 'valeur_economique') return;
        if (typeof valeur !== 'number') return;

        if (!distribution[produitId]) distribution[produitId] = 0;
        distribution[produitId] += valeur;
      });
    });

    return Object.entries(distribution)
      .map(([produitId, valeur]) => {
        const info = productMap.get(produitId);
        return {
          id: produitId,
          nom: info?.nom || produitId,
          valeur: valeur,
          icone: info?.icone || '📦',
          couleur: info?.couleur || '#999999'
        };
      })
      .sort((a, b) => b.valeur - a.valeur);
  } finally {
    client.release();
  }
}

async function getHistoricalData(secteur = 'all') {
  // Currently mocked, but logically would come from a 'historical_data' table
  // Keeping mock array structure for now as no JSON file was provided for history
  const historiqueAnnuel = {
    annees: [2019, 2020, 2021, 2022, 2023, 2024],
    agriculture: [3200000, 3100000, 3350000, 3420000, 3500000, 3580000],
    elevage: [3600000, 3750000, 3800000, 3900000, 3980000, 4020000],
    peche: [620000, 590000, 580000, 560000, 570000, 560000]
  };

  if (secteur === 'all') return historiqueAnnuel;
  return {
    annees: historiqueAnnuel.annees,
    valeurs: historiqueAnnuel[secteur] || []
  };
}

// =================================================================
// 5. INFO PANEL / DETAILS MODAL
// =================================================================
async function getRegionDetails(nomRegion) {
  const client = await pool.connect();
  try {
    // 1. Retrieve Region Info
    const regionRes = await client.query(
      'SELECT adm1_name1 AS nom, adm1_name AS nom_en, adm1_pcode AS code, area_sqkm AS superficie, center_lat, center_lon, production_details FROM regions WHERE adm1_name1 = $1',
      [nomRegion]
    );

    if (regionRes.rows.length === 0) {
      return {error: 'Région non trouvée'};
    }
    const regionData = regionRes.rows[0];

    // 2. Retrieve Departments using the Region Code (adm1_pcode)
    // This is safer than using the name string
    let departementsRes = await client.query(
      'SELECT adm2_name1 AS nom FROM departements WHERE adm1_pcode = $1 ORDER BY adm2_name1',
      [regionData.code]
    );

    let departements = departementsRes.rows.map(row => row.nom);

    // Fallback: If code lookup failed (e.g. data inconsistency), try by name
    if (departements.length === 0) {
      const deptByNameRes = await client.query(
        'SELECT adm2_name1 AS nom FROM departements WHERE adm1_name1 = $1 ORDER BY adm2_name1',
        [nomRegion]
      );
      departements = deptByNameRes.rows.map(row => row.nom);
    }

    const prod = regionData.production_details || {};
    const allProducts = await getAllProductsFromDB(); // Ensure this helper exists in your file

    // 3. Construct Response
    const result = {
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
        agriculture: {},
        elevage: {},
        peche: {}
      },
      departements: departements, // This array should now be populated
      annee: 2024
    };

    // Populate production details by sector
    Object.entries(prod).forEach(([pid, valeur]) => {
      const info = allProducts.find(p => p.id === pid);
      if (info && result.production[info.secteur]) {
        result.production[info.secteur][info.nom] = {
          valeur,
          icone: info.icone,
          unite: info.unite
        };
      }
    });

    return result;
  } finally {
    client.release();
  }
}
// async function getRegionDetails(nomRegion) {
//   const client = await pool.connect();
//   try {
//     const regionRes = await client.query('SELECT adm1_name1 AS nom, adm1_name AS nom_en, adm1_pcode AS code, area_sqkm AS superficie, center_lat, center_lon, production_details FROM regions WHERE adm1_name1 = $1', [nomRegion]);
//     if (regionRes.rows.length === 0) return { error: 'Région non trouvée' };
//     const regionData = regionRes.rows[0];
//
//     const departementsRes = await client.query('SELECT adm2_name1 AS nom FROM departements WHERE adm1_name1 = $1 ORDER BY adm2_name1', [nomRegion]);
//     const departements = departementsRes.rows.map(row => row.nom);
//
//     const prod = regionData.production_details || {};
//     const allProducts = await getAllProductsFromDB();
//
//     const result = {
//       nom: regionData.nom,
//       nom_en: regionData.nom_en,
//       code: regionData.code,
//       type: 'region',
//       superficie: regionData.superficie,
//       centre: { lat: regionData.center_lat, lon: regionData.center_lon },
//       secteur_principal: prod.secteur_principal,
//       valeur_economique: prod.valeur_economique,
//       production: { agriculture: {}, elevage: {}, peche: {} },
//       departements: departements,
//       annee: 2024
//     };
//
//     Object.entries(prod).forEach(([pid, valeur]) => {
//       const info = allProducts.find(p => p.id === pid);
//       if (info && result.production[info.secteur]) {
//         result.production[info.secteur][info.nom] = { valeur, icone: info.icone, unite: info.unite };
//       }
//     });
//
//     return result;
//   } finally {
//     client.release();
//   }
// }

async function getDepartementDetails(nomDept) {
  const client = await pool.connect();
  try {
    const deptRes = await client.query('SELECT adm2_name1 AS nom, adm1_name1 AS region_parente, adm2_pcode AS code, area_sqkm AS superficie, center_lat, center_lon, population FROM departements WHERE adm2_name1 = $1', [nomDept]);
    if (deptRes.rows.length === 0) return { error: 'Département non trouvé' };
    const deptData = deptRes.rows[0];

    // Get region details to estimate dept production
    const regionRes = await client.query('SELECT production_details FROM regions WHERE adm1_name1 = $1', [deptData.region_parente]);
    const regionProd = regionRes.rows.length > 0 ? regionRes.rows[0].production_details : {};

    // Get department count
    const countRes = await client.query('SELECT COUNT(*) FROM departements WHERE adm1_name1 = $1', [deptData.region_parente]);
    const deptCount = parseInt(countRes.rows[0].count, 10);

    const production = generateDeptProduction(nomDept, regionProd, deptCount);

    return {
      nom: deptData.nom,
      region_parente: deptData.region_parente,
      code: deptData.code,
      type: 'departement',
      superficie: deptData.superficie,
      population: deptData.population,
      centre: { lat: deptData.center_lat, lon: deptData.center_lon },
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

async function getLegend(theme = 'tous') {
  if (theme === 'tous') {
    return {
      titre: 'Légende Administrative',
      items: [
        { couleur: '#2ecc71', label: 'Régions', opacite: 0.6 },
        { couleur: '#95a5a6', label: 'Départements', opacite: 0.6 }
      ]
    };
  }

  const client = await pool.connect();
  try {
    // Get colors for this theme
    const colorRes = await client.query('SELECT * FROM color_scales WHERE theme = $1 OR theme = $2 ORDER BY min_val', [theme, 'default']);
    let items = colorRes.rows.filter(r => r.theme === theme);
    if (items.length === 0) items = colorRes.rows.filter(r => r.theme === 'default');

    // Get product info for title/unit
    const prodRes = await client.query('SELECT * FROM products WHERE id = $1', [theme]);
    const prodInfo = prodRes.rows[0];

    return {
      titre: prodInfo ? `Production: ${prodInfo.nom}` : 'Légende',
      unite: prodInfo?.unite || 'unités',
      items: items.map(e => ({
        couleur: e.couleur,
        label: e.label,
        min: e.min_val,
        max: e.max_val === 0 ? null : e.max_val // Adjusting for 0 logic in JSON
      }))
    };
  } finally {
    client.release();
  }
}

// =================================================================
// 7. SEARCH RESULTS
// =================================================================

async function search(query) {
  if (!query || query.length < 2) return { results: [], message: 'Entrez au moins 2 caractères' };

  const results = [];
  const queryLower = query.toLowerCase();
  const client = await pool.connect();

  try {
    const regionsRes = await client.query('SELECT adm1_name1 AS nom, adm1_pcode AS code, center_lat, center_lon FROM regions WHERE LOWER(adm1_name1) LIKE $1', [`%${queryLower}%`]);
    regionsRes.rows.forEach(row => results.push({
      type: 'region',
      nom: row.nom,
      code: row.code,
      matchIndex: row.nom.toLowerCase().indexOf(queryLower),
      centre: { lat: row.center_lat, lon: row.center_lon }
    }));

    const deptsRes = await client.query('SELECT adm2_name1 AS nom, adm1_name1 AS region_parente, adm2_pcode AS code, center_lat, center_lon FROM departements WHERE LOWER(adm2_name1) LIKE $1', [`%${queryLower}%`]);
    deptsRes.rows.forEach(row => results.push({
      type: 'departement',
      nom: row.nom,
      region_parente: row.region_parente,
      code: row.code,
      matchIndex: row.nom.toLowerCase().indexOf(queryLower),
      centre: { lat: row.center_lat, lon: row.center_lon }
    }));

    return {
      results: results.sort((a, b) => a.matchIndex - b.matchIndex),
      count: results.length,
      message: results.length === 0 ? 'Aucun résultat trouvé' : null
    };
  } finally {
    client.release();
  }
}

// =================================================================
// 8. HEADER / FOOTER / MESSAGES
// =================================================================

async function getHeaderData() {
  const config = await getAppConfig();
  return config.header || {};
}

async function getFooterData() {
  const config = await getAppConfig();
  return config.footer || {};
}

function getMessages() {
  return {
    chargement: { carte: 'Chargement de la carte...', donnees: 'Récupération des données...', graphiques: 'Génération des graphiques...' },
    erreurs: { connexion: 'Impossible de se connecter au serveur', donnees: 'Erreur lors du chargement des données', carte: 'Erreur d\'affichage de la carte', recherche: 'Aucun résultat trouvé' },
    succes: { chargement: 'Données chargées avec succès', export: 'Export réussi' }
  };
}

// =================================================================
// 9. COMPARISON INTERFACE
// =================================================================

async function compare(ids, type = 'departement') {
  if (!ids || ids.length < 2) return { error: 'Sélectionnez au moins 2 éléments à comparer' };

  const items = [];
  for (const id of ids) {
    const details = type === 'region' ? await getRegionDetails(id) : await getDepartementDetails(id);
    if (!details.error) items.push(details);
  }

  if (items.length < 2) return { error: 'Pas assez d\'éléments trouvés pour la comparaison' };

  const allProducts = new Set();
  items.forEach(item => {
    if (item.production) {
      if (type === 'region') {
        Object.keys(item.production.agriculture || {}).forEach(p => allProducts.add(p));
        Object.keys(item.production.elevage || {}).forEach(p => allProducts.add(p));
        Object.keys(item.production.peche || {}).forEach(p => allProducts.add(p));
      } else {
        Object.keys(item.production).forEach(p => allProducts.add(p));
      }
    }
  });

  return { type, items, produits: [...allProducts].filter(p => p !== 'valeur_economique'), annee: 2024 };
}

// =================================================================
// UTILITAIRES
// =================================================================

function generateDeptProduction(nomDept, regionProd, nbDepts) {
  const seed = hashString(nomDept);
  const random = seededRandom(seed);
  const production = {};

  if (nbDepts === 0) return production;

  for (const [produit, valeur] of Object.entries(regionProd)) {
    if (produit === 'secteur_principal' || produit === 'valeur_economique') continue;
    if (typeof valeur === 'number' && valeur > 0) {
      const moyenne = valeur / nbDepts;
      const variation = 0.5 + random() * 1;
      production[produit] = Math.floor(moyenne * variation);
    }
  }

  production.valeur_economique = Math.floor((regionProd.valeur_economique || 1000000000) / nbDepts * (0.5 + random() * 1));
  return production;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

// =================================================================
// EXPORTS
// =================================================================

module.exports = {
  getRegions,
  getDepartements,
  getFilterOptions,
  getProductsBySector,
  getKPIs,
  getTop10Producers,
  getProductionByRegion,
  getProductDistribution,
  getHistoricalData,
  getRegionDetails,
  getDepartementDetails,
  getLegend,
  search,
  getHeaderData,
  getFooterData,
  getMessages,
  compare
};