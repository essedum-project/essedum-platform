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

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.icip.icipwebeditor.model.ICIPPartialGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPPartialGroupsRepository extends JpaRepository<ICIPPartialGroups, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialGroups> findByOrganization(@Param("org") String organization, Pageable pageable);

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPPartialGroups> findByOrganization(@Param("org") String organization);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Find by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialGroups> findByOrganizationAndEntityPipelines(String organization, String entity, Pageable pageable);

	/**
	 * Find by organization and entity datasources.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialGroups> findByOrganizationAndEntityDatasources(String organization, String entity,
			Pageable pageable);

	/**
	 * Find by organization and entity datasets.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialGroups> findByOrganizationAndEntityDatasets(String organization, String entity, Pageable pageable);

	/**
	 * Find by organization and entity schemas.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialGroups> findByOrganizationAndEntitySchemas(String organization, String entity, Pageable pageable);

	/**
	 * Count by organization and entity datasources.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	Long countByOrganizationAndEntityDatasources(String organization, String entity);

	/**
	 * Count by organization and entity datasets.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	Long countByOrganizationAndEntityDatasets(String organization, String entity);

	/**
	 * Count by organization and entity schemas.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	Long countByOrganizationAndEntitySchemas(String organization, String entity);

	/**
	 * Count by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	Long countByOrganizationAndEntityPipelines(String organization, String entity);

	/**
	 * Find one by organization and entity pipelines.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the ICIP partial groups
	 */
	ICIPPartialGroups findOneByOrganizationAndEntityPipelines(String organization, String entity);

	/**
	 * Find featured by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPPartialGroups> findFeaturedByOrganization(String organization);

	/**
	 * Count by organization and entity agents.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the long
	 */
	Long countByOrganizationAndEntityAgents(String organization, String entity);

	/**
	 * Find by organization and entity agents.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialGroups> findByOrganizationAndEntityAgents(String organization, String entity, Pageable pageable);

}