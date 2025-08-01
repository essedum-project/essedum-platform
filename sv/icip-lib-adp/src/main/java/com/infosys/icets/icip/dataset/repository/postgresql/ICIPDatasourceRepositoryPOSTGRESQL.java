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

package com.infosys.icets.icip.dataset.repository.postgresql;

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
 * The Interface ICIPDatasourceRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPDatasourceRepositoryPOSTGRESQL extends ICIPDatasourceRepository {

	/**
	 * Search by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the list
	 */
	@Query(value = "select * from mldatasource where organization in (:org ,'core') "
			+ "AND alias LIKE CONCAT('%',:name,'%') LIMIT 5", nativeQuery = true)
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
			+ "And type=:type order by name", nativeQuery = true)
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
			+ "mldatasource.interfacetype" + "mldatasource.organization " + "from mldatasource "
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
	@Query(value = "SELECT * FROM mldatasource WHERE TIMESTAMPDIFF(MINUTE, activetime, NOW()) <= :inactivetime "
			+ "OR TIMESTAMPDIFF(MINUTE, lastmodifieddate, NOW()) <= :inactivetime OR activetime IS NULL "
			+ "OR lastmodifieddate IS NULL", nativeQuery = true)
	public List<ICIPDatasource> findAllByModifiedDateAndActiveDate(@Param("inactivetime") int inactivetime);

	/**
	 * Find all by modified date and active date and org.
	 *
	 * @param inactivetime the inactivetime
	 * @param org          the org
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mldatasource WHERE organization=:org AND (TIMESTAMPDIFF(MINUTE, activetime, NOW()) <= :inactivetime "
			+ "OR TIMESTAMPDIFF(MINUTE, lastmodifieddate, NOW()) <= :inactivetime OR activetime IS NULL OR lastmodifieddate IS NULL)", nativeQuery = true)
	public List<ICIPDatasource> findAllByModifiedDateAndActiveDateAndOrg(@Param("inactivetime") int inactivetime,
			@Param("org") String org);

	@Query(value = "SELECT DISTINCT TYPE FROM mldatasource WHERE interfacetype = 'adapter'", nativeQuery = true)
	public List<String> getAdapterTypes();

	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org and alias ilike concat('%',:search,'%')", nativeQuery = true)
	List<ICIPDatasource> findAllByOrganization(@Param("org") String org, @Param("search") String search, Pageable page);

	@Query(value = "SELECT DISTINCT p1.type FROM mldatasource p1 WHERE p1.organization = :organization", nativeQuery = true)
	List<String> getDatasourcesTypeByOrganization(@Param("organization") String organization);

	@Query(value = "SELECT * FROM mldatasource WHERE ORGANIZATION= :organization AND alias = :alias", nativeQuery = true)
	List<ICIPDatasource> checkAlias(@Param("alias") String alias, @Param("organization") String organization);

	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org AND name = :name", nativeQuery = true)
	List<ICIPDatasource> findByNameAndOrg(@Param("name") String name, @Param("org") String org);

	@Query(value = "SELECT name, alias, type FROM mldatasource WHERE organization= :org AND forpromptprovider is true", nativeQuery = true)
	List<ICIPDatasoureNameAliasTypeDTO> getPromptsProviderByOrg(@Param("org") String org);

	ICIPDatasource findByIdAndOrganization(Integer id, String org);

	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org AND forendpoint is true", nativeQuery = true)
	List<ICIPDatasource> getForEndpointConnectionsByOrg(@Param("org") String org);

	@Query(value = "SELECT ds FROM ICIPDatasource ds WHERE ds.alias = :alias")
	Optional<ICIPDatasource> findByAlias(@Param("alias") String alias);
	
	@Query(value = "SELECT * FROM mldatasource WHERE organization= :org AND type=:type AND formodel is true", nativeQuery = true)
	List<ICIPDatasource> getForModelsTypeAndOrganization(@Param("type") String type,@Param("org") String org);
	
}
