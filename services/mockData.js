/**
 * Mock Data Service - Données simulées pour toutes les interfaces
 * Ce fichier contient toutes les données fictives du projet
 */

// =================================================================
// 1. DONNÉES DE PRODUCTION PAR RÉGION
// =================================================================
const productionRegions = {
  'Adamaoua': {
    cacao: 0, cafe: 500, bovins: 1500000, coton: 5000,
    mil: 200000, arachide: 50000, oignon: 30000,
    secteur_principal: 'elevage',
    valeur_economique: 2500000000
  },
  'Centre': {
    cacao: 250000, cafe: 10000, bovins: 20000, manioc: 500000,
    banane_plantain: 150000, palmier: 80000,
    secteur_principal: 'agriculture',
    valeur_economique: 4500000000
  },
  'Est': {
    cacao: 80000, cafe: 15000, bois: 800000, or: 500,
    manioc: 200000, banane: 50000, peche: 20000,
    secteur_principal: 'agriculture',
    valeur_economique: 3200000000
  },
  'Extreme-Nord': {
    coton: 300000, bovins: 800000, mil: 600000, oignon: 100000,
    arachide: 200000, sorgho: 400000, peche: 80000,
    secteur_principal: 'elevage',
    valeur_economique: 2800000000
  },
  'Littoral': {
    cacao: 60000, cafe: 40000, banane: 300000, peche: 150000,
    palmier: 200000, caoutchouc: 50000, hevea: 30000,
    secteur_principal: 'peche',
    valeur_economique: 5200000000
  },
  'Nord': {
    coton: 200000, bovins: 600000, arachide: 150000, riz: 50000,
    mil: 300000, oignon: 80000, sorgho: 250000,
    secteur_principal: 'elevage',
    valeur_economique: 2100000000
  },
  'Nord-Ouest': {
    cafe: 40000, pomme_de_terre: 300000, the: 5000, mais: 200000,
    haricot: 100000, tomate: 80000, chou: 50000,
    secteur_principal: 'agriculture',
    valeur_economique: 1800000000
  },
  'Ouest': {
    cafe: 60000, tomate: 200000, mais: 400000, porc: 80000,
    haricot: 150000, pomme_de_terre: 180000, chou: 60000,
    secteur_principal: 'agriculture',
    valeur_economique: 3500000000
  },
  'Sud': {
    cacao: 120000, hevea: 40000, peche: 50000, bois: 300000,
    manioc: 100000, banane: 80000, palmier: 60000,
    secteur_principal: 'agriculture',
    valeur_economique: 2600000000
  },
  'Sud-Ouest': {
    cacao: 180000, banane: 250000, huile_palme: 400000, the: 2000,
    caoutchouc: 100000, peche: 60000, hevea: 70000,
    secteur_principal: 'agriculture',
    valeur_economique: 4100000000
  }
};

