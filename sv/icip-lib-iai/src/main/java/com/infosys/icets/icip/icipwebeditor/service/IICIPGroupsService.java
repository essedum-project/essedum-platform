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

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPGroupsService.
 *
 * @author icets
 */
public interface IICIPGroupsService {

	/**
	 * Delete.
	 *
	 * @param name    the name
	 * @param project the project
	 */
	void delete(String name, String project);

	/**
	 * Gets the group.
	 *
	 * @param name    the name
	 * @param project the project
	 * @return the group
	 */
	ICIPGroups getGroup(String name, String project);

	/**
	 * Save.
	 *
	 * @param iCIPGroups the i CIP groups
	 * @return the ICIP groups
	 */
	ICIPGroups save(ICIPGroups iCIPGroups);

	/**
	 * Gets the groups for entity.
	 *
	 * @param entityType   the entity type
	 * @param entity       the entity
	 * @param organization the organization
	 * @return the groups for entity
	 */
	List<ICIPGroups> getGroupsForEntity(String entityType, String entity, String organization);

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	List<Map> copy(Marker marker, String fromProjectId, String toProjectId);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Creates the name.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the string
	 */
	String createName(String org, String alias);

	/**
	 * Gets the group names.
	 *
	 * @param organization the organization
	 * @return the group names
	 */
	List<NameAndAliasDTO> getGroupNames(String organization);

	List<ICIPGroups> getGroupsByOrganizationAndType(String organization, String type);


	void copyTemplate(Marker marker, String groupName, String fromProjectId, String toProjectId);
}
