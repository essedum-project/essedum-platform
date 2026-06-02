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

package com.lfn.icip.dataset.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.repository.ICIPPartialDatasetRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPartialDatasetRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPPartialDatasetRepositoryPOSTGRESQL extends ICIPPartialDatasetRepository {

	/**
	 * Find by organization and datasource.
	 *
	 * @param organization the organization
	 * @param datasource   the datasource
	 * @return the list
	 */
	@Query(value = "select mldataset.id," + "mldataset.name, " + "mldataset.description," + "mldataset.attributes,"
			+ "mldataset.datasource," + "mldataset.organization," + "mldataset.type,"
			+ "mldataset.schemajson," + "mldataset.backing_dataset, mldataset.exp_status,mldataset.metadata,"

					+ "mldataset.is_approval_required,mldataset.is_inbox_required,mldataset.is_permission_managed,mldataset.is_audit_required,mldataset.context,mldataset.dashboard,mldataset.archival_config "

			+ "from mldataset " + "where organization = :org "
			+ "AND mldataset.datasource = :datasource ORDER BY mldataset.name", nativeQuery = true)
	List<ICIPDataset2> findByOrganizationAndDatasource(@Param("org") String organization,
			@Param("datasource") String datasource);

}
