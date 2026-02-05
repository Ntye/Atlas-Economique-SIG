/**
 * Header Component
 * Displays the application header with title, search, theme selector, and controls
 */

import { api } from '../services/api.js';
import Search from './Search.js';

class Header {
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
      console.error('Header init error:', error);
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
          ${this.data.themes.map(t => `
            <option value="${t.id}">${t.label}</option>
          `).join('')}
        </select>
        <button class="header__button" id="help-btn">? Aide</button>
      </div>
    `;

    this.container.classList.add('header');

    // Initialize search component
    this.search = new Search('header-search-container');
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
          <h1 class="header__title">Atlas Économique du Cameroun</h1>
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

    this.container.classList.add('header');

    // Initialize search component
    this.search = new Search('header-search-container');
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
    const themeSelector = document.getElementById('theme-selector');
    const menuToggle = document.getElementById('menu-toggle');
    const helpBtn = document.getElementById('help-btn');

    if (themeSelector) {
      themeSelector.addEventListener('change', (e) => {
        if (this.onThemeChange) {
          this.onThemeChange(e.target.value);
        }
      });
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        if (this.onMenuToggle) {
          this.onMenuToggle();
        }
      });
    }

    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.showHelp());
    }
  }

  /**
   * Show help dialog
   */
  showHelp() {
    alert(`${this.data?.titre || 'Atlas Économique du Cameroun'}\n\n` +
      '• Utilisez les filtres pour explorer les données\n' +
      '• Cliquez sur une région/département pour voir les détails\n' +
      '• Changez de thème pour visualiser différentes productions\n' +
      '• Utilisez la recherche pour trouver rapidement un lieu');
  }

  /**
   * Set the current theme value in the selector
   */
  setTheme(theme) {
    const selector = document.getElementById('theme-selector');
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
}

export default Header;
