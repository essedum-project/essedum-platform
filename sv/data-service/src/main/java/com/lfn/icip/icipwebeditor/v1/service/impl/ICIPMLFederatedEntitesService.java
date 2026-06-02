package com.lfn.icip.icipwebeditor.v1.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEntities;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedEntityRepository;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.enums.Entities;
import com.lfn.icip.icipwebeditor.v1.events.model.TaskActivityEvent;
import com.lfn.icip.icipwebeditor.v1.events.publisher.TaskActivityEventPublisher;
import com.lfn.icip.icipwebeditor.v1.service.IICIPMLFederatedEntitiesService;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchableService;

import jakarta.transaction.Transactional;
import reactor.core.publisher.Flux;

@Service
@Transactional
public class ICIPMLFederatedEntitesService implements IICIPMLFederatedEntitiesService {

	@Autowired
	private ICIPMLFederatedEntityRepository mlFedEntityRepo;

	@Autowired
	IICIPSearchableService searchableService;
	
	@Autowired
	TaskActivityEventPublisher taskActivityEventPublisher;
	

	@Override
	public String addUseCase(String parentId, String parentType, String childId, String childType, String project) {
		ICIPMLFederatedEntities entity;
		if (Entities.valueOf(parentType.toUpperCase()).ordinal() >= Entities.valueOf(childType.toUpperCase())
				.ordinal()) {
			entity = createEntityObject(childId, childType, parentId, parentType, project);
		} else {
			entity = createEntityObject(parentId, parentType, childId, childType, project);

		}
		mlFedEntityRepo.save(entity);
		return "Success";

	}

	@Override
	public List<ICIPMLFederatedEntities> UnlinkUseCase(Integer parentId, String parentType, Integer childId,
			String childType, String project) {
		List<ICIPMLFederatedEntities> entity;
		if (Entities.valueOf(parentType.toUpperCase()).ordinal() >= Entities.valueOf(childType.toUpperCase())
				.ordinal()) {
			entity = mlFedEntityRepo.findLinkedEntities(childId, childType, parentId, parentType, project);
		} else {
			entity = mlFedEntityRepo.findLinkedEntities(parentId, parentType, childId, childType, project);

		}
		if (parentType.equals(Entities.INITIATIVE.toString())) {
			TaskActivityEvent activityEvent = new TaskActivityEvent(this, project, parentId,
					childId, childType, "unlink-" + childType);
			taskActivityEventPublisher.getApplicationEventPublisher().publishEvent(activityEvent);
		}
		mlFedEntityRepo.deleteAll(entity);
//		return "Success";
		return entity;

	}

	public ICIPMLFederatedEntities createEntityObject(String parentId, String parentType, String childId,
			String childType, String project) {
		ICIPMLFederatedEntities entity = new ICIPMLFederatedEntities();
		entity.setPType(parentType);
		entity.setPId(Integer.valueOf(parentId));
		entity.setCType(childType);
		entity.setCId(Integer.valueOf(childId));
		entity.setOrganization(project);
		if (parentType.equals(Entities.INITIATIVE.toString())) {
			TaskActivityEvent activityEvent = new TaskActivityEvent(this, project, Integer.parseInt(parentId),
					Integer.parseInt(childId), childType, "link-" + childType);
			taskActivityEventPublisher.getApplicationEventPublisher().publishEvent(activityEvent);
		}
		return entity;
	}

	public List<ICIPMLFederatedEntities> getLinkedEntities(String entityType, Integer entityId, String organization) {

		return mlFedEntityRepo.findLinkedEntitiesByTypeAndIDAndOrganization(entityType, entityId, organization);

	}

	@Override
	public Flux<BaseEntity> getUseCases(String entityType, Integer entityId, String project) {

		List<ICIPMLFederatedEntities> entityList = getLinkedEntities(entityType, entityId, project);

		return Flux.fromIterable(entityList).parallel().flatMap((e) -> searchableService.getDataByIdAndType(
				(entityType.equalsIgnoreCase(e.getPType()) && entityId.equals(e.getPId())) ? e.getCId() : e.getPId(),
				(entityType.equalsIgnoreCase(e.getPType()) && entityId.equals(e.getPId())) ? e.getCType().toString()
						: e.getPType().toString(),
				e.getOrganization())).sequential();

	}

}
