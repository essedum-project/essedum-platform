/**
 * Environment Configuration - Easy Switching
 * 
 * TO SWITCH BETWEEN LOCAL AND PRODUCTION:
 * Just change USE_PRODUCTION_BACKEND: true/false below
 */

// 🔄 CHANGE THIS TO SWITCH ENVIRONMENTS
const USE_PRODUCTION_BACKEND = true;  // ← Change to true for production

export const environmentConfig = {
  development: {
    VITE_BACKEND_URL: USE_PRODUCTION_BACKEND 
      ? "https://essedum.az.ad.idemo-ppc.com"  // Production backend (cross-origin)
      : "http://localhost:8081",               // Local backend
    VITE_FORCE_PRODUCTION_PROXY: USE_PRODUCTION_BACKEND ? false : false,  // Use direct calls in prod
    VITE_USE_ABSOLUTE_URLS: USE_PRODUCTION_BACKEND,      // Use full URLs for cross-origin
    VITE_IGNORE_SSL_CERTS: true,  // Always true for development
    VITE_PORT: 3000,
  },

  production: {
    VITE_BACKEND_URL: "https://essedum.az.ad.idemo-ppc.com", 
    VITE_FORCE_PRODUCTION_PROXY: false,    // No proxy in production - use direct calls
    VITE_USE_ABSOLUTE_URLS: true,          // Use full URLs for cross-origin calls
    VITE_IGNORE_SSL_CERTS: false,
    VITE_PORT: 3000,
  }
};