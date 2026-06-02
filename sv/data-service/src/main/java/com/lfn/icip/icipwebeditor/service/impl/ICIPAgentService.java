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

package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.lfn.icip.icipwebeditor.model.ICIPAgents;
import com.lfn.icip.icipwebeditor.repository.ICIPAgentRepository;
import com.lfn.icip.icipwebeditor.service.IICIPAgentService;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPAgentService.
 */
@Service
@Transactional
public class ICIPAgentService implements IICIPAgentService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAgentService.class);

	/** The streaming services repository. */
	@Autowired
	private ICIPAgentRepository agentsRepository;

	/** The ncs. */
	@Autowired
	private NameEncoderService ncs;

	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP streaming services
	 */
	public ICIPAgents findOne(Integer id) {
		logger.info("Fetching agent by Id {}", id);
		return agentsRepository.findById(id).orElse(null);
	}

	/**
	 * Find one.
	 *
	 * @param name the name
	 * @return the ICIP streaming services
	 */
	public ICIPAgents findOne(String name) {
		logger.info("Fetching agent by name {}", name);
		return agentsRepository.findByName(name);
	}

	/**
	 * Gets the ICIP streaming services.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services
	 */
	public ICIPAgents getAgent(String name, String org) {
		return agentsRepository.findByNameAndOrganization(name, org);

	}

	/**
	 * Save.
	 *
	 * @param agent the agent
	 * @return the ICIP streaming services
	 */
	public ICIPAgents save(ICIPAgents agent) {
		return save(agent, logger, null);
	}

	/**
	 * Save.
	 *
	 * @param agent  the agent
	 * @param logger the logger
	 * @param marker the marker
	 * @return the ICIP streaming services
	 */
	public ICIPAgents save(ICIPAgents agent, Logger logger, Marker marker) {
		logger.info(marker, "Saving streaming servie {}", agent.getName());
		ICIPAgents fetched;
		if(agent.getName()==null || agent.getName().length()==0 )
			agent.setName(this.createName(agent.getOrganization(), agent.getAlias()));
		else if (agent.getName() != null) {
			fetched = agentsRepository.findByNameAndOrganization(agent.getName(), agent.getOrganization());
			if (fetched != null)
				agent.setCid(fetched.getCid());
		}
		return agentsRepository.save(agent);
	}

	/**
	 * Creates the name.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the string
	 */
	@Override
	public String createName(String org, String alias) {
		Boolean uniqueName = true;
		String name = null;
		do {
			name = ncs.nameEncoder(org, alias);
			if (agentsRepository.countByName(name) != 0) {
				uniqueName = false;
			} else {
				uniqueName = true;
			}
		} while (uniqueName == false);
		logger.info(name);
		return name;
	}
	/**
	 * Update.
	 *
	 * @param agent the agent
	 * @return the ICIP streaming services
	 */
	@Override
	public ICIPAgents update(ICIPAgents agent) {
		return update(agent, logger, null);
	}

	/**
	 * Update.
	 *
	 * @param agent  the agent
	 * @param logger the logger
	 * @param marker the marker
	 * @return the ICIP streaming services
	 */
	@Override
	public ICIPAgents update(ICIPAgents agent, Logger logger, Marker marker) {
		ICIPAgents fetched = agentsRepository.getOne(agent.getCid());
		if (agent.getDescription() != null)
			fetched.setDescription(agent.getDescription());
		if (agent.getJsonContent() != null)
			fetched.setJsonContent(agent.getJsonContent());
		if (agent.getJobId() != null)
			fetched.setJobId(agent.getJobId());
		if (agent.getLastmodifiedby() != null)
			fetched.setLastmodifiedby(agent.getLastmodifiedby());
		if (agent.getType() != null)
			fetched.setType(agent.getType());
		fetched.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
		logger.info(marker, "Updating streaming service {}", fetched.getName());
		return agentsRepository.save(fetched);
	}

	/**
	 * Delete.
	 *
	 * @param id the id
	 */
	public void delete(Integer id) {
		agentsRepository.deleteById(id);
		logger.info("Deleting streaming service by Id {}", id);
	}

	/**
	 * Gets the streaming services.
	 *
	 * @param agent the agent
	 * @return the streaming services
	 */
	public ICIPAgents getAgents(ICIPAgents agent) {
		logger.info("Fetching streaming services {}", agent.getName());
		Example<ICIPAgents> example = null;
		agent.setDeleted(false);
		agent.setCreatedDate(null);
		agent.setLastmodifieddate(null);
		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().exact())
				.withMatcher("organization", match -> match.ignoreCase().exact())
				.withMatcher("deleted", match -> match.ignoreCase().exact());

		example = Example.of(agent, matcher);
		Optional<ICIPAgents> optionalStreamingService = agentsRepository.findOne(example);
		if (optionalStreamingService.isPresent()) {
			agent = optionalStreamingService.get();
		}
		return agent;
	}

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	@Override
	public List<ICIPAgents> findByOrganization(String fromProjectId) {
		return agentsRepository.findByOrganization(fromProjectId);
	}

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(String fromProjectId, String toProjectId) {
		logger.info("Fetching jobs for Entity {}", fromProjectId);
		List<ICIPAgents> icGrps = agentsRepository.findByOrganization(fromProjectId);
		List<ICIPAgents> toGrps = icGrps.parallelStream().map(grp -> {
			grp.setCid(null);
			grp.setOrganization(toProjectId);
			return grp;
		}).collect(Collectors.toList());
		toGrps.stream().forEach(grp -> agentsRepository.save(grp));
		return true;
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	@Override
	public void delete(String project) {
		agentsRepository.deleteByProject(project);
	}

	/**
	 * Gets the all agent names by org.
	 *
	 * @param org the org
	 * @return the all agent names by org
	 */
	@Override
	public List<String> getAllAgentNamesByOrg(String org) {
		return agentsRepository.getAgentNames(org);
	}

	/**
	 * Gets the all pipelines.
	 *
	 * @return the all pipelines
	 */
	@Override
	public List<ICIPAgents> getAllAgents() {
		logger.debug("Getting all pipelines");
		return agentsRepository.findAll();
	}

	/**
	 * Gets the all pipelines by org.
	 *
	 * @param org the org
	 * @return the all pipelines by org
	 */
	@Override
	public List<ICIPAgents> getAllAgentsByOrg(String org) {
		logger.debug("Getting all pipelines by organization");
		return agentsRepository.findByOrganization(org);
	}

	/**
	 * Gets the ICIP streaming services.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services
	 */
	@Override
	public ICIPAgents getICIPAgent(String name, String org) {
		return agentsRepository.findByNameAndOrganization(name, org);

	}

	/**
	 * Gets the streaming services by group and org.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param page         the page
	 * @param size         the size
	 * @return the streaming services by group and org
	 */
	@Override
	public List<ICIPAgents> getAgentsByGroupAndOrg(String groupName, String organization, int page, int size) {
		logger.debug("Getting all streaming services By Group : {} and Org : {}", groupName, organization);
		return agentsRepository.getByGroupNameAndOrganization(groupName, organization, PageRequest.of(page, size));
	}

	/**
	 * Gets the agents by group and org and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the agents by group and org and search
	 */
	@Override
	public List<ICIPAgents> getAgentsByGroupAndOrgAndSearch(String group, String org, String search, int page,
			int size) {
		return agentsRepository.getByGroupNameAndOrganizationAndSearch(group, org, search, PageRequest.of(page, size));
	}

	/**
	 * Gets the agents len by group and org.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the agents len by group and org
	 */
	@Override
	public Long getAgentsLenByGroupAndOrg(String group, String org) {
		return agentsRepository.getAgentsLenByGroupAndOrg(group, org);
	}

	/**
	 * Gets the agents len by group and org and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the agents len by group and org and search
	 */
	@Override
	public Long getAgentsLenByGroupAndOrgAndSearch(String group, String org, String search) {
		return agentsRepository.getAgentsLenByGroupAndOrgAndSearch(group, org, search);
	}

	/**
	 * Gets the json.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the json
	 */
	@Override
	public String getJson(String name, String org) {
		logger.info("Getting JSON for Streaming Service : {}", name);
		ICIPAgents agentItem = new ICIPAgents();
		agentItem.setName(name);
		agentItem.setOrganization(org);
		return getAgents(agentItem).getJsonContent();
	}

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	@Override
	public List<NameAndAliasDTO> getNameAndAlias(String group, String org) {
		return agentsRepository.getNameAndAlias(group, org);
	}

}
