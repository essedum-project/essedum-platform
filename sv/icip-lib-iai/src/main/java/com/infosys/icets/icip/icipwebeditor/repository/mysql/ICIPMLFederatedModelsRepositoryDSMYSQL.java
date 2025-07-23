package com.infosys.icets.icip.icipwebeditor.repository.mysql;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.repository.ICPMLFederatedModelsDSRepository;

@Profile("mysql")
@Repository
public interface ICIPMLFederatedModelsRepositoryDSMYSQL extends ICPMLFederatedModelsDSRepository {
	

}
