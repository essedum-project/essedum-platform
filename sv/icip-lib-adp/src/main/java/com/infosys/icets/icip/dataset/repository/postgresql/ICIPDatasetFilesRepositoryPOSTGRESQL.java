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
package com.infosys.icets.icip.dataset.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.dataset.model.ICIPDatasetFiles;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetFilesRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPDatasetFilesRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPDatasetFilesRepositoryPOSTGRESQL extends ICIPDatasetFilesRepository {

	/**
	 * Find by datasetname and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mldatasetfiles WHERE datasetname=:name AND organization=:org ORDER BY timestamp DESC", nativeQuery = true)
	public List<ICIPDatasetFiles> findByDatasetnameAndOrganization(@Param("name") String name,
			@Param("org") String org);

}
