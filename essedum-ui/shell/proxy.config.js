/**
 * Angular CLI webpack-dev-server proxy config.
 *
 * Reads backend and Keycloak URLs from environment variables or a local
 * .env.dev file in this directory (never committed — see .gitignore).
 *
 * Usage:  ng serve --proxy-config proxy.config.js
 *   (the "dev" npm script does this automatically)
 *
 * Required variables (set in .env.dev or exported in your shell):
 *   ESSEDUM_BACKEND_HOST   e.g. http://10.200.111.51:8080
 *   ESSEDUM_KEYCLOAK_HOST  e.g. http://10.200.111.51:8180
 */

const fs = require('fs');
const path = require('path');

// ── Load .env.dev (simple key=value parser, no external dependencies) ────────
function loadEnvDev() {
  const envFile = path.resolve(__dirname, '.env.dev');
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, 'utf8')
    .split('\n')
    .forEach(line => {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) process.env[match[1]] = match[2];
    });
}
loadEnvDev();

const BACKEND  = process.env.ESSEDUM_BACKEND_HOST  || 'http://localhost:8080';
const KEYCLOAK = process.env.ESSEDUM_KEYCLOAK_HOST || 'http://localhost:8180';

if (!process.env.ESSEDUM_BACKEND_HOST) {
  console.warn('[proxy.config.js] ESSEDUM_BACKEND_HOST not set — defaulting to', BACKEND);
}

const commonOpts = {
  secure: false,
  changeOrigin: true,
  logLevel: 'warn',
};

module.exports = {
  // ── Backend API ──────────────────────────────────────────────────────────
  '/api/': { target: BACKEND, ...commonOpts },
  '/services/': { target: BACKEND, ...commonOpts },
  '/cip/api': {
    target: BACKEND,
    ...commonOpts,
    pathRewrite: { '^/cip/api': '/api' },
  },

  // ── Keycloak (OIDC auth) ─────────────────────────────────────────────────
  '/realms/':    { target: KEYCLOAK, ...commonOpts },
  '/resources/': { target: KEYCLOAK, ...commonOpts },
  '/js/':        { target: KEYCLOAK, ...commonOpts },
};
