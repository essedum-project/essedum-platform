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

package com.lfn.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPPartialGroups;
import com.lfn.icip.icipwebeditor.repository.ICIPPartialGroupsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPartialGroupsRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPPartialGroupsRepositoryPOSTGRESQL extends ICIPPartialGroupsRepository {

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT lastmodifiedby,lastmodifieddate,alias,id,name,description,organization"
			+ " FROM mlgroups WHERE organization =:org", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganization(@Param("org") String organization, Pageable pageable);

	/**
	 * Find by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT DISTINCT(mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias,mlgroups.id, mlgroups.description, mlgroups.organization FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlpipeline ON mlgroupmodel.entity = mlpipeline.name " + "WHERE mlgroups.organization = :org "
			+ "AND mlpipeline.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
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
			+ "WHERE mlgroups.organization = :org "
			+ "AND mldatasource.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
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
			+ "AND mldataset.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
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
			+ "WHERE mlgroups.organization = :org "
			+ "AND mlschemaregistry.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
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
			+ "AND mldatasource.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
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
			+ "AND mldataset.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
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
			+ "AND mlschemaregistry.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
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
			+ "AND mlpipeline.alias LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
	Long countByOrganizationAndEntityPipelines(@Param("org") String organization, @Param("entity") String entity);

	/**
	 * Find one by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the ICIP partial groups
	 */
	@Query(value = "SELECT DISTINCT(mlgroups.name), mlgroups.lastmodifiedby,mlgroups.lastmodifieddate,mlgroups.alias,mlgroups.id, mlgroups.description, mlgroups.organization FROM mlgroups "
			+ "INNER JOIN mlgroupmodel ON mlgroups.name = mlgroupmodel.model_group "
			+ "INNER JOIN mlpipeline ON mlgroupmodel.entity = mlpipeline.name "
			+ "WHERE mlgroups.organization = :org AND mlpipeline.name = :entity LIMIT 1", nativeQuery = true)
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
			+ "AND mlagents.name LIKE CONCAT('%',:entity,'%')", nativeQuery = true)
	List<ICIPPartialGroups> findByOrganizationAndEntityAgents(@Param("org") String organization,
			@Param("entity") String entity, Pageable pageable);
}
