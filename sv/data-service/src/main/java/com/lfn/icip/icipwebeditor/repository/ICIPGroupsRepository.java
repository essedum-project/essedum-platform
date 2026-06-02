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

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Example;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPGroupsRepository extends Repository<ICIPGroups, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPGroups> findByOrganization(String org);

	/**
	 * Find by organization and groups model entity and groups model entity type.
	 *
	 * @param org        the org
	 * @param entity     the entity
	 * @param entityType the entity type
	 * @return the list
	 */
	List<ICIPGroups> findByOrganizationAndGroupsModel_EntityAndGroupsModel_EntityType(String org, String entity,
			String entityType);

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
	 * Find name by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	List<NameAndAliasDTO> findNameByOrganization(String organization);

	/**
	 * Find one.
	 *
	 * @param example the example
	 * @return the optional
	 */
	Optional<ICIPGroups> findOne(Example<ICIPGroups> example);

	/**
	 * Delete.
	 *
	 * @param icipGroups the icip groups
	 */
	void delete(ICIPGroups icipGroups);

	/**
	 * Save.
	 *
	 * @param ds the ds
	 * @return the ICIP groups
	 */
	ICIPGroups save(ICIPGroups ds);
	
	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param organization the organization
	 * @return the ICIP groups
	 */
	ICIPGroups findByNameAndOrganization(String name, String organization);
	
	List<ICIPGroups> findByOganizationAndType(String organization,String type);

}
