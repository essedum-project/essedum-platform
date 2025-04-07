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
import java.util.Optional;

import org.springframework.data.domain.Example;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author icets
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
