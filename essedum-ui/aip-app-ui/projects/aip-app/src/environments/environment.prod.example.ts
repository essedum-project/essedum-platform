// EXAMPLE Production Environment Configuration
// Copy this file to environment.prod.ts and update with your actual URLs
// DO NOT commit environment.prod.ts to git

export const environment = {
  production: true,
  baseUrl: "/api/aip",
  datasetsUrl: '/api/aip',
  langflowUrl: '__FE_LANGFLOW_URL__',
  litellmUrl:'__FE_LITELLM_URL__',
   langfuseUrl:'__FE_LANGFUSE_URL__',
  salusUrl:'__FE_SALUS_URL__'
};
 