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

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import com.lfn.icip.icipwebeditor.model.AgentDirectory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



/**
 * The Interface AgentDirectoryRepository.
 */
@Repository
public interface AgentDirectoryRepository extends JpaRepository<AgentDirectory, Long> {

    /**
     * Find by alias.
     *
     * @param alias the alias
     * @return the optional
     */
    Optional<AgentDirectory> findByAlias(String alias);

    /**
     * Find by type.
     *
     * @param type the type
     * @return the list
     */
    List<AgentDirectory> findByType(String type);

    /**
     * Find by category.
     *
     * @param category the category
     * @return the list
     */
    List<AgentDirectory> findByCategory(String category);

    /**
     * Find by organization.
     *
     * @param organization the organization
     * @return the list
     */
    List<AgentDirectory> findByOrganization(String organization);

    /**
     * Find by pipeline cid.
     *
     * @param pipelineId the pipeline id
     * @return the list
     */
    List<AgentDirectory> findByPipelineCid(Integer pipelineId);

    /**
     * Exists by alias.
     *
     * @param alias the alias
     * @return true, if successful
     */
    boolean existsByAlias(String alias);

    /**
     * Get by alias and organization.
     *
     * @param alias the alias
     * @param organization the organization
     * @return the list
     */
    List<AgentDirectory> getByAliasAndOrganization(String alias, String organization);

    /**
     * Count by name.
     *
     * @param name the name
     * @return the count
     */
    Long countByName(String name);

    /**
     * Find by name and organization.
     *
     * @param name the name
     * @param organization the organization
     * @return the optional agent directory
     */
    Optional<AgentDirectory> findByNameAndOrganization(String name, String organization);

    /**
     * Get by name and organization.
     *
     * @param name the name
     * @param organization the organization
     * @return the list of agent directories
     */
    List<AgentDirectory> getByNameAndOrganization(String name, String organization);

    /**
     * Find by pipeline cid in list and type.
     *
     * @param pipelineCids the list of pipeline CIDs
     * @param type the type
     * @return the list of agent directories
     */
    List<AgentDirectory> findByPipelineCidInAndType(List<Integer> pipelineCids, String type);

    /**
     * Get all agents by type and organization with pagination.
     * Similar to getAllPipelinesByTypeandOrg but for agent_directory table.
     *
     * @param project the list of organizations/projects
     * @param paginate the pagination information
     * @param query the search query
     * @param type the type filter
     * @param interfacetype the interface type filter
     * @return the list of agent directories
     */
    @Query(value = "SELECT * FROM agent_directory a1 WHERE "
            + "(COALESCE(:type, 'notRequired') = 'notRequired' OR FIND_IN_SET(a1.type, :type)) "
            + "AND a1.organization IN (:project) "
            + "AND (:interfacetype IS NULL OR a1.interface_type = :interfacetype) "
            + "AND (:query1 IS NULL OR LOWER(a1.alias) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.name) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.type) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.description) LIKE LOWER(CONCAT('%', :query1, '%'))) "
            + "ORDER BY a1.created_at DESC", nativeQuery = true)
    List<AgentDirectory> getAllAgentsByTypeAndOrg(
            @Param("project") List<String> project,
            Pageable paginate,
            @Param("query1") String query,
            @Param("type") String type,
            @Param("interfacetype") String interfacetype);

    /**
     * Get count of agents by type and organization.
     *
     * @param project the list of organizations/projects
     * @param query the search query
     * @param type the type filter
     * @param interfacetype the interface type filter
     * @return the count
     */
    @Query(value = "SELECT COUNT(*) FROM agent_directory a1 WHERE "
            + "(COALESCE(:type, 'notRequired') = 'notRequired' OR FIND_IN_SET(a1.type, :type)) "
            + "AND a1.organization IN (:project) "
            + "AND (:interfacetype IS NULL OR a1.interface_type = :interfacetype) "
            + "AND (:query1 IS NULL OR LOWER(a1.alias) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.name) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.type) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.description) LIKE LOWER(CONCAT('%', :query1, '%')))", nativeQuery = true)
    Long getAgentsCountByTypeAndOrg(
            @Param("project") List<String> project,
            @Param("query1") String query,
            @Param("type") String type,
            @Param("interfacetype") String interfacetype);

    /**
     * Get all agents by organization only with pagination (no type filtering).
     *
     * @param project the list of organizations/projects
     * @param paginate the pagination information
     * @param query the search query
     * @return the list of agent directories
     */
    @Query(value = "SELECT * FROM agent_directory a1 WHERE "
            + "a1.organization IN (:project) "
            + "AND (:query1 IS NULL OR LOWER(a1.alias) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.name) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.type) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.description) LIKE LOWER(CONCAT('%', :query1, '%'))) "
            + "ORDER BY a1.created_at DESC", nativeQuery = true)
    List<AgentDirectory> getAllAgentsByOrg(
            @Param("project") List<String> project,
            Pageable paginate,
            @Param("query1") String query);

    /**
     * Get count of agents by organization only (no type filtering).
     *
     * @param project the list of organizations/projects
     * @param query the search query
     * @return the count
     */
    @Query(value = "SELECT COUNT(*) FROM agent_directory a1 WHERE "
            + "a1.organization IN (:project) "
            + "AND (:query1 IS NULL OR LOWER(a1.alias) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.name) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.type) LIKE LOWER(CONCAT('%', :query1, '%')) "
            + "    OR LOWER(a1.description) LIKE LOWER(CONCAT('%', :query1, '%')))", nativeQuery = true)
    Long getAgentsCountByOrg(
            @Param("project") List<String> project,
            @Param("query1") String query);


    /**
     * Get all distinct pipeline IDs from agent directory by organization and interface type.
     * Returns only non-null pipeline IDs filtered by interface type.
     *
     * @param organization the organization
     * @param interfacetype the interface type
     * @return the list of pipeline IDs
     */
    @Query(value = "SELECT DISTINCT a.pipeline_id FROM agent_directory a WHERE a.organization = :organization AND a.interface_type = :interfacetype AND a.pipeline_id IS NOT NULL", nativeQuery = true)
    List<Long> findAllPipelineIdsByOrganizationAndInterfaceType(
            @Param("organization") String organization,
            @Param("interfacetype") String interfacetype);
}
