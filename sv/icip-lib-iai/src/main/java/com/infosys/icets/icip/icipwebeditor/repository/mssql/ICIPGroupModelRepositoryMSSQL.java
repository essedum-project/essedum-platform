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
package com.infosys.icets.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPGroupModelRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPGroupModelRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPGroupModelRepositoryMSSQL extends ICIPGroupModelRepository {

	/**
	 * Gets the entity by organization and entity type and entity.
	 *
	 * @param org the org
	 * @param entityType the entity type
	 * @param entity the entity
	 * @return the entity by organization and entity type and entity
	 */
	@Query(value = "select * from mlgroupmodel where organization= :org and entity_type= :entityType and entity=:entity", nativeQuery = true)
	List<ICIPGroupModel> getEntityByOrganizationAndEntityTypeAndEntity(@Param("org") String org,
			@Param("entityType") String entityType, @Param("entity") String entity);

	/**
	 * Gets the entity by organization and entity type.
	 *
	 * @param org the org
	 * @param entityType the entity type
	 * @return the entity by organization and entity type
	 */
	@Query(value = "select * from mlgroupmodel "
			+ "where organization = :org and entity_type= :entityType", nativeQuery = true)
	List<ICIPGroupModel> getEntityByOrganizationAndEntityType(@Param("org") String org,
			@Param("entityType") String entityType);

	/**
	 * Find all by organization and entity datasets.
	 *
	 * @param organization the organization
	 * @param entity the entity
	 * @param entityType the entity type
	 * @return the list
	 */
	@Query(value = "SELECT * from mlgroupmodel WHERE organization = :org "
			+ "AND entity LIKE CONCAT('%',:entity,'%') AND entity_type=:entityType", nativeQuery = true)
	List<ICIPGroupModel> findAllByOrganizationAndEntityDatasets(@Param("org") String organization,
			@Param("entity") String entity, @Param("entityType") String entityType);

	/**
	 * Delete by project.
	 *
	 * @param org the org
	 */
	@Modifying
	@Query(value = "delete from mlgroupmodel where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String org);
}
