/**
 * Legend Component
 * Dynamic map legend based on current theme
 */

import { api } from '../services/api.js';

class Legend {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = null;
    this.isVisible = true;
    this.currentTheme = 'tous';
  }

  /**
   * Initialize the legend
   */
  async init() {
    this.render();
    await this.loadData('tous');
  }

  /**
   * Render the legend container
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <button class="legend__toggle" id="legend-toggle">👁</button>
      <h4 class="legend__title" id="legend-title">Légende</h4>
      <div class="legend__content" id="legend-content"></div>
    `;

    this.container.classList.add('legend');
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const toggleBtn = document.getElementById('legend-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
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
      console.error('Legend load error:', error);
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
      agriculture: { couleur: '#4CAF50', label: 'Agriculture', icone: '🌾' },
      elevage: { couleur: '#FF9800', label: 'Élevage', icone: '🐄' },
      peche: { couleur: '#2196F3', label: 'Pêche', icone: '🐟' }
    };

    const secteurInfo = secteurColors[secteur];
    if (!secteurInfo) return;

    const titleEl = document.getElementById('legend-title');
    const contentEl = document.getElementById('legend-content');

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
          <span class="legend__label">Zone sélectionnée</span>
        </div>
      `;
    }
  }

  /**
   * Render legend content
   */
  renderContent() {
    const titleEl = document.getElementById('legend-title');
    const contentEl = document.getElementById('legend-content');

    if (!this.data) return;

    if (titleEl) {
      titleEl.textContent = this.data.titre;
    }

    if (contentEl) {
      contentEl.innerHTML = this.data.items.map(item => `
        <div class="legend__item">
          <span
            class="legend__color"
            style="background: ${item.couleur}; opacity: ${item.opacite || 0.7}"
          ></span>
          <span class="legend__label">${item.label}</span>
        </div>
      `).join('');
    }
  }

  /**
   * Toggle legend visibility
   */
  toggle() {
    this.isVisible = !this.isVisible;
    const contentEl = document.getElementById('legend-content');
    if (contentEl) {
      contentEl.style.display = this.isVisible ? 'block' : 'none';
    }
  }

  /**
   * Show legend
   */
  show() {
    this.isVisible = true;
    const contentEl = document.getElementById('legend-content');
    if (contentEl) {
      contentEl.style.display = 'block';
    }
  }

  /**
   * Hide legend
   */
  hide() {
    this.isVisible = false;
    const contentEl = document.getElementById('legend-content');
    if (contentEl) {
      contentEl.style.display = 'none';
    }
  }

  /**
   * Get current legend data
   */
  getData() {
    return this.data;
  }
}

export default Legend;
