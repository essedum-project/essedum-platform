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
package com.infosys.icets.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPChainsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPChainsRepositoryMSSQL extends ICIPChainsRepository {
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
			+ "where (:query1 IS NULL OR LOWER(mlchains.job_name) LIKE LOWER(CONCAT('%', :query1, '%'))) AND mlchains.organization = :org", nativeQuery = true)
	
	List<ICIPChains> findByOrganizationFilter(@Param("org") String organization, @Param("query1") String query);
}
