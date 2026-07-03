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

package com.lfn.icip.icipwebeditor.folder.service;

import com.lfn.ai.comm.lib.util.SecureTrustManagerUtil;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.icipwebeditor.config.ICIPAgentsConfig;
import com.lfn.icip.icipwebeditor.model.ICIPAiAgentScript;
import com.lfn.icip.icipwebeditor.model.dto.ICIPAiAgentScriptDTO;
import com.lfn.icip.icipwebeditor.service.IICIPAiAgentService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPBinaryFilesService;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import okhttp3.OkHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.sql.rowset.serial.SerialBlob;
import javax.sql.rowset.serial.SerialException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPFileService.
 *
 * @author essedum
 */
@Service
@RefreshScope
public class ICIPFolderService {

    /**
     * The Constant logger.
     */
    private static final Logger logger = LoggerFactory.getLogger(ICIPFolderService.class);

    /**
     * The binary service.
     */
    private ICIPBinaryFilesService binaryService;

    /**
     * The native script service.
     */
    private IICIPAiAgentService aiAgentService;

    /**
     * The agents config.
     */
    public ICIPAgentsConfig agentsConfig;

    /**
     * MinIO configuration properties
     */
    @EssedumProperty("icip.minio.url")
    private String minioUrl;

    @EssedumProperty("icip.minio.access-key")
    private String minioAccessKey;

    @EssedumProperty("icip.minio.secret-key")
    private String minioSecretKey;

    @EssedumProperty("icip.certificateCheck")
    private String certificateCheck;

    /**
     * Instantiates a new ICIP file service.
     *
     * @param binaryService       the binary service
     * @param agentsConfig        the agents config
     */
    public ICIPFolderService(ICIPBinaryFilesService binaryService, IICIPAiAgentService aiAgentService,
                              ICIPAgentsConfig agentsConfig) {
        super();
        this.binaryService = binaryService;
        this.aiAgentService = aiAgentService;
        this.agentsConfig = agentsConfig;
    }

    /**
     *
     * @param zipFile
     * @param userId
     * @throws IOException
     */
   /* public List<ICIPAiAgentScript> persistInAiAgentScriptTableFromZip(MultipartFile zipFile, String name, String org) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String fullPath = entry.getName();
                    String fileName = Paths.get(fullPath).getFileName().toString();

                    byte[] fileData = zis.readAllBytes();
                    Blob blob = new SerialBlob(fileData);
                    ICIPAiAgentScript icipAiAgentScript = new ICIPAiAgentScript();
                    icipAiAgentScript.setCname(name);
                    icipAiAgentScript.setOrganization(org);
                    icipAiAgentScript.setFilePath(fullPath);
                    icipAiAgentScript.setFilename(fileName);
                    icipAiAgentScript.setFilescript(blob);

                    aiAgentService.save(icipAiAgentScript);
                }
                zis.closeEntry();
            }
            return aiAgentService.findByNameAndOrg(name, org);
        } catch (SerialException e) {
            throw new RuntimeException(e);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }*/


