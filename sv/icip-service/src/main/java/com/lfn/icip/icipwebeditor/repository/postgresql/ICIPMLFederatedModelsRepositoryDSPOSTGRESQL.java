package com.lfn.icip.icipwebeditor.repository.postgresql;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.repository.ICPMLFederatedModelsDSRepository;

@Profile("postgresql")
@Repository
public interface ICIPMLFederatedModelsRepositoryDSPOSTGRESQL extends ICPMLFederatedModelsDSRepository {

}
