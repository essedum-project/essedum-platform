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

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.icipwebeditor.model.ICIPAgents;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPAgentRepository.
 */
@NoRepositoryBean
@Transactional
public interface ICIPAgentRepository extends JpaRepository<ICIPAgents, Integer> {

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP streaming services
	 */
	ICIPAgents findByName(String name);

	/**
	 * Gets the by group name and organization.
	 *
	 * @param group        the group
	 * @param organization the organization
	 * @param pageable the pageable
	 * @return the by group name and organization
	 */
	List<ICIPAgents> getByGroupNameAndOrganization(String group, String organization, Pageable pageable);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services
	 */
	ICIPAgents findByNameAndOrganization(String name, String org);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	List<ICIPAgents> findByOrganization(String fromProjectId);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);

	/**
	 * Gets the agent names.
	 *
	 * @param org the org
	 * @return the agent names
	 */
	List<String> getAgentNames(String org);

	/**
	 * Gets the by group name and organization and search.
	 *
	 * @param group the group
	 * @param org   the org
	 * @param name  the name
	 * @param pageable the pageable
	 * @return the by group name and organization and search
	 */
	List<ICIPAgents> getByGroupNameAndOrganizationAndSearch(String group, String org, String name, Pageable pageable);

	/**
	 * Gets the agents len by group and org.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the agents len by group and org
	 */
	Long getAgentsLenByGroupAndOrg(String group, String org);

	/**
	 * Gets the agents len by group and org and search.
	 *
	 * @param group the group
	 * @param org   the org
	 * @param name  the name
	 * @return the agents len by group and org and search
	 */
	Long getAgentsLenByGroupAndOrgAndSearch(String group, String org, String name);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	List<NameAndAliasDTO> getNameAndAlias(String group, String org);

	int countByName(String name);

}