package com.lfn.icip.icipwebeditor.repository.mssql;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;

@Profile("mssql")
@Repository
public interface ICIPMLFederatedModelsRepositoryMSSQL  extends ICIPMLFederatedModelsRepository{

	
}