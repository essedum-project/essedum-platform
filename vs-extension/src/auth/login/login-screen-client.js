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
    const clientId = document.getElementById('clientId');
    const baseURL = document.getElementById('baseURL');
    const advancedSection = document.getElementById('advancedSection');
    const issuerUriOverride = document.getElementById('issuerUriOverride');
    const networkInfo = document.getElementById('networkInfo');
    const lfnInfo = document.getElementById('lfnInfo');
    const loginBtn = document.getElementById('loginBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSection = document.getElementById('loadingSection');
    const formSection = document.getElementById('formSection');
    const loadingMessage = document.getElementById('loadingMessage');

    // Default realm used by Essedum Keycloak instances
    const DEFAULT_REALM = 'ESSEDUM';

    // Issuer URI follows the Keycloak convention of {baseURL}/realms/{realm}
    function deriveIssuerUri(base) {
        return base ? `${base.replace(/\/+$/, '')}/realms/${DEFAULT_REALM}` : '';
    }

    // JWK Set URI is always derived from the issuer URI using the Keycloak convention
    function deriveJwkSetUri(issuer) {
        return issuer ? `${issuer.replace(/\/+$/, '')}/protocol/openid-connect/certs` : '';
    }

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
            clientId.value = config.clientId;
            baseURL.value = config.baseURL;
            issuerUriOverride.value = '';
            advancedSection.open = false;
            advancedSection.style.display = 'none';

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
            advancedSection.style.display = 'block';
            
            // Clear fields, pre-filling Client ID with the common default
            clientId.value = 'essedum-45';
            baseURL.value = '';
            issuerUriOverride.value = '';
            advancedSection.open = false;

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
        clientId.readOnly = readonly;
        baseURL.readOnly = readonly;
        issuerUriOverride.readOnly = readonly;

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
        clientId.value = '';
        baseURL.value = '';
        issuerUriOverride.value = '';
    }

    // Helper function to update login button state
    function updateLoginButton() {
        const selectedNetwork = networkSelect.value;
        
        if (!selectedNetwork) {
            loginBtn.disabled = true;
            return;
        }

        if (selectedNetwork === 'other') {
            // Only Base URL and Client ID are required; Issuer URI override is optional
            const overrideValue = issuerUriOverride.value.trim();
            const allFieldsFilled = clientId.value.trim() && baseURL.value.trim();
            const allUrlsValid =
                isValidUrl(baseURL.value.trim()) &&
                (!overrideValue || isValidUrl(overrideValue));

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
            // Send custom configuration; derive Issuer/JWK URIs from Base URL unless overridden
            const trimmedBaseURL = baseURL.value.trim();
            const issuerUri = issuerUriOverride.value.trim() || deriveIssuerUri(trimmedBaseURL);

            vscode.postMessage({
                command: COMMANDS.LOGIN,
                network: 'custom',
                config: {
                    issuerUri: issuerUri,
                    jwkSetUri: deriveJwkSetUri(issuerUri),
                    clientId: clientId.value.trim(),
                    baseURL: trimmedBaseURL
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
        advancedSection.style.display = 'none';
        advancedSection.open = false;
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