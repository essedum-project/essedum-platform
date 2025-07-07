/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.service;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.Project2;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing Project.
 */
/**
 * @author icets
 */
public interface ProjectService {

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the project
	 */
	public Project findByName(String name);

	/**
	 * Save a project.
	 *
	 * @param project the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	Project save(Project project) throws SQLException;

	/**
	 * Get all the projects.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	Page<Project> findAll(Pageable pageable) throws SQLException;

	/**
	 * Get the "id" project.
	 *
	 * @param id the id of the entity
	 * @return the entitywa
	 * @throws SQLException the SQL exception
	 */
	Project findOne(Integer id) throws SQLException;

	/**
	 * Delete the "id" project.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */
	void delete(Project project) throws SQLException;

	/**
	 * Get all the projects with search.
	 *
	 * @param req the req
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	PageResponse<Project> getAll(PageRequestByExample<Project> req) throws SQLException;

	/**
	 * To DTO.
	 *
	 * @param project the project
	 * @param depth   the depth
	 * @return the project
	 */
	public Project toDTO(Project project, int depth);

	/**
	 * Update project.
	 *
	 * @param projectId   the project id
	 * @param updatedDate the updated date
	 * @return the int
	 */
	public int updateProject(int projectId, ZonedDateTime updatedDate);

	/**
	 * Find all.
	 *
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	List<Project> findAll() throws SQLException;
	
	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe the prbe
	 * @return the page response
	 */
	public PageResponse<Project> search(Pageable pageable, PageRequestByExample<Project> prbe);

	/**
	 * Gets the paginated project list.
	 *
	 * @param prbe the prbe
	 * @param pageable the pageable
	 * @return the paginated project list
	 */
	public PageResponse<Project> getPaginatedProjectList(PageRequestByExample<Project> prbe, Pageable pageable);
	
	/**
	 * Find all names.
	 *
	 * @return the list
	 */
	public List<String> findAllNames();

	/**
	 * Find project by name.
	 *
	 * @param name the name
	 * @return the project
	 */
	public Project findProjectByName(String name);
	
	public List<Project> findProjectByPortfolio(Integer portfolioId);
	
	public List<Project> findAllProjectByName(String projectName);
	
	
	/**
	 * Find projectId by name.
	 *
	 * @param projectName the projectName
	 * @return the projectId
	 */
	public Integer getProjectIdByProjectName(String projectName);

	public List<Integer> findProjectIdsForPortfolio(Integer portfolioId);
}
