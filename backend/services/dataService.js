/**
 * Data Service - Traitement des données GeoJSON et mock data
 * Fournit toutes les méthodes nécessaires pour les endpoints API
 */

const fs = require('fs');
const path = require('path');
const {
  productionRegions,
  produitsSecteurs,
  couleursSecteurs,
  departementsData,
  echellesCouleur,
  kpiData,
  historiqueAnnuel,
  headerData,
  footerData,
  messagesEtats
} = require('./mockData');

// Chemins vers les fichiers GeoJSON
const REGIONS_FILE = path.join(__dirname, '..', 'cameroun_regions.json');
const DEPTS_FILE = path.join(__dirname, '..', 'cameroun_departements.json');

// Cache pour les données GeoJSON
let regionsGeoJSON = null;
let departementsGeoJSON = null;

// =================================================================
// CHARGEMENT DES DONNÉES GEOJSON
// =================================================================

function loadRegionsGeoJSON() {
  if (!regionsGeoJSON) {
    const rawData = fs.readFileSync(REGIONS_FILE, 'utf8');
    regionsGeoJSON = JSON.parse(rawData);
  }
  return regionsGeoJSON;
}

function loadDepartementsGeoJSON() {
  if (!departementsGeoJSON) {
    const rawData = fs.readFileSync(DEPTS_FILE, 'utf8');
    departementsGeoJSON = JSON.parse(rawData);
  }
  return departementsGeoJSON;
}

// =================================================================
// 1. MAIN MAP INTERFACE - Données cartographiques
// =================================================================

/**
 * Récupère toutes les régions avec leurs données de production
 */
function getRegions() {
  const geojson = loadRegionsGeoJSON();

  return {
    type: "FeatureCollection",
    features: geojson.features.map(feature => {
      const nomRegion = feature.properties.adm1_name1;
      const production = productionRegions[nomRegion] || { info: "Pas de données" };

      return {
        type: "Feature",
        properties: {
          nom: nomRegion,
          nom_en: feature.properties.adm1_name,
          code: feature.properties.adm1_pcode,
          type_admin: 'region',
          production: production,
          centre_lat: feature.properties.center_lat,
          centre_lon: feature.properties.center_lon,
          superficie: feature.properties.area_sqkm
        },
        geometry: feature.geometry
      };
    })
  };
}

/**
 * Récupère tous les départements avec leurs données de production
 */
function getDepartements(regionFilter = null) {
  const geojson = loadDepartementsGeoJSON();

  let features = geojson.features.map(feature => {
    const nomDept = feature.properties.adm2_name1 || feature.properties.adm2_name;
    const nomRegion = feature.properties.adm1_name1 || feature.properties.adm1_name;

    // Générer des données de production cohérentes basées sur la région parente
    const regionProd = productionRegions[nomRegion] || {};
    const production = generateDeptProduction(nomDept, nomRegion, regionProd);

    return {
      type: "Feature",
      properties: {
        nom: nomDept,
        region_parente: nomRegion,
        code: feature.properties.adm2_pcode,
        type_admin: 'departement',
        production: production,
        centre_lat: feature.properties.center_lat,
        centre_lon: feature.properties.center_lon,
        superficie: feature.properties.area_sqkm
      },
      geometry: feature.geometry
    };
  });

  // Filtrer par région si spécifié
  if (regionFilter) {
    features = features.filter(f => f.properties.region_parente === regionFilter);
  }

  return {
    type: "FeatureCollection",
    features: features
  };
}

/**
 * Génère des données de production pour un département basées sur sa région
 */
