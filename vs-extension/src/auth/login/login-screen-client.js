/**
 * Login Screen Client-side Script
 * 
 * Handles user interactions and communication with the VS Code extension
 * for the login screen webview.
 * 
 * @fileoverview Client-side JavaScript for login screen
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

(function() {
    'use strict';

    const vscode = acquireVsCodeApi();
    
    // Command constants (should match LOGIN_COMMANDS in login-constants.ts)
    const COMMANDS = {
        LOGIN: 'login',
        CANCEL: 'cancel',
        READY: 'ready',
        SHOW_LOADING: 'showLoading',
        HIDE_LOADING: 'hideLoading',
        SHOW_ERROR: 'showError',
        RESET: 'reset'
    };
    
    // DOM elements
    const networkSelect = document.getElementById('networkSelect');
    const networkInfo = document.getElementById('networkInfo');
    const infosysInfo = document.getElementById('infosysInfo');
    const lfnInfo = document.getElementById('lfnInfo');
    const loginBtn = document.getElementById('loginBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSection = document.getElementById('loadingSection');
    const formSection = document.getElementById('formSection');
    const loadingMessage = document.getElementById('loadingMessage');
    
    // Network selection handler
    networkSelect.addEventListener('change', function() {
        const selectedNetwork = this.value;
        
        // Reset info display
        infosysInfo.style.display = 'none';
        lfnInfo.style.display = 'none';
        networkInfo.style.display = 'none';
        networkInfo.className = 'network-info';
        
        if (selectedNetwork) {
            networkInfo.style.display = 'block';
            networkInfo.classList.add(selectedNetwork);
            
            if (selectedNetwork === 'infosys') {
                infosysInfo.style.display = 'block';
            } else if (selectedNetwork === 'lfn') {
                lfnInfo.style.display = 'block';
            }
            
            loginBtn.disabled = false;
        } else {
            loginBtn.disabled = true;
        }
        
        hideError();
    });
    
    // Login button handler
    loginBtn.addEventListener('click', function() {
        const selectedNetwork = networkSelect.value;
        if (selectedNetwork) {
            vscode.postMessage({
                command: COMMANDS.LOGIN,
                network: selectedNetwork
            });
        }
    });
    
    // Cancel button handler
    cancelBtn.addEventListener('click', function() {
        vscode.postMessage({
            command: COMMANDS.CANCEL
        });
    });
    
    // Message handler for extension communication
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case COMMANDS.SHOW_LOADING:
                showLoading(message.message || 'Authenticating...');
                break;
            case COMMANDS.HIDE_LOADING:
                hideLoading();
                break;
            case COMMANDS.SHOW_ERROR:
                showError(message.message);
                break;
            case COMMANDS.RESET:
                reset();
                break;
        }
    });
    
    function showLoading(message) {
        loadingMessage.textContent = message;
        formSection.classList.add('disabled');
        loadingSection.classList.add('show');
        hideError();
    }
    
    function hideLoading() {
        formSection.classList.remove('disabled');
        loadingSection.classList.remove('show');
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        hideLoading();
    }
    
    function hideError() {
        errorMessage.classList.remove('show');
    }
    
    function reset() {
        networkSelect.value = '';
        networkInfo.style.display = 'none';
        infosysInfo.style.display = 'none';
        lfnInfo.style.display = 'none';
        loginBtn.disabled = true;
        hideLoading();
        hideError();
    }
    
    // Notify extension that webview is ready
    vscode.postMessage({
        command: COMMANDS.READY
    });
})();
