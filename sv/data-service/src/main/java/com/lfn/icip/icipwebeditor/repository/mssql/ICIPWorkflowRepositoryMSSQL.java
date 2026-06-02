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

package com.lfn.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPWorkflow;
import com.lfn.icip.icipwebeditor.repository.ICIPWorkflowRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPWorkflowRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPWorkflowRepositoryMSSQL extends ICIPWorkflowRepository {

	/**
	 * Find by wkspec name.
	 *
	 * @param wkspec the wkspec
	 * @return the list
	 */
	@Query(value = "select * from mlworkflow join mlworkflowspec on mlworkflow.wkspec = mlworkflowspec.id "
			+ " where mlworkflowspec.wkname = :wkspec", nativeQuery = true)
	List<ICIPWorkflow> findByWkspecName(@Param("wkspec") String wkspec);
	
	@Query(value = "select mlworkflow.*,mlworkflowspec.wkname,mlworkflowspec.wkspec AS spec from mlworkflow join mlworkflowspec on mlworkflow.wkspec = mlworkflowspec.id "
			+ " where mlworkflowspec.wkname = :wkspec and mlworkflow.organization = :org", nativeQuery = true)
	List<ICIPWorkflow> findByWkspecNameAndOrganization(@Param("wkspec") String wkspec, @Param("org") String org);
}
