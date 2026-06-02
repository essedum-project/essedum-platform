export const environment = {
  production: false,
  mfeName: 'data-ops',
  routePrefix: 'data',
  // API endpoints. In the federated context, the host's HttpClient interceptor
  // adds the bearer token; these prefixes route through the nginx /api/* proxy.
  baseUrl: '/api/aip',
  datasetsUrl: '/api/aip',
};
