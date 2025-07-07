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
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialGroups;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPartialGroupsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPartialGroupsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPPartialGroupsRepositoryMSSQL extends ICIPPartialGroupsRepository {

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT lastmodifiedby,lastmodifieddate,alias,id,name,description,organization FROM mlgroups WHERE organization =:org"
			+ " ORDER BY name ASC", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganization(@Param("org") String organization, Pageable pageable);

	/**
	 * Find by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT DISTINCT(mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias, mlgroups.id, mlgroups.description, mlgroups.organization FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlpipeline ON mlgroupmodel.entity = mlpipeline.name " + "WHERE mlgroups.organization = :org "
			+ "AND mlpipeline.name LIKE CONCAT('%',:entity,'%') ORDER BY mlgroups.name ASC", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganizationAndEntityPipelines(@Param("org") String organization,
			@Param("entity") String entity, Pageable pageable);

	/**
	 * Find by organization and entity datasources.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT DISTINCT(mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias,mlgroups.id, mlgroups.description,"
			+ " mlgroups.organization FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mldatasource ON mlgroupmodel.entity = mldatasource.name "
			+ "WHERE mlgroups.organization = :org " + "AND mldatasource.name LIKE CONCAT('%',:entity,'%')"
			+ " ORDER BY mlgroups.name ASC", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganizationAndEntityDatasources(@Param("org") String organization,
			@Param("entity") String entity, Pageable pageable);

	/**
	 * Find by organization and entity datasets.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT DISTINCT(mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias,mlgroups.id, mlgroups.description,"
			+ " mlgroups.organization FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mldataset ON mlgroupmodel.entity = mldataset.name " + "WHERE mlgroups.organization = :org "
			+ "AND mldataset.name LIKE CONCAT('%',:entity,'%') ORDER BY mlgroups.name ASC", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganizationAndEntityDatasets(@Param("org") String organization,
			@Param("entity") String entity, Pageable pageable);

	/**
	 * Find by organization and entity schemas.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT DISTINCT(mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias,mlgroups.id,"
			+ " mlgroups.description, mlgroups.organization FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlschemaregistry ON mlgroupmodel.entity = mlschemaregistry.name "
			+ "WHERE mlgroups.organization = :org " + "AND mlschemaregistry.name LIKE CONCAT('%',:entity,'%')"
			+ " ORDER BY mlgroups.name ASC", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganizationAndEntitySchemas(@Param("org") String organization,
			@Param("entity") String entity, Pageable pageable);

	/**
	 * Count by organization and entity datasources.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(DISTINCT(mlgroups.name)) FROM mlgroups INNER JOIN mlgroupmodel "
			+ "ON mlgroups.name = mlgroupmodel.model_group INNER JOIN mldatasource "
			+ "ON mlgroupmodel.entity = mldatasource.name WHERE mlgroups.organization = :org "
			+ "AND mldatasource.name LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
	Long countByOrganizationAndEntityDatasources(@Param("org") String organization, @Param("entity") String entity);

	/**
	 * Count by organization and entity datasets.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(DISTINCT(mlgroups.name)) FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mldataset ON mlgroupmodel.entity = mldataset.name WHERE mlgroups.organization = :org "
			+ "AND mldataset.name LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
	Long countByOrganizationAndEntityDatasets(@Param("org") String organization, @Param("entity") String entity);

	/**
	 * Count by organization and entity schemas.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(DISTINCT(mlgroups.name)) FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlschemaregistry ON mlgroupmodel.entity = mlschemaregistry.name "
			+ "WHERE mlgroups.organization = :org "
			+ "AND mlschemaregistry.name LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
	Long countByOrganizationAndEntitySchemas(@Param("org") String organization, @Param("entity") String entity);

	/**
	 * Count by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(DISTINCT(mlgroups.name)) FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlpipeline ON mlgroupmodel.entity = mlpipeline.name WHERE mlgroups.organization = :org "
			+ "AND mlpipeline.name LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
	Long countByOrganizationAndEntityPipelines(@Param("org") String organization, @Param("entity") String entity);

	/**
	 * Find one by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the ICIP partial groups
	 */
	@Query(value = "SELECT DISTINCT TOP 1 (mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias,mlgroups.id, mlgroups.description, mlgroups.organization FROM mlgroups INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group INNER JOIN mlpipeline ON mlgroupmodel.entity = mlpipeline.name WHERE mlgroups.organization = :org AND mlpipeline.name = :entity", nativeQuery = true)
	ICIPPartialGroups findOneByOrganizationAndEntityPipelines(@Param("org") String organization,
			@Param("entity") String entity);

	/**
	 * Find featured by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	@Query(value = "SELECT lastmodifiedby,lastmodifieddate,alias,id,name,description,organization"
			+ " FROM mlgroups WHERE organization =:org AND featured=1", nativeQuery = true)
	List<ICIPPartialGroups> findFeaturedByOrganization(@Param("org") String organization);

	/**
	 * Count by organization and entity agents.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(DISTINCT(mlgroups.name)) FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlagents ON mlgroupmodel.entity = mlagents.name WHERE mlgroups.organization = :org "
			+ "AND mlagents.name LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
	Long countByOrganizationAndEntityAgents(@Param("org") String organization, @Param("entity") String entity);

	/**
	 * Find by organization and entity agents.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT DISTINCT(mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias,mlgroups.id,"
			+ " mlgroups.description, mlgroups.organization FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlagents ON mlgroupmodel.entity = mlagents.name " + "WHERE mlgroups.organization = :org "
			+ "AND mlagents.name LIKE CONCAT('%',:entity,'%') ORDER BY mlgroups.name ASC", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganizationAndEntityAgents(@Param("org") String organization,
			@Param("entity") String entity, Pageable pageable);
}
