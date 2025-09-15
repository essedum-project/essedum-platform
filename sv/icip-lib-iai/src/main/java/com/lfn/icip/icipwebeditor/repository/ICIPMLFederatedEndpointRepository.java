package com.lfn.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.icip.icipwebeditor.model.FedEndpointID;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;

@NoRepositoryBean
public interface ICIPMLFederatedEndpointRepository extends JpaRepository<ICIPMLFederatedEndpoint, FedEndpointID> {

	@Query(value="SELECT * FROM mlfederatedendpoints WHERE fed_id = :fedId",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByFedid(@Param("fedId")String fedId);
	
	@Query(value="SELECT * FROM mlfederatedendpoints WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedendpoints WHERE app_org = :org)",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllDistinctEndpointsByAppOrg(@Param("org")String org, Pageable pageable);
	
	@Query(value="SELECT * from mlfederatedendpoints WHERE app_org= :org", nativeQuery=true)
	List<ICIPMLFederatedEndpoint> findByAppOrg(@Param("org") String org);
	
	@Query(value="SELECT * FROM mlfederatedendpoints WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedendpoints WHERE app_org = :org and app_name like CONCAT('%',:search,'%'))",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllDistinctEndpointsByAppOrg(@Param("org")String org,@Param("search") String search,Pageable pageable);
	
	
	
	
	
	@Query(value="Select * from mlfederatedendpoints where app_org = :org and adapter_id =:adapterId  ",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId, Pageable pageable );
	
	@Query(value="Select * from mlfederatedendpoints where app_org = :org and adapter_id =:adapterId  and is_deleted = false",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId );

	Long getCountOfAllDistinctEndpointsByAppOrg(@Param("org")String org);

	Long getCountOfAllEndpointsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId);


//	@Query(value="SELECT * from mlfederatedendpoints t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='endpoint'"
//			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  FIND_IN_SET(t1.endpoint_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR FIND_IN_SET (t1.adapter_id ,:adapterinstance)) AND"
//			+ " (t2.tag_id IN ( :tags)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like CONCAT('%', :query1, '%')  OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.endpoint_type like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%') )",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterIdWithTag(@Param("project")String project,@Param("tags") List<Integer> tags, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype")String type);
	
//	@Query(value="SELECT * from mlfederatedendpoints t1 WHERE "
//			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR FIND_IN_SET(t1.endpoint_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR FIND_IN_SET (t1.adapter_id ,:adapterinstance))) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like  CONCAT('%', :query1, '%') OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.endpoint_type like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%') )",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterIdWithoutTag(@Param("project")String project, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype") String type);
	
//	@Query(value="SELECT * from mlfederatedendpoints t1 WHERE "
//			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR FIND_IN_SET(t1.endpoint_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR FIND_IN_SET (t1.adapter_id ,:adapterinstance)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like  CONCAT('%', :query1, '%') OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.endpoint_type like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%') )",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllEndpointsByAppOrgandAdapterIdWithoutTagAndIsDelAll(@Param("project")String project, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance")String adapterInstance,@Param("adaptertype") String type);
	
//	@Query(value="SELECT count(*) from mlfederatedendpoints t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='endpoint'"
//			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR FIND_IN_SET(t1.endpoint_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR FIND_IN_SET (t1.adapter_id ,:adapterinstance)) AND"
//			+ "  (t2.tag_id IN ( :tags)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like CONCAT('%', :query1, '%')  OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.endpoint_type like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%') )",nativeQuery = true)
	Long getAllEndpointsCountByAppOrgandAdapterIdWithTag(@Param("project") String project,@Param("tags") List<Integer> tagList, @Param("query1") String query,
			@Param("adapterinstance")	String instance, @Param("adaptertype")String type);

//	@Query(value="SELECT count(*) from mlfederatedendpoints t1 WHERE "
//			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR FIND_IN_SET(t1.endpoint_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR FIND_IN_SET (t1.adapter_id ,:adapterinstance)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like  CONCAT('%', :query1, '%') OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.endpoint_type like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%') )",nativeQuery = true)
		Long getAllEndpointsCountByAppOrgandAdapterIdWithoutTag(@Param("project")String project,
			@Param("query1") String query,@Param("adapterinstance") String instance,
			@Param("adaptertype") String type);

	
	
	@Query(value="Select * from  mlfederatedendpoints t1 WHERE t1.id=:id and t1.app_org=:org ",nativeQuery = true)
	ICIPMLFederatedEndpoint findByIdAndApporg(@Param("id")Integer id, @Param("org")String organization);

	@Query(value="SELECT * FROM mlfederatedendpoints WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedendpoints WHERE app_org = :org)",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getByOrganisation(@Param("org")String org);
	@Query(value="SELECT * FROM mlfederatedendpoints t1 where t1.app_org = :org",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getAllByOrganisation(@Param("org")String org);
	
	@Query(value="Select * from  mlfederatedendpoints t1 WHERE t1.app_name=:name and t1.app_org=:org ",nativeQuery = true)
	ICIPMLFederatedEndpoint findByNameAndApporg(@Param("name")String name, @Param("org")String org);
	
	@Query(value="Select * from  mlfederatedendpoints t1 WHERE t1.app_name=:fedName and t1.app_org=:org ",nativeQuery = true)
	List<ICIPMLFederatedEndpoint> getEndpointByFedNameAndOrg(@Param("fedName") String fedName,
			@Param("org") String org);
	@Query(value="Select * from  mlfederatedendpoints t1 WHERE t1.fed_id=:fedId",nativeQuery = true)
	ICIPMLFederatedEndpoint findBySourceId(@Param("fedId") String fedId);
}
