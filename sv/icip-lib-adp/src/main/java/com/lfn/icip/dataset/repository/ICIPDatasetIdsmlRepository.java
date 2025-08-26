package com.lfn.icip.dataset.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.icip.dataset.model.ICIPDatasetIdsml;

@NoRepositoryBean
public interface ICIPDatasetIdsmlRepository extends JpaRepository<ICIPDatasetIdsml, Integer>{

	List<ICIPDatasetIdsml> getChartListByDataset(@Param("datasetid")String datasetId, @Param("org")String org);
	
	ICIPDatasetIdsml getChartIdsmlDataForDataset(@Param("datasetid")String datasetId, @Param("chartname")String chartName);
	
	ICIPDatasetIdsml getRecipeIdsmlDataForDataset(@Param("datasetid")String datasetId, @Param("recipename")String recipeName);

}

