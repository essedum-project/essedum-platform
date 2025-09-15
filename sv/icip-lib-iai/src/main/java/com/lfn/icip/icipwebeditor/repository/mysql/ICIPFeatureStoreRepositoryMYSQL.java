package com.lfn.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.lfn.icip.icipwebeditor.model.ICIPFeatureStore;
import com.lfn.icip.icipwebeditor.repository.ICIPFeatureStoreRepository;

@Profile("mysql")
@Repository
public interface ICIPFeatureStoreRepositoryMYSQL extends ICIPFeatureStoreRepository{

	@Query(value = "SELECT * FROM mlfeaturestore", nativeQuery = true)
	List<ICIPFeatureStore> getAllFeatureStoreList();
}
