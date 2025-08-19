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

package com.infosys.icets.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices3DTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPStreamingServicesRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPStreamingServicesRepositoryMYSQL extends ICIPStreamingServicesRepository {

	/**
	 * Gets the by group name and organization.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @return the by group name and organization
	 */
	@Query(value = "select * from mlpipeline join mlgroupmodel on mlgroupmodel.entity = mlpipeline.name "
			+ " where mlpipeline.organization = :organization and "
			+ " mlgroupmodel.model_group=:groupName and mlgroupmodel.entity_type='pipeline'", nativeQuery = true)
	List<ICIPStreamingServices> getByGroupNameAndOrganization(@Param("groupName") String groupName,
			@Param("organization") String organization);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	@Modifying
	@Query(value = "delete from mlpipeline where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String project);
	
	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param organization the organization
	 * @return the name and alias
	 */
	@Query(value = "SELECT  mlpipeline.name as name,mlpipeline.alias as alias "
			+ " FROM mlpipeline JOIN  mlgroupmodel " + " ON mlpipeline.name = mlgroupmodel.entity "
			+ " AND mlgroupmodel.organization = mlpipeline.organization "
			+ " AND mlgroupmodel.entity_type = 'pipeline' " + " where mlpipeline.organization = :org "
			+ " AND mlgroupmodel.model_group = :group", nativeQuery = true)
	List<NameAndAliasDTO> getNameAndAlias(@Param("group") String group,@Param("org") String organization);
	
	/**
	 * Ssgj result len.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(sslj.cid) from (SELECT ss.name, "
			+ "	SUM(CASE WHEN jbs.job_status = 'COMPLETED' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS finished,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'KILLED' OR jbs.job_status = 'CANCELLED') AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS killed,"
			+ "	SUM(CASE WHEN jbs.job_status = 'ERROR' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS error,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'RUNNING' OR jbs.job_status = 'STARTED')  AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS running	 "
			+ "	 FROM mlpipeline ss LEFT JOIN mljobs jbs ON ss.name = jbs.streaming_service"
			+ "	 WHERE ss.organization = :organization AND ss.type<>'Agents' AND "
			+ "	 ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ "    WHERE grp.model_group = :groupName AND grp.entity_type = 'pipeline' "
			+ " AND grp.organization = :organization)	 GROUP BY ss.name) as groupCount		  "
			+ "	 LEFT JOIN mlpipeline sslj on groupCount.name = sslj.name WHERE"
			+ " sslj.deleted = 0 AND sslj.organization = :organization AND sslj.type<>'Agents'", nativeQuery = true)
	Long ssgjResultLen(@Param("groupName") String groupName, @Param("organization") String organization);

	/**
	 * Ssgj search result len.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param search       the search
	 * @return the long
	 */
	@Query(value = "SELECT COUNT(sslj.cid) from (SELECT ss.name, "
			+ "	SUM(CASE WHEN jbs.job_status = 'COMPLETED' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS finished,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'KILLED' OR jbs.job_status = 'CANCELLED') AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS killed,"
			+ "	SUM(CASE WHEN jbs.job_status = 'ERROR' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS error,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'RUNNING' OR jbs.job_status = 'STARTED')  AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS running	 "
			+ "	 FROM mlpipeline ss LEFT JOIN mljobs jbs ON ss.name = jbs.streaming_service"
			+ "	 WHERE ss.organization = :organization AND ss.type<>'Agents' AND "
			+ "	 ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ "    WHERE grp.model_group = :groupName AND grp.entity_type = 'pipeline'"
			+ " AND grp.organization = :organization)	 GROUP BY ss.name) as groupCount		  "
			+ "	 LEFT JOIN mlpipeline sslj on groupCount.name = sslj.name WHERE sslj.deleted = 0 AND"
			+ " sslj.organization = :organization AND sslj.type<>'Agents' AND sslj.name"
			+ " LIKE CONCAT('%',:name,'%')", nativeQuery = true)
	Long ssgjSearchResultLen(@Param("groupName") String groupName, @Param("organization") String organization,
			@Param("name") String search);

	/**
	 * Gets the all pipelines by type and group.
	 *
	 * @param type   the type
	 * @param org    the org
	 * @param group  the group
	 * @param search the search
	 * @return the all pipelines by type and group
	 */
	@Query(value = "SELECT sslj.cid, sslj.name,"
			+ "sslj.interfacetype,sslj.description, sslj.deleted, sslj.type,sslj.organization, sslj.created_date as createdDate, sslj.alias, sslj.lastmodifiedby, sslj.lastmodifieddate,"
			+ "groupCount.finished,groupCount.killed,groupCount.error,groupCount.running from (SELECT ss.name,"
			+ "SUM(CASE WHEN jbs.job_status = 'COMPLETED' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS finished,"
			+ "SUM(CASE WHEN (jbs.job_status = 'KILLED' OR jbs.job_status = 'CANCELLED') AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS killed,"
			+ "SUM(CASE WHEN jbs.job_status = 'ERROR' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS error,"
			+ "SUM(CASE WHEN (jbs.job_status = 'RUNNING' OR jbs.job_status = 'STARTED')  AND jbs.streaming_service = ss.name "
			+ "THEN 1 ELSE 0 END) AS running FROM mlpipeline ss LEFT JOIN mljobs jbs ON ss.name = jbs.streaming_service "
			+ "WHERE ss.organization = :organization AND ss.type<>'Agents' AND ss.type=:type AND ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ "WHERE grp.model_group = :groupName AND grp.entity_type = 'pipeline' AND grp.organization = :organization) "
			+ "GROUP BY ss.name) as groupCount LEFT JOIN mlpipeline sslj on groupCount.name = sslj.name "
			+ "WHERE sslj.deleted = 0 AND sslj.organization = :organization AND sslj.type=:type AND sslj.type<>'Agents' AND sslj.alias LIKE CONCAT('%',:search,'%') "
			+ "ORDER BY sslj.created_date DESC", nativeQuery = true)
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeAndGroup(@Param("type") String type,
			@Param("organization") String org, @Param("groupName") String group, @Param("search") String search);

	/**
	 * Ssgj result.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT sslj.cid, sslj.name,"
			+ "sslj.interfacetype,sslj.description, sslj.deleted, sslj.type,sslj.organization, sslj.created_date as createdDate, sslj.alias, sslj.lastmodifiedby, sslj.lastmodifieddate,"
			+ " groupCount.finished,groupCount.killed,groupCount.error,groupCount.running from (SELECT ss.name,"
			+ "	SUM(CASE WHEN jbs.job_status = 'COMPLETED' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS finished,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'KILLED' OR jbs.job_status = 'CANCELLED') AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS killed,"
			+ "	SUM(CASE WHEN jbs.job_status = 'ERROR' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS error,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'RUNNING' OR jbs.job_status = 'STARTED')  AND jbs.streaming_service = ss.name"
			+ " THEN 1 ELSE 0 END) AS running FROM mlpipeline ss LEFT JOIN mljobs jbs ON ss.name = jbs.streaming_service"
			+ "	WHERE ss.organization = :organization AND ss.type<>'Agents' AND ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ " WHERE grp.model_group = :groupName AND grp.entity_type = 'pipeline' AND grp.organization = :organization)"
			+ "	GROUP BY ss.name) as groupCount LEFT JOIN mlpipeline sslj on groupCount.name = sslj.name"
			+ " WHERE sslj.deleted = 0 AND sslj.organization = :organization AND sslj.type<>'Agents' ORDER BY sslj.created_date"
			+ " DESC",nativeQuery = true)
	List<ICIPStreamingServices3DTO> ssgjResult(@Param("groupName") String groupName,
			@Param("organization") String organization, Pageable pageable);
	
	@Query(value = "SELECT sslj.cid, sslj.name,"
			+ "sslj.interfacetype,sslj.description, sslj.deleted, sslj.type,sslj.organization, sslj.created_date as createdDate, sslj.alias, sslj.lastmodifiedby, sslj.lastmodifieddate,"
			+ " groupCount.finished,groupCount.killed,groupCount.error,groupCount.running from (SELECT ss.name,"
			+ "	SUM(CASE WHEN jbs.job_status = 'COMPLETED' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS finished,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'KILLED' OR jbs.job_status = 'CANCELLED') AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS killed,"
			+ "	SUM(CASE WHEN jbs.job_status = 'ERROR' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS error,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'RUNNING' OR jbs.job_status = 'STARTED')  AND jbs.streaming_service = ss.name"
			+ " THEN 1 ELSE 0 END) AS running FROM mlpipeline ss LEFT JOIN mljobs jbs ON ss.name = jbs.streaming_service"
			+ "	WHERE ss.organization = :organization AND ss.interfacetype=:interfacetype AND ss.type<>'Agents' AND ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ " WHERE grp.model_group = :groupName AND grp.entity_type = 'pipeline' AND grp.organization = :organization)"
			+ "	GROUP BY ss.name) as groupCount LEFT JOIN mlpipeline sslj on groupCount.name = sslj.name"
			+ " WHERE sslj.deleted = 0 AND sslj.organization = :organization AND sslj.type<>'Agents' ORDER BY sslj.created_date"
			+ " DESC",nativeQuery = true)
	List<ICIPStreamingServices3DTO> ssgjTemplateResult(@Param("groupName") String groupName,
			@Param("organization") String organization,@Param("interfacetype") String interfacetype, Pageable pageable);

	/**
	 * Ssgj search result.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param search       the search
	 * @param pageable the pageable
	 * @return the list
	 */
	@Query(value = "SELECT sslj.cid, sslj.name,"
			+ "sslj.interfacetype,sslj.description, sslj.deleted, sslj.type,sslj.organization, sslj.created_date as createdDate, sslj.alias, sslj.lastmodifiedby, sslj.lastmodifieddate,"
			+ " groupCount.finished,groupCount.killed,groupCount.error,groupCount.running from (SELECT ss.name,"
			+ "	SUM(CASE WHEN jbs.job_status = 'COMPLETED' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS finished,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'KILLED' OR jbs.job_status = 'CANCELLED') AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS killed,"
			+ "	SUM(CASE WHEN jbs.job_status = 'ERROR' AND jbs.streaming_service = ss.name THEN 1 ELSE 0 END) AS error,"
			+ "	SUM(CASE WHEN (jbs.job_status = 'RUNNING' OR jbs.job_status = 'STARTED')  AND jbs.streaming_service = ss.name"
			+ " THEN 1 ELSE 0 END) AS running FROM mlpipeline ss LEFT JOIN mljobs jbs ON ss.name = jbs.streaming_service"
			+ "	WHERE ss.organization = :organization AND ss.type<>'Agents' AND ss.name IN (SELECT DISTINCT(entity) FROM mlgroupmodel grp "
			+ " WHERE grp.model_group = :groupName AND grp.entity_type = 'pipeline' AND grp.organization = :organization)"
			+ "	GROUP BY ss.name) as groupCount LEFT JOIN mlpipeline sslj on groupCount.name = sslj.name"
			+ " WHERE sslj.deleted = 0 AND sslj.organization = :organization AND sslj.type<>'Agents' AND sslj.alias LIKE CONCAT('%',:name,'%')"
			+ " ORDER BY sslj.created_date DESC",nativeQuery = true)
	List<ICIPStreamingServices3DTO> ssgjSearchResult(@Param("groupName") String groupName,
			@Param("organization") String organization, @Param("name") String search, Pageable pageable);
	
	/**
	 * Gets the list of type of pipelines.
	 * @param organization the organization
	 * @return the types by organization
	 */
	@Query(value = "SELECT DISTINCT mlpipeline.type FROM mlpipeline WHERE mlpipeline.organization = :organization", nativeQuery = true)
	List<String> getPipelinesTypeByOrganization(@Param("organization") String organization);
	
	@Query(value="SELECT * from mlpipeline p1 WHERE "
            + "(concat('',:type,'')='notRequired' OR FIND_IN_SET(p1.type, :type)) AND p1.organization IN (:project) AND p1.interfacetype = :interfacetype AND p1.is_template IS FALSE AND "
            + "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.name) like LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(p1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.description) like  LOWER(CONCAT('%', :query1, '%'))) ORDER BY p1.created_date DESC",nativeQuery = true)
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrg(@Param("project")List<String> project, Pageable paginate,@Param("query1") String query,@Param("type") String type,@Param("interfacetype") String interfacetype);
	
	@Query(value="SELECT * FROM mlpipeline p1 WHERE "
	+"p1.name IN (SELECT p2.name FROM mlapps p2 WHERE (concat('',:type,'')='notRequired' OR FIND_IN_SET(p2.scope, :type))) AND p1.organization IN (:project) AND p1.interfacetype = :interfacetype AND p1.is_template IS FALSE AND"
	+ "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.name) like LOWER(CONCAT('%', :query1, '%'))"
	+ "  OR LOWER(p1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.description) like  LOWER(CONCAT('%', :query1, '%'))) ORDER BY p1.lastmodifieddate DESC",nativeQuery = true)
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrgForApps(@Param("project")List<String> project, Pageable paginate,@Param("query1") String query,@Param("type") String type,@Param("interfacetype") String interfacetype);
	
	@Query(value="SELECT t1.* from mlpipeline  t1 inner join mltagsentity t2 on( t1.cid=t2.entity_id ) WHERE t2.entity_type='pipeline' AND " 
			+ "(concat('',:type,'')='notRequired' OR FIND_IN_SET(t1.type, :type)) AND t1.organization IN (:project) AND t1.interfacetype = :interfacetype AND t1.is_template IS FALSE AND "
			+ " (  t2.tag_id IN ( :tags)) AND "
			+ "  (:query1 IS NULL OR LOWER(t1.alias) like LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(t1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(t1.description) like  LOWER(CONCAT('%', :query1, '%'))) ORDER BY t1.created_date DESC",nativeQuery = true)	
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrgWithTag(@Param("project")List<String> project, Pageable paginate,@Param("query1") String query,@Param("tags")List<Integer> tags,@Param("type") String type,@Param("interfacetype") String interfacetype);
	
	@Query(value="SELECT DISTINCT t1.* from mlpipeline  t1 inner join mltagsentity t2 on( t1.cid=t2.entity_id ) WHERE t2.entity_type='apps' AND " 
			+ "(t1.name IN (SELECT t3.name FROM mlapps t3 WHERE (concat('',:type,'')='notRequired' OR FIND_IN_SET(t3.scope, :type)))) AND t1.organization IN (:project) AND t1.interfacetype = :interfacetype AND t1.is_template IS FALSE AND "
			+ " (  t2.tag_id IN ( :tags)) AND "
			+ "  (:query1 IS NULL OR LOWER(t1.alias) like LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(t1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(t1.description) like  LOWER(CONCAT('%', :query1, '%'))) ORDER BY t1.created_date DESC",nativeQuery = true)	
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrgWithTagForApp(@Param("project")List<String> project, Pageable paginate,@Param("query1") String query,@Param("tags")List<Integer> tags,@Param("type") String type,@Param("interfacetype") String interfacetype);
	
	@Query(value="SELECT count(*) from mlpipeline p1 WHERE "
            + "(concat('',:type,'')='notRequired' OR FIND_IN_SET(p1.type, :type)) AND p1.organization IN (:project) AND p1.interfacetype = :interfacetype AND p1.is_template IS FALSE AND "
            + "  (:query1 IS NULL OR LOWER(p1.alias) like  LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(p1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.description) like LOWER(CONCAT('%', :query1, '%')))",nativeQuery = true)
	Long getPipelinesCountByTypeandOrg(@Param("project")List<String> project,@Param("query1") String query,@Param("type") String type,@Param("interfacetype") String interfacetype);
	
	@Query(value="SELECT count(p1.cid) FROM mlpipeline p1 WHERE "
	+"p1.name IN (SELECT p2.name FROM mlapps p2 WHERE (concat('',:type,'')='notRequired' OR FIND_IN_SET(p2.scope, :type))) AND p1.organization IN (:project) AND p1.interfacetype = :interfacetype AND p1.is_template IS FALSE AND"
	+ "  (:query1 IS NULL OR LOWER(p1.alias) like LOWER(CONCAT('%', :query1, '%')) "
	+ "  OR LOWER(p1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.description) like  LOWER(CONCAT('%', :query1, '%'))) ORDER BY p1.lastmodifieddate DESC",nativeQuery = true)
	Long getPipelinesCountByTypeandOrgForApps(@Param("project")List<String> project,@Param("query1") String query,@Param("type") String type,@Param("interfacetype") String interfacetype);

	@Query(value="SELECT count(*) from mlpipeline  t1 inner join mltagsentity t2 on( t1.cid=t2.entity_id ) WHERE t2.entity_type='pipeline' AND " 
			+ "(concat('',:type,'')='notRequired' OR FIND_IN_SET(t1.type, :type)) AND t1.organization IN (:project) AND t1.interfacetype = :interfacetype AND t1.is_template IS FALSE AND "
			+ " (  t2.tag_id IN ( :tags)) AND "
 + "  (:query1 IS NULL OR LOWER(t1.alias) like LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(t1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(t1.description) like  LOWER(CONCAT('%', :query1, '%')))",nativeQuery = true)	
	Long getPipelinesCountByTypeandOrgWithTag(	@Param("project")List<String> project,@Param("query1") String query , @Param("tags")List<Integer> tags,@Param("type") String type,@Param("interfacetype") String interfacetype);
	
	@Query(value="SELECT count(DISTINCT t1.cid) from mlpipeline  t1 inner join mltagsentity t2 on( t1.cid=t2.entity_id ) WHERE t2.entity_type='apps' AND " 
			+ "(t1.name IN (SELECT t3.name FROM mlapps t3 WHERE (concat('',:type,'')='notRequired' OR FIND_IN_SET(t3.scope, :type)))) AND t1.organization IN (:project) AND t1.interfacetype = :interfacetype AND t1.is_template IS FALSE AND "
			+ " (  t2.tag_id IN ( :tags)) AND "
			+ "  (:query1 IS NULL OR LOWER(t1.alias) like LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(t1.type) like  LOWER(CONCAT('%', :query1, '%')) OR LOWER(t1.description) like  LOWER(CONCAT('%', :query1, '%'))) ORDER BY t1.created_date DESC",nativeQuery = true)	           
	Long getPipelinesCountByTypeandOrgWithTagForApps(	@Param("project")List<String> project,@Param("query1") String query , @Param("tags")List<Integer> tags,@Param("type") String type,@Param("interfacetype") String interfacetype);
	
	@Query(value = "Select * from mlpipeline where name =:name and organization = :org", nativeQuery = true)
	ICIPStreamingServices getTemplateByName(@Param("name") String name, @Param("org") String org);
	
	@Query(value="SELECT * from mlpipeline p1 WHERE "
            + "(concat('',:type,'')='notRequired' OR FIND_IN_SET(p1.type, :type)) AND p1.organization= :project AND p1.is_template IS TRUE AND "
            + "  (:query1 IS NULL OR LOWER(p1.alias) like  LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(p1.type) like LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.description) like LOWER(CONCAT('%', :query1, '%'))) ORDER BY p1.created_date DESC",nativeQuery = true)
	List<ICIPStreamingServices2DTO> getAllTemplatesByTypeandOrg(@Param("project")String project, Pageable paginate,@Param("query1") String query,@Param("type") String type);

	@Query(value="SELECT count(*) from mlpipeline p1 WHERE "
            + "(concat('',:type,'')='notRequired' OR FIND_IN_SET(p1.type, :type)) AND p1.organization= :project AND p1.is_template IS TRUE AND "
            + "  (:query1 IS NULL OR LOWER(p1.alias) like  LOWER(CONCAT('%', :query1, '%')) "
            + "  OR LOWER(p1.type) like LOWER(CONCAT('%', :query1, '%')) OR LOWER(p1.description) like LOWER(CONCAT('%', :query1, '%')))",nativeQuery = true)
	Long getTemplatesCountByTypeandOrg(@Param("project")String project,@Param("query1") String query,@Param("type") String type);
	
	@Query(value="SELECT * from mlpipeline p1 WHERE "
			+ "p1.alias like CONCAT('%', :search, '%') AND p1.organization= :org",nativeQuery = true)
	 List<ICIPStreamingServices> findByOrganization(@Param("search")String search, @Param("org")String org,Pageable page);

	@Query(value="SELECT * from mlpipeline p1 WHERE "
			+ "p1.alias like CONCAT('%', :search, '%') AND p1.type='App' AND p1.organization= :org",nativeQuery = true)
	 List<ICIPStreamingServices> findAppByOrganization(@Param("search")String search, @Param("org")String org,Pageable page);


	@Query(value="SELECT * from mlpipeline p1 WHERE p1.name=:name AND p1.organization=:org",nativeQuery = true)
	List<ICIPStreamingServices2DTO> getPipelineByNameAndOrg(@Param("name")String name,@Param("org")String org);
	
}