// =================================================================
// 2. LISTE DES PRODUITS PAR SECTEUR
// =================================================================
const produitsSecteurs = {
  agriculture: [
    { id: 'cacao', nom: 'Cacao', unite: 'tonnes', icone: '🍫', couleur: '#795548' },
    { id: 'cafe', nom: 'Café', unite: 'tonnes', icone: '☕', couleur: '#4E342E' },
    { id: 'coton', nom: 'Coton', unite: 'tonnes', icone: '☁️', couleur: '#90CAF9' },
    { id: 'manioc', nom: 'Manioc', unite: 'tonnes', icone: '🥔', couleur: '#8D6E63' },
    { id: 'mais', nom: 'Maïs', unite: 'tonnes', icone: '🌽', couleur: '#FFD54F' },
    { id: 'riz', nom: 'Riz', unite: 'tonnes', icone: '🌾', couleur: '#FFF9C4' },
    { id: 'banane', nom: 'Banane', unite: 'tonnes', icone: '🍌', couleur: '#FFEB3B' },
    { id: 'tomate', nom: 'Tomate', unite: 'tonnes', icone: '🍅', couleur: '#F44336' },
    { id: 'arachide', nom: 'Arachide', unite: 'tonnes', icone: '🥜', couleur: '#D7CCC8' },
    { id: 'pomme_de_terre', nom: 'Pomme de Terre', unite: 'tonnes', icone: '🥔', couleur: '#A1887F' },
    { id: 'huile_palme', nom: 'Huile de Palme', unite: 'tonnes', icone: '🌴', couleur: '#FF9800' },
    { id: 'hevea', nom: 'Hévéa', unite: 'tonnes', icone: '🌳', couleur: '#388E3C' },
    { id: 'the', nom: 'Thé', unite: 'tonnes', icone: '🍵', couleur: '#81C784' },
    { id: 'oignon', nom: 'Oignon', unite: 'tonnes', icone: '🧅', couleur: '#CE93D8' },
    { id: 'mil', nom: 'Mil', unite: 'tonnes', icone: '🌾', couleur: '#BCAAA4' },
    { id: 'sorgho', nom: 'Sorgho', unite: 'tonnes', icone: '🌾', couleur: '#A1887F' }
  ],
  elevage: [
    { id: 'bovins', nom: 'Bovins', unite: 'têtes', icone: '🐄', couleur: '#E65100' },
    { id: 'porc', nom: 'Porcins', unite: 'têtes', icone: '🐷', couleur: '#F8BBD9' },
    { id: 'ovins', nom: 'Ovins', unite: 'têtes', icone: '🐑', couleur: '#EEEEEE' },
    { id: 'caprins', nom: 'Caprins', unite: 'têtes', icone: '🐐', couleur: '#D7CCC8' },
    { id: 'volaille', nom: 'Volaille', unite: 'têtes', icone: '🐔', couleur: '#FFCC80' }
  ],
  peche: [
    { id: 'peche', nom: 'Pêche', unite: 'tonnes', icone: '🐟', couleur: '#2196F3' },
    { id: 'crevette', nom: 'Crevettes', unite: 'tonnes', icone: '🦐', couleur: '#FF7043' },
    { id: 'poisson_eau_douce', nom: 'Poisson d\'eau douce', unite: 'tonnes', icone: '🐠', couleur: '#4FC3F7' }
  ]
};

// =================================================================
// 2b. COULEURS DES SECTEURS
// =================================================================
const couleursSecteurs = {
  agriculture: { couleur: '#4CAF50', label: 'Agriculture', icone: '🌾' },
  elevage: { couleur: '#FF9800', label: 'Élevage', icone: '🐄' },
  peche: { couleur: '#2196F3', label: 'Pêche', icone: '🐟' }
};

