package com.infosys.icets.icip.icipwebeditor.repository;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.icip.icipwebeditor.model.FedModelsID;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;

@NoRepositoryBean
public interface ICIPMLFederatedModelsRepository extends JpaRepository<ICIPMLFederatedModel, FedModelsID> {

	
	List<ICIPMLFederatedModel> getAllDistinctModelsByAppOrg(@Param("org")String org,Pageable pageable);
	
	@Query(value="SELECT * from mlfederatedmodels WHERE app_org= :org", nativeQuery=true)
	List<ICIPMLFederatedModel> findByAppOrg(@Param("org") String org);
	
	List<ICIPMLFederatedModel> getAllModelsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId, Pageable pageable );

	Long getCountOfAllModelsByAppOrg(@Param("org")String org);
	Long getCountOfAllModelsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId);
	
//	@Query(value="SELECT * from mlfederatedmodels t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='model'"
//			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  FIND_IN_SET(t1.model_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR FIND_IN_SET (t1.adapter_id,:adapterinstance)) AND"
//			+ " (  t2.tag_id IN ( :tags)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like CONCAT('%', :query1, '%')  OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.model_type like  CONCAT('%', :query1, '%') OR t1.app_description like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%') )",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllModelsByAppOrgandAdapterIdWithTag(@Param("project")String project,@Param("tags") List<Integer> tags, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype") String type);
	
//	@Query(value="SELECT * from mlfederatedmodels t1 WHERE "
//			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  FIND_IN_SET(t1.model_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR  FIND_IN_SET (t1.adapter_id,:adapterinstance)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like  CONCAT('%', :query1, '%') OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.model_type like  CONCAT('%', :query1, '%') OR t1.app_description like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%'))",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllModelsByAppOrgandAdapterIdWithoutTag(@Param("project")String project, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype") String type);
	
//	@Query(value="SELECT count(*) from mlfederatedmodels t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='model'"
//			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  FIND_IN_SET(t1.model_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR FIND_IN_SET (t1.adapter_id,:adapterinstance)) AND"
//			+ " (  t2.tag_id IN ( :tags)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like CONCAT('%', :query1, '%')  OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.model_type like  CONCAT('%', :query1, '%') OR t1.app_description like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%') )",nativeQuery = true)
	Long getAllModelsCountByAppOrgandAdapterIdWithTag(@Param("project") String project,@Param("tags") List<Integer> tagList, @Param("query1") String query,
			@Param("adapterinstance")	String instance, @Param("adaptertype")String  type);

   
//	@Query(value="SELECT count(*) from mlfederatedmodels t1 WHERE "
//			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  FIND_IN_SET(t1.model_type, :adaptertype)) AND "
//			+ "(concat('',:adapterinstance,'')='notRequired' OR  FIND_IN_SET (t1.adapter_id,:adapterinstance)) AND"
//			+ "  (:query1 IS NULL OR t1.app_name like  CONCAT('%', :query1, '%') OR t1.raw_payload like  CONCAT('%', :query1, '%') "
//			+ "  OR t1.model_type like  CONCAT('%', :query1, '%') OR t1.app_description like  CONCAT('%', :query1, '%') OR t1.app_status like  CONCAT('%', :query1, '%'))",nativeQuery = true)
	Long getAllModelsCountByAppOrgandAdapterIdWithoutTag(@Param("project")String project,
			@Param("query1") String query,@Param("adapterinstance") String instance,
			@Param("adaptertype") String type);


	ICIPMLFederatedModel findByIdAndApporg(@Param("id")Integer id, @Param("org")String organization);

	@Query(value="SELECT * FROM mlfederatedmodels WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedendpoints WHERE app_org = :org and app_name like CONCAT('%',:search,'%'))",nativeQuery = true)

	List<ICIPMLFederatedModel> getAllDistinctModelsByAppOrg(String organization, String search, Pageable page);
	@Query(value="SELECT * FROM mlfederatedmodels WHERE fed_id= :modelid",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllModelsById(@Param("modelid") String modelId);
	
	@Query(value="SELECT * FROM mlfederatedmodels WHERE app_org= :org",nativeQuery = true)
	List<ICIPMLFederatedModel> getByOrg(@Param("org")String org);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.id=:id and t1.app_org=:org ",nativeQuery = true)
	ICIPMLFederatedModel findByIdAndOrg(@Param("id")Integer id, @Param("org")String organization);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.app_name=:name and t1.app_org=:org ",nativeQuery = true)
	ICIPMLFederatedModel findByNameAndApporg(@Param("name")String name, @Param("org")String org);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.fed_name=:fedName and t1.app_org=:org ",nativeQuery = true)
	List<ICIPMLFederatedModel> getModelByFedNameAndOrg(@Param("fedName") String fedName,
			@Param("org") String org);
}
