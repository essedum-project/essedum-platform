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
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgents;

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