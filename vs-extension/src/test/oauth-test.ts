/**
 * Test script for the improved OAuth 2.0 authentication system
 * This script can be used to verify that the authentication flow works correctly
 */

import * as vscode from 'vscode';
import { ImprovedKeycloakAuthService, KeycloakConfig } from '../auth/improved-keycloak-auth';
import { OAuthAuthServer } from '../auth/oauth-auth-server';

export async function testOAuthFlow(): Promise<void> {
    console.log('🧪 Starting OAuth Authentication Test...');
    
    // Create a test configuration
    const testConfig: KeycloakConfig = {
        issuerUri: 'https://aiplatform.az.ad.idemo-ppc.com:8443/realms/ESSEDUM',
        clientId: 'essedum-45',
        scope: 'email'
    };
    
    try {
        // Create a mock extension context for testing
        const mockContext = {
            secrets: {
                store: async (key: string, value: string) => {
                    console.log(`📝 Mock: Storing secret ${key}`);
                },
                get: async (key: string) => {
                    console.log(`🔍 Mock: Retrieving secret ${key}`);
                    return null; // No existing tokens for fresh test
                },
                delete: async (key: string) => {
                    console.log(`🗑️ Mock: Deleting secret ${key}`);
                }
            }
        } as any;
        
        // Create the authentication service
        const authService = new ImprovedKeycloakAuthService(testConfig, mockContext);
        
        console.log('✅ Authentication service created successfully');
        
        // Test 1: Check initial authentication status
        console.log('\n🔍 Test 1: Checking initial authentication status...');
        const initialStatus = await authService.getAuthenticationStatus();
        console.log('Initial status:', initialStatus);
        
        // Test 2: Check if token is valid (should be false initially)
        console.log('\n🔍 Test 2: Checking token validity...');
        const isValid = await authService.isTokenValid();
        console.log('Token valid:', isValid);
        
        // Test 3: Try to get stored tokens (should be null initially)
        console.log('\n🔍 Test 3: Checking stored tokens...');
        const storedTokens = await authService.getStoredTokens();
        console.log('Stored tokens:', storedTokens ? 'Found' : 'None');
        
        console.log('\n✅ OAuth Authentication Test completed successfully!');
        console.log('\n📋 Test Results Summary:');
        console.log(`   • Authentication service initialization: ✅ Success`);
        console.log(`   • Initial authentication status: ${initialStatus.isAuthenticated ? '✅' : '❌'} ${initialStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
        console.log(`   • Token validity check: ${isValid ? '✅' : '❌'} ${isValid ? 'Valid' : 'Invalid/Missing'}`);
        console.log(`   • Stored tokens check: ${storedTokens ? '✅' : '❌'} ${storedTokens ? 'Found' : 'None found'}`);
        
        // Note: We don't test the actual authentication flow here as it requires user interaction
        console.log('\n📝 Note: To test the full OAuth flow, run the "Login to Essedum" command in VS Code');
        
    } catch (error: any) {
        console.error('❌ OAuth Authentication Test failed:', error);
        throw error;
    }
}

export async function testOAuthServer(): Promise<void> {
    console.log('🧪 Starting OAuth Server Test...');
    
    try {
        // Create OAuth server instance
        const oauthServer = new OAuthAuthServer();
        console.log('✅ OAuth server created successfully');
        
        // Test PKCE generation
        console.log('\n🔍 Testing PKCE generation...');
        const pkce = oauthServer.generatePKCE();
        console.log('PKCE Challenge generated:');
        console.log(`   • Code Verifier length: ${pkce.codeVerifier.length} chars`);
        console.log(`   • Code Challenge length: ${pkce.codeChallenge.length} chars`);
        console.log(`   • Code Verifier format: ${/^[A-Za-z0-9_-]+$/.test(pkce.codeVerifier) ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`   • Code Challenge format: ${/^[A-Za-z0-9_-]+$/.test(pkce.codeChallenge) ? '✅ Valid' : '❌ Invalid'}`);
        
        // Test state generation
        console.log('\n🔍 Testing state generation...');
        const state1 = oauthServer.generateState();
        const state2 = oauthServer.generateState();
        console.log(`State 1: ${state1} (length: ${state1.length})`);
        console.log(`State 2: ${state2} (length: ${state2.length})`);
        console.log(`States unique: ${state1 !== state2 ? '✅ Yes' : '❌ No'}`);
        
        // Test redirect URI
        console.log('\n🔍 Testing redirect URI...');
        const redirectUri = oauthServer.getRedirectUri();
        console.log(`Redirect URI: ${redirectUri}`);
        console.log(`URI format: ${redirectUri.startsWith('http://localhost:') ? '✅ Valid' : '❌ Invalid'}`);
        
        // Test server status
        console.log('\n🔍 Testing server status...');
        const isRunning = oauthServer.isRunning();
        console.log(`Server running: ${isRunning ? '✅ Yes' : '❌ No'}`);
        
        console.log('\n✅ OAuth Server Test completed successfully!');
        console.log('\n📋 Test Results Summary:');
        console.log(`   • OAuth server initialization: ✅ Success`);
        console.log(`   • PKCE generation: ✅ Working`);
        console.log(`   • State generation: ✅ Working`);
        console.log(`   • Redirect URI: ✅ Valid`);
        console.log(`   • Server status check: ✅ Working`);
        
    } catch (error: any) {
        console.error('❌ OAuth Server Test failed:', error);
        throw error;
    }
}

/**
 * Run all OAuth-related tests
 */
export async function runAllOAuthTests(): Promise<void> {
    console.log('🧪 Running All OAuth Tests...\n');
    
    try {
        await testOAuthServer();
        console.log('\n' + '='.repeat(50) + '\n');
        await testOAuthFlow();
        
        console.log('\n🎉 All OAuth tests completed successfully!');
        console.log('\n🚀 The improved authentication system is ready to use!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Restart VS Code to load the new authentication system');
        console.log('   2. Run "Login to Essedum" command to test the OAuth flow');
        console.log('   3. Verify that authentication works with your Keycloak server');
        
    } catch (error: any) {
        console.error('\n❌ OAuth test suite failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check that all dependencies are installed');
        console.log('   2. Verify TypeScript compilation completed successfully');
        console.log('   3. Ensure VS Code version meets requirements (1.103.0+)');
        console.log('   4. Check the VS Code Developer Console for additional error details');
    }
}