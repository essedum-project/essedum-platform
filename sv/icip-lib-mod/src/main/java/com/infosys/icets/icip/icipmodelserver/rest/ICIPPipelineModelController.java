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
package com.infosys.icets.icip.icipmodelserver.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Blob;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.model.dto.ICIPSchemaRegistryDTO;
import com.infosys.icets.icip.icipmodelserver.model.ICIPEndpoints;
import com.infosys.icets.icip.icipmodelserver.model.ICIPModelServers;
import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;
import com.infosys.icets.icip.icipmodelserver.model.dto.ICIPPipelineModelDTO;
import com.infosys.icets.icip.icipmodelserver.model.dto.PipelineModelWithoutBlob;
import com.infosys.icets.icip.icipmodelserver.service.IICIPPipelineModelService;
import com.infosys.icets.icip.icipmodelserver.service.impl.ICIPModelServersService;
//import com.infosys.icets.icip.icipmodelserver.service.impl.ICIPPipelineModelService;
import com.infosys.icets.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;
import com.infosys.icets.icip.icipwebeditor.service.IICIPEventJobMappingService;

import io.micrometer.core.annotation.Timed;
import net.minidev.json.JSONObject;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModelController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/pipelinemodels")
@RefreshScope
public class ICIPPipelineModelController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPipelineModelController.class);

	private static final String ENTITY_NAME = "model";

	/** The pipeline model service. */
	@Autowired
	private IICIPPipelineModelService pipelineModelService;
	
