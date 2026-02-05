/**
 * Main Application
 * Coordinates all components and manages application state
 */

import { api } from './services/api.js';
import Header from './components/Header.js';
import Sidebar from './components/Sidebar.js';
import Map from './components/Map.js';
import Legend from './components/Legend.js';
import Modal from './components/Modal.js';
import Footer from './components/Footer.js';
import KPIDashboard from './components/KPIDashboard.js'; // Import added
import { LoadingOverlay, ErrorMessage } from './components/LoadingOverlay.js';

class App {
  constructor() {
    // Components
    this.header = null;
    this.sidebar = null;
    this.map = null;
    this.legend = null;
    this.modal = null;
    this.footer = null;
    this.kpiDashboard = null; // Added KPI component
    this.loadingOverlay = null;
    this.errorMessage = null;

    // State
    this.currentTheme = 'tous';
    this.currentRegion = 'all';
    this.isSidebarOpen = true;
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log('Initializing Atlas Économique du Cameroun...');

    // Show loading
    this.initLoadingOverlay();
    this.loadingOverlay.show('Chargement de l\'application...');

    try {
      // Check API health
      await api.healthCheck();

      // Initialize all components
      await this.initComponents();

      // Setup event handlers
      this.setupEventHandlers();

      // Hide loading
      this.loadingOverlay.hide();

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Application init error:', error);
      this.loadingOverlay.hide();
      this.showError('Impossible de charger l\'application. Vérifiez que le serveur est démarré.');
    }
  }

  /**
   * Initialize loading overlay first
   */
  initLoadingOverlay() {
    this.loadingOverlay = new LoadingOverlay('loading-overlay');
    this.loadingOverlay.init();

    this.errorMessage = new ErrorMessage('error-message');
    this.errorMessage.init();
    this.errorMessage.onRetry = () => this.retry();
  }

  /**
   * Initialize all components
   */
  async initComponents() {
    // 1. Header (with search)
    this.header = new Header('header');
    this.header.onThemeChange = (theme) => this.handleThemeChange(theme);
    this.header.onMenuToggle = () => this.toggleSidebar();
    this.header.onSearchSelect = (result) => this.handleSearchSelect(result);
    await this.header.init();

    // 2. Sidebar (Filters & Controls)
    this.sidebar = new Sidebar('sidebar');

    // Connect Sidebar events to update KPIs and Map
    this.sidebar.onRegionChange = (regions) => {
      this.handleRegionChange(regions);
      // Update KPIs when region changes
      if (this.kpiDashboard) {
        this.kpiDashboard.update({ regions: regions.length > 0 ? regions : null });
      }
    };

    this.sidebar.onDepartementChange = (depts) => this.handleDeptChange(depts);

    this.sidebar.onFiltersApply = (filters) => {
      this.handleFiltersApply(filters);
      // Update KPIs when detailed filters are applied
      if (this.kpiDashboard) {
        this.kpiDashboard.update(filters);
      }
    };

    this.sidebar.onFiltersReset = () => {
      this.handleFiltersReset();
      // Reset KPIs
      if (this.kpiDashboard) {
        this.kpiDashboard.update({});
      }
    };

    await this.sidebar.init();

    // 3. KPI Dashboard (Now horizontal bar)
    this.kpiDashboard = new KPIDashboard('kpi-container');
    await this.kpiDashboard.init();

    // 4. Map
    this.map = new Map('map');
    this.map.onFeatureClick = (props) => this.handleFeatureClick(props);
    await this.map.init();

    // 5. Legend
    this.legend = new Legend('legend');
    await this.legend.init();

    // 6. Modal
    this.modal = new Modal('modal');
    this.modal.onAddToComparison = (data) => this.handleAddToComparison(data);
    this.modal.init();

    // 7. Footer
    this.footer = new Footer('footer');
    await this.footer.init();

    // Connect comparison panel to modal
    if (this.sidebar.comparisonPanel) {
      this.sidebar.comparisonPanel.onCompare = (data) => {
        this.modal.showComparison(data);
      };
    }
  }

