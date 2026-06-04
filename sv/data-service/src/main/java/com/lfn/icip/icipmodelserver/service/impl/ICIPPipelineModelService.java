/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipmodelserver.service.impl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.UnknownHostException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Blob;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.apache.commons.lang3.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipmodelserver.constants.PipelineExposeConstants;
import com.lfn.icip.icipmodelserver.model.ICIPModelServers;
import com.lfn.icip.icipmodelserver.model.ICIPPipelineModel;
import com.lfn.icip.icipmodelserver.model.dto.ICIPPipelineModelDTO;
import com.lfn.icip.icipmodelserver.repository.ICIPPipelineModelRepository;
import com.lfn.icip.icipmodelserver.repository.postgresql.ICIPPipelineModelRepositoryPOSTGRESQL;
import com.lfn.icip.icipmodelserver.service.IICIPPipelineModelService;
import com.lfn.icip.icipwebeditor.event.model.ModelBootstrapEvent;
import com.lfn.icip.icipwebeditor.event.model.PipelineEvent;
import com.lfn.icip.icipwebeditor.event.publisher.ModelBootstrapEventPublisher;
import com.lfn.icip.icipwebeditor.event.publisher.PipelineEventPublisher;
import com.lfn.icip.icipwebeditor.exception.IcipIaiException;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.lfn.icip.icipwebeditor.job.ICIPNativeServiceJob;
import com.lfn.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.service.IICIPEventJobMappingService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;


// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModelService.
 *
 * @author essedum
 */
