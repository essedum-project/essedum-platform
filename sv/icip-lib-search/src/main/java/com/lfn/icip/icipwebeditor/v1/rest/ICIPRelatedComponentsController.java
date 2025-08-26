package com.lfn.icip.icipwebeditor.v1.rest;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.enums.Entities;
import com.lfn.icip.icipwebeditor.v1.events.model.TaskActivityEvent;
import com.lfn.icip.icipwebeditor.v1.service.IICIPMLFederatedEntitiesService;

import io.micrometer.core.annotation.Timed;
import reactor.core.publisher.Flux;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/service/v1/useCase")
public class ICIPRelatedComponentsController {

	@Autowired
	private IICIPMLFederatedEntitiesService fedEntityService;

	@PostMapping("/add")
	public ResponseEntity<String> add(@RequestBody String addBody,
			@RequestParam(name = "project", required = true) String project)

	{
		JSONArray addObj = new JSONArray(addBody);
		try {
		addObj.forEach(x->{
			JSONObject object=new JSONObject(x.toString());
				String parentId = object.get("parentId").toString();
				String parentType = object.get("parentType").toString();
				String childId = object.get("childId").toString();
				String childType = object.get("childType").toString();
				fedEntityService.addUseCase(parentId, parentType, childId, childType, project);
						
		});
		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
		

		return ResponseEntity.status(200).body(null);
	}

	@GetMapping("/get")
	public Flux<BaseEntity> getDatasetsList(@RequestParam(name = "type", required = true) String entityType,
			@RequestParam(name = "id", required = true) Integer entityId,
			@RequestParam(name = "project", required = true) String project)

	{
		return fedEntityService.getUseCases(entityType, entityId, project);

	}

	@DeleteMapping("/unlink")
	public ResponseEntity<String> unlink(@RequestBody String removeBody,
			@RequestParam(name = "project", required = true) String project)

	{
		JSONObject removeObj = new JSONObject(removeBody);
		try {
			Integer parentId = (Integer) removeObj.get("parentId");
			String parentType = removeObj.get("parentType").toString();
			Integer childId = (Integer) removeObj.get("childId");
			String childType = removeObj.get("childType").toString();
			fedEntityService.UnlinkUseCase(parentId, parentType, childId, childType, project);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}

		return ResponseEntity.status(200).body(null);
	}
	
	
	
}