// =================================================================
// 3. DONNÉES DES DÉPARTEMENTS (58 départements)
// =================================================================
const departementsData = {
  'Adamaoua': [
    { nom: 'Djérem', population: 185000 },
    { nom: 'Faro-et-Déo', population: 75000 },
    { nom: 'Mayo-Banyo', population: 230000 },
    { nom: 'Mbéré', population: 180000 },
    { nom: 'Vina', population: 420000 }
  ],
  'Centre': [
    { nom: 'Haute-Sanaga', population: 120000 },
    { nom: 'Lekié', population: 380000 },
    { nom: 'Mbam-et-Inoubou', population: 220000 },
    { nom: 'Mbam-et-Kim', population: 85000 },
    { nom: 'Méfou-et-Afamba', population: 150000 },
    { nom: 'Méfou-et-Akono', population: 65000 },
    { nom: 'Mfoundi', population: 2800000 },
    { nom: 'Nyong-et-Kellé', population: 180000 },
    { nom: 'Nyong-et-Mfoumou', population: 145000 },
    { nom: 'Nyong-et-So\'o', population: 160000 }
  ],
  'Est': [
    { nom: 'Boumba-et-Ngoko', population: 95000 },
    { nom: 'Haut-Nyong', population: 175000 },
    { nom: 'Kadey', population: 220000 },
    { nom: 'Lom-et-Djérem', population: 280000 }
  ],
  'Extreme-Nord': [
    { nom: 'Diamaré', population: 650000 },
    { nom: 'Logone-et-Chari', population: 520000 },
    { nom: 'Mayo-Danay', population: 580000 },
    { nom: 'Mayo-Kani', population: 420000 },
    { nom: 'Mayo-Sava', population: 280000 },
    { nom: 'Mayo-Tsanaga', population: 680000 }
  ],
  'Littoral': [
    { nom: 'Moungo', population: 520000 },
    { nom: 'Nkam', population: 85000 },
    { nom: 'Sanaga-Maritime', population: 220000 },
    { nom: 'Wouri', population: 3500000 }
  ],
  'Nord': [
    { nom: 'Bénoué', population: 850000 },
    { nom: 'Faro', population: 85000 },
    { nom: 'Mayo-Louti', population: 380000 },
    { nom: 'Mayo-Rey', population: 350000 }
  ],
  'Nord-Ouest': [
    { nom: 'Boyo', population: 180000 },
    { nom: 'Bui', population: 320000 },
    { nom: 'Donga-Mantung', population: 280000 },
    { nom: 'Menchum', population: 150000 },
    { nom: 'Mezam', population: 650000 },
    { nom: 'Momo', population: 185000 },
    { nom: 'Ngo-Ketunjia', population: 220000 }
  ],
  'Ouest': [
    { nom: 'Bamboutos', population: 320000 },
    { nom: 'Haut-Nkam', population: 180000 },
    { nom: 'Hauts-Plateaux', population: 145000 },
    { nom: 'Koung-Khi', population: 160000 },
    { nom: 'Menoua', population: 420000 },
    { nom: 'Mifi', population: 450000 },
    { nom: 'Ndé', population: 120000 },
    { nom: 'Noun', population: 850000 }
  ],
  'Sud': [
    { nom: 'Dja-et-Lobo', population: 220000 },
    { nom: 'Mvila', population: 185000 },
    { nom: 'Océan', population: 180000 },
    { nom: 'Vallée-du-Ntem', population: 95000 }
  ],
  'Sud-Ouest': [
    { nom: 'Fako', population: 520000 },
    { nom: 'Koupé-Manengouba', population: 145000 },
    { nom: 'Lebialem', population: 185000 },
    { nom: 'Manyu', population: 220000 },
    { nom: 'Meme', population: 380000 },
    { nom: 'Ndian', population: 165000 }
  ]
};

// =================================================================
// 4. ÉCHELLES DE COULEUR
// =================================================================
const echellesCouleur = {
  cacao: [
    { min: 0, max: 0, couleur: '#cccccc', label: 'Pas de production' },
    { min: 1, max: 50000, couleur: '#D7CCC8', label: 'Faible (< 50K)' },
    { min: 50000, max: 100000, couleur: '#A1887F', label: 'Moyen (50K-100K)' },
    { min: 100000, max: 200000, couleur: '#795548', label: 'Élevé (100K-200K)' },
    { min: 200000, max: Infinity, couleur: '#4E342E', label: 'Très élevé (> 200K)' }
  ],
  bovins: [
    { min: 0, max: 0, couleur: '#cccccc', label: 'Pas d\'élevage' },
    { min: 1, max: 100000, couleur: '#FFE0B2', label: 'Faible (< 100K)' },
    { min: 100000, max: 500000, couleur: '#FFB74D', label: 'Moyen (100K-500K)' },
    { min: 500000, max: 1000000, couleur: '#FF9800', label: 'Élevé (500K-1M)' },
    { min: 1000000, max: Infinity, couleur: '#E65100', label: 'Très élevé (> 1M)' }
  ],
  coton: [
    { min: 0, max: 0, couleur: '#cccccc', label: 'Pas de production' },
    { min: 1, max: 50000, couleur: '#E3F2FD', label: 'Faible (< 50K)' },
    { min: 50000, max: 150000, couleur: '#90CAF9', label: 'Moyen (50K-150K)' },
    { min: 150000, max: 250000, couleur: '#42A5F5', label: 'Élevé (150K-250K)' },
    { min: 250000, max: Infinity, couleur: '#1565C0', label: 'Très élevé (> 250K)' }
  ],
  peche: [
    { min: 0, max: 0, couleur: '#cccccc', label: 'Pas de pêche' },
    { min: 1, max: 50000, couleur: '#E1F5FE', label: 'Faible (< 50K)' },
    { min: 50000, max: 100000, couleur: '#4FC3F7', label: 'Moyen (50K-100K)' },
    { min: 100000, max: Infinity, couleur: '#0288D1', label: 'Élevé (> 100K)' }
  ],
  default: [
    { min: 0, max: 0, couleur: '#cccccc', label: 'Aucune donnée' },
    { min: 1, max: 10000, couleur: '#C8E6C9', label: 'Faible' },
    { min: 10000, max: 100000, couleur: '#81C784', label: 'Moyen' },
    { min: 100000, max: 500000, couleur: '#4CAF50', label: 'Élevé' },
    { min: 500000, max: Infinity, couleur: '#1B5E20', label: 'Très élevé' }
  ]
};

