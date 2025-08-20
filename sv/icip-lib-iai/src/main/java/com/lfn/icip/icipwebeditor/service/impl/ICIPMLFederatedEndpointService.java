package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.icipwebeditor.model.FedEndpointID;
import com.lfn.icip.icipwebeditor.model.FedModelsID;
import com.lfn.icip.icipwebeditor.model.ICIPBinaryFiles;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.model.ICIPNativeScript;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedEndpointRepository;
import com.lfn.icip.icipwebeditor.service.IICIPMLFederatedEndpointService;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchable;


import reactor.core.publisher.Flux;

@Service("endpointservice")
public class ICIPMLFederatedEndpointService implements IICIPMLFederatedEndpointService, IICIPSearchable {

	@Autowired
	private ICIPMLFederatedEndpointRepository mlfedEndpointRepo;
	
	final String TYPE = "ENDPOINT";
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);


	@Override
	public List<ICIPMLFederatedEndpointDTO> getAllEndpointsByOrganisation(String org, Pageable pageable) {
		List<ICIPMLFederatedEndpoint> modeList = mlfedEndpointRepo.getAllDistinctEndpointsByAppOrg(org, pageable);

		List<ICIPMLFederatedEndpointDTO> dtoList = MapEndpointListToDTOList(modeList);
		return dtoList;
	}

	@Override
	public void saveEndpoint(ICIPMLFederatedEndpoint endpoint) {

		endpoint.setLikes(0);
		;
		endpoint.setName(endpoint.getSourceName());
		endpoint.setStatus(endpoint.getSourcestatus());
		mlfedEndpointRepo.save(endpoint);
	}

	@Override
	public List<ICIPMLFederatedEndpointDTO> getAllEndpointsByAdpateridAndOrganisation(String adapterId, String org) {
		List<ICIPMLFederatedEndpoint> modeList = mlfedEndpointRepo.getAllEndpointsByAppOrgandAdapterId(org, adapterId);
		List<ICIPMLFederatedEndpointDTO> dtoList = MapEndpointListToDTOList(modeList);
		return dtoList;
	}

	@Override
	public JSONArray getUniqueEndpoints(String adapterId, String org) {
		List<ICIPMLFederatedEndpointDTO> results = getAllEndpointsByAdpateridAndOrganisation(adapterId, org);
		JSONArray finalArr = new JSONArray();
		for (ICIPMLFederatedEndpointDTO dto : results) {
			JSONObject jsonObj = new JSONObject();
			JSONArray deployedModels = new JSONArray(dto.getDeployedModels());
			if (deployedModels.length() == 0) {
				jsonObj.put("appName", dto.getName());
				jsonObj.put("fedId", dto.getSourceId());
				jsonObj.put("id", dto.getId());
				finalArr.put(jsonObj);
			}
		}
		return finalArr;
	}

	@Override
	public ICIPMLFederatedEndpointDTO getEndpointsByAdapterIdAndFedId(String adapterId, String fedId, String project) {
		FedEndpointID id = new FedEndpointID();
		id.setAdapterId(adapterId);
		id.setSourceId(fedId);
		id.setOrganisation(project);
		try {
			ICIPMLFederatedEndpoint modelObj = mlfedEndpointRepo.findById(id).get();
			return MapEndpointToDTO(modelObj);
		} catch (Exception e) {
			return null;
		}
	}

	@Override
	public ICIPMLFederatedEndpointDTO updateEndpoint(ICIPMLFederatedEndpointDTO fedEndpointDTO) {
		FedEndpointID id = new FedEndpointID();
		id.setAdapterId(fedEndpointDTO.getAdapterId());
		id.setSourceId(fedEndpointDTO.getSourceId());
		id.setOrganisation(fedEndpointDTO.getOrganisation());
		try {
			ICIPMLFederatedEndpoint modelObj = mlfedEndpointRepo.findById(id).get();
			if (fedEndpointDTO.getModifiedBy() != null) {
				modelObj.setModifiedBy(fedEndpointDTO.getModifiedBy());
			}
			modelObj.setModifiedDate(new Timestamp(System.currentTimeMillis()));
			if (fedEndpointDTO.getName() != null) {
				modelObj.setName(fedEndpointDTO.getName());
			}
			if (fedEndpointDTO.getApplication() != null)
				modelObj.setApplication(fedEndpointDTO.getApplication());
			if (fedEndpointDTO.getStatus() != null)
				modelObj.setStatus(fedEndpointDTO.getStatus());
			if (fedEndpointDTO.getSample() != null) {
				modelObj.setSample(fedEndpointDTO.getSample());
			}
			if (fedEndpointDTO.getDescription() != null) {
				modelObj.setDescription(fedEndpointDTO.getDescription());
			}
			if (fedEndpointDTO.getDeployedModels() != null) {
				modelObj.setDeployedModels(fedEndpointDTO.getDeployedModels());
			}
			if (fedEndpointDTO.getRestProvider() != null) {
				modelObj.setRestProvider(fedEndpointDTO.getRestProvider());
			}
			if (fedEndpointDTO.getSwaggerData() != null) {
				modelObj.setSwaggerData(fedEndpointDTO.getSwaggerData());
			}
			ICIPMLFederatedEndpoint mSaveObj = mlfedEndpointRepo.save(modelObj);
			return MapEndpointToDTO(mSaveObj);
		} catch (Exception e) {
			return null;
		}

	}
	public String getDeploymentIdByModAndEndpoint(String endpointId,String adapter,String org,String modelId) {
		FedEndpointID id = new FedEndpointID();
		id.setAdapterId(adapter);
		id.setSourceId(endpointId);
		id.setOrganisation(org);
		ICIPMLFederatedEndpoint endpointObj = mlfedEndpointRepo.findById(id).get();
		JSONArray deployModelsDetails = new JSONArray(endpointObj.getDeployedModels());
		List<JSONObject> outputList = new ArrayList<>();
		String deploymentId = null;
		for (int i = 0; i < deployModelsDetails.length(); i++) {
			JSONObject inputObject = deployModelsDetails.getJSONObject(i);
			JSONObject outputObject = new JSONObject();
			outputObject.put("modelId", inputObject.getString("modelId"));
			outputObject.put("deploymentId", inputObject.getString("deploymentId"));
			outputList.add(outputObject);
		}
		if(outputList.size()>0) {
			for(JSONObject a : outputList) {
				if(a.getString("modelId").equalsIgnoreCase(modelId)) {
					deploymentId = a.getString("deploymentId");
					break;
				}
			}
		}
		return deploymentId;
	}
	
	@Override
	public List<ICIPMLFederatedEndpointDTO> getAllEndpointsByOrganisation(String org){
		List<ICIPMLFederatedEndpoint> endList = mlfedEndpointRepo.findByAppOrg(org);
		List<ICIPMLFederatedEndpointDTO> dtoList = MapEndpointListToDTOList(endList);
		return dtoList;
	}
	
	@Override
	public void updateIsDelEndpoint(ICIPMLFederatedEndpointDTO fedEndpointDTO) {
		FedEndpointID id = new FedEndpointID();
		id.setAdapterId(fedEndpointDTO.getAdapterId());
		id.setSourceId(fedEndpointDTO.getSourceId());
		id.setOrganisation(fedEndpointDTO.getOrganisation());
		ICIPMLFederatedEndpoint modelObj = mlfedEndpointRepo.findById(id).get();
		modelObj.setIsDeleted(true);
		mlfedEndpointRepo.save(modelObj);
	}

	public void updateIsDelEndpointByFedid(List<ICIPMLFederatedEndpoint> modeList) {
		modeList.forEach(m -> {

			if(m.getIsDeleted() != null && m.getIsDeleted()==true) {
				FedEndpointID fedEndpointId = m.getSourceEndpointId();
				// fedEndIdObj = new JSONObject(fedEndpointId);
				String fedId = fedEndpointId.getSourceId();
				List<ICIPMLFederatedEndpoint> endpointListByFedId = new ArrayList<>();
				endpointListByFedId = mlfedEndpointRepo.getAllEndpointsByFedid(fedId);
				endpointListByFedId.forEach(e -> {
					if (e.getIsDeleted() == false) {
						e.setIsDeleted(true);
						mlfedEndpointRepo.save(e);
					}
				});
			}
		});

	}

	private List<ICIPMLFederatedEndpointDTO> MapEndpointListToDTOList(List<ICIPMLFederatedEndpoint> modeList) {
		List<ICIPMLFederatedEndpointDTO> dtoList = new ArrayList<>();
		modeList.forEach(m -> {
			ICIPMLFederatedEndpointDTO dtoObject = new ICIPMLFederatedEndpointDTO();

				dtoObject.setId(m.getId());
				dtoObject.setAdapterId(m.getSourceEndpointId().getAdapterId());
				dtoObject.setModifiedBy(m.getModifiedBy() != null ? m.getModifiedBy() : "");
				dtoObject.setSourceId(m.getSourceEndpointId().getSourceId());
				dtoObject.setModifiedDate(m.getModifiedDate());
				dtoObject.setName(m.getName() != null ? m.getName() : "");
				dtoObject.setOrganisation(m.getSourceEndpointId().getOrganisation());
				dtoObject.setCreatedOn(m.getCreatedOn());
				dtoObject.setSourceModifiedBy(m.getSourceModifiedBy());
				dtoObject.setSourceModifiedDate(m.getSourceModifiedDate());
				dtoObject.setSourceName(m.getSourceName());
				dtoObject.setSourceOrg(m.getSourceOrg());
				dtoObject.setStatus(m.getStatus());
				dtoObject.setStatus(m.getStatus());
				dtoObject.setSyncDate(m.getSyncDate());
				dtoObject.setCreatedBy(m.getCreatedBy());
				dtoObject.setType(m.getType());
				dtoObject.setLikes(m.getLikes());
				dtoObject.setMetadata(m.getMetadata());
				dtoObject.setAdapter(m.getAdapter());
				dtoObject.setContextUri(m.getContextUri());
				dtoObject.setDeployedModels(m.getDeployedModels());
				dtoObject.setApplication(m.getApplication()==null?"":m.getApplication());
				dtoObject.setStatus(m.getStatus()==null?"":m.getStatus());
				dtoObject.setSample(m.getSample()==null?"":m.getSample());
				dtoObject.setDescription(m.getDescription()==null?"":m.getDescription());
				dtoObject.setRestProvider(m.getRestProvider()==null?"":m.getRestProvider());
				dtoObject.setSwaggerData(m.getSwaggerData()==null?"":m.getSwaggerData());
				dtoList.add(dtoObject);
		});
		return dtoList;
	}

	private ICIPMLFederatedEndpointDTO MapEndpointToDTO(ICIPMLFederatedEndpoint m) {

		ICIPMLFederatedEndpointDTO dtoObject = new ICIPMLFederatedEndpointDTO();
		dtoObject.setId(m.getId());
		dtoObject.setAdapterId(m.getSourceEndpointId().getAdapterId());
		dtoObject.setModifiedBy(m.getModifiedBy() != null ? m.getModifiedBy() : "");
		dtoObject.setSourceId(m.getSourceEndpointId().getSourceId());
		dtoObject.setModifiedDate(m.getModifiedDate());
		dtoObject.setName(m.getName() != null ? m.getName() : "");
		dtoObject.setOrganisation(m.getSourceEndpointId().getOrganisation());
		dtoObject.setCreatedOn(m.getCreatedOn());
		dtoObject.setSourceModifiedBy(m.getSourceModifiedBy());
		dtoObject.setSourceModifiedDate(m.getSourceModifiedDate());
		dtoObject.setSourceName(m.getSourceName());
		dtoObject.setSourceOrg(m.getSourceOrg());
		dtoObject.setStatus(m.getStatus());
		dtoObject.setStatus(m.getStatus());
		dtoObject.setSyncDate(m.getSyncDate());
		dtoObject.setCreatedBy(m.getCreatedBy());
		dtoObject.setType(m.getType());
		dtoObject.setLikes(m.getLikes());
		dtoObject.setMetadata(m.getMetadata());
		dtoObject.setAdapter(m.getAdapter());
		dtoObject.setContextUri(m.getContextUri());
		dtoObject.setDeployedModels(m.getDeployedModels());
		dtoObject.setApplication(m.getApplication()==null?"":m.getApplication());
		dtoObject.setStatus(m.getStatus()==null?"":m.getStatus());
		dtoObject.setSample(m.getSample()==null?"":m.getSample());
		dtoObject.setDescription(m.getDescription()==null?"":m.getDescription());

		return dtoObject;
	}

	@Override
	public Long getCountOfAllEndpointsByAdpateridAndOrganisation(String adapterId, String org) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long getCountOfAllEnpointsByOrganisation(String org) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override

	public List<ICIPMLFederatedEndpointDTO> getAllEndpointsByAdpateridAndOrganisation(String adapterInstance,
			String project, Pageable paginate, List<Integer> tagList, String query, String orderBy, String type) {
		List<ICIPMLFederatedEndpoint> modeList = new ArrayList<>();
		List<String> adapterInstanceList = new ArrayList<>();
		if (adapterInstance != null) {
			adapterInstanceList = Arrays.asList(adapterInstance.split(","));
		}
		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
//		if (typeList.size() < 1)
//			typeList.add("notRequired");
//		if (adapterInstanceList.size() < 1)
//			adapterInstanceList.add("notRequired");
			if (typeList.size() < 1 || type.equals("undefined")) {
				type = "notRequired";
			}
			if (adapterInstanceList.size() < 1 || adapterInstanceList.equals("undefined")) {
				adapterInstance = "notRequired";
			}
		if (tagList != null) {
			modeList = mlfedEndpointRepo.getAllEndpointsByAppOrgandAdapterIdWithTag(project, tagList, paginate, query,adapterInstance,type);
		} else {
			modeList = mlfedEndpointRepo.getAllEndpointsByAppOrgandAdapterIdWithoutTag(project, paginate,
					query, adapterInstance,type);
			//this.updateIsDelEndpointByFedid(modeList);
//			modeList = mlfedEndpointRepo.getAllEndpointsByAppOrgandAdapterIdWithoutTag(project, paginate, query,
//					adapterInstanceList.size() == 0 ? null : adapterInstanceList,
//					typeList.size() == 0 ? null : typeList);
		}

		List<ICIPMLFederatedEndpointDTO> dtoList = MapEndpointListToDTOList(modeList);
		return dtoList;
	}

	@Override
	public Long getAllModelsCountByAdpateridAndOrganisation(String instance, String project, List<Integer> tagList,
			String query, String orderBy, String type) {
		Long endpointListCount;
		List<String> adapterInstanceList = new ArrayList<>();
		if (instance != null) {
			adapterInstanceList = Arrays.asList(instance.split(","));
		}
		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
//		if (typeList.size() < 1)
//			typeList.add("notRequired");
//		if (adapterInstanceList.size() < 1)
//			adapterInstanceList.add("notRequired");
		if (typeList.size() < 1 || type.equals("undefined")) {
			type = "notRequired";
		}
		if (adapterInstanceList.size() < 1 || adapterInstanceList.equals("undefined")) {
			instance = "notRequired";
		}
		if (tagList != null) {
			endpointListCount = mlfedEndpointRepo.getAllEndpointsCountByAppOrgandAdapterIdWithTag(project, tagList,
					query, instance, type);
		} else {
			endpointListCount = mlfedEndpointRepo.getAllEndpointsCountByAppOrgandAdapterIdWithoutTag(project, query,
					instance, type);
		}

		return endpointListCount;
	}

	@Override
	public Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {

return Flux.just(mlfedEndpointRepo.findByIdAndApporg(id,organization)).defaultIfEmpty(new ICIPMLFederatedEndpoint()).map(s->{
	BaseEntity entity = new BaseEntity();
	entity.setAlias(s.getName());
	entity.setData(new JSONObject(s).toString());
	entity.setDescription(s.getDescription());
	entity.setId(s.getId());
	entity.setType(TYPE);
	return entity;
});
	}

	@Override
	public Flux<BaseEntity> getAllObjectsByOrganization(String organization, String search, Pageable page) {
		try {
		List<ICIPMLFederatedEndpoint> modeList = mlfedEndpointRepo.getAllDistinctEndpointsByAppOrg(organization, search,
				page);
		
		return Flux.fromIterable(modeList).defaultIfEmpty(new ICIPMLFederatedEndpoint()).parallel().map(s -> {
			BaseEntity entity = new BaseEntity();
			entity.setAlias(s.getName());
			entity.setData(new JSONObject(s).toString());
			entity.setDescription(s.getDescription());
			entity.setId(s.getId());
			entity.setType(TYPE);
			return entity;
		}).sequential();
	    } catch (Exception e) {
	        log.error("Error while parsing Endpoints--->", e);
	        return Flux.empty();
	    }
	}
	

	@Override
	public String getType() {
	return TYPE;
	}
	
	public boolean copy(String fromProjectName, String toProjectId) {
		
		List<ICIPMLFederatedEndpoint> endpointList = mlfedEndpointRepo.getAllByOrganisation(fromProjectName);
		endpointList.stream().forEach(endpoint -> {
			ICIPMLFederatedEndpoint end = mlfedEndpointRepo.findByIdAndApporg(endpoint.getId(),fromProjectName);
			try {
			end.setId(null);
			FedEndpointID id = end.getSourceEndpointId();
			id.setOrganisation(toProjectId);
			end.setSourceEndpointId(id);
			mlfedEndpointRepo.save(end);
			}
			catch (Exception e) {
				log.error("Error in MLFederatedEndpoint Copy Blueprint {}", e.getMessage());
				
			}
		});
		return true;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			log.info(marker,"Exporting endpoints started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//			List<ICIPMLFederatedEndpoint> endpoints = mlfedEndpointRepo.getByOrganisation(source);
			List<ICIPMLFederatedEndpoint> endpoints = new ArrayList<>();
			modNames.forEach(alias -> {
				endpoints.add(mlfedEndpointRepo.findByNameAndApporg(alias.toString(), source));
			});
			jsnObj.add("mlfederatedendpoints", gson.toJsonTree(endpoints));
			log.info(marker, "Exported endpoints successfully");
		}
		catch(Exception ex) {
			log.error(marker, "Error in exporting endpoints");
			log.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			log.info(marker, "Importing endpoints started");
			JsonArray fedendPoints = g.fromJson(jsonObject.get("mlfederatedendpoints").toString(), JsonArray.class);
			fedendPoints.forEach(x -> {
				ICIPMLFederatedEndpoint end = g.fromJson(x, ICIPMLFederatedEndpoint.class);
				end.setId(null);
				FedEndpointID id = end.getSourceEndpointId();
				id.setOrganisation(target);
				end.setSourceEndpointId(id);
				try {
					mlfedEndpointRepo.save(end);
				}
				catch(Exception de) {
					log.error(marker, "Error in importing duplicate endpoints {}",end.getName());
				}
			});
			log.info(marker, "Imported endpoints successfully");
		}
		catch(Exception ex) {
			log.error(marker, "Error in importing endpoints");
			log.error(marker, ex.getMessage());
		}
	}
	@Override
	public List<ICIPMLFederatedEndpointDTO> getEndpointByFedNameAndOrg(String fedName, String org) {
		List<ICIPMLFederatedEndpoint> endpointList = new ArrayList();
		
			endpointList = mlfedEndpointRepo.getEndpointByFedNameAndOrg(fedName, org);
	

		List<ICIPMLFederatedEndpointDTO> dtoList = MapEndpointListToDTOList(endpointList);
		return dtoList;
	}

}
