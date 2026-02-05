/**
 * API Service - Handles all API calls to the backend
 */

const API_BASE = 'http://localhost:3000/api';

class ApiService {
  /**
   * Generic fetch wrapper with error handling
   */
  async fetch(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // =====================
  // MAP ENDPOINTS
  // =====================

  async getRegions() {
    return this.fetch('/regions');
  }

  async getDepartements(region = null) {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return this.fetch(`/departements${query}`);
  }

  // =====================
  // FILTER ENDPOINTS
  // =====================

  async getFilters() {
    return this.fetch('/filters');
  }

  // =====================
  // KPI ENDPOINTS
  // =====================

  async getKPIs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.secteur) params.append('secteur', filters.secteur);
    if (filters.produit) params.append('produit', filters.produit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch(`/kpis${query}`);
  }

  // =====================
  // CHART ENDPOINTS
  // =====================

  async getTop10Producers(produit = 'cacao') {
    return this.fetch(`/charts/top10/${produit}`);
  }

  async getProductionByRegion(secteur = 'agriculture') {
    return this.fetch(`/charts/byregion/${secteur}`);
  }

  async getProductDistribution(region = null) {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return this.fetch(`/charts/distribution${query}`);
  }

  async getHistoricalData(secteur = 'all') {
    return this.fetch(`/charts/historical/${secteur}`);
  }

  // =====================
  // DETAIL ENDPOINTS
  // =====================

  async getRegionDetails(nom) {
    return this.fetch(`/regions/${encodeURIComponent(nom)}`);
  }

  async getDepartementDetails(nom) {
    return this.fetch(`/departements/${encodeURIComponent(nom)}`);
  }

  // =====================
  // LEGEND ENDPOINT
  // =====================

  async getLegend(theme = 'tous') {
    return this.fetch(`/legend/${theme}`);
  }

  // =====================
  // SEARCH ENDPOINT
  // =====================

  async search(query) {
    return this.fetch(`/search?q=${encodeURIComponent(query)}`);
  }

  // =====================
  // HEADER/FOOTER ENDPOINTS
  // =====================

  async getHeader() {
    return this.fetch('/header');
  }

  async getFooter() {
    return this.fetch('/footer');
  }

  async getMessages() {
    return this.fetch('/messages');
  }

  // =====================
  // COMPARISON ENDPOINT
  // =====================

  async compare(ids, type = 'departement') {
    return this.fetch('/compare', {
      method: 'POST',
      body: JSON.stringify({ ids, type })
    });
  }

  // =====================
  // HEALTH CHECK
  // =====================

  async healthCheck() {
    return this.fetch('/health');
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
