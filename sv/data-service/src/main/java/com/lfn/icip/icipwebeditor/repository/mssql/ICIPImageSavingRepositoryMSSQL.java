package com.lfn.icip.icipwebeditor.repository.mssql;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPImageSaving;
import com.lfn.icip.icipwebeditor.repository.ICIPImageSavingRepository;

@Profile("mssql")
@Repository
public interface ICIPImageSavingRepositoryMSSQL extends ICIPImageSavingRepository {
	
	@Query(value = "Select * from mlappimage where app_name =:name and organization = :org", nativeQuery = true)
	ICIPImageSaving getByNameAndOrg(@Param("name") String name, @Param("org") String org);

}
