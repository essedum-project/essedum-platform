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
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPGroups;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPGroupsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPGroupsRepositoryMSSQL extends ICIPGroupsRepository {

	/**
	 * Find by organization and groups model entity and groups model entity type.
	 *
	 * @param org        the org
	 * @param entity     the entity
	 * @param entityType the entity type
	 * @return the list
	 */
	@Query(value = "select * from mlgroups AS mlg " + "INNER JOIN mlgroupmodel AS mlgm "
			+ "ON mlg.name = mlgm.model_group " + "where mlg.organization = :organization "
			+ "and mlgm.entity = :entity and mlgm.entity_type= :entityType", nativeQuery = true)
	List<ICIPGroups> findByOrganizationAndGroupsModel_EntityAndGroupsModel_EntityType(@Param("organization") String org,
			@Param("entity") String entity, @Param("entityType") String entityType);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mlgroups where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);
	
	@Query(value = "select * from mlgroups where organization = :org AND type= :type", nativeQuery = true)
	List<ICIPGroups> findByOganizationAndType(@Param("org") String organization,@Param("type") String type);

}
