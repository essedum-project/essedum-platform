/**
 * Example of how to use the API utilities for AIP calls
 * This shows how to make calls that work in both development and production
 */

import { getAipApiUrl, debugApiConfig } from '@/utils/apiUrls';

// Example: Create a streaming service
export async function createStreamingService(data: any) {
  const url = getAipApiUrl('/service/v1/streamingServices/add');
  
  console.log('Making AIP API call to:', url);
  debugApiConfig(); // Show current configuration
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        // Note: Authorization and other headers are automatically added by interceptors
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('AIP API call failed:', error);
    throw error;
  }
}

// Example: Get streaming services
export async function getStreamingServices() {
  const url = getAipApiUrl('/service/v1/streamingServices');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get streaming services:', error);
    throw error;
  }
}