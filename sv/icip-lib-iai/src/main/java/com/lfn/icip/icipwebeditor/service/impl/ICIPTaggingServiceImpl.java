package com.lfn.icip.icipwebeditor.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.model.ICIPApps;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.ICIPTagsEntity;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.lfn.icip.icipwebeditor.repository.ICIPMLTagsEntityRepository;
import com.lfn.icip.icipwebeditor.service.IICIPAppService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.lfn.icip.icipwebeditor.service.IICIPTaggingService;
import com.lfn.icip.dataset.model.ICIPTags;
import com.lfn.icip.dataset.service.IICIPTagsService;

@Service
public class ICIPTaggingServiceImpl implements IICIPTaggingService {
   
	private static final Logger logger = LoggerFactory.getLogger(ICIPTaggingServiceImpl.class);


	@Autowired
	ICIPMLTagsEntityRepository tagEntityRepo;

	@PersistenceContext
	EntityManager entityManager;
	
	@Autowired
	private IICIPTagsService tagsService;

	@Autowired
	private IICIPStreamingServiceService iicipStreamingServiceService;
	
	@Autowired
	private IICIPAppService appService;
	@Override
	public String addTags(String tagIds, String entityId, String entityType, String organization) {
		try {
		String[] tagIdsString = tagIds.split(",");
		if(entityType.equalsIgnoreCase("apps")) {
			Optional<ICIPApps> appByID= appService.findByID(Integer.parseInt(entityId));
			ICIPStreamingServices pipelineForApp = iicipStreamingServiceService.findbyNameAndOrganization(appByID.get().getName(), organization);
			entityId=pipelineForApp.getCid().toString();
		}
		
		List<Integer> tagIdsList = new ArrayList<>();
		List<Integer> idsDelList = new ArrayList<>();
		if (tagIdsString.length >= 1) {
			for (String tag : tagIdsString) {
				tagIdsList.add(Integer.valueOf(tag));
			}
		}
		List<ICIPTagsEntity> tagList = tagEntityRepo.findAllTagsByentityIdAndEntityTypeAndOrganization(Integer.valueOf(entityId),
				entityType, organization);
		List<Integer> noSaveList = new ArrayList<>();
		if (tagList.size() >= 1) {
			tagList.forEach(t -> {
				if (!tagIdsList.contains(t.getTagId())) {
					idsDelList.add(t.getId());
				}
				else {
					noSaveList.add(t.getTagId());
				}
			});
		}
		String entID=entityId;
		tagEntityRepo.deleteAllByIdInBatch(idsDelList);
		tagIdsList.stream().parallel().forEach(x->{
			ICIPTagsEntity tagObj= new ICIPTagsEntity();
			tagObj.setTagId(x);
			tagObj.setEntityType(entityType);
			tagObj.setOrganization(organization);
			tagObj.setEntityId(Integer.valueOf(entID));
			if(entityType.equalsIgnoreCase("apps")) {
			tagObj.setEntityId(Integer.valueOf(entID));}
			if(!noSaveList.contains(x)) {
				tagEntityRepo.save(tagObj);
			}
		});
		return "success";
		}catch (Exception e) {
			logger.error(e.getMessage());
			return "error";
		}	
	
	}

	@Override
	public JSONArray getMappedTags(Integer entityId, String entityType, String organization) {
		List<ICIPTagsEntity> tagList1 = tagEntityRepo.findAllTagsByentityIdAndEntityTypeAndOrganization(Integer.valueOf(entityId),
				entityType, organization);
		int len=tagList1.size();
		int[] arr=new int[len];
		int i=0;
		JSONArray tagJsonArr=new JSONArray();
		List<ICIPTags> tags;
		for (ICIPTagsEntity dto : tagList1) {
			arr[i]=dto.getTagId();
			ICIPTags tag=tagsService.getById(arr[i]);
			JSONObject tagsJsonObj=new JSONObject();
			tagsJsonObj.put("id", tag.getId());
			tagsJsonObj.put("label", tag.getLabel());
			tagsJsonObj.put("category", tag.getCategory());
			tagJsonArr.put(tagsJsonObj);
			i++;
		}
		return tagJsonArr;
	}




}