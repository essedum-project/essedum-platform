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

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPGroupModelRepository extends JpaRepository<ICIPGroupModel, Integer> {

	/**
	 * Find by entity and entity type and groups name.
	 *
	 * @param entity     the entity
	 * @param entityType the entity type
	 * @param name       the name
	 * @return the list
	 */
	List<ICIPGroupModel> findByEntityAndEntityTypeAndGroups_name(String entity, String entityType, String name);

	
	List<ICIPGroupModel> findByEntityAndOrganization(String entity,String org);

	/**
	 * Find by entity and entity type and organization.
	 *
	 * @param entity the entity
	 * @param entityType the entity type
	 * @param name the name
	 * @return the list
	 */
	List<ICIPGroupModel> findByEntityAndEntityTypeAndOrganization(String entity, String entityType, String name);

	/**
	 * Find by entity type and groups name and organization.
	 *
	 * @param entityType the entity type
	 * @param name       the name
	 * @param org        the org
	 * @return the list
	 */
	List<ICIPGroupModel> findByEntityTypeAndGroups_nameAndOrganization(String entityType, String name, String org);

	/**
	 * Find by groups name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the list
	 */
	List<ICIPGroupModel> findByGroups_nameAndOrganization(String name, String org);

	/**
	 * Gets the entity by organization and entity type.
	 *
	 * @param org        the org
	 * @param entityType the entity type
	 * @return the entity by organization and entity type
	 */
	List<ICIPGroupModel> getEntityByOrganizationAndEntityType(String org, String entityType);

	/**
	 * Delete by groups id.
	 *
	 * @param id the id
	 * @return the int
	 */
	int deleteByGroups_id(int id);

	/**
	 * Delete by project.
	 *
	 * @param org the org
	 */
	void deleteByProject(String org);

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPGroupModel> findByOrganization(String org);

	/**
	 * Find all by organization and entity datasets.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param entityType the entity type
	 * @return the list
	 */
	List<ICIPGroupModel> findAllByOrganizationAndEntityDatasets(String organization, String entity, String entityType);

	/**
	 * Gets the entity by organization and entity type and entity.
	 *
	 * @param org the org
	 * @param entityType the entity type
	 * @param entity the entity
	 * @return the entity by organization and entity type and entity
	 */
	List<ICIPGroupModel> getEntityByOrganizationAndEntityTypeAndEntity(String org, String entityType, String entity);

	/**
	 * Delete by entity and entity type and organization.
	 *
	 * @param entityName the entity name
	 * @param entityType the entity type
	 * @param organization the organization
	 */
	void deleteByEntityAndEntityTypeAndOrganization(String entityName, String entityType, String organization);

}
