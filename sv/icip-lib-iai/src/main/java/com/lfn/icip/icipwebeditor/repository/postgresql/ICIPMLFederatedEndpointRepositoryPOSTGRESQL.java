package com.lfn.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedEndpointRepository;


@Profile("postgresql")
@Repository
public interface ICIPMLFederatedEndpointRepositoryPOSTGRESQL extends ICIPMLFederatedEndpointRepository{

	@Query(value="SELECT * FROM mlfederatedendpoints WHERE fed_id = :fedId",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByFedid(@Param("fedId")String fedId);
	
	@Query(value="SELECT * FROM mlfederatedendpoints WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedendpoints WHERE app_org = :org)",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllDistinctEndpointsByAppOrg(@Param("org")String org, Pageable pageable);
	
	@Query(value="Select * from mlfederatedendpoints where app_org = :org and adapter_id =:adapterId  ",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId ,Pageable pageable);
	
	@Query(value="Select * from mlfederatedendpoints where is_deleted= false and app_org = :org and adapter_id =:adapterId  ",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId );
	
	@Query(value="SELECT COUNT(mlfederatedendpoints.id) FROM mlfederatedendpoints WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedendpoints WHERE app_org = :org)",nativeQuery = true)
	Long getCountOfAllDistinctEndpointsByAppOrg(@Param("org")String org);

	@Query(value="SELECT COUNT(mlfederatedendpoints.id) from mlfederatedendpoints where app_org = :org and adapter_id =:adapterId  ",nativeQuery = true)
	Long getCountOfAllEndpointsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId);
	
	@Query(value="SELECT t1.id, " + "t1.fed_id, " + "t1.adapter_id, " + "t1.app_name, " + "t1.fed_name, "
			+ "t1.fed_org, " + "t1.app_org, " + "t1.status, " + "t1.adapter_alias, " + "t1.created_by, "
			+ "t1.created_on, " + "t1.is_deleted, " + "t1.app_modified_by, " + "t1.fed_modified_by, "
			+ "t1.app_modified_date, " + "t1.fed_modified_date, " + "t1.sync_date, " + "t1.endpoint_type, "
			+ "t1.endpoint_likes, " + "t1.endpoint_metadata, " + "t1.raw_payload, " + "t1.context_uri, " + "t1.app_sample, "
			+ "t1.app_description, " + "t1.deployed_models, " + "t1.app_status, "
			+ "t1.app_application, " + "t2.tag_id, " + "t2.entity_id, " + "t2.entity_type, " + "t2.organization "
			+ "from mlfederatedendpoints t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='endpoint'"
			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR t1.endpoint_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ " (t2.tag_id IN ( :tags)) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE CONCAT('%', :query1, '%')  OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.endpoint_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') )ORDER BY COALESCE(t1.app_modified_date::timestamp, t1.fed_modified_date ) DESC;",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterIdWithTag(@Param("project")String project,@Param("tags") List<Integer> tags, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype")String type);


//	@Query(value="SELECT * from mlfederatedendpoints t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='endpoint'"
//			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR t1.endpoint_type = ANY(string_to_array(:adaptertype, ','))) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
//			+ " (t2.tag_id IN ( :tags)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name ILIKE CONCAT('%', :query1, '%')  OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
//			+ "  OR t1.endpoint_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') ) ORDER BY t1.created_on DESC;",nativeQuery = true)
//	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterIdWithTag(@Param("project")String project,@Param("tags") List<Integer> tags, Pageable paginate,
//			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype")String type);
//	
	@Query(value="SELECT * from mlfederatedendpoints t1 WHERE t1.is_deleted = FALSE AND"
			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  t1.endpoint_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR  t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE  CONCAT('%', :query1, '%') OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.endpoint_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') ) ORDER BY COALESCE(t1.app_modified_date::timestamp, t1.fed_modified_date ) DESC;",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterIdWithoutTag(@Param("project")String project, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype") String type);
	
	@Query(value="SELECT * from mlfederatedendpoints t1 WHERE "
			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  t1.endpoint_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR  t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE  CONCAT('%', :query1, '%') OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.endpoint_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') ) ORDER BY COALESCE(t1.app_modified_date, t1.fed_modified_date ) DESC",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterIdWithoutTagAndIsDelAll(@Param("project")String project, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype") String type);
	
	@Query(value="SELECT count(*) from mlfederatedendpoints t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='endpoint'"
			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR t1.endpoint_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ "  (t2.tag_id IN ( :tags)) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE CONCAT('%', :query1, '%')  OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.endpoint_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') )",nativeQuery = true)
	Long getAllEndpointsCountByAppOrgandAdapterIdWithTag(@Param("project") String project,@Param("tags") List<Integer> tagList, @Param("query1") String query,
			@Param("adapterinstance")	String instance, @Param("adaptertype")String type);

	@Query(value="SELECT count(*) from mlfederatedendpoints t1 WHERE is_deleted=FALSE AND"
			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR t1.endpoint_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR  t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE  CONCAT('%', :query1, '%') OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.endpoint_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') )",nativeQuery = true)
		Long getAllEndpointsCountByAppOrgandAdapterIdWithoutTag(@Param("project")String project,
			@Param("query1") String query,@Param("adapterinstance") String instance,
			@Param("adaptertype") String type);
	@Query(value="SELECT * FROM mlfederatedendpoints WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedendpoints WHERE app_org = :org and app_name like CONCAT('%',:search,'%')) and app_org = :org",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllDistinctEndpointsByAppOrg(@Param("org")String org,@Param("search")String serach,Pageable pageable);
	
	@Query(value="Select * from  mlfederatedendpoints t1 WHERE t1.id=:id and t1.app_org=:org ",nativeQuery = true)
	ICIPMLFederatedEndpoint findByIdAndApporg(@Param("id")String id, @Param("org")String organization);
	
	@Query(value="SELECT * FROM  mlfederatedendpoints t1 WHERE t1.app_name=:fedName and t1.app_org=:org ",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getEndpointByFedNameAndOrg(@Param("fedName") String fedName,
			@Param("org") String org);
	@Query(value="SELECT * FROM  mlfederatedendpoints t1 WHERE t1.fed_id=:fedId",nativeQuery = true)
	ICIPMLFederatedEndpoint findBySourceId(@Param("fedId") String fedId);
}