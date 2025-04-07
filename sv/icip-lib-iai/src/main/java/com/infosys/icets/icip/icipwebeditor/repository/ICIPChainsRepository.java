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
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPChainsRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPChainsRepository extends PagingAndSortingRepository<ICIPChains, Integer> , CrudRepository<ICIPChains, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPChains> findByOrganization(String org);

	/**
	 * Find by filter and organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPChains> findByOrganizationFilter(String org,String filter);
	/**
	 * Find by organization.
	 *
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPChains> findByOrganization(String org, Pageable pageable);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Find by job name.
	 *
	 * @param name the name
	 * @return the ICIP chains
	 */
	ICIPChains findByJobName(String name);

	/**
	 * Find by job name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chains
	 */
	ICIPChains findByJobNameAndOrganization(String name, String org);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);

}
