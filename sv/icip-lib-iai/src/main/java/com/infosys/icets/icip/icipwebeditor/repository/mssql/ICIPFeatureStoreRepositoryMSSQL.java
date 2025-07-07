package com.infosys.icets.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.infosys.icets.icip.icipwebeditor.model.ICIPFeatureStore;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPFeatureStoreRepository;

@Profile("mssql")
@Repository
public interface ICIPFeatureStoreRepositoryMSSQL extends ICIPFeatureStoreRepository{

	@Query(value = "SELECT * FROM mlfeaturestore", nativeQuery = true)
	List<ICIPFeatureStore> getAllFeatureStoreList();
}
