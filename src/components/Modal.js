/**
 * Modal Component
 * Details modal for regions and departments
 */

import { api } from '../services/api.js';
import { formatNumber } from '../utils/helpers.js';

class Modal {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = null;
    this.isOpen = false;

    // Callbacks
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
          <h2 class="modal__title" id="modal-title">Détails</h2>
          <button class="modal__close" id="modal-close">&times;</button>
        </div>
        <div class="modal__body" id="modal-body">
          <!-- Dynamic content -->
        </div>
        <div class="modal__footer">
          <button class="btn btn-primary" id="modal-add-comparison">
            Ajouter à la comparaison
          </button>
          <button class="btn btn-danger" id="modal-close-btn">
            Fermer
          </button>
        </div>
      </div>
    `;

    this.container.classList.add('modal-overlay');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const closeBtn = document.getElementById('modal-close');
    const closeBtnFooter = document.getElementById('modal-close-btn');
    const addComparisonBtn = document.getElementById('modal-add-comparison');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (closeBtnFooter) {
      closeBtnFooter.addEventListener('click', () => this.close());
    }

    if (addComparisonBtn) {
      addComparisonBtn.addEventListener('click', () => {
        if (this.onAddToComparison && this.data) {
          this.onAddToComparison(this.data);
        }
        this.close();
      });
    }

    // Close on overlay click
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
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
      const endpoint = type === 'region' ? 'regions' : 'departements';
      const fetchFn = type === 'region' ? api.getRegionDetails : api.getDepartementDetails;
      this.data = await fetchFn.call(api, nom);
      this.data.type = type;

      this.renderContent();
      this.open();
    } catch (error) {
      console.error('Modal show error:', error);
    }
  }

  /**
   * Render modal content based on data
   */
  renderContent() {
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (!this.data) return;

    // Title
    if (titleEl) {
      const typeLabel = this.data.type === 'region' ? 'Région' : 'Département';
      titleEl.textContent = `${this.data.nom} (${typeLabel})`;
    }

    // Body
    if (bodyEl) {
      bodyEl.innerHTML = this.buildBodyContent();
    }
  }

  /**
   * Build the modal body content
   */
  buildBodyContent() {
    const data = this.data;
    let html = '';

    // General Info Section
    html += '<div class="modal__section">';
    html += '<h4 class="modal__section-title">Informations générales</h4>';
    html += '<div class="info-grid">';

    if (data.superficie) {
      html += this.createInfoItem('Superficie', `${formatNumber(Math.round(data.superficie))} km²`);
    }
    if (data.population) {
      html += this.createInfoItem('Population', formatNumber(data.population));
    }
    if (data.valeur_economique) {
      html += this.createInfoItem('Valeur économique', `${formatNumber(data.valeur_economique)} FCFA`);
    }
    if (data.secteur_principal) {
      html += this.createInfoItem('Secteur principal', data.secteur_principal);
    }
    if (data.region_parente) {
      html += this.createInfoItem('Région', data.region_parente);
    }

    html += '</div></div>';

    // Production Section
    if (data.production) {
      if (data.type === 'region') {
        // Grouped by sector for regions
        ['agriculture', 'elevage', 'peche'].forEach(secteur => {
          const sectorData = data.production[secteur];
          if (sectorData && Object.keys(sectorData).length > 0) {
            html += `<div class="modal__section">`;
            html += `<h4 class="modal__section-title">${this.capitalizeFirst(secteur)}</h4>`;
            html += '<div class="info-grid">';

            Object.entries(sectorData).forEach(([nom, info]) => {
              const icon = info.icone || '';
              const value = formatNumber(info.valeur);
              const unit = info.unite || '';
              html += this.createInfoItem(`${icon} ${nom}`, `${value} ${unit}`);
            });

            html += '</div></div>';
          }
        });
      } else {
        // Flat list for departments
        html += '<div class="modal__section">';
        html += '<h4 class="modal__section-title">Production</h4>';
        html += '<div class="info-grid">';

        Object.entries(data.production).forEach(([produit, valeur]) => {
          if (typeof valeur === 'number' && valeur > 0) {
            html += this.createInfoItem(produit, formatNumber(valeur));
          }
        });

        html += '</div></div>';
      }
    }

    // Departments list for regions
    if (data.departements && data.departements.length > 0) {
      html += '<div class="modal__section">';
      html += '<h4 class="modal__section-title">Départements</h4>';
      html += '<ul class="modal__list">';

      data.departements.forEach(d => {
        const pop = d.population ? ` - ${formatNumber(d.population)} hab.` : '';
        html += `<li>${d.nom}${pop}</li>`;
      });

      html += '</ul></div>';
    }

    // Year reference
    html += `<div class="modal__section">`;
    html += `<small class="text-muted">Année de référence: ${data.annee || 2024}</small>`;
    html += '</div>';

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
    this.container.classList.add('modal-overlay--active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the modal
   */
  close() {
    this.container.classList.remove('modal-overlay--active');
    this.isOpen = false;
    document.body.style.overflow = '';

    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Show comparison results
   */
  showComparison(comparisonData) {
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (titleEl) {
      titleEl.textContent = 'Comparaison';
    }

    if (bodyEl && comparisonData.items) {
      let html = '<div class="modal__section">';
      html += '<table style="width:100%; border-collapse: collapse;">';

      // Header
      html += '<tr><th style="border:1px solid #ddd; padding:8px;">Critère</th>';
      comparisonData.items.forEach(item => {
        html += `<th style="border:1px solid #ddd; padding:8px;">${item.nom}</th>`;
      });
      html += '</tr>';

      // Rows
      comparisonData.produits.forEach(produit => {
        html += `<tr><td style="border:1px solid #ddd; padding:8px;">${produit}</td>`;
        comparisonData.items.forEach(item => {
          const val = item.production?.[produit] || 0;
          html += `<td style="border:1px solid #ddd; padding:8px; text-align:right;">${formatNumber(val)}</td>`;
        });
        html += '</tr>';
      });

      html += '</table></div>';
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
}

export default Modal;