//	@Autowired
//	private ICIPPipelineModelService icippipelineModelService;

	/** The event mapping service. */
	@Autowired
	private IICIPEventJobMappingService eventMappingService;

	/** The model server service. */
	@Autowired
	private ICIPModelServersService modelServerService;

	/** The fileserver service. */
	@Autowired
	private FileServerService fileserverService;

	
	/** The active profiles. */
	@Value("${spring.profiles.active}")
	private String activeProfiles;

	/**
	 * Gets the pipeline models.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the pipeline models
	 * @throws LeapException the leap exception
	 */
	@GetMapping("/all/{org}")
	public ResponseEntity<?> getPipelineModels(@PathVariable(name = "org") String org,
			@RequestParam(name = "search", defaultValue = "", required = false) String search,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size) throws LeapException {
		List<PipelineModelWithoutBlob> result = new ArrayList<>();
		try {
			List<ICIPPipelineModel> pipelineModels = pipelineModelService.getPipelineModelsBySearch(org, search,
					Integer.parseInt(page), Integer.parseInt(size));
			pipelineModels.stream()
					.forEach(pipelinemodel -> result.add(PipelineModelWithoutBlob.convert(pipelinemodel)));
			return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.OK);
		} catch (NumberFormatException e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}
	
	@GetMapping("/allmodels/{org}")
	public ResponseEntity<?> getPipelineModels(@PathVariable(name = "org") String org) throws LeapException {
		List<PipelineModelWithoutBlob> result = new ArrayList<>();
		try {
			List<ICIPPipelineModel> pipelineModels = pipelineModelService.getPipelineModelsByOrg(org);
			pipelineModels.stream()
					.forEach(pipelinemodel -> result.add(PipelineModelWithoutBlob.convert(pipelinemodel)));
			return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.OK);
		} catch (NumberFormatException e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the pipeline models len.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the pipeline models len
	 */
	@GetMapping("/all/len/{org}")
	public ResponseEntity<Long> getPipelineModelsLen(@PathVariable(name = "org") String org,
			@RequestParam(name = "search", defaultValue = "", required = false) String search) {
		return new ResponseEntity<>(pipelineModelService.getPipelineModelsLenBySearch(org, search), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the pipeline model 2.
	 *
	 * @param org       the org
	 * @param modelname the modelname
	 * @return the pipeline model 2
	 */
	@GetMapping("/all/{modelname}/{org}")
	public ResponseEntity<PipelineModelWithoutBlob> getPipelineModel2(@PathVariable(name = "org") String org,
			@PathVariable(name = "modelname") String modelname) {
		return new ResponseEntity<>(PipelineModelWithoutBlob.convert(pipelineModelService.getICIPPipelineModel(modelname, org)), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Adds the model.
	 *
	 * @param pipelineModelStr the pipeline model str
	 * @return the response entity
	 */
	@PostMapping("/save/model")
	public ResponseEntity<PipelineModelWithoutBlob> addModel(@RequestBody String pipelineModelStr) {
		try {
			ObjectMapper mapper = new ObjectMapper();
			ICIPPipelineModelDTO pipelineModelDTO = mapper.readValue(pipelineModelStr, ICIPPipelineModelDTO.class);
			ICIPPipelineModel pipelineModel = null;
			if (pipelineModelDTO.isPipelinemodel()) {
				pipelineModel = pipelineModelService.exposePipelineAsModel(pipelineModelDTO);
			} else {
				Gson gson = new Gson();
				JsonObject metadataJson = gson.fromJson(pipelineModelDTO.getMetadata(), JsonObject.class);
				String modeltype = "";
				if (metadataJson.has("modeltype")) {
					modeltype = metadataJson.get("modeltype").getAsString();
				}
				if (modeltype.trim().equalsIgnoreCase("hostedmodel")) {
					pipelineModel = pipelineModelService.addHostedModel(pipelineModelDTO);
				} else {
					String type = metadataJson.get("type").getAsString();
					switch (type) {
					case "local":
						pipelineModel = pipelineModelService.addModel(pipelineModelDTO);
						break;
					case "kubeflow":
						pipelineModel = pipelineModelService.addKubeflowModel(pipelineModelDTO);
						break;
					default:
						logger.error("Invalid Type");
					}
				}
			}
			return new ResponseEntity<>(PipelineModelWithoutBlob.convert(pipelineModel), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			PipelineModelWithoutBlob errorModel = new PipelineModelWithoutBlob();
			errorModel.setExplanation(ex.getMessage());
			return new ResponseEntity<>(errorModel, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Generate file ID.
	 *
	 * @param org the org
	 * @return the response entity
	 */
	@GetMapping("/generate/fileid")
	public ResponseEntity<String> generateFileID(@RequestParam("org") String org) {
		try {
			return new ResponseEntity<>(fileserverService.generateFileID(org, "model"), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>("Server Error", HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Upload.
	 *
	 * @param fileid   the fileid
	 * @param replace  the replace
	 * @param org the org
	 * @param metadata the metadata
	 * @param file     the file
	 * @return the response entity
	 */
	@PostMapping(value = "/upload/{fileid}/{replace}/{org}", consumes = { "multipart/form-data" })
	public ResponseEntity<Void> upload(@PathVariable("fileid") String fileid, @PathVariable("replace") boolean replace,
			@PathVariable("org") String org, @RequestPart("chunkMetadata") String metadata,
			@RequestPart("file") MultipartFile file) {
		return uploadFile(fileid, metadata, file, replace, org, null);
	}

	/**
	 * Upload extra files.
	 *
	 * @param folder   the folder
	 * @param fileid   the fileid
	 * @param replace  the replace
	 * @param org the org
	 * @param metadata the metadata
	 * @param file     the file
	 * @return the response entity
	 */
	@PostMapping(value = "/upload/{folder}/{fileid}/{replace}/{org}", consumes = { "multipart/form-data" })
	public ResponseEntity<Void> uploadExtraFiles(@PathVariable("folder") String folder,
			@PathVariable("fileid") String fileid, @PathVariable("replace") boolean replace,
			@PathVariable("org") String org, @RequestPart("chunkMetadata") String metadata,
			@RequestPart("file") MultipartFile file) {
		return uploadFile(fileid, metadata, file, replace, org, folder);
	}

	/**
	 * Deploy.
	 *
	 * @param authserviceSession the authservice session
	 * @param fileid             the fileid
	 * @return the response entity
	 */
	@GetMapping(value = "/deploy/{fileid}")
	public ResponseEntity<String> deploy(@CookieValue("authservice_session") String authserviceSession,
			@PathVariable("fileid") String fileid) {
		logger.info("request to deploy model");
		try {
			return new ResponseEntity<>(pipelineModelService.deploy(fileid, authserviceSession), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the deploy status.
	 *
	 * @param authserviceSession the authservice session
	 * @param fileid             the fileid
	 * @return the deploy status
	 */
	@GetMapping(value = "/deploy/status/{fileid}")
	public ResponseEntity<String[]> getDeployStatus(@CookieValue("authservice_session") String authserviceSession,
			@PathVariable("fileid") String fileid) {
		logger.info("request to deploy model");
		try {
			return new ResponseEntity<>(pipelineModelService.updateDeployStatus(fileid, authserviceSession),
					HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(new String[] { "BAD_REQUEST", ex.getMessage() }, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Update pipeline model percent.
	 *
	 * @param id      the id
	 * @param percent the percent
	 * @return the response entity
	 */
	@GetMapping("/update/percent/{id}/{percent}")
	public ResponseEntity<PipelineModelWithoutBlob> updatePipelineModelPercent(@PathVariable("id") String id,
			@PathVariable("percent") Integer percent) {
		ICIPPipelineModel pipelineModel = pipelineModelService.findByFileId(id);
		if (percent > pipelineModel.getServerupload()) {
			pipelineModel.setServerupload(percent);
			pipelineModel = pipelineModelService.save(pipelineModel);
		}
		return new ResponseEntity<>(PipelineModelWithoutBlob.convert(pipelineModel), HttpStatus.OK);
	}

	/**
	 * Update local percent.
	 *
	 * @param id      the id
	 * @param percent the percent
	 * @return the response entity
	 */
	@GetMapping("/update/local/percent/{id}/{percent}")
	public ResponseEntity<PipelineModelWithoutBlob> updateLocalPercent(@PathVariable("id") String id,
			@PathVariable("percent") Integer percent) {
		ICIPPipelineModel pipelineModel = pipelineModelService.findByFileId(id);
		if (percent > pipelineModel.getLocalupload()) {
			pipelineModel.setLocalupload(percent);
			pipelineModel = pipelineModelService.save(pipelineModel);
		}
		return new ResponseEntity<>(PipelineModelWithoutBlob.convert(pipelineModel), HttpStatus.OK);
	}

	/**
	 * Run pipeline.
	 *
	 * @param fileid    the fileid
	 * @param inputjson the inputjson
	 * @return the response entity
	 */
	@PostMapping(value = "/run/server/{fileid}", produces = "application/json")
	public @ResponseBody ResponseEntity<String> runPipeline(@PathVariable(name = "fileid") String fileid,
			@RequestBody JSONObject inputjson) {
		String params = inputjson.toJSONString();
		try {
			logger.info("request to run pipeline model through model server - fileid : {}", fileid);
			return new ResponseEntity<>( pipelineModelService.runPipelineModel(fileid, params), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(String.format("%s : %s", "Triggering Error", e.getMessage()),
					HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Run pipeline.
	 *
	 * @param org       the org
	 * @param modelname the modelname
	 * @param inputjson the inputjson
	 * @return the response entity
	 */
	@PostMapping(value = "/run/{modelname}/{org}", produces = "application/json")
	public @ResponseBody ResponseEntity<String> runPipeline(@PathVariable(name = "org") String org,
			@PathVariable(name = "modelname") String modelname, @RequestBody JSONObject inputjson) {
		String params = inputjson.toJSONString();
		String name = modelname.trim();
		try {
			logger.info("request to trigger job event");
			if (eventMappingService.isValidEvent(name, org)) {
				return new ResponseEntity<>( pipelineModelService.runPipelineAsModel(org, params, name), HttpStatus.OK);
			}
			return new ResponseEntity<>("Invalid Event Details", HttpStatus.BAD_REQUEST);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(
					"{\"Triggering Error\":\"" + e.getClass().getCanonicalName() + " - " + e.getMessage() + "\"}",
					HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Delete model.
	 *
	 * @param id the id
	 * @throws URISyntaxException the URI syntax exception
	 */
	@DeleteMapping("/{id}")
	public void deleteModel(@PathVariable(name = "id") int id) throws URISyntaxException {
		try {
			if (pipelineModelService.findById(id).getFileid() != null) {
				pipelineModelService.deleteFile(pipelineModelService.findById(id).getFileid(), pipelineModelService.findById(id).getOrganization());
			}
			JsonObject json = new Gson().fromJson(pipelineModelService.findById(id).getMetadata(), JsonObject.class);
			if (json.has("type") && json.get("type").getAsString().equalsIgnoreCase("local")) {
				ICIPModelServers modelServer = modelServerService.findById(pipelineModelService.findById(id).getModelserver());
				String deleteUrl = String.format("%s%s%s%s%d", modelServer.getUrl(), "/delete/",
						pipelineModelService.findById(id).getFileid(), "/", pipelineModelService.findById(id).getId());
				pipelineModelService.deleteModelFromModelServer(deleteUrl);
			}
		} catch (Exception ex) {
			logger.error("URL incorrect : {}", ex.getMessage());
		}
		pipelineModelService.deleteById(id);
	}

	/**
	 * Gets the model.
	 *
	 * @param id the id
	 * @return the model
	 */
	@GetMapping("/{id}")
	public ResponseEntity<PipelineModelWithoutBlob> getModel(@PathVariable(name = "id") int id) {
		ICIPPipelineModel pipelineModel = pipelineModelService.findById(id);
		return new ResponseEntity<>(PipelineModelWithoutBlob.convert(pipelineModel), HttpStatus.OK);
	}

	/**
	 * Gets the load scripts.
	 *
	 * @param id the id
	 * @return the load scripts
	 */
	@GetMapping("/loadscript/{id}")
	public ResponseEntity<List<String>> getLoadScripts(@PathVariable(name = "id") int id) {
		try {
			return new ResponseEntity<>(pipelineModelService.getStringFromBlob(pipelineModelService.findById(id).getLoadscript()), HttpStatus.OK);
		} catch (Exception ex) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the execution scripts.
	 *
	 * @param id the id
	 * @return the execution scripts
	 */
	@GetMapping("/executionscript/{id}")
	public ResponseEntity<List<String>> getExecutionScripts(@PathVariable(name = "id") int id) {
		try {
			ICIPPipelineModel pipelineModel = pipelineModelService.findById(id);
			return new ResponseEntity<>( pipelineModelService.getStringFromBlob(pipelineModel.getExecutionscript()), HttpStatus.OK);
		} catch (Exception ex) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Checks if is local active.
	 *
	 * @return the response entity
	 */
	@GetMapping("/isLocalActive")
	public ResponseEntity<Boolean> isLocalActive() {
		return new ResponseEntity<>(Boolean.TRUE, HttpStatus.OK);
	}

	/**
	 * Checks if is kubeflow active.
	 *
	 * @return the response entity
	 */
	@GetMapping("/isKubeflowActive")
	public ResponseEntity<Boolean> isKubeflowActive() {
		return new ResponseEntity<>(activeProfiles.contains("aicloud"), HttpStatus.OK);
	}

	/**
	 * Upload file.
	 *
	 * @param fileid      the fileid
	 * @param metadata    the metadata
	 * @param file        the file
	 * @param replace the replace
	 * @param org the org
	 * @param folder the folder
	 * @return the response entity
	 */
	private ResponseEntity<Void> uploadFile(String fileid, String metadata, MultipartFile file, boolean replace,
			String org, String folder) {
		logger.info("request to upload model with fileid {}", fileid);
		try {
			ObjectMapper mapper = new ObjectMapper();
			ICIPChunkMetaData chunkMetaData = mapper.readValue(metadata, ICIPChunkMetaData.class);
			pipelineModelService.uploadModel(file, fileid, chunkMetaData, replace, org, folder);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
		}
		return new ResponseEntity<>(HttpStatus.OK);
	}
	@PostMapping("/add")
//	public ResponseEntity<ICIPPipelineModel> createPipelineModel(@RequestBody ICIPPipelineModelDTO modelDTO)
//			throws URISyntaxException {
	public ResponseEntity<Void> createPipelineModel(@RequestBody ICIPPipelineModelDTO modelDTO)
			throws URISyntaxException {
		try {
		ModelMapper modelmapper = new ModelMapper();
		JSONObject metadata1 = new JSONObject();

		metadata1.put("createdtime",(Timestamp.from(Instant.now()).toString()));
		metadata1.put("type", modelDTO.getType());
		metadata1.put("version", modelDTO.getVersion());
		metadata1.put("modifiedtime",(Timestamp.from(Instant.now()).toString()));
		metadata1.put("modeltype",modelDTO.getModeltype());
		metadata1.put("framework",modelDTO.getFramework());
		metadata1.put("pushtocodestore",modelDTO.isPushtocodestore());
		metadata1.put("public",modelDTO.isTopublic());
		metadata1.put("overwrite",modelDTO.isOverwrite());
		metadata1.put("summary",modelDTO.getSummary());
		metadata1.put("taginfo",modelDTO.getTaginfo());
		metadata1.put("frameworkVersion",modelDTO.getFrameworkVersion());
		metadata1.put("modelClassName",modelDTO.getModelClassName());
		metadata1.put("inferenceClassName",modelDTO.getInferenceClassName());
		metadata1.put("filePath",modelDTO.getFilePath());
		metadata1.put("inputType",modelDTO.getInputType());
		modelDTO.setMetadata(metadata1.toString());
		ICIPPipelineModel model = modelmapper.map(modelDTO, ICIPPipelineModel.class);
		model.setModelserver(0);
		model.setStatus(0);
		model.setError(0);
		model.setExecutionscript(null);
		model.setLocalupload(0);
		model.setServerupload(0);
	
		model = pipelineModelService.save(model);
		logger.info("creating model");
//		return ResponseEntity.created(new URI("/api/pipelinemodels/add" + model.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, model.getId().toString())).body(model);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
		}
		return new ResponseEntity<>(HttpStatus.CREATED);
		
	}
	

	@PostMapping("/edit")
	public ResponseEntity<ICIPPipelineModel> editPipelineModel(@RequestBody ICIPPipelineModelDTO modelDTO)
			throws URISyntaxException {
		ICIPPipelineModel model = pipelineModelService.findById(modelDTO.getModelId());
		
		model.setDescription(modelDTO.getDescription());
		JSONObject metadata1 = new JSONObject();
		Gson gson = new Gson();
		JsonObject metadataJson = gson.fromJson(model.getMetadata(), JsonObject.class);
		metadata1.put("createdtime",metadataJson.get("createdtime"));
		metadata1.put("type", modelDTO.getType());
		metadata1.put("version", modelDTO.getVersion());
		metadata1.put("modifiedtime",(Timestamp.from(Instant.now()).toString()));
		metadata1.put("modeltype",modelDTO.getModeltype());
		metadata1.put("framework",modelDTO.getFramework());
		metadata1.put("pushtocodestore",modelDTO.isPushtocodestore());
		metadata1.put("public",modelDTO.isTopublic());
		metadata1.put("overwrite",modelDTO.isOverwrite());
		metadata1.put("summary",modelDTO.getSummary());
		metadata1.put("taginfo",modelDTO.getTaginfo());
		metadata1.put("frameworkVersion",modelDTO.getFrameworkVersion());
		metadata1.put("modelClassName",modelDTO.getModelClassName());
		metadata1.put("inferenceClassName",modelDTO.getInferenceClassName());
		metadata1.put("filePath",modelDTO.getFilePath());
		metadata1.put("inputType",modelDTO.getInputType());
		model.setMetadata(metadata1.toString());
		model.setModelname(modelDTO.getModelname());
		model.setDescription(modelDTO.getDescription());
		model.setApispec(modelDTO.getApispec());
		model.setFileid(modelDTO.getFileid());
		model.setModelpath(modelDTO.getModelpath());
		model = pipelineModelService.save(model);

		logger.info("updating model");
		return ResponseEntity.created(new URI("/api/pipelinemodels/edit" + model.getId()))
				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, model.getId().toString())).body(model);
	}
}