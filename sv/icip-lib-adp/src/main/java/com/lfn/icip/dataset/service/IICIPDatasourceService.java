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

package com.lfn.icip.dataset.service;

import java.security.NoSuchAlgorithmException;
import java.util.List;

import org.slf4j.Marker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPPartialDatasource;
import com.lfn.icip.dataset.model.dto.ICIPDatasoureNameAliasTypeDTO;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDatasourceService.
 *
 * @author essedum
 */
public interface IICIPDatasourceService {

	/**
	 * Gets the datasource.
	 *
	 * @param name    the name
	 * @param project the project
	 * @return the datasource
	 */
	ICIPDatasource getDatasource(String name, String project);

	/**
	 * Gets the partial datasource.
	 *
	 * @param name the name
	 * @param project the project
	 * @return the partial datasource
	 */
	ICIPPartialDatasource getPartialDatasource(String name, String project);

	/**
	 * Gets the datasource by type.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @return the datasource by type
	 */
	List<ICIPDatasource> getDatasourceByType(String type, String organization);

	/**
	 * Gets the datasource count by type.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @param search       the search
	 * @return the datasource count by type
	 */
	Long getDatasourceCountByType(String type, String organization, String search);

	/**
	 * Gets the datasource count by type.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @param search       the search
	 * @return the datasource count by type
	 */
	Long getDatasourceCountByInterfacetype(String type,String interfacetype, String organization, String search);

	/**
	 * Search datasources.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPDatasource> searchDatasources(String name, String organization);

	/**
	 * Save.
	 *
	 * @param name                   the name
	 * @param iCIPDatasource         the i CIP datasource
	 * @param datasourcePluginServce the datasource plugin servce
	 * @return the ICIP datasource
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	ICIPDatasource save(String name, ICIPDatasource iCIPDatasource) throws NoSuchAlgorithmException;

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	void delete(String name, String org);

	/**
	 * Gets the datasource.
	 *
	 * @param id the id
	 * @return the datasource
	 */
	ICIPDatasource getDatasource(Integer id);

	/**
	 * Gets the datasources by org and name.
	 *
	 * @param org  the org
	 * @param name the name
	 * @return the datasources by org and name
	 */
	List<ICIPDatasource> getDatasourcesByOrgAndName(String org, String name);

	/**
	 * Gets the datasources by group and org.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the datasources by group and org
	 */
	List<ICIPDatasource> getDatasourcesByGroupAndOrg(String organization, String groupName);

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId);

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPDatasource> findByOrganization(String org);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Gets the paginated datasource by type and search.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @param search       the search
	 * @param page         the page
	 * @param size         the size
	 * @return the paginated datasource by type and search
	 */
	List<ICIPDatasource> getPaginatedDatasourceByTypeAndSearch(String type, String organization,String interfacetype, String search,
			int page, int size);

	/**
	 * Gets the datasource by name search.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param type the type
	 * @param page the page
	 * @param size the size
	 * @return the datasource by name search
	 */
	List<ICIPDatasource> getDatasourceByNameSearch(String name, String org, String type, int page, int size);

	/**
	 * Gets the datasource count by name and type.
	 *
	 * @param name the name
	 * @param type the type
	 * @param org  the org
	 * @return the datasource count by name and type
	 */
	Long getDatasourceCountByNameAndType(String name, String type, String org);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	void delete(String project);

	/**
	 * Find name and alias by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<NameAndAliasDTO> findNameAndAliasByOrganization(String org);

	/**
	 * Find name by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<String> findNameByOrganization(String org);

	/**
	 * Copy datasource.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param name          the name
	 * @return true, if successful
	 */
	boolean copySelected(Marker marker, String fromProjectId, String toProjectId, String name);

	/**
	 * Creates the name.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the string
	 */
	String createName(String org, String alias);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	List<NameAndAliasDTO> getNameAndAlias(String group, String org);

	List<ICIPDataset> getDatasetsByDatasource(ICIPDatasource datasource, String organization);

	List<String> getAdapterTypes();

	List<ICIPDatasource> getAdaptersByOrg(String org);

	List<ICIPDatasource> findAllByTypeAndOrganization(String type, String project);

	ICIPDatasource getDatasourceByNameAndOrganization(String name, String org);


	ICIPDatasource savedatasource(ICIPDatasource datasource);
	
	List<String> getDatasourcesTypeByOrganization(String org);

	ICIPDatasource getDatasourceByTypeAndAlias(String type, String alias, String organization);

	Boolean checkAlias(String alias,String org);
	
	List<ICIPDatasource> findByNameAndOrg(String organization,String org);

	List<ICIPDatasoureNameAliasTypeDTO> getPromptsProviderByOrg(String org);

	List<ICIPDatasource> getForEndpointConnectionsByOrg(String org);

	ICIPDatasource findAllByAliasAndOrganization(String alias, String organization);
	
	Page<ICIPDatasource> getDataSourceByOptionalParameters(String org, String type, String nameOrAlias, Pageable pageabl);
	
	Long getDataSourceCountByOptionalParameters(String org, String type, String nameOrAlias);

	List<ICIPDatasource> getForModelsTypeAndOrganization(String type, String organization);

}
