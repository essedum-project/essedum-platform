package com.lfn.icip.icipwebeditor.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.lfn.icip.icipwebeditor.model.ICIPFeatureStore;
public interface IICIPFeatureStoreService {
	
	List<ICIPFeatureStore> getAllStoreByAdpaterIdAndOrganisation(String adapterInstance, String project,
			Pageable paginate,  List<Integer>  tags, String query, String orderBy, String type);

	Long getStoreCountByAdpateridAndOrganisation(String instance, String project, String query, String orderBy,
			String type);

	void saveStore(ICIPFeatureStore store);
}
