package com.lfn.icip.vibecoding.service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.lfn.icip.vibecoding.util.PathSafety;

import io.minio.GetObjectArgs;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.Result;
import io.minio.messages.Item;

/**
 * Reads the files Goose generated for a session directly from MinIO.
 * <p>
 * Goose uploads every file it writes/edits to object keys shaped
 * {@code <bucket>/<prefix>/<session_id>/<relative_path>} (default prefix
 * {@code goose-apps}). Instead of re-exporting each file from the Goose agent
 * one HTTP call at a time, this service lists that folder and downloads each
 * object, returning the working-dir-relative path and its UTF-8 content.
 */
@Service
public class GooseMinioService {

    private static final Logger logger = LoggerFactory.getLogger(GooseMinioService.class);

    /**
     * Binary object extensions to skip — the Vibe Studio file tree is text-only
     * (the previous call-tool {@code view} path only ever returned text). Skipping
     * these avoids corrupting the tree with non-UTF-8 bytes.
     */
    private static final Set<String> BINARY_EXTENSIONS = Set.of(
            "png", "jpg", "jpeg", "gif", "ico", "webp", "bmp",
            "woff", "woff2", "ttf", "eot", "otf",
            "pdf", "zip", "gz", "tar", "mp3", "mp4", "wav", "avi", "mov");

    private final MinioClient minioClient;
    private final String bucket;
    private final String prefix;

    public GooseMinioService(
            @Qualifier("gooseMinioClient") MinioClient minioClient,
            @Value("${vibe.minio.bucket:aiptest}") String bucket,
            @Value("${vibe.minio.prefix:goose-apps}") String prefix) {
        this.minioClient = minioClient;
        this.bucket = bucket;
        // Normalise: no leading/trailing slash so keys build cleanly.
        this.prefix = prefix == null ? "" : prefix.replaceAll("^/+", "").replaceAll("/+$", "");
    }

    /**
     * A single file fetched from MinIO. Path is relative to the session's
     * working directory (i.e. the key with the {@code <prefix>/<session_id>/}
     * portion stripped).
     */
    public record FileEntry(String path, String content) {}

    /**
     * List and download every text file stored under
     * {@code <prefix>/<sessionId>/} for the given session.
     *
     * @param sessionId the Goose session id (validated as a safe path segment)
     * @return one {@link FileEntry} per text object; empty if the session has no files
     */
    public List<FileEntry> listSessionFiles(String sessionId) {
        String safeSessionId = PathSafety.sanitizeId(sessionId);
        String keyPrefix = (prefix.isEmpty() ? "" : prefix + "/") + safeSessionId + "/";

        List<FileEntry> files = new ArrayList<>();
        try {
            Iterable<Result<Item>> objects = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucket)
                            .prefix(keyPrefix)
                            .recursive(true)
                            .build());

            for (Result<Item> result : objects) {
                Item item = result.get();
                if (item.isDir()) {
                    continue;
                }
                String objectKey = item.objectName();
                String relativePath = objectKey.substring(keyPrefix.length());
                if (relativePath.isBlank()) {
                    continue;
                }
                if (isBinary(relativePath)) {
                    logger.debug("Skipping binary object {}", objectKey);
                    continue;
                }

                try (InputStream stream = minioClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(bucket)
                                .object(objectKey)
                                .build())) {
                    String content = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
                    files.add(new FileEntry(relativePath, content));
                } catch (Exception ex) {
                    logger.warn("Could not download object '{}', skipping: {}", objectKey, ex.getMessage());
                }
            }
        } catch (Exception ex) {
            logger.error("Failed to list MinIO files for session '{}' (bucket={}, prefix={}): {}",
                    safeSessionId, bucket, keyPrefix, ex.getMessage(), ex);
            throw new RuntimeException("Failed to read session files from MinIO: " + ex.getMessage(), ex);
        }

        logger.info("Fetched {} file(s) from MinIO for session {}", files.size(), safeSessionId);
        return files;
    }

    private static boolean isBinary(String relativePath) {
        int dot = relativePath.lastIndexOf('.');
        if (dot < 0 || dot == relativePath.length() - 1) {
            return false;
        }
        String ext = relativePath.substring(dot + 1).toLowerCase();
        return BINARY_EXTENSIONS.contains(ext);
    }
}
