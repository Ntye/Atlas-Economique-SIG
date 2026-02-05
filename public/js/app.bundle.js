var App = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/App.js
  var App_exports = {};
  __export(App_exports, {
    default: () => App_default
  });

  // src/services/api.js
  var API_BASE = "http://localhost:3000/api";
  var ApiService = class {
    /**
     * Generic fetch wrapper with error handling
     */
    async fetch(endpoint, options = {}) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: {
            "Content-Type": "application/json",
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
      return this.fetch("/regions");
    }
    async getDepartements(region = null) {
      const query = region ? `?region=${encodeURIComponent(region)}` : "";
      return this.fetch(`/departements${query}`);
    }
    // =====================
    // FILTER ENDPOINTS
    // =====================
    async getFilters() {
      return this.fetch("/filters");
    }
    // =====================
    // KPI ENDPOINTS
    // =====================
    async getKPIs(filters = {}) {
      const params = new URLSearchParams();
      if (filters.region) params.append("region", filters.region);
      if (filters.secteur) params.append("secteur", filters.secteur);
      if (filters.produit) params.append("produit", filters.produit);
      const query = params.toString() ? `?${params.toString()}` : "";
      return this.fetch(`/kpis${query}`);
    }
    // =====================
    // CHART ENDPOINTS
    // =====================
    async getTop10Producers(produit = "cacao") {
      return this.fetch(`/charts/top10/${produit}`);
    }
    async getProductionByRegion(secteur = "agriculture") {
      return this.fetch(`/charts/byregion/${secteur}`);
    }
    async getProductDistribution(region = null) {
      const query = region ? `?region=${encodeURIComponent(region)}` : "";
      return this.fetch(`/charts/distribution${query}`);
    }
    async getHistoricalData(secteur = "all") {
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
    async getLegend(theme = "tous") {
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
      return this.fetch("/header");
    }
    async getFooter() {
      return this.fetch("/footer");
    }
    async getMessages() {
      return this.fetch("/messages");
    }
    // =====================
    // COMPARISON ENDPOINT
    // =====================
    async compare(ids, type = "departement") {
      return this.fetch("/compare", {
        method: "POST",
        body: JSON.stringify({ ids, type })
      });
    }
    // =====================
    // HEALTH CHECK
    // =====================
    async healthCheck() {
      return this.fetch("/health");
    }
  };
  var api = new ApiService();

  // src/utils/helpers.js
  function formatNumber(num) {
    if (num === void 0 || num === null) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + " Mrd";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + " M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + " K";
    return num.toString();
  }
  function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function getProductionColor(theme, value) {
    const colorScales = {
      cacao: [
        { max: 0, color: "#ccc", opacity: 0.3 },
        { max: 5e4, color: "#A1887F", opacity: 0.7 },
        { max: 1e5, color: "#795548", opacity: 0.7 },
        { max: Infinity, color: "#4E342E", opacity: 0.8 }
      ],
      bovins: [
        { max: 0, color: "#ccc", opacity: 0.3 },
        { max: 1e5, color: "#FFB74D", opacity: 0.7 },
        { max: 5e5, color: "#FF9800", opacity: 0.7 },
        { max: Infinity, color: "#E65100", opacity: 0.8 }
      ],
      coton: [
        { max: 0, color: "#ccc", opacity: 0.3 },
        { max: 1e5, color: "#90CAF9", opacity: 0.7 },
        { max: 2e5, color: "#42A5F5", opacity: 0.7 },
        { max: Infinity, color: "#1565C0", opacity: 0.8 }
      ],
      cafe: [
        { max: 0, color: "#ccc", opacity: 0.3 },
        { max: 1e4, color: "#8D6E63", opacity: 0.7 },
        { max: 3e4, color: "#6D4C41", opacity: 0.7 },
        { max: Infinity, color: "#4E342E", opacity: 0.8 }
      ],
      peche: [
        { max: 0, color: "#ccc", opacity: 0.3 },
        { max: 5e4, color: "#B3E5FC", opacity: 0.7 },
        { max: 1e5, color: "#4FC3F7", opacity: 0.7 },
        { max: Infinity, color: "#0288D1", opacity: 0.8 }
      ],
      default: [
        { max: 0, color: "#ccc", opacity: 0.3 },
        { max: 5e4, color: "#81C784", opacity: 0.7 },
        { max: 1e5, color: "#4CAF50", opacity: 0.7 },
        { max: Infinity, color: "#1B5E20", opacity: 0.8 }
      ]
    };
    const scale = colorScales[theme] || colorScales.default;
    for (const level of scale) {
      if (value <= level.max) {
        return { fillColor: level.color, fillOpacity: level.opacity };
      }
    }
    return { fillColor: "#ccc", fillOpacity: 0.3 };
  }

  // src/components/Search.js
  var Search = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.results = [];
      this.isResultsVisible = false;
      this.onSelect = null;
      this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
    }
    /**
     * Initialize the search component
     */
    init() {
      this.render();
      this.attachEventListeners();
    }
    /**
     * Render the search HTML
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <div class="search">
        <input
          type="text"
          id="search-input"
          class="search__input"
          placeholder="Rechercher une r\xE9gion ou d\xE9partement..."
          autocomplete="off"
        >
        <div id="search-results" class="search__results"></div>
      </div>
    `;
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      const input = document.getElementById("search-input");
      const resultsContainer = document.getElementById("search-results");
      if (input) {
        input.addEventListener("input", (e) => {
          this.debouncedSearch(e.target.value);
        });
        input.addEventListener("focus", () => {
          if (this.results.length > 0) {
            this.showResults();
          }
        });
        input.addEventListener("blur", () => {
          setTimeout(() => this.hideResults(), 200);
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            this.hideResults();
          }
        });
      }
    }
    /**
     * Perform search API call
     */
    async performSearch(query) {
      if (!query || query.length < 2) {
        this.hideResults();
        return;
      }
      try {
        const data = await api.search(query);
        this.results = data.results || [];
        this.renderResults(query);
      } catch (error) {
        console.error("Search error:", error);
        this.renderError();
      }
    }
    /**
     * Render search results
     */
    renderResults(query) {
      const container = document.getElementById("search-results");
      if (!container) return;
      if (this.results.length === 0) {
        container.innerHTML = `
        <div class="search__no-results">
          Aucun r\xE9sultat trouv\xE9 pour "${query}"
        </div>
      `;
      } else {
        container.innerHTML = this.results.map((result, index) => `
        <div class="search__result-item" data-index="${index}">
          <span class="search__result-badge">
            ${result.type === "region" ? "R\xE9gion" : "Dept"}
          </span>
          <span class="search__result-name">
            ${highlightMatch(result.nom, query)}
          </span>
          ${result.region_parente ? `
            <small class="search__result-parent">(${result.region_parente})</small>
          ` : ""}
        </div>
      `).join("");
        container.querySelectorAll(".search__result-item").forEach((item) => {
          item.addEventListener("click", () => {
            const index = parseInt(item.dataset.index);
            this.selectResult(this.results[index]);
          });
        });
      }
      this.showResults();
    }
    /**
     * Render error state
     */
    renderError() {
      const container = document.getElementById("search-results");
      if (!container) return;
      container.innerHTML = `
      <div class="search__no-results">
        Erreur lors de la recherche
      </div>
    `;
      this.showResults();
    }
    /**
     * Select a search result
     */
    selectResult(result) {
      const input = document.getElementById("search-input");
      if (input) {
        input.value = result.nom;
      }
      this.hideResults();
      if (this.onSelect) {
        this.onSelect(result);
      }
    }
    /**
     * Show results dropdown
     */
    showResults() {
      const container = document.getElementById("search-results");
      if (container) {
        container.classList.add("search__results--active");
        this.isResultsVisible = true;
      }
    }
    /**
     * Hide results dropdown
     */
    hideResults() {
      const container = document.getElementById("search-results");
      if (container) {
        container.classList.remove("search__results--active");
        this.isResultsVisible = false;
      }
    }
    /**
     * Clear search input
     */
    clear() {
      const input = document.getElementById("search-input");
      if (input) {
        input.value = "";
      }
      this.results = [];
      this.hideResults();
    }
  };
  var Search_default = Search;

  // src/components/Header.js
  var Header = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.data = null;
      this.search = null;
      this.onThemeChange = null;
      this.onMenuToggle = null;
      this.onSearchSelect = null;
    }
    /**
     * Initialize the header component
     */
    async init() {
      try {
        this.data = await api.getHeader();
        this.render();
        this.attachEventListeners();
      } catch (error) {
        console.error("Header init error:", error);
        this.renderFallback();
      }
    }
    /**
     * Render the header HTML
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <div class="header__logo">
        <button class="header__menu-btn" id="menu-toggle">&#9776;</button>
        <div>
          <h1 class="header__title">${this.data.titre}</h1>
          <div class="header__tagline">${this.data.sousTitre}</div>
        </div>
      </div>
      <div class="header__search" id="header-search-container"></div>
      <div class="header__controls">
        <select class="header__select" id="theme-selector">
          ${this.data.themes.map((t) => `
            <option value="${t.id}">${t.label}</option>
          `).join("")}
        </select>
        <button class="header__button" id="help-btn">? Aide</button>
      </div>
    `;
      this.container.classList.add("header");
      this.search = new Search_default("header-search-container");
      this.search.onSelect = (result) => {
        if (this.onSearchSelect) {
          this.onSearchSelect(result);
        }
      };
      this.search.init();
    }
    /**
     * Render fallback if data fails to load
     */
    renderFallback() {
      if (!this.container) return;
      this.container.innerHTML = `
      <div class="header__logo">
        <button class="header__menu-btn" id="menu-toggle">&#9776;</button>
        <div>
          <h1 class="header__title">Atlas \xC9conomique du Cameroun</h1>
          <div class="header__tagline">Visualisation des productions</div>
        </div>
      </div>
      <div class="header__search" id="header-search-container"></div>
      <div class="header__controls">
        <select class="header__select" id="theme-selector">
          <option value="tous">Vue Administrative</option>
          <option value="cacao">Cacao</option>
          <option value="bovins">Bovins</option>
        </select>
      </div>
    `;
      this.container.classList.add("header");
      this.search = new Search_default("header-search-container");
      this.search.onSelect = (result) => {
        if (this.onSearchSelect) {
          this.onSearchSelect(result);
        }
      };
      this.search.init();
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      const themeSelector = document.getElementById("theme-selector");
      const menuToggle = document.getElementById("menu-toggle");
      const helpBtn = document.getElementById("help-btn");
      if (themeSelector) {
        themeSelector.addEventListener("change", (e) => {
          if (this.onThemeChange) {
            this.onThemeChange(e.target.value);
          }
        });
      }
      if (menuToggle) {
        menuToggle.addEventListener("click", () => {
          if (this.onMenuToggle) {
            this.onMenuToggle();
          }
        });
      }
      if (helpBtn) {
        helpBtn.addEventListener("click", () => this.showHelp());
      }
    }
    /**
     * Show help dialog
     */
    showHelp() {
      alert(`${this.data?.titre || "Atlas \xC9conomique du Cameroun"}

\u2022 Utilisez les filtres pour explorer les donn\xE9es
\u2022 Cliquez sur une r\xE9gion/d\xE9partement pour voir les d\xE9tails
\u2022 Changez de th\xE8me pour visualiser diff\xE9rentes productions
\u2022 Utilisez la recherche pour trouver rapidement un lieu`);
    }
    /**
     * Set the current theme value in the selector
     */
    setTheme(theme) {
      const selector = document.getElementById("theme-selector");
      if (selector) {
        selector.value = theme;
      }
    }
    /**
     * Get available themes
     */
    getThemes() {
      return this.data?.themes || [];
    }
  };
  var Header_default = Header;

  // src/components/Charts.js
  var Charts = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.chartTop10 = null;
      this.chartPie = null;
      this.currentProduit = "cacao";
      this.colors = [
        "#3498db",
        "#2ecc71",
        "#e74c3c",
        "#f39c12",
        "#9b59b6",
        "#1abc9c",
        "#e67e22",
        "#34495e",
        "#16a085",
        "#c0392b"
      ];
    }
    /**
     * Initialize charts
     */
    async init() {
      this.render();
      await this.loadData();
    }
    /**
     * Render chart containers
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <div class="chart-container">
        <h4 class="chart-container__title">Top Producteurs</h4>
        <canvas id="chart-top10" class="chart-container__canvas"></canvas>
      </div>
      <div class="chart-container">
        <h4 class="chart-container__title">R\xE9partition par R\xE9gion</h4>
        <canvas id="chart-pie" class="chart-container__canvas"></canvas>
      </div>
    `;
    }
    /**
     * Load chart data
     */
    async loadData(produit = "cacao") {
      this.currentProduit = produit;
      try {
        const [top10Data, pieData] = await Promise.all([
          api.getTop10Producers(produit),
          api.getProductionByRegion("agriculture")
        ]);
        this.renderTop10Chart(top10Data);
        this.renderPieChart(pieData);
      } catch (error) {
        console.error("Charts load error:", error);
      }
    }
    /**
     * Update charts with new product
     */
    async update(produit) {
      await this.loadData(produit);
    }
    /**
     * Render Top 10 bar chart
     */
    renderTop10Chart(data) {
      const ctx = document.getElementById("chart-top10");
      if (!ctx) return;
      if (this.chartTop10) {
        this.chartTop10.destroy();
      }
      this.chartTop10 = new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: {
          labels: data.data.map((d) => d.nom),
          datasets: [{
            label: data.produit,
            data: data.data.map((d) => d.valeur),
            backgroundColor: "#3498db",
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => formatNumber(context.raw)
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: (value) => formatNumber(value)
              }
            }
          }
        }
      });
    }
    /**
     * Render pie/donut chart
     */
    renderPieChart(data) {
      const ctx = document.getElementById("chart-pie");
      if (!ctx) return;
      if (this.chartPie) {
        this.chartPie.destroy();
      }
      const chartData = data.data.slice(0, 8);
      this.chartPie = new Chart(ctx.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: chartData.map((d) => d.nom),
          datasets: [{
            data: chartData.map((d) => d.valeur),
            backgroundColor: this.colors
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 12,
                font: { size: 10 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = formatNumber(context.raw);
                  const percentage = context.parsed;
                  return `${context.label}: ${value}`;
                }
              }
            }
          }
        }
      });
    }
    /**
     * Refresh charts
     */
    async refresh() {
      await this.loadData(this.currentProduit);
    }
    /**
     * Destroy charts
     */
    destroy() {
      if (this.chartTop10) {
        this.chartTop10.destroy();
        this.chartTop10 = null;
      }
      if (this.chartPie) {
        this.chartPie.destroy();
        this.chartPie = null;
      }
    }
  };
  var Charts_default = Charts;

  // src/components/ComparisonPanel.js
  var ComparisonPanel = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.items = [];
      this.maxItems = 4;
      this.onCompare = null;
    }
    /**
     * Initialize the comparison panel
     */
    init() {
      this.render();
      this.attachEventListeners();
    }
    /**
     * Render the comparison panel
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <h3 class="comparison-panel__title">\u{1F4CB} Comparaison</h3>
      <div class="comparison-panel__selection" id="comparison-selection"></div>
      <div class="comparison-panel__actions">
        <button class="btn btn-primary btn-sm" id="btn-compare">Comparer</button>
        <button class="btn btn-danger btn-sm" id="btn-clear-comparison">Effacer</button>
      </div>
    `;
      this.container.classList.add("comparison-panel");
      this.updateVisibility();
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      const compareBtn = document.getElementById("btn-compare");
      const clearBtn = document.getElementById("btn-clear-comparison");
      if (compareBtn) {
        compareBtn.addEventListener("click", () => this.compare());
      }
      if (clearBtn) {
        clearBtn.addEventListener("click", () => this.clear());
      }
    }
    /**
     * Add an item to comparison
     */
    add(item) {
      const exists = this.items.find((i) => i.nom === item.nom);
      if (exists) return false;
      if (this.items.length >= this.maxItems) {
        alert(`Maximum ${this.maxItems} \xE9l\xE9ments pour la comparaison`);
        return false;
      }
      this.items.push({
        nom: item.nom,
        type: item.type || item.type_admin
      });
      this.renderItems();
      this.updateVisibility();
      return true;
    }
    /**
     * Remove an item from comparison
     */
    remove(index) {
      this.items.splice(index, 1);
      this.renderItems();
      this.updateVisibility();
    }
    /**
     * Clear all items
     */
    clear() {
      this.items = [];
      this.renderItems();
      this.updateVisibility();
    }
    /**
     * Render comparison items
     */
    renderItems() {
      const selectionEl = document.getElementById("comparison-selection");
      if (!selectionEl) return;
      selectionEl.innerHTML = this.items.map((item, index) => `
      <div class="comparison-panel__item">
        <input type="checkbox" checked disabled>
        <span>${item.nom}</span>
        <span class="remove" data-index="${index}">\xD7</span>
      </div>
    `).join("");
      selectionEl.querySelectorAll(".remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const index = parseInt(e.target.dataset.index);
          this.remove(index);
        });
      });
    }
    /**
     * Update panel visibility
     */
    updateVisibility() {
      if (this.items.length > 0) {
        this.container.classList.add("comparison-panel--active");
      } else {
        this.container.classList.remove("comparison-panel--active");
      }
    }
    /**
     * Perform comparison
     */
    async compare() {
      if (this.items.length < 2) {
        alert("S\xE9lectionnez au moins 2 \xE9l\xE9ments \xE0 comparer");
        return;
      }
      try {
        const ids = this.items.map((i) => i.nom);
        const type = this.items[0].type === "region" ? "region" : "departement";
        const data = await api.compare(ids, type);
        if (this.onCompare) {
          this.onCompare(data);
        }
      } catch (error) {
        console.error("Comparison error:", error);
        alert("Erreur lors de la comparaison");
      }
    }
    /**
     * Get current items
     */
    getItems() {
      return this.items;
    }
    /**
     * Check if an item is in comparison
     */
    hasItem(nom) {
      return this.items.some((i) => i.nom === nom);
    }
  };
  var ComparisonPanel_default = ComparisonPanel;

  // src/components/Sidebar.js
  var Sidebar = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.filterOptions = null;
      this.isOpen = true;
      this.charts = null;
      this.comparisonPanel = null;
      this.onRegionChange = null;
      this.onDepartementChange = null;
      this.onFiltersApply = null;
      this.onFiltersReset = null;
      this.currentRegion = "all";
      this.currentDept = "all";
      this.currentSecteur = "all";
      this.currentProduit = "all";
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
        console.error("Sidebar init error:", error);
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
          <label>R\xE9gion</label>
          <select id="select-region">
            <option value="all">-- Toutes les r\xE9gions --</option>
            ${this.filterOptions.regions.map((r) => `
              <option value="${r.id}">${r.label}</option>
            `).join("")}
          </select>
        </div>
        
        <div class="sidebar__filter-group">
          <label>Secteur d'activit\xE9</label>
          <select id="select-secteur">
            <option value="all">-- Tous les secteurs --</option>
            ${this.filterOptions.secteurs.map((s) => `
              <option value="${s.id}">${s.icone} ${s.label}</option>
            `).join("")}
          </select>
        </div>

        <div class="sidebar__filter-group">
          <label>D\xE9partement</label>
          <select id="select-dept" disabled>
            <option value="all">-- Tous les d\xE9partements --</option>
          </select>
        </div>

        <div class="sidebar__filter-group">
          <label>Produit</label>
          <select id="select-produit">
            <option value="all">-- Tous les produits --</option>
            ${Object.entries(this.filterOptions.produits).map(([secteur, produits]) => `
              <optgroup label="${secteur.charAt(0).toUpperCase() + secteur.slice(1)}">
                ${produits.map((p) => `
                  <option value="${p.id}">${p.icone} ${p.nom}</option>
                `).join("")}
              </optgroup>
            `).join("")}
          </select>
        </div>

        <button class="btn btn-primary btn-block" id="btn-apply-filters">
          Appliquer les filtres
        </button>
        <button class="btn btn-danger btn-block" id="btn-reset-filters">
          R\xE9initialiser
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
      this.container.classList.add("sidebar");
    }
    /**
     * Initialize child components
     */
    initChildComponents() {
      this.charts = new Charts_default("charts-container");
      this.charts.init();
      this.comparisonPanel = new ComparisonPanel_default("comparison-panel");
      this.comparisonPanel.init();
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      const regionSelect = document.getElementById("select-region");
      const deptSelect = document.getElementById("select-dept");
      const secteurSelect = document.getElementById("select-secteur");
      const produitSelect = document.getElementById("select-produit");
      const applyBtn = document.getElementById("btn-apply-filters");
      const resetBtn = document.getElementById("btn-reset-filters");
      if (regionSelect) {
        regionSelect.addEventListener("change", (e) => this.handleRegionChange(e.target.value));
      }
      if (deptSelect) {
        deptSelect.addEventListener("change", (e) => this.handleDeptChange(e.target.value));
      }
      if (secteurSelect) {
        secteurSelect.addEventListener("change", (e) => {
          this.currentSecteur = e.target.value;
          this.updateActiveFilters();
        });
      }
      if (produitSelect) {
        produitSelect.addEventListener("change", (e) => {
          this.currentProduit = e.target.value;
          this.updateActiveFilters();
        });
      }
      if (applyBtn) {
        applyBtn.addEventListener("click", () => this.applyFilters());
      }
      if (resetBtn) {
        resetBtn.addEventListener("click", () => this.resetFilters());
      }
    }
    /**
     * Handle region selection change
     */
    handleRegionChange(region) {
      this.currentRegion = region;
      const deptSelect = document.getElementById("select-dept");
      if (region === "all") {
        deptSelect.disabled = true;
        deptSelect.innerHTML = '<option value="all">-- Tous les d\xE9partements --</option>';
      } else {
        deptSelect.disabled = false;
        deptSelect.innerHTML = '<option value="all">-- Tous les d\xE9partements --</option>';
        const depts = this.filterOptions.departementsByRegion[region] || [];
        depts.forEach((d) => {
          const opt = document.createElement("option");
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
      if (this.currentProduit !== "all") {
        this.charts.update(this.currentProduit);
      }
    }
    /**
     * Reset all filters
     */
    resetFilters() {
      this.currentRegion = "all";
      this.currentDept = "all";
      this.currentSecteur = "all";
      this.currentProduit = "all";
      document.getElementById("select-region").value = "all";
      document.getElementById("select-dept").value = "all";
      document.getElementById("select-dept").disabled = true;
      document.getElementById("select-secteur").value = "all";
      document.getElementById("select-produit").value = "all";
      this.updateActiveFilters();
      this.charts.update("cacao");
      if (this.onFiltersReset) {
        this.onFiltersReset();
      }
    }
    /**
     * Update active filters display
     */
    updateActiveFilters() {
      const container = document.getElementById("active-filters");
      if (!container) return;
      const chips = [];
      if (this.currentRegion !== "all") {
        chips.push(this.createChip("region", `R\xE9gion: ${this.currentRegion}`));
      }
      if (this.currentDept !== "all") {
        chips.push(this.createChip("dept", `Dept: ${this.currentDept}`));
      }
      if (this.currentSecteur !== "all") {
        chips.push(this.createChip("secteur", `Secteur: ${this.currentSecteur}`));
      }
      if (this.currentProduit !== "all") {
        chips.push(this.createChip("produit", `Produit: ${this.currentProduit}`));
      }
      container.innerHTML = chips.join("");
      container.querySelectorAll(".chip .remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const type = e.target.dataset.type;
          this.clearFilter(type);
        });
      });
    }
    /**
     * Create a filter chip HTML
     */
    createChip(type, label) {
      return `<span class="chip">${label} <span class="remove" data-type="${type}">\xD7</span></span>`;
    }
    /**
     * Clear a specific filter
     */
    clearFilter(type) {
      switch (type) {
        case "region":
          document.getElementById("select-region").value = "all";
          this.handleRegionChange("all");
          break;
        case "dept":
          document.getElementById("select-dept").value = "all";
          this.handleDeptChange("all");
          break;
        case "secteur":
          document.getElementById("select-secteur").value = "all";
          this.currentSecteur = "all";
          break;
        case "produit":
          document.getElementById("select-produit").value = "all";
          this.currentProduit = "all";
          break;
      }
      this.updateActiveFilters();
    }
    /**
     * Toggle sidebar visibility
     */
    toggle() {
      this.isOpen = !this.isOpen;
      this.container.classList.toggle("sidebar--collapsed", !this.isOpen);
      return this.isOpen;
    }
    /**
     * Set region programmatically
     */
    setRegion(region) {
      document.getElementById("select-region").value = region;
      this.handleRegionChange(region);
    }
    /**
     * Set department programmatically
     */
    setDepartement(dept) {
      document.getElementById("select-dept").value = dept;
      this.handleDeptChange(dept);
    }
  };
  var Sidebar_default = Sidebar;

  // src/components/Map.js
  var Map = class {
    constructor(containerId) {
      this.containerId = containerId;
      this.map = null;
      this.layerRegions = null;
      this.layerDepts = null;
      this.dataRegions = null;
      this.dataDepts = null;
      this.currentTheme = "tous";
      this.currentRegion = null;
      this.currentSecteur = "all";
      this.selectedRegions = [];
      this.selectedDepts = [];
      this.secteurColors = {
        agriculture: "#4CAF50",
        elevage: "#FF9800",
        peche: "#2196F3"
      };
      this.onFeatureClick = null;
      this.onFeatureHover = null;
      this.config = {
        center: [7.3697, 12.3547],
        zoom: 6,
        minZoom: 5,
        maxZoom: 12
      };
    }
    /**
     * Initialize the map
     */
    async init() {
      this.createMap();
      await this.loadData();
      this.displayRegions();
    }
    /**
     * Create the Leaflet map instance
     */
    createMap() {
      this.map = L.map(this.containerId, {
        center: this.config.center,
        zoom: this.config.zoom
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(this.map);
    }
    /**
     * Load map data from API
     */
    async loadData() {
      try {
        const [regions, depts] = await Promise.all([
          api.getRegions(),
          api.getDepartements()
        ]);
        this.dataRegions = regions;
        this.dataDepts = depts;
      } catch (error) {
        console.error("Map data load error:", error);
        throw error;
      }
    }
    /**
     * Get style for a feature based on theme and secteur
     */
    /**
     * Get style for a feature based on theme and secteur
     */
    getStyle(feature, theme) {
      const prod = feature.properties.production || {};
      const featureName = feature.properties.nom;
      let fillColor = "#2ecc71";
      let fillOpacity = 0.15;
      let weight = 1;
      let borderColor = "#27ae60";
      const isSelectedRegion = this.selectedRegions.includes(featureName);
      const isSelectedDept = this.selectedDepts.includes(featureName);
      const isSelected = isSelectedRegion || isSelectedDept;
      if (theme === "tous") {
        if (this.currentSecteur !== "all") {
          const secteurPrincipal = prod.secteur_principal;
          if (secteurPrincipal === this.currentSecteur) {
            fillColor = this.secteurColors[this.currentSecteur] || "#ccc";
            fillOpacity = isSelected ? 0.9 : 0.6;
          } else {
            fillColor = "#e0e0e0";
            fillOpacity = isSelected ? 0.5 : 0.2;
            borderColor = "white";
          }
        } else {
          fillColor = "#2ecc71";
          fillOpacity = isSelected ? 0.6 : 0.2;
          borderColor = isSelected ? "#333" : "#27ae60";
        }
      } else if (prod[theme] && prod[theme] > 0) {
        const colorInfo = getProductionColor(theme, prod[theme]);
        fillColor = colorInfo.fillColor;
        fillOpacity = isSelected ? 0.9 : colorInfo.fillOpacity;
        borderColor = "white";
      }
      if (isSelected) {
        weight = 2.5;
        borderColor = "#2c3e50";
      }
      return {
        fillColor,
        fillOpacity,
        weight,
        color: borderColor,
        opacity: 0.8
        // Border opacity
      };
    }
    // getStyle(feature, theme) {
    //   const prod = feature.properties.production || {};
    //   const featureName = feature.properties.nom;
    //   let fillColor = '#ccc';
    //   let fillOpacity = 0.3;
    //   let weight = 1;
    //   let borderColor = 'white';
    //
    //   // Check if this feature is selected
    //   const isSelectedRegion = this.selectedRegions.includes(featureName);
    //   const isSelectedDept = this.selectedDepts.includes(featureName);
    //   const isSelected = isSelectedRegion || isSelectedDept;
    //
    //   if (theme === 'tous') {
    //     // If a secteur is selected, color by secteur
    //     if (this.currentSecteur !== 'all') {
    //       const secteurPrincipal = prod.secteur_principal;
    //       if (secteurPrincipal === this.currentSecteur) {
    //         fillColor = this.secteurColors[this.currentSecteur] || '#ccc';
    //         fillOpacity = isSelected ? 0.9 : 0.6;
    //       } else {
    //         fillColor = '#e0e0e0';
    //         fillOpacity = isSelected ? 0.5 : 0.2;
    //       }
    //     } else {
    //       const isRegion = feature.properties.type_admin !== 'departement';
    //       fillColor = isRegion ? '#2ecc71' : '#95a5a6';
    //       fillOpacity = 0.5;
    //     }
    //   } else if (prod[theme] && prod[theme] > 0) {
    //     const colorInfo = getProductionColor(theme, prod[theme]);
    //     fillColor = colorInfo.fillColor;
    //     fillOpacity = isSelected ? 0.9 : colorInfo.fillOpacity;
    //   }
    //
    //   // Highlight selected features
    //   if (isSelected) {
    //     weight = 3;
    //     borderColor = '#333';
    //   }
    //
    //   return {
    //     fillColor,
    //     fillOpacity,
    //     weight,
    //     color: borderColor,
    //     opacity: 1
    //   };
    // }
    /**
     * Create popup content for a feature
     */
    createPopupContent(properties) {
      let content = `<b>${properties.nom}</b><br>`;
      content += `<small>${properties.type_admin === "departement" ? "D\xE9partement" : "R\xE9gion"}</small><br>`;
      if (properties.production) {
        const prods = Object.entries(properties.production).filter(([k, v]) => typeof v === "number" && v > 0 && k !== "valeur_economique").slice(0, 5);
        if (prods.length > 0) {
          content += '<hr style="margin: 5px 0;">';
          prods.forEach(([k, v]) => {
            content += `${k}: ${formatNumber(v)}<br>`;
          });
        }
      }
      return content;
    }
    /**
     * Setup feature interactions
     */
    onEachFeature(feature, layer) {
      layer.bindPopup(this.createPopupContent(feature.properties));
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({ weight: 3, color: "#666" });
          if (this.onFeatureHover) {
            this.onFeatureHover(feature.properties, "enter");
          }
        },
        mouseout: (e) => {
          if (this.layerRegions) {
            this.layerRegions.resetStyle(e.target);
          }
          if (this.layerDepts) {
            this.layerDepts.resetStyle(e.target);
          }
          if (this.onFeatureHover) {
            this.onFeatureHover(feature.properties, "leave");
          }
        },
        click: (e) => {
          if (this.onFeatureClick) {
            this.onFeatureClick(feature.properties);
          }
        }
      });
    }
    /**
     * Display regions layer
     */
    displayRegions(theme = null) {
      const t = theme || this.currentTheme;
      if (this.layerDepts) {
        this.map.removeLayer(this.layerDepts);
        this.layerDepts = null;
      }
      if (this.layerRegions) {
        this.map.removeLayer(this.layerRegions);
      }
      this.layerRegions = L.geoJSON(this.dataRegions, {
        style: (f) => this.getStyle(f, t),
        onEachFeature: (f, l) => this.onEachFeature(f, l)
      }).addTo(this.map);
      this.currentRegion = null;
    }
    /**
     * Display departments layer for a specific region
     */
    displayDepartements(region = null, theme = null) {
      const t = theme || this.currentTheme;
      if (this.layerRegions) {
        this.map.removeLayer(this.layerRegions);
        this.layerRegions = null;
      }
      if (this.layerDepts) {
        this.map.removeLayer(this.layerDepts);
      }
      let features = this.dataDepts.features;
      if (region) {
        features = features.filter((f) => f.properties.region_parente === region);
      }
      this.layerDepts = L.geoJSON({ type: "FeatureCollection", features }, {
        style: (f) => this.getStyle(f, t),
        onEachFeature: (f, l) => this.onEachFeature(f, l)
      }).addTo(this.map);
      this.currentRegion = region;
    }
    /**
     * Change the display theme
     */
    setTheme(theme) {
      this.currentTheme = theme;
      if (this.currentRegion) {
        this.displayDepartements(this.currentRegion, theme);
      } else {
        this.displayRegions(theme);
      }
    }
    /**
     * Set the current secteur for coloring
     */
    setSecteur(secteur) {
      this.currentSecteur = secteur;
      this.refreshLayers();
    }
    /**
     * Set selected regions (for multi-select)
     */
    setSelectedRegions(regions) {
      this.selectedRegions = regions || [];
      if (regions.length > 0) {
        this.displayDepartementsForRegions(regions);
      } else {
        this.displayRegions();
      }
    }
    /**
     * Set selected departments (for multi-select)
     */
    setSelectedDepts(depts) {
      this.selectedDepts = depts || [];
      this.refreshLayers();
      if (depts.length > 0) {
        this.zoomToSelectedDepts();
      }
    }
    /**
     * Display departments for multiple selected regions
     */
    displayDepartementsForRegions(regions) {
      const t = this.currentTheme;
      if (this.layerRegions) {
        this.map.removeLayer(this.layerRegions);
        this.layerRegions = null;
      }
      if (this.layerDepts) {
        this.map.removeLayer(this.layerDepts);
      }
      let features = this.dataDepts.features.filter(
        (f) => regions.includes(f.properties.region_parente)
      );
      this.layerDepts = L.geoJSON({ type: "FeatureCollection", features }, {
        style: (f) => this.getStyle(f, t),
        onEachFeature: (f, l) => this.onEachFeature(f, l)
      }).addTo(this.map);
      if (this.layerDepts.getBounds().isValid()) {
        this.map.fitBounds(this.layerDepts.getBounds(), { padding: [20, 20] });
      }
      this.currentRegion = regions.length === 1 ? regions[0] : null;
    }
    /**
     * Zoom to fit all selected departments
     */
    zoomToSelectedDepts() {
      if (!this.layerDepts || this.selectedDepts.length === 0) return;
      const bounds = L.latLngBounds();
      this.layerDepts.eachLayer((layer) => {
        if (this.selectedDepts.includes(layer.feature.properties.nom)) {
          bounds.extend(layer.getBounds());
        }
      });
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
    /**
     * Refresh all layers with current styles
     */
    refreshLayers() {
      if (this.layerRegions) {
        this.layerRegions.eachLayer((layer) => {
          layer.setStyle(this.getStyle(layer.feature, this.currentTheme));
        });
      }
      if (this.layerDepts) {
        this.layerDepts.eachLayer((layer) => {
          layer.setStyle(this.getStyle(layer.feature, this.currentTheme));
        });
      }
    }
    /**
     * Apply filters from sidebar
     */
    applyFilters(filters) {
      const { secteur, regions, departements, produit } = filters;
      this.currentSecteur = secteur || "all";
      if (produit && produit !== "all") {
        this.currentTheme = produit;
      } else {
        this.currentTheme = "tous";
      }
      this.selectedRegions = regions || [];
      this.selectedDepts = departements || [];
      if (regions && regions.length > 0) {
        this.displayDepartementsForRegions(regions);
      } else if (secteur && secteur !== "all") {
        this.displayRegions();
      } else {
        this.resetView();
        return;
      }
      if (departements && departements.length > 0) {
        this.zoomToSelectedDepts();
      }
      this.refreshLayers();
    }
    /**
     * Zoom to a region
     */
    zoomToRegion(regionName) {
      const feature = this.dataRegions.features.find(
        (f) => f.properties.nom === regionName
      );
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        this.map.fitBounds(bounds);
      }
    }
    /**
     * Zoom to a department
     */
    zoomToDepartement(deptName) {
      if (!this.layerDepts) return;
      this.layerDepts.eachLayer((layer) => {
        if (layer.feature.properties.nom === deptName) {
          layer.setStyle({
            color: "#0044ff",
            weight: 4,
            opacity: 1
          });
          layer.bringToFront();
          this.map.fitBounds(layer.getBounds());
          layer.openPopup();
        } else {
          this.layerDepts.resetStyle(layer);
        }
      });
    }
    /**
     * Reset view to initial state
     */
    resetView() {
      this.map.setView(this.config.center, this.config.zoom);
      this.displayRegions("tous");
      this.currentTheme = "tous";
    }
    /**
     * Get the map instance
     */
    getMap() {
      return this.map;
    }
    /**
     * Get regions data
     */
    getRegionsData() {
      return this.dataRegions;
    }
    /**
     * Get departments data
     */
    getDepartementsData() {
      return this.dataDepts;
    }
    /**
     * Invalidate map size (call after container resize)
     */
    invalidateSize() {
      if (this.map) {
        this.map.invalidateSize();
      }
    }
  };
  var Map_default = Map;

  // src/components/Legend.js
  var Legend = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.data = null;
      this.isVisible = true;
      this.currentTheme = "tous";
    }
    /**
     * Initialize the legend
     */
    async init() {
      this.render();
      await this.loadData("tous");
    }
    /**
     * Render the legend container
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <button class="legend__toggle" id="legend-toggle">\u{1F441}</button>
      <h4 class="legend__title" id="legend-title">L\xE9gende</h4>
      <div class="legend__content" id="legend-content"></div>
    `;
      this.container.classList.add("legend");
      this.attachEventListeners();
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      const toggleBtn = document.getElementById("legend-toggle");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => this.toggle());
      }
    }
    /**
     * Load legend data for a theme
     */
    async loadData(theme) {
      try {
        this.currentTheme = theme;
        this.data = await api.getLegend(theme);
        this.renderContent();
      } catch (error) {
        console.error("Legend load error:", error);
      }
    }
    /**
     * Update legend for a new theme
     */
    async update(theme) {
      await this.loadData(theme);
    }
    /**
     * Update legend for secteur-based coloring
     */
    updateForSecteur(secteur) {
      const secteurColors = {
        agriculture: { couleur: "#4CAF50", label: "Agriculture", icone: "\u{1F33E}" },
        elevage: { couleur: "#FF9800", label: "\xC9levage", icone: "\u{1F404}" },
        peche: { couleur: "#2196F3", label: "P\xEAche", icone: "\u{1F41F}" }
      };
      const secteurInfo = secteurColors[secteur];
      if (!secteurInfo) return;
      const titleEl = document.getElementById("legend-title");
      const contentEl = document.getElementById("legend-content");
      if (titleEl) {
        titleEl.textContent = `Secteur: ${secteurInfo.label}`;
      }
      if (contentEl) {
        contentEl.innerHTML = `
        <div class="legend__item">
          <span class="legend__color" style="background: ${secteurInfo.couleur}; opacity: 0.8"></span>
          <span class="legend__label">${secteurInfo.icone} Secteur principal</span>
        </div>
        <div class="legend__item">
          <span class="legend__color" style="background: #e0e0e0; opacity: 0.5"></span>
          <span class="legend__label">Autres secteurs</span>
        </div>
        <div class="legend__item">
          <span class="legend__color" style="background: #333; opacity: 1; height: 3px;"></span>
          <span class="legend__label">Zone s\xE9lectionn\xE9e</span>
        </div>
      `;
      }
    }
    /**
     * Render legend content
     */
    renderContent() {
      const titleEl = document.getElementById("legend-title");
      const contentEl = document.getElementById("legend-content");
      if (!this.data) return;
      if (titleEl) {
        titleEl.textContent = this.data.titre;
      }
      if (contentEl) {
        contentEl.innerHTML = this.data.items.map((item) => `
        <div class="legend__item">
          <span
            class="legend__color"
            style="background: ${item.couleur}; opacity: ${item.opacite || 0.7}"
          ></span>
          <span class="legend__label">${item.label}</span>
        </div>
      `).join("");
      }
    }
    /**
     * Toggle legend visibility
     */
    toggle() {
      this.isVisible = !this.isVisible;
      const contentEl = document.getElementById("legend-content");
      if (contentEl) {
        contentEl.style.display = this.isVisible ? "block" : "none";
      }
    }
    /**
     * Show legend
     */
    show() {
      this.isVisible = true;
      const contentEl = document.getElementById("legend-content");
      if (contentEl) {
        contentEl.style.display = "block";
      }
    }
    /**
     * Hide legend
     */
    hide() {
      this.isVisible = false;
      const contentEl = document.getElementById("legend-content");
      if (contentEl) {
        contentEl.style.display = "none";
      }
    }
    /**
     * Get current legend data
     */
    getData() {
      return this.data;
    }
  };
  var Legend_default = Legend;

  // src/components/Modal.js
  var Modal = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.data = null;
      this.isOpen = false;
      this.onClose = null;
      this.onAddToComparison = null;
    }
    /**
     * Initialize the modal
     */
    init() {
      this.render();
      this.attachEventListeners();
    }
    /**
     * Render the modal structure
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title" id="modal-title">D\xE9tails</h2>
          <button class="modal__close" id="modal-close">&times;</button>
        </div>
        <div class="modal__body" id="modal-body">
          <!-- Dynamic content -->
        </div>
        <div class="modal__footer">
          <button class="btn btn-primary" id="modal-add-comparison">
            Ajouter \xE0 la comparaison
          </button>
          <button class="btn btn-danger" id="modal-close-btn">
            Fermer
          </button>
        </div>
      </div>
    `;
      this.container.classList.add("modal-overlay");
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      const closeBtn = document.getElementById("modal-close");
      const closeBtnFooter = document.getElementById("modal-close-btn");
      const addComparisonBtn = document.getElementById("modal-add-comparison");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.close());
      }
      if (closeBtnFooter) {
        closeBtnFooter.addEventListener("click", () => this.close());
      }
      if (addComparisonBtn) {
        addComparisonBtn.addEventListener("click", () => {
          if (this.onAddToComparison && this.data) {
            this.onAddToComparison(this.data);
          }
          this.close();
        });
      }
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.close();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });
    }
    /**
     * Show modal with data for a location
     */
    async show(properties) {
      const type = properties.type_admin;
      const nom = properties.nom;
      try {
        const endpoint = type === "region" ? "regions" : "departements";
        const fetchFn = type === "region" ? api.getRegionDetails : api.getDepartementDetails;
        this.data = await fetchFn.call(api, nom);
        this.data.type = type;
        this.renderContent();
        this.open();
      } catch (error) {
        console.error("Modal show error:", error);
      }
    }
    /**
     * Render modal content based on data
     */
    renderContent() {
      const titleEl = document.getElementById("modal-title");
      const bodyEl = document.getElementById("modal-body");
      if (!this.data) return;
      if (titleEl) {
        const typeLabel = this.data.type === "region" ? "R\xE9gion" : "D\xE9partement";
        titleEl.textContent = `${this.data.nom} (${typeLabel})`;
      }
      if (bodyEl) {
        bodyEl.innerHTML = this.buildBodyContent();
      }
    }
    /**
     * Build the modal body content
     */
    buildBodyContent() {
      const data = this.data;
      let html = "";
      html += '<div class="modal__section">';
      html += '<h4 class="modal__section-title">Informations g\xE9n\xE9rales</h4>';
      html += '<div class="info-grid">';
      if (data.superficie) {
        html += this.createInfoItem("Superficie", `${formatNumber(Math.round(data.superficie))} km\xB2`);
      }
      if (data.population) {
        html += this.createInfoItem("Population", formatNumber(data.population));
      }
      if (data.valeur_economique) {
        html += this.createInfoItem("Valeur \xE9conomique", `${formatNumber(data.valeur_economique)} FCFA`);
      }
      if (data.secteur_principal) {
        html += this.createInfoItem("Secteur principal", data.secteur_principal);
      }
      if (data.region_parente) {
        html += this.createInfoItem("R\xE9gion", data.region_parente);
      }
      html += "</div></div>";
      if (data.production) {
        if (data.type === "region") {
          ["agriculture", "elevage", "peche"].forEach((secteur) => {
            const sectorData = data.production[secteur];
            if (sectorData && Object.keys(sectorData).length > 0) {
              html += `<div class="modal__section">`;
              html += `<h4 class="modal__section-title">${this.capitalizeFirst(secteur)}</h4>`;
              html += '<div class="info-grid">';
              Object.entries(sectorData).forEach(([nom, info]) => {
                const icon = info.icone || "";
                const value = formatNumber(info.valeur);
                const unit = info.unite || "";
                html += this.createInfoItem(`${icon} ${nom}`, `${value} ${unit}`);
              });
              html += "</div></div>";
            }
          });
        } else {
          html += '<div class="modal__section">';
          html += '<h4 class="modal__section-title">Production</h4>';
          html += '<div class="info-grid">';
          Object.entries(data.production).forEach(([produit, valeur]) => {
            if (typeof valeur === "number" && valeur > 0) {
              html += this.createInfoItem(produit, formatNumber(valeur));
            }
          });
          html += "</div></div>";
        }
      }
      if (data.departements && data.departements.length > 0) {
        html += '<div class="modal__section">';
        html += '<h4 class="modal__section-title">D\xE9partements</h4>';
        html += '<ul class="modal__list">';
        data.departements.forEach((d) => {
          const pop = d.population ? ` - ${formatNumber(d.population)} hab.` : "";
          html += `<li>${d.nom}${pop}</li>`;
        });
        html += "</ul></div>";
      }
      html += `<div class="modal__section">`;
      html += `<small class="text-muted">Ann\xE9e de r\xE9f\xE9rence: ${data.annee || 2024}</small>`;
      html += "</div>";
      return html;
    }
    /**
     * Create an info item HTML
     */
    createInfoItem(label, value) {
      return `
      <div class="info-item">
        <div class="info-item__label">${label}</div>
        <div class="info-item__value">${value}</div>
      </div>
    `;
    }
    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    /**
     * Open the modal
     */
    open() {
      this.container.classList.add("modal-overlay--active");
      this.isOpen = true;
      document.body.style.overflow = "hidden";
    }
    /**
     * Close the modal
     */
    close() {
      this.container.classList.remove("modal-overlay--active");
      this.isOpen = false;
      document.body.style.overflow = "";
      if (this.onClose) {
        this.onClose();
      }
    }
    /**
     * Show comparison results
     */
    showComparison(comparisonData) {
      const titleEl = document.getElementById("modal-title");
      const bodyEl = document.getElementById("modal-body");
      if (titleEl) {
        titleEl.textContent = "Comparaison";
      }
      if (bodyEl && comparisonData.items) {
        let html = '<div class="modal__section">';
        html += '<table style="width:100%; border-collapse: collapse;">';
        html += '<tr><th style="border:1px solid #ddd; padding:8px;">Crit\xE8re</th>';
        comparisonData.items.forEach((item) => {
          html += `<th style="border:1px solid #ddd; padding:8px;">${item.nom}</th>`;
        });
        html += "</tr>";
        comparisonData.produits.forEach((produit) => {
          html += `<tr><td style="border:1px solid #ddd; padding:8px;">${produit}</td>`;
          comparisonData.items.forEach((item) => {
            const val = item.production?.[produit] || 0;
            html += `<td style="border:1px solid #ddd; padding:8px; text-align:right;">${formatNumber(val)}</td>`;
          });
          html += "</tr>";
        });
        html += "</table></div>";
        bodyEl.innerHTML = html;
      }
      this.open();
    }
    /**
     * Get current data
     */
    getData() {
      return this.data;
    }
  };
  var Modal_default = Modal;

  // src/components/Footer.js
  var Footer = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.data = null;
    }
    /**
     * Initialize the footer
     */
    async init() {
      try {
        this.data = await api.getFooter();
        this.render();
      } catch (error) {
        console.error("Footer init error:", error);
        this.renderFallback();
      }
    }
    /**
     * Render the footer
     */
    render() {
      if (!this.container || !this.data) return;
      const sourcesText = this.data.sources.map((s) => s.nom).join(", ");
      this.container.innerHTML = `
      <div class="footer__credits">${this.data.credits}</div>
      <div class="footer__info">
        <span>Derni\xE8re mise \xE0 jour: ${this.data.derniereMAJ}</span>
        <span> | </span>
        <span>Sources: <a href="#" id="sources-link">${sourcesText}</a></span>
      </div>
    `;
      this.container.classList.add("footer");
    }
    /**
     * Render fallback content
     */
    renderFallback() {
      if (!this.container) return;
      this.container.innerHTML = `
      <div class="footer__credits">\xA9 2024 Projet 5GI</div>
      <div class="footer__info">
        <span>Atlas \xC9conomique du Cameroun</span>
      </div>
    `;
      this.container.classList.add("footer");
    }
    /**
     * Update footer position when sidebar toggles
     */
    setFullWidth(isFull) {
      if (this.container) {
        this.container.classList.toggle("footer--full", isFull);
      }
    }
  };
  var Footer_default = Footer;

  // src/components/KPIDashboard.js
  var KPIDashboard = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.data = null;
      this.currentFilters = {};
      this.kpiConfig = [
        { key: "agriculture", label: "Agriculture", icon: "fas fa-seedling" },
        { key: "elevage", label: "\xC9levage", icon: "fas fa-cow" },
        { key: "peche", label: "P\xEAche", icon: "fas fa-fish" },
        { key: "valeur_economique", label: "Valeur \xC9co.", icon: "fas fa-chart-line" },
        { key: "regions_actives", label: "R\xE9gions", icon: "fas fa-map-marked-alt" },
        { key: "departements_actifs", label: "D\xE9partements", icon: "fas fa-layer-group" }
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
        console.error("KPI Dashboard load error:", error);
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
        ${this.kpiConfig.map((kpi) => this.renderKPICard(kpi)).join("")}
      </div>
    `;
    }
    /**
     * Render a single KPI card
     */
    renderKPICard(kpi) {
      const data = this.data[kpi.key];
      if (!data) return "";
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
  };
  var KPIDashboard_default = KPIDashboard;

  // src/components/LoadingOverlay.js
  var LoadingOverlay = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.isLoading = false;
      this.hasError = false;
      this.onRetry = null;
    }
    /**
     * Initialize the loading overlay
     */
    init() {
      this.render();
      this.attachEventListeners();
    }
    /**
     * Render the loading overlay
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <div class="loading-overlay__spinner"></div>
      <div class="loading-overlay__text" id="loading-text">Chargement des donn\xE9es...</div>
    `;
      this.container.classList.add("loading-overlay");
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
    }
    /**
     * Show loading overlay
     */
    show(message = "Chargement des donn\xE9es...") {
      this.isLoading = true;
      this.hasError = false;
      const textEl = document.getElementById("loading-text");
      if (textEl) {
        textEl.textContent = message;
      }
      this.container.classList.add("loading-overlay--active");
    }
    /**
     * Hide loading overlay
     */
    hide() {
      this.isLoading = false;
      this.container.classList.remove("loading-overlay--active");
    }
    /**
     * Update loading message
     */
    setMessage(message) {
      const textEl = document.getElementById("loading-text");
      if (textEl) {
        textEl.textContent = message;
      }
    }
  };
  var ErrorMessage = class {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.onRetry = null;
    }
    /**
     * Initialize the error message
     */
    init() {
      this.render();
      this.attachEventListeners();
    }
    /**
     * Render the error message
     */
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
      <p id="error-text">Une erreur s'est produite</p>
      <button class="btn btn-primary retry-btn" id="error-retry">R\xE9essayer</button>
    `;
      this.container.classList.add("error-message");
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
      const retryBtn = document.getElementById("error-retry");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          if (this.onRetry) {
            this.onRetry();
          }
        });
      }
    }
    /**
     * Show error message
     */
    show(message = "Une erreur s'est produite") {
      const textEl = document.getElementById("error-text");
      if (textEl) {
        textEl.textContent = message;
      }
      this.container.classList.add("error-message--active");
    }
    /**
     * Hide error message
     */
    hide() {
      this.container.classList.remove("error-message--active");
    }
  };

  // src/App.js
  var App = class {
    constructor() {
      this.header = null;
      this.sidebar = null;
      this.map = null;
      this.legend = null;
      this.modal = null;
      this.footer = null;
      this.kpiDashboard = null;
      this.loadingOverlay = null;
      this.errorMessage = null;
      this.currentTheme = "tous";
      this.currentRegion = "all";
      this.isSidebarOpen = true;
    }
    /**
     * Initialize the application
     */
    async init() {
      console.log("Initializing Atlas \xC9conomique du Cameroun...");
      this.initLoadingOverlay();
      this.loadingOverlay.show("Chargement de l'application...");
      try {
        await api.healthCheck();
        await this.initComponents();
        this.setupEventHandlers();
        this.loadingOverlay.hide();
        console.log("Application initialized successfully");
      } catch (error) {
        console.error("Application init error:", error);
        this.loadingOverlay.hide();
        this.showError("Impossible de charger l'application. V\xE9rifiez que le serveur est d\xE9marr\xE9.");
      }
    }
    /**
     * Initialize loading overlay first
     */
    initLoadingOverlay() {
      this.loadingOverlay = new LoadingOverlay("loading-overlay");
      this.loadingOverlay.init();
      this.errorMessage = new ErrorMessage("error-message");
      this.errorMessage.init();
      this.errorMessage.onRetry = () => this.retry();
    }
    /**
     * Initialize all components
     */
    async initComponents() {
      this.header = new Header_default("header");
      this.header.onThemeChange = (theme) => this.handleThemeChange(theme);
      this.header.onMenuToggle = () => this.toggleSidebar();
      this.header.onSearchSelect = (result) => this.handleSearchSelect(result);
      await this.header.init();
      this.sidebar = new Sidebar_default("sidebar");
      this.sidebar.onRegionChange = (regions) => {
        this.handleRegionChange(regions);
        if (this.kpiDashboard) {
          this.kpiDashboard.update({ regions: regions.length > 0 ? regions : null });
        }
      };
      this.sidebar.onDepartementChange = (depts) => this.handleDeptChange(depts);
      this.sidebar.onFiltersApply = (filters) => {
        this.handleFiltersApply(filters);
        if (this.kpiDashboard) {
          this.kpiDashboard.update(filters);
        }
      };
      this.sidebar.onFiltersReset = () => {
        this.handleFiltersReset();
        if (this.kpiDashboard) {
          this.kpiDashboard.update({});
        }
      };
      await this.sidebar.init();
      this.kpiDashboard = new KPIDashboard_default("kpi-container");
      await this.kpiDashboard.init();
      this.map = new Map_default("map");
      this.map.onFeatureClick = (props) => this.handleFeatureClick(props);
      await this.map.init();
      this.legend = new Legend_default("legend");
      await this.legend.init();
      this.modal = new Modal_default("modal");
      this.modal.onAddToComparison = (data) => this.handleAddToComparison(data);
      this.modal.init();
      this.footer = new Footer_default("footer");
      await this.footer.init();
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
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (this.modal && this.modal.isOpen) {
            this.modal.close();
          }
        }
        if (e.ctrlKey && e.key === "f") {
          e.preventDefault();
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            searchInput.focus();
          }
        }
      });
      window.addEventListener("resize", () => {
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
      this.map.setTheme(theme);
      this.legend.update(theme);
      if (theme !== "tous" && this.sidebar.charts) {
        this.sidebar.charts.update(theme);
      }
    }
    /**
     * Handle region change (multiple regions)
     */
    handleRegionChange(regions) {
      this.currentRegion = regions.length > 0 ? regions : "all";
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
      this.map.applyFilters(filters);
      if (filters.produit && filters.produit !== "all") {
        this.currentTheme = filters.produit;
        this.header.setTheme(filters.produit);
        this.legend.update(filters.produit);
      } else if (filters.secteur && filters.secteur !== "all") {
        this.currentTheme = "tous";
        this.legend.updateForSecteur(filters.secteur);
      }
    }
    /**
     * Handle filters reset
     */
    handleFiltersReset() {
      this.currentTheme = "tous";
      this.currentRegion = "all";
      this.header.setTheme("tous");
      this.map.resetView();
      this.legend.update("tous");
    }
    /**
     * Handle search result selection
     */
    handleSearchSelect(result) {
      if (result.type === "region") {
        this.sidebar.setRegion(result.nom);
      } else {
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
      const mapContainer = document.getElementById("map-container");
      const footer = document.getElementById("footer");
      const kpiContainer = document.getElementById("kpi-container");
      if (!this.isSidebarOpen) {
        if (mapContainer) mapContainer.classList.add("map-container--full");
        if (footer) footer.classList.add("footer--full");
        if (kpiContainer) kpiContainer.classList.add("kpi-container--full");
      } else {
        if (mapContainer) mapContainer.classList.remove("map-container--full");
        if (footer) footer.classList.remove("footer--full");
        if (kpiContainer) kpiContainer.classList.remove("kpi-container--full");
      }
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
  };
  var App_default = App;
  document.addEventListener("DOMContentLoaded", () => {
    const app = new App();
    app.init();
    window.app = app;
  });
  return __toCommonJS(App_exports);
})();
//# sourceMappingURL=app.bundle.js.map
