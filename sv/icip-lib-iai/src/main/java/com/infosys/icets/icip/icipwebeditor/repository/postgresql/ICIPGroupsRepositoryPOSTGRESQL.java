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
package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPGroups;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPGroupsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPGroupsRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPGroupsRepositoryPOSTGRESQL extends ICIPGroupsRepository {

	/**
	 * Find by organization and groups model entity and groups model entity type.
	 *
	 * @param org        the org
	 * @param entity     the entity
	 * @param entityType the entity type
	 * @return the list
	 */
	@Query(value = "select * from mlgroups AS mlg " + "INNER JOIN mlgroupmodel AS mlgm "
			+ "ON mlg.name = mlgm.model_group " + "where mlg.organization = :organization "
			+ "and mlgm.entity = :entity and mlgm.entity_type= :entityType", nativeQuery = true)
	List<ICIPGroups> findByOrganizationAndGroupsModel_EntityAndGroupsModel_EntityType(@Param("organization") String org,
			@Param("entity") String entity, @Param("entityType") String entityType);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mlgroups where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);
	
	@Query(value = "select * from mlgroups where organization = :org AND type= :type", nativeQuery = true)
	List<ICIPGroups> findByOganizationAndType(@Param("org") String organization,@Param("type") String type);


}
