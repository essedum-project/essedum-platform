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
package com.infosys.icets.icip.dataset.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.dataset.model.ICIPPartialDatasource;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the ICIPDataset entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPPartialDatasourceRepository extends JpaRepository<ICIPPartialDatasource, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPPartialDatasource> findByOrganization(String organization);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the ICIP partial datasource
	 */
	ICIPPartialDatasource findByNameAndOrganization(String name, String org);

	/**
	 * Find by organization and groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the list
	 */
	List<ICIPPartialDatasource> findByOrganizationAndGroups(String organization, String groupName);
}
