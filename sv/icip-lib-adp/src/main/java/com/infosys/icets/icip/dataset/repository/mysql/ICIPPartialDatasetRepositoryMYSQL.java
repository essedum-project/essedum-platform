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
package com.infosys.icets.icip.dataset.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.repository.ICIPPartialDatasetRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPartialDatasetRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPPartialDatasetRepositoryMYSQL extends ICIPPartialDatasetRepository {

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
