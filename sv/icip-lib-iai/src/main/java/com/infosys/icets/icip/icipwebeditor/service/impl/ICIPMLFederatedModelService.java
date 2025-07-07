package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import javax.print.DocFlavor.STRING;

import org.json.JSONObject;
import org.json.JSONArray;
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
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.icipwebeditor.model.FedModelsID;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPMLFederatedModelService;
import com.infosys.icets.icip.icipwebeditor.v1.dto.BaseEntity;
import com.infosys.icets.icip.icipwebeditor.v1.service.IICIPSearchable;

import reactor.core.publisher.Flux;

@Service("modelservice")
public class ICIPMLFederatedModelService implements IICIPMLFederatedModelService, IICIPSearchable {

	@Autowired
	private ICIPMLFederatedModelsRepository mlfedmodelRepo;

	@Autowired
	private ICIPTaggingServiceImpl taggingService;

	final String TYPE = "MODEL";
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);

	@Override
	public List<ICIPMLFederatedModelDTO> getAllModelsByOrganisation(String org, Pageable pageable, String search) {
		List<ICIPMLFederatedModel> modeList = mlfedmodelRepo.getAllDistinctModelsByAppOrg(org, pageable);

		List<ICIPMLFederatedModelDTO> dtoList = MapModelListToDTOList(modeList);
		return dtoList;
	}

	@Override
	public int savemodel(ICIPMLFederatedModel model) {
		model.setLikes(0);
		model.setName(model.getSourceName());
		model.setDescription(model.getSourceDescription());
		model.setStatus(model.getSourceStatus());
		ICIPMLFederatedModel res = mlfedmodelRepo.save(model);
		Optional<ICIPMLFederatedModel> optionalRes2 = mlfedmodelRepo.findById(res.getSourceModelId());
        if (!optionalRes2.isPresent()) {
            return 0;
        }
        ICIPMLFederatedModel res2 = optionalRes2.get();
		return res2.getId();
		
	}

	private List<ICIPMLFederatedModelDTO> MapModelListToDTOList(List<ICIPMLFederatedModel> modeList) {
		List<ICIPMLFederatedModelDTO> dtoList = new ArrayList<>();
		modeList.forEach(m -> {
			ICIPMLFederatedModelDTO dtoObject = new ICIPMLFederatedModelDTO();
			dtoObject.setId(m.getId());
			dtoObject.setAdapterId(m.getSourceModelId().getAdapterId());
			dtoObject.setDescription(m.getDescription() != null ? m.getDescription() : "");
			dtoObject.setModifiedBy(m.getModifiedBy() != null ? m.getModifiedBy() : "");
			dtoObject.setSourceId(m.getSourceModelId().getSourceId());
			dtoObject.setModifiedDate(m.getModifiedDate());
			dtoObject.setName(m.getName() != null ? m.getName() : "");
			dtoObject.setOrganisation(m.getSourceModelId().getOrganisation());
			dtoObject.setArtifacts(m.getArtifacts());
			dtoObject.setContainer(m.getContainer());
			dtoObject.setCreatedOn(m.getCreatedOn());
			dtoObject.setSourceDescription(m.getSourceDescription());
			dtoObject.setSourceModifiedBy(m.getSourceModifiedBy());
			dtoObject.setSourceModifiedDate(m.getSourceModifiedDate());
			dtoObject.setSourceName(m.getSourceName());
			dtoObject.setSourceOrg(m.getSourceOrg());
			dtoObject.setStatus(m.getStatus());
			dtoObject.setStatus(m.getStatus());
			dtoObject.setSyncDate(m.getSyncDate());
			dtoObject.setVersion(m.getVersion());
			dtoObject.setCreatedBy(m.getCreatedBy());
			dtoObject.setType(m.getType());
			dtoObject.setLikes(m.getLikes());
			dtoObject.setMetadata(m.getMetadata());
			dtoObject.setAdapter(m.getAdapter());
			dtoObject.setDeployment(m.getDeployment() == null ? "" : m.getDeployment());
			dtoObject.setStatus(m.getStatus() != null ? m.getStatus() : "");
			JSONObject mJson = new JSONObject(m);
			dtoObject.setRawPayload(mJson.toString());
			dtoList.add(dtoObject);

		});
		return dtoList;
	}

	private ICIPMLFederatedModelDTO MapModelToDTO(ICIPMLFederatedModel m) {

		ICIPMLFederatedModelDTO dtoObject = new ICIPMLFederatedModelDTO();
		dtoObject.setId(m.getId());
		dtoObject.setAdapterId(m.getSourceModelId().getAdapterId());
		dtoObject.setDescription(m.getDescription());
		dtoObject.setModifiedBy(m.getModifiedBy());
		dtoObject.setSourceId(m.getSourceModelId().getSourceId());
		dtoObject.setModifiedDate(m.getModifiedDate());
		dtoObject.setName(m.getName());
		dtoObject.setOrganisation(m.getSourceModelId().getOrganisation());
		dtoObject.setArtifacts(m.getArtifacts());
		dtoObject.setContainer(m.getContainer());
		dtoObject.setCreatedOn(m.getCreatedOn());
		dtoObject.setSourceDescription(m.getSourceDescription());
		dtoObject.setSourceModifiedBy(m.getSourceModifiedBy());
		dtoObject.setSourceModifiedDate(m.getSourceModifiedDate());
		dtoObject.setSourceName(m.getSourceName());
		dtoObject.setSourceOrg(m.getSourceOrg());
		dtoObject.setSourceStatus(m.getSourceStatus());
		dtoObject.setSourceStatus(m.getSourceStatus());
		dtoObject.setSyncDate(m.getSyncDate());
		dtoObject.setVersion(m.getVersion());
		dtoObject.setCreatedBy(m.getCreatedBy());
		dtoObject.setType(m.getType());
		dtoObject.setLikes(m.getLikes());
		dtoObject.setMetadata(m.getMetadata());
		dtoObject.setAdapter(m.getAdapter());
		dtoObject.setStatus(m.getStatus() != null ? m.getStatus() : "");
		dtoObject.setDeployment(m.getDeployment() == null ? "" : m.getDeployment());

		return dtoObject;
	}

	@Override
	public List<ICIPMLFederatedModelDTO> getAllModelsByAdpateridAndOrganisation(String adapterId, String org,
			Pageable pageable, String search) {
		List<ICIPMLFederatedModel> modeList = mlfedmodelRepo.getAllModelsByAppOrgandAdapterId(org, adapterId, pageable);
		List<ICIPMLFederatedModelDTO> dtoList = MapModelListToDTOList(modeList);
		return dtoList;
	}

	@Override
	public ICIPMLFederatedModelDTO getModelByAdapterIdAndFedId(String adapterId, String fedId, String project) {
		FedModelsID id = new FedModelsID();
		id.setAdapterId(adapterId);
		id.setSourceId(fedId);
		id.setOrganisation(project);
		try {
			ICIPMLFederatedModel modelObj = mlfedmodelRepo.findById(id).get();
			return MapModelToDTO(modelObj);
		} catch (Exception e) {
			return null;
		}
	}

	@Override
	public ICIPMLFederatedModelDTO updateModel(ICIPMLFederatedModelDTO fedModelDTO) {
		FedModelsID id = new FedModelsID();
		id.setAdapterId(fedModelDTO.getAdapterId());
		id.setSourceId(fedModelDTO.getSourceId());
		id.setOrganisation(fedModelDTO.getOrganisation());
		try {
			ICIPMLFederatedModel modelObj = mlfedmodelRepo.findById(id).get();
			if (fedModelDTO.getDescription() != null) {
				modelObj.setDescription(fedModelDTO.getDescription());
			}
			if (fedModelDTO.getModifiedBy() != null)
				modelObj.setModifiedBy(fedModelDTO.getModifiedBy());
			modelObj.setModifiedDate(new Timestamp(System.currentTimeMillis()));
			if (fedModelDTO.getName() != null) {
				modelObj.setName(fedModelDTO.getName());
			}
			modelObj.setStatus(fedModelDTO.getStatus());
			modelObj.setDeployment(fedModelDTO.getDeployment());
			ICIPMLFederatedModel mSaveObj = mlfedmodelRepo.save(modelObj);
			return MapModelToDTO(mSaveObj);
		} catch (Exception e) {
			return null;
		}

	}

	@Override
	public Long getCountOfAllModelsByAdpateridAndOrganisation(String adapterId, String org) {

		return mlfedmodelRepo.getCountOfAllModelsByAppOrgandAdapterId(org, adapterId);

	}

	@Override
	public Long getCountOfAllModelsByOrganisation(String org) {
		return mlfedmodelRepo.getCountOfAllModelsByAppOrg(org);
	}

	@Override
	public List<ICIPMLFederatedModelDTO> getAllModelsByAdpateridAndOrganisation(String adapterId, String org,
			String page, String size) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<ICIPMLFederatedModelDTO> getAllModelsByOrganisation(String project, Pageable paginate) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<ICIPMLFederatedModelDTO> getAllModelsByAdpateridAndOrganisation(String adapterInstance, String project,
			Pageable paginate, List<Integer> tags, String query, String orderBy, String type) {
		List<ICIPMLFederatedModel> modeList = new ArrayList();
		List<String> adapterInstanceList = new ArrayList();
		if (adapterInstance != null) {
			adapterInstanceList = Arrays.asList(adapterInstance.split(","));
		}
		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
		if (typeList.size() < 1 || type.equals("undefined")) {
			type = "notRequired";
		}
		if (adapterInstanceList.size() < 1 || adapterInstanceList.equals("undefined")) {
			adapterInstance = "notRequired";
		}
//		if (typeList.size() < 1)
//			typeList.add("notRequired");
//		if (adapterInstanceList.size() < 1)
//			adapterInstanceList.add("notRequired");

		if (tags != null) {
			modeList = mlfedmodelRepo.getAllModelsByAppOrgandAdapterIdWithTag(project, tags, paginate, query,
					adapterInstance, type);
		} else {
			modeList = mlfedmodelRepo.getAllModelsByAppOrgandAdapterIdWithoutTag(project, paginate, query,
					adapterInstance, type);
		}

		List<ICIPMLFederatedModelDTO> dtoList = MapModelListToDTOList(modeList);
		return dtoList;
	}

	@Override
	public Long getAllModelsCountByAdpateridAndOrganisation(String instance, String project, List<Integer> tagList,
			String query, String orderBy, String type) {
		Long modeListCount;
		List<String> instanceList = new ArrayList();
		if (instance != null) {
			instanceList = Arrays.asList(instance.split(","));
		}
		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
//		if (typeList.size() < 1)
//			typeList.add("notRequired");
//		if (instanceList.size() < 1)
//			instanceList.add("notRequired");
		if (typeList.size() < 1 || type.equals("undefined")) {
			type = "notRequired";
		}
		if (instanceList.size() < 1 || instanceList.equals("undefined")) {
			instance = "notRequired";
		}
		if (tagList != null) {
			modeListCount = mlfedmodelRepo.getAllModelsCountByAppOrgandAdapterIdWithTag(project, tagList, query,
					instance, type);
		} else {
			modeListCount = mlfedmodelRepo.getAllModelsCountByAppOrgandAdapterIdWithoutTag(project, query, instance,
					type);
		}

		return modeListCount;
	}

	public Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {

		return Flux.just(mlfedmodelRepo.findByIdAndApporg(id, organization)).defaultIfEmpty(new ICIPMLFederatedModel())
				.map(s -> {
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
		List<ICIPMLFederatedModel> modeList = mlfedmodelRepo.getAllDistinctModelsByAppOrg(organization, search, page);
		return Flux.fromIterable(modeList).defaultIfEmpty(new ICIPMLFederatedModel()).parallel().map(s -> {
			BaseEntity entity = new BaseEntity();
			entity.setAlias(s.getName());
			entity.setData(new JSONObject(s).toString());
			entity.setDescription(s.getDescription());
			entity.setId(s.getId());
			entity.setType(TYPE);
			return entity;
		}).sequential();
	    } catch (Exception e) {
	        log.error("Error while parsing Models--->", e);
	        return Flux.empty();
	    }
	}

	@Override
	public String getType() {
		return TYPE;
	}
	
	@Override
	public void updateIsDelModel(ICIPMLFederatedModelDTO modelDto) {
		FedModelsID Id = new FedModelsID();
		Id.setAdapterId(modelDto.getAdapterId());
		Id.setOrganisation(modelDto.getOrganisation());
		Id.setSourceId(modelDto.getSourceId());
		ICIPMLFederatedModel federatedModel = mlfedmodelRepo.findById(Id).get();
//		List<ICIPMLFederatedModel> modelsList = mlfedmodelRepo.getAllModelsById(modelDto.getSourceId());
//		modelsList.forEach(m -> {
//			m.setIsDeleted(true);
//			mlfedmodelRepo.save(m);
//		});
		federatedModel.setIsDeleted(true);
		mlfedmodelRepo.save(federatedModel);

	}
	
	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPMLFederatedModel> modelList = mlfedmodelRepo.getByOrg(fromProjectName);
		modelList.stream().forEach(model -> {
			ICIPMLFederatedModel mod = mlfedmodelRepo.findByIdAndOrg(model.getId(),fromProjectName);
			try {
			mod.setId(null);
			FedModelsID id = mod.getSourceModelId();
			id.setOrganisation(toProjectId);
			mod.setSourceModelId(id);
			mlfedmodelRepo.save(mod);
			}
			catch (Exception e) {
				log.error("Error in MLFederatedModel Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			log.info(marker,"Exporting models started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//			List<ICIPMLFederatedModel> models = mlfedmodelRepo.getByOrg(source);
			List<ICIPMLFederatedModel> models = new ArrayList<>();
			modNames.forEach(alias -> {
				models.add(mlfedmodelRepo.findByNameAndApporg(alias.toString(), source));
			});
			jsnObj.add("mlfederatedmodels", gson.toJsonTree(models));
			log.info(marker, "Exported models successfully");
		}
		catch(Exception ex) {
			log.error(marker, "Error in exporting models");
			log.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			log.info(marker, "Importing models started");
			JsonArray fedmodels = g.fromJson(jsonObject.get("mlfederatedmodels").toString(), JsonArray.class);
			fedmodels.forEach(x -> {
				ICIPMLFederatedModel mod = g.fromJson(x, ICIPMLFederatedModel.class);
				mod.setId(null);
				FedModelsID id = mod.getSourceModelId();
				id.setOrganisation(target);
				mod.setSourceModelId(id);
				try {
					mlfedmodelRepo.save(mod);
				}
				catch(Exception de) {
					log.error(marker, "Error in importing duplicate models {}",mod.getName());
				}
			});
			log.info(marker, "Imported models successfully");
		}
		catch(Exception ex) {
			log.error(marker, "Error in importing exporting");
			log.error(marker, ex.getMessage());
		}
	}
	
	@Override
	public List<ICIPMLFederatedModelDTO> getAllModelsByOrganisation(String org){
		List<ICIPMLFederatedModel> modelList = mlfedmodelRepo.findByAppOrg(org);
		List<ICIPMLFederatedModelDTO> dtoList = MapModelListToDTOList(modelList);
		return dtoList;
	}
	@Override
	public List<ICIPMLFederatedModelDTO> getModelByFedNameAndOrg(String fedName, String org) {
		List<ICIPMLFederatedModel> modeList = new ArrayList();
		
			modeList = mlfedmodelRepo.getModelByFedNameAndOrg(fedName, org);
	

		List<ICIPMLFederatedModelDTO> dtoList = MapModelListToDTOList(modeList);
		return dtoList;
	}

}
