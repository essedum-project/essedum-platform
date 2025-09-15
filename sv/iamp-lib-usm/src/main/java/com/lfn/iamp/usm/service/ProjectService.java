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

package com.lfn.iamp.usm.service;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.Project2;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing Project.
 */
/**
 * @author essedum
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
