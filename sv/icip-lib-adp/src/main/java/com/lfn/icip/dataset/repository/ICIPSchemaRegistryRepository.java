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
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.model.dto.ICIPSchemaRegistryDTO2;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPSchemaRegistryRepository extends JpaRepository<ICIPSchemaRegistry, Integer> {

	/**
	 * Search by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the list
	 */
	List<ICIPSchemaRegistry> searchByName(String name, String org);

	/**
	 * Fetch schema by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIPSchemaRegistry object
	 */
	public ICIPSchemaRegistry getByNameAndOrganization(String name, String org);
	
	public ICIPSchemaRegistry getByAliasAndOrganization(String alias, String org);

	/**
	 * Gets the schemas by org.
	 *
	 * @param org the org
	 * @return the schemas by org
	 */
	public List<NameAndAliasDTO> getSchemasByOrg(String org);

	/**
	 * Find by organization and groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group alias
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPSchemaRegistryDTO2> findByOrganizationAndGroups(String organization, String groupName, Pageable pageable);

	/**
	 * Find by organization and groups and search.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param search       the search
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPSchemaRegistryDTO2> findByOrganizationAndGroupsAndSearch(String organization, String groupName,
			String search, Pageable pageable);

	/**
	 * Find all by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPSchemaRegistry> findAllByOrganization(String organization);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP schema registry
	 */
	public ICIPSchemaRegistry findByNameAndOrganization(String name, String org);

	/**
	 * Find by name and organization.
	 *
	 * @param alias the alias
	 * @param org   the org
	 * @return the ICIP schema registry
	 */
	public ICIPSchemaRegistry findByAliasAndOrganization(String alias, String org);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	public List<ICIPSchemaRegistry> findByOrganization(String fromProjectId);

	/**
	 * Count by group and organization.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the long
	 */
	Long countByGroupAndOrganization(String group, String org);

	/**
	 * Count by group and organization and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the long
	 */
	Long countByGroupAndOrganizationAndSearch(String group, String org, String search);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);

	/**
	 * Count by name.
	 *
	 * @param name the name
	 * @return the long
	 */
	Long countByName(String name);

	/**
	 * Gets the name by alias and organization.
	 *
	 * @param alias the alias
	 * @param org the org
	 * @return the name by alias and organization
	 */
	String getNameByAliasAndOrganization(String alias, String org);

	/**
	 * Gets the name and alias.
	 *
	 * @param groupName the group name
	 * @param org the org
	 * @return the name and alias
	 */
	List<NameAndAliasDTO> getNameAndAlias(String groupName, String org);

	/**
	 * Gets the by name.
	 *
	 * @param schemaName the schema name
	 * @return the by name
	 */
	ICIPSchemaRegistry getByName(String schemaName);
	
	ICIPSchemaRegistry save(ICIPSchemaRegistry icipSchemaRegistry);

	List<ICIPSchemaRegistry> findAllByOrganizationAndQuery(String query, String organization);

}
