/**
 * Utility Helper Functions
 */

import type { ColorScaleEntry } from '../interfaces';

/**
 * Format large numbers with K, M, Mrd suffixes
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' Mrd';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + ' M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + ' K';
  return num.toString();
}

/**
 * Format currency in FCFA
 */
export function formatCurrency(amount: number): string {
  return formatNumber(amount) + ' FCFA';
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Escape special regex characters
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight search matches in text
 */
export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * Get color for production value based on theme
 */
export function getProductionColor(
  theme: string,
  value: number
): { fillColor: string; fillOpacity: number } {
  const colorScales: Record<string, ColorScaleEntry[]> = {
    cacao: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 50000, color: '#A1887F', opacity: 0.7 },
      { max: 100000, color: '#795548', opacity: 0.7 },
      { max: Infinity, color: '#4E342E', opacity: 0.8 },
    ],
    bovins: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 100000, color: '#FFB74D', opacity: 0.7 },
      { max: 500000, color: '#FF9800', opacity: 0.7 },
      { max: Infinity, color: '#E65100', opacity: 0.8 },
    ],
    coton: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 100000, color: '#90CAF9', opacity: 0.7 },
      { max: 200000, color: '#42A5F5', opacity: 0.7 },
      { max: Infinity, color: '#1565C0', opacity: 0.8 },
    ],
    cafe: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 10000, color: '#8D6E63', opacity: 0.7 },
      { max: 30000, color: '#6D4C41', opacity: 0.7 },
      { max: Infinity, color: '#4E342E', opacity: 0.8 },
    ],
    peche: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 50000, color: '#B3E5FC', opacity: 0.7 },
      { max: 100000, color: '#4FC3F7', opacity: 0.7 },
      { max: Infinity, color: '#0288D1', opacity: 0.8 },
    ],
    default: [
      { max: 0, color: '#ccc', opacity: 0.3 },
      { max: 50000, color: '#81C784', opacity: 0.7 },
      { max: 100000, color: '#4CAF50', opacity: 0.7 },
      { max: Infinity, color: '#1B5E20', opacity: 0.8 },
    ],
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
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
