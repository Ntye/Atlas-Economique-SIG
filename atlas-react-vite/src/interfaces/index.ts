/**
 * TypeScript interfaces for the Atlas Economique du Cameroun application
 */

// =================================================================
// GeoJSON Types
// =================================================================

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][] | number[][][][];
}

export interface GeoJSONFeature<P = Record<string, unknown>> {
  type: 'Feature';
  properties: P;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection<P = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<P>[];
}

// =================================================================
// Production & Data Types
// =================================================================

export interface ProductionData {
  [key: string]: number | string | undefined;
  secteur_principal?: string;
  valeur_economique?: number;
}

export interface RegionProperties {
  nom: string;
  nom_en: string;
  code: string;
  type_admin: 'region';
  production: ProductionData;
  centre_lat: number;
  centre_lon: number;
  superficie: number;
}

export interface DepartementProperties {
  nom: string;
  region_parente: string;
  code: string;
  type_admin: 'departement';
  production: ProductionData;
  centre_lat: number;
  centre_lon: number;
  superficie: number;
}

export type FeatureProperties = RegionProperties | DepartementProperties;

// =================================================================
// Product & Sector Types
// =================================================================

export interface Produit {
  id: string;
  nom: string;
  unite: string;
  icone: string;
  couleur: string;
}

export interface ProduitsSecteurs {
  agriculture: Produit[];
  elevage: Produit[];
  peche: Produit[];
  [key: string]: Produit[];
}

export interface ProductsBySectorResponse {
  [sectorId: string]: Produit[];
}

export interface CouleurSecteur {
  couleur: string;
  label: string;
  icone: string;
}

export interface CouleursSecteurs {
  agriculture: CouleurSecteur;
  elevage: CouleurSecteur;
  peche: CouleurSecteur;
  [key: string]: CouleurSecteur;
}

// =================================================================
// Filter Types
// =================================================================

export interface FilterRegion {
  id: string;
  label: string;
}

export interface FilterSecteur {
  id: string;
  label: string;
  icone: string;
}

export interface FilterOptions {
  secteurs: FilterSecteur[];
  couleursSecteurs: CouleursSecteurs;
  regions: FilterRegion[];
  departementsByRegion: Record<string, string[]>;
  produits: ProduitsSecteurs;
  themes: Theme[];
}

export interface ActiveFilters {
  region?: string;
  departement?: string;
  secteur?: string;
  produit?: string;
  regions?: string[];
  departements?: string[];
}

// =================================================================
// KPI Types
// =================================================================

export interface KPIItem {
  label: string;
  valeur: number;
  unite?: string;
  icone?: string;
  evolution?: number;
}

export interface KPIData {
  agriculture: KPIItem;
  elevage: KPIItem;
  peche: KPIItem;
  valeur_economique: KPIItem;
  regions_actives: KPIItem;
  departements_actifs: KPIItem;
  annee: number;
  [key: string]: KPIItem | number;
}

export interface KPIConfig {
  key: string;
  label: string;
  icon: string;
}

// =================================================================
// Chart Types
// =================================================================

export interface Top10Item {
  nom: string;
  valeur: number;
  type: string;
}

export interface Top10Response {
  produit: string;
  data: Top10Item[];
  chartType: string;
}

export interface RegionProductionItem {
  nom: string;
  valeur: number;
  pourcentage: number;
}

export interface RegionProductionResponse {
  secteur: string;
  data: RegionProductionItem[];
  chartType: string;
}

export interface DistributionItem {
  id: string;
  nom: string;
  valeur: number;
  icone: string;
  couleur: string;
}

export interface DistributionResponse {
  region: string;
  data: DistributionItem[];
  chartType: string;
}

export interface HistoricalData {
  annees: number[];
  agriculture?: number[];
  elevage?: number[];
  peche?: number[];
  valeurs?: number[];
  [key: string]: number[] | undefined;
}

export interface HistoricalResponse {
  secteur: string;
  data: HistoricalData;
  chartType: string;
}

// =================================================================
// Header & Footer Types
// =================================================================

export interface Theme {
  id: string;
  label: string;
}

export interface Language {
  code: string;
  label: string;
}

export interface HeaderData {
  titre: string;
  sousTitre: string;
  version: string;
  themes: Theme[];
  langues: Language[];
}

export interface Source {
  nom: string;
  url: string;
}

export interface FooterData {
  credits: string;
  sources: Source[];
  derniereMAJ: string;
  contact: {
    email: string;
    github: string;
  };
}

// =================================================================
// Legend Types
// =================================================================

export interface LegendItem {
  couleur: string;
  label: string;
  opacite?: number;
  min?: number;
  max?: number | null;
}

export interface LegendData {
  titre: string;
  unite?: string;
  items: LegendItem[];
}

// =================================================================
// Search Types
// =================================================================

export interface SearchResult {
  type: 'region' | 'departement';
  nom: string;
  region_parente?: string;
  code: string;
  matchIndex: number;
  centre: {
    lat: number;
    lon: number;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  count: number;
  message: string | null;
}

// =================================================================
// Comparison Types
// =================================================================

export interface ComparisonItem {
  nom: string;
  type: string;
  production?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ComparisonData {
  type: string;
  items: ComparisonItem[];
  produits: string[];
  annee: number;
}

// =================================================================
// Departement Data Types
// =================================================================

export interface DepartementInfo {
  nom: string;
  population: number;
}

// =================================================================
// Region Details Types
// =================================================================

export interface ProductionEntry {
  valeur: number;
  icone: string;
  unite: string;
}

export interface RegionDetails {
  nom: string;
  nom_en?: string;
  code?: string;
  type: 'region';
  superficie?: number;
  centre?: { lat: number; lon: number };
  secteur_principal?: string;
  valeur_economique?: number;
  production?: {
    agriculture: Record<string, ProductionEntry>;
    elevage: Record<string, ProductionEntry>;
    peche: Record<string, ProductionEntry>;
  };
  departements?: DepartementInfo[];
  annee?: number;
  error?: string;
}

export interface DepartementDetails {
  nom: string;
  region_parente?: string;
  code?: string;
  type: 'departement';
  superficie?: number;
  population?: number;
  centre?: { lat: number; lon: number };
  production?: Record<string, number>;
  annee?: number;
  error?: string;
}

export type LocationDetails = RegionDetails | DepartementDetails;

// =================================================================
// Messages Types
// =================================================================

export interface Messages {
  chargement: {
    carte: string;
    donnees: string;
    graphiques: string;
  };
  erreurs: {
    connexion: string;
    donnees: string;
    carte: string;
    recherche: string;
  };
  succes: {
    chargement: string;
    export: string;
  };
}

// =================================================================
// Health Check
// =================================================================

export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
}

// =================================================================
// Map Style Types
// =================================================================

export interface MapStyle {
  fillColor: string;
  fillOpacity: number;
  weight: number;
  color: string;
  opacity: number;
}

export interface ColorScaleEntry {
  max: number;
  color: string;
  opacity: number;
}

export interface EchelleCouleur {
  min: number;
  max: number;
  couleur: string;
  label: string;
}