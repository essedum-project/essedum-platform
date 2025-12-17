/**
 * Environment Configuration - Easy Switching
 * 
 * TO SWITCH BETWEEN LOCAL AND PRODUCTION:
 * Just change USE_PRODUCTION_BACKEND: true/false below
 */

// 🔄 CHANGE THIS TO SWITCH ENVIRONMENTS
const USE_PRODUCTION_BACKEND = true;  // ← Change to false for local backend

export const environmentConfig = {
  development: {
    VITE_BACKEND_URL: USE_PRODUCTION_BACKEND 
      ? "https://essedum.az.ad.idemo-ppc.com"  // Production backend
      : "http://localhost:8081",               // Local backend
    VITE_FORCE_PRODUCTION_PROXY: USE_PRODUCTION_BACKEND,
    VITE_IGNORE_SSL_CERTS: true,  // Always true for development
    VITE_PORT: 3000,
  },

  production: {
    VITE_BACKEND_URL: "https://essedum.az.ad.idemo-ppc.com", 
    VITE_FORCE_PRODUCTION_PROXY: true,
    VITE_IGNORE_SSL_CERTS: false,
    VITE_PORT: 3000,
  }
};