    /**
     * Ingests files into ICIPAiAgentScript table from either:
     *  - zipFile (MultipartFile), OR
     *  - zipFolderPath on disk (can be a .zip file or a directory).
     *
     * If both are provided, zipFile takes precedence.
     */
    public List<ICIPAiAgentScript> persistInAiAgentScriptTableFromZipOrFolder(
            MultipartFile zipFile,
            String zipFolderPath,
            String name,
            String org
    ) throws IOException {
        try {
            if (zipFile != null && !zipFile.isEmpty()) {
                processZipInputStream(zipFile.getInputStream(), name, org);
            } else if (zipFolderPath != null && !zipFolderPath.isBlank()) {
                // Sanitise the user-supplied filesystem path: reject ".." traversal
                // sequences and null bytes before any Files.* operation, so taint
                // trackers (e.g. CodeQL java/path-injection) recognise the barrier
                // on the Files.exists / Files.newInputStream sinks below.
                Path path = com.lfn.icip.dataset.util.PathValidationUtil
                        .validateAndGetPath(zipFolderPath);

                if (!Files.exists(path)) {
                    throw new NoSuchFileException("Provided path does not exist: " + zipFolderPath);
                }

                if (Files.isRegularFile(path) && zipFolderPath.toLowerCase().endsWith(".zip")) {
                    // Treat as ZIP file from filesystem
                    try (InputStream is = Files.newInputStream(path)) {
                        processZipInputStream(is, name, org);
                    }
                } else if (Files.isDirectory(path)) {
                    // Treat as a folder: walk the tree and persist each file preserving relative paths
                    processDirectory(path, name, org);
                } else {
                    throw new IllegalArgumentException("Unsupported path type. Provide a .zip file or a directory. Path: " + zipFolderPath);
                }
            } else {
                throw new IllegalArgumentException("Either zipFile (MultipartFile) or zipFolderPath must be provided.");
            }

            return aiAgentService.findByNameAndOrg(name, org);
        } catch (SQLException e) {
            throw new RuntimeException("Blob/SQL error while persisting AI Agent scripts", e);
        }
    }

