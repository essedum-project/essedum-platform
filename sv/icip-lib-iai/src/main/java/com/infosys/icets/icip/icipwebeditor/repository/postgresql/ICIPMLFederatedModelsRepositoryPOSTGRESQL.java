package com.infosys.icets.icip.icipwebeditor.repository.postgresql;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;



@Profile("postgresql")
@Repository
public interface ICIPMLFederatedModelsRepositoryPOSTGRESQL extends ICIPMLFederatedModelsRepository {

	@Query(value="SELECT * FROM mlfederatedmodels WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedmodels WHERE app_org = :org)",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllDistinctModelsByAppOrg(@Param("org")String org,Pageable pageable);
	
	@Query(value="Select * from mlfederatedmodels where app_org = :org and adapter_id =:adapterId  ",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllModelsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId,Pageable pageable );

	@Query(value="SELECT count(mlfederatedmodels.id) FROM mlfederatedmodels WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedmodels WHERE app_org = :org)",nativeQuery = true)
	Long getCountOfAllModelsByAppOrg(@Param("org")String org);
	
	@Query(value="SELECT count(mlfederatedmodels.id) from mlfederatedmodels where app_org = :org and adapter_id =:adapterId  ",nativeQuery = true)
	Long getCountOfAllModelsByAppOrgandAdapterId(@Param("org")String org,@Param("adapterId")String adapterId);
	
	@Query(value="SELECT t1.id, " + "t1.fed_id, " + "t1.adapter_id, " + "t1.app_name, " + "t1.fed_name, "
			+ "t1.fed_org, " + "t1.app_org, " + "t1.status, " + "t1.adapter_alias, " + "t1.created_by, "
			+ "t1.created_on, " + "t1.is_deleted, " + "t1.app_modified_by, " + "t1.fed_modified_by, "
			+ "t1.app_modified_date, " + "t1.fed_modified_date, " + "t1.sync_date, " + "t1.model_type, "
			+ "t1.model_likes, " + "t1.model_metadata, " + "t1.raw_payload, " + "t1.artifacts, " + "t1.container, "
			+ "t1.app_description, " + "t1.fed_description, " + "t1.version, " + "t1.app_status, "
			+ "t1.model_deployment, " + "t2.tag_id, " + "t2.entity_id, " + "t2.entity_type, " + "t2.organization "
			+ "from mlfederatedmodels t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='model'"
			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  t1.model_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ " (  t2.tag_id IN ( :tags)) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE CONCAT('%', :query1, '%')  OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.model_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_description ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') )"
			+ " ORDER BY COALESCE(t1.app_modified_date::timestamp, t1.fed_modified_date ) DESC",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllModelsByAppOrgandAdapterIdWithTag(@Param("project")String project,@Param("tags") List<Integer> tags, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String  adapterInstance,@Param("adaptertype") String type);
	
	@Query(value="SELECT * from mlfederatedmodels t1 WHERE t1.is_deleted = FALSE AND "
			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR  t1.model_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE  CONCAT('%', :query1, '%') OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.model_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_description ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%'))"
			+ " ORDER BY COALESCE(t1.app_modified_date::timestamp, t1.fed_modified_date ) DESC",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllModelsByAppOrgandAdapterIdWithoutTag(@Param("project")String project, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") String adapterInstance,@Param("adaptertype") String type);
	
	@Query(value="SELECT count(*) from mlfederatedmodels t1 inner join mltagsentity t2 on( t1.id=t2.entity_id ) WHERE t2.entity_type='model'"
			+ " AND t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR t1.model_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ " (  t2.tag_id IN ( :tags)) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE CONCAT('%', :query1, '%')  OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.model_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_description ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%') )",nativeQuery = true)
	Long getAllModelsCountByAppOrgandAdapterIdWithTag(@Param("project") String project,@Param("tags") List<Integer> tagList, @Param("query1") String query,
			@Param("adapterinstance")	String instance, @Param("adaptertype")String  type);

   
	@Query(value="SELECT count(*) from mlfederatedmodels t1 WHERE t1.is_deleted = FALSE AND "
			+ " t1.app_org= :project AND (concat('',:adaptertype,'')='notRequired' OR t1.model_type = ANY(string_to_array(:adaptertype, ','))) AND "
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id = ANY(string_to_array(:adapterinstance, ','))) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE  CONCAT('%', :query1, '%') OR t1.raw_payload ILIKE  CONCAT('%', :query1, '%') "
			+ "  OR t1.model_type ILIKE  CONCAT('%', :query1, '%') OR t1.app_description ILIKE  CONCAT('%', :query1, '%') OR t1.app_status ILIKE  CONCAT('%', :query1, '%'))",nativeQuery = true)
	Long getAllModelsCountByAppOrgandAdapterIdWithoutTag(@Param("project")String project,
			@Param("query1") String query,@Param("adapterinstance") String instance,
			@Param("adaptertype") String type);

	@Query(value = "Select * from  mlfederatedmodels t1 WHERE t1.id=:id and t1.app_org=:org ", nativeQuery = true)
	ICIPMLFederatedModel findByIdAndApporg(@Param("id")Integer id, @Param("org")String organization);

	@Query(value = "SELECT * FROM mlfederatedmodels WHERE fed_id IN(SELECT DISTINCT fed_id FROM mlfederatedmodels WHERE app_org = :org and app_name like CONCAT('%',:search,'%')) and app_org = :org", nativeQuery = true)
	List<ICIPMLFederatedModel> getAllDistinctModelsByAppOrg(@Param("org")String organization, @Param("search")String search, Pageable page);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.fed_name=:fedName and t1.app_org=:org ",nativeQuery = true)
	List<ICIPMLFederatedModel> getModelByFedNameAndOrg(@Param("fedName") String fedName,
			@Param("org") String org);

}
