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

import com.infosys.icets.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPEventJobMappingRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPEventJobMappingRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPEventJobMappingRepositoryPOSTGRESQL extends ICIPEventJobMappingRepository {

	/**
	 * Find by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mleventjobmapping WHERE organization = :org AND "
			+ "eventname ILIKE CONCAT('%',:search,'%') ORDER BY id DESC", nativeQuery = true)
	List<ICIPEventJobMapping> findByOrgAndSearch(@Param("org") String org, @Param("search") String search,
			Pageable pageable);

	/**
	 * Count by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the list
	 */
	@Query(value = "SELECT COUNT(*) FROM mleventjobmapping WHERE organization = :org AND "
			+ "eventname ILIKE CONCAT('%',:search,'%') ORDER BY id DESC", nativeQuery = true)
	Long countByOrgAndSearch(@Param("org") String org, @Param("search") String search);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mleventjobmapping where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);

	/**
	 * Find by eventname and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP event job mapping
	 */
	@Query(value = "SELECT * FROM mleventjobmapping WHERE LOWER(eventname) = LOWER(:name) AND LOWER(organization) = LOWER(:org)", nativeQuery = true)
	ICIPEventJobMapping findByEventnameAndOrganization(@Param("name")String name,@Param("org") String org);
}
