/**
 * Angular CLI webpack-dev-server proxy config — forwards /api/usm/** to the
 * real sv/usm-service backend so the standalone `npm start` dev server can
 * call the live RBAC endpoints instead of mock data.
 *
 * Required env var (or set in a local, gitignored .env.dev — see
 * essedum-ui/shell/proxy.config.js for the loader pattern this mirrors):
 *   ESSEDUM_BACKEND_HOST   e.g. http://localhost:8080
 */

const BACKEND = process.env.ESSEDUM_BACKEND_HOST || 'http://localhost:8080';

if (!process.env.ESSEDUM_BACKEND_HOST) {
  console.warn('[proxy.config.js] ESSEDUM_BACKEND_HOST not set — defaulting to', BACKEND);
}

module.exports = {
  '/api/': {
    target: BACKEND,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
};
