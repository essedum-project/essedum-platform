/**
 * Environment Configuration - Easy Switching
 * 
 * TO SWITCH BETWEEN LOCAL AND PRODUCTION:
 * Just change USE_PRODUCTION_BACKEND: true/false below
 */

// 🔄 CHANGE THIS TO SWITCH ENVIRONMENTS  
const USE_PRODUCTION_BACKEND = true;  // ← KEEP TRUE for AKS deployment

export const environmentConfig = {
  development: {
    VITE_BACKEND_URL: USE_PRODUCTION_BACKEND 
      ? ""  // Use relative URLs - will be proxied by nginx in production
      : "http://localhost:8081",               // Local backend
    VITE_FORCE_PRODUCTION_PROXY: false,  // Always use proxy approach  
    VITE_USE_ABSOLUTE_URLS: false,       // Use relative URLs for nginx proxy
    VITE_IGNORE_SSL_CERTS: true,  // Always true for development
    VITE_PORT: 3000,
  },

  production: {
    VITE_BACKEND_URL: "", // Use relative URLs - nginx will proxy to internal service
    VITE_FORCE_PRODUCTION_PROXY: false,    
    VITE_USE_ABSOLUTE_URLS: false,  // Use relative URLs for nginx proxy
    VITE_IGNORE_SSL_CERTS: false,
    VITE_PORT: 3000,
  }
};