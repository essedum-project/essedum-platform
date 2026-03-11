// EXAMPLE Production Environment Configuration
// Copy this file to environment.prod.ts and update with your actual URLs
// DO NOT commit environment.prod.ts to git
//
// For Docker deployments, environment.prod.ts uses __PLACEHOLDER__ tokens
// that are replaced at container startup by docker-entrypoint.sh using
// the FE_LANGFLOW_URL, FE_LANGFUSE_URL, FE_LITELLM_URL env vars.

export const environment = {
  production: true,
  baseUrl: "/api/aip",
  datasetsUrl: '/api/aip',
  langflowUrl: 'https://langflow.essedum-lfn.infosys.com/',        // Replace with actual URL
  langfuseUrl: 'https://langfuse.essedum-lfn.infosys.com/',        // Replace with actual URL
  litellmUrl: 'https://litellm.essedum-lfn.infosys.com/ui/'        // Replace with actual URL
};