function generateDeptProduction(nomDept, nomRegion, regionProd) {
  // Seed basé sur le nom pour avoir des données cohérentes
  const seed = hashString(nomDept);
  const random = seededRandom(seed);

  const production = {};

  // Distribuer les productions de la région parmi ses départements
  const deptList = departementsData[nomRegion] || [];
  const nbDepts = deptList.length || 1;

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

// =================================================================
// 2. SIDEBAR / FILTERS PANEL - Données de filtrage
// =================================================================

/**
 * Récupère toutes les options de filtrage
 */
function getFilterOptions() {
  const regions = loadRegionsGeoJSON();
  const depts = loadDepartementsGeoJSON();

  // Extraire les noms uniques
  const regionNames = [...new Set(
    regions.features.map(f => f.properties.adm1_name1)
  )].sort();

  const departementsByRegion = {};
  depts.features.forEach(f => {
    const region = f.properties.adm1_name1;
    const dept = f.properties.adm2_name1;
    if (!departementsByRegion[region]) {
      departementsByRegion[region] = [];
    }
    departementsByRegion[region].push(dept);
  });

  // Trier les départements
  for (const region of Object.keys(departementsByRegion)) {
    departementsByRegion[region].sort();
  }

  return {
    secteurs: [
      { id: 'agriculture', label: 'Agriculture', icone: '🌾' },
      { id: 'elevage', label: 'Élevage', icone: '🐄' },
      { id: 'peche', label: 'Pêche', icone: '🐟' }
    ],
    couleursSecteurs: couleursSecteurs,
    regions: regionNames.map(nom => ({
      id: nom,
      label: nom
    })),
    departementsByRegion: departementsByRegion,
    produits: produitsSecteurs,
    themes: headerData.themes
  };
}

// =================================================================
// 3. KPI DASHBOARD - Indicateurs clés
// =================================================================

/**
 * Récupère les KPIs globaux ou filtrés
 */
function getKPIs(filters = {}) {
  const { secteur, region, produit } = filters;

  let agricultureTotal = 0;
  let elevageTotal = 0;
  let pecheTotal = 0;
  let valeurTotal = 0;
  let regionsActives = new Set();
  let departementsActifs = 0;

  const regionsToProcess = region
    ? [region]
    : Object.keys(productionRegions);

  regionsToProcess.forEach(regionName => {
    const prod = productionRegions[regionName];
    if (!prod) return;

    regionsActives.add(regionName);

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

    // Compter les départements
    if (departementsData[regionName]) {
      departementsActifs += departementsData[regionName].length;
    }
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
}

// =================================================================
// 4. CHARTS SECTION - Données pour graphiques
// =================================================================

/**
 * Top 10 producteurs par produit
 */
function getTop10Producers(produit = 'cacao') {
  const producers = [];

  Object.entries(productionRegions).forEach(([region, prod]) => {
    if (prod[produit] && prod[produit] > 0) {
      producers.push({
        nom: region,
        valeur: prod[produit],
        type: 'region'
      });
    }
  });

  // Trier par valeur décroissante
  producers.sort((a, b) => b.valeur - a.valeur);

  return producers.slice(0, 10);
}

/**
 * Production par région (pour pie chart)
 */
function getProductionByRegion(secteur = 'agriculture') {
  const data = [];
  const produits = produitsSecteurs[secteur] || produitsSecteurs.agriculture;

  Object.entries(productionRegions).forEach(([region, prod]) => {
    let total = 0;
    produits.forEach(p => {
      if (prod[p.id]) total += prod[p.id];
    });

    if (total > 0) {
      data.push({
        nom: region,
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
}

/**
 * Distribution des produits
 */
function getProductDistribution(region = null) {
  const distribution = {};

  const regionsToProcess = region
    ? { [region]: productionRegions[region] }
    : productionRegions;

  Object.values(regionsToProcess).forEach(prod => {
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
}

/**
 * Données temporelles pour graphiques de tendance
 */
function getHistoricalData(secteur = 'all') {
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
function getRegionDetails(nomRegion) {
  const prod = productionRegions[nomRegion];
  if (!prod) {
    return { error: 'Région non trouvée' };
  }

  const depts = departementsData[nomRegion] || [];
  const geojson = loadRegionsGeoJSON();
  const feature = geojson.features.find(f => f.properties.adm1_name1 === nomRegion);

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
    nom: nomRegion,
    nom_en: feature?.properties.adm1_name,
    code: feature?.properties.adm1_pcode,
    type: 'region',
    superficie: feature?.properties.area_sqkm,
    centre: {
      lat: feature?.properties.center_lat,
      lon: feature?.properties.center_lon
    },
    secteur_principal: prod.secteur_principal,
    valeur_economique: prod.valeur_economique,
    production: {
      agriculture,
      elevage,
      peche
    },
    departements: depts,
    annee: 2024
  };
}

/**
 * Détails d'un département
 */
function getDepartementDetails(nomDept) {
  const geojson = loadDepartementsGeoJSON();
  const feature = geojson.features.find(f =>
    f.properties.adm2_name1 === nomDept || f.properties.adm2_name === nomDept
  );

  if (!feature) {
    return { error: 'Département non trouvé' };
  }

  const nomRegion = feature.properties.adm1_name1;
  const regionProd = productionRegions[nomRegion] || {};
  const production = generateDeptProduction(nomDept, nomRegion, regionProd);

  // Trouver la population
  const deptInfo = departementsData[nomRegion]?.find(d => d.nom === nomDept);

  return {
    nom: nomDept,
    region_parente: nomRegion,
    code: feature.properties.adm2_pcode,
    type: 'departement',
    superficie: feature.properties.area_sqkm,
    population: deptInfo?.population || null,
    centre: {
      lat: feature.properties.center_lat,
      lon: feature.properties.center_lon
    },
    production: production,
    annee: 2024
  };
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
function search(query) {
  if (!query || query.length < 2) {
    return { results: [], message: 'Entrez au moins 2 caractères' };
  }

  const results = [];
  const queryLower = query.toLowerCase();

  // Rechercher dans les régions
  const regions = loadRegionsGeoJSON();
  regions.features.forEach(f => {
    const nom = f.properties.adm1_name1;
    if (nom.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'region',
        nom: nom,
        code: f.properties.adm1_pcode,
        matchIndex: nom.toLowerCase().indexOf(queryLower),
        centre: {
          lat: f.properties.center_lat,
          lon: f.properties.center_lon
        }
      });
    }
  });

  // Rechercher dans les départements
  const depts = loadDepartementsGeoJSON();
  depts.features.forEach(f => {
    const nom = f.properties.adm2_name1;
    const region = f.properties.adm1_name1;
    if (nom && nom.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'departement',
        nom: nom,
        region_parente: region,
        code: f.properties.adm2_pcode,
        matchIndex: nom.toLowerCase().indexOf(queryLower),
        centre: {
          lat: f.properties.center_lat,
          lon: f.properties.center_lon
        }
      });
    }
  });

  // Trier par pertinence (match au début d'abord)
  results.sort((a, b) => a.matchIndex - b.matchIndex);

  return {
    results: results,
    count: results.length,
    message: results.length === 0 ? 'Aucun résultat trouvé' : null
  };
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
function compare(ids, type = 'departement') {
  if (!ids || ids.length < 2) {
    return { error: 'Sélectionnez au moins 2 éléments à comparer' };
  }

  const items = ids.map(id => {
    if (type === 'region') {
      return getRegionDetails(id);
    } else {
      return getDepartementDetails(id);
    }
  }).filter(item => !item.error);

  if (items.length < 2) {
    return { error: 'Pas assez d\'éléments trouvés pour la comparaison' };
  }

  // Trouver tous les produits communs
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
