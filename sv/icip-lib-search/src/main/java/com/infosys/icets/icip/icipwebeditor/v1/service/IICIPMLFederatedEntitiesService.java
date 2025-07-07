package com.infosys.icets.icip.icipwebeditor.v1.service;

import java.util.List;

import org.json.JSONObject;

import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedEntities;
import com.infosys.icets.icip.icipwebeditor.v1.dto.BaseEntity;

import reactor.core.publisher.Flux;

public interface IICIPMLFederatedEntitiesService {

public String addUseCase(String parentId, String parentType, String childId, String childType, String project);
public List<ICIPMLFederatedEntities> UnlinkUseCase(Integer parentId, String parentType, Integer childId, String childType, String project);

public Flux<BaseEntity> getUseCases(String entityType, Integer entityId, String project);

	
	
	
	
}
