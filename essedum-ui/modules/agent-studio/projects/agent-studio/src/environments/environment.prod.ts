export const environment = {
  production: true,
  mfeName: 'agent',
  routePrefix: 'agent',
  baseUrl: '/api/aip',
  datasetsUrl: '/api/aip',
  // Substituted at container start from FE_*_URL; falls back to the shell proxy path.
  langflowUrl: '__FE_LANGFLOW_URL__',
  litellmUrl: '__FE_LITELLM_URL__',
  langfuseUrl: '__FE_LANGFUSE_URL__',
  salusUrl: '/',
};