// =================================================================
// 5. KPI AGRÉGÉS
// =================================================================
const kpiData = {
  agriculture: {
    total: 3580000,
    unite: 'tonnes',
    evolution: 5.2,
    annee: 2024
  },
  elevage: {
    total: 4020000,
    unite: 'têtes',
    evolution: 3.8,
    annee: 2024
  },
  peche: {
    total: 560000,
    unite: 'tonnes',
    evolution: -2.1,
    annee: 2024
  },
  valeur_economique: {
    total: 32300000000,
    unite: 'FCFA',
    evolution: 4.5,
    annee: 2024
  },
  regions_actives: 10,
  departements_actifs: 58
};

// =================================================================
// 6. HISTORIQUE ANNUEL (pour graphiques temporels)
// =================================================================
const historiqueAnnuel = {
  annees: [2019, 2020, 2021, 2022, 2023, 2024],
  agriculture: [3200000, 3100000, 3350000, 3420000, 3500000, 3580000],
  elevage: [3600000, 3750000, 3800000, 3900000, 3980000, 4020000],
  peche: [620000, 590000, 580000, 560000, 570000, 560000]
};

// =================================================================
// 7. HEADER / NAVIGATION
// =================================================================
const headerData = {
  titre: 'Atlas Économique du Cameroun',
  sousTitre: 'Visualisation des productions agricoles, élevage et pêche',
  version: '1.0.0',
  themes: [
    { id: 'tous', label: 'Vue Administrative' },
    { id: 'cacao', label: 'Agriculture : Cacao' },
    { id: 'coton', label: 'Agriculture : Coton' },
    { id: 'cafe', label: 'Agriculture : Café' },
    { id: 'bovins', label: 'Élevage : Bovins' },
    { id: 'peche', label: 'Pêche' }
  ],
  langues: [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' }
  ]
};

// =================================================================
// 8. FOOTER
// =================================================================
const footerData = {
  credits: '© 2026 Projet 5GI - Ecole Nationale Supérieure Polytechnique Yaoundé',
  sources: [
    { nom: 'MINADER', url: 'https://www.minader.cm' },
    { nom: 'HDX', url: 'https://data.humdata.org' }
  ],
  derniereMAJ: '2026-01-16',
  contact: {
    email: 'nty.nina@gmail.com',
    github: 'https://github.com/projet5gi'
  }
};

// =================================================================
// 9. MESSAGES D'ERREUR ET ÉTATS
// =================================================================
const messagesEtats = {
  chargement: {
    carte: 'Chargement de la carte...',
    donnees: 'Récupération des données...',
    graphiques: 'Génération des graphiques...'
  },
  erreurs: {
    connexion: 'Impossible de se connecter au serveur',
    donnees: 'Erreur lors du chargement des données',
    carte: 'Erreur d\'affichage de la carte',
    recherche: 'Aucun résultat trouvé'
  },
  succes: {
    chargement: 'Données chargées avec succès',
    export: 'Export réussi'
  }
};

// =================================================================
// EXPORTS
// =================================================================
module.exports = {
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
};
