package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;


import org.springframework.data.domain.Pageable;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModelDS;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPDatasourceFilterDTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;

public interface IICIPMLFederatedModelService {


	List<ICIPMLFederatedModelDTO>   getAllModelsByOrganisation(String org ,Pageable pageable, String filter);
	 
	ICIPMLFederatedModelDS  getModelByModelId(int fedId, String project);

    ICIPMLFederatedModelDTO  updateModel(ICIPMLFederatedModelDTO fedModeDTO);

	List<ICIPMLFederatedModelDS> getAllOptionalModelsByOrg(String org, String dataSources, String searchInput, Pageable paginate);

	Long getAllModelsCountByOrganisationOptionals(String org, String dataSources, String searchInput);
	
	public List<ICIPDatasourceFilterDTO> getModelFilters(String org);

	ICIPMLFederatedModel savemodel(ICIPMLFederatedModel model);

	List<ICIPMLFederatedModelDTO> getAllModelsByOrganisation(String org);

	List<ICIPMLFederatedModelDTO> getModelByFedModelNameAndOrg(String fedName, String org);
	
	void deleteModel(int modelId,String organisation);


     
}

