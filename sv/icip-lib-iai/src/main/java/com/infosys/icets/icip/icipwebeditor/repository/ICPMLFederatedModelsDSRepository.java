package com.infosys.icets.icip.icipwebeditor.repository;


import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModelDS;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPDatasourceFilterDTO;

@NoRepositoryBean
public interface ICPMLFederatedModelsDSRepository extends JpaRepository<ICIPMLFederatedModelDS, Integer> {

	
    List<ICIPMLFederatedModelDS> getAllDistinctModelsByOrganisation(@Param("org")String org,Pageable pageable);
    
    @Query(value="Select * from  mlfederatedmodels t1 WHERE t1.data_source=:datasourcename and t1.organisation = :org ",nativeQuery = true)
	List<ICIPMLFederatedModel> findByDatasourceNameAndOrganisaton(@Param("datasourcename") String dataSourceName, @Param("org") String org);

	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.model_name=:modelname and t1.data_source=:datasourcename and t1.organisation = :org ",nativeQuery = true)
	ICIPMLFederatedModel findByDatasourceNameModelNameAndOrganisaton(@Param("modelname") String modelName, @Param("datasourcename") String dataSourceName, @Param("org") String org);
	
	@Query(value="SELECT * from mlfederatedmodels WHERE organisation= :org", nativeQuery=true)
	List<ICIPMLFederatedModelDS> findByOrganisation(@Param("org") String org);
	
	@Query(value="SELECT count(*) from mlfederatedmodels WHERE organisation= :org", nativeQuery=true)
	Long getCountOfAllModelsByOrganisation(@Param("org")String org);

	@Query(value="SELECT * FROM mlfederatedmodels WHERE id IN(SELECT DISTINCT id FROM mlfederatedendpoints WHERE organisation = :org and model_name like CONCAT('%',:search,'%'))",nativeQuery = true)
	List<ICIPMLFederatedModelDS> getAllDistinctModelsByOrganisation(String organization, String search, Pageable page);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.id=:id and t1.organisation=:org ",nativeQuery = true)
	ICIPMLFederatedModelDS findByIdAndOrg(@Param("id")Integer id, @Param("org")String organization);
	
	@Query(value="Select * from  mlfederatedmodels t1 WHERE t1.model_name=:modelName and t1.organisation = :org ",nativeQuery = true)
	List<ICIPMLFederatedModelDS> getModelByModelNameAndOrganisation(@Param("modelName") String fedName,
			@Param("org") String org);	
	
	@Query("SELECT model FROM ICIPMLFederatedModelDS model " +
		       "WHERE model.datasource.organization = :organisation AND " +
		       "(:datasourceNames IS NULL OR model.datasource.name IN :datasourceNames) AND " +
		       "(" +
		       "  :searchValue IS NULL OR " +
		       "  LOWER(model.modelName) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.description) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.version) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.modelType) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.createdBy) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.modifiedBy) LIKE LOWER(CONCAT('%', :searchValue, '%'))" +
		       ")" +
		       "ORDER BY model.modifiedDate DESC")
		Page<ICIPMLFederatedModelDS> findByOrganisationAndOptionalDatasourceNamesAndSearch(
		    @Param("organisation") String organisation,
		    @Param("datasourceNames") List<String> datasourceNames,
		    @Param("searchValue") String searchValue,
		    Pageable pageable
		);


	@Query("SELECT COUNT(model) FROM ICIPMLFederatedModelDS model " +
		       "WHERE model.datasource.organization = :organisation AND " +
		       "(:datasourceNames IS NULL OR model.datasource.name IN :datasourceNames) AND " +
		       "(" +
		       "  :searchValue IS NULL OR " +
		       "  LOWER(model.modelName) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.description) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.version) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.modelType) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.createdBy) LIKE LOWER(CONCAT('%', :searchValue, '%')) OR " +
		       "  LOWER(model.modifiedBy) LIKE LOWER(CONCAT('%', :searchValue, '%'))" +
		       ")")
		Long countByOrganisationAndOptionalDatasourceNamesAndSearch(
		    @Param("organisation") String organisation,
		    @Param("datasourceNames") List<String> datasourceNames,
		    @Param("searchValue") String searchValue
		);

	@Query("SELECT new com.infosys.icets.icip.icipwebeditor.model.dto.ICIPDatasourceFilterDTO(model.datasource.name, model.datasource.alias) " +
		       "FROM ICIPMLFederatedModelDS model " +
		       "WHERE model.datasource.organization = :organisation " +
		       "GROUP BY model.datasource.name, model.datasource.alias")
		List<ICIPDatasourceFilterDTO> findDistinctDatasourceNameAndAliasByOrganisation(
		    @Param("organisation") String organisation
		);



}
