package com.lfn.icip.icipwebeditor.repository.postgresql;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;



@Profile("postgresql")
@Repository
public interface ICIPMLFederatedModelsRepositoryPOSTGRESQL extends ICIPMLFederatedModelsRepository {

}
