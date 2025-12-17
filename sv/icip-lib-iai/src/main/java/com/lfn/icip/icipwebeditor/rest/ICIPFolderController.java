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
import com.lfn.icip.icipwebeditor.folder.service.ICIPFolderService;
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


    /**
     * Upload file.
     *
     * @param cname the customer name
     * @param org the organization
     * @param zipFile the zip file (optional - multipart upload)
     * @param folderPath the folder path (optional - if not uploading a file)
     * @return the response entity
     * @throws Exception the exception
     */
    @PostMapping(path = "/upload/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScript>> uploadFile(
            @PathVariable(name = "cname") String cname,
            @PathVariable(name = "org") String org,
            @RequestParam(value = "zipFile", required = false) MultipartFile zipFile,
            @RequestParam(value = "folderPath", required = false) String folderPath) throws Exception {

        logger.info("request to upload ai-agent scripts for cname={}, org={}", cname, org);

        // Validate that at least one option is provided
        if ((zipFile == null || zipFile.isEmpty()) && (folderPath == null || folderPath.isBlank())) {
            logger.warn("Neither zipFile nor folderPath provided");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // Check if files already exist for this cname and org
        List<ICIPAiAgentScriptDTO> existingFiles = folderService.listAsDTO(cname, org);
        if (existingFiles != null && !existingFiles.isEmpty()) {
            logger.info("Found {} existing files for cname={}, org={}. Deleting them before uploading new files.",
                        existingFiles.size(), cname, org);
            try {
                folderService.deleteAllByCnameAndOrg(cname, org);
                logger.info("Successfully deleted all existing files for cname={}, org={}", cname, org);
            } catch (Exception e) {
                logger.error("Error deleting existing files for cname={}, org={}: {}", cname, org, e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
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

        return new ResponseEntity<>(
                folderService.persistInAiAgentScriptTableFromZipOrFolder(zipFile, pathToUse, cname, org),
                HttpStatus.OK);
    }


    @PostMapping(path = "/update/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScript>> bulkUpdateNativeScriptFilesJson(
            @PathVariable(name = "cname") String cname,
            @PathVariable(name = "org") String org,
            @RequestBody List<ICIPAiAgentScriptDTO> updates
    ) {
        logger.info("request to bulk update ai-agent script files via JSON: count={}",
                updates == null ? 0 : updates.size());
        try {
            if (updates == null || updates.isEmpty()) {
                logger.warn("No updates provided in request body.");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            List<ICIPAiAgentScript> result = folderService.bulkUpdateAiAgentScripts(cname, org, updates);
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (Exception ex) {
            logger.error("Bulk JSON update failed: {}", ex.getMessage(), ex);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * List.
     *
     * @param cname the cname
     * @param org the org
     * @return the response entity
     * @throws Exception the exception
     */
    @GetMapping(path = "/list/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScriptDTO>> list(
            @PathVariable("cname") String cname,
            @PathVariable("org") String org) throws Exception {
        return ResponseEntity.ok(folderService.listAsDTO(cname, org));
    }

    /**
     * Download file.
     *
     * @param cname the cname
     * @param org the org
     * @return the response entity
     * @throws Exception the exception
     */

    @GetMapping(path = "/download/{cname}/{org}", produces = "application/zip")
    public ResponseEntity<byte[]> downloadAllAsZip(
            @PathVariable("cname") String cname,
            @PathVariable("org") String org
    ) {
        // Generate ZIP in memory from DB
        byte[] zipBytes = folderService.exportZip(cname, org);

        String fileName = (cname + "-" + org + ".zip").replace(' ', '_');

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .body(zipBytes);
    }


    /**
     * Delete file.
     *
     * @param id the script id
     * @return the response entity
     */
    @DeleteMapping(path = "/delete/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable("id") Integer id) {
        logger.info("request to delete ai-agent script file with id: {}", id);
        folderService.deleteFileById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Push zip file to MinIO.
     *
     * @param cname the customer name
     * @param org the organization
     * @param zipFile the zip file (optional - multipart upload)
     * @param objectKey the object key/path in MinIO
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
        logger.info("request to push ai-agent scripts to MinIO for cname={}, org={}", cname, org);

        try {
            // Fetch S3/MinIO connection details from DB
            ICIPDatasource datasource = datasourceService.getDatasourceByTypeAndAlias(type, alias, org);
            if (datasource == null) {
                String message = String.format("No datasource found for cname=%s, org=%s", cname, org);
                logger.error(message);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(message);
            }
            JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
            String minioUrl = connDetails.optString("url");
            String minioAccessKey = connDetails.optString("accessKey");
            String minioSecretKey = connDetails.optString("secretKey");
            String bucketName = "aiptest";

            logger.info("Using bucket name from connection details: {}", bucketName);

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
                success = folderService.pushZipToMinIO(zipFile, null, bucketName, finalObjectKey, cname, org, minioUrl, minioAccessKey, minioSecretKey);
            } else {
                // Export from database and upload
                logger.info("Exporting from database and uploading to MinIO");
                success = folderService.exportAndPushToMinIO(cname, org, bucketName, finalObjectKey, minioUrl, minioAccessKey, minioSecretKey);
            }

            if (success) {
                String message = String.format("Successfully uploaded to MinIO: bucket=%s, objectKey=%s", bucketName, finalObjectKey);
                logger.info(message);
                return ResponseEntity.ok(message);
            } else {
                String message = "Failed to upload to MinIO";
                logger.error(message);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(message);
            }

        } catch (Exception ex) {
            logger.error("Error pushing to MinIO: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + ex.getMessage());
        }
    }

}