package com.lfn.icip.icipwebeditor.service;

import java.util.List;

import org.json.JSONArray;
import org.springframework.data.domain.Pageable;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;


public interface IICIPMLFederatedEndpointService {

	 List<ICIPMLFederatedEndpointDTO>   getAllEndpointsByOrganisation(String org,Pageable pageable);
	  
	  List<ICIPMLFederatedEndpointDTO>   getAllEndpointsByOrganisation(String org);
	 
	  List<ICIPMLFederatedEndpointDTO>   getAllEndpointsByAdpateridAndOrganisation(String adapterId,String org);

    ICIPMLFederatedEndpointDTO  getEndpointsByAdapterIdAndFedId(String adapterId,String fedId, String project);

    ICIPMLFederatedEndpointDTO   updateEndpoint(ICIPMLFederatedEndpointDTO fedModeDTO);
 	
	Long getCountOfAllEndpointsByAdpateridAndOrganisation(String adapterId, String org);

	Long getCountOfAllEnpointsByOrganisation(String org);

	JSONArray getUniqueEndpoints(String adapterId, String org);

	List<ICIPMLFederatedEndpointDTO> getAllEndpointsByAdpateridAndOrganisation(String instance, String project,
			Pageable paginate, List<Integer> tagList, String query, String orderBy, String type);

	Long getAllModelsCountByAdpateridAndOrganisation(String instance, String project, List<Integer> tagList,
			String query, String orderBy, String type);



	void saveEndpoint(ICIPMLFederatedEndpoint endpoint);



	void updateIsDelEndpoint(ICIPMLFederatedEndpointDTO endDto);

	List<ICIPMLFederatedEndpointDTO> getEndpointByFedNameAndOrg(String fedName, String org);
	
	
}
