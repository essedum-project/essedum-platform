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

package com.infosys.icets.icip.icipmodelserver.repository.mysql;

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
 * The Interface ICIPPipelineModelRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPPipelineModelRepositoryMYSQL extends ICIPPipelineModelRepository {

	/**
	 * Find running or failed uploads.
	 *
	 * @param org the org
	 * @return the list
	 */
	@Query(value = "SELECT * FROM `mlmodels` WHERE `status` = 0 AND `serverupload` < 100 AND `localupload` <> 0 AND `organization`=:org", nativeQuery = true)
	List<ICIPPipelineModel> findRunningOrFailedUploads(@Param("org") String org);

	/**
	 * Find by organization.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT * FROM `mlmodels` WHERE `organization` = :org AND "
			+ "`modelname` LIKE CONCAT('%',:search,'%') ORDER BY `id`", nativeQuery = true)
	List<ICIPPipelineModel> findByOrganizationAndSearch(@Param("org") String org, @Param("search") String search,
			Pageable pageable);

	/**
	 * Count by organization.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(*) FROM `mlmodels` WHERE `organization` = :org AND "
			+ "`modelname` LIKE CONCAT('%',:search,'%')", nativeQuery = true)
	Long countByOrganizationAndSearch(@Param("org") String org, @Param("search") String search);

	/**
	 * Gets the name and alias.
	 *
	 * @param organization the organization
	 * @param group the group
	 * @return the name and alias
	 */
	@Query(value = "SELECT  mlmodels.modelname as name,mlmodels.alias as alias "
			+ " FROM mlmodels JOIN  mlgroupmodel ON mlmodels.modelname = mlgroupmodel.entity "
			+ " AND mlgroupmodel.organization = mlmodels.organization "
			+ " AND mlgroupmodel.entity_type = 'model' where mlmodels.organization = :org "
			+ " AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<NameAndAliasDTO> getNameAndAlias(@Param("org") String organization, @Param("group") String group);

	@Override
	default ICIPPipelineModel customSave(ICIPPipelineModel model) {
		return save(model);
	}
}
