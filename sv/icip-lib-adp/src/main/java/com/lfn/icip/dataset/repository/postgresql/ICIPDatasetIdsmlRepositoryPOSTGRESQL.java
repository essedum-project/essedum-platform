package com.lfn.icip.dataset.repository.postgresql;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPDatasetIdsml;
import com.lfn.icip.dataset.repository.ICIPDatasetIdsmlRepository;

@Profile("postgresql")
@Repository
public interface ICIPDatasetIdsmlRepositoryPOSTGRESQL extends ICIPDatasetIdsmlRepository{

	@Query(value="SELECT * FROM mldatasetidsml WHERE dataset = :datasetid AND org = :org AND is_chart = TRUE",nativeQuery = true)
	List<ICIPDatasetIdsml> getChartListByDataset(@Param("datasetid")String datasetId, @Param("org")String org);
	
	@Query(value="SELECT * FROM mldatasetidsml WHERE dataset = :datasetid AND chart_name = :chartname",nativeQuery = true)
	ICIPDatasetIdsml getChartIdsmlDataForDataset(@Param("datasetid")String datasetId, @Param("chartname")String chartName);
	
	@Query(value="SELECT * FROM mldatasetidsml WHERE dataset = :datasetid AND recipe_name = :recipename",nativeQuery = true)
	ICIPDatasetIdsml getRecipeIdsmlDataForDataset(@Param("datasetid")String datasetId, @Param("recipename")String recipeName);
}