@SuppressWarnings("deprecation")
@Service
@RefreshScope
public class ICIPPipelineModelService implements IICIPPipelineModelService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPipelineModelService.class);

	/** The Constant joblog. */
	private static final Logger joblog = LoggerFactory.getLogger(JobLogger.class);

	/** The i CIP pipeline model repository. */
	@Autowired
	private ICIPPipelineModelRepository iCIPPipelineModelRepository;

	private ICIPPipelineModelRepositoryPOSTGRESQL iCIPPipelineModelRepositoryPostgreSQL;
	/** The i CIP streaming service service. */
	@Autowired
	private IICIPStreamingServiceService iCIPStreamingServiceService;

	/** The event mapping service. */
	@Autowired
	private IICIPEventJobMappingService eventMappingService;

	/** The model server service. */
	@Autowired
	private ICIPModelServersService modelServerService;

	/** The rest template. */
	@Autowired
	private RestTemplate restTemplate;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/** The folder path. */
	@EssedumProperty("icip.jobLogFileDir")
	private String folderPath;

	/** The kubeflow deploy url. */
	@EssedumProperty("icip.urls.kubeflowdeploy")
	private String kubeflowDeployUrl;

	/** The kubeflow status url. */
	@EssedumProperty("icip.urls.kubeflowstatus")
	private String kubeflowStatusUrl;

	/** The event publisher. */
	@Autowired
	@Qualifier("pipelineEventPublisher")
	private PipelineEventPublisher eventPublisher;

	/** The model bootstrap service. */
	@Autowired
	@Qualifier("modelBootstrapEventPublisherBean")
	private ModelBootstrapEventPublisher.ModelBootstrapService modelBootstrapService;

	/** The file server service. */
	@Autowired
	private FileServerService fileServerService;

	/** The Constant DPLMID. */
	private static final String DPLMID = "dplmId";

	/** The Constant STATUS. */
	private static final String STATUS = "status";

	/** The Constant ESSEDUM_URL. */
	private static final String ESSEDUM_URL = "@!url!@";

	/**
	 * Gets the pipeline models.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the pipeline models
	 */
	@Override
	public List<ICIPPipelineModel> getPipelineModels(String org, int page, int size) {
		return iCIPPipelineModelRepository.findByOrganization(org,
				PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id")));
	}

	/**
	 * Gets the pipeline models len.
	 *
	 * @param org the org
	 * @return the pipeline models len
	 */
	@Override
	public Long getPipelineModelsLen(String org) {
		return iCIPPipelineModelRepository.countByOrganization(org);
	}

	/**
	 * Gets the ICIP pipeline model 2.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP pipeline model 2
	 */
	@Override
	public ICIPPipelineModel getICIPPipelineModel(String name, String org) {
		return iCIPPipelineModelRepository.findByModelnameAndOrganization(name, org);
	}

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean renameProject(String fromProjectId, String toProjectId) {
		Long count = iCIPPipelineModelRepository.countByOrganization(fromProjectId);
		List<ICIPPipelineModel> dsets = iCIPPipelineModelRepository.findByOrganization(fromProjectId,
				PageRequest.of(0, Integer.parseInt(String.valueOf(count)), Sort.by(Sort.Direction.ASC, "id")));
		dsets.stream().forEach(ds -> {
			ds.setOrganization(toProjectId);
			iCIPPipelineModelRepository.save(ds);
		});
		return true;
	}

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(String fromProjectId, String toProjectId) {
		logger.info("Fetching groups for Entity {}", fromProjectId);
		Long count = iCIPPipelineModelRepository.countByOrganization(fromProjectId);
		List<ICIPPipelineModel> pipeMod = iCIPPipelineModelRepository.findByOrganization(fromProjectId,
				PageRequest.of(0, Integer.parseInt(String.valueOf(count)), Sort.by(Sort.Direction.ASC, "id")));
		List<ICIPPipelineModel> toMod = pipeMod.parallelStream().map(model -> {
			model.setId(null);
			model.setOrganization(toProjectId);
			return model;
		}).collect(Collectors.toList());
		toMod.stream().forEach(model -> iCIPPipelineModelRepository.save(model));
		return true;
	}

	/**
	 * Gets the pipeline models by search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the pipeline models by search
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public List<ICIPPipelineModel> getPipelineModelsBySearch(String org, String search, int page, int size)
			throws EssedumException {
		return iCIPPipelineModelRepository.findByOrganizationAndSearch(org, search, PageRequest.of(page, size));
	}

	/**
	 * Gets the pipeline models len by search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the pipeline models len by search
	 */
	@Override
	public Long getPipelineModelsLenBySearch(String org, String search) {
		return iCIPPipelineModelRepository.countByOrganizationAndSearch(org, search);
	}

	/**
	 * Save.
	 *
	 * @param pipelineModel the pipeline model
	 * @return the ICIP pipeline model
	 */
	@Override
	public ICIPPipelineModel save(ICIPPipelineModel pipelineModel) {
		logger.info("Saving PipelineModel");
//		return iCIPPipelineModelRepository.save(pipelineModel);
		return iCIPPipelineModelRepository.customSave(pipelineModel);
	}

	/**
	 * Upload model.
	 *
	 * @param multipartfile the multipartfile
	 * @param fileid        the fileid
	 * @param metadata      the metadata
	 * @param replace the replace
	 * @param org the org
	 * @param folder the folder
	 * @throws Exception the exception
	 */
	@Override
	public void uploadModel(MultipartFile multipartfile, String fileid, ICIPChunkMetaData metadata, boolean replace,
			String org, String folder) throws Exception {
		String filenamekey = folder != null ? folder : PipelineExposeConstants.FILENAME;
		// initializing local and server percent
		if (metadata.getIndex() == 0) {
			ICIPPipelineModel pipelineModel = iCIPPipelineModelRepository.findByFileid(fileid);
			pipelineModel.setLocalupload(0);
			pipelineModel.setServerupload(0);
			JsonObject json = new Gson().fromJson(pipelineModel.getMetadata(), JsonObject.class);
			json.addProperty("submittedBy", ICIPUtils.getUser(claim));
			json.addProperty(filenamekey, metadata.getFileName());
			pipelineModel.setMetadata(json.toString());
			iCIPPipelineModelRepository.save(pipelineModel);
		}
		Path localPath = Paths.get(folderPath, PipelineExposeConstants.MODELDIRECTORY, fileid, filenamekey,
				String.valueOf(metadata.getIndex()));
		Files.createDirectories(localPath.getParent());
		multipartfile.transferTo(localPath);
		fileServerService.uploadExtraFiles(localPath, folder, fileid, metadata.getTotalCount(), replace, org);
	}

	/**
	 * Delete file.
	 *
	 * @param fileid the fileid
	 * @param org the org
	 */
	@Override
	public void deleteFile(String fileid, String org) {
		try {

			fileServerService.delete(fileid, org);
		} catch (Exception ex) {
			logger.error("Error in deleting file from file server : {}", ex.getMessage(), ex);
		}
	}

	/**
	 * Delete model from model server.
	 *
	 * @param url the url
	 */
	@Override
	public void deleteModelFromModelServer(String url) {
		try {
			restTemplate.delete(url);
		} catch (Exception ex) {
			logger.error("Error in deleting model from model server : {}", ex.getMessage(), ex);
		}
	}

	/**
	 * Expose pipeline as model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws EssedumException the essedum exception
	 * @throws SQLException  the SQL exception
	 */
	@Override
	public ICIPPipelineModel exposePipelineAsModel(ICIPPipelineModelDTO pipelineModelDTO)
			throws EssedumException, SQLException {
		String name = pipelineModelDTO.getModelpath();
		String org = pipelineModelDTO.getOrg();
		ICIPStreamingServices pipeline = iCIPStreamingServiceService.getICIPStreamingServices(name, org);
		Gson gson = new Gson();
		JsonElement jsonContent = gson.fromJson(pipeline.getJsonContent(), JsonElement.class);
		updateRestNode(jsonContent);
		pipeline.setJsonContent(jsonContent.toString());
		iCIPStreamingServiceService.save(pipeline);
		String eventName = name + PipelineExposeConstants.DEFAULT_EVENT_STRING;
		ICIPEventJobMapping event = getEvent(name, org, eventName);
		ICIPPipelineModel pipelineModel = new ICIPPipelineModel();
		pipelineModel = initializeValueInPipelineModel(pipelineModelDTO, pipelineModel);
		pipelineModel.setModelpath(pipelineModelDTO.getModelpath());
		pipelineModel.setStatus(1);
		pipelineModel.setError(0);
		String newkey = "/" + event.getEventname() + "/" + event.getOrganization();
		String newUrl = ESSEDUM_URL + "/api/pipelinemodels/run";
		updateApiSpec(pipelineModel, newkey, newUrl);
		pipelineModel = save(pipelineModel);
		return pipelineModel;
	}

	/**
	 * Adds the hosted model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws EssedumException the essedum exception
	 * @throws SQLException  the SQL exception
	 */
	@Override
	public ICIPPipelineModel addHostedModel(ICIPPipelineModelDTO pipelineModelDTO) throws EssedumException, SQLException {
		ICIPPipelineModel pipelineModel = new ICIPPipelineModel();
		pipelineModel = initializeValueInPipelineModel(pipelineModelDTO, pipelineModel);
		pipelineModel.setModelpath(pipelineModelDTO.getModelpath());
		pipelineModel.setStatus(1);
		pipelineModel.setError(0);
		return save(pipelineModel);
	}

	/**
	 * Gets the event.
	 *
	 * @param name      the name
	 * @param org       the org
	 * @param eventName the event name
	 * @return the event
	 */
	private ICIPEventJobMapping getEvent(String name, String org, String eventName) {
		ICIPEventJobMapping event = eventMappingService.findByEventName(eventName, org);
		if (event == null) {
			event = new ICIPEventJobMapping();
			event.setEventname(eventName);
			event.setJobdetails("[{\"name\":\"" + name + "\", \"type\":\"pipeline\"}]");
			event.setOrganization(org);
			event = eventMappingService.save(event);
		}
		return event;
	}

	/**
	 * Removes the special character.
	 *
	 * @param name the name
	 * @return the string
	 */
	private String removeSpecialCharacter(String name) {
		return name.replaceAll("[^a-zA-Z0-9_]", "");
	}

	/**
	 * Update api spec.
	 *
	 * @param pipelineModel the pipeline model
	 * @param newkey        the newkey
	 * @param newUrl        the new url
	 */
	private void updateApiSpec(ICIPPipelineModel pipelineModel, String newkey, String newUrl) {
		Gson gson = new Gson();
		JsonElement apispec = gson.fromJson(pipelineModel.getApispec(), JsonElement.class);
		if (apispec != null && apispec.isJsonObject()) {
			JsonObject apiSpecObject = apispec.getAsJsonObject();
			JsonArray servers = apiSpecObject.get("servers").getAsJsonArray();
			JsonObject url = servers.get(0).getAsJsonObject();
			url.addProperty("url", newUrl);
			servers.set(0, url);
			JsonObject paths = apiSpecObject.get("paths").getAsJsonObject();
			Set<String> keys = paths.keySet();
			Set<String> sameKeys = new HashSet<>();
			Iterator<String> iterator = keys.iterator();
			while (iterator.hasNext()) {
				String key = iterator.next();
				paths.add(newkey, paths.get(key));
				sameKeys.add(key);
			}
			sameKeys.parallelStream().forEach(key -> paths.remove(key));
			apiSpecObject.add("paths", paths);
			if (newUrl != null) {
				apiSpecObject.add("servers", servers);
			}
			try {
				pipelineModel.setApispec(apiSpecObject.getAsString());
			} catch (Exception ex) {
				pipelineModel.setApispec(apiSpecObject.toString());
			}
		}
	}

	/**
	 * Initialize value in pipeline model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @param pipelineModel    the pipeline model
	 * @return the ICIP pipeline model
	 * @throws SQLException the SQL exception
	 */
	@Override
	public ICIPPipelineModel initializeValueInPipelineModel(ICIPPipelineModelDTO pipelineModelDTO,
			ICIPPipelineModel pipelineModel) throws SQLException {
		if (pipelineModelDTO.getId() != null) {
			pipelineModel = iCIPPipelineModelRepository.findById(pipelineModelDTO.getId())
					.orElse(new ICIPPipelineModel());
		}
		pipelineModel.setDescription(pipelineModelDTO.getDescription());
		pipelineModel.setApispec(pipelineModelDTO.getApispec());
		pipelineModel.setModelname(pipelineModelDTO.getModelname());
		pipelineModel.setOrganization(pipelineModelDTO.getOrg());
		pipelineModel.setMetadata(pipelineModelDTO.getMetadata());
		return pipelineModel;
	}

	/**
	 * Gets the string from blob.
	 *
	 * @param blob the blob
	 * @return the string from blob
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 */
	@Override
	public List<String> getStringFromBlob(Blob blob) throws IOException, SQLException {
		List<String> script = new ArrayList<>();
		InputStream is = blob.getBinaryStream();
		try (BufferedReader br = new BufferedReader(new InputStreamReader(is), 2048)) {
			String line;
			while ((line = br.readLine()) != null) {
				script.add(line);
			}
			return script;
		}
	}

	/**
	 * Gets the blob from string array.
	 *
	 * @param scripts the scripts
	 * @return the blob from string array
	 * @throws SQLException the SQL exception
	 */
	private SerialBlob getBlobFromStringArray(String[] scripts) throws SQLException {
		SerialBlob blob = null;
		StringBuilder strBuilder = new StringBuilder();
		for (String script : scripts) {
			strBuilder.append(script).append('\n');
		}
		byte[] scriptBytes = strBuilder.toString().getBytes();
		blob = new SerialBlob(scriptBytes);
		return blob;
	}

	/**
	 * Update rest node.
	 *
	 * @param jsonContent the json content
	 * @throws EssedumException the essedum exception
	 */
	private void updateRestNode(JsonElement jsonContent) throws EssedumException {
		if (jsonContent != null && jsonContent.isJsonObject()) {
			JsonObject jsonContentObject = jsonContent.getAsJsonObject();
			JsonElement element = jsonContentObject.get("elements");
			if (element != null && element.isJsonArray()) {
				JsonArray elementArray = element.getAsJsonArray();
				JsonElement firstElement = elementArray.get(0);
				if (firstElement != null && firstElement.isJsonObject()) {
					Gson gson = new Gson();
					JsonObject firstElementObject = firstElement.getAsJsonObject();
					JsonElement attributes = firstElementObject.get("attributes");
					if (attributes != null && attributes.isJsonObject()) {
						JsonObject attributesObject = attributes.getAsJsonObject();
						addRestNode(attributesObject);
					} else {
						try {
							String unescapedString = StringEscapeUtils.unescapeJava(attributes.toString());
							JsonObject attributesObject = gson.fromJson(
									unescapedString.substring(1, unescapedString.length() - 1), JsonObject.class);
							addRestNode(attributesObject);
						} catch (Exception jsonex) {
							throw new EssedumException("Unable to find attributes in json_content");
						}
					}
				} else {
					throw new EssedumException("Unable to find elements in json_content");
				}
			} else {
				throw new EssedumException("Unable to find elements in json_content");
			}
		} else {
			throw new EssedumException("Unable to parse json_content");
		}
	}

	/**
	 * Adds the rest node.
	 *
	 * @param attributesObject the attributes object
	 * @throws EssedumException the essedum exception
	 */
	private void addRestNode(JsonObject attributesObject) throws EssedumException {
		if (attributesObject != null) {
			attributesObject.addProperty("restnode", true);
		} else {
			throw new EssedumException("Unable to find attributes in json_content");
		}
	}

	/**
	 * Delete by id.
	 *
	 * @param id the id
	 */
	@Override
	public void deleteById(int id) {
		iCIPPipelineModelRepository.deleteById(id);
	}

	/**
	 * Update status by id.
	 *
	 * @param id     the id
	 * @param status the status
	 * @return the ICIP pipeline model
	 */
	@Override
	public ICIPPipelineModel updateStatusById(Integer id, Integer status) {
		ICIPPipelineModel pipelineModel = this.findById(id);
		if (pipelineModel != null) {
			pipelineModel.setStatus(status);
		}
		return this.save(pipelineModel);
	}

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP pipeline model
	 */
	@Override
	public ICIPPipelineModel findById(Integer id) {
		return iCIPPipelineModelRepository.findById(id).orElse(null);
	}

	/**
	 * Adds the model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws SQLException the SQL exception
	 */
	@Override
	public ICIPPipelineModel addModel(ICIPPipelineModelDTO pipelineModelDTO) throws SQLException {
		ICIPPipelineModel pipelineModel = new ICIPPipelineModel();
		pipelineModel = initializeValueInPipelineModel(pipelineModelDTO, pipelineModel);
		pipelineModel.setFileid(pipelineModelDTO.getFileid());
		pipelineModel.setModelserver(null);
		pipelineModel.setStatus(0);
		pipelineModel.setError(0);
		pipelineModel.setExecutionscript(getBlobFromStringArray(pipelineModelDTO.getExecutionscript()));
		pipelineModel.setLoadscript(getBlobFromStringArray(pipelineModelDTO.getLoadscript()));
		String newUrl = ESSEDUM_URL + "/api/pipelinemodels/run/server";
		updateApiSpec(pipelineModel, "/" + pipelineModelDTO.getFileid(), newUrl);
		pipelineModel = save(pipelineModel);
		return pipelineModel;
	}

	/**
	 * Adds the kubeflow model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws SQLException the SQL exception
	 */
	@Override
	public ICIPPipelineModel addKubeflowModel(ICIPPipelineModelDTO pipelineModelDTO) throws SQLException {
		ICIPPipelineModel pipelineModel = new ICIPPipelineModel();
		pipelineModel = initializeValueInPipelineModel(pipelineModelDTO, pipelineModel);
		pipelineModel.setFileid(pipelineModelDTO.getFileid());
		pipelineModel.setModelserver(null);
		pipelineModel.setModelpath(pipelineModelDTO.getModelpath());
		pipelineModel.setStatus(0);
		pipelineModel.setError(0);
		pipelineModel = save(pipelineModel);
		return pipelineModel;
	}

	/**
	 * Deploy.
	 *
	 * @param fileid             the fileid
	 * @param authserviceSession the authservice session
	 * @return the string
	 * @throws Exception the exception
	 */
	@Override
	public String deploy(String fileid, String authserviceSession) throws Exception {
		ICIPPipelineModel model = findByFileId(fileid);
		String org = model.getOrganization();
		Gson gson = new Gson();
		JsonObject json = gson.fromJson(model.getMetadata(), JsonObject.class);
		String filename = getValueFromJson(json, PipelineExposeConstants.FILENAME);
		String inferenceClassFileName = getValueFromJson(json, "inferenceClass");
		String modelClassFileName = getValueFromJson(json, "modelClass");
		String requirementsFileName = getValueFromJson(json, "requirements");
		String version = getValueFromJson(json, "version");
		String framework = getValueFromJson(json, "framework");
		String pushToCodeStore = getValueFromJson(json, "pushtocodestore");
		String publicFlag = getValueFromJson(json, "public");
		String isOverwrite = getValueFromJson(json, "overwrite");
		String summary = getValueFromJson(json, "summary");
		String taginfo = getValueFromJson(json, "taginfo");
		String frameworkVersion = getValueFromJson(json, "frameworkVersion");
		String inferenceClassName = getValueFromJson(json, "inferenceClassName");
		String modelClassName = getValueFromJson(json, "modelClassName");
		String filePath = getValueFromJson(json, "filePath");
		String inputType = getValueFromJson(json, "inputType");
		String modelname = model.getModelname();
		String modeldesc = model.getDescription();
		String usecase = model.getModelpath();
		String user = ICIPUtils.getUser(claim);
		String sourceSystem = "essedum";
		String url = String.format("%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s",
				kubeflowDeployUrl, "?modelDesc=", modeldesc, "&modelName=", modelname, "&sourceSystem=", sourceSystem,
				"&pushToCodestore=", pushToCodeStore, "&usecaseDesc=", usecase, "&modelVersion=", version,
				"&framework=", framework, "&isOverWrite=", isOverwrite, "&modelSummary=", summary, "&tagInfo=", taginfo,
				"&userName=", user, "&filePath=", filePath, "&frameworkVersion=", frameworkVersion,
				"&inferenceClassName=", inferenceClassName, "&modelClassName=", modelClassName, "&scope=",
				getScope(publicFlag), "&inputType=", inputType);
		String response = fileServerService.deploy(authserviceSession, url, filename, inferenceClassFileName,
				modelClassFileName, requirementsFileName, fileid, org);
		JsonObject responseObject = gson.fromJson(response, JsonObject.class);
		String responseStatus = getValueFromJson(responseObject, STATUS);
		if (responseStatus.equalsIgnoreCase("success")) {
			JsonObject dataObject = gson.fromJson(getValueFromJson(responseObject, "data"), JsonObject.class);
			json.addProperty(DPLMID, getValueFromJson(dataObject, DPLMID));
			String status = getValueFromJson(dataObject, STATUS);
			if (status.equals("DEPL_SUCCESS")) {
				updateModelWithDplmUrl(model, json, dataObject);
			}
			model.setMetadata(json.toString());
			save(model);
			return status;
		} else {
			throw new IcipIaiException(getValueFromJson(responseObject, "errorMessage"));
		}
	}

	/**
	 * Gets the scope.
	 *
	 * @param publicFlag the public flag
	 * @return the scope
	 */
	private String getScope(String publicFlag) {
		String scope = "public";
		if (!publicFlag.trim().isEmpty() && publicFlag.trim().equalsIgnoreCase("false")) {
			scope = "private";
		}
		return scope;
	}

	/**
	 * Gets the value from json.
	 *
	 * @param json the json
	 * @param key  the key
	 * @return the value from json
	 */
	private String getValueFromJson(JsonObject json, String key) {
		if (json.has(key)) {
			try {
				return json.get(key).getAsString();
			} catch (Exception ex) {
				return json.get(key).toString();
			}
		}
		return "";
	}

	/**
	 * Update model with dplm url.
	 *
	 * @param model      the model
	 * @param json       the json
	 * @param dataObject the data object
	 */
	private void updateModelWithDplmUrl(ICIPPipelineModel model, JsonObject json, JsonObject dataObject) {
		model.setStatus(1);
		String dplmUrl = getValueFromJson(dataObject, "dplmUrl");
		int lastindex = dplmUrl.lastIndexOf("/");
		json.addProperty("dplmUrl", dplmUrl);
		json.addProperty("codestoreUrl", getValueFromJson(dataObject, "codestoreUrl"));
		json.addProperty("tryoutUrl", getValueFromJson(dataObject, "tryoutUrl"));
		updateApiSpec(model, dplmUrl.substring(lastindex), dplmUrl.substring(0, lastindex));
	}

	/**
	 * Update deploy status.
	 *
	 * @param fileid             the fileid
	 * @param authserviceSession the authservice session
	 * @return the string[]
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException   the execution exception
	 * @throws TimeoutException     the timeout exception
	 */
	@Override
	public String[] updateDeployStatus(String fileid, String authserviceSession)
			throws InterruptedException, ExecutionException, TimeoutException {
		ICIPPipelineModel model = findByFileId(fileid);
		Gson gson = new Gson();
		JsonObject json = gson.fromJson(model.getMetadata(), JsonObject.class);
		String dplmId = getValueFromJson(json, DPLMID);
		String url = String.format("%s%s%s", kubeflowStatusUrl, "/", dplmId);
		HttpHeaders headers = new HttpHeaders();
		headers.add("Cookie", String.format("%s%s", "authservice_session=", authserviceSession));
		HttpEntity request = new HttpEntity(headers);
		ResponseEntity<String> results = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
		logger.info("Deployment Status URL : {}", url);
		logger.info("Deployment Status Header : {}", request);
		CompletableFuture<String> completeFuture = CompletableFuture.completedFuture(results.getBody());
		String response = completeFuture.get(2, TimeUnit.MINUTES);
		logger.info("Deployment Status Response : {}", response);
		JsonObject dataObject = gson.fromJson(response, JsonObject.class);
		String status = getValueFromJson(dataObject, STATUS);
		if (status.equals("DEPL_SUCCESS")) {
			updateModelWithDplmUrl(model, json, dataObject);
			model.setMetadata(json.toString());
			save(model);
		}
		String err = getValueFromJson(dataObject, "errorMsg");
		return new String[] { status, err };
	}

	/**
	 * Call bootstrap.
	 *
	 * @param pipelineModel the pipeline model
	 * @param modelServer   the model server
	 * @param marker the marker
	 * @throws Exception the exception
	 */
	@Override
	public void callBootstrap(ICIPPipelineModel pipelineModel, ICIPModelServers modelServer, Marker marker)
			throws Exception {
		pipelineModel.setModelserver(modelServer.getId());
		pipelineModel = iCIPPipelineModelRepository.save(pipelineModel);
		Path bootstrapTimePath = Paths.get(folderPath, PipelineExposeConstants.BOOTSTRAPCALL,
				pipelineModel.getFileid());
		Files.createDirectories(bootstrapTimePath.getParent());
		String currentTime = Timestamp.from(Instant.now()).toString();
		Files.write(bootstrapTimePath, currentTime.getBytes());
		String url = String.format("%s%s", modelServer.getUrl(),
				"/bootstrap/" + pipelineModel.getFileid() + "/" + pipelineModel.getId());
		ModelBootstrapEvent modelBootstrapEvent = new ModelBootstrapEvent(this, url, marker);
		modelBootstrapService.getApplicationEventPublisher().publishEvent(modelBootstrapEvent);
	}

	/**
	 * Check bootstrap.
	 *
	 * @param pipelineModel the pipeline model
	 * @return the string
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException   the execution exception
	 * @throws UnknownHostException the unknown host exception
	 * @throws TimeoutException     the timeout exception
	 */
	@Override
	public String checkBootstrap(ICIPPipelineModel pipelineModel)
			throws InterruptedException, ExecutionException, UnknownHostException, TimeoutException {
		ICIPModelServers modelServer = modelServerService.findById(pipelineModel.getModelserver());
		String url = String.format("%s%s%s%s%d", modelServer.getUrl(), "/bootstrap/ack/", pipelineModel.getFileid(),
				"/", pipelineModel.getId());
		ResponseEntity<String> results = restTemplate.getForEntity(url, String.class);
		CompletableFuture<String> completeFuture = CompletableFuture.completedFuture(results.getBody());
		return completeFuture.get(1, TimeUnit.MINUTES);
	}

	/**
	 * Run pipeline model.
	 *
	 * @param fileid the fileid
	 * @param params the params
	 * @return the string
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException   the execution exception
	 * @throws UnknownHostException the unknown host exception
	 * @throws TimeoutException     the timeout exception
	 */
	@Override
	public String runPipelineModel(String fileid, String params)
			throws InterruptedException, ExecutionException, UnknownHostException, TimeoutException {
		ICIPPipelineModel pipelineModel = iCIPPipelineModelRepository.findByFileid(fileid);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HashMap<String, Object> map = new LinkedHashMap<>();
		map.put("params", params);
		map.put("fileId", fileid);
		map.put("modelId", String.valueOf(pipelineModel.getId()));
		HttpEntity<HashMap<String, Object>> request = new HttpEntity<>(map, headers);
		ICIPModelServers modelServer = modelServerService.findById(pipelineModel.getModelserver());
		ResponseEntity<String> results = restTemplate
				.postForEntity(String.format("%s%s", modelServer.getUrl(), "/execute"), request, String.class);
		CompletableFuture<String> completableResult = CompletableFuture.completedFuture(results.getBody());
		return completableResult.get(5, TimeUnit.MINUTES);
	}

	/**
	 * Run pipeline as model.
	 *
	 * @param org    the org
	 * @param params the params
	 * @param name   the name
	 * @return the string
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	public String runPipelineAsModel(String org, String params, String name) throws IOException {
		PipelineEvent event = new PipelineEvent(this, name, org, params, true, ICIPNativeServiceJob.class,
				ICIPUtils.generateCorrelationId(), ICIPUtils.getUser(claim),"");
		eventPublisher.getApplicationEventPublisher().publishEvent(event);
		String alteredId = removeSpecialCharacter(event.getRestNodeId());
		Path path = Paths.get(folderPath, PipelineExposeConstants.CORRELATIONFILEDIRECTORY,
				alteredId + PipelineExposeConstants.CORRELATIONOUTEXTENSION);
		try (BufferedReader reader = Files.newBufferedReader(path)) {
			return reader.readLine();
		}
	}

	/**
	 * Find by status.
	 *
	 * @param status the status
	 * @return the list
	 */
	@Override
	public List<ICIPPipelineModel> findByStatus(Integer status) {
		return iCIPPipelineModelRepository.findByStatus(status);
	}

	/**
	 * Find by status and org.
	 *
	 * @param status the status
	 * @param org the org
	 * @return the list
	 */
	@Override
	public List<ICIPPipelineModel> findByStatusAndOrg(Integer status, String org) {
		return iCIPPipelineModelRepository.findByStatusAndOrganization(status, org);
	}

	/**
	 * Find running or failed uploads.
	 *
	 * @param org the org
	 * @return the list
	 */
	@Override
	public List<ICIPPipelineModel> findRunningOrFailedUploads(String org) {
		return iCIPPipelineModelRepository.findRunningOrFailedUploads(org);
	}

	/**
	 * Find by status and model server.
	 *
	 * @param status      the status
	 * @param modelserver the modelserver
	 * @return the list
	 */
	@Override
	public List<ICIPPipelineModel> findByStatusAndModelServer(Integer status, Integer modelserver) {
		return iCIPPipelineModelRepository.findByStatusAndModelserver(status, modelserver);
	}

	/**
	 * Find by model server.
	 *
	 * @param modelserver the modelserver
	 * @return the list
	 */
	@Override
	public List<ICIPPipelineModel> findByModelServer(Integer modelserver) {
		return iCIPPipelineModelRepository.findByModelserver(modelserver);
	}

	/**
	 * Find by file id.
	 *
	 * @param fileid the fileid
	 * @return the ICIP pipeline model
	 */
	@Override
	public ICIPPipelineModel findByFileId(String fileid) {
		return iCIPPipelineModelRepository.findByFileid(fileid);
	}

	/**
	 * Call fail check.
	 *
	 * @param pipelineModel the pipeline model
	 * @param marker the marker
	 * @return the ICIP pipeline model
	 * @throws Exception the exception
	 */
	@Override
	public ICIPPipelineModel callFailCheck(ICIPPipelineModel pipelineModel, Marker marker) throws Exception {
		String fileid = pipelineModel.getFileid();
		boolean isRunning = fileServerService.lastCall(fileid, pipelineModel.getOrganization());
		if (!isRunning && pipelineModel.getLocalupload() < 100) {
			pipelineModel.setModelserver(null);
			pipelineModel.setStatus(0);
			pipelineModel.setError(1);
			pipelineModel = iCIPPipelineModelRepository.save(pipelineModel);
			joblog.error(marker, "Upload Failed : {}", pipelineModel.getModelname());
		}
		return pipelineModel;
	}

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	@Override
	public List<NameAndAliasDTO> getNameAndAlias(String group, String org) {
		return iCIPPipelineModelRepository.getNameAndAlias(group, org);
	}

	@Override
	public List<ICIPPipelineModel> getPipelineModelsByOrg(String org) {
		// TODO Auto-generated method stub
		return iCIPPipelineModelRepository.getPipelineModelsByOrganization(org);
	}

}
