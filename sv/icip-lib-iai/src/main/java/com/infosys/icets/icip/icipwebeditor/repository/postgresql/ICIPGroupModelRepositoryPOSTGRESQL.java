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

package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPGroupModelRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPGroupModelRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPGroupModelRepositoryPOSTGRESQL extends ICIPGroupModelRepository {

	/**
	 * Gets the entity by organization and entity type and entity.
	 *
	 * @param org the org
	 * @param entityType the entity type
	 * @param entity the entity
	 * @return the entity by organization and entity type and entity
	 */
	@Query(value = "select * from mlgroupmodel where organization= :org and entity_type= :entityType and entity=:entity", nativeQuery = true)
	List<ICIPGroupModel> getEntityByOrganizationAndEntityTypeAndEntity(@Param("org") String org,
			@Param("entityType") String entityType, @Param("entity") String entity);

	/**
	 * Gets the entity by organization and entity type.
	 *
	 * @param org the org
	 * @param entityType the entity type
	 * @return the entity by organization and entity type
	 */
	@Query(value = "select * from mlgroupmodel "
			+ "where organization = :org and entity_type= :entityType", nativeQuery = true)
	List<ICIPGroupModel> getEntityByOrganizationAndEntityType(@Param("org") String org,
			@Param("entityType") String entityType);

	/**
	 * Find all by organization and entity datasets.
	 *
	 * @param organization the organization
	 * @param entity the entity
	 * @param entityType the entity type
	 * @return the list
	 */
	@Query(value = "SELECT * from mlgroupmodel WHERE organization = :org "
			+ "AND entity ILIKE CONCAT('%',:entity,'%') AND entity_type=:entityType", nativeQuery = true)
	List<ICIPGroupModel> findAllByOrganizationAndEntityDatasets(@Param("org") String organization,
			@Param("entity") String entity, @Param("entityType") String entityType);

	/**
	 * Delete by project.
	 *
	 * @param org the org
	 */
	@Modifying
	@Query(value = "delete from mlgroupmodel where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String org);
}
