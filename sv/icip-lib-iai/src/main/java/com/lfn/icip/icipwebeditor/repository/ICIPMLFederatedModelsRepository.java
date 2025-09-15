package com.lfn.icip.icipwebeditor.repository;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;

@NoRepositoryBean
public interface ICIPMLFederatedModelsRepository extends JpaRepository<ICIPMLFederatedModel, Integer> {

	
	List<ICIPMLFederatedModel> getAllDistinctModelsByOrganisation(@Param("org")String org,Pageable pageable);
	
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.data_source=:datasourcename and t1.organisation = :org ",nativeQuery = true)
	List<ICIPMLFederatedModel> findByDatasourceNameAndOrganisaton(@Param("datasourcename") String dataSourceName, @Param("org") String org);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.model_name=:modelname and t1.data_source=:datasourcename and t1.organisation = :org ",nativeQuery = true)
	ICIPMLFederatedModel findByDatasourceNameModelNameAndOrganisaton(@Param("modelname") String modelName, @Param("datasourcename") String dataSourceName, @Param("org") String org);
	
	@Query(value="SELECT * from mlfederatedmodels WHERE organisation= :org", nativeQuery=true)
	List<ICIPMLFederatedModel> findByOrganisation(@Param("org") String org);
	
	@Query(value="SELECT count(*) from mlfederatedmodels WHERE organisation= :org", nativeQuery=true)
	Long getCountOfAllModelsByOrganisation(@Param("org")String org);

	@Query(value="SELECT * FROM mlfederatedmodels WHERE id IN(SELECT DISTINCT id FROM mlfederatedendpoints WHERE organisation = :org and model_name like CONCAT('%',:search,'%'))",nativeQuery = true)
	List<ICIPMLFederatedModel> getAllDistinctModelsByOrganisation(String organization, String search, Pageable page);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.id=:id and t1.organisation=:org ",nativeQuery = true)
	ICIPMLFederatedModel findByIdAndOrg(@Param("id")Integer id, @Param("org")String organization);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.model_name=:modelName and t1.organisation = :org ",nativeQuery = true)
	List<ICIPMLFederatedModel> getModelByModelNameAndOrganisation(@Param("modelName") String fedName,
			@Param("org") String org);	
	
	
	@Query("SELECT model FROM ICIPMLFederatedModel model " +
		       "WHERE model.organisation = :organisation AND " +
		       "(:modelNames IS NULL OR model.modelName IN :modelNames) AND " +
		       "(:versions IS NULL OR model.version IN :versions) AND " +
		       "(:modelTypes IS NULL OR model.modelType IN :modelTypes) " +
		       "ORDER BY model.modifiedDate DESC")
		Page<ICIPMLFederatedModel> findByOrganisationAndOptionalParams(
		    @Param("organisation") String organisation,
		    @Param("modelNames") List<String> modelNames,
		    @Param("versions") List<String> versions,
		    @Param("modelTypes") List<String> modelTypes,
		    Pageable pageable
		);

	@Query("SELECT COUNT(model) FROM ICIPMLFederatedModel model " +
		       "WHERE model.organisation = :organisation AND " +
		       "(:modelNames IS NULL OR model.modelName IN :modelNames) AND " +
		       "(:versions IS NULL OR model.version IN :versions) AND " +
		       "(:modelTypes IS NULL OR model.modelType IN :modelTypes)")
		Long countByOrganisationAndOptionalParams(
		    @Param("organisation") String organisation,
		    @Param("modelNames") List<String> modelNames,
		    @Param("versions") List<String> versions,
		    @Param("modelTypes") List<String> modelTypes
		);


}