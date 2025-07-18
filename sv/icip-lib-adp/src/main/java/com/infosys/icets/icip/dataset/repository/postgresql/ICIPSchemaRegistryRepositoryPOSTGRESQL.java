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
package com.infosys.icets.icip.dataset.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.model.dto.ICIPSchemaRegistryDTO2;
import com.infosys.icets.icip.dataset.repository.ICIPSchemaRegistryRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPSchemaRegistryRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPSchemaRegistryRepositoryPOSTGRESQL extends ICIPSchemaRegistryRepository {

	/**
	 * Search by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the list
	 */
	@Query(value = "select * from mlschemaregistry where organization = :org "
			+ "AND alias LIKE CONCAT('%',:name,'%') LIMIT 5", nativeQuery = true)
	List<ICIPSchemaRegistry> searchByName(@Param("name") String name, @Param("org") String org);

	/**
	 * Gets the schemas by org.
	 *
	 * @param org the org
	 * @return the schemas by org
	 */
	@Query(value = "SELECT name,alias FROM mlschemaregistry where organization = :org", nativeQuery = true)
	public List<NameAndAliasDTO> getSchemasByOrg(@Param("org") String org);

	/**
	 * Find by organization and groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT  mlschemaregistry.name as name,mlschemaregistry.alias as alias, "
			+ "CAST(mlschemaregistry.description as CHAR(255)) as description,mlschemaregistry.organization as organization"
			+ " FROM mlschemaregistry JOIN  mlgroupmodel " + " ON mlschemaregistry.name = mlgroupmodel.entity "
			+ " AND mlgroupmodel.organization = mlschemaregistry.organization "
			+ " AND mlgroupmodel.entity_type = 'schema' " + " where mlschemaregistry.organization = :org "
			+ " AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<ICIPSchemaRegistryDTO2> findByOrganizationAndGroups(@Param("org") String organization,
			@Param("group") String groupName, Pageable pageable);

	/**
	 * Find by organization and groups.
	 *
	 * @param group the group
	 * @param organization the organization
	 * @return the list
	 */
	@Query(value = "SELECT  mlschemaregistry.name as name,mlschemaregistry.alias as alias "
			+ " FROM mlschemaregistry JOIN  mlgroupmodel ON mlschemaregistry.name = mlgroupmodel.entity "
			+ " AND mlgroupmodel.organization = mlschemaregistry.organization "
			+ " AND mlgroupmodel.entity_type = 'schema' where mlschemaregistry.organization = :org "
			+ " AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<NameAndAliasDTO> getNameAndAlias(@Param("group") String group, @Param("org") String organization);

	/**
	 * Find by organization and groups and search.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param search       the search
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT mlschemaregistry.name as name,mlschemaregistry.alias as alias,"
			+ "CAST(mlschemaregistry.description as CHAR(255)) as description,mlschemaregistry.organization as organization"
			+ " FROM mlschemaregistry JOIN  mlgroupmodel ON mlschemaregistry.name = mlgroupmodel.entity "
			+ " AND mlgroupmodel.organization = mlschemaregistry.organization "
			+ " AND mlgroupmodel.entity_type = 'schema' where mlschemaregistry.organization = :org "
			+ " AND mlgroupmodel.model_group = :group AND mlschemaregistry.alias LIKE CONCAT('%',:search,'%')", nativeQuery = true)
	List<ICIPSchemaRegistryDTO2> findByOrganizationAndGroupsAndSearch(@Param("org") String organization,
			@Param("group") String groupName, @Param("search") String search, Pageable pageable);

	/**
	 * Find all by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	@Query(value = "SELECT  mlschemaregistry.id," + "mlschemaregistry.name,mlschemaregistry.description,"
			+ "mlschemaregistry.schemavalue,mlschemaregistry.lastmodifieddate,mlschemaregistry.lastmodifiedby,mlschemaregistry.alias,"
			+ "mlschemaregistry.organization " + "from mlschemaregistry "
			+ "where mlschemaregistry.organization = :org", nativeQuery = true)
	List<ICIPSchemaRegistry> findAllByOrganization(@Param("org") String organization);
	/**
	 * Find all by organization and  filter.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	@Query(value = "SELECT  mlschemaregistry.id," + "mlschemaregistry.name,mlschemaregistry.description,"
			+ "mlschemaregistry.schemavalue,mlschemaregistry.lastmodifieddate,mlschemaregistry.lastmodifiedby,mlschemaregistry.alias,"
			+ "mlschemaregistry.organization " + "from mlschemaregistry "
			+ "where (:query1 IS NULL OR mlschemaregistry.alias ILIKE CONCAT('%', :query1, '%') OR mlschemaregistry.name ILIKE CONCAT('%', :query1, '%')) AND mlschemaregistry.organization = :org", nativeQuery = true)
	List<ICIPSchemaRegistry> findAllByOrganizationAndQuery(@Param("query1") String query,@Param("org") String organization);

	/**
	 * Count by group and organization.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(ss.id) FROM mlschemaregistry ss WHERE ss.organization = :org AND ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ "    WHERE grp.model_group = :group AND grp.entity_type = 'schema' AND grp.organization = :org)", nativeQuery = true)
	Long countByGroupAndOrganization(@Param("group") String group, @Param("org") String org);

	/**
	 * Count by group and organization and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(ss.id) FROM mlschemaregistry ss WHERE ss.organization = :org AND ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ "    WHERE grp.model_group = :group AND grp.entity_type = 'schema' AND grp.organization = :org) AND ss.alias LIKE CONCAT('%',:search,'%')", nativeQuery = true)
	Long countByGroupAndOrganizationAndSearch(@Param("group") String group, @Param("org") String org,
			@Param("search") String search);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mlschemaregistry where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);

	/**
	 * Fetch name by alias and organization.
	 *
	 * @param alias the alias
	 * @param org  the org
	 * @return the ICIPSchemaRegistry object
	 */
	@Query(value = "SELECT name FROM mlschemaregistry where alias = :alias "
			+ "AND organization = :org", nativeQuery = true)
	public String getNameByAliasAndOrganization(@Param("alias") String alias, @Param("org") String org);
}
