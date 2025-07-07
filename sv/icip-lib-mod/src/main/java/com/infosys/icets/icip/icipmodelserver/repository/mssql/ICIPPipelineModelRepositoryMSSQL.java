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
package com.infosys.icets.icip.icipmodelserver.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;
import com.infosys.icets.icip.icipmodelserver.repository.ICIPPipelineModelRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPipelineModelRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPPipelineModelRepositoryMSSQL extends ICIPPipelineModelRepository {

	/**
	 * Find running or failed uploads.
	 *
	 * @param org the org
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mlmodels WHERE status = 0 AND serverupload < 100 AND localupload <> 0 AND organization=:org", nativeQuery = true)
	List<ICIPPipelineModel> findRunningOrFailedUploads(@Param("org") String org);

	/**
	 * Find by organization.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mlmodels WHERE organization = :org AND modelname LIKE "
			+ "CONCAT('%',:search,'%') ORDER BY modelname ASC", nativeQuery = true)
	List<ICIPPipelineModel> findByOrganizationAndSearch(@Param("org") String org, @Param("search") String search,
			Pageable pageable);

	/**
	 * Count by organization.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(*) FROM mlmodels WHERE organization = :org AND "
			+ "modelname LIKE CONCAT('%',:search,'%')", nativeQuery = true)
	Long countByOrganizationAndSearch(@Param("org") String org, @Param("search") String search);

	/**
	 * Gets the name and alias.
	 *
	 * @param organization the organization
	 * @param group the group
	 * @return the name and alias
	 */
	@Query(value = "SELECT  mlmodels.name as name,mlmodels.alias as alias "
			+ " FROM mlmodels JOIN  mlgroupmodel ON mlmodels.name = mlgroupmodel.entity "
			+ " AND mlgroupmodel.organization = mlmodels.organization "
			+ " AND mlgroupmodel.entity_type = 'model' where mlmodels.organization = :org "
			+ " AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<NameAndAliasDTO> getNameAndAlias(@Param("org") String organization, @Param("group") String group);

	
	@Override
	default ICIPPipelineModel customSave(ICIPPipelineModel model) {
		return save(model);
	}
}
