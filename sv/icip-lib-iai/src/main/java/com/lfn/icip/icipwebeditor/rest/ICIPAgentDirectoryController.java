/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.icip.icipwebeditor.model.AgentDirectory;
import com.lfn.icip.icipwebeditor.model.dto.AgentDirectoryDTO;
import com.lfn.icip.icipwebeditor.model.dto.AgentSearchRequestDTO;
import com.lfn.icip.icipwebeditor.model.dto.AgentSearchResponseDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.lfn.icip.icipwebeditor.service.IICIPAgentDirectoryService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;
import io.micrometer.core.annotation.Timed;
import jakarta.transaction.Transactional;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * The Class ICIPAgentDirectoryController.
 * REST controller for managing Agent Directory operations.
 *
 * @author essedum
 */
@RestController
@Timed
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://localhost:8087",
        "https://langflow.az.ad.idemo-ppc.com", "https://essedum.az.ad.idemo-ppc.com"},
        allowedHeaders = {"*", "Authorization", "Content-Type", "Project", "ProjectName", "roleId", "roleName", "X-Requested-With", "charset"},
        allowCredentials = "true",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping(path = "/${icip.pathPrefix}/agent-directory")
public class ICIPAgentDirectoryController {

    /** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "agent-directory";

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(ICIPAgentDirectoryController.class);

    /** The agent directory service. */
    @Autowired
    private IICIPAgentDirectoryService agentDirectoryService;

    /** The streaming services service. */
    @Autowired
    private IICIPStreamingServiceService streamingServicesService;

    /** The streaming services repository. */
    @Autowired
    private ICIPStreamingServicesRepository streamingServicesRepository;

    /** The object mapper for JSON parsing. */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** The claim. */
    @Value("${security.claim:#{null}}")
    private String claim;

