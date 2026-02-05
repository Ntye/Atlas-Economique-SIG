// /**
//  * KPI Dashboard Component
//  * Displays key performance indicators
//  */
//
// import { api } from '../services/api.js';
// import { formatNumber } from '../utils/helpers.js';
//
// class KPIDashboard {
//   constructor(containerId) {
//     this.container = document.getElementById(containerId);
//     this.data = null;
//     this.currentFilters = {};
//
//     // KPI configuration
//     this.kpiConfig = [
//       { key: 'agriculture', label: 'Agriculture' },
//       { key: 'elevage', label: 'Élevage' },
//       { key: 'peche', label: 'Pêche' },
//       { key: 'valeur_economique', label: 'Valeur Éco.' },
//       { key: 'regions_actives', label: 'Régions' },
//       { key: 'departements_actifs', label: 'Départements' }
//     ];
//   }
//
//   /**
//    * Initialize the KPI dashboard
//    */
//   async init() {
//     await this.loadData();
//   }
//
//   /**
//    * Load KPI data from API
//    */
//   async loadData(filters = {}) {
//     try {
//       this.currentFilters = filters;
//       this.data = await api.getKPIs(filters);
//       this.render();
//     } catch (error) {
//       console.error('KPI Dashboard load error:', error);
//       this.renderError();
//     }
//   }
//
//   /**
//    * Update KPIs with new filters
//    */
//   async update(filters = {}) {
//     await this.loadData(filters);
//   }
//
//   /**
//    * Render the KPI dashboard
//    */
//   render() {
//     if (!this.container || !this.data) return;
//
//     this.container.innerHTML = `
//       <div class="kpi-dashboard">
//         ${this.kpiConfig.map(kpi => this.renderKPICard(kpi)).join('')}
//       </div>
//     `;
//   }
//
//   /**
//    * Render a single KPI card
//    */
//   renderKPICard(kpi) {
//     const data = this.data[kpi.key];
//     if (!data) return '';
//
//     const value = formatNumber(data.valeur);
//     const evolutionClass = data.evolution >= 0 ? 'kpi-card__evolution--positive' : 'kpi-card__evolution--negative';
//     const evolutionSign = data.evolution >= 0 ? '+' : '';
//     const evolutionDisplay = data.evolution !== undefined
//       ? `<div class="kpi-card__evolution ${evolutionClass}">${evolutionSign}${data.evolution}%</div>`
//       : '';
//
//     return `
//       <div class="kpi-card">
//         <div class="kpi-card__header">
//           <div class="kpi-card__label">${kpi.label}</div>
//           ${evolutionDisplay}
//         </div>
//         <div class="kpi-card__value">${value}</div>
//       </div>
//     `;
//   }
//
//   /**
//    * Render error state
//    */
//   renderError() {
//     if (!this.container) return;
//
//     this.container.innerHTML = `
//       <div class="kpi-dashboard">
//         <div class="text-center text-muted p-4">
//           Erreur de chargement des indicateurs
//         </div>
//       </div>
//     `;
//   }
//
//   /**
//    * Refresh data
//    */
//   async refresh() {
//     await this.loadData(this.currentFilters);
//   }
//
//   /**
//    * Get current data
//    */
//   getData() {
//     return this.data;
//   }
// }
//
// export default KPIDashboard;


/**
 * KPI Dashboard Component
 * Displays key performance indicators with icons
 */

import { api } from '../services/api.js';
import { formatNumber } from '../utils/helpers.js';

class KPIDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = null;
    this.currentFilters = {};

    // KPI configuration with Font Awesome icons
    this.kpiConfig = [
      { key: 'agriculture', label: 'Agriculture', icon: 'fas fa-seedling' },
      { key: 'elevage', label: 'Élevage', icon: 'fas fa-cow' },
      { key: 'peche', label: 'Pêche', icon: 'fas fa-fish' },
      { key: 'valeur_economique', label: 'Valeur Éco.', icon: 'fas fa-chart-line' },
      { key: 'regions_actives', label: 'Régions', icon: 'fas fa-map-marked-alt' },
      { key: 'departements_actifs', label: 'Départements', icon: 'fas fa-layer-group' }
    ];
  }

  /**
   * Initialize the KPI dashboard
   */
  async init() {
    await this.loadData();
  }

  /**
   * Load KPI data from API
   */
  async loadData(filters = {}) {
    try {
      this.currentFilters = filters;
      this.data = await api.getKPIs(filters);
      this.render();
    } catch (error) {
      console.error('KPI Dashboard load error:', error);
      this.renderError();
    }
  }

  /**
   * Update KPIs with new filters
   */
  async update(filters = {}) {
    await this.loadData(filters);
  }

  /**
   * Render the KPI dashboard
   */
  render() {
    if (!this.container || !this.data) return;

    this.container.innerHTML = `
      <div class="kpi-dashboard">
        ${this.kpiConfig.map(kpi => this.renderKPICard(kpi)).join('')}
      </div>
    `;
  }

  /**
   * Render a single KPI card
   */
  renderKPICard(kpi) {
    const data = this.data[kpi.key];
    if (!data) return '';

    const value = formatNumber(data.valeur);

    return `
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">${kpi.label}</span>
          <i class="${kpi.icon}"></i>
        </div>
        <div class="kpi-card__value">${value}</div>
      </div>
    `;
  }

  /**
   * Render error state
   */
  renderError() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="kpi-dashboard">
        <div class="text-center text-muted p-4">
          Erreur de chargement des indicateurs
        </div>
      </div>
    `;
  }

  /**
   * Refresh data
   */
  async refresh() {
    await this.loadData(this.currentFilters);
  }

  /**
   * Get current data
   */
  getData() {
    return this.data;
  }
}

export default KPIDashboard;