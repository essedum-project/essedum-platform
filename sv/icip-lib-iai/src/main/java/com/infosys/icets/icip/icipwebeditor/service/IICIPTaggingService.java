package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;

import org.json.JSONArray;

import com.infosys.icets.icip.dataset.model.ICIPTags;
import com.infosys.icets.icip.icipwebeditor.model.ICIPTagsEntity;

public interface IICIPTaggingService {

	String addTags(String tagIds, String entityId, String entityType,String organization);
	JSONArray getMappedTags(Integer entityId, String entityType,String organization);
	


}
