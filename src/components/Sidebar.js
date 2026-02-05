/**
 * Sidebar Component
 * Contains filters and charts
 */

import { api } from '../services/api.js';
import Charts from './Charts.js';
import ComparisonPanel from './ComparisonPanel.js';

class Sidebar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.filterOptions = null;
    this.isOpen = true;

    // Child components
    this.charts = null;
    this.comparisonPanel = null;

    // Callbacks
    this.onRegionChange = null;
    this.onDepartementChange = null;
    this.onFiltersApply = null;
    this.onFiltersReset = null;

    // Current state
    this.currentRegion = 'all';
    this.currentDept = 'all';
    this.currentSecteur = 'all';
    this.currentProduit = 'all';
    this.activeFilters = [];
  }

  /**
   * Initialize the sidebar
   */
  async init() {
    try {
      this.filterOptions = await api.getFilters();
      this.render();
      this.initChildComponents();
      this.attachEventListeners();
    } catch (error) {
      console.error('Sidebar init error:', error);
    }
  }

  /**
   * Render the sidebar HTML
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <!-- Filters Section -->
      <div class="sidebar__section">
        <h3 class="sidebar__section-title">Filtres</h3>
        
        <div class="sidebar__filter-group">
          <label>Région</label>
          <select id="select-region">
            <option value="all">-- Toutes les régions --</option>
            ${this.filterOptions.regions.map(r => `
              <option value="${r.id}">${r.label}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="sidebar__filter-group">
          <label>Secteur d'activité</label>
          <select id="select-secteur">
            <option value="all">-- Tous les secteurs --</option>
            ${this.filterOptions.secteurs.map(s => `
              <option value="${s.id}">${s.icone} ${s.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="sidebar__filter-group">
          <label>Département</label>
          <select id="select-dept" disabled>
            <option value="all">-- Tous les départements --</option>
          </select>
        </div>

        <div class="sidebar__filter-group">
          <label>Produit</label>
          <select id="select-produit">
            <option value="all">-- Tous les produits --</option>
            ${Object.entries(this.filterOptions.produits).map(([secteur, produits]) => `
              <optgroup label="${secteur.charAt(0).toUpperCase() + secteur.slice(1)}">
                ${produits.map(p => `
                  <option value="${p.id}">${p.icone} ${p.nom}</option>
                `).join('')}
              </optgroup>
            `).join('')}
          </select>
        </div>

        <button class="btn btn-primary btn-block" id="btn-apply-filters">
          Appliquer les filtres
        </button>
        <button class="btn btn-danger btn-block" id="btn-reset-filters">
          Réinitialiser
        </button>

        <div class="active-filters" id="active-filters"></div>
      </div>

      <!-- Charts Section -->
      <div class="sidebar__section" id="charts-section">
        <h3 class="sidebar__section-title">Graphiques</h3>
        <div id="charts-container"></div>
      </div>

      <!-- Comparison Panel -->
      <div id="comparison-panel"></div>
    `;

    this.container.classList.add('sidebar');
  }

  /**
   * Initialize child components
   */
  initChildComponents() {
    // Charts
    this.charts = new Charts('charts-container');
    this.charts.init();

    // Comparison Panel
    this.comparisonPanel = new ComparisonPanel('comparison-panel');
    this.comparisonPanel.init();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const regionSelect = document.getElementById('select-region');
    const deptSelect = document.getElementById('select-dept');
    const secteurSelect = document.getElementById('select-secteur');
    const produitSelect = document.getElementById('select-produit');
    const applyBtn = document.getElementById('btn-apply-filters');
    const resetBtn = document.getElementById('btn-reset-filters');

    if (regionSelect) {
      regionSelect.addEventListener('change', (e) => this.handleRegionChange(e.target.value));
    }

    if (deptSelect) {
      deptSelect.addEventListener('change', (e) => this.handleDeptChange(e.target.value));
    }

    if (secteurSelect) {
      secteurSelect.addEventListener('change', (e) => {
        this.currentSecteur = e.target.value;
        this.updateActiveFilters();
      });
    }

    if (produitSelect) {
      produitSelect.addEventListener('change', (e) => {
        this.currentProduit = e.target.value;
        this.updateActiveFilters();
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyFilters());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  /**
   * Handle region selection change
   */
  handleRegionChange(region) {
    this.currentRegion = region;
    const deptSelect = document.getElementById('select-dept');

    if (region === 'all') {
      deptSelect.disabled = true;
      deptSelect.innerHTML = '<option value="all">-- Tous les départements --</option>';
    } else {
      deptSelect.disabled = false;
      deptSelect.innerHTML = '<option value="all">-- Tous les départements --</option>';

      const depts = this.filterOptions.departementsByRegion[region] || [];
      depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        deptSelect.appendChild(opt);
      });
    }

    this.updateActiveFilters();

    if (this.onRegionChange) {
      this.onRegionChange(region);
    }
  }

  /**
   * Handle department selection change
   */
  handleDeptChange(dept) {
    this.currentDept = dept;
    this.updateActiveFilters();

    if (this.onDepartementChange) {
      this.onDepartementChange(dept);
    }
  }

  /**
   * Apply current filters
   */
  applyFilters() {
    if (this.onFiltersApply) {
      this.onFiltersApply({
        region: this.currentRegion,
        departement: this.currentDept,
        secteur: this.currentSecteur,
        produit: this.currentProduit
      });
    }

    // Update charts with selected product
    if (this.currentProduit !== 'all') {
      this.charts.update(this.currentProduit);
    }
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.currentRegion = 'all';
    this.currentDept = 'all';
    this.currentSecteur = 'all';
    this.currentProduit = 'all';

    document.getElementById('select-region').value = 'all';
    document.getElementById('select-dept').value = 'all';
    document.getElementById('select-dept').disabled = true;
    document.getElementById('select-secteur').value = 'all';
    document.getElementById('select-produit').value = 'all';

    this.updateActiveFilters();
    this.charts.update('cacao');

    if (this.onFiltersReset) {
      this.onFiltersReset();
    }
  }

  /**
   * Update active filters display
   */
  updateActiveFilters() {
    const container = document.getElementById('active-filters');
    if (!container) return;

    const chips = [];

    if (this.currentRegion !== 'all') {
      chips.push(this.createChip('region', `Région: ${this.currentRegion}`));
    }
    if (this.currentDept !== 'all') {
      chips.push(this.createChip('dept', `Dept: ${this.currentDept}`));
    }
    if (this.currentSecteur !== 'all') {
      chips.push(this.createChip('secteur', `Secteur: ${this.currentSecteur}`));
    }
    if (this.currentProduit !== 'all') {
      chips.push(this.createChip('produit', `Produit: ${this.currentProduit}`));
    }

    container.innerHTML = chips.join('');

    // Attach remove handlers
    container.querySelectorAll('.chip .remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        this.clearFilter(type);
      });
    });
  }

  /**
   * Create a filter chip HTML
   */
  createChip(type, label) {
    return `<span class="chip">${label} <span class="remove" data-type="${type}">×</span></span>`;
  }

  /**
   * Clear a specific filter
   */
  clearFilter(type) {
    switch (type) {
      case 'region':
        document.getElementById('select-region').value = 'all';
        this.handleRegionChange('all');
        break;
      case 'dept':
        document.getElementById('select-dept').value = 'all';
        this.handleDeptChange('all');
        break;
      case 'secteur':
        document.getElementById('select-secteur').value = 'all';
        this.currentSecteur = 'all';
        break;
      case 'produit':
        document.getElementById('select-produit').value = 'all';
        this.currentProduit = 'all';
        break;
    }
    this.updateActiveFilters();
  }

  /**
   * Toggle sidebar visibility
   */
  toggle() {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('sidebar--collapsed', !this.isOpen);
    return this.isOpen;
  }

  /**
   * Set region programmatically
   */
  setRegion(region) {
    document.getElementById('select-region').value = region;
    this.handleRegionChange(region);
  }

  /**
   * Set department programmatically
   */
  setDepartement(dept) {
    document.getElementById('select-dept').value = dept;
    this.handleDeptChange(dept);
  }
}

export default Sidebar;
