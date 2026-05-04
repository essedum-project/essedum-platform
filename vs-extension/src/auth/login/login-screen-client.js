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

(function () {
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
    const configFields = document.getElementById('configFields');
    const issuerUri = document.getElementById('issuerUri');
    const jwkSetUri = document.getElementById('jwkSetUri');
    const clientId = document.getElementById('clientId');
    const baseURL = document.getElementById('baseURL');
    const networkInfo = document.getElementById('networkInfo');
    const lfnInfo = document.getElementById('lfnInfo');
    const loginBtn = document.getElementById('loginBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSection = document.getElementById('loadingSection');
    const formSection = document.getElementById('formSection');
    const loadingMessage = document.getElementById('loadingMessage');

    // Network configurations (should match environment.ts)
    const networkConfigs = {
        // infosys: {
        //     issuerUri: 'https://aiplatform.az.ad.idemo-ppc.com:8443/realms/ESSEDUM',
        //     jwkSetUri: 'https://aiplatform.az.ad.idemo-ppc.com:8443/realms/ESSEDUM/protocol/openid-connect/certs',
        //     clientId: 'essedum-45',
        //     baseURL: 'https://essedum.az.ad.idemo-ppc.com'
        // },
        lfn: {
            issuerUri: 'https://login.lfn.essedum.anuket.iol.unh.edu:8443/realms/ESSEDUM',
            jwkSetUri: 'https://login.lfn.essedum.anuket.iol.unh.edu:8443/realms/ESSEDUM/protocol/openid-connect/certs',
            clientId: 'essedum-45',
            baseURL: 'https://lfn.essedum.anuket.iol.unh.edu'
        }
        // server5g: {
        //     issuerUri: 'https://login.essedum-lfn.infosys.com/realms/ESSEDUM',
        //     jwkSetUri: 'https://login.essedum-lfn.infosys.com:8443/realms/ESSEDUM/protocol/openid-connect/certs',
        //     clientId: 'essedum-45',
        //     baseURL: 'https://essedum-lfn.infosys.com'
        // }
    };

    // Network selection handler
    networkSelect.addEventListener('change', function () {
        const selectedNetwork = this.value;

        // Reset info display
        lfnInfo.style.display = 'none';
        networkInfo.style.display = 'none';
        networkInfo.className = 'network-info';

        if (selectedNetwork && selectedNetwork !== 'other') {
            // Predefined network selected
            configFields.style.display = 'block';
            networkInfo.style.display = 'block';
            networkInfo.classList.add(selectedNetwork);

            // Populate fields with readonly values
            const config = networkConfigs[selectedNetwork];
            issuerUri.value = config.issuerUri;
            jwkSetUri.value = config.jwkSetUri;
            clientId.value = config.clientId;
            baseURL.value = config.baseURL;

            // Make fields readonly
            setFieldsReadonly(true);

            // Show network info
            if (selectedNetwork === 'lfn') {
                lfnInfo.style.display = 'block';
            } 

            loginBtn.disabled = false;
        } else if (selectedNetwork === 'other') {
            // Other option selected - allow editing
            configFields.style.display = 'block';
            
            // Clear fields
            issuerUri.value = '';
            jwkSetUri.value = '';
            clientId.value = '';
            baseURL.value = '';

            // Make fields editable
            setFieldsReadonly(false);

            // Update login button based on field values
            updateLoginButton();
        } else {
            // No selection
            configFields.style.display = 'none';
            clearFields();
            loginBtn.disabled = true;
        }

        hideError();
    });

    // Input handlers for custom configuration fields
    const configInputs = document.querySelectorAll('.config-input');
    configInputs.forEach(input => {
        input.addEventListener('input', function () {
            updateLoginButton();
            hideError();
        });
    });

    // Helper function to set readonly state of config fields
    function setFieldsReadonly(readonly) {
        issuerUri.readOnly = readonly;
        jwkSetUri.readOnly = readonly;
        clientId.readOnly = readonly;
        baseURL.readOnly = readonly;

        // Update visual styling
        configInputs.forEach(input => {
            if (readonly) {
                input.classList.add('readonly');
            } else {
                input.classList.remove('readonly');
            }
        });
    }

    // Helper function to clear all config fields
    function clearFields() {
        issuerUri.value = '';
        jwkSetUri.value = '';
        clientId.value = '';
        baseURL.value = '';
    }

    // Helper function to update login button state
    function updateLoginButton() {
        const selectedNetwork = networkSelect.value;
        
        if (!selectedNetwork) {
            loginBtn.disabled = true;
            return;
        }

        if (selectedNetwork === 'other') {
            // For custom config, all fields must be filled and valid
            const allFieldsFilled = 
                issuerUri.value.trim() && 
                jwkSetUri.value.trim() && 
                clientId.value.trim() && 
                baseURL.value.trim();
            
            const allUrlsValid = 
                isValidUrl(issuerUri.value.trim()) &&
                isValidUrl(jwkSetUri.value.trim()) &&
                isValidUrl(baseURL.value.trim());

            loginBtn.disabled = !(allFieldsFilled && allUrlsValid);
        } else {
            loginBtn.disabled = false;
        }
    }

    // Helper function to validate URL
    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // Login button handler
    loginBtn.addEventListener('click', function () {
        const selectedNetwork = networkSelect.value;
        
        if (!selectedNetwork) {
            return;
        }

        if (selectedNetwork === 'other') {
            // Send custom configuration
            vscode.postMessage({
                command: COMMANDS.LOGIN,
                network: 'custom',
                config: {
                    issuerUri: issuerUri.value.trim(),
                    jwkSetUri: jwkSetUri.value.trim(),
                    clientId: clientId.value.trim(),
                    baseURL: baseURL.value.trim()
                }
            });
        } else {
            // Send predefined network name
            vscode.postMessage({
                command: COMMANDS.LOGIN,
                network: selectedNetwork
            });
        }
    });

    // Cancel button handler
    cancelBtn.addEventListener('click', function () {
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
        configFields.style.display = 'none';
        clearFields();
        setFieldsReadonly(true);
        networkInfo.style.display = 'none';
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
