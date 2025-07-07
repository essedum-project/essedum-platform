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
package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;

import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPPartialGroupsService.
 *
 * @author icets
 */
public interface IICIPPartialGroupsService {

	/**
	 * Gets the groups by org.
	 *
	 * @param organization the organization
	 * @param page the page
	 * @param size the size
	 * @return the groups by org
	 */
	List<ICIPPartialGroups> getGroupsByOrg(String organization, int page, int size);

	/**
	 * Gets the groups by org and entity.
	 *
	 * @param organization the organization
	 * @param entity the entity
	 * @param entityType the entity type
	 * @param page the page
	 * @param size the size
	 * @return the groups by org and entity
	 */
	List<ICIPPartialGroups> getGroupsByOrgAndEntity(String organization, String entity, String entityType, int page,
			int size);
	
	/**
	 * Gets the groups len by org and entity.
	 *
	 * @param organization the organization
	 * @param entity the entity
	 * @param entityType the entity type
	 * @return the groups len by org and entity
	 */
	Long getGroupsLenByOrgAndEntity(String organization, String entity, String entityType);
	
	/**
	 * Gets the all groups by org and entity.
	 *
	 * @param organization the organization
	 * @param entity the entity
	 * @param entityType the entity type
	 * @return the all groups by org and entity
	 */
	List<ICIPGroupModel> getAllGroupsByOrgAndEntity(String organization, String entity, String entityType);

	/**
	 * Gets the single groups by org and entity.
	 *
	 * @param organization the organization
	 * @param entity the entity
	 * @return the single groups by org and entity
	 */
	ICIPPartialGroups getSingleGroupsByOrgAndEntity(String organization, String entity);

	/**
	 * Gets the featured groups by org.
	 *
	 * @param organization the organization
	 * @return the featured groups by org
	 */
	List<ICIPPartialGroups> getFeaturedGroupsByOrg(String organization);

	/**
	 * Gets the groups len by org.
	 *
	 * @param org the org
	 * @return the groups len by org
	 */
	Long getGroupsLenByOrg(String org);

	/**
	 * Gets the groups.
	 *
	 * @param organization the organization
	 * @return the groups
	 */
	List<ICIPPartialGroups> getGroups(String organization);

}
