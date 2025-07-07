package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;

public interface IICIPMLFederatedModelService {


	  List<ICIPMLFederatedModelDTO>   getAllModelsByOrganisation(String org ,Pageable pageable, String filter);
	  
	  List<ICIPMLFederatedModelDTO>   getAllModelsByAdpateridAndOrganisation(String adapterId,String org,String page, String size);
	 
     ICIPMLFederatedModelDTO  getModelByAdapterIdAndFedId(String adapterId,String fedId, String project);

     ICIPMLFederatedModelDTO  updateModel(ICIPMLFederatedModelDTO fedModeDTO);

	List<ICIPMLFederatedModelDTO> getAllModelsByAdpateridAndOrganisation(String adapterId, String org,
			Pageable pageable, String filter);

	Long getCountOfAllModelsByAdpateridAndOrganisation(String adapterId, String org);

	Long getCountOfAllModelsByOrganisation(String org);

	List<ICIPMLFederatedModelDTO> getAllModelsByAdpateridAndOrganisation(String adapterInstance, String project,
			Pageable paginate,  List<Integer>  tags, String query, String orderBy, String type);

	List<ICIPMLFederatedModelDTO> getAllModelsByOrganisation(String project, Pageable paginate);

	Long getAllModelsCountByAdpateridAndOrganisation(String instance, String project,
			List<Integer> tagList, String query, String orderBy, String type);

	int savemodel(ICIPMLFederatedModel model);

	void updateIsDelModel(ICIPMLFederatedModelDTO modelDto);

	List<ICIPMLFederatedModelDTO> getAllModelsByOrganisation(String org);

	List<ICIPMLFederatedModelDTO> getModelByFedNameAndOrg(String fedName, String org);


     
}


