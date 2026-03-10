// EXAMPLE Production Environment Configuration
// Copy this file to environment.prod.ts and update with your actual URLs
// DO NOT commit environment.prod.ts to git

export const environment = {
  production: true,
  baseUrl: "/api/aip",
  datasetsUrl: '/api/aip',
  langflowUrl: 'https://YOUR_LANGFLOW_URL_HERE/',  // Replace with actual URL
  langfuseUrl: 'https://YOUR_LANGFUSE_URL_HERE/',  // Replace with actual URL
  litellmUrl: 'https://YOUR_LITELLM_URL_HERE/ui/'  // Replace with actual URL
};
