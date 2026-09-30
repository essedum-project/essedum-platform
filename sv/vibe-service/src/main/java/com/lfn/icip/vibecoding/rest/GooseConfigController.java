package com.lfn.icip.vibecoding.rest;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.vibecoding.service.VibeCodingService;

/**
 * REST controller exposing Goose config-management endpoints to the Vibe Studio frontend.
 * <p>
 * Covers: read/write config keys, providers, models, extensions, permissions,
 * prompts, slash commands, and custom providers.
 * <p>
 * Base path: {@code /${icip.pathPrefix}/service/v1/vibe-coding}
 */
@RestController
@RequestMapping("/${icip.pathPrefix}/service/v1/vibe-coding")
public class GooseConfigController {

    private static final Logger logger = LoggerFactory.getLogger(GooseConfigController.class);

    private final VibeCodingService vibeCodingService;

    public GooseConfigController(VibeCodingService vibeCodingService) {
        this.vibeCodingService = vibeCodingService;
    }

    // =========================================================================
    // CONFIG — read / write
    // =========================================================================

    /**
     * Get entire Goose configuration as a map.
     * Response: { config: map<string, any> }
     */
    @GetMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getConfig(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Get config request");
        return vibeCodingService.get("/config", null, framework);
    }

    /**
     * Read a single config key (including secrets).
     * Request: { key, is_secret }
     * Response: value
     */
    @PostMapping(value = "/config/read",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configRead(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config read request");
        return vibeCodingService.post("/config/read", request, framework);
    }

    /**
     * Create or update a config key.
     * Request: { key, value, is_secret }
     * Response: string
     */
    @PostMapping(value = "/config/upsert",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configUpsert(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config upsert request");
        return vibeCodingService.post("/config/upsert", request, framework);
    }

    /**
     * Remove a config key.
     * Request: { key, is_secret }
     * Response: string
     */
    @PostMapping(value = "/config/remove",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configRemove(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config remove request");
        return vibeCodingService.post("/config/remove", request, framework);
    }

    /**
     * Initialise the Goose configuration with defaults.
     * Response: string
     */
    @PostMapping(value = "/config/init", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configInit(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Config init request");
        return vibeCodingService.post("/config/init", null, framework);
    }

    /**
     * Backup the current Goose configuration.
     * Response: string
     */
    @PostMapping(value = "/config/backup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configBackup(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Config backup request");
        return vibeCodingService.post("/config/backup", null, framework);
    }

    /**
     * Recover Goose configuration from the last backup.
     * Response: string
     */
    @PostMapping(value = "/config/recover", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configRecover(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Config recover request");
        return vibeCodingService.post("/config/recover", null, framework);
    }

    /**
     * Validate the current Goose configuration.
     * Response: string
     */
    @GetMapping(value = "/config/validate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configValidate(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Config validate request");
        return vibeCodingService.get("/config/validate", null, framework);
    }

    // =========================================================================
    // CONFIG — providers
    // =========================================================================

    /**
     * Set the active LLM provider and model.
     * Request: { provider, model }
     * Response: (empty)
     */
    @PostMapping(value = "/config/set-provider",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configSetProvider(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config set provider request");
        return vibeCodingService.post("/config/set_provider", request, framework);
    }

    /**
     * List all available LLM providers with configuration details.
     * Response: [{ name, is_configured, provider_type, metadata: {...} }]
     */
    @GetMapping(value = "/config/providers", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configProviders(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Config providers request");
        return vibeCodingService.get("/config/providers", null, framework);
    }

    /**
     * List models available for a specific provider.
     * Response: [string]
     */
    @GetMapping(value = "/config/providers/{name}/models",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configProviderModels(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String name) {
        logger.info("Config provider models request, provider={}", name);
        return vibeCodingService.get("/config/providers/" + name + "/models", null, framework);
    }

    /**
     * Initiate OAuth flow for a provider.
     * Response: (empty)
     */
    @PostMapping(value = "/config/providers/{name}/oauth",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configProviderOauth(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String name) {
        logger.info("Config provider OAuth request, provider={}", name);
        return vibeCodingService.post("/config/providers/" + name + "/oauth", null, framework);
    }

    /**
     * Clean up OAuth credentials for a provider.
     * Response: string
     */
    @PostMapping(value = "/config/providers/{name}/cleanup",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configProviderCleanup(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String name) {
        logger.info("Config provider cleanup request, provider={}", name);
        return vibeCodingService.post("/config/providers/" + name + "/cleanup", null, framework);
    }

    /**
     * Check whether a provider can be reached and is correctly configured.
     * Request: { provider }
     * Response: (empty)
     */
    @PostMapping(value = "/config/check-provider",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configCheckProvider(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config check provider request");
        return vibeCodingService.post("/config/check_provider", request, framework);
    }

    /**
     * Browse the provider catalog (all known providers and their metadata).
     * Query: format (optional)
     * Response: [{ id, name, env_var, api_url, doc_url, format, model_count }]
     */
    @GetMapping(value = "/config/provider-catalog",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configProviderCatalog(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestParam(required = false) String format) {
        logger.info("Config provider catalog request");
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (format != null) params.add("format", format);
        return vibeCodingService.get("/config/provider-catalog", params, framework);
    }

    /**
     * Get detailed information about a single provider from the catalog.
     * Response: { id, name, env_var, api_url, doc_url, ..., models: [...] }
     */
    @GetMapping(value = "/config/provider-catalog/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configProviderCatalogEntry(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String id) {
        logger.info("Config provider catalog entry request, id={}", id);
        return vibeCodingService.get("/config/provider-catalog/" + id, null, framework);
    }

    /**
     * Get canonical model info including token costs and limits.
     * Request: { provider, model }
     * Response: { source, model_info?: { provider, model, context_limit, ... } }
     */
    @PostMapping(value = "/config/canonical-model-info",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configCanonicalModelInfo(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config canonical model info request");
        return vibeCodingService.post("/config/canonical-model-info", request, framework);
    }

    // =========================================================================
    // CONFIG — extensions
    // =========================================================================

    /**
     * List all configured extensions with optional warnings.
     * Response: { extensions: [ExtensionEntry], warnings?: [string] }
     */
    @GetMapping(value = "/config/extensions", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configExtensions(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Config extensions request");
        return vibeCodingService.get("/config/extensions", null, framework);
    }

    /**
     * Add or update an extension in the configuration.
     * Request: { name, enabled, config: ExtensionConfig }
     * Response: string
     */
    @PostMapping(value = "/config/extensions",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configAddExtension(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config add extension request");
        return vibeCodingService.post("/config/extensions", request, framework);
    }

    /**
     * Remove an extension from the configuration.
     * Response: string
     */
    @DeleteMapping(value = "/config/extensions/{name}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> configRemoveExtension(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String name) {
        logger.info("Config remove extension request, name={}", name);
        return vibeCodingService.delete("/config/extensions/" + name, framework);
    }

    // =========================================================================
    // CONFIG — permissions, prompts, slash commands
    // =========================================================================

    /**
     * Set tool-level permission overrides.
     * Request: { tool_permissions: [{ tool_name, permission: PermissionLevel }] }
     * Response: string
     */
    @PostMapping(value = "/config/permissions",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configPermissions(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config permissions request");
        return vibeCodingService.post("/config/permissions", request, framework);
    }

    /**
     * List all system prompts.
     * Response: { prompts: [{ name, description, default_content, is_customized, user_content? }] }
     */
    @GetMapping(value = "/config/prompts", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configPrompts(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Config prompts request");
        return vibeCodingService.get("/config/prompts", null, framework);
    }

    /**
     * Get a single system prompt by name.
     * Response: { name, content, default_content, is_customized }
     */
    @GetMapping(value = "/config/prompts/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configGetPrompt(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String name) {
        logger.info("Config get prompt request, name={}", name);
        return vibeCodingService.get("/config/prompts/" + name, null, framework);
    }

    /**
     * Update or create a custom system prompt.
     * Request: { content }
     * Response: string
     */
    @PutMapping(value = "/config/prompts/{name}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configUpdatePrompt(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String name,
            @RequestBody Map<String, Object> request) {
        logger.info("Config update prompt request, name={}", name);
        return vibeCodingService.put("/config/prompts/" + name, request, framework);
    }

    /**
     * Delete a custom system prompt, restoring the default.
     * Response: string
     */
    @DeleteMapping(value = "/config/prompts/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> configDeletePrompt(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String name) {
        logger.info("Config delete prompt request, name={}", name);
        return vibeCodingService.delete("/config/prompts/" + name, framework);
    }

    /**
     * List available slash commands (optionally scoped to a working directory).
     * Query: working_dir (optional)
     * Response: { commands: [{ command, help, command_type }] }
     */
    @GetMapping(value = "/config/slash-commands", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configSlashCommands(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestParam(required = false) String working_dir) {
        logger.info("Config slash commands request");
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (working_dir != null) params.add("working_dir", working_dir);
        return vibeCodingService.get("/config/slash_commands", params, framework);
    }

    // =========================================================================
    // CONFIG — custom providers
    // =========================================================================

    /**
     * Get a custom provider definition by ID.
     * Response: { config: DeclarativeProviderConfig, is_editable }
     */
    @GetMapping(value = "/config/custom-providers/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configGetCustomProvider(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String id) {
        logger.info("Config get custom provider request, id={}", id);
        return vibeCodingService.get("/config/custom-providers/" + id, null, framework);
    }

    /**
     * Create a new custom LLM provider.
     * Request: { display_name, engine, api_url, api_key, models, base_path?,
     *            headers?, requires_auth?, supports_streaming?, catalog_provider_id? }
     * Response: { provider_name }
     */
    @PostMapping(value = "/config/custom-providers",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configCreateCustomProvider(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Config create custom provider request");
        return vibeCodingService.post("/config/custom-providers", request, framework);
    }

    /**
     * Update an existing custom provider.
     * Request: (same as POST /config/custom-providers)
     * Response: string
     */
    @PutMapping(value = "/config/custom-providers/{id}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> configUpdateCustomProvider(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        logger.info("Config update custom provider request, id={}", id);
        return vibeCodingService.put("/config/custom-providers/" + id, request, framework);
    }

    /**
     * Delete a custom provider.
     * Response: string
     */
    @DeleteMapping(value = "/config/custom-providers/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> configDeleteCustomProvider(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String id) {
        logger.info("Config delete custom provider request, id={}", id);
        return vibeCodingService.delete("/config/custom-providers/" + id, framework);
    }
}
