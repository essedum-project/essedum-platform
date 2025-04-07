/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Marker;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPChainsService.
 *
 * @author icets
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