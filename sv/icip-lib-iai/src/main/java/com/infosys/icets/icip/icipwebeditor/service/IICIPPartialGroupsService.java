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
