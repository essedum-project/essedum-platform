import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LangflowConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class LangflowApiService {
  
  private config: LangflowConfig = {
    baseUrl: 'https://langflow.az.ad.idemo-ppc.com',
    timeout: 30000
  };

  constructor(private http: HttpClient) {
    this.loadConfiguration();
    this.startTokenMonitoring();
  }

  /**
   * Generate fresh Langflow token using multiple authentication methods
   */
  public async fetchFreshLangflowToken(): Promise<string> {
    const cleanBaseUrl = this.getCleanBaseUrl();
    console.log('🔄 Starting automated token generation for Langflow...');

    // DO NOT use cached token in fetchFreshLangflowToken - this method should always fetch fresh
    console.log('🔄 Forcing fresh token generation (bypassing cache)...');

    // Try multiple authentication methods in order
    const authMethods = [
      () => this.tryLoginWithCredentials(cleanBaseUrl),
      () => this.tryTokenGeneration(cleanBaseUrl),
      () => this.trySessionBasedAuth(cleanBaseUrl),
      () => this.tryAPIKeyGeneration(cleanBaseUrl)
    ];

    for (let i = 0; i < authMethods.length; i++) {
      try {
        console.log(`🔍 Trying authentication method ${i + 1}/${authMethods.length}...`);
        const token = await authMethods[i]();
        if (token && this.isTokenValid(token)) {
          console.log(`✅ Successfully generated token using method ${i + 1}`);
          this.cacheToken(token);
          return token;
        }
      } catch (error) {
        console.warn(`⚠️ Authentication method ${i + 1} failed:`, error);
        continue;
      }
    }

    // Final fallback to any stored token (even if expired, might still work)
    const storedToken = localStorage.getItem('access_token_lf');
    if (storedToken) {
      console.log('⚠️ Using stored token as last resort');
      return storedToken;
    }

    console.error('🚨 All automated methods failed');
    throw new Error('Failed to generate Langflow token');
  }

  /**
   * Method 1: Try to authenticate with Langflow using form data (like the web interface)
   */
  private async tryLoginWithCredentials(baseUrl: string): Promise<string | null> {
    console.log('🔐 Trying browser-style authentication...');
    
    try {
      // First, try the auto_login endpoint as mentioned in the docs - NO CREDENTIALS
      console.log('� Trying auto_login endpoint...');
      const autoLoginUrl = `${baseUrl}/api/v1/auto_login`;
      
      const autoLoginResponse = await fetch(autoLoginUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        mode: 'cors'
      });

      if (autoLoginResponse.ok) {
        const data = await autoLoginResponse.json();
        const token = data.access_token || data.token;
        if (token) {
          console.log('✅ Auto login successful');
          return token;
        }
      } else {
        console.warn(`⚠️ Auto login failed with ${autoLoginResponse.status}: ${autoLoginResponse.statusText}`);
      }

      // Fallback: try login with JSON payload (proper format)
      const loginUrl = `${baseUrl}/api/v1/login`;
      
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: new URLSearchParams({
          username: 'admin',
          password: 'admin'
        })
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        const token = data.access_token || data.token;
        if (token) {
          console.log('✅ Form-encoded login successful');
          return token;
        }
      } else {
        console.warn(`⚠️ Form login failed with ${loginResponse.status}: ${loginResponse.statusText}`);
      }

      // Try with JSON payload as well
      const jsonLoginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      });

      if (jsonLoginResponse.ok) {
        const jsonData = await jsonLoginResponse.json();
        const jsonToken = jsonData.access_token || jsonData.token;
        if (jsonToken) {
          console.log('✅ JSON login successful');
          return jsonToken;
        }
      } else {
        console.warn(`⚠️ JSON login failed with ${jsonLoginResponse.status}: ${jsonLoginResponse.statusText}`);
      }

    } catch (error) {
      console.warn('⚠️ Browser-style login failed:', error);
    }
    return null;
  }

  /**
   * Method 2: Try direct token generation endpoint (based on Langflow v1.5+ API)
   */
  private async tryTokenGeneration(baseUrl: string): Promise<string | null> {
    console.log('🎫 Trying direct token generation...');
    
    // Try POST to login endpoint to get access token (standard OAuth2 flow)
    try {
      const tokenUrl = `${baseUrl}/api/v1/login`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username: 'admin',  // Default Langflow credentials
          password: 'admin'
        }),
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token || data.token;
        if (token) {
          console.log('✅ Token generated via login endpoint');
          return token;
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.warn(`⚠️ Login token generation failed with ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.warn('⚠️ Token generation error:', error);
    }

    // Try API key endpoint if available
    try {
      const apiKeyUrl = `${baseUrl}/api/v1/api_key`;
      
      const response = await fetch(apiKeyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'auto-generated-key',
          expiry_date: null
        }),
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        const apiKey = data.api_key || data.key;
        if (apiKey) {
          console.log('✅ API key generated');
          return apiKey;
        }
      }
    } catch (error) {
      console.warn('⚠️ API key generation failed:', error);
    }
    
    return null;
  }

  /**
   * Method 3: Try session-based authentication (fixed CORS)
   */
  private async trySessionBasedAuth(baseUrl: string): Promise<string | null> {
    console.log('🍪 Trying session-based authentication...');
    
    try {
      // Try to get session token directly via API (no credentials)
      const sessionResponse = await fetch(`${baseUrl}/api/v1/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}),
        mode: 'cors'
      });

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log('✅ Session created:', sessionData);
        
        // Try auto_login without credentials after session
        const autoLoginResponse = await fetch(`${baseUrl}/api/v1/auto_login`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        if (autoLoginResponse.ok) {
          const data = await autoLoginResponse.json();
          const token = data.access_token || data.token;
          if (token) {
            console.log('✅ Auto login after session successful');
            return token;
          }
        } else {
          console.warn(`⚠️ Auto login after session failed: ${autoLoginResponse.status}`);
        }
      } else {
        console.warn(`⚠️ Session creation failed: ${sessionResponse.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Session-based auth error:', error);
    }
    return null;
  }

  /**
   * Method 4: Try to generate a working token using Langflow's web session
   */
  private async tryAPIKeyGeneration(baseUrl: string): Promise<string | null> {
    console.log('🔑 Trying to extract or generate API key from Langflow web interface...');
    
    try {
      console.log('🔄 Skipping token testing, will generate fresh token via authentication...');

      // Try the default admin login directly (common in Langflow setups)
      console.log('🔧 Trying default admin login...');
      const adminLoginResponse = await fetch(`${baseUrl}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username: 'admin',
          password: 'admin'
        }),
        mode: 'cors'
      });

      if (adminLoginResponse.ok) {
        const adminData = await adminLoginResponse.json();
        const adminToken = adminData.access_token || adminData.token;
        if (adminToken) {
          console.log('✅ Successfully logged in with default admin credentials');
          return adminToken;
        }
      } else {
        const errorText = await adminLoginResponse.text().catch(() => 'No error details');
        console.warn(`⚠️ Admin login failed with ${adminLoginResponse.status}: ${errorText}`);
      }

    } catch (error) {
      console.warn('⚠️ API key generation failed:', error);
    }
    return null;
  }

  /**
   * Check if a JWT token is still valid
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      return expirationTime > (currentTime + bufferTime);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cached token if it's still valid
   */
  private getCachedValidToken(): string | null {
    try {
      const cachedToken = localStorage.getItem('access_token_lf');
      if (cachedToken && this.isTokenValid(cachedToken)) {
        return cachedToken;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cache token with metadata
   */
  private cacheToken(token: string): void {
    try {
      localStorage.setItem('access_token_lf', token);
      localStorage.setItem('access_token_lf_cached_at', Date.now().toString());
    } catch (error) {
      console.error('Failed to cache token:', error);
    }
  }

  /**
   * Get a valid token, refreshing if necessary
   */
  public async getValidToken(): Promise<string> {
    console.log('🔍 Getting valid token...');
    
    const cachedToken = this.getCachedValidToken();
    if (cachedToken) {
      const isValid = await this.testTokenValidity(cachedToken);
      if (isValid) {
        console.log('✅ Using valid cached token');
        return cachedToken;
      }
    }
    
    console.log('🔄 Token expired or missing, fetching fresh token...');
    const newToken = await this.fetchFreshLangflowToken();
    console.log('✅ Fresh token acquired successfully');
    return newToken;
  }

  /**
   * Force refresh token
   */
  public async forceRefreshToken(): Promise<string> {
    console.log('🔄 Force refreshing token...');
    localStorage.removeItem('access_token_lf');
    localStorage.removeItem('access_token_lf_cached_at');
    
    return this.fetchFreshLangflowToken();
  }

  /**
   * Test if a token is valid by making a simple API call
   */
  private async testTokenValidity(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start monitoring token and proactively refresh when needed
   */
  private startTokenMonitoring(): void {
    setInterval(async () => {
      const cachedToken = this.getCachedValidToken();
      if (!cachedToken) {
        console.log('🔄 Proactively refreshing expired token...');
        await this.fetchFreshLangflowToken();
      }
    }, 5 * 60 * 1000);

    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden) {
        const cachedToken = this.getCachedValidToken();
        if (!cachedToken) {
          console.log('🔄 Page visible again, refreshing token...');
          await this.fetchFreshLangflowToken();
        }
      }
    });
  }

  /**
   * Load Langflow configuration
   */
  private loadConfiguration(): void {
    console.log('🔧 Loading Langflow configuration...');
    
    this.config.baseUrl = 'https://langflow.az.ad.idemo-ppc.com/';
    console.log('✅ Using environment langflowUrl:', this.config.baseUrl);

    const envLangflowUrl = (window as any)?.environment?.langflowUrl;
    if (envLangflowUrl) {
      this.config.baseUrl = envLangflowUrl;
      console.log('✅ Updated from window.environment:', this.config.baseUrl);
    }

    const savedConfig = localStorage.getItem('langflow-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
        console.log('✅ Loaded config from localStorage');
      } catch (e) {
        console.error('Failed to parse saved config');
      }
    }

    if (this.config.baseUrl) {
      if (this.config.baseUrl.includes('://') && this.config.baseUrl.lastIndexOf('://') > this.config.baseUrl.indexOf('://')) {
        const parts = this.config.baseUrl.split('://');
        this.config.baseUrl = parts[parts.length - 2] + '://' + parts[parts.length - 1];
        console.log('🧹 Cleaned double protocol from baseUrl:', this.config.baseUrl);
      }

      this.config.baseUrl = this.config.baseUrl.replace(/([^:])\/+/g, '$1/');

      if (this.config.baseUrl.endsWith('/')) {
        this.config.baseUrl = this.config.baseUrl.slice(0, -1);
      }
    }

    console.log('🔧 Langflow API Service initialized with config:', {
      baseUrl: this.config.baseUrl,
      usesDynamicTokens: true,
      timeout: this.config.timeout
    });
  }

  /**
   * Get clean base URL without any proxy prefixes or double protocols
   */
  private getCleanBaseUrl(): string {
    let cleanUrl = this.config.baseUrl;
    
    console.log(`🧹 Cleaning baseUrl: ${cleanUrl}`);
    
    if (cleanUrl.includes('://') && cleanUrl.lastIndexOf('://') > cleanUrl.indexOf('://')) {
      const parts = cleanUrl.split('://');
      cleanUrl = parts[parts.length - 2] + '://' + parts[parts.length - 1];
      console.log('🧹 Removed double protocol:', cleanUrl);
    }
    
    cleanUrl = cleanUrl.replace(/([^:])\/+/g, '$1/');
    
    if (!cleanUrl.match(/^https?:\/\//)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    console.log(`🧹 Final clean URL: ${cleanUrl}`);
    return cleanUrl;
  }
}