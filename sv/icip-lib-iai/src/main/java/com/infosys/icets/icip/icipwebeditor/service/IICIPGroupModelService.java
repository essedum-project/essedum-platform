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
import java.util.Map;

import org.slf4j.Marker;

import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPGroupModelService.
 *
 * @author icets
 */
public interface IICIPGroupModelService {

	/**
	 * Gets the all entities by type for group.
	 *
	 * @param entityType the entity type
	 * @param groupName  the group name
	 * @param org        the org
	 * @return the all entities by type for group
	 */
	List<ICIPGroupModel> getAllEntitiesByTypeForGroup(String entityType, String groupName, String org);

	/**
	 * Gets the all entities by org and type.
	 *
	 * @param organization the organization
	 * @param type         the type
	 * @return the all entities by org and type
	 */
	List<ICIPGroupModel> getAllEntitiesByOrgAndType(String organization, String type);

	/**
	 * Save.
	 *
	 * @param entityType the entity type
	 * @param name       the name
	 * @param organization the organization
	 * @param group      the group
	 * @return the ICIP group model
	 */
	boolean save(String entityType, String name, String organization, List<String> group);

	/**
	 * Delete.
	 *
	 * @param entity       the entity
	 * @param entityType   the entity type
	 * @param organization the organization
	 */
	void delete(String entity, String entityType, String organization);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Export group model.
	 *
	 * @param org        the org
	 * @param entityType the entity type
	 * @param entities   the entities
	 * @return the list
	 */
	List<List<ICIPGroupModel>> exportGroupModel(String org, String entityType, List<String> entities);

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param groupMap      the group map
	 * @return true, if successful
	 */
	Map<ICIPGroupModel, ICIPGroupModel> copy(Marker marker, String fromProjectId, String toProjectId,
			Map<ICIPGroups, ICIPGroups> groupMap);

	/**
	 * Save.
	 *
	 * @param entityType the entity type
	 * @param entity the entity
	 * @param newGp the new gp
	 */
	void save(String entityType, String entity, ICIPGroups newGp);

	void savenewgroupModelCopyTemplate(ICIPGroupModel groupModelatindex);

}
