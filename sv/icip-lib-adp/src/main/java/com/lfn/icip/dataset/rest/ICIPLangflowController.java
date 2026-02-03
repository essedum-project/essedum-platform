/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.dataset.rest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.icip.dataset.model.*;
import io.micrometer.core.annotation.Timed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.*;
import java.time.Instant;
import java.util.*;


/**
 * The Class ICIPDatasetController.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/langflow")
@RefreshScope
public class ICIPLangflowController {

    /**
     * The Constant ENTITY_NAME.
     */
    private static final String ENTITY_NAME = "langflow";

    /**
     * The Constant logger.
     */
    private static final Logger logger = LoggerFactory.getLogger(ICIPLangflowController.class);

    /**
     * Jackson object mapper for JSON processing.
     */
    private final ObjectMapper objectMapper = new ObjectMapper();




    @GetMapping("/get_langflow_agent_export")
    public ResponseEntity<String> sayHello(@RequestParam(name = "name", defaultValue = "Received") String name) {
        String message = "JSON file " + name;
        return ResponseEntity.ok(message);
    }

    /**
     * Mock API: Receives JSON file + name, logs info, returns success/failure.
     */
    @PostMapping(
            value = "/langflow_agent_export",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> langflowExport(
            @RequestPart(name = "json", required = false) MultipartFile jsonFile,
            @RequestParam(name = "name", required = false) String name
    ) {
        String requestId = UUID.randomUUID().toString();
        logger.info("reqId={} Received export request: name={}", requestId, name);

        if (jsonFile == null || jsonFile.isEmpty()) {
            logger.warn("reqId={} No JSON file received", requestId);
            return ResponseEntity.badRequest().body(buildResponse("failure", requestId,
                    "JSON file not received", "Please upload a valid JSON file."));
        }

        try {
            String jsonText = new String(jsonFile.getBytes());
            JsonNode root = objectMapper.readTree(jsonText);

            // Log received JSON: full at DEBUG, truncated sample at INFO
            if (logger.isDebugEnabled()) {
                try {
                    String pretty = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
                    logger.debug("reqId={} Received JSON payload (pretty):\n{}", requestId, pretty);
                } catch (Exception ex) {
                    logger.debug("reqId={} Received JSON (raw): {}", requestId, jsonText);
                }
            }

            String sample = jsonText.length() > 800 ? jsonText.substring(0, 800) + "..." : jsonText;
            logger.info("reqId={} Parsed JSON successfully. sample={}", requestId, sample.replaceAll("\n", " "));

            // Simulate DB export
            logger.info("reqId={} Simulating DB save for name={} details={}", requestId, name);

            // Include received JSON metadata in response for quick verification
            String detailsMessage = String.format("Stored mock record at %s (jsonChars=%d)", Instant.now(), jsonText.length());

            return ResponseEntity.ok(buildResponse("success", requestId,
                    "Langflow JSON exported successfully",
                    detailsMessage));
        } catch (Exception e) {
            logger.error("reqId={} Failed to process JSON", requestId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildResponse("failure", requestId,
                    "Export failed", e.getMessage()));
        }
    }

    /**
     * Mock API: Receives JSON payload for file export details.
     */
    @PostMapping(
            value = "/langflow_export_file_details",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> langflowExportFileDetails(@RequestBody Map<String, Object> payload) {
        String requestId = UUID.randomUUID().toString();
        logger.info("reqId={} Received file details export request", requestId);

        try {
            // Log received payload
            if (logger.isDebugEnabled()) {
                String pretty = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(payload);
                logger.debug("reqId={} Received payload (pretty):\n{}", requestId, pretty);
            }

            String payloadJson = objectMapper.writeValueAsString(payload);
            String sample = payloadJson.length() > 800 ? payloadJson.substring(0, 800) + "..." : payloadJson;
            logger.info("reqId={} Processed file details. sample={}", requestId, sample.replaceAll("\n", " "));

            // Extract key fields for logging
            String alias = (String) payload.get("alias");
            String name = (String) payload.get("name");
            String projectName = (String) payload.get("projectName");
            String portfolioName = (String) payload.get("portfolioName");
            String userName = (String) payload.get("userName");
            
            logger.info("reqId={} File details - alias={}, name={}, projectName={}, portfolioName={}, userName={}", 
                       requestId, alias, name, projectName, portfolioName, userName);

            // Return the payload back with timestamp and requestId
            Map<String, Object> response = new HashMap<>(payload);
            response.put("requestId", requestId);
            response.put("timestamp", Instant.now());
            response.put("status", "success");
            response.put("message", "Langflow file details exported successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("reqId={} Failed to process file details", requestId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildResponse("failure", requestId,
                    "File details export failed", e.getMessage()));
        }
    }

    private Response buildResponse(String status, String requestId, String message, String details) {
        return new Response(status, requestId, message, details, Instant.now());
    }

    record Response(String status, String requestId, String message, String details, Instant timestamp) {
    }


}
