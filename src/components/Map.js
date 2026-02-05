/**
 * Map Component
 * Interactive Leaflet map for displaying regions and departments
 */

import { api } from '../services/api.js';
import { formatNumber, getProductionColor } from '../utils/helpers.js';

class Map {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.layerRegions = null;
    this.layerDepts = null;
    this.dataRegions = null;
    this.dataDepts = null;
    this.currentTheme = 'tous';
    this.currentRegion = null;
    this.currentSecteur = 'all';
    this.selectedRegions = [];
    this.selectedDepts = [];

    // Secteur colors
    this.secteurColors = {
      agriculture: '#4CAF50',
      elevage: '#FF9800',
      peche: '#2196F3'
    };

    // Callbacks
    this.onFeatureClick = null;
    this.onFeatureHover = null;

    // Map configuration
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
      zoom: this.config.zoom,
    });

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
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
      console.error('Map data load error:', error);
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

    // Default "Hue" settings for the map of Cameroon
    let fillColor = '#2ecc71'; // A soft emerald green
    let fillOpacity = 0.15;    // Very subtle hue
    let weight = 1;
    let borderColor = '#27ae60'; // Darker green for borders

    // Check if this feature is selected
    const isSelectedRegion = this.selectedRegions.includes(featureName);
    const isSelectedDept = this.selectedDepts.includes(featureName);
    const isSelected = isSelectedRegion || isSelectedDept;

    if (theme === 'tous') {
      // If a secteur is selected, override the general green hue
      if (this.currentSecteur !== 'all') {
        const secteurPrincipal = prod.secteur_principal;
        if (secteurPrincipal === this.currentSecteur) {
          fillColor = this.secteurColors[this.currentSecteur] || '#ccc';
          fillOpacity = isSelected ? 0.9 : 0.6;
        } else {
          fillColor = '#e0e0e0'; // Desaturate non-matching areas
          fillOpacity = isSelected ? 0.5 : 0.2;
          borderColor = 'white';
        }
      } else {
        // DEFAULT STATE: Subtle green hue for the whole country
        fillColor = '#2ecc71';
        fillOpacity = isSelected ? 0.6 : 0.2;
        borderColor = isSelected ? '#333' : '#27ae60';
      }
    } else if (prod[theme] && prod[theme] > 0) {
      // THEMATIC STATE (e.g., searching for a specific product)
      const colorInfo = getProductionColor(theme, prod[theme]);
      fillColor = colorInfo.fillColor;
      fillOpacity = isSelected ? 0.9 : colorInfo.fillOpacity;
      borderColor = 'white';
    }

    // High-level highlight for selected features
    if (isSelected) {
      weight = 2.5;
      borderColor = '#2c3e50'; // Dark navy for contrast on selection
    }

    return {
      fillColor,
      fillOpacity,
      weight,
      color: borderColor,
      opacity: 0.8 // Border opacity
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
    content += `<small>${properties.type_admin === 'departement' ? 'Département' : 'Région'}</small><br>`;

    if (properties.production) {
      const prods = Object.entries(properties.production)
        .filter(([k, v]) => typeof v === 'number' && v > 0 && k !== 'valeur_economique')
        .slice(0, 5);

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
    // Popup
    layer.bindPopup(this.createPopupContent(feature.properties));

    // Events
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, color: '#666' });

        if (this.onFeatureHover) {
          this.onFeatureHover(feature.properties, 'enter');
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
          this.onFeatureHover(feature.properties, 'leave');
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

    // Remove existing layers
    if (this.layerDepts) {
      this.map.removeLayer(this.layerDepts);
      this.layerDepts = null;
    }
    if (this.layerRegions) {
      this.map.removeLayer(this.layerRegions);
    }

    // Add regions layer
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

    // Remove existing layers
    if (this.layerRegions) {
      this.map.removeLayer(this.layerRegions);
      this.layerRegions = null;
    }
    if (this.layerDepts) {
      this.map.removeLayer(this.layerDepts);
    }

    // Filter features if region is specified
    let features = this.dataDepts.features;
    if (region) {
      features = features.filter(f => f.properties.region_parente === region);
    }

    // Add departments layer
    this.layerDepts = L.geoJSON({ type: 'FeatureCollection', features }, {
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
      // Show departments of selected regions
      this.displayDepartementsForRegions(regions);
    } else {
      // Show all regions
      this.displayRegions();
    }
  }

  /**
   * Set selected departments (for multi-select)
   */
  setSelectedDepts(depts) {
    this.selectedDepts = depts || [];
    this.refreshLayers();

    // Zoom to fit all selected departments
    if (depts.length > 0) {
      this.zoomToSelectedDepts();
    }
  }

  /**
   * Display departments for multiple selected regions
   */
  displayDepartementsForRegions(regions) {
    const t = this.currentTheme;

    // Remove existing layers
    if (this.layerRegions) {
      this.map.removeLayer(this.layerRegions);
      this.layerRegions = null;
    }
    if (this.layerDepts) {
      this.map.removeLayer(this.layerDepts);
    }

    // Filter features for selected regions
    let features = this.dataDepts.features.filter(f =>
      regions.includes(f.properties.region_parente)
    );

    // Add departments layer
    this.layerDepts = L.geoJSON({ type: 'FeatureCollection', features }, {
      style: (f) => this.getStyle(f, t),
      onEachFeature: (f, l) => this.onEachFeature(f, l)
    }).addTo(this.map);

    // Zoom to fit all selected regions
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

    // Set secteur
    this.currentSecteur = secteur || 'all';

    // Set theme based on produit or default
    if (produit && produit !== 'all') {
      this.currentTheme = produit;
    } else {
      this.currentTheme = 'tous';
    }

    // Set selected regions and departments
    this.selectedRegions = regions || [];
    this.selectedDepts = departements || [];

    // Update display
    if (regions && regions.length > 0) {
      this.displayDepartementsForRegions(regions);
    } else if (secteur && secteur !== 'all') {
      this.displayRegions();
    } else {
      this.resetView();
      return;
    }

    // Apply department selection highlighting
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
      f => f.properties.nom === regionName
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
        // Highlight
        layer.setStyle({
          color: '#0044ff',
          weight: 4,
          opacity: 1
        });
        layer.bringToFront();

        // Zoom
        this.map.fitBounds(layer.getBounds());

        // Open popup
        layer.openPopup();
      } else {
        // Reset other layers
        this.layerDepts.resetStyle(layer);
      }
    });
  }

  /**
   * Reset view to initial state
   */
  resetView() {
    this.map.setView(this.config.center, this.config.zoom);
    this.displayRegions('tous');
    this.currentTheme = 'tous';
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
}

export default Map;