    /**
     * Reads a ZIP stream, saves each file entry into DB.
     */
    private void processZipInputStream(InputStream zipStream, String name, String org) throws IOException, SerialException, SQLException {
        try (ZipInputStream zis = new ZipInputStream(zipStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    final String fullPath = entry.getName();                        // e.g., "a/b/file.py"
                    final String fileName = Paths.get(fullPath).getFileName().toString();

                    byte[] fileData = readAllBytesFromZipEntry(zis, entry);
                    Blob blob = new SerialBlob(fileData);

                    ICIPAiAgentScript script = new ICIPAiAgentScript();
                    script.setCname(name);
                    script.setOrganization(org);
                    script.setFilePath(fullPath);
                    script.setFilename(fileName);
                    script.setFilescript(blob);

                    aiAgentService.save(script);
                }
                zis.closeEntry();
            }
        }
    }

    /**
     * Walks a directory on disk and persists each file (non-directory) with a path
     * relative to the root directory, so folder structure is preserved.
     */
    private void processDirectory(Path rootDir, String name, String org) throws IOException, SerialException, SQLException {
        final Path normalizedRoot = rootDir.toAbsolutePath().normalize();

        // Using Files.walk to traverse; you may switch to Files.find with filters if needed.
        try (var stream = Files.walk(normalizedRoot)) {
            List<Path> files = new ArrayList<>();
            stream.filter(Files::isRegularFile).forEach(files::add);

            for (Path file : files) {
                // Compute relative path to preserve structure (e.g., "sub1/sub2/file.py")
                String relativePath = normalizedRoot.relativize(file.toAbsolutePath().normalize()).toString()
                        .replace('\\', '/'); // normalize to forward slashes for consistency

                String fileName = file.getFileName().toString();
                // Walked file is already inside `normalizedRoot`; explicitly
                // re-validate the path against traversal so the Files.readAllBytes
                // sink is paired with a recognised sanitiser.
                java.nio.file.Path safeFile = com.lfn.icip.dataset.util.PathValidationUtil
                        .validateAndGetPath(file.toString());
                byte[] fileData = Files.readAllBytes(safeFile);
                Blob blob = new SerialBlob(fileData);

                ICIPAiAgentScript script = new ICIPAiAgentScript();
                script.setCname(name);
                script.setOrganization(org);
                script.setFilePath(relativePath);
                script.setFilename(fileName);
                script.setFilescript(blob);

                aiAgentService.save(script);
            }
        }
    }

    /**
     * Efficiently reads bytes for the current ZIP entry.
     * Uses entry size when available; otherwise reads via buffer.
     */
    private byte[] readAllBytesFromZipEntry(ZipInputStream zis, ZipEntry entry) throws IOException {
        // entry.getSize() may be -1; fallback to buffered read
        int bufferSize = 8192;
        byte[] buffer = new byte[bufferSize];
        try (java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream(
                entry.getSize() > 0 && entry.getSize() < Integer.MAX_VALUE ? (int) entry.getSize() : bufferSize
        )) {
            int read;
            while ((read = zis.read(buffer)) != -1) {
                bos.write(buffer, 0, read);
            }
            return bos.toByteArray();
        }
    }

    /**
     * Persist in ai agent script table for single file.
     *
     * @param bytes    the bytes
     * @param name     the name
     * @param org      the org
     * @param fileName the file name
     * @param filePath the file path
     * @return the list
     * @throws SQLException the SQL exception
     */

    public List<ICIPAiAgentScript> persistInAiAgentScriptTableForSingleFile(byte[] bytes, String name, String org, String fileName, String filePath)
            throws SQLException {

        logger.info("Starting persistInAiAgentScriptTable for cname: {}, org: {}, fileName: {}, newFileName: {}", name, org, fileName);

        try {
            List<ICIPAiAgentScript> aiAgentScripts = aiAgentService.findByNameAndOrg(name, org);
            logger.debug("Fetched {} existing scripts for cname: {} and org: {}", aiAgentScripts.size(), name, org);

            Blob blob = new SerialBlob(bytes);
            // Update existing script if found
            if (!aiAgentScripts.isEmpty()) {
                for (ICIPAiAgentScript script : aiAgentScripts) {
                    if (script.getFilename() != null && script.getFilePath() != null &&
                            script.getFilename().equalsIgnoreCase(fileName) &&
                            script.getFilePath().endsWith(filePath)) {

                        logger.info("Updating existing script: {} at path: {}", fileName, filePath);
                        script.setFilescript(blob);
                        aiAgentService.save(script);
                        break;
                    }
                }
            }
            return aiAgentService.findByNameAndOrg(name, org);
        } catch (Exception e) {
            logger.error("Error occurred while persisting AI Agent Script for cname: {}, org: {}, fileName: {}, newFileName: {}. Error: {}",
                    name, org, fileName, fileName, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Bulk update ai agent scripts.
     *
     * @param cname   the cname
     * @param org     the org
     * @param updates the updates (as DTOs with String content)
     * @return the list
     */
    public List<ICIPAiAgentScript> bulkUpdateAiAgentScripts(String cname, String org, List<ICIPAiAgentScriptDTO> updates) {
        logger.info("Starting bulk update for cname: {}, org: {} with {} scripts", cname, org, updates.size());

        try {
            List<ICIPAiAgentScript> existingScripts = aiAgentService.findByNameAndOrg(cname, org);
            logger.debug("Fetched {} existing scripts for cname: {} and org: {}", existingScripts.size(), cname, org);

            for (ICIPAiAgentScriptDTO updateDTO : updates) {
                boolean found = false;

                // Check if script exists in database
                for (ICIPAiAgentScript existingScript : existingScripts) {
                    if (existingScript.getFilename() != null && existingScript.getFilePath() != null &&
                            existingScript.getId().equals(updateDTO.getId())) {

                        logger.info("Updating existing script: {} at path: {}", updateDTO.getFilename(), updateDTO.getFilePath());

                        // Convert String content from DTO to Blob
                        if (updateDTO.getFilescript() != null) {
                            byte[] fileBytes = updateDTO.getFilescript().getBytes(java.nio.charset.StandardCharsets.UTF_8);
                            Blob blob = new SerialBlob(fileBytes);
                            existingScript.setFilescript(blob);
                            existingScript.setFilePath(updateDTO.getFilePath());
                            aiAgentService.save(existingScript);
                        } else {
                            logger.warn("No file content provided for script: {} at path: {}. Skipping update.",
                                    updateDTO.getFilename(), updateDTO.getFilePath());
                        }

                        found = true;
                        break;
                    }
                }

                if (!found) {
                    logger.warn("Script not found in database: {} at path: {}. Skipping update.",
                            updateDTO.getFilename(), updateDTO.getFilePath());
                }
            }

            return aiAgentService.findByNameAndOrg(cname, org);
        } catch (SQLException e) {
            logger.error("SQL error during bulk update for cname: {}, org: {}. Error: {}", cname, org, e.getMessage(), e);
            throw new RuntimeException("SQL error during bulk update", e);
        } catch (Exception e) {
            logger.error("Bulk update failed for cname: {}, org: {}. Error: {}", cname, org, e.getMessage(), e);
            throw new RuntimeException("Bulk update failed", e);
        }
    }

    /**
     * Gets the content raw.
     *
     * @param cname    the cname
     * @param org      the org
     * @param filePath the file path
     * @param fileName the file name
     * @return the content raw
     */
    public Object getContentRaw(String cname, String org, String filePath, String fileName) {
        logger.info("Fetching raw content for cname: {}, org: {}, filePath: {}, fileName: {}",
                cname, org, filePath, fileName);

        try {
            List<ICIPAiAgentScript> scripts = aiAgentService.findByNameAndOrg(cname, org);

            for (ICIPAiAgentScript script : scripts) {
                if (script.getFilename() != null && script.getFilePath() != null &&
                        script.getFilename().equalsIgnoreCase(fileName) &&
                        script.getFilePath().equals(filePath)) {

                    logger.info("Found matching script: {} at path: {}", fileName, filePath);

                    Blob blob = script.getFilescript();
                    if (blob != null) {
                        return blob.getBytes(1, (int) blob.length());
                    }
                }
            }

            logger.warn("File not found: {} at path: {} for cname: {}, org: {}",
                    fileName, filePath, cname, org);
            return null;
        } catch (SQLException e) {
            logger.error("Error retrieving raw content for file: {}, path: {}, cname: {}, org: {}. Error: {}",
                    fileName, filePath, cname, org, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve file content", e);
        }
    }

    /**
     * List as DTO.
     *
     * @param cname the cname
     * @param org   the org
     * @return the list
     */
    public List<ICIPAiAgentScriptDTO> listAsDTO(String cname, String org) {
        logger.info("Listing scripts as DTO for cname: {}, org: {}", cname, org);

        try {
            List<ICIPAiAgentScript> scripts = aiAgentService.findByNameAndOrg(cname, org);
            List<ICIPAiAgentScriptDTO> dtos = new ArrayList<>();

            for (ICIPAiAgentScript script : scripts) {
                ICIPAiAgentScriptDTO dto = new ICIPAiAgentScriptDTO();
                dto.setId(script.getId());
                dto.setCname(script.getCname());
                dto.setOrganization(script.getOrganization());
                dto.setFilename(script.getFilename());
                dto.setFilePath(script.getFilePath());

                // Include blob content in DTO
                if (script.getFilescript() != null) {
                    try {
                        Blob blob = script.getFilescript();
                        byte[] blobBytes = blob.getBytes(1, (int) blob.length());
                        String fileContent = new String(blobBytes, java.nio.charset.StandardCharsets.UTF_8);
                        dto.setFilescript(fileContent);
                    } catch (SQLException e) {
                        logger.warn("Failed to read blob content for script: {} at path: {}. Error: {}",
                                script.getFilename(), script.getFilePath(), e.getMessage());
                        dto.setFilescript(null);
                    }
                }

                dtos.add(dto);
            }

            logger.debug("Retrieved {} scripts as DTOs for cname: {}, org: {}", dtos.size(), cname, org);
            return dtos;
        } catch (Exception e) {
            logger.error("Error listing scripts as DTO for cname: {}, org: {}. Error: {}",
                    cname, org, e.getMessage(), e);
            throw new RuntimeException("Failed to list scripts", e);
        }
    }

    /**
     * Delete file by ID.
     *
     * @param id the script id
     */
    public void deleteFileById(Integer id) {
        logger.info("Deleting file by ID: {}", id);

        try {
            ICIPAiAgentScript script = aiAgentService.findById(id);

            if (script == null) {
                logger.warn("Script not found with ID: {}", id);
                throw new RuntimeException("Script not found with ID: " + id);
            }

            logger.info("Deleting script: {} at path: {} for cname: {}, org: {}",
                    script.getFilename(), script.getFilePath(), script.getCname(), script.getOrganization());

            aiAgentService.deleteById(id);
            logger.info("Successfully deleted script with ID: {}", id);

        } catch (Exception e) {
            logger.error("Error deleting file by ID: {}. Error: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    /**
     * Delete file.
     *
     * @param cname    the cname
     * @param org      the org
     * @param filePath the file path
     * @param fileName the file name
     */
    public void deleteFile(String cname, String org, String filePath, String fileName) {
        logger.info("Deleting file: {} at path: {} for cname: {}, org: {}",
                fileName, filePath, cname, org);

        try {
            List<ICIPAiAgentScript> scripts = aiAgentService.findByNameAndOrg(cname, org);

            for (ICIPAiAgentScript script : scripts) {
                if (script.getFilename() != null && script.getFilePath() != null &&
                        script.getFilename().equalsIgnoreCase(fileName) &&
                        script.getFilePath().equals(filePath)) {

                    logger.info("Found matching script to delete: {} at path: {}", fileName, filePath);
                    aiAgentService.deleteById(script.getId());
                    logger.info("Successfully deleted file: {} at path: {}", fileName, filePath);
                    return;
                }
            }

            logger.warn("File not found for deletion: {} at path: {} for cname: {}, org: {}",
                    fileName, filePath, cname, org);
        } catch (Exception e) {
            logger.error("Error deleting file: {} at path: {} for cname: {}, org: {}. Error: {}",
                    fileName, filePath, cname, org, e.getMessage(), e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    /**
     * Delete all files for a specific cname and org.
     *
     * @param cname the cname
     * @param org   the org
     */
    public void deleteAllByCnameAndOrg(String cname, String org) {
        logger.info("Deleting all files for cname: {}, org: {}", cname, org);

        try {
            List<ICIPAiAgentScript> scripts = aiAgentService.findByNameAndOrg(cname, org);

            if (scripts == null || scripts.isEmpty()) {
                logger.info("No scripts found to delete for cname: {}, org: {}", cname, org);
                return;
            }

            int deletedCount = 0;
            for (ICIPAiAgentScript script : scripts) {
                aiAgentService.deleteById(script.getId());
                deletedCount++;
            }

            logger.info("Successfully deleted {} scripts for cname: {}, org: {}", deletedCount, cname, org);

        } catch (Exception e) {
            logger.error("Error deleting all files for cname: {}, org: {}. Error: {}",
                    cname, org, e.getMessage(), e);
            throw new RuntimeException("Failed to delete files", e);
        }
    }

    /**
     * Export zip.
     *
     * @param cname the cname
     * @param org   the org
     * @return the byte array containing the zip file
     */
    public byte[] exportZip(String cname, String org) {
        logger.info("Exporting ZIP for cname: {}, org: {}", cname, org);

        try {
            List<ICIPAiAgentScript> scripts = aiAgentService.findByNameAndOrg(cname, org);

            if (scripts == null || scripts.isEmpty()) {
                logger.warn("No scripts found to export for cname: {}, org: {}", cname, org);
                return new byte[0];
            }

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                 ZipOutputStream zos = new ZipOutputStream(baos)) {

                for (ICIPAiAgentScript script : scripts) {
                    if (script.getFilePath() != null && script.getFilescript() != null) {
                        // Create ZIP entry with the file path
                        ZipEntry zipEntry = new ZipEntry(script.getFilePath());
                        zos.putNextEntry(zipEntry);

                        // Write file content from Blob
                        Blob blob = script.getFilescript();
                        byte[] fileData = blob.getBytes(1, (int) blob.length());
                        zos.write(fileData);
                        zos.closeEntry();

                        logger.debug("Added file to ZIP: {}", script.getFilePath());
                    }
                }

                zos.finish();
                byte[] zipBytes = baos.toByteArray();
                logger.info("Successfully exported ZIP for cname: {}, org: {} with {} files, size: {} bytes",
                        cname, org, scripts.size(), zipBytes.length);
                return zipBytes;

            } catch (SQLException e) {
                logger.error("SQL error while exporting ZIP for cname: {}, org: {}. Error: {}",
                        cname, org, e.getMessage(), e);
                throw new RuntimeException("Failed to read file content from database", e);
            }

        } catch (IOException e) {
            logger.error("IO error while exporting ZIP for cname: {}, org: {}. Error: {}",
                    cname, org, e.getMessage(), e);
            throw new RuntimeException("Failed to create ZIP file", e);
        } catch (Exception e) {
            logger.error("Unexpected error while exporting ZIP for cname: {}, org: {}. Error: {}",
                    cname, org, e.getMessage(), e);
            throw new RuntimeException("Failed to export ZIP", e);
        }
    }

    /**
     * Push zip file to MinIO server.
     *
     * @param zipFile the zip file (optional - MultipartFile)
     * @param zipBytes the zip bytes (optional - byte array)
     * @param bucketName the bucket name
     * @param objectKey the object key/path in MinIO
     * @param cname the customer name
     * @param org the organization
     * @return true if upload successful, false otherwise
     */
    public boolean pushZipToMinIO(MultipartFile zipFile, byte[] zipBytes, String bucketName, String objectKey, String cname, String org) {
        logger.info("Pushing ZIP to MinIO - bucket: {}, objectKey: {}, cname: {}, org: {}", bucketName, objectKey, cname, org);

        try {
            // Validate that at least one zip source is provided
            if ((zipFile == null || zipFile.isEmpty()) && (zipBytes == null || zipBytes.length == 0)) {
                logger.error("Neither zipFile nor zipBytes provided for MinIO upload");
                return false;
            }

            // Build MinIO client
            MinioClient minioClient = buildMinioClient();

            // Check if bucket exists, create if not
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!bucketExists) {
                logger.info("Bucket '{}' does not exist. Creating bucket...", bucketName);
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                logger.info("Bucket '{}' created successfully", bucketName);
            }

            // Prepare input stream and content length
            InputStream inputStream;
            long contentLength;

            if (zipFile != null && !zipFile.isEmpty()) {
                inputStream = zipFile.getInputStream();
                contentLength = zipFile.getSize();
                logger.info("Using MultipartFile for upload, size: {} bytes", contentLength);
            } else {
                inputStream = new ByteArrayInputStream(zipBytes);
                contentLength = zipBytes.length;
                logger.info("Using byte array for upload, size: {} bytes", contentLength);
            }

            // Upload to MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(inputStream, contentLength, -1)
                            .contentType("application/zip")
                            .build()
            );

            logger.info("Successfully uploaded ZIP to MinIO: bucket={}, objectKey={}", bucketName, objectKey);
            return true;

        } catch (Exception e) {
            logger.error("Failed to push ZIP to MinIO for bucket: {}, objectKey: {}, cname: {}, org: {}. Error: {}",
                    bucketName, objectKey, cname, org, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Push zip file to MinIO server.
     *
     * @param zipFile the zip file (optional - MultipartFile)
     * @param zipBytes the zip bytes (optional - byte array)
     * @param bucketName the bucket name
     * @param objectKey the object key/path in MinIO
     * @param cname the customer name
     * @param org the organization
     * @param minioUrl custom MinIO URL
     * @param minioAccessKey custom MinIO access key
     * @param minioSecretKey custom MinIO secret key
     * @return true if upload successful, false otherwise
     */
    public boolean pushZipToMinIO(MultipartFile zipFile, byte[] zipBytes, String bucketName, String objectKey, String cname, String org, String minioUrl, String minioAccessKey, String minioSecretKey) {
        logger.info("Pushing ZIP to MinIO (custom connection) - bucket: {}, objectKey: {}, cname: {}, org: {}", bucketName, objectKey, cname, org);
        try {
            if ((zipFile == null || zipFile.isEmpty()) && (zipBytes == null || zipBytes.length == 0)) {
                logger.error("Neither zipFile nor zipBytes provided for MinIO upload");
                return false;
            }
            MinioClient minioClient = buildMinioClient(minioUrl, minioAccessKey, minioSecretKey);
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!bucketExists) {
                logger.info("Bucket '{}' does not exist. Creating bucket...", bucketName);
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                logger.info("Bucket '{}' created successfully", bucketName);
            }
            InputStream inputStream;
            long contentLength;
            if (zipFile != null && !zipFile.isEmpty()) {
                inputStream = zipFile.getInputStream();
                contentLength = zipFile.getSize();
                logger.info("Using MultipartFile for upload, size: {} bytes", contentLength);
            } else {
                inputStream = new ByteArrayInputStream(zipBytes);
                contentLength = zipBytes.length;
                logger.info("Using byte array for upload, size: {} bytes", contentLength);
            }
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(inputStream, contentLength, -1)
                            .contentType("application/zip")
                            .build()
            );
            logger.info("Successfully uploaded ZIP to MinIO: bucket={}, objectKey={}", bucketName, objectKey);
            return true;
        } catch (Exception e) {
            logger.error("Failed to push ZIP to MinIO for bucket: {}, objectKey: {}, cname: {}, org: {}. Error: {}",
                    bucketName, objectKey, cname, org, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Push exported zip to MinIO - convenience method that exports from DB and uploads.
     *
     * @param cname the customer name
     * @param org the organization
     * @param bucketName the bucket name
     * @param objectKey the object key/path in MinIO (e.g., "ai-agent-scripts/cname-org.zip")
     * @return true if successful, false otherwise
     */
    public boolean exportAndPushToMinIO(String cname, String org, String bucketName, String objectKey) {
        logger.info("Exporting and pushing to MinIO for cname: {}, org: {}", cname, org);
        try {
            byte[] zipBytes = exportZip(cname, org);
            if (zipBytes == null || zipBytes.length == 0) {
                logger.warn("No data to export for cname: {}, org: {}", cname, org);
                return false;
            }
            return pushZipToMinIO(null, zipBytes, bucketName, objectKey, cname, org);
        } catch (Exception e) {
            logger.error("Failed to export and push to MinIO for cname: {}, org: {}. Error: {}",
                    cname, org, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Push exported zip to MinIO - convenience method that exports from DB and uploads.
     *
     * @param cname the customer name
     * @param org the organization
     * @param bucketName the bucket name
     * @param objectKey the object key/path in MinIO (e.g., "ai-agent-scripts/cname-org.zip")
     * @param minioUrl custom MinIO URL
     * @param minioAccessKey custom MinIO access key
     * @param minioSecretKey custom MinIO secret key
     * @return true if successful, false otherwise
     */
    public boolean exportAndPushToMinIO(String cname, String org, String bucketName, String objectKey, String minioUrl, String minioAccessKey, String minioSecretKey) {
        logger.info("Exporting and pushing to MinIO (custom connection) for cname: {}, org: {}", cname, org);
        try {
            byte[] zipBytes = exportZip(cname, org);
            if (zipBytes == null || zipBytes.length == 0) {
                logger.warn("No data to export for cname: {}, org: {}", cname, org);
                return false;
            }
            return pushZipToMinIO(null, zipBytes, bucketName, objectKey, cname, org, minioUrl, minioAccessKey, minioSecretKey);
        } catch (Exception e) {
            logger.error("Failed to export and push to MinIO for cname: {}, org: {}. Error: {}",
                    cname, org, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Build MinIO client with SSL context configuration.
     *
     * @return MinioClient instance
     * @throws Exception if client creation fails
     */
    private MinioClient buildMinioClient() throws Exception {
        logger.info("Building MinIO client with URL: {}", minioUrl);

        if (minioUrl == null || minioUrl.isBlank()) {
            throw new IllegalStateException("MinIO URL is not configured. Please set icip.minio.url property.");
        }

        if (minioAccessKey == null || minioAccessKey.isBlank()) {
            throw new IllegalStateException("MinIO access key is not configured. Please set icip.minio.access-key property.");
        }

        if (minioSecretKey == null || minioSecretKey.isBlank()) {
            throw new IllegalStateException("MinIO secret key is not configured. Please set icip.minio.secret-key property.");
        }

        // Build SSL context with trust all certificates if certificate check is disabled
        TrustManager[] trustAllCerts = getTrustAllCerts();
        SSLContext sslContext = getSslContext(trustAllCerts);

        if (sslContext == null) {
            throw new IllegalStateException("SSLContext could not be initialized");
        }

        // Build custom HTTP client with SSL configuration
        OkHttpClient customHttpClient = new OkHttpClient.Builder()
                .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                .hostnameVerifier(com.lfn.ai.comm.lib.util.SafeHostnameVerifier.INSTANCE)
                .build();

        // Build and return MinIO client
        return MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(minioAccessKey, minioSecretKey)
                .httpClient(customHttpClient)
                .build();
    }

    /**
     * Build MinIO client with SSL context configuration.
     *
     * @param minioUrl custom MinIO URL
     * @param minioAccessKey custom MinIO access key
     * @param minioSecretKey custom MinIO secret key
     * @return MinioClient instance
     * @throws Exception if client creation fails
     */
    private MinioClient buildMinioClient(String minioUrl, String minioAccessKey, String minioSecretKey) throws Exception {
        logger.info("Building MinIO client with custom URL: {}", minioUrl);

        if (minioUrl == null || minioUrl.isBlank()) {
            throw new IllegalStateException("MinIO URL is not configured (from DB). Please check connection details.");
        }

        if (minioAccessKey == null || minioAccessKey.isBlank()) {
            throw new IllegalStateException("MinIO access key is not configured (from DB). Please check connection details.");
        }

        if (minioSecretKey == null || minioSecretKey.isBlank()) {
            throw new IllegalStateException("MinIO secret key is not configured (from DB). Please check connection details.");
        }

        // Build SSL context with trust all certificates if certificate check is disabled
        TrustManager[] trustAllCerts = getTrustAllCerts();
        SSLContext sslContext = getSslContext(trustAllCerts);

        if (sslContext == null) {
            throw new IllegalStateException("SSLContext could not be initialized");
        }

        // Build custom HTTP client with SSL configuration
        OkHttpClient customHttpClient = new OkHttpClient.Builder()
                .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                .hostnameVerifier(com.lfn.ai.comm.lib.util.SafeHostnameVerifier.INSTANCE)
                .build();

        // Build and return MinIO client
        return MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(minioAccessKey, minioSecretKey)
                .httpClient(customHttpClient)
                .build();
    }

    /**
     * Get trust manager that trusts all certificates.
     *
     * @return array of TrustManager
     */
    private TrustManager[] getTrustAllCerts() {
        return SecureTrustManagerUtil.getValidatingTrustManagers();
    }

    /**
     * Get SSL context with custom trust manager.
     *
     * @param trustAllCerts the trust manager array
     * @return SSLContext instance or null if creation fails
     */
    private SSLContext getSslContext(TrustManager[] trustAllCerts) {
        try {
            // Check if certificate validation should be bypassed
            if ("false".equalsIgnoreCase(certificateCheck)) {
                logger.info("Certificate check is disabled, using trust-all SSL context");
                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, trustAllCerts, new SecureRandom());
                return sslContext;
            } else {
                logger.info("Certificate check is enabled, using default SSL context");
                return SSLContext.getDefault();
            }
        } catch (NoSuchAlgorithmException | KeyManagementException e) {
            logger.error("Failed to create SSL context: {}", e.getMessage(), e);
            return null;
        }
    }
}
