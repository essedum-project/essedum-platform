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
   * Generate fresh Langflow token
   */
  public async fetchFreshLangflowToken(): Promise<string> {
    const cleanBaseUrl = this.getCleanBaseUrl();
    console.log('🔄 Starting automated token generation for Langflow...');

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
        const token = await authMethods[i]();
        if (token) {
          console.log(`✅ Successfully generated token using method ${i + 1}`);
          this.cacheToken(token);
          return token;
        }
      } catch (error) {
        console.error(`❌ Auth method ${i + 1} failed:`, error);
      }
    }

    // Final fallback to any stored token
    const storedToken = localStorage.getItem('access_token_lf');
    if (storedToken) {
      console.log('⚠️ Using stored token as last resort');
      return storedToken;
    }

    console.error('🚨 All automated methods failed, no emergency token available');
    throw new Error('Failed to generate Langflow token');
  }

  /**
   * Method 1: Try to authenticate with Langflow using form data
   */
  private async tryLoginWithCredentials(baseUrl: string): Promise<string | null> {
    console.log('🔐 Trying browser-style authentication...');
    
    try {
      const loginUrl = `${baseUrl}/api/v1/login`;
      const formData = new URLSearchParams();
      formData.append('username', 'admin');
      formData.append('password', 'admin');

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          console.log('✅ Successfully got token from login');
          return data.access_token;
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    return null;
  }

  /**
   * Method 2: Try direct token generation endpoint
   */
  private async tryTokenGeneration(baseUrl: string): Promise<string | null> {
    console.log('🎫 Trying direct token generation...');
    
    try {
      const tokenUrl = `${baseUrl}/api/v1/login`;
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          console.log('✅ Token generated successfully');
          return data.access_token;
        }
      }
    } catch (error) {
      console.error('Token generation failed:', error);
    }
    
    return null;
  }

  /**
   * Method 3: Try session-based authentication
   */
  private async trySessionBasedAuth(baseUrl: string): Promise<string | null> {
    console.log('🍪 Trying session-based authentication...');
    
    try {
      const sessionUrl = `${baseUrl}/api/v1/auto_login`;
      const response = await fetch(sessionUrl, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          console.log('✅ Session auth successful');
          return data.access_token;
        }
      }
    } catch (error) {
      console.error('Session auth failed:', error);
    }
    return null;
  }

  /**
   * Method 4: Try to generate a working token using Langflow's web session
   */
  private async tryAPIKeyGeneration(baseUrl: string): Promise<string | null> {
    console.log('🔑 Trying to extract or generate API key from Langflow web interface...');
    
    try {
      const apiKeyUrl = `${baseUrl}/api/v1/api_key`;
      const response = await fetch(apiKeyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'auto_generated_key',
          expires_at: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.api_key) {
          console.log('✅ API key generated');
          return data.api_key;
        }
      }
    } catch (error) {
      console.error('API key generation failed:', error);
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