  /**
   * Setup global event handlers
   */
  setupEventHandlers() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape to close modal
      if (e.key === 'Escape') {
        if (this.modal && this.modal.isOpen) {
          this.modal.close();
        }
      }

      // Ctrl+F for search focus
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
  }

  /**
   * Handle theme change
   */
  handleThemeChange(theme) {
    this.currentTheme = theme;

    // Update map
    this.map.setTheme(theme);

    // Update legend
    this.legend.update(theme);

    // Update charts
    if (theme !== 'tous' && this.sidebar.charts) {
      this.sidebar.charts.update(theme);
    }
  }

  /**
   * Handle region change (multiple regions)
   */
  handleRegionChange(regions) {
    this.currentRegion = regions.length > 0 ? regions : 'all';

    if (!regions || regions.length === 0) {
      this.map.displayRegions(this.currentTheme);
    } else {
      this.map.setSelectedRegions(regions);
    }
  }

  /**
   * Handle department change (multiple departments)
   */
  handleDeptChange(depts) {
    if (depts && depts.length > 0) {
      this.map.setSelectedDepts(depts);
    }
  }

  /**
   * Handle filters apply
   */
  handleFiltersApply(filters) {
    // Apply all filters to map
    this.map.applyFilters(filters);

    // Update theme if produit is selected
    if (filters.produit && filters.produit !== 'all') {
      this.currentTheme = filters.produit;
      this.header.setTheme(filters.produit);
      this.legend.update(filters.produit);
    } else if (filters.secteur && filters.secteur !== 'all') {
      // Show secteur-based legend
      this.currentTheme = 'tous';
      this.legend.updateForSecteur(filters.secteur);
    }
  }

  /**
   * Handle filters reset
   */
  handleFiltersReset() {
    this.currentTheme = 'tous';
    this.currentRegion = 'all';

    this.header.setTheme('tous');
    this.map.resetView();
    this.legend.update('tous');
  }

  /**
   * Handle search result selection
   */
  handleSearchSelect(result) {
    if (result.type === 'region') {
      this.sidebar.setRegion(result.nom);
    } else {
      // First set the parent region, then the department
      this.sidebar.setRegion(result.region_parente);
      setTimeout(() => {
        this.sidebar.setDepartement(result.nom);
      }, 100);
    }
  }

  /**
   * Handle feature click on map
   */
  handleFeatureClick(properties) {
    this.modal.show(properties);
  }

  /**
   * Handle add to comparison
   */
  handleAddToComparison(data) {
    if (this.sidebar.comparisonPanel) {
      this.sidebar.comparisonPanel.add({
        nom: data.nom,
        type: data.type
      });
    }
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    this.isSidebarOpen = this.sidebar.toggle();

    // Get all layout containers
    const mapContainer = document.getElementById('map-container');
    const footer = document.getElementById('footer');
    const kpiContainer = document.getElementById('kpi-container');

    if (!this.isSidebarOpen) {
      // Sidebar closed - Expand everything
      if (mapContainer) mapContainer.classList.add('map-container--full');
      if (footer) footer.classList.add('footer--full');
      if (kpiContainer) kpiContainer.classList.add('kpi-container--full');
    } else {
      // Sidebar open - Shrink back
      if (mapContainer) mapContainer.classList.remove('map-container--full');
      if (footer) footer.classList.remove('footer--full');
      if (kpiContainer) kpiContainer.classList.remove('kpi-container--full');
    }

    // Invalidate map size after transition
    setTimeout(() => {
      this.map.invalidateSize();
    }, 350);
  }

  /**
   * Show error message
   */
  showError(message) {
    this.errorMessage.show(message);
  }

  /**
   * Hide error message
   */
  hideError() {
    this.errorMessage.hide();
  }

  /**
   * Retry loading
   */
  async retry() {
    this.hideError();
    await this.init();
  }
}

// Export App class
export default App;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  // Expose app to window for debugging
  window.app = app;
});