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

package com.infosys.icets.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPrompts;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPrompRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPStreamingServicesRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPPrompRepositoryMYSQL extends ICIPPrompRepository {

	@Query(value="SELECT * from mlprompts p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.name) like LOWER(CONCAT('%', :query1, '%'))) "
            + " ORDER BY p1.createdon DESC",nativeQuery = true)
	List<ICIPPrompts> getAllPromptsByOrg(@Param("project")String project, Pageable paginate,@Param("query1") String query);
	
	@Query(value="SELECT count(*) from mlprompts p1 WHERE "
            + " p1.organization = :project AND"
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.name) like LOWER(CONCAT('%', :query1, '%'))) "
            + " ORDER BY p1.createdon DESC",nativeQuery = true)
	Long getPromptsCountByOrg(@Param("project")String project, @Param("query1") String query); 

	@Query(value="SELECT * from mlprompts p1 WHERE "
            + " p1.organization = :project",nativeQuery = true)
	List<ICIPPrompts> findAllByOrganization(@Param("project")String project);

	@Query(value="SELECT * from mlprompts p1 WHERE "
            + " p1.organization = :project AND p1.alias = :alias",nativeQuery = true)
	ICIPPrompts findByAliasAndOrganization(@Param("alias")String alias,@Param("project")String project);

}