    /**
     * Create or update agent directory.
     * If cid is null, creates a new agent.
     * If cid is provided, updates the existing agent.
     *
     * @param agentDirectoryDTO the agent directory DTO
     * @return the response entity with saved agent directory
     * @throws URISyntaxException if URI syntax is invalid
     */
    @PostMapping("/save")
    @Transactional
    public ResponseEntity<?> saveOrUpdateAgentDirectory(
            @RequestBody AgentDirectoryDTO agentDirectoryDTO) throws URISyntaxException {

        logger.info("Saving/Updating agent directory with alias: {}", agentDirectoryDTO.getAlias());

        AgentDirectoryDTO result = agentDirectoryService.saveOrUpdateAgentDirectory(agentDirectoryDTO);

        if (agentDirectoryDTO.getCid() == null) {
            // Create operation
            logger.info("Created new agent directory with cid: {}", result.getCid());
            return ResponseEntity.created(new URI("/agent-directory/" + result.getCid()))
                    .headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getCid().toString()))
                    .body(result);
        } else {
            // Update operation
            logger.info("Updated agent directory with cid: {}", result.getCid());
            return ResponseEntity.ok()
                    .headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getCid().toString()))
                    .body(result);
        }
    }


    /**
     * Get agent directory by name and organization.
     *
     * @param name the name
     * @param organization the organization
     * @return the response entity with agent directory
     */
    @GetMapping("/get/{name}/{organization}")
    public ResponseEntity<?> getAgentDirectory(
            @PathVariable(name = "name") String name,
            @PathVariable(name = "organization") String organization) {

        logger.info("Getting agent directory by name: {} and organization: {}", name, organization);

        AgentDirectoryDTO agentDirectory = agentDirectoryService.getAgentDirectory(name, organization);

        if (agentDirectory == null) {
            logger.warn("Agent directory not found for name: {} and organization: {}", name, organization);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Agent directory not found");
        }

        return ResponseEntity.ok(agentDirectory);
    }

    /**
     * Delete agent directory by cid.
     *
     * @param cid the cid
     * @return the response entity
     */
    @DeleteMapping("/delete/{cid}")
    @Transactional
    public ResponseEntity<?> deleteAgentDirectory(@PathVariable(name = "cid") Long cid) {

        logger.info("Deleting agent directory with cid: {}", cid);

        agentDirectoryService.deleteAgentDirectory(cid);

        logger.info("Successfully deleted agent directory with cid: {}", cid);
        return ResponseEntity.ok()
                .headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, cid.toString()))
                .body("Agent directory deleted successfully");
    }

    /**
     * List agents with pagination and filtering.
     * Similar to /pipelines/training/list but for agent directory.
     *
     * Query parameters expected:
     * - page: Page number (1-based, default: 1)
     * - size: Page size (default: 8)
     * - project: Organization/project name (required)
     * - isCached: Whether to use cached data (required, should be true for internal)
     * - adapter_instance: Adapter instance (should be "internal" for agent directory)
     * - interfacetype: Interface type filter (e.g., "pipeline-agent")
     * - type: Type filter (optional)
     * - query: Search query (optional)
     *
     * Example: /agent-directory/list?page=1&size=8&project=leo1311&isCached=true&adapter_instance=internal&interfacetype=pipeline-agent
     *
     * @param adapterInstance the adapter instance
     * @param type the type filter
     * @param project the project/organization
     * @param page the page number (1-based)
     * @param size the page size
     * @param isCached whether to use cached data
     * @param query the search query
     * @param interfacetype the interface type filter
     * @return the response entity with list of agents
     */
    @GetMapping("/list")
    public ResponseEntity<String> listAgents(
            @RequestParam(name = "adapter_instance", required = true) String adapterInstance,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "project", required = true) String project,
            @RequestParam(name = "page", required = false, defaultValue = "1") String page,
            @RequestParam(name = "size", required = false, defaultValue = "10") String size,
            @RequestParam(name = "isCached", required = true) Boolean isCached,
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "interfacetype", required = false) String interfacetype) {

        logger.info("Listing agents - adapter_instance: {}, project: {}, page: {}, size: {}, isCached: {}, interfacetype: {}",
                adapterInstance, project, page, size, isCached, interfacetype);

        if (isCached && adapterInstance.equals("internal")) {
            // Create pagination object (convert from 1-based to 0-based)
            Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));

            // Fetch agents from database
            List<AgentDirectory> results = agentDirectoryService.getAllAgentsByTypeAndOrg(
                    project, paginate, query, type, interfacetype);

            // Convert entities to DTOs to avoid circular reference issues during JSON serialization
            List<AgentDirectoryDTO> dtoResults = results.stream()
                    .map(agent -> agentDirectoryService.convertToDTO(agent))
                    .collect(Collectors.toList());

            // Convert to JSON response
            String response = new JSONArray(dtoResults).toString();
            logger.info("Successfully retrieved {} agents", dtoResults.size());
            return ResponseEntity.status(200).body(response);
        } else {
            logger.warn("Only internal adapter instance with isCached=true is supported for agent directory");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Only internal adapter instance with isCached=true is supported");
        }
    }

    /**
     * Get count of agents with filtering.
     * Similar to /pipelines/count but for agent directory.
     *
     * Query parameters expected:
     * - adapter_instance: Adapter instance (should be "internal" for agent directory)
     * - type: Type filter (optional)
     * - project: Organization/project name (required)
     * - isCached: Whether to use cached data (required, should be true for internal)
     * - query: Search query (optional)
     * - interfacetype: Interface type filter (e.g., "pipeline-agent")
     *
     * Example: /agent-directory/count?adapter_instance=internal&project=leo1311&isCached=true&interfacetype=pipeline-agent
     *
     * @param adapterInstance the adapter instance
     * @param type the type filter
     * @param project the project/organization
     * @param isCached whether to use cached data
     * @param query the search query
     * @param interfacetype the interface type filter
     * @return the response entity with count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countAgents(
            @RequestParam(name = "adapter_instance", required = true) String adapterInstance,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "project", required = true) String project,
            @RequestParam(name = "isCached", required = true) Boolean isCached,
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "interfacetype", required = false) String interfacetype) {

        logger.info("Counting agents - adapter_instance: {}, project: {}, isCached: {}, interfacetype: {}",
                adapterInstance, project, isCached, interfacetype);

        if (isCached && adapterInstance.equals("internal")) {
            // Get count from database
            Long count = agentDirectoryService.getAgentsCountByTypeAndOrg(project, query, type, interfacetype);
            logger.info("Total agents count: {}", count);
            return ResponseEntity.status(200).body(count);
        } else {
            logger.warn("Only internal adapter instance with isCached=true is supported for agent directory count");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(0L);
        }
    }


    /**
     * Get unregistered pipelines by organization and interface type.
     * This endpoint fetches pipelines from mlpipeline table by organization and interface type,
     * then filters out pipelines whose CIDs ARE already registered in the agent directory,
     * returning only the unregistered pipelines.
     *
     * @param org the organization
     * @param interfacetype the interface type (e.g., "pipeline-agent", "mcpServer")
     * @return the response entity with list of unregistered pipelines
     */
    @GetMapping("/pipelines/unregistered/{org}")
    public ResponseEntity<String> getAllPipelinesByOrg(
            @PathVariable("org") String org,
            @RequestParam(name = "interfacetype", required = true) String interfacetype) {

        logger.info("Fetching unregistered pipelines for organization: {} with interfacetype: {}",
                org, interfacetype);

        // Fetch pipelines from repository by org and interface type
        List<ICIPStreamingServices2DTO> allPipelines = streamingServicesRepository.getPipelinesForAgentDirectory(
                org, interfacetype);

        logger.info("Fetched {} total pipelines from repository", allPipelines.size());

        // Get all pipeline IDs that are already registered in agent directory for this org and interface type
        List<Long> existingPipelineIds = agentDirectoryService.getAllPipelineIdsByOrgAndInterfaceType(org, interfacetype);
        logger.info("Found {} existing pipeline IDs in agent directory", existingPipelineIds.size());

        // Filter out pipelines whose CIDs match with agent directory pipeline IDs
        // Keep only pipelines that are NOT registered (CID not in existingPipelineIds)
        List<ICIPStreamingServices2DTO> unregisteredPipelines = allPipelines.stream()
                .filter(pipeline -> pipeline.getCid() != null &&
                        !existingPipelineIds.contains(Long.valueOf(pipeline.getCid())))
                .collect(Collectors.toList());

        String response = new JSONArray(unregisteredPipelines).toString();
        logger.info("Successfully retrieved {} unregistered pipelines for organization: {}",
                unregisteredPipelines.size(), org);

        return ResponseEntity.status(200).body(response);
    }

    /**
     * Search agents by skills, locators, domains, and modules.
     * Implements OR-based matching with configurable threshold (min_match_score).
     * Supports hierarchical prefix matching for skills, domains, and modules.
     * Supports exact matching for locators.
     * Supports flexible key-value pair matching for domains and locators.
     *
     * Request body example:
     * {
     *   "queries": [
     *     { "type": "SKILL", "value": "AI" },
     *     { "type": "DOMAIN", "key": "domain", "value": "research" },
     *     { "type": "DOMAIN", "key": "domain" },
     *     { "type": "DOMAIN", "value": "research" },
     *     { "type": "LOCATOR", "key": "source-code", "value": "Github" },
     *     { "type": "LOCATOR", "key": "source-code" },
     *     { "type": "LOCATOR", "value": "Github" },
     *     { "type": "MODULE", "value": "Module1" }
     *   ],
     *   "min_match_score": 1,
     *   "limit": 10,
     *   "organization": "leo1311"
     * }
     *
     * Query structure:
     * - type: Required - SKILL, DOMAIN, MODULE, or LOCATOR
     * - key: Optional for all types
     *   - For SKILL/MODULE: Not used
     *   - For DOMAIN: The domain name to match
     *   - For LOCATOR: The locator_type to match
     * - value: Optional for DOMAIN/LOCATOR, Required for SKILL/MODULE
     *   - For SKILL/MODULE: The name to search
     *   - For DOMAIN: The description to search
     *   - For LOCATOR: The URL to search
     *
     * Flexible matching logic for DOMAIN:
     * - Both key and value: Matches when domain.name == key AND domain.description matches value
     * - Only key: Matches when domain.name == key (any description)
     * - Only value: Matches when domain.description matches value (any name)
     *
     * Flexible matching logic for LOCATOR:
     * - Both key and value: Matches when locator.locator_type == key AND locator.url == value
     * - Only key: Matches when locator.locator_type == key (any url)
     * - Only value: Matches when locator.url == value (any type)
     *
     * Response example:
     * {
     *   "results": [
     *     {
     *       "recordRef": 123,
     *       "matchQueries": [
     *         { "type": "SKILL", "value": "AI" },
     *         { "type": "DOMAIN", "key": "domain", "value": "research" }
     *       ],
     *       "matchScore": 2,
     *       "agent": { ... agent details ... }
     *     }
     *   ],
     *   "totalCount": 5
     * }
     *
     * @param searchRequest the search request containing queries and filters
     * @return the response entity with search results
     */
    @PostMapping("/search")
    public ResponseEntity<AgentSearchResponseDTO> searchAgents(
            @RequestBody AgentSearchRequestDTO searchRequest) {

        logger.info("Search agents request received with {} queries",
                searchRequest.getQueries() != null ? searchRequest.getQueries().size() : 0);

        AgentSearchResponseDTO response = agentDirectoryService.searchAgents(searchRequest);

        logger.info("Search completed. Returning {} results out of {} total matches",
                response.getResults().size(), response.getTotalCount());

        return ResponseEntity.ok(response);
    }
}
