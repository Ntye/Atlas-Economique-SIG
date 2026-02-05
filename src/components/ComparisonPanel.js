/**
 * Comparison Panel Component
 * Allows comparing multiple regions or departments
 */

import { api } from '../services/api.js';

class ComparisonPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = [];
    this.maxItems = 4;

    // Callbacks
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
      <h3 class="comparison-panel__title">📋 Comparaison</h3>
      <div class="comparison-panel__selection" id="comparison-selection"></div>
      <div class="comparison-panel__actions">
        <button class="btn btn-primary btn-sm" id="btn-compare">Comparer</button>
        <button class="btn btn-danger btn-sm" id="btn-clear-comparison">Effacer</button>
      </div>
    `;

    this.container.classList.add('comparison-panel');
    this.updateVisibility();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const compareBtn = document.getElementById('btn-compare');
    const clearBtn = document.getElementById('btn-clear-comparison');

    if (compareBtn) {
      compareBtn.addEventListener('click', () => this.compare());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }
  }

  /**
   * Add an item to comparison
   */
  add(item) {
    // Check if already exists
    const exists = this.items.find(i => i.nom === item.nom);
    if (exists) return false;

    // Check max items
    if (this.items.length >= this.maxItems) {
      alert(`Maximum ${this.maxItems} éléments pour la comparaison`);
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
    const selectionEl = document.getElementById('comparison-selection');
    if (!selectionEl) return;

    selectionEl.innerHTML = this.items.map((item, index) => `
      <div class="comparison-panel__item">
        <input type="checkbox" checked disabled>
        <span>${item.nom}</span>
        <span class="remove" data-index="${index}">×</span>
      </div>
    `).join('');

    // Attach remove handlers
    selectionEl.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
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
      this.container.classList.add('comparison-panel--active');
    } else {
      this.container.classList.remove('comparison-panel--active');
    }
  }

  /**
   * Perform comparison
   */
  async compare() {
    if (this.items.length < 2) {
      alert('Sélectionnez au moins 2 éléments à comparer');
      return;
    }

    try {
      const ids = this.items.map(i => i.nom);
      const type = this.items[0].type === 'region' ? 'region' : 'departement';
      const data = await api.compare(ids, type);

      if (this.onCompare) {
        this.onCompare(data);
      }
    } catch (error) {
      console.error('Comparison error:', error);
      alert('Erreur lors de la comparaison');
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
    return this.items.some(i => i.nom === nom);
  }
}

export default ComparisonPanel;
