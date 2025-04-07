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
package com.infosys.icets.icip.dataset.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.dataset.model.ICIPPartialDatasource;
import com.infosys.icets.icip.dataset.repository.ICIPPartialDatasourceRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPartialDatasourceRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPPartialDatasourceRepositoryMYSQL extends ICIPPartialDatasourceRepository {

	/**
	 * Find by organization and groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the list
	 */
	@Query(value = "select mldatasource.id,mldatasource.name,mldatasource.description,mldatasource.salt,"
			+ "mldatasource.type,mldatasource.connectionDetails,mldatasource.organization, mldatasource.category"
			+ " from mldatasource JOIN  mlgroupmodel " + "ON mldatasource.name = mlgroupmodel.entity "
			+ "AND mldatasource.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'datasource' " + "where mlgroupmodel.organization in (:org ,'core') "
			+ "AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<ICIPPartialDatasource> findByOrganizationAndGroups(@Param("org") String organization,
			@Param("group") String groupName);

}