/**
 * Footer Component
 * Displays credits, sources, and last update info
 */

import { api } from '../services/api.js';

class Footer {
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
      console.error('Footer init error:', error);
      this.renderFallback();
    }
  }

  /**
   * Render the footer
   */
  render() {
    if (!this.container || !this.data) return;

    const sourcesText = this.data.sources.map(s => s.nom).join(', ');

    this.container.innerHTML = `
      <div class="footer__credits">${this.data.credits}</div>
      <div class="footer__info">
        <span>Dernière mise à jour: ${this.data.derniereMAJ}</span>
        <span> | </span>
        <span>Sources: <a href="#" id="sources-link">${sourcesText}</a></span>
      </div>
    `;

    this.container.classList.add('footer');
  }

  /**
   * Render fallback content
   */
  renderFallback() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="footer__credits">© 2024 Projet 5GI</div>
      <div class="footer__info">
        <span>Atlas Économique du Cameroun</span>
      </div>
    `;

    this.container.classList.add('footer');
  }

  /**
   * Update footer position when sidebar toggles
   */
  setFullWidth(isFull) {
    if (this.container) {
      this.container.classList.toggle('footer--full', isFull);
    }
  }
}

export default Footer;
