package com.infosys.icets.icip.icipwebeditor.repository.mssql;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.repository.ICPMLFederatedModelsDSRepository;

@Profile("mssql")
@Repository
public interface ICIPMLFederatedModelsRepositoryDSMSSQL extends ICPMLFederatedModelsDSRepository {

}
