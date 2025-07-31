package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.repository.ICPMLFederatedModelsDSRepository;

@Profile("postgresql")
@Repository
public interface ICIPMLFederatedModelsRepositoryDSPOSTGRESQL extends ICPMLFederatedModelsDSRepository {

}
