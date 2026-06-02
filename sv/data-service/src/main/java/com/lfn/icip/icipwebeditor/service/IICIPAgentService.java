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

import java.sql.SQLException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.Marker;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.icipwebeditor.model.ICIPAgents;

// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPAgentService.
 */
public interface IICIPAgentService {

	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP streaming services
	 */
	public ICIPAgents findOne(Integer id);

	/**
	 * Save.
	 *
	 * @param agents the agents
	 * @return the ICIP streaming services
	 */
	public ICIPAgents save(ICIPAgents agents);

	/**
	 * Save.
	 *
	 * @param agents the agents
	 * @param logger            the logger
	 * @param marker            the marker
	 * @return the ICIP streaming services
	 */
	public ICIPAgents save(ICIPAgents agents, Logger logger, Marker marker);

	/**
	 * Update.
	 *
	 * @param streamingServices the streaming services
	 * @param logger            the logger
	 * @param marker            the marker
	 * @return the ICIP streaming services
	 * @throws SQLException the SQL exception
	 */
	public ICIPAgents update(ICIPAgents streamingServices, Logger logger, Marker marker) throws SQLException;

	/**
	 * Update.
	 *
	 * @param streamingServices the streaming services
	 * @return the ICIP agents
	 * @throws SQLException the SQL exception
	 */
	public ICIPAgents update(ICIPAgents streamingServices) throws SQLException;

	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	public void delete(Integer id) throws SQLException;

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	public List<ICIPAgents> findByOrganization(String fromProjectId);

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(String fromProjectId, String toProjectId);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	public void delete(String project);

	/**
	 * Gets the all agent names by org.
	 *
	 * @param org the org
	 * @return the all agent names by org
	 */
	List<String> getAllAgentNamesByOrg(String org);

	/**
	 * Gets the all pipelines.
	 *
	 * @return the all pipelines
	 */
	List<ICIPAgents> getAllAgents();

	/**
	 * Gets the all pipelines by org.
	 *
	 * @param org the org
	 * @return the all pipelines by org
	 */
	List<ICIPAgents> getAllAgentsByOrg(String org);

	/**
	 * Gets the ICIP streaming services.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services
	 */
	ICIPAgents getICIPAgent(String name, String org);

	/**
	 * Gets the streaming services by group and org.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param page         the page
	 * @param size         the size
	 * @return the streaming services by group and org
	 */
	List<ICIPAgents> getAgentsByGroupAndOrg(String groupName, String organization, int page, int size);

	/**
	 * Gets the agents by group and org and search.
	 *
	 * @param group the group
	 * @param org the org
	 * @param search the search
	 * @param page the page
	 * @param size the size
	 * @return the agents by group and org and search
	 */
	public List<ICIPAgents> getAgentsByGroupAndOrgAndSearch(String group, String org, String search, int page,
			int size);

	/**
	 * Gets the agents len by group and org.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the agents len by group and org
	 */
	public Long getAgentsLenByGroupAndOrg(String group, String org);

	/**
	 * Gets the agents len by group and org and search.
	 *
	 * @param group the group
	 * @param org the org
	 * @param search the search
	 * @return the agents len by group and org and search
	 */
	public Long getAgentsLenByGroupAndOrgAndSearch(String group, String org, String search);

	/**
	 * Gets the json.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the json
	 */
	String getJson(String name, String org);
	
	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	public List<NameAndAliasDTO> getNameAndAlias(String group, String org);

	/**
	 * Creates the name.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the string
	 */
	String createName(String org, String alias);

}
