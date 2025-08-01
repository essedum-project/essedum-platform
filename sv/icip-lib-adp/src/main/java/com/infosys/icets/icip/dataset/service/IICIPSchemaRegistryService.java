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

package com.infosys.icets.icip.dataset.service;

import java.util.List;

import org.slf4j.Marker;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.model.dto.ICIPSchemaRegistryDTO2;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPSchemaRegistryService.
 *
 * @author icets
 */
public interface IICIPSchemaRegistryService {

	/**
	 * Gets the schema names by org.
	 *
	 * @param organization the organization
	 * @return the schema names by org
	 */
	public List<NameAndAliasDTO> getSchemaNamesByOrg(String organization);

	/**
	 * Save.
	 *
	 * @param name the name
	 * @param org the org
	 * @param schema the schema
	 * @return the ICIP schema registry
	 */
	public ICIPSchemaRegistry save(String name, String org, ICIPSchemaRegistry schema);

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org the org
	 */
	public void delete(String name, String org);

	/**
	 * Fetch all by org.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	public List<ICIPSchemaRegistry> fetchAllByOrg(String organization);

	/**
	 * Search schemas.
	 *
	 * @param name the name
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPSchemaRegistry> searchSchemas(String name, String organization);

	/**
	 * Gets the schemas by group and org.
	 *
	 * @param organization the organization
	 * @param groupName the group name
	 * @param search the search
	 * @param page the page
	 * @param size the size
	 * @return the schemas by group and org
	 */
	List<ICIPSchemaRegistryDTO2> getSchemasByGroupAndOrg(String organization, String groupName, String search, int page, int size);

	/**
	 * Gets the schema.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the schema
	 */
	public ICIPSchemaRegistry getSchema(String name, String org);

	/**
	 * Fetch schema value.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the string
	 */
	String fetchSchemaValue(String name, String org);
	

	/**
	 * Copy.
	 *
	 * @param marker the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId the to project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Gets the schema len by group and org.
	 *
	 * @param group the group
	 * @param org the org
	 * @param search the search
	 * @return the schema len by group and org
	 */
	public Long getSchemaLenByGroupAndOrg(String group, String org, String search);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	void delete(String project);

	/**
	 * Copy selected.
	 *
	 * @param marker the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId the to project id
	 * @param name the name
	 * @return true, if successful
	 */
	public boolean copySelected(Marker marker, String fromProjectId, String toProjectId, String name);

	/**
	 * Creates the name.
	 *
	 * @param alias the alias
	 * @param org the org
	 * @return the string
	 */
	public String createName(String alias, String org);

	/**
	 * Gets the schema by name.
	 *
	 * @param alias the alias
	 * @param org the org
	 * @return the schema by name
	 */
	public ICIPSchemaRegistry getSchemaByName(String alias, String org);
	
	public ICIPSchemaRegistry getSchemaByAlias(String alias, String org);

	/**
	 * Gets the name and alias.
	 *
	 * @param groupName the group name
	 * @param org the org
	 * @return the name and alias
	 */
	public List<NameAndAliasDTO> getNameAndAlias(String groupName, String org);

	/**
	 * @param name
	 * @param org
	 * @return
	 */
	ICIPSchemaRegistry getSchemaByAliasAndOrganization(String name, String org);

	/**
	 * Fetch all by org and filter/query.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPSchemaRegistry> fetchAllByOrgAndQuery(String query, String organization);

}
