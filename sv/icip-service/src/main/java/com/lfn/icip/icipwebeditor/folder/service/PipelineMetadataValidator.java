package com.lfn.icip.icipwebeditor.folder.service;

import com.lfn.icip.icipwebeditor.config.PipelineMetadataConfig;
import com.lfn.icip.icipwebeditor.exception.PipelineMetadataValidationException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Validates metadata.json inside every uploaded pipeline package.
 *
 * <p>The {@code pipelineType} parameter accepted by each entry-point maps the
 * caller-supplied request param value ("App", "Agent", "MCP") to the correct
 * set of validation rules loaded from {@link PipelineMetadataConfig}.
 */
@Service
public class PipelineMetadataValidator {

    private static final Logger logger = LoggerFactory.getLogger(PipelineMetadataValidator.class);

    static final String METADATA_FILENAME = "metadata.json";

    @Autowired
    private PipelineMetadataConfig config;

    // ── Public entry points ───────────────────────────────────────────────────

    /**
     * Validates metadata.json from a multipart ZIP upload.
     *
     * @param zipFile      the uploaded ZIP file
     * @param pipelineType frontend-supplied type value (e.g. "App", "Agent", "MCP")
     * @throws PipelineMetadataValidationException if validation fails
     */
    public void validateFromZip(MultipartFile zipFile, String pipelineType) {
        try {
            JSONObject metadata = extractFromZipStream(zipFile.getInputStream());
            validate(metadata, pipelineType);
        } catch (PipelineMetadataValidationException e) {
            throw e;
        } catch (IOException e) {
            throw new PipelineMetadataValidationException(
                    "Failed to read the uploaded ZIP file for metadata.json validation: " + e.getMessage(), e);
        }
    }

    /**
     * Validates metadata.json from a server-side folder path or .zip file.
     *
     * @param folderOrZipPath absolute path to a directory or a .zip file
     * @param pipelineType    request param type: "App", "Agent", or "MCP"
     * @throws PipelineMetadataValidationException if validation fails
     */
    public void validateFromFolderPath(String folderOrZipPath, String pipelineType) {
        Path path = Paths.get(folderOrZipPath);
        if (!Files.exists(path)) {
            throw new PipelineMetadataValidationException(
                    "Pipeline path does not exist: " + folderOrZipPath);
        }
        JSONObject metadata;
        try {
            if (Files.isRegularFile(path) && folderOrZipPath.toLowerCase().endsWith(".zip")) {
                try (InputStream is = Files.newInputStream(path)) {
                    metadata = extractFromZipStream(is);
                }
            } else if (Files.isDirectory(path)) {
                metadata = extractFromDirectory(path);
            } else {
                throw new PipelineMetadataValidationException(
                        "Unsupported path — provide a .zip file or a directory: " + folderOrZipPath);
            }
        } catch (PipelineMetadataValidationException e) {
            throw e;
        } catch (IOException e) {
            throw new PipelineMetadataValidationException(
                    "Failed to read the path for metadata validation: " + folderOrZipPath + " — " + e.getMessage(), e);
        }
        validate(metadata, pipelineType);
    }

    // ── Core validation ───────────────────────────────────────────────────────

    private void validate(JSONObject metadata, String pipelineType) {
        if (pipelineType == null || pipelineType.isBlank()) {
            throw new PipelineMetadataValidationException(
                    "Pipeline type parameter is required in metadata.json. Allowed values: application, agent, mcp.");
        }

        // Validate that metadata.json 'type' field matches the supplied pipeline type (case-insensitive)
        String metaType = metadata.optString("type", "").trim();
        if (!metaType.equalsIgnoreCase(pipelineType)) {
            throw new PipelineMetadataValidationException(
                    "The selected upload type doesn't match the file configuration in metadata.json. Please use "
                    + pipelineType + " instead of " + metaType + " and try again");
        }

        JSONObject framework = metadata.optJSONObject("framework");
        if (framework == null) {
            throw new PipelineMetadataValidationException(
                    "metadata.json is missing the required 'framework' object for type '" + pipelineType + "'.");
        }

        // Dispatch to the correct validator based on pipelineType
        switch (pipelineType.toLowerCase()) {
            case "application" -> validateApplication(framework);
            case "agent"       -> validateAgent(framework);
            case "mcp"         -> validateMcp(framework);
            default -> throw new PipelineMetadataValidationException(
                    "Unsupported pipeline type '" + pipelineType + "' in metadata.json. Allowed values: application, agent, mcp.");
        }

        logger.debug("metadata.json validated successfully for pipelineType='{}'", pipelineType);
    }

