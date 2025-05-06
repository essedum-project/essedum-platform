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

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices3DTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServicesDTO;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.util.ICIPPageRequestByExample;
import com.infosys.icets.icip.icipwebeditor.util.ICIPPageResponse;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
//COMMENTED AS PART OF CODE CLEANUP
// TODO: Auto-generated Javadoc
// 
///**
// * The Class ICIPStreamingServicesController.
// *
// * @author icets
// */
//@RestController
//@Timed
//@Hidden
//@RequestMapping(path = "/${icip.pathPrefix}/streamingServices")
//public class ICIPStreamingServicesController {
//
//	/** The Constant ENTITY_NAME. */
//	private static final String ENTITY_NAME = "streamingServices";
//
//	/** The Constant logger. */
//	private static final Logger logger = LoggerFactory.getLogger(ICIPStreamingServicesController.class);
//
//	/** The streaming services service. */
//	@Autowired
//	private IICIPStreamingServiceService streamingServicesService;
//
//	
//	/** The claim. */
//	@Value("${security.claim:#{null}}")
//	private String claim;
//
//	/**
//	 * Gets the all pipelines.
//	 *
//	 * @param org the org
//	 * @return the all pipelines
//	 * 
//	 */
//	
//	
//	@GetMapping(path = "/allPipelines/{org}")
//	public ResponseEntity<List<ICIPStreamingServices2DTO>> getAllPipelines(@PathVariable(name = "org") String org) {
//		return new ResponseEntity<>(streamingServicesService.getAllPipelinesByOrg(org), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the all pipelines by org.
//	 *
//	 * @param org the org
//	 * @return the all pipelines by org
//	 */
//	@GetMapping(path = "/allPipelinesByOrg")
//	public ResponseEntity<List<ICIPStreamingServices2DTO>> getAllPipelinesByOrg(
//			@RequestParam(name = "org") String org) {
//		return new ResponseEntity<>(streamingServicesService.getAllPipelinesByOrg(org), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the all pipelines by type.
//	 *
//	 * @param type the type
//	 * @param org  the org
//	 * @return the all pipelines by type
//	 */
//	@GetMapping(path = "/allPipelinesByType")
//	public ResponseEntity<List<ICIPStreamingServices2DTO>> getAllPipelinesByType(
//			@RequestParam(name = "type") String type, @RequestParam(name = "interfacetype") String interfacetype,@RequestParam(name = "org") String org) {
//		return new ResponseEntity<>(streamingServicesService.getAllPipelinesByType(type, org,interfacetype), HttpStatus.OK);
//		
//	}
//
//	/**
//	 * Gets the all pipelines by type and group.
//	 *
//	 * @param group  the group
//	 * @param search the search
//	 * @param type   the type
//	 * @param org    the org
//	 * @return the all pipelines by type and group
//	 */
//	@GetMapping(path = "/allPipelinesByType/{group}")
//	public ResponseEntity<List<ICIPStreamingServices2DTO>> getAllPipelinesByTypeAndGroup(
//			@PathVariable(name = "group") String group, @RequestParam(name = "search") String search,
//			@RequestParam(name = "type") String type, @RequestParam(name = "org") String org) {
//		return new ResponseEntity<>(
//				streamingServicesService.getAllPipelinesByTypeAndGroup(type, org, group, search), HttpStatus.OK);
//	}
//
//	/**
//	 * Find streaming services.
//	 *
//	 * @param requestkey the requestkey
//	 * @return the response entity
//	 * @throws JsonProcessingException the json processing exception
//	 */
//	@GetMapping(path = "/all")
//	public ResponseEntity<ICIPPageResponse<ICIPStreamingServices2DTO>> findStreamingServices(
//			@RequestHeader(value = "example") String requestkey) throws JsonProcessingException {
//		String decodedvalue = new String(Base64.getDecoder().decode(requestkey), StandardCharsets.UTF_8);
//		ObjectMapper objectMapper = new ObjectMapper();
//		ICIPPageRequestByExample<ICIPStreamingServices2DTO> prbe = objectMapper.readValue(decodedvalue,
//				new TypeReference<ICIPPageRequestByExample<ICIPStreamingServices2DTO>>() {
//				});
//		return new ResponseEntity<>(streamingServicesService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the streaming services.
//	 *
//	 * @param id the id
//	 * @return the streaming services
//	 */
//	@GetMapping("/{id}")
//	public ResponseEntity<ICIPStreamingServices> getStreamingServices(@PathVariable(name = "id") Integer id) {
//		logger.info("Fetching streaming services by id : {} ", id);
//		return new ResponseEntity<>(streamingServicesService.findOne(id), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the streaming services.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the streaming services
//	 */
//	@GetMapping("/{nameStr}/{org}")
//	public ResponseEntity<ICIPStreamingServices> getStreamingServices(@PathVariable(name = "nameStr") String name,
//			@PathVariable(name = "org") String org) {
//		logger.info("Fetching streaming services by name : {}-{}", name, org);
//		return new ResponseEntity<>(streamingServicesService.getICIPStreamingServices(name, org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the streaming services by group.
//	 *
//	 * @param group  the group
//	 * @param org    the org
//	 * @param page   the page
//	 * @param size   the size
//	 * @param search the search
//	 * @return the streaming services by group
//	 */
//	@GetMapping("/all/{group}")
//	public ResponseEntity<List<ICIPStreamingServices3DTO>> getStreamingServicesByGroup(
//			@PathVariable(name = "group") String group, @RequestParam(required = true, name = "org") String org,
//			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
//			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
//			@RequestParam(name = "interfacetype", required = false) String interfacetype,
//			@RequestParam(name = "search", required = false) String search) {
//		if (search == null || search.trim().isEmpty()) {
//			if(!interfacetype.equals("null"))
//				return new ResponseEntity<>(streamingServicesService.getStreamingServicesByGroupAndOrgAndTemplate(group, org,interfacetype,
//						Integer.parseInt(page), Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
//			return new ResponseEntity<>(streamingServicesService.getStreamingServicesByGroupAndOrg(group, org,
//					Integer.parseInt(page), Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
//		} else {
//			return new ResponseEntity<>(streamingServicesService.getStreamingServicesByGroupAndOrgAndSearch(group, org, search,
//					Integer.parseInt(page), Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
//		}
//	}
//
//	/**
//	 * Gets the streaming services len by group.
//	 *
//	 * @param group  the group
//	 * @param org    the org
//	 * @param search the search
//	 * @return the streaming services len by group
//	 */
//	@GetMapping("/all/len/{group}/{org}")
//	public ResponseEntity<Long> getStreamingServicesLenByGroup(@PathVariable(name = "group") String group,
//			@PathVariable(name = "org") String org, @RequestParam(name = "search", required = false) String search) {
//		long startTime = System.currentTimeMillis();
//		Long len;
//		if (search == null || search.trim().isEmpty()) {
//			len = streamingServicesService.getStreamingServicesLenByGroupAndOrg(group, org);
//		} else {
//			len = streamingServicesService.getStreamingServicesLenByGroupAndOrgAndSearch(group, org, search);
//		}
//		long endTime = System.currentTimeMillis();
//		logger.info("Time for fetching pipelines length: {}", (endTime - startTime));
//		return new ResponseEntity<>(len, new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Creates the streaming services.
//	 *
//	 * @param streamingServicesDTO the streaming services DTO
//	 * @param org                  the org
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PostMapping("/add")
//	public ResponseEntity<ICIPStreamingServices> createStreamingServices(
//			@RequestBody ICIPStreamingServicesDTO streamingServicesDTO,
//			@RequestAttribute(required = false, name = "organization") String org)
//			throws URISyntaxException, SQLException {
//		logger.info("Creating Streaming Service : {}", streamingServicesDTO.getName());
//		streamingServicesDTO.setCreatedBy(ICIPUtils.getUser(claim));
//		streamingServicesDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
//		streamingServicesDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPStreamingServices streamingServices = modelmapper.map(streamingServicesDTO, ICIPStreamingServices.class);
//		ICIPStreamingServices result = streamingServicesService.save(streamingServices);
//		return ResponseEntity.created(new URI("/streamingServices/" + result.getCid()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getCid().toString()))
//				.body(result);
//	}
//
//	/**
//	 * Update streaming services.
//	 *
//	 * @param streamingServicesDTO the streaming services DTO
//	 * @param org                  the org
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 * @throws IOException 
//	 * @throws GitAPIException 
//	 * @throws TransportException 
//	 * @throws InvalidRemoteException 
//	 */
//	@PutMapping("/update")
//	public ResponseEntity<ICIPStreamingServices> updateStreamingServices(
//			@RequestBody ICIPStreamingServicesDTO streamingServicesDTO,
//			@RequestAttribute(required = false, name = "organization") String org)
//			throws URISyntaxException, SQLException, InvalidRemoteException, TransportException, GitAPIException, IOException {
//		if (streamingServicesDTO.getCid() == null) {
//			return createStreamingServices(streamingServicesDTO, org);
//		}
//		streamingServicesDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
//		streamingServicesDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
//		if (streamingServicesDTO.getAlias() == null || streamingServicesDTO.getAlias().trim().isEmpty()) {
//			streamingServicesDTO.setAlias(streamingServicesDTO.getName());
//		} else {
//			streamingServicesDTO.setAlias(streamingServicesDTO.getAlias());
//		}
//		logger.info("Updating streaming service : {}", streamingServicesDTO.getName());
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPStreamingServices streamingServices = modelmapper.map(streamingServicesDTO, ICIPStreamingServices.class);
//		ICIPStreamingServices result = streamingServicesService.update(streamingServices);
//		return ResponseEntity.ok()
//				.headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, streamingServices.getCid().toString()))
//				.body(result);
//	}
//
//	/**
//	 * Delete streaming services.
//	 *
//	 * @param id the id
//	 * @return the response entity
//	 * @throws SQLException the SQL exception
//	 * @throws GitAPIException 
//	 * @throws IOException 
//	 * @throws TransportException 
//	 * @throws InvalidRemoteException 
//	 */
//	@DeleteMapping("/delete/{id}")
//	public ResponseEntity<Void> deleteStreamingServices(@PathVariable(name = "id") Integer id) throws SQLException, InvalidRemoteException, TransportException, IOException, GitAPIException {
//		streamingServicesService.delete(id);
//		logger.info("Deleting streaming service by Id : {}", id);
//		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
//				.build();
//	}
//
//	/**
//	 * Handle all.
//	 *
//	 * @param ex the ex
//	 * @return the response entity
//	 */
//	@ExceptionHandler(Exception.class)
//	public ResponseEntity<Object> handleAll(Exception ex) {
//		logger.error(ex.getMessage(), ex);
//		Throwable rootcause = ExceptionUtil.findRootCause(ex);
//	
//		return new ResponseEntity<>(	new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getMessage(), new HttpHeaders(), 	new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getStatus());
//	}
//
//	/**
//	 * Gets the all pipelines names by org.
//	 *
//	 * @param org the org
//	 * @return the all pipelines by org
//	 */
//	@GetMapping(path = "/allPipelineNames")
//	public ResponseEntity<List<NameAndAliasDTO>> getAllPipelineNamesByOrg(@RequestParam(name = "org") String org) {
//		
//		return new ResponseEntity<>(streamingServicesService.getAllPipelineNamesByOrg(org)
//, HttpStatus.OK);
//	}
//	
//	@PostMapping(value = "/saveJson/{name}/{org}")
//    public ResponseEntity<?> savePipelineJson(@PathVariable(value = "name") String name, @PathVariable(value = "org") String org , @RequestBody String body) {
//		JSONObject obj = new JSONObject();
//		String path = streamingServicesService.savePipelineJson(name, org, body);
//		obj.append("path", path);
//		return new ResponseEntity<>(obj.toString(), new HttpHeaders(), HttpStatus.OK);
//        
//    }
//	
//	@GetMapping(path = "/generatedScript")
//	public ResponseEntity<?> getGeneratedScript(@RequestParam(name = "name") String name, @RequestParam(name = "org") String org) {
//		JSONObject fileObj = null;
//		fileObj = streamingServicesService.getGeneratedScript(name,org);	
//			
//		return new ResponseEntity<>(fileObj.toString(), new HttpHeaders(), HttpStatus.OK);
//	}
//	
//	@GetMapping(path = "/readAllScripts")
//	public ResponseEntity<?> getAllScripts(@RequestParam(name = "name") String name, @RequestParam(name = "org") String org) {
//		JSONObject fileObj = null;
//		fileObj = streamingServicesService.getAllScripts(name, org);	
//			
//		return new ResponseEntity<>(fileObj.toString(), new HttpHeaders(), HttpStatus.OK);
//	}
//
//}