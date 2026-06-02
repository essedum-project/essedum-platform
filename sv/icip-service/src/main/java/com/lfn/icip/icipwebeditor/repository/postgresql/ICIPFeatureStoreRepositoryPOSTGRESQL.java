package com.lfn.icip.icipwebeditor.repository.postgresql;

import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPFeatureStore;
import com.lfn.icip.icipwebeditor.repository.ICIPFeatureStoreRepository;

@Profile("postgresql")
@Repository
public interface ICIPFeatureStoreRepositoryPOSTGRESQL extends ICIPFeatureStoreRepository{

	@Query(value = "SELECT * FROM mlfeaturestore", nativeQuery = true)
	List<ICIPFeatureStore> getAllFeatureStoreList();
	
	@Query(value="SELECT * from mlfeaturestore t1 WHERE "
			+ " t1.app_org= :project AND t1.is_deleted = FALSE AND"
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id in (:adapterinstance)) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE  CONCAT('%', :query1, '%'))",nativeQuery = true)
	List<ICIPFeatureStore> getAllStoreByAppOrgandAdapterIdWithoutTag(@Param("project")String project, Pageable paginate,
			@Param("query1") String query, @Param("adapterinstance") List<String> adapterInstance);
	
	@Query(value="SELECT count(*) from mlfeaturestore t1 WHERE "
			+ " t1.app_org= :project AND t1.is_deleted = FALSE AND"
			+ "(concat('',:adapterinstance,'')='notRequired' OR t1.adapter_id in (:adapterinstance)) AND"
			+ "  (:query1 IS NULL OR t1.app_name ILIKE  CONCAT('%', :query1, '%'))",nativeQuery = true)
	Long getAllStoreCountByAppOrgandAdapterIdWithoutTag(@Param("project")String project,
			@Param("query1") String query,@Param("adapterinstance") List<String> instance);
	
	@Query(value = "SELECT * FROM mlfeaturestore WHERE fed_name IN(SELECT DISTINCT fed_name FROM mlfeaturestore WHERE app_org = :org and app_name like CONCAT('%',:search,'%')) and app_org = :org and is_deleted= FALSE", nativeQuery = true)
	List<ICIPFeatureStore> getAllDistinctStoresByAppOrg(@Param("org")String organization,@Param("search")String search);
	
	@Query(value = "SELECT * FROM mlfeaturestore WHERE fed_name IN(SELECT DISTINCT fed_name FROM mlfeaturestore WHERE app_org = :org and app_name like CONCAT('%',:search,'%')) and app_org = :org and is_deleted= FALSE", nativeQuery = true)
	List<ICIPFeatureStore> getAllDistinctStoresByAppOrg(@Param("org")String organization,@Param("search")String search,Pageable page);
	
	@Query(value="Select * from  mlfeaturestore t1 WHERE t1.id=:id and t1.app_org=:org ",nativeQuery = true)
	ICIPFeatureStore findByIdAndApporg(@Param("id")Integer id, @Param("org")String organization);
}
