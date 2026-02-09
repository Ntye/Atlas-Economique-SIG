/**
 * API Service - Handles all API calls to the backend
 */

import type {
  GeoJSONFeatureCollection,
  RegionProperties,
  DepartementProperties,
  FilterOptions,
  KPIData,
  Top10Response,
  RegionProductionResponse,
  DistributionResponse,
  HistoricalResponse,
  RegionDetails,
  DepartementDetails,
  LegendData,
  SearchResponse,
  HeaderData,
  FooterData,
  Messages,
  ComparisonData,
  HealthCheck,
  ActiveFilters,
  ProductsBySectorResponse, // Added this import
} from '../interfaces';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // =====================
  // MAP ENDPOINTS
  // =====================

  async getRegions(): Promise<GeoJSONFeatureCollection<RegionProperties>> {
    return this.request('/regions');
  }

  async getDepartements(region?: string): Promise<GeoJSONFeatureCollection<DepartementProperties>> {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return this.request(`/departements${query}`);
  }

  // =====================
  // FILTER ENDPOINTS
  // =====================

  async getFilters(): Promise<FilterOptions> {
    return this.request('/filters');
  }

  async getProductsBySector(secteur: string): Promise<ProductsBySectorResponse> {
    return this.request(`/products-by-sector/${encodeURIComponent(secteur)}`);
  }

  // =====================
  // KPI ENDPOINTS
  // =====================

  async getKPIs(filters: Partial<ActiveFilters> = {}): Promise<KPIData> {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.secteur) params.append('secteur', filters.secteur);
    if (filters.produit) params.append('produit', filters.produit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/kpis${query}`);
  }

  // =====================
  // CHART ENDPOINTS
  // =====================

  async getTop10Producers(produit: string = 'cacao'): Promise<Top10Response> {
    return this.request(`/charts/top10/${produit}`);
  }

  async getProductionByRegion(secteur: string = 'agriculture'): Promise<RegionProductionResponse> {
    return this.request(`/charts/byregion/${secteur}`);
  }

  async getProductDistribution(region?: string): Promise<DistributionResponse> {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return this.request(`/charts/distribution${query}`);
  }

  async getHistoricalData(secteur: string = 'all'): Promise<HistoricalResponse> {
    return this.request(`/charts/historical/${secteur}`);
  }

  // =====================
  // DETAIL ENDPOINTS
  // =====================

  async getRegionDetails(nom: string): Promise<RegionDetails> {
    return this.request(`/regions/${encodeURIComponent(nom)}`);
  }

  async getDepartementDetails(nom: string): Promise<DepartementDetails> {
    return this.request(`/departements/${encodeURIComponent(nom)}`);
  }

  // =====================
  // LEGEND ENDPOINT
  // =====================

  async getLegend(theme: string = 'tous'): Promise<LegendData> {
    return this.request(`/legend/${theme}`);
  }

  // =====================
  // SEARCH ENDPOINT
  // =====================

  async search(query: string): Promise<SearchResponse> {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // =====================
  // HEADER/FOOTER ENDPOINTS
  // =====================

  async getHeader(): Promise<HeaderData> {
    return this.request('/header');
  }

  async getFooter(): Promise<FooterData> {
    return this.request('/footer');
  }

  async getMessages(): Promise<Messages> {
    return this.request('/messages');
  }

  // =====================
  // COMPARISON ENDPOINT
  // =====================

  async compare(ids: string[], type: string = 'departement'): Promise<ComparisonData> {
    return this.request('/compare', {
      method: 'POST',
      body: JSON.stringify({ ids, type }),
    });
  }

  // =====================
  // HEALTH CHECK
  // =====================

  async healthCheck(): Promise<HealthCheck> {
    return this.request('/health');
  }
}

export const api = new ApiService();
export default api;