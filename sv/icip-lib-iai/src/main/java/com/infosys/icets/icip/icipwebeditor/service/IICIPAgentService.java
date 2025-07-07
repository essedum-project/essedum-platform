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

import java.sql.SQLException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.Marker;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgents;

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
