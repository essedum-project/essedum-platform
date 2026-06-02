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

import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPGroupModelService.
 *
 * @author essedum
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
