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

package com.lfn.icip.icipwebeditor.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Marker;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPGroupsService.
 *
 * @author essedum
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
