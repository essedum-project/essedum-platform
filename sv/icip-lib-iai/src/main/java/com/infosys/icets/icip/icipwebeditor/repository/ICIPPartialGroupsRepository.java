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
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author icets
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