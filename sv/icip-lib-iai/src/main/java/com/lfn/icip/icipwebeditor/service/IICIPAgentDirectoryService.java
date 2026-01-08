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

package com.lfn.icip.icipwebeditor.service;

import com.lfn.icip.icipwebeditor.model.AgentDirectory;
import com.lfn.icip.icipwebeditor.model.dto.AgentDirectoryDTO;
import com.lfn.icip.icipwebeditor.model.dto.AgentSearchRequestDTO;
import com.lfn.icip.icipwebeditor.model.dto.AgentSearchResponseDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * The Interface IICIPAgentDirectoryService.
 */
public interface IICIPAgentDirectoryService {

    /**
     * Save or update agent directory.
     * If cid is null or not found, creates a new agent.
     * If cid exists, updates the existing agent.
     *
     * @param agentDirectoryDTO the agent directory DTO
     * @return the saved agent directory DTO
     */
    AgentDirectoryDTO saveOrUpdateAgentDirectory(AgentDirectoryDTO agentDirectoryDTO);

    /**
     * Gets the agent directory by name and organization.
     *
     * @param name the name
     * @param organization the organization
     * @return the agent directory
     */
    AgentDirectoryDTO getAgentDirectory(String name, String organization);



    /**
     * Delete agent directory by cid.
     *
     * @param cid the cid
     */
    void deleteAgentDirectory(Long cid);

    /**
     * Gets all agents by type and organization with pagination and filtering.
     * Similar to getAllPipelinesByTypeAndOrg but for agent directory.
     *
     * @param project the project/organization
     * @param paginate the pagination information
     * @param query the search query
     * @param type the type filter
     * @param interfacetype the interface type filter
     * @return the list of agent directories
     */
    List<AgentDirectory> getAllAgentsByTypeAndOrg(String project, Pageable paginate, String query,
                                                  String type, String interfacetype);

    /**
     * Gets the count of agents by type and organization.
     *
     * @param project the project/organization
     * @param query the search query
     * @param type the type filter
     * @param interfacetype the interface type filter
     * @return the count
     */
    Long getAgentsCountByTypeAndOrg(String project, String query, String type, String interfacetype);


    /**
     * Gets all pipeline IDs present in agent directory by organization and interface type.
     *
     * @param organization the organization
     * @param interfacetype the interface type filter (optional)
     * @return the list of pipeline IDs
     */
    List<Long> getAllPipelineIdsByOrgAndInterfaceType(String organization, String interfacetype);


    /**
     * Convert agent directory entity to DTO.
     * This prevents circular reference issues during JSON serialization.
     *
     * @param agentDirectory the agent directory entity
     * @return the agent directory DTO
     */
    AgentDirectoryDTO convertToDTO(AgentDirectory agentDirectory);

    /**
     * Search agents by skills, locators, domains, and modules.
     * Implements OR-based matching with configurable threshold (min_match_score).
     * Supports hierarchical prefix matching for skills, domains, and modules.
     * Supports exact matching for locators.
     *
     * @param searchRequest the search request containing queries and filters
     * @return the search response with matching agents and their scores
     */
    AgentSearchResponseDTO searchAgents(AgentSearchRequestDTO searchRequest);
}
