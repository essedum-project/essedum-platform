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

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author icets
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
