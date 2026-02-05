/**
 * Search Component
 * Provides location search functionality
 */

import { api } from '../services/api.js';
import { debounce, highlightMatch } from '../utils/helpers.js';

class Search {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.results = [];
    this.isResultsVisible = false;

    // Callbacks
    this.onSelect = null;

    // Debounced search
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
          placeholder="Rechercher une région ou département..."
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
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

    if (input) {
      input.addEventListener('input', (e) => {
        this.debouncedSearch(e.target.value);
      });

      input.addEventListener('focus', () => {
        if (this.results.length > 0) {
          this.showResults();
        }
      });

      input.addEventListener('blur', () => {
        // Delay hiding to allow click on results
        setTimeout(() => this.hideResults(), 200);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
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
      console.error('Search error:', error);
      this.renderError();
    }
  }

  /**
   * Render search results
   */
  renderResults(query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (this.results.length === 0) {
      container.innerHTML = `
        <div class="search__no-results">
          Aucun résultat trouvé pour "${query}"
        </div>
      `;
    } else {
      container.innerHTML = this.results.map((result, index) => `
        <div class="search__result-item" data-index="${index}">
          <span class="search__result-badge">
            ${result.type === 'region' ? 'Région' : 'Dept'}
          </span>
          <span class="search__result-name">
            ${highlightMatch(result.nom, query)}
          </span>
          ${result.region_parente ? `
            <small class="search__result-parent">(${result.region_parente})</small>
          ` : ''}
        </div>
      `).join('');

      // Attach click handlers to results
      container.querySelectorAll('.search__result-item').forEach(item => {
        item.addEventListener('click', () => {
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
    const container = document.getElementById('search-results');
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
    const input = document.getElementById('search-input');
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
    const container = document.getElementById('search-results');
    if (container) {
      container.classList.add('search__results--active');
      this.isResultsVisible = true;
    }
  }

  /**
   * Hide results dropdown
   */
  hideResults() {
    const container = document.getElementById('search-results');
    if (container) {
      container.classList.remove('search__results--active');
      this.isResultsVisible = false;
    }
  }

  /**
   * Clear search input
   */
  clear() {
    const input = document.getElementById('search-input');
    if (input) {
      input.value = '';
    }
    this.results = [];
    this.hideResults();
  }
}

export default Search;
