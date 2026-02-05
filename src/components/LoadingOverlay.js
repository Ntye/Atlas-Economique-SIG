/**
 * Loading Overlay Component
 * Displays loading spinner and error messages
 */

class LoadingOverlay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isLoading = false;
    this.hasError = false;

    // Callbacks
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
      <div class="loading-overlay__text" id="loading-text">Chargement des données...</div>
    `;

    this.container.classList.add('loading-overlay');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // No events needed for loading overlay
  }

  /**
   * Show loading overlay
   */
  show(message = 'Chargement des données...') {
    this.isLoading = true;
    this.hasError = false;

    const textEl = document.getElementById('loading-text');
    if (textEl) {
      textEl.textContent = message;
    }

    this.container.classList.add('loading-overlay--active');
  }

  /**
   * Hide loading overlay
   */
  hide() {
    this.isLoading = false;
    this.container.classList.remove('loading-overlay--active');
  }

  /**
   * Update loading message
   */
  setMessage(message) {
    const textEl = document.getElementById('loading-text');
    if (textEl) {
      textEl.textContent = message;
    }
  }
}

/**
 * Error Message Component
 * Displays error messages with retry button
 */
class ErrorMessage {
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
      <button class="btn btn-primary retry-btn" id="error-retry">Réessayer</button>
    `;

    this.container.classList.add('error-message');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const retryBtn = document.getElementById('error-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (this.onRetry) {
          this.onRetry();
        }
      });
    }
  }

  /**
   * Show error message
   */
  show(message = 'Une erreur s\'est produite') {
    const textEl = document.getElementById('error-text');
    if (textEl) {
      textEl.textContent = message;
    }

    this.container.classList.add('error-message--active');
  }

  /**
   * Hide error message
   */
  hide() {
    this.container.classList.remove('error-message--active');
  }
}

export { LoadingOverlay, ErrorMessage };
export default LoadingOverlay;
