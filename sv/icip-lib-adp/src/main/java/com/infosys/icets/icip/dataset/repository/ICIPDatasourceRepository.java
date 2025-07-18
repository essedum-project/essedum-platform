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
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasoureNameAliasTypeDTO;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the ICIPDataset entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPDatasourceRepository extends JpaRepository<ICIPDatasource, Integer> {

	/**
	 * Search by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the list
	 */
	List<ICIPDatasource> searchByName(String name, String org);

	/**
	 * Find by organization and groups.
	 *
	 * @param org   the org
	 * @param group the group
	 * @return the list
	 */
	public List<ICIPDatasource> findByOrganizationAndGroups(String org, String group);

	/**
	 * Gets the all by organization and name.
	 *
	 * @param org  the org
	 * @param name the name
	 * @return the all by organization and name
	 */
	public List<ICIPDatasource> getAllByOrganizationAndName(String org, String name);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP datasource
	 */
	public ICIPDatasource findByNameAndOrganization(String name, String org);

	/**
	 * Find by type and organization.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the list
	 */
	public List<ICIPDatasource> findByTypeAndOrganization(String type, String org);

	/**
	 * Find by type and organization.
	 *
	 * @param type     the type
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the list
	 */
	public List<ICIPDatasource> findByTypeAndOrganization(String type, String org, Pageable pageable);

	/**
	 * Count by type and organization.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the long
	 */
	public Long countByTypeAndOrganization(String type, String org);

	/**
	 * Count by interfacetype and organization.
	 *
	 * @param type the interfacetype
	 * @param org  the org
	 * @return the long
	 */
	public Long countByInterfacetypeAndOrganization(String type, String interfacetype, String org);

	/**
	 * Find by organization 2.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	public List<ICIPDatasource> findByOrganization2(String organization);

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	public List<ICIPDatasource> findByOrganization(String organization);

	/**
	 * Gets the datasource by name search.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param type     the type
	 * @param pageable the pageable
	 * @return the datasource by name search
	 */
	public List<ICIPDatasource> getDatasourceByNameSearch(String name, String org, String type, Pageable pageable);

	/**
	 * Count by type and name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param type the type
	 * @return the long
	 */
	public Long countByTypeAndNameAndOrganization(String name, String org, String type);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);

	/**
	 * Gets the names by organization.
	 *
	 * @param org the org
	 * @return the names by organization
	 */

	public List<NameAndAliasDTO> getNameAndAliasByOrganization(String org);

	/**
	 * Find all by modified date and active date.
	 *
	 * @param inactivetime the inactivetime
	 * @return the list
	 */
	public List<ICIPDatasource> findAllByModifiedDateAndActiveDate(int inactivetime);

	/**
	 * Find all by modified date and active date and org.
	 *
	 * @param inactivetime the inactivetime
	 * @param org          the org
	 * @return the list
	 */
	public List<ICIPDatasource> findAllByModifiedDateAndActiveDateAndOrg(int inactivetime, String org);

	/**
	 * Count by name.
	 *
	 * @param name the name
	 * @return the long
	 */
	public Long countByName(String name);

	/**
	 * Gets the aliases by organization.
	 *
	 * @param org the org
	 * @return the aliases by organization
	 */
	public List<String> getNameByOrganization(String org);

	List<String> getAdapterTypes();

	List<ICIPDatasource> findByInterfacetypeAndOrganization(String interfacetype, String org);

	List<ICIPDatasource> findAllByType(String type);

	List<String> getDatasourcesTypeByOrganization(String organization);

	List<ICIPDatasource> findAllByTypeAndOrganization(String type, String org);

	public List<ICIPDatasource> findAllByAliasAndOrganization(String alias, String organization);

	List<ICIPDatasource> findAllByOrganization(String org);

	List<ICIPDatasource> findByTypeAndOrganizationAndInterfacetype(String type, String organization,
			String interfacetype, Pageable pageable);

	List<ICIPDatasource> findAllByOrganization(String org, String search, Pageable page);

	ICIPDatasource findByTypeAndAliasAndOrganization(String type, String alias, String organization);

	List<ICIPDatasource> checkAlias(String alias, String organization);

	List<ICIPDatasource> findByNameAndOrg(String name, String org);

	List<ICIPDatasoureNameAliasTypeDTO> getPromptsProviderByOrg(String org);

	@Query("SELECT d FROM ICIPDatasource d WHERE d.id = :id AND d.organization = :org")
	ICIPDatasource findByIdAndOrganization(Integer id, String org);

	List<ICIPDatasource> getForEndpointConnectionsByOrg(String org);

	Optional<ICIPDatasource> findByAlias(String alias);
	
	@Query("""
		    SELECT new com.infosys.icets.icip.dataset.model.ICIPDatasource(
		        ds.id, ds.name, ds.description, ds.type, ds.salt, ds.organization,
		        ds.dshashcode, ds.activetime, ds.category, ds.interfacetype,
		        ds.fordataset, ds.forruntime, ds.foradapter, ds.formodel,
		        ds.forpromptprovider, ds.forendpoint, ds.forapp,
		        ds.lastmodifiedby, ds.lastmodifieddate, ds.alias
		    )
		    FROM ICIPDatasource ds
		    WHERE ds.organization = :org
		      AND (:type IS NULL OR ds.type IN :type)
		      AND (
		        :nameOrAlias IS NULL OR
		        LOWER(ds.name) LIKE LOWER(CONCAT('%', :nameOrAlias, '%')) OR
		        LOWER(ds.alias) LIKE LOWER(CONCAT('%', :nameOrAlias, '%'))
		      ) ORDER BY ds.lastmodifieddate DESC
		""")
	Page<ICIPDatasource> findDataSourceByOptionalParameters(
			    @Param("org") String org,
			    @Param("type") List<String> type,
			    @Param("nameOrAlias") String nameOrAlias,
			    Pageable pageable
			);
		
		
	@Query("""
			SELECT COUNT(ds)
			FROM ICIPDatasource ds
			WHERE ds.organization = :org
			  AND (:type IS NULL OR ds.type IN :type)
			  AND (
			    :nameOrAlias IS NULL OR
			    LOWER(ds.name) LIKE LOWER(CONCAT('%', :nameOrAlias, '%')) OR
			    LOWER(ds.alias) LIKE LOWER(CONCAT('%', :nameOrAlias, '%'))
			  )
			""")
	Long countByOptionalParameters(
			    @Param("org") String org,
			    @Param("type") List<String> type,
			    @Param("nameOrAlias") String nameOrAlias
			);

			List<ICIPDatasource> getForModelsTypeAndOrganization(String org, String type);

}
