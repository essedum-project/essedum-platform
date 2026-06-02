package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModelDS;
import com.lfn.icip.icipwebeditor.model.dto.ICIPDatasourceFilterDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.lfn.icip.icipwebeditor.repository.ICPMLFederatedModelsDSRepository;
import com.lfn.icip.icipwebeditor.service.IICIPMLFederatedModelService;
import com.lfn.icip.icipwebeditor.util.ICIPFedModelUtil;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchable;

import reactor.core.publisher.Flux;

@Service("modelservice")
public class ICIPMLFederatedModelService implements IICIPMLFederatedModelService, IICIPSearchable {

	@Autowired
	private ICIPMLFederatedModelsRepository mlfedmodelRepo;

	@Autowired 
	private ICPMLFederatedModelsDSRepository mlfedmodeldsRepo;
	

	@Autowired
	private ICIPTaggingServiceImpl taggingService;

	final String TYPE = "MODEL";
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);

	@Override
	public List<ICIPMLFederatedModelDTO> getAllModelsByOrganisation(String org, Pageable pageable, String search) {
		List<ICIPMLFederatedModel> modeList = mlfedmodelRepo.getAllDistinctModelsByOrganisation(org, pageable);
		List<ICIPMLFederatedModelDTO> dtoList = ICIPFedModelUtil.MapModelListToDTOList(modeList);
		return dtoList;
	}

	@Override
	public ICIPMLFederatedModel savemodel(ICIPMLFederatedModel model) {
		ICIPMLFederatedModel savedModel = mlfedmodelRepo.save(model);
		return savedModel;
		
	}
	

	@Override
	public ICIPMLFederatedModelDTO updateModel(ICIPMLFederatedModelDTO fedModelDTO) {		
		try {
			ICIPMLFederatedModel modelObj = mlfedmodelRepo.findById(fedModelDTO.getId()).get();
			if (fedModelDTO.getDescription() != null) {
				modelObj.setDescription(fedModelDTO.getDescription());
			}
			if (fedModelDTO.getModifiedBy() != null)
				modelObj.setModifiedBy(fedModelDTO.getModifiedBy());
			modelObj.setModifiedDate(new Timestamp(System.currentTimeMillis()));
			if (fedModelDTO.getName() != null) {
				modelObj.setModelName(fedModelDTO.getName());
			}
			ICIPMLFederatedModel mSaveObj = mlfedmodelRepo.save(modelObj);
			return ICIPFedModelUtil.MapModelToDTO(mSaveObj);
		} catch (Exception e) {
			
			log.error("error occured while saving model : "+e.getMessage());
			return null;
		}

	}

	@Override
	public List<ICIPMLFederatedModelDS> getAllOptionalModelsByOrg(
	        String organisation, String dataSource, String query, Pageable page) {
	    List<String> dataSourceList = null;
	    
	    if (dataSource != null && !dataSource.isEmpty()) {
	    	dataSourceList = Arrays.asList(dataSource.split(","));
	    }
	    Page<ICIPMLFederatedModelDS> modelsPage = mlfedmodeldsRepo.findByOrganisationAndOptionalDatasourceNamesAndSearch(
	            organisation, dataSourceList, query, page);
	   return modelsPage.toList();
	
	}
	
	@Override
	public List<ICIPDatasourceFilterDTO> getModelFilters(String org){
		
		return mlfedmodeldsRepo.findDistinctDatasourceNameAndAliasByOrganisation(org);
		
	}


	@Override
	public Long getAllModelsCountByOrganisationOptionals(String org, String dataSourcename, String searchInput) {
		
		    List<String> dataSourcenames = null;
		    if (dataSourcename != null && !dataSourcename.isEmpty()) {
		    	dataSourcenames = Arrays.asList(dataSourcename.split(","));
		    }
		    return  mlfedmodeldsRepo.countByOrganisationAndOptionalDatasourceNamesAndSearch(org, dataSourcenames, searchInput);

	}

	public Flux<BaseEntity> getObjectByIDTypeAndorganisation(String type, Integer id, String organisation) {

		return Flux.just(mlfedmodelRepo.findByIdAndOrg(id, organisation)).defaultIfEmpty(new ICIPMLFederatedModel())
				.map(s -> {
					BaseEntity entity = new BaseEntity();
					entity.setAlias(s.getModelName());
					entity.setData(new JSONObject(s).toString());
					entity.setDescription(s.getDescription());
					entity.setId(s.getId());
					entity.setType(TYPE);
					return entity;
				});
	}

	@Override
	public Flux<BaseEntity> getAllObjectsByOrganization(String organization, String search, Pageable page) {
		try
		{
		List<ICIPMLFederatedModel> modeList = mlfedmodelRepo.getAllDistinctModelsByOrganisation(organization, search, page);
		return Flux.fromIterable(modeList).defaultIfEmpty(new ICIPMLFederatedModel()).parallel().map(s -> {
			BaseEntity entity = new BaseEntity();
			entity.setAlias(s.getModelName());
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
	public void deleteModel(int modelId,String organisation) throws RuntimeException{
		
		    ICIPMLFederatedModel modelToDelete = mlfedmodelRepo.findByIdAndOrg(modelId, organisation);
		    log.info("Deleting model");
	        mlfedmodelRepo.delete(modelToDelete);
			 
	}

	
	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPMLFederatedModel> modelList = mlfedmodelRepo.findByOrganisation(fromProjectName);
		modelList.stream().forEach(model -> {
			ICIPMLFederatedModel mod = mlfedmodelRepo.findByIdAndOrg(model.getId(),fromProjectName);
			try {
			mod.setId(null);
			mod.setOrganisation(toProjectId);
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
			List<ICIPMLFederatedModel> models = new ArrayList<>();
			modNames.forEach(alias -> {
				models.add(mlfedmodelRepo.getModelByModelNameAndOrganisation(alias.toString(), source).getFirst());
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
				try {
					mlfedmodelRepo.save(mod);
				}
				catch(Exception de) {
					log.error(marker, "Error in importing duplicate models {}",mod.getModelName());
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
		List<ICIPMLFederatedModel> modelList = mlfedmodelRepo.findByOrganisation(org);
		List<ICIPMLFederatedModelDTO> dtoList = ICIPFedModelUtil.MapModelListToDTOList(modelList);
		return dtoList;
	}
	@Override
	public List<ICIPMLFederatedModelDTO> getModelByFedModelNameAndOrg(String fedName, String org) {
		List<ICIPMLFederatedModel> modeList = new ArrayList<>();
		modeList = mlfedmodelRepo.getModelByModelNameAndOrganisation(fedName, org);
		List<ICIPMLFederatedModelDTO> dtoList = ICIPFedModelUtil.MapModelListToDTOList(modeList);
		return dtoList;
	}
	
	@Override
	public ICIPMLFederatedModelDS getModelByModelId(int fedId, String project) {
		return mlfedmodeldsRepo.findByIdAndOrg(fedId, project);

	}

	@Override
	public Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {
		// TODO Auto-generated method stub
		return null;
	}


}
