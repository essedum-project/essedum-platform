export const environment = {
  production: true,
  mfeName: 'integration',
  routePrefix: 'integration',
  baseUrl: '/api/aip',
  datasetsUrl: '/api/aip',
  // Substituted at container start from FE_SALUS_URL; falls back to the shell proxy path.
  salusUrl: '__FE_SALUS_URL__',
};
