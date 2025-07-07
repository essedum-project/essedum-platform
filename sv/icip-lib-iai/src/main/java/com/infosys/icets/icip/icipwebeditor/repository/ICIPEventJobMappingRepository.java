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

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPEventJobMapping;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPEventJobMappingRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPEventJobMappingRepository extends JpaRepository<ICIPEventJobMapping, Integer> {

	/**
	 * Find by eventname and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP event job mapping
	 */
	ICIPEventJobMapping findByEventnameAndOrganization(String name, String org);

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPEventJobMapping> findByOrganization(String org);

	/**
	 * Find by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPEventJobMapping> findByOrgAndSearch(String org, String search, Pageable pageable);
	
	List<ICIPEventJobMapping> findByOrganizationAndInterfacetype(String org,String interfacetype);


	/**
	 * Count by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the long
	 */
	Long countByOrgAndSearch(String org, String search);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);
}
