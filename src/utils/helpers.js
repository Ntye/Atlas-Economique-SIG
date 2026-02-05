/**
 * Utility Helper Functions
 */

/**
 * Format large numbers with K, M, Mrd suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' Mrd';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + ' M';
  if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
  return num.toString();
}

/**
 * Format currency in FCFA
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return formatNumber(amount) + ' FCFA';
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
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

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Highlight search matches in text
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {string} HTML string with highlighted matches
 */
export function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
export function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Get color for production value based on theme
 * @param {string} theme - Theme name
 * @param {number} value - Production value
 * @returns {Object} Style object with fillColor and fillOpacity
 */
export function getProductionColor(theme, value) {
  const colorScales = {
    cacao: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 50000, color: '#A1887F', opacity: 0.7 },
      { max: 100000, color: '#795548', opacity: 0.7 },
      { max: Infinity, color: '#4E342E', opacity: 0.8 }
    ],
    bovins: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 100000, color: '#FFB74D', opacity: 0.7 },
      { max: 500000, color: '#FF9800', opacity: 0.7 },
      { max: Infinity, color: '#E65100', opacity: 0.8 }
    ],
    coton: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 100000, color: '#90CAF9', opacity: 0.7 },
      { max: 200000, color: '#42A5F5', opacity: 0.7 },
      { max: Infinity, color: '#1565C0', opacity: 0.8 }
    ],
    cafe: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 10000, color: '#8D6E63', opacity: 0.7 },
      { max: 30000, color: '#6D4C41', opacity: 0.7 },
      { max: Infinity, color: '#4E342E', opacity: 0.8 }
    ],
    peche: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 50000, color: '#B3E5FC', opacity: 0.7 },
      { max: 100000, color: '#4FC3F7', opacity: 0.7 },
      { max: Infinity, color: '#0288D1', opacity: 0.8 }
    ],
    default: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 50000, color: '#81C784', opacity: 0.7 },
      { max: 100000, color: '#4CAF50', opacity: 0.7 },
      { max: Infinity, color: '#1B5E20', opacity: 0.8 }
    ]
  };

  const scale = colorScales[theme] || colorScales.default;

  for (const level of scale) {
    if (value <= level.max) {
      return { fillColor: level.color, fillOpacity: level.opacity };
    }
  }

  return { fillColor: '#ccc', fillOpacity: 0.3 };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
  formatNumber,
  formatCurrency,
  debounce,
  throttle,
  highlightMatch,
  escapeRegex,
  deepClone,
  isEmpty,
  getProductionColor,
  generateId,
  capitalize
};
