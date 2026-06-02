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
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.job.model.ICIPChains;
import com.lfn.icip.icipwebeditor.repository.ICIPChainsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPChainsRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPChainsRepositoryPOSTGRESQL extends ICIPChainsRepository {
	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mlchains where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);
	
   @Query(value = "SELECT  mlchains.id," + "mlchains.job_name,mlchains.description,"
			+ "mlchains.json_content,mlchains.flowjson,mlchains.parallelchain,"
			+ "mlchains.organization " + "from mlchains "
			+ "where (:query1 IS NULL OR mlchains.job_name ILIKE CONCAT('%', :query1, '%')) AND mlchains.organization = :org", nativeQuery = true)
	List<ICIPChains> findByOrganizationFilter(@Param("org") String organization, @Param("query1") String query);
	
}
