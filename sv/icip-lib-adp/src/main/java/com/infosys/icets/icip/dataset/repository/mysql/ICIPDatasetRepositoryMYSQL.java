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

package com.infosys.icets.icip.dataset.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPDatasetRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPDatasetRepositoryMYSQL extends ICIPDatasetRepository {

	/**
	 * Search by name.
	 *
	 * @param name   the name
	 * @param org    the org
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "select mldataset.id, mldataset.name, mldataset.lastmodifieddate,mldataset.lastmodifiedby,"
			+ "mldataset.description, mldataset.attributes, mldataset.datasource,mldataset.tags,  "
			+ "mldataset.organization, mldataset.alias,mldataset.type, mldataset.taskdetails,"
			+ "mldataset.backing_dataset, mldataset.dataset_schema, mldataset.archival_config, "
			+ "mldataset.exp_status, mldataset.views, mldataset.is_archival_enabled,mldataset.modeltype, "
			+ "mldataset.is_approval_required,mldataset.is_permission_managed, mldataset.metadata,"
			+ "mldataset.is_audit_required,mldataset.context,mldataset.dashboard,mldataset.is_inbox_required,mldataset.adaptername,mldataset.isadapteractive,mldataset.interfacetype,mldataset.schemajson,mldataset.indexname,mldataset.summary,mldataset.event_details from mldataset where organization = :org "
			+ "AND alias LIKE CONCAT('%',:name,'%')", nativeQuery = true)
	List<ICIPDataset> searchByName(@Param("name") String name, @Param("org") String org, Pageable pageable);

	/**
	 * Count length by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	@Query(value = "select count(mldataset.id) from mldataset where organization = :org "
			+ "AND alias LIKE CONCAT('%',:name,'%')", nativeQuery = true)
	Long countLengthByName(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by organization by groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the list
	 */
	@Query(value = "select mldataset.id,mldataset.name,mldataset.description,mldataset.lastmodifieddate,mldataset.lastmodifiedby, mldataset.modeltype,mldataset.tags,mldataset.interfacetype, "
			+ "mldataset.dataset_schema, mldataset.attributes,mldataset.archival_config, mldataset.alias, mldataset.datasource, mldataset.backing_dataset, mldataset.exp_status,"

			+ "mldataset.organization, mldataset.exp_status, mldataset.views,mldataset.is_approval_required,mldataset.is_archival_enabled, mldataset.metadata, "
			+ "mldataset.is_permission_managed,mldataset.is_audit_required,mldataset.context,mldataset.dashboard,mldataset.archival_config,mldataset.is_inbox_required"

			+ "from mldataset JOIN  mlgroupmodel ON mldataset.name = mlgroupmodel.entity "
			+ "AND mldataset.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'dataset' where mlgroupmodel.organization = :org "
			+ "AND mlgroupmodel.model_group = :group ORDER BY mldataset.name", nativeQuery = true)
	List<ICIPDataset> findByOrganizationByGroups(@Param("org") String organization, @Param("group") String groupName);

	/**
	 * Find by organization by groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param pageable the pageable
	 * @return the list
	 */ 

	@Query(value = "select mldataset.id,mldataset.name,mldataset.description,mldataset.lastmodifieddate,mldataset.lastmodifiedby,mldataset.modeltype,mldataset.tags,mldataset.interfacetype, "
			+ "mldataset.dataset_schema, mldataset.attributes,mldataset.archival_config, mldataset.alias, mldataset.datasource, mldataset.backing_dataset, mldataset.exp_status,"

			+ "mldataset.is_approval_required,mldataset.is_permission_managed,mldataset.is_audit_required,mldataset.is_inbox_required,mldataset.is_archival_enabled, mldataset.metadata,"
			+ "mldataset.organization, mldataset.type, mldataset.schemajson, mldataset.adaptername, mldataset.isadapteractive, mldataset.views,mldataset.context,mldataset.dashboard,"
			+ "mldataset.taskdetails "

			+ "from mldataset JOIN  mlgroupmodel ON mldataset.name = mlgroupmodel.entity "
			+ "AND mldataset.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'dataset' where mlgroupmodel.organization = :org "
			+ "AND mlgroupmodel.model_group = :group ORDER BY mldataset.name", nativeQuery = true)
	List<ICIPDataset> findByOrganizationByGroups(@Param("org") String organization, @Param("group") String groupName,
			Pageable pageable);
	
	@Query(value = "select mldataset.id,mldataset.name,mldataset.description,mldataset.lastmodifieddate,mldataset.lastmodifiedby,mldataset.modeltype,mldataset.tags,mldataset.interfacetype, "
			+ "mldataset.dataset_schema, mldataset.attributes,mldataset.archival_config, mldataset.alias, mldataset.datasource, mldataset.backing_dataset, mldataset.exp_status,"
			+ "mldataset.is_approval_required,mldataset.is_permission_managed,mldataset.is_audit_required,mldataset.is_inbox_required,mldataset.is_archival_enabled, mldataset.metadata,"
			+ "mldataset.organization, mldataset.type, mldataset.exp_status, mldataset.views,mldataset.context,mldataset.dashboard,mldataset.archival_config,"
			+ "mldataset.taskdetails "

			+ "from mldataset JOIN  mlgroupmodel ON mldataset.name = mlgroupmodel.entity "
			+ "AND mldataset.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'dataset' where mlgroupmodel.organization = :org "
			+ "AND mldataset.interfacetype = :interfacetype "
			+ "AND mlgroupmodel.model_group = :group ORDER BY mldataset.name", nativeQuery = true)
	List<ICIPDataset> findByOrganizationByGroupsByInterfacetype(@Param("org") String organization, @Param("group") String groupName, @Param("interfacetype") String interfacetype,
			Pageable pageable);

	/**
	 * Find by experiments flag.
	 *
	 * @param org the org
	 * @return the list
	 */
	@Query(value = "SELECT * FROM mldataset WHERE mldataset.organization = :org AND mldataset.exp_status IN (3,4)", nativeQuery = true)
	List<ICIPDataset> findByExp(@Param("org") String org);

	/**
	 * Find by organization by groups and search.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param search       the search
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "select mldataset.id,mldataset.name,mldataset.description,mldataset.alias,mldataset.lastmodifieddate,mldataset.lastmodifiedby,mldataset.tags, "
			+ "mldataset.dataset_schema, mldataset.attributes, mldataset.archival_config, mldataset.datasource, mldataset.backing_dataset, mldataset.exp_status,mldataset.is_archival_enabled,"
			+ "mldataset.organization, mldataset.type, mldataset.exp_status, mldataset.views, mldataset.metadata,mldataset.modeltype,mldataset.taskdetails,"
			+ "mldataset.is_approval_required,mldataset.is_permission_managed,mldataset.is_audit_required,mldataset.is_inbox_required,mldataset.context,mldataset.dashboard,mldataset.archival_config "
			+ "from mldataset JOIN  mlgroupmodel ON mldataset.name = mlgroupmodel.entity "
			+ "AND mldataset.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'dataset' where mlgroupmodel.organization = :org "
			+ "AND mldataset.interfacetype = :interfacetype "
			+ "AND mlgroupmodel.model_group = :group AND mldataset.alias LIKE "
			+ "CONCAT('%',:search,'%') ORDER BY mldataset.alias", nativeQuery = true)
	List<ICIPDataset> findByOrganizationByGroupsAndSearch(@Param("org") String organization,
			@Param("group") String groupName,@Param("interfacetype") String interfacetype, @Param("search") String search, Pageable pageable);

	/**
	 * Gets the dataset len by group and org.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the dataset len by group and org
	 */
	@Query(value = "select COUNT(mldataset.id) from mldataset JOIN  mlgroupmodel "
			+ "ON mldataset.name = mlgroupmodel.entity " + "AND mldataset.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'dataset' " + "where mlgroupmodel.organization = :org "
			+ "AND mlgroupmodel.model_group = :group", nativeQuery = true)
	Long getDatasetLenByGroupAndOrg(@Param("group") String group, @Param("org") String org);

	/**
	 * Gets the dataset len by group and org and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the dataset len by group and org and search
	 */
	@Query(value = "select COUNT(mldataset.id) from mldataset JOIN  mlgroupmodel "
			+ "ON mldataset.name = mlgroupmodel.entity " + "AND mldataset.organization = mlgroupmodel.organization "
			+ "AND mlgroupmodel.entity_type = 'dataset' " + "where mlgroupmodel.organization = :org "
			+ "AND mlgroupmodel.model_group = :group AND mldataset.alias LIKE CONCAT('%',:search,'%')", nativeQuery = true)
	Long getDatasetLenByGroupAndOrgAndSearch(@Param("group") String group, @Param("org") String org,
			@Param("search") String search);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mldataset where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param organization the organization
	 * @return the name and alias
	 */
	@Query(value = "SELECT  mldataset.name as name,mldataset.alias as alias " + " FROM mldataset JOIN  mlgroupmodel "
			+ " ON mldataset.name = mlgroupmodel.entity " + " AND mlgroupmodel.organization = mldataset.organization "
			+ " AND mlgroupmodel.entity_type = 'dataset' " + " where mldataset.organization = :org "
			+ " AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<NameAndAliasDTO> getNameAndAlias(@Param("group") String group, @Param("org") String organization);

	/**
	 * Gets the views by name and org.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the views by name and org
	 */
	@Query(value = "SELECT * FROM mldataset where mldataset.organization = :org "
			+ " AND mldataset.name = :name", nativeQuery = true)
	ICIPDataset getViewsByNameAndOrg(@Param("name") String name, @Param("org") String org);
	
	@Query(value = "SELECT * FROM mldataset ss WHERE ss.organization = :org AND ss.alias = :datasetName",nativeQuery=true)
	ICIPDataset getDatasetByOrgAndAlias(@Param("datasetName")String datasetName, @Param("org")String org);
	
	@Query(value = "SELECT * FROM  mldataset WHERE interfacetype IS NULL AND mldataset.organization = :org ORDER BY lastmodifieddate DESC", nativeQuery = true)
	List<ICIPDataset> findByOrganization(@Param("org")String fromProjectId, Pageable pageable);
	
	@Query(value = "select * from mldataset  "
			+ "where (mldataset.alias LIKE CONCAT('%',:search,'%') OR mldataset.name LIKE CONCAT('%',:search,'%')) and mldataset.organization = :org and mldataset.interfacetype IS NULL", nativeQuery = true)
	List<ICIPDataset> findByOrganization(@Param("org")String fromProjectId,@Param("search") String search, Pageable pageable);
	
	@Query(value = "select * from mldataset  "
			+ "where mldataset.alias LIKE CONCAT('%',:search,'%')and mldataset.interfacetype = 'template' and mldataset.organization = :org ORDER BY lastmodifieddate DESC", nativeQuery = true)
	List<ICIPDataset> findByOrganizationWithTemplate(@Param("org")String fromProjectId,@Param("search") String search, Pageable pageable);
	
	@Query(value="SELECT COUNT(*) FROM mldataset d1 WHERE interfacetype IS NULL AND"
			+ " d1.organization = :project AND"
			+ " (:query1 IS NULL OR d1.alias like CONCAT('%', :query1, '%'))",nativeQuery = true)
	Long getAllDatasetsCountByOrg(@Param("project") String project,@Param("query1") String query);
	
	@Query(value="SELECT COUNT(*) FROM mldataset d1 WHERE interfacetype ='template' AND"
			+ " d1.organization = :project AND"
			+ " (:query1 IS NULL OR d1.alias like CONCAT('%', :query1, '%'))",nativeQuery = true)
	Long getAllDatasetsCountByOrgAndTemplate(@Param("project") String project,@Param("query1") String query);
	
	@Query(value="SELECT COUNT(*) FROM mldataset  "
			+ "WHERE (:query IS NULL OR mldataset.alias like CONCAT('%', :query, '%')) AND mldataset.organization = :project AND mldataset.datasource = :datasource",nativeQuery = true)
			Long getAllDatasetsCountByOrgAndDatasource(@Param("project") String project,@Param("query") String query,@Param("datasource") String datasource);
	
	@Query(value="SELECT * FROM mldataset  WHERE mldataset.organization = :project AND mldataset.datasource = :datasource ",nativeQuery = true)
	List<ICIPDataset> getAllDatasetsByDatasource(@Param("project") String project,@Param("datasource") String datasource,Pageable paginate);

	@Query(value="SELECT * FROM mldataset " 
			+ "WHERE mldataset.alias LIKE CONCAT('%',:search,'%') AND mldataset.organization = :project AND mldataset.datasource = :datasource",nativeQuery = true)
	List<ICIPDataset> getAllDatasetsByDatasourceAndSearch(@Param("project") String project,@Param("datasource") String datasource,@Param("search") String search,Pageable paginate);
	
	@Query(value="SELECT name,alias FROM mldataset  WHERE mldataset.organization = :project AND mldataset.datasource = :datasource ",nativeQuery = true)
	List<NameAndAliasDTO> findByOrganizationAndDatasource(@Param("project") String project, @Param("datasource") String datasource);
	
	@Query(value="SELECT name,alias FROM mldataset  WHERE mldataset.isInboxRequired = :isInboxRequired AND mldataset.project = :project ",nativeQuery = true)
	List<NameAndAliasDTO> findByOrganizationAndIsInboxRequired(@Param("isInboxRequired") String isInboxRequired, @Param("project") String project);
	
	@Query(value="SELECT * FROM mldataset  WHERE mldataset.organization = :project AND mldataset.views = :views ",nativeQuery = true)
	List<ICIPDataset> getDatasetsByOrgandViews(@Param("project") String project, @Param("views") String views);
	
	@Query(value="SELECT * FROM mldataset WHERE mldataset.organization = :org "
			+ "AND views IN (:datasourceType)",nativeQuery = true)
	List<ICIPDataset> getDocByDatasourceType(@Param("datasourceType") List<String> datasourceType, @Param("org") String org, Pageable pageable);
	
	@Query(value="SELECT count(*) FROM mldataset WHERE mldataset.organization = :org "
			+ "AND views IN (:datasourceType)",nativeQuery = true)
	Long getCountByDatasourceType(@Param("datasourceType") List<String> datasourceType, @Param("org") String org);
		
	@Query("SELECT COUNT(DISTINCT d1) " +
		       "FROM ICIPDataset d1 " +
		       "WHERE d1.interfacetype IS NULL " +
		       "AND d1.organization = :organization " +
		       "AND (:aliasOrName IS NULL OR d1.alias LIKE CONCAT('%', :aliasOrName, '%') OR d1.name LIKE CONCAT('%', :aliasOrName, '%')) " +
		       "AND (:types IS NULL OR d1.datasource.type IN :types)")
		Long getDatasetsCountForAdvancedFilterTypes(@Param("organization") String organization, 
		                 @Param("aliasOrName") String aliasOrName,
		                 @Param("types") List<String> types);
	
	@Query("SELECT COUNT(DISTINCT d1) " +
		       "FROM ICIPDataset d1 " +
		       "JOIN ICIPDatasetTopic d2 ON d2.datasetid = d1.name " +
		       "WHERE d1.interfacetype IS NULL " +
		       "AND d1.organization = :organization " +
		       "AND d2.organization = :organization " +
		       "AND d2.status = 'COMPLETED' " +
		       "AND (:aliasOrName IS NULL OR d1.alias LIKE CONCAT('%', :aliasOrName, '%') OR d1.name LIKE CONCAT('%', :aliasOrName, '%')) " +
		       "AND (:knowledgeBases IS NULL OR d2.topicname.topicname IN :knowledgeBases) AND (:types IS NULL OR d1.datasource.type IN :types)")
		Long getDatasetsCountForAdvancedFilterTypesAndKnowledgeBases(@Param("organization") String organization, 
		                 @Param("aliasOrName") String aliasOrName,
		                 @Param("types") List<String> types,
		                 @Param("knowledgeBases") List<String> knowledgeBases);
	
	@Query("SELECT DISTINCT d1 " +
		       "FROM ICIPDataset d1 " +
		       "WHERE d1.interfacetype IS NULL " +
		       "AND d1.organization = :organization " +
		       "AND (:aliasOrName IS NULL OR d1.alias LIKE CONCAT('%', :aliasOrName, '%') OR d1.name LIKE CONCAT('%', :aliasOrName, '%')) " +
		       "AND (:types IS NULL OR d1.datasource.type IN :types) ORDER BY d1.lastmodifieddate DESC")
		List<ICIPDataset> getDatasetsForAdvancedFilterTypes(@Param("organization") String organization, 
		                 @Param("aliasOrName") String aliasOrName,
		                 @Param("types") List<String> types);
	
	@Query("SELECT DISTINCT d1 " +
		       "FROM ICIPDataset d1 " +
		       "JOIN ICIPDatasetTopic d2 ON d2.datasetid = d1.name " +
		       "WHERE d1.interfacetype IS NULL " +
		       "AND d1.organization = :organization " +
		       "AND d2.organization = :organization " +
		       "AND d2.status = 'COMPLETED' " +
		       "AND (:aliasOrName IS NULL OR d1.alias LIKE CONCAT('%', :aliasOrName, '%') OR d1.name LIKE CONCAT('%', :aliasOrName, '%')) " +
		       "AND (:knowledgeBases IS NULL OR d2.topicname.topicname IN :knowledgeBases) AND (:types IS NULL OR d1.datasource.type IN :types) ORDER BY d1.lastmodifieddate DESC")
	List<ICIPDataset> getDatasetsForAdvancedFilterTypesAndKnowledgeBases(@Param("organization") String organization, 
		                 @Param("aliasOrName") String aliasOrName,
		                 @Param("types") List<String> types,
		                 @Param("knowledgeBases") List<String> knowledgeBases);
	
	@Query("SELECT DISTINCT d1 " +
		       "FROM ICIPDataset d1 " +
		       "WHERE d1.interfacetype IS NULL " +
		       "AND d1.organization = :organization " +
		       "AND (:aliasOrName IS NULL OR d1.alias LIKE CONCAT('%', :aliasOrName, '%') OR d1.name LIKE CONCAT('%', :aliasOrName, '%')) " +
		       "AND (:types IS NULL OR d1.datasource.type IN :types) ORDER BY d1.lastmodifieddate DESC")
		List<ICIPDataset> getDatasetsForAdvancedFilterTypesPageable(@Param("organization") String organization, 
		                 @Param("aliasOrName") String aliasOrName,
		                 @Param("types") List<String> types,
		                 Pageable pageable);
	
	@Query("SELECT DISTINCT d1 " +
		       "FROM ICIPDataset d1 " +
		       "JOIN ICIPDatasetTopic d2 ON d2.datasetid = d1.name " +
		       "WHERE d1.interfacetype IS NULL " +
		       "AND d1.organization = :organization " +
		       "AND d2.organization = :organization " +
		       "AND d2.status = 'COMPLETED' " +
		       "AND (:aliasOrName IS NULL OR d1.alias LIKE CONCAT('%', :aliasOrName, '%') OR d1.name LIKE CONCAT('%', :aliasOrName, '%')) " +
		       "AND (:knowledgeBases IS NULL OR d2.topicname.topicname IN :knowledgeBases) AND (:types IS NULL OR d1.datasource.type IN :types) ORDER BY d1.lastmodifieddate DESC")
	List<ICIPDataset> getDatasetsForAdvancedFilterTypesAndKnowledgeBasesPageable(@Param("organization") String organization, 
		                 @Param("aliasOrName") String aliasOrName,
		                 @Param("types") List<String> types,
		                 @Param("knowledgeBases") List<String> knowledgeBases, 
		                 Pageable pageable);
	
	@Query("SELECT DISTINCT d1.datasource.type " + "FROM ICIPDataset d1 " + "WHERE d1.interfacetype IS NULL "
			+ "AND d1.organization = :organization ")
	List<String> getDatasetTypesForAdvancedFilter(String organization);


}
