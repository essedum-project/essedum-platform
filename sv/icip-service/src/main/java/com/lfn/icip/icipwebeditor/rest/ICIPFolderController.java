/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * <p>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * <p>
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * <p>
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.rest;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.exception.*;
import com.lfn.icip.icipwebeditor.folder.service.ICIPFolderService;
import com.lfn.icip.icipwebeditor.folder.service.PipelineMetadataValidator;
import com.lfn.icip.icipwebeditor.model.ICIPAiAgentScript;
import com.lfn.icip.icipwebeditor.model.dto.ICIPAiAgentScriptDTO;
import com.lfn.icip.icipwebeditor.repository.ICIPAiAgentScriptRepository;
import com.lfn.icip.icipwebeditor.service.impl.GitHubService;
import io.micrometer.core.annotation.Timed;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPFileController.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/folder")
public class ICIPFolderController {

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(ICIPFolderController.class);

    /** The file service. */
    @Autowired
    private ICIPFolderService folderService;

    @Autowired
    private ICIPAiAgentScriptRepository aiAgentScriptRepository;

    @Autowired
    private GitHubService githubservice;

    @Autowired
    private ICIPDatasourceService datasourceService;

    @EssedumProperty("icip.script.github.enabled")
    private String remoteScript;

    /** Validates metadata.json inside every uploaded pipeline package. */
    @Autowired
    private PipelineMetadataValidator pipelineMetadataValidator;

    /**
     * Upload file.
     *
     * @param cname      the customer name
     * @param org        the organization
     * @param type       the pipeline type: App, Agent, or MCP
     * @param zipFile    the zip file (optional - multipart upload)
     * @param folderPath the folder path (optional - if not uploading a file)
     * @return the response entity
     */
    @PostMapping(path = "/upload/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScript>> uploadFile(
            @PathVariable(name = "cname") String cname,
            @PathVariable(name = "org") String org,
            @RequestParam(value = "type",required=true) String type,
            @RequestParam(value = "zipFile", required = false) MultipartFile zipFile,
            @RequestParam(value = "folderPath", required = false) String folderPath) {

        logger.info("request to upload ai-agent scripts for cname={}, org={}, type={}", cname, org, type);

        try {
            // Validate pipeline type param
            if (type == null || type.isBlank()) {
                throw new InvalidRequestException(
                        "Pipeline type is required. Provide a valid type value.");
            }

            // Validate that at least one option is provided
            if ((zipFile == null || zipFile.isEmpty()) && (folderPath == null || folderPath.isBlank())) {
                logger.warn("Neither zipFile nor folderPath provided for cname={}, org={}", cname, org);
                throw new InvalidRequestException(
                        "Either zipFile or folderPath must be provided. Please upload a ZIP file or specify a folder path.");
            }

            // Validate cname and org
            if (cname == null || cname.isBlank()) {
                throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
            }
            if (org == null || org.isBlank()) {
                throw new InvalidRequestException("Organization (org) cannot be null or empty");
            }

            // ── Pipeline metadata.json validation ─────────────────────────────
            // Runs BEFORE deleting existing records to prevent data loss on a bad upload.
            logger.info("Validating pipeline metadata.json for cname={}, org={}, type={}", cname, org, type);
            if (zipFile != null && !zipFile.isEmpty()) {
                pipelineMetadataValidator.validateFromZip(zipFile, type);
            } else if (folderPath != null && !folderPath.isBlank()) {
                pipelineMetadataValidator.validateFromFolderPath(folderPath, type);
            }
            logger.info("Pipeline metadata validation passed for cname={}, org={}, type={}", cname, org, type);
            // ── End metadata validation ────────────────────────────────────────
            List<ICIPAiAgentScriptDTO> existingFiles = folderService.listAsDTO(cname, org);
            if (existingFiles != null && !existingFiles.isEmpty()) {
                logger.info("Found {} existing files for cname={}, org={}. Deleting them before uploading new files.",
                            existingFiles.size(), cname, org);
                try {
                    folderService.deleteAllByCnameAndOrg(cname, org);
                    logger.info("Successfully deleted all existing files for cname={}, org={}", cname, org);
                } catch (Exception e) {
                    logger.error("Error deleting existing files for cname={}, org={}: {}", cname, org, e.getMessage(), e);
                    throw new FileDeletionException(
                            String.format("Failed to delete existing files for cname=%s, org=%s before uploading new files", cname, org),
                            e
                    );
                }
            } else {
                logger.info("No existing files found for cname={}, org={}", cname, org);
            }

            // Use default path if no specific path is provided
            String pathToUse = folderPath;
            if (pathToUse == null || pathToUse.isBlank()) {
                pathToUse = FileConstants.AI_AGENT_SCRIPT_ZIP_FOLDER_PATH;
                logger.info("Using default path: {}", pathToUse);
            } else {
                logger.info("Using provided folder path: {}", pathToUse);
            }

            // Buffer zip bytes so we can use them for both DB persist and GitHub push
            byte[] zipBytes = null;
            if (zipFile != null && !zipFile.isEmpty()) {
                zipBytes = zipFile.getBytes();
            }

            List<ICIPAiAgentScript> result = folderService.persistInAiAgentScriptTableFromZipOrFolder(zipFile, pathToUse, cname, org);

            if (result == null || result.isEmpty()) {
                logger.warn("No scripts were uploaded for cname={}, org={}", cname, org);
                throw new FileUploadException("No scripts were found or uploaded. Verify the ZIP file or folder contains valid script files.");
            }

            // Push zip file contents to GitHub (Vibe Studio: push all files from the zip in a single call)
            boolean githubPushSuccess = false;
            String githubPushError = "";
            String repoUrl = "";
            String branchName = "studio/" + cname;
            try {
                repoUrl = githubservice.resolveRepoUrl(org);
                if (repoUrl != null && !repoUrl.isEmpty() && zipBytes != null) {
                    logger.info("[Vibe Studio] Pushing all zip file contents to GitHub in a single commit. Repo URL: {}, Branch: {}, cname: {}, org: {}", repoUrl, branchName, cname, org);
                    // Collect all files from zip into a map
                    java.util.Map<String, byte[]> filesToPush = new java.util.LinkedHashMap<>();
                    try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new java.io.ByteArrayInputStream(zipBytes))) {
                        java.util.zip.ZipEntry entry;
                        while ((entry = zis.getNextEntry()) != null) {
                            if (!entry.isDirectory()) {
                                filesToPush.put(entry.getName(), zis.readAllBytes());
                            }
                            zis.closeEntry();
                        }
                    }
                    // Single call to push all files at once
                    githubservice.saveFilesToGitHubBranch(filesToPush, cname, org, branchName);
                    githubPushSuccess = true;
                    logger.info("[Vibe Studio] Successfully pushed {} files to GitHub in one commit. Repo: {}, Branch: {}", filesToPush.size(), repoUrl, branchName);
                } else {
                    githubPushError = "GitHub not configured or no zip file provided";
                    logger.warn("Skipping GitHub push: {}", githubPushError);
                }
            } catch (Exception e) {
                githubPushError = e.getMessage();
                logger.error("[Vibe Studio] Failed to push zip contents to GitHub. Repo: {}, Branch: {}, Reason: {}", repoUrl, branchName, githubPushError, e);
            }

