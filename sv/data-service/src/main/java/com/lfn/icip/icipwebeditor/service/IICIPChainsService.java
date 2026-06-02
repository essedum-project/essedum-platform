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

package com.lfn.icip.icipwebeditor.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Marker;

import com.lfn.icip.icipwebeditor.job.model.ICIPChains;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPChainsService.
 *
 * @author essedum
 */
public interface IICIPChainsService {

	/**
	 * Gets the all jobs.
	 *
	 * @param org the org
	 * @param page the page
	 * @param size the size
	 * @return the all jobs
	 */
	List<ICIPChains> getAllJobs(String org, int page, int size);

	/**
	 * Gets the all jobs.
	 *
	 * @param org the org
	 * @return the all jobs
	 */
	List<ICIPChains> getAllJobs(String org,String filter);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Save.
	 *
	 * @param chain the chain
	 * @return the ICIP chains
	 */
	ICIPChains save(ICIPChains chain);

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP chains
	 */
	ICIPChains findByName(String name);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the ICIP chains
	 */
	ICIPChains findByNameAndOrganization(String name, String org);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Delete job.
	 *
	 * @param id the id
	 */
	void deleteJob(Integer id);

	/**
	 * Copy.
	 *
	 * @param marker the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId the to project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	void delete(String project);

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP chains
	 */
	Optional<ICIPChains> findChainByID(Integer id);

}