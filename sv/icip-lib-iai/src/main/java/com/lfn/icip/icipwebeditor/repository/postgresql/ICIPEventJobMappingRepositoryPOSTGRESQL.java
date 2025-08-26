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

package com.lfn.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.lfn.icip.icipwebeditor.repository.ICIPEventJobMappingRepository;

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
