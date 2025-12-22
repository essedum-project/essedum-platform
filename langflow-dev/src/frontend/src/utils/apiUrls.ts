/**
 * API URL Utilities for Cross-Origin Calls
 * Handles constructing proper URLs for both development and production environments
 */

/**
 * Constructs the proper API URL for AIP services
 * @param endpoint - The API endpoint (e.g., '/service/v1/streamingServices/add')
 * @returns Full URL or relative path based on environment configuration
 */
export function getAipApiUrl(endpoint: string): string {
  const useAbsoluteUrls = import.meta.env.VITE_USE_ABSOLUTE_URLS === 'true';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (useAbsoluteUrls) {
    // For production deployment - use absolute URLs to call across domains
    // langflow.az.ad.idemo-ppc.com -> essedum.az.ad.idemo-ppc.com
    const baseUrl = backendUrl || 'https://essedum.az.ad.idemo-ppc.com';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}/api/aip${cleanEndpoint}`;
  } else {
    // For development - use relative URLs (will be proxied)
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `/api/aip${cleanEndpoint}`;
  }
}

/**
 * Constructs the proper API URL for Langflow services
 * @param endpoint - The API endpoint (e.g., '/flows')
 * @returns Full URL or relative path based on environment configuration
 */
export function getLangflowApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Langflow APIs are always relative (same domain)
  return `/api/v1${cleanEndpoint}`;
}

/**
 * Check if we're in a cross-origin deployment scenario
 */
export function isCrossOriginDeployment(): boolean {
  return import.meta.env.VITE_USE_ABSOLUTE_URLS === 'true';
}

/**
 * Get the current backend URL for debugging
 */
export function getBackendUrl(): string {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
}

/**
 * Debug current API configuration
 */
export function debugApiConfig(): void {
  console.group('🌐 API Configuration');
  console.log('Use Absolute URLs:', import.meta.env.VITE_USE_ABSOLUTE_URLS);
  console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
  console.log('Force Production Proxy:', import.meta.env.VITE_FORCE_PRODUCTION_PROXY);
  console.log('Cross-Origin Mode:', isCrossOriginDeployment());
  console.log('Example AIP URL:', getAipApiUrl('/service/v1/test'));
  console.log('Example Langflow URL:', getLangflowApiUrl('/flows'));
  console.groupEnd();
}