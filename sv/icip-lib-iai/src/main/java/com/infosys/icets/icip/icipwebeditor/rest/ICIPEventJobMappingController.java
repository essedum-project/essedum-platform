/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.rest;

import java.net.URLDecoder;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.infosys.icets.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPEventJobMappingDTO;
import com.infosys.icets.icip.icipwebeditor.service.IICIPEventJobMappingService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPJobRuntimePluginsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPEventJobMappingController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/event")
public class ICIPEventJobMappingController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPEventJobMappingController.class);

	/** The event mapping service. */
	@Autowired
	private IICIPEventJobMappingService eventMappingService;
	
	@Autowired
	private ICIPJobRuntimePluginsService jobRuntimePluginService;
	
	//COMMENTED AS PART OF CODE CLEANUP
	
//
//	/**
//	 * Trigger event.
//	 *
//	 * @param name   the name
//	 * @param org    the org
//	 * @param corelid the corelid
//	 * @param params the params
//	 * @return the response entity
//	 */
//	@GetMapping(value = "/trigger/{name}", produces = "application/json")
//	public ResponseEntity<String> triggerEvent(@PathVariable("name") String name,
//			@RequestParam(name = "org") String org, @RequestParam(name = "corelid", required = false) String corelid,
//			@RequestParam(name = "param") String params,
//			@RequestParam(name = "datasourceName", required = false) String datasourceName) {
//		try {
//			if(datasourceName==null) {
//				ICIPEventJobMapping eventByName = eventMappingService.findByEventName(name, org);
//				JSONArray jsonJobDetails =new JSONArray(eventByName.getJobdetails());
//				JSONObject runtime= jsonJobDetails.getJSONObject(0);
//				datasourceName= runtime.getJSONObject("runtime").get("dsName").toString();
//			}
//			params = URLDecoder.decode(params, "UTF-8");
//			return new ResponseEntity<>(eventMappingService.trigger(name, org, corelid, params, datasourceName), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>("Triggering Error!", HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Trigger post event.
//	 *
//	 * @param name the name
//	 * @param org the org
//	 * @param corelid the corelid
//	 * @param params the params
//	 * @param payload the payload
//	 * @return the response entity
//	 */
//	@PostMapping(value = "/trigger/{name}", produces = "application/json")
//	public ResponseEntity<String> triggerPostEvent(@PathVariable("name") String name,
//			@RequestParam(name = "org") String org,
//			@RequestParam(name = "corelid", required = false) String corelid,
//			@RequestParam(name = "datasourceName", required = false) String datasourceName,
//			@RequestBody String payload) {
//		try {
//			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//			if(datasourceName==null) {
//				ICIPEventJobMapping eventByName = eventMappingService.findByEventName(name, org);
//				JSONArray jsonJobDetails =new JSONArray(eventByName.getJobdetails());
//				JSONObject runtime= jsonJobDetails.getJSONObject(0);
//				datasourceName= runtime.getJSONObject("runtime").get("dsName").toString();
//			}
//			if (payload == null || payload.trim().equalsIgnoreCase("null") || payload.trim().isEmpty()) {
//				payload = "{}";
//			}
//			JsonObject json = gson.fromJson(payload, JsonObject.class);
//			payload = gson.toJson(json);
//			return new ResponseEntity<>(eventMappingService.trigger(name, org, corelid, payload, datasourceName), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>("Triggering Error!", HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Test event.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the response entity
//	 */
//	@GetMapping(value = "/test/{name}/{org}", produces = "application/json")
//	public ResponseEntity<String> testEvent(@PathVariable("name") String name, @PathVariable(name = "org") String org) {
//		name = name.trim();
//		try {
//			logger.info("request to test job event");
//			if (eventMappingService.isValidEvent(name, org)) {
//				return new ResponseEntity<>("Test Successful", HttpStatus.OK);
//			}
//			return new ResponseEntity<>("Invalid Event Details", HttpStatus.BAD_REQUEST);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>("Testing Error!", HttpStatus.BAD_REQUEST);
//		}
//	}
//
////	/**
////	 * Gets the event status.
////	 *
////	 * @param name         the name
////	 * @param organization the organization
////	 * @return the event status
////	 */
////	@GetMapping(value = "/status/{name}/{org}", produces = "application/json")
////	public ResponseEntity<String> getEventStatus(@PathVariable("name") String name,
////			@PathVariable(name = "org") String organization) {
////		name = name.trim();
////		try {
////			logger.info("request to get job event status");
////			JSONObject obj = new JSONObject();
////			ICIPEventJobMapping eventMap = eventMappingService.findByEventName(name, organization);
////			JSONArray jobs = new JSONArray();
////			JSONArray status = new JSONArray();
////			JSONArray links = new JSONArray();
////			String jobDetails = eventMap.getJobdetails();
////			Gson gson = new Gson();
////			
////			JsonArray jobDetailsArray = gson.fromJson(jobDetails, JsonArray.class);
////			jobDetailsArray.
////			String job = eventMap.getJobname().trim();
////			String org = eventMap.getOrganization().trim();
////			if (eventMap.getJobtype().trim().equalsIgnoreCase("chain")) {
////				List<ICIPChainJobs> listOfChainJobs = iICIPChainJobsService.findByJobNameAndOrganization(job, org, 0,
////						1);
////				if (!listOfChainJobs.isEmpty()) {
////					jobs.put(job);
////					status.put(listOfChainJobs.get(0).getJobStatus());
////					links.put(String.format("%s%s%s", EventConstants.HOME, "/jobs/", job));
////				}
////			} else {
////				List<ICIPJobs> listOfJobs = iICIPJobsService.getJobsByService(job, 0, 1, org);
////				ICIPPartialGroups groups = iICIPPartialGroupsService.getSingleGroupsByOrgAndEntity(org, job);
////				if (!listOfJobs.isEmpty() && groups != null) {
////					jobs.put(job);
////					status.put(listOfJobs.get(0).getJobStatus());
////					links.put(String.format("%s%s%s%s%s", EventConstants.HOME, "/pipelines/", groups.getName().trim(),
////							"/", job));
////				}
////			}
////
////			obj.put("jobs", jobs);
////			obj.put("status", status);
////			obj.put("links", links);
////			return new ResponseEntity<>(obj.toString(), HttpStatus.OK);
////		} catch (Exception e) {
////			logger.error(e.getMessage(), e);
////			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
////		}
////	}
//
//	/**
//	 * Gets the event length.
//	 *
//	 * @param org    the org
//	 * @param search the search
//	 * @return the events
//	 */
//	@GetMapping(value = "/all/len", produces = "application/json")
//	public ResponseEntity<Long> getEventsLength(@RequestParam(name = "org", required = true) String org,
//			@RequestParam(name = "search", required = false, defaultValue = "") String search) {
//		try {
//			logger.info("request to get all events");
//			return new ResponseEntity<>(eventMappingService.countByOrgAndSearch(org, search), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Gets the events.
//	 *
//	 * @param org the org
//	 * @return the events
//	 */
//	@GetMapping(value = "/all", produces = "application/json")
//	public ResponseEntity<List<ICIPEventJobMapping>> getAllEvents(
//			@RequestParam(name = "org", required = true) String org) {
//		try {
//			logger.info("request to get all events");
//			return new ResponseEntity<>( eventMappingService.findByOrg(org), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Gets the events.
//	 *
//	 * @param org    the org
//	 * @param page   the page
//	 * @param size   the size
//	 * @param search the search
//	 * @return the events
//	 */
//	@GetMapping(value = "/all/search", produces = "application/json")
//	public ResponseEntity<List<ICIPEventJobMapping>> getEvents(@RequestParam(name = "org", required = true) String org,
//			@RequestParam(name = "page", required = false, defaultValue = "0") String page,
//			@RequestParam(name = "size", required = false, defaultValue = "12") String size,
//			@RequestParam(name = "search", required = false, defaultValue = "") String search) {
//		try {
//			logger.info("request to get all events - search {}", search);
//			return new ResponseEntity<>(eventMappingService.findByOrgAndSearch(org, search,
//					Integer.parseInt(page), Integer.parseInt(size)), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Gets the events.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the events
//	 */
//	@GetMapping(value = "/name/{name}/{org}", produces = "application/json")
//	public ResponseEntity<ICIPEventJobMapping> getEvents(@PathVariable(name = "name") String name,
//			@PathVariable(name = "org") String org) {
//		name = name.trim();
//		try {
//			logger.info("request to get event by name : {}", name);
//	
//			return new ResponseEntity<>(eventMappingService.findByEventName(name, org), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Gets the event by id.
//	 *
//	 * @param id the id
//	 * @return the event by id
//	 */
//	@GetMapping(value = "/id/{id}", produces = "application/json")
//	public ResponseEntity<ICIPEventJobMapping> getEventById(@PathVariable(name = "id") Integer id) {
//		try {
//			logger.info("request to get event by id : {}", id);
//
//			return new ResponseEntity<>(eventMappingService.findById(id), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Adds the event.
//	 *
//	 * @param eventDTO the event DTO
//	 * @return the response entity
//	 */
//	@PostMapping(value = "/add", produces = "application/json")
//	public ResponseEntity<?> addEvent(@RequestBody ICIPEventJobMappingDTO eventDTO) {
//		ModelMapper mapper = new ModelMapper();
//		if (eventDTO.isValid()) {
//			ICIPEventJobMapping event = mapper.map(eventDTO, ICIPEventJobMapping.class);
//			try {
//				logger.info("request to save event");
//				event.setEventname(event.getEventname().trim());
//			
//				return new ResponseEntity<>(eventMappingService.save(event), HttpStatus.OK);
//			} catch (Exception e) {
//				logger.error(e.getMessage(), e);
//				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//			}
//		} else {
//			return new ResponseEntity<>("Invalid details", HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Delete by name.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the response entity
//	 */
//	@DeleteMapping(value = "/delete/name/{name}")
//	public ResponseEntity<Void> deleteByName(@PathVariable(name = "name") String name,
//			@RequestParam(name = "org") String org) {
//		name = name.trim();
//		try {
//			logger.info("request to delete event by name : {}", name);
//			eventMappingService.delete(name, org);
//			return new ResponseEntity<>(HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Delete by name.
//	 *
//	 * @param id the id
//	 * @return the response entity
//	 */
//	@DeleteMapping(value = "/delete/id/{id}")
//	public ResponseEntity<Void> deleteByName(@PathVariable(name = "id") Integer id) {
//		try {
//			logger.info("request to delete event by id : {}", id);
//			eventMappingService.delete(id);
//			return new ResponseEntity<>(HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Gets the api classes.
//	 *
//	 * @return the api classes
//	 */
//	@GetMapping(value = "/apiClasses")
//	public ResponseEntity<List<String>> getApiClasses() {
//		try {
//			logger.info("request to get api event classes");
//			return new ResponseEntity<>(eventMappingService.getApiClasses(), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}

}
