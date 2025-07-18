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
package com.infosys.icets.icip.dataset.repository.mssql;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasoureNameAliasTypeDTO;
import com.infosys.icets.icip.dataset.repository.ICIPDatasourceRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPDatasourceRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPDatasourceRepositoryMSSQL extends ICIPDatasourceRepository {

	/**
	 * Search by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the list
	 */
	@Query(value = "select TOP 5 * from mldatasource where organization in (:org ,'core') AND alias LIKE CONCAT('%',:name,'%')", nativeQuery = true)
	List<ICIPDatasource> searchByName(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by organization and groups.
	 *
	 * @param org   the org
	 * @param group the group
	 * @return the list
	 */
	@Query(value = "select mldatasource.id,mldatasource.name,mldatasource.description,mldatasource.lastmodifieddate,mldatasource.lastmodifiedby,"
			+ "mldatasource.alias,mldatasource.type,mldatasource.connectionDetails,mldatasource.organization"
			+ " from mldatasource JOIN  mlgroupmodel " + "ON mldatasource.name = mlgroupmodel.entity "
			+ "AND mldatasource.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'datasource' " + "where mlgroupmodel.organization in (:org ,'core') "
			+ "AND mlgroupmodel.model_group = :group", nativeQuery = true)
	public List<ICIPDatasource> findByOrganizationAndGroups(@Param("org") String org, @Param("group") String group);

	/**
	 * Gets the all by organization and name.
	 *
	 * @param org  the org
	 * @param name the name
	 * @return the all by organization and name
	 */
	@Query(value = "select * from mldatasource "
			+ "where mldatasource.organization in (:org ,'core') and mldatasource.alias LIKE "
			+ "CONCAT('%',:name,'%')", nativeQuery = true)
	public List<ICIPDatasource> getAllByOrganizationAndName(@Param("org") String org, @Param("name") String name);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP datasource
	 */
	@Query(value = "select * from mldatasource where name = :name AND organization in (:org ,'core') ", nativeQuery = true)
	public ICIPDatasource findByNameAndOrganization(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by type and organization.
	 *
	 * @param type     the type
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "select * from mldatasource where organization in (:org ,'core') "
			+ "And type=:type order by name ASC", nativeQuery = true)
	public List<ICIPDatasource> findByTypeAndOrganization(@Param("type") String type, @Param("org") String org,
			Pageable pageable);

	/**
	 * Find by type and organization.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the list
	 */
	@Query(value = "select * from mldatasource where organization in (:org ,'core') "
			+ "And type=:type order by name", nativeQuery = true)
	public List<ICIPDatasource> findByTypeAndOrganization(@Param("type") String type, @Param("org") String org);

	/**
	 * Count by type and organization.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the long
	 */
	@Query(value = "select count(*) from mldatasource where organization in (:org ,'core') And type=:type", nativeQuery = true)
	public Long countByTypeAndOrganization(@Param("type") String type, @Param("org") String org);

	/**
	 * Count by type and organization.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the long
	 */
	@Query(value = "select count(*) from mldatasource where organization in (:org ,'core')And type=:type And interfacetype=:interfacetype", nativeQuery = true)
	public Long countByInterfacetypeAndOrganization(@Param("type") String type,
			@Param("interfacetype") String interfacetype, @Param("org") String org);

	/**
	 * Find by organization 2.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	@Query(value = "select mldatasource.id," + "mldatasource.name," + "mldatasource.description," + "mldatasource.type,"
			+ "mldatasource.organization " + "mldatasource.interfacetype " + "from mldatasource "
			+ "where organization in (:org ,'core') ", nativeQuery = true)
	public List<ICIPDatasource> findByOrganization2(@Param("org") String organization);

	/**
	 * Gets the datasource by name search.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param type     the type
	 * @param pageable the pageable
	 * @return the datasource by name search
	 */
	@Query(value = "select * from mldatasource "
			+ "where mldatasource.organization in (:org ,'core') and mldatasource.type =:type and "
			+ "mldatasource.alias LIKE CONCAT('%',:name,'%')", nativeQuery = true)
	public List<ICIPDatasource> getDatasourceByNameSearch(@Param("name") String name, @Param("org") String org,
			@Param("type") String type, Pageable pageable);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mldatasource where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);

	/**
	 * Gets the names by organization.
	 *
	 * @param org the org
	 * @return the names by organization
	 */
	@Query(value = "select name,alias from mldatasource where organization in (:org ,'core') ", nativeQuery = true)
	public List<NameAndAliasDTO> getNamesAndAliasByOrganization(@Param("org") String org);

	/**
	 * Gets the names by organization.
	 *
	 * @param org the org
	 * @return the aliases by organization
	 */
	@Query(value = "select name from mldatasource where organization in (:org ,'core') ", nativeQuery = true)
	public List<String> getNameByOrganization(@Param("org") String org);

	/**
	 * Find all by modified date and active date.
	 *
	 * @param inactivetime the inactivetime
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mldatasource WHERE DATEDIFF(MINUTE, activetime, GETDATE()) <= :inactivetime "
			+ "OR DATEDIFF(MINUTE, lastmodifieddate, GETDATE()) <= :inactivetime OR activetime IS NULL OR lastmodifieddate IS NULL", nativeQuery = true)
	public List<ICIPDatasource> findAllByModifiedDateAndActiveDate(@Param("inactivetime") int inactivetime);

	/**
	 * Find all by modified date and active date and org.
	 *
	 * @param inactivetime the inactivetime
	 * @param org          the org
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mldatasource WHERE organization=:org AND (DATEDIFF(MINUTE, activetime, GETDATE()) <= :inactivetime "
			+ "OR DATEDIFF(MINUTE, lastmodifieddate, GETDATE()) <= :inactivetime OR activetime IS NULL OR lastmodifieddate IS NULL)", nativeQuery = true)
	public List<ICIPDatasource> findAllByModifiedDateAndActiveDateAndOrg(@Param("inactivetime") int inactivetime,
			@Param("org") String org);

	@Query(value = "SELECT DISTINCT TYPE FROM mldatasource WHERE interfacetype = 'adapter'", nativeQuery = true)
	public List<String> getAdapterTypes();

	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org and alias like concat('%',:search,'%')", nativeQuery = true)
	List<ICIPDatasource> findAllByOrganization(@Param("org") String org, @Param("search") String search, Pageable page);

	@Query(value = "SELECT DISTINCT p1.type FROM mldatasource p1 WHERE p1.organization = :organization", nativeQuery = true)
	List<String> getDatasourcesTypeByOrganization(@Param("organization") String organization);

	@Query(value = "SELECT * FROM mldatasource WHERE ORGANIZATION= :organization AND alias = :alias", nativeQuery = true)
	List<ICIPDatasource> checkAlias(@Param("alias") String alias, @Param("organization") String organization);

	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org AND name = :name", nativeQuery = true)
	List<ICIPDatasource> findByNameAndOrg(@Param("name") String name, @Param("org") String org);

	@Query(value = "SELECT name, alias, type FROM mldatasource WHERE organization= :org AND forpromptprovider = 1", nativeQuery = true)
	List<ICIPDatasoureNameAliasTypeDTO> getPromptsProviderByOrg(@Param("org") String org);

	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org AND forendpoint = 1", nativeQuery = true)
	List<ICIPDatasource> getForEndpointConnectionsByOrg(@Param("org") String org);

	@Query(value = "SELECT ds FROM ICIPDatasource ds WHERE ds.alias = :alias")
	Optional<ICIPDatasource> findByAlias(@Param("alias") String alias);
	
	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org AND type=:type AND formodel is true", nativeQuery = true)
	List<ICIPDatasource> getForModelsTypeAndOrganization(@Param("type") String type,@Param("org") String org);
	
}
