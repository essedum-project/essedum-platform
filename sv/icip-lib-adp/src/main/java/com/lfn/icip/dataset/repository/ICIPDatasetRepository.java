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

package com.lfn.icip.dataset.repository;
 
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;

// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the ICIPDataset entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPDatasetRepository extends Repository<ICIPDataset, Integer> {

	/**
	 * Search by name.
	 *
	 * @param name   the name
	 * @param org    the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPDataset> searchByName(String name, String org, Pageable pageable);

	/**
	 * Count length by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	Long countLengthByName(String name, String org);

	/**
	 * Count length by org.
	 *
	 * @param organization the organization
	 * @return the long
	 */
	Long countByOrganization(String organization);

	/**
	 * Find by organization by groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the list
	 */
	List<ICIPDataset> findByOrganizationByGroups(String organization, String groupName);

	/**
	 * Find by organization by groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPDataset> findByOrganizationByGroups(String organization, String groupName, Pageable pageable);

	/**
	 * Find by experiments flag.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPDataset> findByExp(String org);

	/**
	 * Find by organization by groups and search.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param search       the search
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPDataset> findByOrganizationByGroupsAndSearch(String organization, String groupName, String search, String interfacetype,
			Pageable pageable);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP dataset
	 */

	ICIPDataset findByNameAndOrganization(String name, String org);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPDataset> findByOrganization(String fromProjectId, Pageable pageable);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	List<ICIPDataset> findByOrganization(String fromProjectId);
	
	List<ICIPDataset> findByViewsAndOrganization(String viewType, String fromProjectId);

	/**
	 * Gets the dataset len by group and org.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the dataset len by group and org
	 */
	Long getDatasetLenByGroupAndOrg(String group, String org);

	/**
	 * Gets the dataset len by group and org and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the dataset len by group and org and search
	 */
	Long getDatasetLenByGroupAndOrgAndSearch(String group, String org, String search);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);

	/**
	 * Gets the read write dataset names by org.
	 *
	 * @param organization the organization
	 * @param rw the rw
	 * @return the read write dataset names by org
	 */
	List<NameAndAliasDTO> findByOrganizationAndType(String organization, String rw);

	/**
	 * Gets the dataset names by org.
	 *
	 * @param organization the organization
	 * @return the dataset names by org
	 */
	List<NameAndAliasDTO> getByOrganization(String organization);

	/**
	 * Gets the dataset names by datasource.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @return the dataset names by datasource
	 */
	List<NameAndAliasDTO> findByOrganizationAndDatasource(String org, String datasource);

	/**
	 * Count length by name.
	 *
	 * @param name the name
	 * @return the long
	 */
	Long countByName(String name);

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the optional
	 */
	Optional<ICIPDataset> findById(Integer id);

	/**
	 * Gets the one.
	 *
	 * @param id the id
	 * @return the one
	 */
	ICIPDataset getOne(Integer id);

	/**
	 * Delete.
	 *
	 * @param iCIPDataset the i CIP dataset
	 */
	void delete(ICIPDataset iCIPDataset);

	/**
	 * Save.
	 *
	 * @param ds the ds
	 * @return the ICIP dataset
	 */
	ICIPDataset save(ICIPDataset ds);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	List<NameAndAliasDTO> getNameAndAlias(String group, String org);

	/**
	 * Gets the views by name and org.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the views by name and org
	 */
	ICIPDataset getViewsByNameAndOrg(String name, String org);

	/**
	 * Find by dashboard.
	 *
	 * @param dashboard the dashboard
	 * @return the ICIP dataset
	 */
	ICIPDataset findByDashboard(Integer dashboard);
	
	/**
	 * Find by organization and is inbox required.
	 *
	 * @param isInboxRequired the is inbox required
	 * @param org the org
	 * @return the list
	 */
	List<NameAndAliasDTO> findByOrganizationAndIsInboxRequired(String isInboxRequired, String org);
	
	/**
	 * 
	 * @param schemaAlias
	 * @param projectName
	 * @return
	 */
	List<ICIPDataset> findBySchemaAndOrganization(ICIPSchemaRegistry schema, String projectName);
	
	List<ICIPDataset> findByDatasourceAndOrganization(ICIPDatasource datasource, String organization);
     
	List<ICIPDataset> findByInterfacetypeAndOrganization(String interfacetype, String organization);

	List<ICIPDataset> findByOrganizationByGroupsByInterfacetype(String organization, String groupName,
			String interfacetype, Pageable of);

	List<ICIPDataset> findByOrganization(String fromProjectId,String search, Pageable pageable);
	
	List<ICIPDataset> findByOrganizationWithTemplate(String fromProjectId,String search, Pageable pageable);

	Long getAllDatasetsCountByOrg(String project,String query);
	
	Long getAllDatasetsCountByOrgAndTemplate(String project,String query);
	
	Long getAllDatasetsCountByOrgAndDatasource(String project,String query,String datasource);
	
	List<ICIPDataset> getAllDatasetsByDatasource(String project,String datasource,Pageable paginate);
	
	List<ICIPDataset> getAllDatasetsByDatasourceAndSearch(String project,String datasource,String search,Pageable paginate);
	
	List<ICIPDataset> findByAliasAndOrganization(String alias, String org);

	List<ICIPDataset> getDatasetsByOrgandViews(String project, String views);
	
	ICIPDataset getDatasetByOrgAndAlias(String datasetName, String org);
	
	List<ICIPDataset> getDocByDatasourceType(List<String> datasourceType, String org, Pageable paginate);

	Long getCountByDatasourceType(List<String> datasourceType, String org);

	Long getDatasetsCountForAdvancedFilterTypes(String organization, String aliasOrName, List<String> types);

	Long getDatasetsCountForAdvancedFilterTypesAndKnowledgeBases(String organization, String aliasOrName,
			List<String> types, List<String> knowledgeBases);

	List<ICIPDataset> getDatasetsForAdvancedFilterTypes(String organization, String aliasOrName, List<String> types);

	List<ICIPDataset> getDatasetsForAdvancedFilterTypesAndKnowledgeBases(String organization, String aliasOrName,
			List<String> types, List<String> knowledgeBases);

	List<ICIPDataset> getDatasetsForAdvancedFilterTypesPageable(String organization, String aliasOrName,
			List<String> types, Pageable pageable);

	List<ICIPDataset> getDatasetsForAdvancedFilterTypesAndKnowledgeBasesPageable(String organization,
			String aliasOrName, List<String> types, List<String> knowledgeBases, Pageable pageable);

	List<String> getDatasetTypesForAdvancedFilter(String organization);
}
