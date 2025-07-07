package com.infosys.icets.icip.icipwebeditor.repository.mysql;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPImageSaving;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPImageSavingRepository;

@Profile("mysql")
@Repository
public interface ICIPImageSavingRepositoryMYSQL extends ICIPImageSavingRepository {
	
	@Query(value = "Select * from mlappimage where app_name =:name and organization = :org", nativeQuery = true)
	ICIPImageSaving getByNameAndOrg(@Param("name") String name, @Param("org") String org);

}
