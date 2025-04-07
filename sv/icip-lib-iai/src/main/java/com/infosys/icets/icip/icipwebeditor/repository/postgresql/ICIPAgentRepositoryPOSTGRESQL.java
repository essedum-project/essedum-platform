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
package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgents;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPAgentRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPAgentRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPAgentRepositoryPOSTGRESQL extends ICIPAgentRepository {

	/**
	 * Gets the by group name and organization.
	 *
	 * @param group        the group
	 * @param organization the organization
	 * @param pageable the pageable
	 * @return the by group name and organization
	 */
	@Query(value = "select * from mlagents join mlgroupmodel on " + " mlgroupmodel.entity = mlagents.name "
			+ " where mlagents.organization = :organization and "
			+ " mlgroupmodel.model_group=:groupName and mlgroupmodel.entity_type='agent'", nativeQuery = true)
	List<ICIPAgents> getByGroupNameAndOrganization(@Param("groupName") String group,
			@Param("organization") String organization, Pageable pageable);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mlagents where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);

	/**
	 * Gets the agent names.
	 *
	 * @param org the org
	 * @return the agent names
	 */
	@Query(value = "select name from mlagents where organization = :org", nativeQuery = true)
	List<String> getAgentNames(@Param("org") String org);

	/**
	 * Gets the by group name and organization and search.
	 *
	 * @param group the group
	 * @param org   the org
	 * @param name  the name
	 * @param pageable the pageable
	 * @return the by group name and organization and search
	 */
	@Query(value = "select * from mlagents join mlgroupmodel on " + " mlgroupmodel.entity = mlagents.name "
			+ " where mlagents.organization = :org and " + " mlagents.name LIKE CONCAT('%',:name,'%') and "
			+ " mlgroupmodel.model_group=:group and mlgroupmodel.entity_type='agent'", nativeQuery = true)
	List<ICIPAgents> getByGroupNameAndOrganizationAndSearch(@Param("group") String group, @Param("org") String org,
			@Param("name") String name, Pageable pageable);

	/**
	 * Gets the agents len by group and org.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the agents len by group and org
	 */
	@Query(value = "select COUNT(mlagents.cid) from mlagents JOIN  mlgroupmodel "
			+ "ON mlagents.name = mlgroupmodel.entity " + "AND mlagents.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'agent' " + "where mlgroupmodel.organization = :org "
			+ "AND mlgroupmodel.model_group = :group", nativeQuery = true)
	Long getAgentsLenByGroupAndOrg(@Param("group") String group, @Param("org") String org);

	/**
	 * Gets the agents len by group and org and search.
	 *
	 * @param group the group
	 * @param org   the org
	 * @param name  the name
	 * @return the agents len by group and org and search
	 */
	@Query(value = "select COUNT(mlagents.cid) from mlagents JOIN  mlgroupmodel "
			+ "ON mlagents.name = mlgroupmodel.entity " + "AND mlagents.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'agent' " + "where mlgroupmodel.organization = :org "
			+ "AND mlagents.name LIKE CONCAT('%',:name,'%') "
			+ "AND mlgroupmodel.model_group = :group", nativeQuery = true)
	Long getAgentsLenByGroupAndOrgAndSearch(@Param("group") String group, @Param("org") String org,
			@Param("name") String name);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param organization the organization
	 * @return the name and alias
	 */
	@Query(value = "SELECT  mlagents.name as name,mlagents.alias as alias "
			+ " FROM mlagents JOIN  mlgroupmodel ON mlagents.name = mlgroupmodel.entity "
			+ " AND mlgroupmodel.organization = mlagents.organization "
			+ " AND mlgroupmodel.entity_type = 'agent' where mlagents.organization = :org "
			+ " AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<NameAndAliasDTO> getNameAndAlias(@Param("group") String group, @Param("org") String organization);

}
