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
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.Crypt;
import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.model.*;
import com.lfn.icip.dataset.model.dto.ICIPDatasetDTO;
import com.lfn.icip.dataset.model.dto.ICIPDatasourceSummary;
import com.lfn.icip.dataset.service.IICIPDataset2Service;
import com.lfn.icip.dataset.service.IICIPDatasetFormMappingService;
import com.lfn.icip.dataset.service.IICIPDatasetIdsmlService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetFilesService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.lfn.icip.icipwebeditor.event.model.InternalEvent;
import com.lfn.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import io.micrometer.core.annotation.Timed;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.io.FilenameUtils;
import org.hibernate.TransactionException;
import org.hibernate.exception.JDBCConnectionException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.spi.MappingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaObjectRetrievalFailureException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

// TODO: Auto-generated Javadoc

/**
 * The Class ICIPDatasetController.
 *
 * @author essedum
 */
@RestController
@Timed
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://localhost:8087"}, 
             allowedHeaders = {"*", "Authorization", "Content-Type", "Project", "ProjectName", "roleId", "roleName", "X-Requested-With", "charset"}, 
             allowCredentials = "true",
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
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

    /**
     * The plugin service.
     */
    @Autowired
    private ICIPDatasetPluginsService pluginService;

    /**
     * The datasource plugin service.
     */
    @Autowired
    private ICIPDatasourcePluginsService datasourcePluginService;

    /**
     * The i ICIP dataset service.
     */
    @Autowired
    private ICIPDatasetService datasetService;

    @Autowired
    private ConstantsService dashConstantService;

    /**
     * The i ICIP dataset 2 service.
     */
    @Autowired
    private IICIPDataset2Service dataset2Service;

    /**
     * The i ICIP datasource service.
     */
    @Autowired
    private IICIPDatasourceService datasourceService;

    /**
     * The ds util.
     */
    @Autowired
    IICIPDataSetServiceUtilFactory dsUtil;

    /**
     * The dataset file service.
     */
    @Autowired
    private ICIPDatasetFilesService datasetFileService;

    /**
     * The Internal Event Publisher.
     */
    @Autowired
    private InternalEventPublisher publisher;

    /**
     * The fileserver service.
     */
    @Autowired
    private FileServerService fileserverService;

    /**
     * The claim.
     */
    @Value("${security.claim:#{null}}")
    private String claim;

    /**
     * The Constant EXCEPTION.
     */
    private static final String EXCEPTION = "Exception";

    /**
     * The encryption key.
     */
    @EssedumProperty("application.uiconfig.enckeydefault")
    private static String enckeydefault;

    @EssedumProperty("icip.pyJobServer")
    private String jobServer;

    /**
     * The scheduler status.
     */
    @EssedumProperty("icip.scheduler.pause.status")
    private String schedulerPauseStatus;

    @EssedumProperty("icip.multivariateUrl")
    private String multivariateUrl;

    @Autowired
    private IICIPDatasetIdsmlService idsmlService;

    @Autowired
    private IICIPDatasetFormMappingService datasetFormService;


    @GetMapping("/filter/advanced/list")
    public ResponseEntity<List<ICIPDataset>> getDatasetsForAdvancedFilter(
            @RequestParam(value = "organization") String organization,
            @RequestParam(value = "aliasOrName", required = false) String aliasOrName,
            @RequestParam(value = "types", required = false) List<String> types,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "knowledgeBases", required = false) List<String> knowledgeBases,
            @RequestParam(name = "page", defaultValue = "0", required = false) String page,
            @RequestParam(name = "size", defaultValue = "8", required = false) String size) {
        logger.info("Advance Filter -List called : {}", organization);
        List<ICIPDataset> results = datasetService.getDatasetsCountForAdvancedFilter(organization, aliasOrName, types,
                tags, knowledgeBases, page, size);
        return ResponseEntity.status(200).body(results);
    }


    @GetMapping("/langflow_export")
    public ResponseEntity<String> sayHello(@RequestParam(name = "name", defaultValue = "World") String name) {
        String message = "Hello " + name;
        return ResponseEntity.ok(message);
    }

    /**
     * Mock API: Receives JSON file + name + details, logs info, returns success/failure.
     */
    @PostMapping(
            value = "/langflow_export_2",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> langflowExport(
            @RequestPart(name = "json", required = false) MultipartFile jsonFile,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "details", required = false) String details
    ) {
        String requestId = UUID.randomUUID().toString();
        logger.info("reqId={} Received export request: name={}, details={}", requestId, name, details);

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
            logger.info("reqId={} Simulating DB save for name={} details={}", requestId, name, details);

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

    private Response buildResponse(String status, String requestId, String message, String details) {
        return new Response(status, requestId, message, details, Instant.now());
    }

    record Response(String status, String requestId, String message, String details, Instant timestamp) {
    }


}