    private void validateApplication(JSONObject framework) {
        List<String> allowed = toLower(config.getApplication().getAllowedFrameworks());
        if (allowed.isEmpty()) {
            throw new IllegalStateException(
                    "Application allowed frameworks is not configured in application.yml");
        }
        String value = framework.optString("applicationFramework", "").trim();
        if (value.isEmpty()) {
            throw new PipelineMetadataValidationException(
                    "Application Framework Tag is missing in metadata.json");
        }
        if (!allowed.contains(value.toLowerCase())) {
            throw new PipelineMetadataValidationException(
                    "Application Framework values are incorrect in metadata.json");
        }
    }

    private void validateAgent(JSONObject framework) {
        List<String> allowed = toLower(config.getAgent().getAllowedFrameworks());
        if (allowed.isEmpty()) {
            throw new IllegalStateException(
                    "Agent Framework is not configured in application.yml");
        }
        String value = framework.optString("agentFramework", "").trim();
        if (value.isEmpty()) {
            throw new PipelineMetadataValidationException(
                    "Agent Framework Tag is missing in metadata.json");
        }
        if (!allowed.contains(value.toLowerCase())) {
            throw new PipelineMetadataValidationException(
                    "Agent Framework value present in metadata.json is not allowed");
        }
    }

    private void validateMcp(JSONObject framework) {
        String requiredFramework = config.getMcp().getRequiredServerFramework();
        List<String> requiredProtocols = toLower(config.getMcp().getRequiredProtocols());

        if (requiredFramework == null || requiredFramework.isBlank()) {
            throw new IllegalStateException(
                    "Required server-framework is not configured in application.yml");
        }
        if (requiredProtocols.isEmpty()) {
            throw new IllegalStateException(
                    "Required mcp server protocols is not configured in application.yml");
        }

        // Validate serverFramework
        String serverFramework = framework.optString("serverFramework", "").trim();
        if (serverFramework.isEmpty()) {
            throw new PipelineMetadataValidationException(
                    "Server Framework Tag is missing in metadata.json");
        }
        if (!requiredFramework.equalsIgnoreCase(serverFramework)) {
            throw new PipelineMetadataValidationException(
                    "Incorrect Server Framework in metadata.json");
        }

        // Validate protocolSupport ��� must contain ALL required protocols
        JSONArray arr = framework.optJSONArray("protocolSupport");
        List<String> provided = arr == null
                ? List.of()
                : arr.toList().stream().map(o -> o.toString().toLowerCase()).collect(Collectors.toList());
        List<String> missing = requiredProtocols.stream()
                .filter(p -> !provided.contains(p))
                .toList();
        if (!missing.isEmpty()) {
            throw new PipelineMetadataValidationException(
                    "Server Framework Tag is missing required protocols in metadata.json");
        }
    }

    // ── Extraction helpers ──────────────���─────────────────────────────────────

    private JSONObject extractFromZipStream(InputStream zipStream) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(zipStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = Paths.get(entry.getName()).getFileName().toString();
                if (!entry.isDirectory() && METADATA_FILENAME.equalsIgnoreCase(name)) {
                    String content = new String(zis.readAllBytes());
                    zis.closeEntry();
                    return parseJson(content);
                }
                zis.closeEntry();
            }
        }
        throw new PipelineMetadataValidationException(
                "Please add metadata.json at the root level of ZIP folder to be uploaded.");
    }

    private JSONObject extractFromDirectory(Path rootDir) throws IOException {
        Path metaPath = rootDir.resolve(METADATA_FILENAME);
        if (!Files.exists(metaPath)) {
            throw new PipelineMetadataValidationException(
                    "Directory does not contain '" + METADATA_FILENAME + "' at its root: " + rootDir + ".");
        }
        return parseJson(Files.readString(metaPath));
    }

    private JSONObject parseJson(String content) {
        try {
            return new JSONObject(content);
        } catch (Exception e) {
            throw new PipelineMetadataValidationException(
                    "'" + METADATA_FILENAME + "' contains invalid JSON: " + e.getMessage(), e);
        }
    }

    private List<String> toLower(List<String> input) {
        return input.stream().map(String::toLowerCase).collect(Collectors.toList());
    }
}
