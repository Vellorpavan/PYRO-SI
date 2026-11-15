/**
 * DOM Utilities for Safe Rendering and Manipulation
 * Ensures XSS prevention and clean helper interfaces.
 */

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce utility for slider input events.
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 100) {
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
 * Safe text content setter.
 * @param {string} elementId 
 * @param {string|number} text 
 */
export function setText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = String(text);
  }
}