            logger.info("Upload complete for cname={}, org={}. Scripts persisted: {}, GitHub repo URL: {}, Branch: {}, GitHub push: {}{}, Metadata stored in DB table: 'icipaiagentscriptentity'",
                    cname, org, result.size(), repoUrl, branchName,
                    githubPushSuccess ? "SUCCESS" : "FAILED",
                    githubPushSuccess ? "" : " - Reason: " + githubPushError);
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (InvalidRequestException | FileDeletionException | FileUploadException
                | PipelineMetadataValidationException e) {
            // Re-throw custom exceptions to be handled by GlobalControllerException
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during file upload for cname={}, org={}: {}", cname, org, e.getMessage(), e);
            throw new FileUploadException(
                    String.format("Failed to upload AI agent scripts for cname=%s, org=%s", cname, org),
                    e
            );
        }
    }


    @PostMapping(path = "/update/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScript>> bulkUpdateNativeScriptFilesJson(
            @PathVariable(name = "cname") String cname,
            @PathVariable(name = "org") String org,
            @RequestBody List<ICIPAiAgentScriptDTO> updates
    ) {
        logger.info("request to bulk update ai-agent script files via JSON for cname={}, org={}, count={}",
                cname, org, updates == null ? 0 : updates.size());

        try {
            // Validate input parameters
            if (cname == null || cname.isBlank()) {
                throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
            }
            if (org == null || org.isBlank()) {
                throw new InvalidRequestException("Organization (org) cannot be null or empty");
            }
            if (updates == null || updates.isEmpty()) {
                logger.warn("No updates provided in request body for cname={}, org={}", cname, org);
                throw new InvalidRequestException("Update list cannot be null or empty. Please provide at least one script to update.");
            }

            List<ICIPAiAgentScript> result = folderService.bulkUpdateAiAgentScripts(cname, org, updates);

            // Sync updated files to GitHub in a single call
            boolean githubPushSuccess = false;
            String githubPushError = "";
            String repoUrl = "";
            String branchName = "studio/" + cname;
            try {
                repoUrl = githubservice.resolveRepoUrl(org);
                if (repoUrl != null && !repoUrl.isEmpty()) {
                    logger.info("[Vibe Studio] Syncing {} updated files to GitHub in one commit. Repo: {}, Branch: {}", updates.size(), repoUrl, branchName);
                    java.util.Map<String, byte[]> filesToPush = new java.util.LinkedHashMap<>();
                    for (ICIPAiAgentScriptDTO dto : updates) {
                        if (dto.getFilescript() != null && dto.getFilePath() != null) {
                            filesToPush.put(dto.getFilePath(), dto.getFilescript().getBytes(java.nio.charset.StandardCharsets.UTF_8));
                        }
                    }
                    if (!filesToPush.isEmpty()) {
                        githubservice.saveFilesToGitHubBranch(filesToPush, cname, org, branchName);
                        githubPushSuccess = true;
                        logger.info("[Vibe Studio] Successfully synced {} files to GitHub. Repo: {}, Branch: {}", filesToPush.size(), repoUrl, branchName);
                    }
                }
            } catch (Exception e) {
                githubPushError = e.getMessage();
                logger.error("[Vibe Studio] Failed to sync updates to GitHub. Repo: {}, Branch: {}, Reason: {}", repoUrl, branchName, githubPushError, e);
            }

            logger.info("Successfully updated {} scripts for cname={}, org={}. GitHub push: {}{}",
                    result.size(), cname, org,
                    githubPushSuccess ? "SUCCESS" : "FAILED",
                    githubPushSuccess ? "" : " - Reason: " + githubPushError);
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (InvalidRequestException e) {
            // Re-throw to be handled by GlobalControllerException
            throw e;
        } catch (Exception ex) {
            logger.error("Bulk JSON update failed for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
            throw new FileUploadException(
                    String.format("Failed to bulk update scripts for cname=%s, org=%s", cname, org),
                    ex
            );
        }
    }

    /**
     * List AI agent scripts for a specific customer and organization.
     *
     * @param cname the cname
     * @param org the org
     * @return the response entity
     */
    @GetMapping(path = "/list/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScriptDTO>> list(
            @PathVariable("cname") String cname,
            @PathVariable("org") String org) {

        logger.info("request to list ai-agent scripts for cname={}, org={}", cname, org);

        try {
            // Validate input parameters
            if (cname == null || cname.isBlank()) {
                throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
            }
            if (org == null || org.isBlank()) {
                throw new InvalidRequestException("Organization (org) cannot be null or empty");
            }

            List<ICIPAiAgentScriptDTO> scripts = folderService.listAsDTO(cname, org);
            logger.info("Found {} scripts for cname={}, org={}", scripts.size(), cname, org);

            return ResponseEntity.ok(scripts);

        } catch (InvalidRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error listing scripts for cname={}, org={}: {}", cname, org, e.getMessage(), e);
            throw new RuntimeException(
                    String.format("Failed to retrieve scripts for cname=%s, org=%s", cname, org),
                    e
            );
        }
    }

    /**
     * Download all scripts as a ZIP file.
     *
     * @param cname the cname
     * @param org the org
     * @return the response entity
     */
    @GetMapping(path = "/download/{cname}/{org}", produces = "application/zip")
    public ResponseEntity<byte[]> downloadAllAsZip(
            @PathVariable("cname") String cname,
            @PathVariable("org") String org
    ) {
        logger.info("request to download all scripts as ZIP for cname={}, org={}", cname, org);

        try {
            // Validate input parameters
            if (cname == null || cname.isBlank()) {
                throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
            }
            if (org == null || org.isBlank()) {
                throw new InvalidRequestException("Organization (org) cannot be null or empty");
            }

            // Generate ZIP in memory from DB
            byte[] zipBytes = folderService.exportZip(cname, org);

            if (zipBytes == null || zipBytes.length == 0) {
                throw new ResourceNotFoundException(
                        String.format("No scripts found for cname=%s, org=%s to download", cname, org)
                );
            }

            String fileName = (cname + "-" + org + ".zip").replace(' ', '_');

            logger.info("Successfully generated ZIP file: {} ({} bytes)", fileName, zipBytes.length);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("X-Content-Type-Options", "nosniff")
                    .body(zipBytes);

        } catch (InvalidRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error generating ZIP for cname={}, org={}: {}", cname, org, e.getMessage(), e);
            throw new FileUploadException(
                    String.format("Failed to generate ZIP file for cname=%s, org=%s", cname, org),
                    e
            );
        }
    }


    /**
     * Delete a specific AI agent script file.
     *
     * @param id the script id
     * @return the response entity
     */
    @DeleteMapping(path = "/delete/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable("id") Integer id) {
        logger.info("request to delete ai-agent script file with id: {}", id);

        try {
            // Validate input parameter
            if (id == null || id <= 0) {
                throw new InvalidRequestException("Script ID must be a positive integer");
            }

            folderService.deleteFileById(id);
            logger.info("Successfully deleted script with id: {}", id);

            return ResponseEntity.noContent().build();

        } catch (InvalidRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting script with id={}: {}", id, e.getMessage(), e);
            throw new FileDeletionException(
                    String.format("Failed to delete script with id=%d", id),
                    e
            );
        }
    }

    /**
     * Push zip file to MinIO.
     *
     * @param cname the customer name
     * @param org the organization
     * @param zipFile the zip file (optional - multipart upload)
     * @param objectKey the object key/path in MinIO
     * @param type the datasource type
     * @param alias the datasource alias
     * @return the response entity
     */
    @PostMapping(path = "/push-to-minio/{cname}/{org}")
    public ResponseEntity<String> pushToMinIO(
            @PathVariable(name = "cname") String cname,
            @PathVariable(name = "org") String org,
            @RequestParam(value = "zipFile", required = false) MultipartFile zipFile,
            @RequestParam(value = "objectKey", required = false) String objectKey,
            @RequestParam(value="type", required = false, defaultValue ="S3") String type,
            @RequestParam(value="alias", required = false, defaultValue ="Sample-S3") String alias)
    {
        logger.info("request to push ai-agent scripts to MinIO for cname={}, org={}, type={}, alias={}",
                    cname, org, type, alias);

        try {
            // Validate input parameters
            if (cname == null || cname.isBlank()) {
                throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
            }
            if (org == null || org.isBlank()) {
                throw new InvalidRequestException("Organization (org) cannot be null or empty");
            }

            // Fetch S3/MinIO connection details from DB
            ICIPDatasource datasource = datasourceService.getDatasourceByTypeAndAlias(type, alias, org);
            if (datasource == null) {
                String message = String.format("No datasource found with type=%s, alias=%s for organization=%s",
                                              type, alias, org);
                logger.error(message);
                throw new DatasourceNotFoundException(message);
            }

            JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
            String minioUrl = connDetails.optString("url");
            String minioAccessKey = connDetails.optString("accessKey");
            String minioSecretKey = connDetails.optString("secretKey");
            String bucketName = connDetails.optString("bucketName", "aiptest");

            // Validate connection details
            if (minioUrl == null || minioUrl.isBlank()) {
                throw new DatasourceNotFoundException("MinIO URL is not configured in datasource connection details");
            }
            if (minioAccessKey == null || minioAccessKey.isBlank()) {
                throw new DatasourceNotFoundException("MinIO access key is not configured in datasource connection details");
            }
            if (minioSecretKey == null || minioSecretKey.isBlank()) {
                throw new DatasourceNotFoundException("MinIO secret key is not configured in datasource connection details");
            }

            logger.info("Using MinIO configuration: url={}, bucket={}", minioUrl, bucketName);

            // Generate default object key if not provided
            String finalObjectKey = objectKey;
            if (finalObjectKey == null || finalObjectKey.isBlank()) {
                finalObjectKey = "ai-agent-scripts/" + cname + "/" + org + "/" + cname + "-" + org + ".zip";
                logger.info("Using default object key: {}", finalObjectKey);
            }

            boolean success;

            if (zipFile != null && !zipFile.isEmpty()) {
                // Upload provided zip file
                logger.info("Uploading provided zip file to MinIO");
                success = folderService.pushZipToMinIO(zipFile, null, bucketName, finalObjectKey, cname, org,
                                                       minioUrl, minioAccessKey, minioSecretKey);
            } else {
                // Export from database and upload
                logger.info("Exporting from database and uploading to MinIO");
                success = folderService.exportAndPushToMinIO(cname, org, bucketName, finalObjectKey,
                                                             minioUrl, minioAccessKey, minioSecretKey);
            }

            if (success) {
                String message = String.format("Successfully uploaded to MinIO: bucket=%s, objectKey=%s",
                                              bucketName, finalObjectKey);
                logger.info(message);
                return ResponseEntity.ok(message);
            } else {
                String message = String.format("Failed to upload to MinIO for cname=%s, org=%s", cname, org);
                logger.error(message);
                throw new MinIOStorageException(message);
            }

        } catch (InvalidRequestException | DatasourceNotFoundException | MinIOStorageException e) {
            // Re-throw custom exceptions to be handled by GlobalControllerException
            throw e;
        } catch (Exception ex) {
            logger.error("Error pushing to MinIO for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
            throw new MinIOStorageException(
                    String.format("Failed to push scripts to MinIO for cname=%s, org=%s", cname, org),
                    ex
            );
        }
    }

}