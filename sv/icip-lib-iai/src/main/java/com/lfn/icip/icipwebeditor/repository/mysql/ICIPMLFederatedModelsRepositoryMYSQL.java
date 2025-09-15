package com.lfn.icip.icipwebeditor.repository.mysql;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;

@Profile("mysql")
@Repository
public interface ICIPMLFederatedModelsRepositoryMYSQL extends ICIPMLFederatedModelsRepository {


}
